// 【ファイル概要】
// 予約に関するAPIエンドポイント（サーバーサイド）です。
// GET: カレンダーの予約済み日付や予約一覧を取得します。
// POST: フロントエンドからの予約リクエストを受け取り、Larkへデータを送信します。

import { NextRequest, NextResponse } from 'next/server'
import { createReservation, getReservations, getBookedDatesInRange } from '@/lib/lark'
import { calculatePrice } from '@/lib/booking/pricing'
import { validateBookingNights } from '@/lib/booking/restrictions'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'booked-dates') {
      const startDate = searchParams.get('start')
      const endDate = searchParams.get('end')
      
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'Start and end dates are required' },
          { status: 400 }
        )
      }
      
      const bookedDates = await getBookedDatesInRange(startDate, endDate)
      return NextResponse.json({ bookedDates })
    }
    
    // Default: get all reservations
    const reservations = await getReservations({ status: 'Confirmed' })
    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      guestName,
      email,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      paymentStatus = 'Pending',
      // Changed: Receive generic payment info instead of Square ID
      paymentTransactionId,
      paymentUrl,
      paymentMethod = 'AirPAY', // Default to AirPAY as requested
    } = body

    // Validate required fields
    if (!guestName || !email || !checkInDate || !checkOutDate || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate booking nights
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

    // Create reservation in Lark
    const reservation = await createReservation({
      guestName,
      email,
      checkInDate,
      checkOutDate,
      numberOfNights: validation.nights,
      numberOfGuests,
      totalAmount: pricing.totalAmount,
      paymentStatus,
      // Map new fields
      paymentTransactionId,
      paymentUrl,
      paymentMethod,
      // If payment is pending (AirPAY link to be sent), we still confirm the booking slot
      status: 'Confirmed', 
    })

    return NextResponse.json({ 
      reservation,
      pricing,
    })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}
