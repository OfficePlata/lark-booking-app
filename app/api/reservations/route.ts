// 【ファイル概要】
// 予約に関するAPIエンドポイント（サーバーサイド）です。
// POST: 料金をサーバー側で再計算（特別料金加味）し、Larkへ送信します。

import { NextRequest, NextResponse } from 'next/server'
import { getReservations, getBookedDatesInRange, getSpecialRates } from '@/lib/lark'
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
    console.log('[Reservation API] Received POST request')
    
    const body = await request.json()
    console.log('[Reservation API] Request body:', JSON.stringify(body))
    
    const {
      guestName, email, checkInDate, checkOutDate, numberOfGuests,
      paymentStatus = 'Pending', paymentTransactionId, paymentUrl, paymentMethod = 'AirPAY'
    } = body

    if (!guestName || !email || !checkInDate || !checkOutDate || !numberOfGuests) {
      console.error('[Reservation API] Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[Reservation API] Validating booking dates')
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const validation = validateBookingNights(checkIn, checkOut)

    if (!validation.isValid) {
      console.error('[Reservation API] Validation failed:', validation.message)
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    console.log('[Reservation API] Fetching special rates')
    const specialRates = await getSpecialRates()
    console.log('[Reservation API] Special rates count:', specialRates.length)
    
    console.log('[Reservation API] Calculating price')
    const pricing = calculatePrice(checkIn, checkOut, Number(numberOfGuests), specialRates)
    console.log('[Reservation API] Pricing result:', JSON.stringify(pricing))

    if (pricing.totalAmount <= 0) {
      console.error('[Reservation API] Invalid price calculation')
      return NextResponse.json({ error: 'Price calculation error' }, { status: 400 })
    }

    // 予約IDを生成
    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    console.log('[Reservation API] Generated reservation ID:', reservationId)

    // Lark Webhookに通知を送信（Lark自動化がレコードを作成）
    const webhookUrl = process.env.LARK_WEBHOOK_URL
    
    if (webhookUrl) {
      console.log('[Reservation API] Sending Lark webhook notification')
      try {
        await sendLarkNotification(webhookUrl, {
          reservationId,
          guestName,
          email,
          checkInDate,
          checkOutDate,
          numberOfNights: pricing.numberOfNights,
          numberOfGuests: Number(numberOfGuests),
          totalAmount: pricing.totalAmount,
          paymentStatus,
          paymentMethod,
          status: 'Confirmed',
        })
        console.log('[Reservation API] Lark webhook notification sent successfully')
      } catch (notificationError) {
        // 通知の失敗はログに記録し、エラーを返す
        console.error('[Reservation API] Failed to send Lark notification:', notificationError)
        
        try {
          await sendLarkErrorNotification(
            webhookUrl,
            'Webhook通知エラー: 予約通知の送信に失敗しました',
            notificationError instanceof Error ? notificationError.message : String(notificationError)
          )
        } catch (errorNotificationError) {
          console.error('[Reservation API] Failed to send error notification:', errorNotificationError)
        }
        
        return NextResponse.json({ error: 'Failed to send reservation to Lark' }, { status: 500 })
      }
    } else {
      console.error('[Reservation API] LARK_WEBHOOK_URL is not set')
      return NextResponse.json({ error: 'Lark webhook not configured' }, { status: 500 })
    }

    console.log('[Reservation API] Reservation process completed successfully')
    return NextResponse.json({ 
      reservation: {
        id: reservationId,
        reservationId,
        guestName,
        email,
        checkInDate,
        checkOutDate,
        numberOfNights: pricing.numberOfNights,
        numberOfGuests: Number(numberOfGuests),
        totalAmount: pricing.totalAmount,
        paymentStatus,
        paymentMethod,
        status: 'Confirmed',
      }, 
      pricing 
    })
  } catch (error) {
    console.error('[Reservation API] Error:', error)
    
    // エラー通知をLarkに送信
    const webhookUrl = process.env.LARK_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await sendLarkErrorNotification(
          webhookUrl,
          '予約作成エラー: 予約の作成処理中にエラーが発生しました',
          error instanceof Error ? error.message : String(error)
        )
      } catch (notificationError) {
        console.error('[Reservation API] Failed to send error notification:', notificationError)
      }
    }
    
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}
