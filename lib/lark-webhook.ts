/**
 * Lark Webhook通知機能
 * 予約データをLark自動化のWebhookに送信します。
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
  status: string
}

/**
 * Larkに予約通知を送信
 * シンプルなJSON形式でデータを送信し、Lark自動化がレコードを作成します。
 */
export async function sendLarkNotification(
  webhookUrl: string,
  reservation: ReservationData
): Promise<void> {
  try {
    // Lark自動化のWebhookに送信するデータ
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
      status: reservation.status,
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    })

    if (!response.ok) {
      throw new Error(`Lark webhook failed: ${response.status} ${response.statusText}`)
    }

    console.log('Lark notification sent successfully')
  } catch (error) {
    console.error('Failed to send Lark notification:', error)
    throw error
  }
}
