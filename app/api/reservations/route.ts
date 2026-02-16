/**
 * ========================================
 * 予約APIエンドポイント
 * ========================================
 * 
 * 【このファイルの役割】
 * - 予約フォームからのPOSTリクエストを受け取ります
 * - 料金を再計算し、Lark Webhookに送信します
 * - 予約済み日付の取得（GETリクエスト）も処理します
 * 
 * 【データフロー】
 * 1. フロントエンドから予約データを受信
 * 2. 入力値のバリデーション
 * 3. 特別料金を取得
 * 4. 料金を再計算（サーバーサイドで信頼できる計算）
 * 5. Lark Webhookに送信
 * 6. Lark自動化がRESERVATIONSテーブルにレコードを追加
 * 
 * 【重要】
 * - createReservation()は呼び出しません（Lark自動化経由で作成）
 * - エラー通知はWebhookに送信しません（Lark自動化が誤動作するため）
 */

import { NextRequest, NextResponse } from 'next/server'
import { getReservations, getBookedDatesInRange, getSpecialRates } from '@/lib/lark'
import { calculatePrice } from '@/lib/booking/pricing'
import { validateBookingNights } from '@/lib/booking/restrictions'
import { sendLarkNotification } from '@/lib/lark-webhook'

export const runtime = 'edge';

/**
 * ========================================
 * GET /api/reservations
 * ========================================
 * 
 * 【用途】
 * - 予約一覧の取得
 * - 予約済み日付の取得（カレンダー表示用）
 * 
 * 【クエリパラメータ】
 * - action=booked-dates: 予約済み日付を取得
 *   - start: 開始日（YYYY-MM-DD形式）
 *   - end: 終了日（YYYY-MM-DD形式）
 * - actionなし: 確定済み予約一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // 予約済み日付の取得
    if (action === 'booked-dates') {
      const startDate = searchParams.get('start')
      const endDate = searchParams.get('end')
      
      // バリデーション
      if (!startDate || !endDate) {
        return NextResponse.json({ error: 'Missing dates' }, { status: 400 })
      }
      
      const bookedDates = await getBookedDatesInRange(startDate, endDate)
      return NextResponse.json({ bookedDates })
    }
    
    // 確定済み予約一覧の取得
    const reservations = await getReservations({ status: 'Confirmed' })
    return NextResponse.json({ reservations })
    
  } catch (error) {
    console.error('[Reservation API] GET Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

/**
 * ========================================
 * POST /api/reservations
 * ========================================
 * 
 * 【用途】
 * - 新規予約の作成
 * 
 * 【リクエストボディ】
 * {
 *   "guestName": "山田太郎",
 *   "email": "yamada@example.com",
 *   "checkInDate": "2026-03-01",
 *   "checkOutDate": "2026-03-03",
 *   "numberOfGuests": 2,
 *   "paymentStatus": "Pending",
 *   "paymentMethod": "AirPAY"
 * }
 * 
 * 【処理の流れ】
 * 1. 入力値のバリデーション
 * 2. 宿泊数のバリデーション（最低2泊）
 * 3. 特別料金の取得
 * 4. 料金の再計算
 * 5. 予約IDの生成
 * 6. Lark Webhookに送信
 * 7. Lark自動化がRESERVATIONSテーブルにレコードを追加
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Reservation API] Received POST request')
    
    // リクエストボディの取得
    const body = await request.json()
    console.log('[Reservation API] Request body:', JSON.stringify(body))
    
    const {
      guestName,
      email,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      paymentStatus = 'Pending',
      paymentMethod = 'AirPAY'
    } = body

    // ========================================
    // 入力値のバリデーション
    // ========================================
    
    if (!guestName || !email || !checkInDate || !checkOutDate || !numberOfGuests) {
      console.error('[Reservation API] Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // ========================================
    // 宿泊数のバリデーション
    // ========================================
    
    console.log('[Reservation API] Validating booking dates')
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const validation = validateBookingNights(checkIn, checkOut)

    if (!validation.isValid) {
      console.error('[Reservation API] Validation failed:', validation.message)
      return NextResponse.json({ 
        error: validation.message 
      }, { status: 400 })
    }

    // ========================================
    // 特別料金の取得
    // ========================================
    
    console.log('[Reservation API] Fetching special rates')
    const specialRates = await getSpecialRates()
    console.log('[Reservation API] Special rates count:', specialRates.length)
    
    // ========================================
    // 料金の再計算
    // ========================================
    
    console.log('[Reservation API] Calculating price')
    const pricing = calculatePrice(
      checkIn,
      checkOut,
      Number(numberOfGuests),
      specialRates
    )
    console.log('[Reservation API] Pricing result:', JSON.stringify(pricing))

    // 料金計算のバリデーション
    if (pricing.totalAmount <= 0) {
      console.error('[Reservation API] Invalid price calculation')
      return NextResponse.json({ 
        error: 'Price calculation error' 
      }, { status: 400 })
    }

    // ========================================
    // 予約IDの生成
    // ========================================
    
    // 形式: RES-{タイムスタンプ}-{ランダム文字列}
    // 例: RES-1234567890-ABC123
    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    console.log('[Reservation API] Generated reservation ID:', reservationId)

    // ========================================
    // Lark Webhookに送信
    // ========================================
    
    const webhookUrl = process.env.LARK_WEBHOOK_URL
    
    if (!webhookUrl) {
      console.error('[Reservation API] LARK_WEBHOOK_URL is not set')
      return NextResponse.json({ 
        error: 'Lark webhook not configured' 
      }, { status: 500 })
    }

    console.log('[Reservation API] Sending Lark webhook notification')
    
    try {
      // Lark自動化のWebhookに予約データを送信
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
      // Webhook送信に失敗した場合
      console.error('[Reservation API] Failed to send Lark notification:', notificationError)
      return NextResponse.json({ 
        error: 'Failed to send reservation to Lark' 
      }, { status: 500 })
    }

    // ========================================
    // 成功レスポンスを返す
    // ========================================
    
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
    // 予期しないエラーが発生した場合
    console.error('[Reservation API] Error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to create reservation' 
    }, { status: 500 })
  }
}

/**
 * ========================================
 * 注意事項
 * ========================================
 * 
 * 【削除された機能】
 * - createReservation()の呼び出しは削除されました
 * - エラー通知のWebhook送信は削除されました
 * 
 * 【予約作成の流れ】
 * 1. このAPIがLark Webhookに予約データを送信
 * 2. Lark自動化が「Webhook を受信したとき」トリガーで受信
 * 3. Lark自動化が「レコードを追加」ステップでRESERVATIONSテーブルに保存
 * 
 * 【エラー処理】
 * - エラーはコンソールログに出力されます
 * - エラーはAPIレスポンスとしてフロントエンドに返されます
 * - Larkへのエラー通知は行いません（Lark自動化が誤動作するため）
 * 
 * 【環境変数】
 * - LARK_WEBHOOK_URL: Lark自動化のWebhook URL
 * - LARK_APP_ID: Lark アプリID
 * - LARK_APP_SECRET: Lark アプリシークレット
 * - LARK_BASE_ID: Lark Base ID
 * - LARK_RESERVATIONS_TABLE_ID: RESERVATIONSテーブルID
 * - LARK_SPECIAL_RATES_TABLE_ID: SPECIAL_RATESテーブルID
 */
