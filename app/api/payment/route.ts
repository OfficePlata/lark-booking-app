import { NextRequest, NextResponse } from 'next/server'
import { generateIdempotencyKey } from '@/lib/square/client'
import { createReservation } from '@/lib/lark/client'
import { calculatePrice } from '@/lib/booking/pricing'
import { validateBookingNights } from '@/lib/booking/restrictions'

interface SquarePaymentResponse {
  payment?: {
    id: string
    status: string
    amount_money: {
      amount: number
      currency: string
    }
  }
  errors?: Array<{
    code: string
    detail: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sourceId, // Payment token from Square Web Payments SDK
      guestName,
      email,
      checkInDate,
      checkOutDate,
      numberOfGuests,
    } = body

    // Validate required fields
    if (!sourceId || !guestName || !email || !checkInDate || !checkOutDate || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate booking
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const validation = validateBookingNights(checkIn, checkOut)

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      )
    }

    // Calculate pricing
    const pricing = calculatePrice(validation.nights, numberOfGuests)

    // Process payment with Square
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      return NextResponse.json(
        { error: 'Square payment is not configured' },
        { status: 500 }
      )
    }

    const idempotencyKey = generateIdempotencyKey()

    // Square Payments API - Production endpoint
    // For sandbox, use: https://connect.squareupsandbox.com/v2/payments
    const squareApiUrl = process.env.SQUARE_ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com/v2/payments'
      : 'https://connect.squareup.com/v2/payments'

    const paymentResponse = await fetch(squareApiUrl, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: idempotencyKey,
        amount_money: {
          amount: pricing.totalAmount, // Square expects amount in smallest currency unit (JPY is already whole numbers)
          currency: 'JPY',
        },
        location_id: squareLocationId,
        reference_id: `booking-${Date.now()}`,
        note: `Accommodation booking for ${guestName}`,
        buyer_email_address: email,
      }),
    })

    const paymentData: SquarePaymentResponse = await paymentResponse.json()

    if (paymentData.errors && paymentData.errors.length > 0) {
      console.error('Square payment error:', paymentData.errors)
      return NextResponse.json(
        { 
          error: 'Payment failed',
          details: paymentData.errors[0]?.detail || 'Unknown payment error',
        },
        { status: 400 }
      )
    }

    if (!paymentData.payment || paymentData.payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment was not completed' },
        { status: 400 }
      )
    }

    // Payment successful - create reservation in Lark
    const reservation = await createReservation({
      guestName,
      email,
      checkInDate,
      checkOutDate,
      numberOfNights: validation.nights,
      numberOfGuests,
      totalAmount: pricing.totalAmount,
      paymentStatus: 'Paid',
      squareTransactionId: paymentData.payment.id,
      status: 'Confirmed',
    })

    return NextResponse.json({
      success: true,
      reservation,
      pricing,
      payment: {
        transactionId: paymentData.payment.id,
        amount: paymentData.payment.amount_money.amount,
        currency: paymentData.payment.amount_money.currency,
      },
    })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
