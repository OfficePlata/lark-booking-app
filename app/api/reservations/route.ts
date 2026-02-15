// 【ファイル概要】
// 予約に関するAPIエンドポイント（サーバーサイド）です。
// POST: 料金をサーバー側で再計算（特別料金加味）し、Larkへ送信します。

import { NextRequest, NextResponse } from 'next/server'
import { createReservation, getReservations, getBookedDatesInRange, getSpecialRates } from '@/lib/lark'
import { calculatePrice } from '@/lib/booking/pricing'
import { validateBookingNights } from '@/lib/booking/restrictions'
import { sendLarkNotification, sendLarkErrorNotification } from '@/lib/lark-webhook'

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

    // Lark Webhookに通知を送信
    try {
      await sendLarkNotification({
        guestName,
        email,
        checkInDate,
        checkOutDate,
        numberOfNights: pricing.numberOfNights,
        numberOfGuests: Number(numberOfGuests),
        totalAmount: pricing.totalAmount,
        paymentStatus,
        paymentMethod,
      })
    } catch (notificationError) {
      // 通知の失敗はログに記録するが、予約処理は継続
      console.error('Failed to send Lark notification:', notificationError)
      await sendLarkErrorNotification({
        title: 'Webhook通知エラー',
        message: '予約通知の送信に失敗しました',
        details: notificationError instanceof Error ? notificationError.message : String(notificationError),
      })
    }

    return NextResponse.json({ reservation, pricing })
  } catch (error) {
    console.error(error)
    
    // エラー通知をLarkに送信
    try {
      await sendLarkErrorNotification({
        title: '予約作成エラー',
        message: '予約の作成処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error),
      })
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError)
    }
    
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}
