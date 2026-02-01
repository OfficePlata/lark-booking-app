import { NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'
import { v4 as uuidv4 } from 'uuid'
import { createReservation } from '@/lib/lark'
import { calculatePrice } from '@/lib/booking/pricing'
import { calculateNights } from '@/lib/booking/restrictions'

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
})

// Helper to handle BigInt serialization if needed
// (though we aren't returning BigInts in JSON here, it's good practice to be aware)
// BigInt.prototype.toJSON = function() { return this.toString() }

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
    // Square expects amount in BigInt. For JPY, it's just the amount.
    const amountMoney = BigInt(Math.round(pricing.totalAmount))

    // 2. Create Payment with Square
    const paymentResponse = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: uuidv4(),
      amountMoney: {
        amount: amountMoney,
        currency: 'JPY',
      },
      autocomplete: true, // Complete the payment immediately
      note: `Reservation for ${guestName} (${checkInDate} - ${checkOutDate})`,
    })

    const payment = paymentResponse.result.payment

    if (!payment || payment.status !== 'COMPLETED') {
       return NextResponse.json({ success: false, error: 'Payment failed' }, { status: 400 })
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
    // Handle specific Square errors if possible
    if (error.result && error.result.errors) {
        // We take the first error message
        const detail = error.result.errors[0].detail
        return NextResponse.json({ success: false, error: detail }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
