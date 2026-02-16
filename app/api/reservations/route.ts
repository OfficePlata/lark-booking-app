// 【ファイル概要】
// 予約に関するAPIエンドポイント（サーバーサイド）です。
// 料金計算後、Larkの「決済マスタ」を検索してリンクを紐付け、Lark自動化Webhookへデータを送信します。

import { NextRequest, NextResponse } from 'next/server'
import { getReservations, getBookedDatesInRange, getSpecialRates, getPaymentMasters } from '@/lib/lark'
import { calculatePrice } from '@/lib/booking/pricing'
import { validateBookingNights } from '@/lib/booking/restrictions'

export const runtime = 'edge';

// Lark Automation Webhook URL (このURLに向けてデータを送信します)
const LARK_WEBHOOK_URL = "https://cjpg214zu1bc.jp.larksuite.com/base/automation/webhook/event/AF25a6jG9wKoexhNdNKjbIhUpzg"

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
      paymentStatus = 'Pending', paymentMethod = 'AirPAY'
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

    // 1. 料金計算
    const specialRates = await getSpecialRates()
    const pricing = calculatePrice(checkIn, checkOut, Number(numberOfGuests), specialRates)

    if (pricing.totalAmount <= 0) {
       return NextResponse.json({ error: 'Price calculation error' }, { status: 400 })
    }

    // 2. 決済リンクの自動マッチング
    // Larkの Payment Masters テーブルから、この金額(totalAmount)に対応するリンクを探す
    let matchedPaymentUrl = ''
    try {
      const paymentMasters = await getPaymentMasters()
      const match = paymentMasters.find(m => m.amount === pricing.totalAmount)
      if (match) {
        matchedPaymentUrl = match.url
      }
    } catch (e) {
      console.error('Payment Master matching failed', e)
    }

    // 3. Lark Webhookへ送信 (Lark側でレコード作成 & GAS連携)
    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    const webhookPayload = {
      reservationId: reservationId,
      guestName: guestName,
      email: email,
      checkInDate: checkInDate, // LarkにはYYYY-MM-DD文字列で送るのが安全
      checkOutDate: checkOutDate,
      numberOfNights: pricing.numberOfNights,
      numberOfGuests: Number(numberOfGuests),
      totalAmount: pricing.totalAmount,
      paymentStatus: paymentStatus,
      paymentTransactionId: '',
      paymentUrl: matchedPaymentUrl, // 自動マッチングしたURL
      paymentMethod: paymentMethod,
      status: 'Confirmed'
    }

    // WebhookへPOST送信
    await fetch(LARK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    })

    // フロントエンドへは成功レスポンスを返す
    // ※Larkへの保存自体は非同期で行われるため、ここでは送信成功をもって完了とします
    return NextResponse.json({ 
      reservation: webhookPayload, 
      pricing 
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to process reservation request' }, { status: 500 })
  }
}
