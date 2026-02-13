// Lark (Bitable) API Client
// Environment variables required:
// - LARK_APP_ID
// - LARK_APP_SECRET
// - LARK_BASE_ID
// - LARK_ROOMS_TABLE_ID
// - LARK_RESERVATIONS_TABLE_ID

interface LarkTokenResponse {
  code: number
  msg: string
  tenant_access_token: string
  expire: number
}

interface LarkRecord {
  record_id: string
  fields: Record<string, unknown>
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

let cachedToken: { token: string; expiresAt: number } | null = null

async function getTenantAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const response = await fetch('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET,
    }),
  })

  const data: LarkTokenResponse = await response.json()

  if (data.code !== 0) {
    throw new Error(`Failed to get Lark access token: ${data.msg}`)
  }

  // Cache the token with some buffer time (subtract 5 minutes)
  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire - 300) * 1000,
  }

  return data.tenant_access_token
}

export interface Room {
  id: string
  name: string
  capacity: number
  basePrice: number
  images: string[]
}

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
  paymentStatus: 'Pending' | 'Paid' | 'Failed'
  // Changed from squareTransactionId to generic paymentTransactionId
  paymentTransactionId?: string
  paymentUrl?: string // Added for AirPAY payment link
  paymentMethod?: string // Added for tracking payment method
  status: 'Confirmed' | 'Cancelled'
}

export async function getRooms(): Promise<Room[]> {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_ROOMS_TABLE_ID

  const response = await fetch(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data: LarkListResponse = await response.json()

  if (data.code !== 0) {
    throw new Error(`Failed to fetch rooms: ${data.msg}`)
  }

  return data.data.items.map((item) => ({
    id: item.record_id,
    name: item.fields['Room Name'] as string,
    capacity: item.fields['Capacity'] as number,
    basePrice: item.fields['Base Price'] as number,
    images: Array.isArray(item.fields['Images'])
      ? (item.fields['Images'] as Array<{ url?: string; text?: string }>).map((img) => img.url || img.text || '')
      : [],
  }))
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

  // Build filter string if provided
  if (filters) {
    const filterConditions: string[] = []

    if (filters.checkInFrom) {
      filterConditions.push(`CurrentValue.[Check-in Date]>="${filters.checkInFrom}"`)
    }
    if (filters.checkInTo) {
      filterConditions.push(`CurrentValue.[Check-in Date]<="${filters.checkInTo}"`)
    }
    if (filters.status) {
      filterConditions.push(`CurrentValue.[Status]="${filters.status}"`)
    }

    if (filterConditions.length > 0) {
      url += `?filter=${encodeURIComponent(filterConditions.join(' && '))}`
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data: LarkListResponse = await response.json()

  if (data.code !== 0) {
    throw new Error(`Failed to fetch reservations: ${data.msg}`)
  }

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
    paymentStatus: item.fields['Payment Status'] as 'Pending' | 'Paid' | 'Failed',
    // Updated field mapping
    paymentTransactionId: item.fields['Payment Transaction ID'] as string | undefined,
    paymentUrl: (item.fields['Payment URL'] as { link: string })?.link || (item.fields['Payment URL'] as string) || undefined,
    paymentMethod: item.fields['Payment Method'] as string | undefined,
    status: item.fields['Status'] as 'Confirmed' | 'Cancelled',
  }))
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
  // Changed to generic payment fields
  paymentTransactionId?: string
  paymentUrl?: string
  paymentMethod?: string
  status: 'Confirmed' | 'Cancelled'
}

export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID

  // Generate a unique reservation ID
  const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

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
          // Updated field names to match new schema
          'Payment Transaction ID': input.paymentTransactionId || '',
          'Payment URL': input.paymentUrl ? { link: input.paymentUrl, text: input.paymentUrl } : null,
          'Payment Method': input.paymentMethod || 'AirPAY',
          'Status': input.status,
        },
      }),
    }
  )

  const data: LarkCreateResponse = await response.json()

  if (data.code !== 0) {
    throw new Error(`Failed to create reservation: ${data.msg}`)
  }

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

export async function updateReservation(
  recordId: string,
  updates: Partial<CreateReservationInput>
): Promise<void> {
  const token = await getTenantAccessToken()
  const baseId = process.env.LARK_BASE_ID
  const tableId = process.env.LARK_RESERVATIONS_TABLE_ID

  const fields: Record<string, unknown> = {}

  if (updates.guestName !== undefined) fields['Guest Name'] = updates.guestName
  if (updates.email !== undefined) fields['Email'] = updates.email
  if (updates.checkInDate !== undefined) fields['Check-in Date'] = new Date(updates.checkInDate).getTime()
  if (updates.checkOutDate !== undefined) fields['Check-out Date'] = new Date(updates.checkOutDate).getTime()
  if (updates.numberOfNights !== undefined) fields['Number of Nights'] = updates.numberOfNights
  if (updates.numberOfGuests !== undefined) fields['Number of Guests'] = updates.numberOfGuests
  if (updates.totalAmount !== undefined) fields['Total Amount'] = updates.totalAmount
  if (updates.paymentStatus !== undefined) fields['Payment Status'] = updates.paymentStatus
  
  // Updated field mappings
  if (updates.paymentTransactionId !== undefined) fields['Payment Transaction ID'] = updates.paymentTransactionId
  if (updates.paymentUrl !== undefined) fields['Payment URL'] = { link: updates.paymentUrl, text: updates.paymentUrl }
  if (updates.paymentMethod !== undefined) fields['Payment Method'] = updates.paymentMethod
  
  if (updates.status !== undefined) fields['Status'] = updates.status

  const response = await fetch(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records/${recordId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  )

  const data = await response.json()

  if (data.code !== 0) {
    throw new Error(`Failed to update reservation: ${data.msg}`)
  }
}

// Get booked dates in a specific range for admin/calendar view (returns objects)
export async function getBookedDatesInRange(
  startDate: string,
  endDate: string
): Promise<{ date: string; isBooked: boolean }[]> {
  const reservations = await getReservations({
    checkInFrom: startDate,
    checkInTo: endDate,
    status: 'Confirmed',
  })

  const bookedDates = new Set<string>()

  reservations.forEach((reservation) => {
    // Lark returns timestamps or strings. Safely parse.
    const checkIn = new Date(Number(reservation.checkInDate) || reservation.checkInDate)
    const checkOut = new Date(Number(reservation.checkOutDate) || reservation.checkOutDate)

    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      bookedDates.add(d.toISOString().split('T')[0])
    }
  })

  const result: { date: string; isBooked: boolean }[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      isBooked: bookedDates.has(dateStr),
    })
  }

  return result
}

// Get ALL future booked dates (returns strings)
export async function getBookedDates(): Promise<string[]> {
  const today = new Date().toISOString().split('T')[0]
  const reservations = await getReservations({
    checkInFrom: today,
    status: 'Confirmed',
  })

  const bookedDates = new Set<string>()

  reservations.forEach((reservation) => {
    const checkIn = new Date(Number(reservation.checkInDate) || reservation.checkInDate)
    const checkOut = new Date(Number(reservation.checkOutDate) || reservation.checkOutDate)

    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      bookedDates.add(d.toISOString().split('T')[0])
    }
  })

  return Array.from(bookedDates)
}
