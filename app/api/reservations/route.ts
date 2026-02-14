// 【ファイル概要】
// 予約に関するAPIエンドポイント（サーバーサイド）です。
// POST: 料金をサーバー側で再計算（特別料金加味）し、Larkへ送信します。

import { NextRequest, NextResponse } from 'next/server'
import { createReservation, getReservations, getBookedDatesInRange, getSpecialRates } from '@/lib/lark'
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
      if (!startDate || !endDate) return NextResponse.json({ error: 'Missing dates' }, { status: 400 })
      
      const bookedDates = await getBookedDatesInRange(startDate, endDate)
      return NextResponse.json({ bookedDates })
    }
    
    const reservations = await getReservations({ status: 'Confirmed' })
    return NextResponse.json({ reservations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      guestName, email, checkInDate, checkOutDate, numberOfGuests,
      paymentStatus = 'Pending', paymentTransactionId, paymentUrl, paymentMethod = 'AirPAY'
    } = body

    if (!guestName || !email || !checkInDate || !checkOutDate || !numberOfGuests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const validation = validateBookingNights(checkIn, checkOut)

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    const specialRates = await getSpecialRates()
    const pricing = calculatePrice(checkIn, checkOut, Number(numberOfGuests), specialRates)

    if (pricing.totalAmount <= 0) {
       return NextResponse.json({ error: 'Price calculation error' }, { status: 400 })
    }

    const reservation = await createReservation({
      guestName,
      email,
      checkInDate,
      checkOutDate,
      numberOfNights: pricing.numberOfNights,
      numberOfGuests: Number(numberOfGuests),
      totalAmount: pricing.totalAmount, 
      paymentStatus,
      paymentTransactionId,
      paymentUrl,
      paymentMethod,
      status: 'Confirmed', 
    })

    return NextResponse.json({ reservation, pricing })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}
