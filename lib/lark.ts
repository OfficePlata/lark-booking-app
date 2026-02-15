// 【ファイル概要】
// Lark Base (多維表格) との通信を行う主要ファイルです。
// 予約データの取得・作成、特別料金の取得を行います。

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
    items: LarkRecord[]
    total: number
  }
}

interface LarkRecord {
  record_id: string
  fields: Record<string, unknown>
}

let cachedToken: { token: string; expiresAt: number } | null = null

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
    } ),
  })

  const data: LarkTokenResponse = await response.json()
  if (data.code !== 0) throw new Error(`Lark Token Error: ${data.msg}`)

  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire - 300) * 1000,
  }
  return data.tenant_access_token
}

// --- 特別料金 (Special Rates) ---

export interface SpecialRate {
  id: string
  name: string
  startDate: string
  endDate: string
  pricePerNight: number
  priority: number
}

export async function getSpecialRates(): Promise<SpecialRate[]> {
  try {
    const token = await getTenantAccessToken()
    const baseId = process.env.LARK_BASE_ID
    const tableId = process.env.LARK_SPECIAL_RATES_TABLE_ID

    if (!tableId) return []

    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 }
    } )

    const data: LarkListResponse = await response.json()
    if (data.code !== 0) return []

    return data.data.items.map((item) => {
      const toDateStr = (val: unknown) => {
        if (typeof val === 'number') return new Date(val).toISOString().split('T')[0]
        if (typeof val === 'string') return val.split('T')[0]
        return ''
      }

      return {
        id: item.record_id,
        name: String(item.fields['Name'] || ''),
        startDate: toDateStr(item.fields['Start Date']),
        endDate: toDateStr(item.fields['End Date']),
        pricePerNight: Number(item.fields['Price per Night']) || 0,
        priority: Number(item.fields['Priority']) || 0,
      }
    }).filter(r => r.startDate && r.endDate)
  } catch (error) {
    console.error('getSpecialRates Error:', error)
    return []
  }
}

// --- 予約管理 ---

export interface CreateReservationInput {
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

export async function createReservation(input: CreateReservationInput) {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID
  const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

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
          reservationId: reservationId,
          guestName: input.guestName,
          email: input.email,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          numberOfNights: input.numberOfNights,
          numberOfGuests: input.numberOfGuests,
          totalAmount: input.totalAmount,
          paymentStatus: input.paymentStatus,
          ...(input.paymentTransactionId && { paymentTransactionId: input.paymentTransactionId } ),
          ...(input.paymentUrl && { paymentUrl: input.paymentUrl }),
          paymentMethod: input.paymentMethod || 'AirPAY',
          status: input.status,
        },
      }),
    }
  )
  
  const data = await response.json()
  if (data.code !== 0) throw new Error(`Create Error: ${data.msg}`)

  return { ...input, id: data.data.record.record_id, reservationId }
}

export async function getReservations(filters?: { status?: string }) {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID
  
  let url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
  if (filters?.status ) {
    url += `?filter=CurrentValue.[Status]="${filters.status}"`
  }

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data: LarkListResponse = await response.json()
  
  if (data.code !== 0 || !data.data?.items) return []

  return data.data.items.map((item) => ({
    id: item.record_id,
    reservationId: String(item.fields['reservationId'] || ''),
    guestName: String(item.fields['guestName'] || ''),
    checkInDate: typeof item.fields['checkInDate'] === 'number' 
      ? new Date(item.fields['checkInDate']).toISOString().split('T')[0] 
      : String(item.fields['checkInDate']),
    checkOutDate: typeof item.fields['checkOutDate'] === 'number'
      ? new Date(item.fields['checkOutDate']).toISOString().split('T')[0]
      : String(item.fields['checkOutDate']),
    status: item.fields['status'] as string,
  }))
}

export async function getBookedDatesInRange(start: string, end: string) {
  const reservations = await getReservations({ status: 'Confirmed' })
  const bookedSet = new Set<string>()
  
  reservations.forEach((res) => {
    const s = new Date(res.checkInDate)
    const e = new Date(res.checkOutDate)
    for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
      bookedSet.add(d.toISOString().split('T')[0])
    }
  })

  const dates = []
  const sDate = new Date(start)
  const eDate = new Date(end)
  for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dates.push({ date: dateStr, isBooked: bookedSet.has(dateStr) })
  }
  return dates
}

// 【追加】ビルドエラー修正のための関数
export async function getBookedDates(): Promise<string[]> {
  const today = new Date().toISOString().split('T')[0]
  // 簡易的に今日から3年後までの予約済み日付リストを返す
  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 3)
  const endDate = futureDate.toISOString().split('T')[0]

  const range = await getBookedDatesInRange(today, endDate)
  return range.filter(d => d.isBooked).map(d => d.date)
}
