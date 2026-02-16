// 【ファイル概要】
// Lark Base (多維表格) との通信を行う主要ファイルです。
// 予約データの取得、特別料金、および決済マスタの取得を行います。
// API経由で直接Larkにレコードを書き込む（元の動いていた方式）。

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
    })

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

// --- 決済マスタ (Payment Masters) ---

export interface PaymentMaster {
  amount: number
  url: string
}

export async function getPaymentMasters(): Promise<PaymentMaster[]> {
  try {
    const token = await getTenantAccessToken()
    const baseId = process.env.LARK_BASE_ID
    const tableId = process.env.LARK_PAYMENT_MASTERS_TABLE_ID

    if (!tableId) return []

    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 } 
    })

    const data: LarkListResponse = await response.json()
    if (data.code !== 0) return []

    return data.data.items.map((item) => {
      const rawUrl = item.fields['Payment URL']
      let urlStr = ''
      if (typeof rawUrl === 'string') {
        urlStr = rawUrl
      } else if (typeof rawUrl === 'object' && rawUrl !== null && 'link' in rawUrl) {
        urlStr = (rawUrl as { link: string }).link
      }
      return {
        amount: Number(item.fields['Amount']) || 0,
        url: urlStr
      }
    }).filter(p => p.amount > 0 && p.url)
  } catch (error) {
    console.error('getPaymentMasters Error:', error)
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

// ★修正: Lark APIを使ってテーブルに直接レコードを作成します (Webhook経由ではありません)
export async function createReservation(input: CreateReservationInput) {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID
  const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const recordFields = {
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
  }

  const response = await fetch(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: recordFields }),
    }
  )
  
  const data: LarkCreateResponse = await response.json()
  if (data.code !== 0) throw new Error(`Create Error: ${data.msg}`)

  return { ...input, id: data.data.record.record_id, reservationId }
}

export async function getReservations(filters?: { status?: string }) {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID
  
  let url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
  if (filters?.status) {
    url += `?filter=CurrentValue.[Status]="${filters.status}"`
  }

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data: LarkListResponse = await response.json()
  
  if (data.code !== 0 || !data.data?.items) return []

  return data.data.items.map((item) => ({
    id: item.record_id,
    reservationId: String(item.fields['Reservation ID'] || ''),
    guestName: String(item.fields['Guest Name'] || ''),
    checkInDate: typeof item.fields['Check-in Date'] === 'number' 
      ? new Date(item.fields['Check-in Date']).toISOString().split('T')[0] 
      : String(item.fields['Check-in Date']),
    checkOutDate: typeof item.fields['Check-out Date'] === 'number'
      ? new Date(item.fields['Check-out Date']).toISOString().split('T')[0]
      : String(item.fields['Check-out Date']),
    status: item.fields['Status'] as string,
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

export async function getBookedDates(): Promise<string[]> {
  const today = new Date().toISOString().split('T')[0]
  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 2)
  const endDate = futureDate.toISOString().split('T')[0]

  const range = await getBookedDatesInRange(today, endDate)
  return range.filter(d => d.isBooked).map(d => d.date)
}

export async function getRooms() {
  return [{
    id: 'default-room',
    name: 'Luxury Ocean Villa',
    capacity: 6,
    basePrice: 18000,
    images: ['/placeholder.jpg', '/placeholder-user.jpg']
  }]
}
