import * as lark from '@larksuiteoapi/node-sdk'

const client = new lark.Client({
  appId: process.env.LARK_APP_ID || '',
  appSecret: process.env.LARK_APP_SECRET || '',
})

const BASE_ID = process.env.LARK_BASE_ID || ''
const TABLE_RESERVATIONS = process.env.LARK_TABLE_RESERVATIONS || ''

export interface Reservation {
  reservationId: string
  guestName: string
  email: string
  checkInDate: string
  checkOutDate: string
  numberOfNights: number
  numberOfGuests: number
  totalAmount: number
  paymentStatus: 'Pending' | 'Paid' | 'Failed'
  squareTransactionId: string
  status: 'Confirmed' | 'Cancelled'
}

export async function getBookedDates(): Promise<string[]> {
  if (!BASE_ID || !TABLE_RESERVATIONS) {
    console.error('Lark Base ID or Table ID not configured')
    return []
  }

  try {
    const response = await client.bitable.appTableRecord.list({
      app_token: BASE_ID,
      table_id: TABLE_RESERVATIONS,
      filter: 'AND(CurrentValue.[Status]="Confirmed")', // Filter for confirmed reservations
      field_names: '["Check-in Date", "Check-out Date"]',
      automatic_fields: true
    })

    if (response.code !== 0) {
      console.error('Lark API Error:', response.msg)
      return []
    }

    const bookedDates: Set<string> = new Set()

    response.data?.items?.forEach((item) => {
      const fields = item.fields as any
      // Lark returns dates as timestamps (milliseconds) for Date fields
      const checkIn = new Date(fields['Check-in Date'])
      const checkOut = new Date(fields['Check-out Date'])

      // Iterate from check-in to check-out (exclusive of check-out for nightly booking)
      const current = new Date(checkIn)
      while (current < checkOut) {
        bookedDates.add(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
    })

    return Array.from(bookedDates)
  } catch (error) {
    console.error('Failed to fetch booked dates:', error)
    return []
  }
}

export async function createReservation(reservation: Reservation): Promise<boolean> {
  if (!BASE_ID || !TABLE_RESERVATIONS) {
    console.error('Lark Base ID or Table ID not configured')
    return false
  }

  try {
    const response = await client.bitable.appTableRecord.create({
      app_token: BASE_ID,
      table_id: TABLE_RESERVATIONS,
      data: {
        fields: {
          'Reservation ID': reservation.reservationId,
          'Guest Name': reservation.guestName,
          'Email': reservation.email,
          'Check-in Date': new Date(reservation.checkInDate).getTime(),
          'Check-out Date': new Date(reservation.checkOutDate).getTime(),
          'Number of Nights': reservation.numberOfNights,
          'Number of Guests': reservation.numberOfGuests,
          'Total Amount': reservation.totalAmount,
          'Payment Status': reservation.paymentStatus,
          'Square Transaction ID': reservation.squareTransactionId,
          'Status': reservation.status,
        },
      },
    })

    if (response.code !== 0) {
      console.error('Lark API Error:', response.msg)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to create reservation:', error)
    return false
  }
}
