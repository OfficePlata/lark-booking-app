/**
 * ========================================
 * Lark Webhook通知ライブラリ
 * ========================================
 * 
 * 【このファイルの役割】
 * - 予約データをLark自動化のWebhookに送信します
 * - Lark自動化が自動的にRESERVATIONSテーブルにレコードを追加します
 * 
 * 【データフロー】
 * 1. 予約フォーム送信
 * 2. app/api/reservations/route.ts で料金計算
 * 3. sendLarkNotification() でLark自動化のWebhookに送信
 * 4. Lark自動化が「レコードを追加」ステップでRESERVATIONSテーブルに保存
 * 
 * 【重要】
 * - シンプルなJSON形式でデータを送信します（カード形式ではありません）
 * - エラー通知機能は削除されました（エラー通知を送信するとLark自動化が誤動作します）
 */

// ========================================
// 型定義
// ========================================

/**
 * 予約データの型定義
 * 
 * 【フィールド説明】
 * - reservationId: 予約ID（例: RES-1234567890-ABC123）
 * - guestName: ゲスト名
 * - email: メールアドレス
 * - checkInDate: チェックイン日（YYYY-MM-DD形式）
 * - checkOutDate: チェックアウト日（YYYY-MM-DD形式）
 * - numberOfNights: 宿泊数
 * - numberOfGuests: 人数
 * - totalAmount: 合計金額
 * - paymentStatus: 支払状況（例: "Pending", "Paid"）
 * - paymentMethod: 支払方法（例: "AirPAY"）
 * - status: 予約ステータス（例: "Confirmed"）
 */
interface ReservationData {
  reservationId: string
  guestName: string
  email: string
  checkInDate: string
  checkOutDate: string
  numberOfNights: number
  numberOfGuests: number
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
  paymentUrl?: string
  status: string
}

// ========================================
// Webhook通知
// ========================================

/**
 * Lark自動化のWebhookに予約通知を送信
 * 
 * 【処理の流れ】
 * 1. 予約データをシンプルなJSON形式に変換
 * 2. Lark自動化のWebhook URLにPOSTリクエストを送信
 * 3. Lark自動化が「Webhook を受信したとき」トリガーで受信
 * 4. Lark自動化が「レコードを追加」ステップでRESERVATIONSテーブルに保存
 * 
 * 【Lark自動化の設定】
 * - トリガー: 「Webhook を受信したとき」
 * - データ構造設定: 「手動で作成」を選択し、以下のJSONスキーマを設定
 *   {
 *     "reservationId": "string",
 *     "guestName": "string",
 *     "email": "string",
 *     "checkInDate": "string",
 *     "checkOutDate": "string",
 *     "numberOfNights": "number",
 *     "numberOfGuests": "number",
 *     "totalAmount": "number",
 *     "paymentStatus": "string",
 *     "paymentMethod": "string",
 *     "status": "string"
 *   }
 * 
 * 【エラー処理】
 * - Webhook送信に失敗した場合はエラーをスローします
 * - エラーは app/api/reservations/route.ts でキャッチされ、ユーザーにエラーレスポンスを返します
 * 
 * @param {string} webhookUrl - Lark自動化のWebhook URL
 * @param {ReservationData} reservation - 予約データ
 * @throws {Error} Webhook送信に失敗した場合
 */
export async function sendLarkNotification(
  webhookUrl: string,
  reservation: ReservationData
): Promise<void> {
  try {
    // Lark自動化のWebhookに送信するデータ
    // 注意: シンプルなJSON形式で送信します（カード形式ではありません）
    const webhookData = {
      reservationId: reservation.reservationId,
      guestName: reservation.guestName,
      email: reservation.email,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      numberOfNights: reservation.numberOfNights,
      numberOfGuests: reservation.numberOfGuests,
      totalAmount: reservation.totalAmount,
      paymentStatus: reservation.paymentStatus,
      paymentMethod: reservation.paymentMethod,
      paymentUrl: reservation.paymentUrl || '',
      status: reservation.status,
    }

    console.log('[Lark Webhook] Sending notification:', JSON.stringify(webhookData))

    // Lark自動化のWebhookにPOSTリクエストを送信
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    })

    // エラーチェック
    if (!response.ok) {
      throw new Error(`Lark webhook failed: ${response.status} ${response.statusText}`)
    }

    console.log('[Lark Webhook] Notification sent successfully')
    
  } catch (error) {
    console.error('[Lark Webhook] Failed to send notification:', error)
    // エラーをスローして、呼び出し元でエラーハンドリングできるようにする
    throw error
  }
}

/**
 * ========================================
 * 注意事項
 * ========================================
 * 
 * 【削除された機能】
 * - sendLarkErrorNotification() 関数は削除されました
 * - エラー通知をWebhookに送信すると、Lark自動化が誤動作します
 * - エラー通知はカード形式で送信されるため、Lark自動化が正しく解析できません
 * 
 * 【エラー処理の方針】
 * - エラーはコンソールログに出力します
 * - エラーはAPIレスポンスとしてフロントエンドに返します
 * - Larkへのエラー通知は行いません
 * 
 * 【Lark自動化のフィールドマッピング】
 * - 「レコードを追加」ステップで、各フィールドに変数をマッピングします
 * - 変数は「⊕」ボタンから「ステップ 1 で送信されたリクエストの戻り値」を選択
 * - ルートレベルのキー名（例: reservationId）を選択します
 * - 手動入力ではなく、ドロップダウンから選択してください
 */
