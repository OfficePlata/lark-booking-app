/**
 * ========================================
 * Lark Base API 通信ライブラリ
 * ========================================
 * 
 * 【このファイルの役割】
 * - Lark Base（多維表格）との通信を行います
 * - 特別料金、決済マスタ、予約データの取得を行います
 * - 予約の作成は行いません（Lark自動化のWebhook経由で行います）
 * 
 * 【重要】
 * - createReservation()関数は削除されました
 * - 予約作成は app/api/reservations/route.ts → lib/lark-webhook.ts → Lark自動化 の流れで行います
 * - Lark自動化が自動的にRESERVATIONSテーブルにレコードを追加します
 */

// ========================================
// 型定義
// ========================================

/**
 * Lark認証トークンのレスポンス型
 */
interface LarkTokenResponse {
  code: number
  msg: string
  tenant_access_token: string
  expire: number
}

/**
 * Larkレコード一覧取得のレスポンス型
 */
interface LarkListResponse {
  code: number
  msg: string
  data: {
    items: LarkRecord[]
    total: number
  }
}

/**
 * Larkレコードの型
 */
interface LarkRecord {
  record_id: string
  fields: Record<string, unknown>
}

// ========================================
// 認証トークン管理
// ========================================

/**
 * 認証トークンのキャッシュ
 * - トークンは有効期限内であれば再利用します
 * - 有効期限が切れたら自動的に再取得します
 */
let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Lark Tenant Access Tokenを取得
 * 
 * 【処理の流れ】
 * 1. キャッシュされたトークンが有効期限内であれば、それを返す
 * 2. 有効期限が切れている場合は、Lark APIから新しいトークンを取得
 * 3. 取得したトークンをキャッシュして返す
 * 
 * @returns {Promise<string>} Lark Tenant Access Token
 * @throws {Error} トークン取得に失敗した場合
 */
async function getTenantAccessToken(): Promise<string> {
  // キャッシュされたトークンが有効期限内であれば、それを返す
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  // Lark APIから新しいトークンを取得
  const response = await fetch('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET,
    }),
  })

  const data: LarkTokenResponse = await response.json()
  
  // エラーチェック
  if (data.code !== 0) {
    throw new Error(`Lark Token Error: ${data.msg}`)
  }

  // トークンをキャッシュ（有効期限の5分前まで有効とする）
  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire - 300) * 1000,
  }
  
  return data.tenant_access_token
}

// ========================================
// 特別料金 (Special Rates)
// ========================================

/**
 * 特別料金の型定義
 * 
 * 【用途】
 * - 特定の期間に適用される特別な宿泊料金を管理します
 * - 例: ゴールデンウィーク、お盆、年末年始などの繁忙期料金
 */
export interface SpecialRate {
  id: string              // レコードID
  name: string            // 料金名（例: "ゴールデンウィーク料金"）
  startDate: string       // 適用開始日（YYYY-MM-DD形式）
  endDate: string         // 適用終了日（YYYY-MM-DD形式）
  pricePerNight: number   // 1泊あたりの料金
  priority: number        // 優先度（複数の特別料金が重なった場合、優先度が高い方を適用）
}

/**
 * 特別料金一覧を取得
 * 
 * 【処理の流れ】
 * 1. Lark認証トークンを取得
 * 2. SPECIAL_RATESテーブルから全レコードを取得
 * 3. 各レコードを SpecialRate 型に変換
 * 4. 開始日と終了日が設定されているレコードのみをフィルタリング
 * 
 * 【エラー処理】
 * - テーブルIDが設定されていない場合は空配列を返す
 * - API呼び出しに失敗した場合は空配列を返す
 * - エラーはコンソールに出力される
 * 
 * @returns {Promise<SpecialRate[]>} 特別料金の配列
 */
export async function getSpecialRates(): Promise<SpecialRate[]> {
  try {
    const token = await getTenantAccessToken()
    const baseId = process.env.LARK_BASE_ID
    const tableId = process.env.LARK_SPECIAL_RATES_TABLE_ID

    // テーブルIDが設定されていない場合は空配列を返す
    if (!tableId) return []

    // Lark APIからレコードを取得
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 } // 60秒間キャッシュ
    })

    const data: LarkListResponse = await response.json()
    
    // エラーチェック
    if (data.code !== 0) return []

    // 日付変換ヘルパー関数
    const toDateStr = (val: unknown) => {
      if (typeof val === 'number') return new Date(val).toISOString().split('T')[0]
      if (typeof val === 'string') return val.split('T')[0]
      return ''
    }

    // レコードを SpecialRate 型に変換
    return data.data.items.map((item) => ({
      id: item.record_id,
      name: String(item.fields['Name'] || ''),
      startDate: toDateStr(item.fields['Start Date']),
      endDate: toDateStr(item.fields['End Date']),
      pricePerNight: Number(item.fields['Price per Night']) || 0,
      priority: Number(item.fields['Priority']) || 0,
    })).filter(r => r.startDate && r.endDate) // 日付が設定されているもののみ
    
  } catch (error) {
    console.error('getSpecialRates Error:', error)
    return []
  }
}

// ========================================
// 決済マスタ (Payment Masters)
// ========================================

/**
 * 決済マスタの型定義
 * 
 * 【用途】
 * - 金額ごとの決済URLを管理します
 * - AirPAYなどの決済サービスのリンクを保存します
 */
export interface PaymentMaster {
  amount: number  // 決済金額
  url: string     // 決済URL
}

/**
 * 決済マスタ一覧を取得
 * 
 * 【処理の流れ】
 * 1. Lark認証トークンを取得
 * 2. PAYMENT_MASTERSテーブルから全レコードを取得
 * 3. 各レコードを PaymentMaster 型に変換
 * 4. 金額とURLが設定されているレコードのみをフィルタリング
 * 
 * 【エラー処理】
 * - テーブルIDが設定されていない場合は空配列を返す
 * - API呼び出しに失敗した場合は空配列を返す
 * - エラーはコンソールに出力される
 * 
 * @returns {Promise<PaymentMaster[]>} 決済マスタの配列
 */
export async function getPaymentMasters(): Promise<PaymentMaster[]> {
  try {
    const token = await getTenantAccessToken()
    const baseId = process.env.LARK_BASE_ID
    const tableId = process.env.LARK_PAYMENT_MASTERS_TABLE_ID

    // テーブルIDが設定されていない場合は空配列を返す
    if (!tableId) return []

    // Lark APIからレコードを取得
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 } // 60秒間キャッシュ
    })

    const data: LarkListResponse = await response.json()
    
    // エラーチェック
    if (data.code !== 0) return []

    // レコードを PaymentMaster 型に変換
    return data.data.items.map((item) => {
      const rawUrl = item.fields['Payment URL']
      let urlStr = ''
      
      // URLフィールドの型に応じて処理を分岐
      if (typeof rawUrl === 'string') {
        urlStr = rawUrl
      } else if (typeof rawUrl === 'object' && rawUrl !== null && 'link' in rawUrl) {
        urlStr = (rawUrl as { link: string }).link
      }
      
      return {
        amount: Number(item.fields['Amount']) || 0,
        url: urlStr
      }
    }).filter(p => p.amount > 0 && p.url) // 金額とURLが設定されているもののみ
    
  } catch (error) {
    console.error('getPaymentMasters Error:', error)
    return []
  }
}

// ========================================
// 予約管理
// ========================================

/**
 * 予約データ取得
 * 
 * 【処理の流れ】
 * 1. Lark認証トークンを取得
 * 2. RESERVATIONSテーブルからレコードを取得
 * 3. フィルタが指定されている場合は、そのフィルタを適用
 * 4. 各レコードを予約データ型に変換
 * 
 * 【フィルタ】
 * - status: 予約ステータスでフィルタリング（例: "Confirmed"）
 * 
 * @param {object} filters - フィルタオプション
 * @param {string} filters.status - 予約ステータス
 * @returns {Promise<Array>} 予約データの配列
 */
export async function getReservations(filters?: { status?: string }) {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID
  
  // URLを構築（フィルタがある場合は追加）
  let url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
  if (filters?.status) {
    url += `?filter=CurrentValue.[status]="${filters.status}"`
  }

  // Lark APIからレコードを取得
  const response = await fetch(url, { 
    headers: { Authorization: `Bearer ${token}` } 
  })
  const data: LarkListResponse = await response.json()
  
  // エラーチェック
  if (data.code !== 0 || !data.data?.items) return []

  // レコードを予約データ型に変換
  return data.data.items.map((item) => ({
    id: item.record_id,
    reservationId: String(item.fields['reservationId'] || ''),
    guestName: String(item.fields['guestName'] || ''),
    // 日付フィールドが数値(タイムスタンプ)か文字列かで分岐
    checkInDate: typeof item.fields['checkInDate'] === 'number' 
      ? new Date(item.fields['checkInDate']).toISOString().split('T')[0] 
      : String(item.fields['checkInDate'] || ''),
    checkOutDate: typeof item.fields['checkOutDate'] === 'number'
      ? new Date(item.fields['checkOutDate']).toISOString().split('T')[0]
      : String(item.fields['checkOutDate'] || ''),
    status: item.fields['status'] as string,
  }))
}

/**
 * オーナーが手動で設定した予約不可日を取得
 * 
 * 【処理の流れ】
 * 1. Lark認証トークンを取得
 * 2. RESERVATIONSテーブルから「予約不可日」フィールドが設定されているレコードを取得
 * 3. 日付型フィールドの値（タイムスタンプ）をYYYY-MM-DD形式に変換
 * 
 * 【予約不可日フィールドについて】
 * - フィールド名: 「予約不可日」
 * - データ型: 日付型
 * - Lark APIでは日付型はミリ秒タイムスタンプとして返される
 * - オーナーがカレンダービューから手動で追加できる
 * 
 * @returns {Promise<string[]>} 予約不可日の配列（YYYY-MM-DD形式）
 */
export async function getUnavailableDates(): Promise<string[]> {
  try {
    const token = await getTenantAccessToken()
    const baseId = process.env.LARK_BASE_ID
    const tableId = process.env.LARK_RESERVATIONS_TABLE_ID

    if (!tableId || !baseId) return []

    // RESERVATIONSテーブルから全レコードを取得
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 } // 60秒間キャッシュ
    })

    const data: LarkListResponse = await response.json()
    if (data.code !== 0 || !data.data?.items) return []

    const unavailableDates: string[] = []

    // 各レコードの「予約不可日」フィールドを確認
    data.data.items.forEach((item) => {
      const rawDate = item.fields['予約不可日']
      if (!rawDate) return

      // 日付型フィールドはミリ秒タイムスタンプとして返される
      if (typeof rawDate === 'number') {
        const dateStr = new Date(rawDate).toISOString().split('T')[0]
        unavailableDates.push(dateStr)
      } else if (typeof rawDate === 'string') {
        // 文字列の場合はそのまま使用
        unavailableDates.push(rawDate.split('T')[0])
      }
    })

    return unavailableDates
  } catch (error) {
    console.error('getUnavailableDates Error:', error)
    return []
  }
}

/**
 * 指定期間内の予約済み日付を取得
 * 
 * 【処理の流れ】
 * 1. 確定済み予約（status: "Confirmed"）を全て取得
 * 2. オーナーが手動で設定した予約不可日を取得
 * 3. 各予約のチェックイン日からチェックアウト日までの日付を列挙
 * 4. 予約不可日も予約済みとして扱う
 * 5. 指定期間内の各日付について、予約済みかどうかを判定
 * 
 * 【用途】
 * - カレンダーで予約不可日を表示するために使用
 * - 既存予約の日付範囲 + オーナー手動設定の予約不可日 の両方を反映
 * 
 * @param {string} start - 開始日（YYYY-MM-DD形式）
 * @param {string} end - 終了日（YYYY-MM-DD形式）
 * @returns {Promise<Array>} 日付ごとの予約状況の配列
 */
export async function getBookedDatesInRange(start: string, end: string) {
  // 確定済み予約とオーナー手動設定の予約不可日を並行取得
  const [reservations, unavailableDates] = await Promise.all([
    getReservations({ status: 'Confirmed' }),
    getUnavailableDates()
  ])

  const bookedSet = new Set<string>()
  
  // 1. 各予約の宿泊期間を列挙
  reservations.forEach((res) => {
    // 日付が取得できていない場合はスキップ
    if (!res.checkInDate || !res.checkOutDate) return

    const s = new Date(res.checkInDate)
    const e = new Date(res.checkOutDate)
    
    // 日付が無効な場合もスキップ
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return

    // チェックイン日からチェックアウト日の前日までを予約済みとする
    for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
      bookedSet.add(d.toISOString().split('T')[0])
    }
  })

  // 2. オーナーが手動で設定した予約不可日を追加
  unavailableDates.forEach((dateStr) => {
    bookedSet.add(dateStr)
  })

  // 指定期間内の各日付について、予約済みかどうかを判定
  const dates = []
  const sDate = new Date(start)
  const eDate = new Date(end)
  for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dates.push({ 
      date: dateStr, 
      isBooked: bookedSet.has(dateStr) 
    })
  }
  
  return dates
}

/**
 * 予約済み日付一覧を取得（今日から2年後まで）
 * 
 * 【用途】
 * - ビルド時の静的生成で使用
 * - カレンダー初期表示で使用
 * 
 * @returns {Promise<string[]>} 予約済み日付の配列（YYYY-MM-DD形式）
 */
export async function getBookedDates(): Promise<string[]> {
  const today = new Date().toISOString().split('T')[0]
  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 2)
  const endDate = futureDate.toISOString().split('T')[0]

  const range = await getBookedDatesInRange(today, endDate)
  return range.filter(d => d.isBooked).map(d => d.date)
}

/**
 * 部屋情報を取得（現在は固定値を返す）
 * 
 * 【将来の拡張】
 * - 複数の部屋を管理する場合は、Lark Baseから取得するように変更
 * 
 * @returns {Promise<Array>} 部屋情報の配列
 */
export async function getRooms() {
  return [{
    id: 'default-room',
    name: 'Luxury Ocean Villa',
    capacity: 6,
    basePrice: 18000,
    images: ['/placeholder.jpg', '/placeholder-user.jpg']
  }]
}
