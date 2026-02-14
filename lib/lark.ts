// 【ファイル概要】
// Lark Base (多維表格) との通信を行う主要ファイルです。
// 予約データの取得、作成、更新に加え、「特別料金テーブル（Special Rates）」の取得を行います。


// Environment variables required:
// - LARK_APP_ID
// - LARK_APP_SECRET
// - LARK_BASE_ID
// - LARK_RESERVATIONS_TABLE_ID
// - LARK_SPECIAL_RATES_TABLE_ID

interface LarkTokenResponse {
  code: number
  msg: string
  tenant_access_token: string
  expire: number
}

interface LarkListResponse {
  code: number
  msg: string
  data: {
    has_more: boolean
    page_token?: string
    items: LarkRecord[]
    total: number
  }
}

interface LarkCreateResponse {
  code: number
  msg: string
  data: {
    record: LarkRecord
  }
}

interface LarkRecord {
  record_id: string
  fields: Record<string, unknown>
}

let cachedToken: { token: string; expiresAt: number } | null = null

// トークン取得処理
async function getTenantAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const response = await fetch('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET,
    }),
  })

  const data: LarkTokenResponse = await response.json()
  if (data.code !== 0) {
    console.error('Lark Token Error:', data)
    throw new Error(`Failed to get Lark access token: ${data.msg}`)
  }

  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire - 300) * 1000,
  }
  return data.tenant_access_token
}

// --- 特別料金 (Special Rates) の取得 ---

export interface SpecialRate {
  id: string
  name: string
  startDate: string
  endDate: string
  pricePerNight: number
  priority: number
}

export async function getSpecialRates(): Promise<SpecialRate[]> {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_SPECIAL_RATES_TABLE_ID

  // 特別料金テーブルが未設定の場合は空配列を返してエラーを防ぐ
  if (!tableId) return []

  // 今日以降のデータを取得するためのフィルタリング準備
  const today = new Date().toISOString().split('T')[0]
  const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 } // 1分ごとにキャッシュ更新
    })

    const data: LarkListResponse = await response.json()
    
    if (data.code !== 0) {
      console.warn(`Failed to fetch special rates: ${data.msg}`)
      return []
    }

    // データ変換とフィルタリング
    return data.data.items
      .map((item) => {
        // フィールド値の型安全な取り出し
        const endVal = item.fields['End Date']
        const startVal = item.fields['Start Date']
        
        const endDateStr = typeof endVal === 'number' 
          ? new Date(endVal).toISOString().split('T')[0] 
          : String(endVal || '')

        const startDateStr = typeof startVal === 'number' 
          ? new Date(startVal).toISOString().split('T')[0] 
          : String(startVal || '')

        return {
          id: item.record_id,
          name: (item.fields['Name'] as string) || '',
          startDate: startDateStr,
          endDate: endDateStr,
          pricePerNight: Number(item.fields['Price per Night']) || 0,
          priority: Number(item.fields['Priority']) || 0,
        }
      })
      // 過去の特別料金を除外（endDateが今日より前のものは除外）
      .filter(rate => rate.endDate >= today)
  } catch (error) {
    console.error('Error in getSpecialRates:', error)
    return []
  }
}

// --- 予約管理機能 ---

export interface Reservation {
  id: string
  reservationId: string
  guestName: string
  email: string
  checkInDate: string
  checkOutDate: string
  numberOfNights: number
  numberOfGuests: number
  totalAmount: number
  paymentStatus: string
  paymentTransactionId?: string
  paymentUrl?: string
  paymentMethod?: string
  status: 'Confirmed' | 'Cancelled'
}

export interface CreateReservationInput {
  guestName: string
  email: string
  checkInDate: string
  checkOutDate: string
  numberOfNights: number
  numberOfGuests: number
  totalAmount: number
  paymentStatus: 'Pending' | 'Paid' | 'Failed'
  paymentTransactionId?: string
  paymentUrl?: string
  paymentMethod?: string
  status: 'Confirmed' | 'Cancelled'
}

export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID
  const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  // Larkへの保存
  const response = await fetch(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Reservation ID': reservationId,
          'Guest Name': input.guestName,
          'Email': input.email,
          'Check-in Date': new Date(input.checkInDate).getTime(),
          'Check-out Date': new Date(input.checkOutDate).getTime(),
          'Number of Nights': input.numberOfNights,
          'Number of Guests': input.numberOfGuests,
          'Total Amount': input.totalAmount,
          'Payment Status': input.paymentStatus,
          'Payment Transaction ID': input.paymentTransactionId || '',
          'Payment URL': input.paymentUrl ? { link: input.paymentUrl, text: input.paymentUrl } : null,
          'Payment Method': input.paymentMethod || 'AirPAY',
          'Status': input.status,
        },
      }),
    }
  )
  
  const data: LarkCreateResponse = await response.json()
  if (data.code !== 0) throw new Error(`Create Error: ${data.msg}`)

  return {
    id: data.data.record.record_id,
    reservationId,
    guestName: input.guestName,
    email: input.email,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    numberOfNights: input.numberOfNights,
    numberOfGuests: input.numberOfGuests,
    totalAmount: input.totalAmount,
    paymentStatus: input.paymentStatus,
    paymentTransactionId: input.paymentTransactionId,
    paymentUrl: input.paymentUrl,
    paymentMethod: input.paymentMethod,
    status: input.status,
  }
}

export async function getReservations(filters?: {
  checkInFrom?: string
  checkInTo?: string
  status?: 'Confirmed' | 'Cancelled'
}): Promise<Reservation[]> {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID
  
  let url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
  
  if (filters) {
    const conditions = []
    if (filters.checkInFrom) conditions.push(`CurrentValue.[Check-in Date]>="${filters.checkInFrom}"`)
    if (filters.checkInTo) conditions.push(`CurrentValue.[Check-in Date]<="${filters.checkInTo}"`)
    if (filters.status) conditions.push(`CurrentValue.[Status]="${filters.status}"`)
    
    if (conditions.length > 0) {
      url += `?filter=${encodeURIComponent(conditions.join(' && '))}`
    }
  }

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data: LarkListResponse = await response.json()
  
  if (data.code !== 0 || !data.data?.items) return []

  return data.data.items.map((item) => ({
    id: item.record_id,
    reservationId: item.fields['Reservation ID'] as string,
    guestName: item.fields['Guest Name'] as string,
    email: item.fields['Email'] as string,
    checkInDate: String(item.fields['Check-in Date']), 
    checkOutDate: String(item.fields['Check-out Date']),
    numberOfNights: item.fields['Number of Nights'] as number,
    numberOfGuests: item.fields['Number of Guests'] as number,
    totalAmount: item.fields['Total Amount'] as number,
    paymentStatus: item.fields['Payment Status'] as string,
    paymentTransactionId: item.fields['Payment Transaction ID'] as string,
    paymentUrl: (item.fields['Payment URL'] as any)?.link || (item.fields['Payment URL'] as string),
    paymentMethod: item.fields['Payment Method'] as string,
    status: item.fields['Status'] as 'Confirmed' | 'Cancelled',
  }))
}

export async function getBookedDatesInRange(start: string, end: string) {
  const reservations = await getReservations({ status: 'Confirmed' })
  const bookedSet = new Set<string>()
  
  reservations.forEach((res) => {
    const checkInVal = res.checkInDate
    const checkOutVal = res.checkOutDate
    
    const s = !isNaN(Number(checkInVal)) ? new Date(Number(checkInVal)) : new Date(checkInVal)
    const e = !isNaN(Number(checkOutVal)) ? new Date(Number(checkOutVal)) : new Date(checkOutVal)

    for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
      bookedSet.add(d.toISOString().split('T')[0])
    }
  })

  const dates = []
  const sDate = new Date(start)
  const eDate = new Date(end)
  for (let d = sDate; d <= eDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dates.push({ date: dateStr, isBooked: bookedSet.has(dateStr) })
  }
  return dates
}

export async function getRooms() {
  return [{
    id: 'default-room',
    name: 'Luxury Ocean Villa',
    capacity: 6,
    basePrice: 25000,
    images: ['/placeholder.jpg', '/placeholder-user.jpg']
  }]
}
