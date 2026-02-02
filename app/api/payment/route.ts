import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createReservation } from '@/lib/lark'
import { calculatePrice } from '@/lib/booking/pricing'
import { calculateNights } from '@/lib/booking/restrictions'

export const runtime = 'edge';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN
// Use sandbox URL by default unless prod environment variable is set explicitly to 'production'
// or if we detect we are in a prod build, but Square usually has separate tokens.
// A common pattern is to let the token decide or env var.
// Square Sandbox tokens start with EAAAE...
const isSandbox = process.env.NODE_ENV !== 'production'
const SQUARE_API_URL = isSandbox
  ? 'https://connect.squareupsandbox.com/v2/payments'
  : 'https://connect.squareup.com/v2/payments'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sourceId, guestName, email, checkInDate, checkOutDate, numberOfGuests } = body

    // Validate inputs
    if (!sourceId || !guestName || !email || !checkInDate || !checkOutDate || !numberOfGuests) {
       return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Calculate and Verify Price
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    const nights = calculateNights(start, end)

    if (nights <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid dates' }, { status: 400 })
    }

    const pricing = calculatePrice(nights, numberOfGuests)
    // Square expects integer for amount. JPY has no decimals.
    const amount = Math.round(pricing.totalAmount)

    // 2. Create Payment with Square via Fetch
    if (!SQUARE_ACCESS_TOKEN) {
        console.error('Square access token is missing')
        return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const paymentRes = await fetch(SQUARE_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-05-15', // Use a recent version
        },
        body: JSON.stringify({
            source_id: sourceId,
            idempotency_key: uuidv4(),
            amount_money: {
                amount: amount,
                currency: 'JPY',
            },
            autocomplete: true,
            note: `Reservation for ${guestName} (${checkInDate} - ${checkOutDate})`,
        })
    })

    const paymentData = await paymentRes.json()

    if (!paymentRes.ok) {
        console.error('Square Payment Error:', paymentData)
        const detail = paymentData.errors ? paymentData.errors[0].detail : 'Payment failed'
        return NextResponse.json({ success: false, error: detail }, { status: 400 })
    }

    const payment = paymentData.payment

    if (!payment || payment.status !== 'COMPLETED') {
       return NextResponse.json({ success: false, error: 'Payment failed or not completed' }, { status: 400 })
    }

    // 3. Create Reservation in Lark
    const reservationId = `RES-${Date.now()}`

    const success = await createReservation({
      reservationId,
      guestName,
      email,
      checkInDate,
      checkOutDate,
      numberOfNights: nights,
      numberOfGuests,
      totalAmount: pricing.totalAmount,
      paymentStatus: 'Paid',
      squareTransactionId: payment.id || '',
      status: 'Confirmed',
    })

    if (!success) {
      console.error('Failed to create reservation in Lark for payment:', payment.id)
      return NextResponse.json({ success: false, error: 'Payment successful but reservation failed. Please contact support.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payment: { transactionId: payment.id }
    })

  } catch (error: any) {
    console.error('Payment processing error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
