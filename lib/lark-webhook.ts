/**
 * Lark Webhook通知機能
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

/**
 * Larkにエラー通知を送信
 */
export async function sendLarkErrorNotification(
  webhookUrl: string,
  errorMessage: string,
  errorDetails?: string
): Promise<void> {
  try {
    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const message = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            content: '⚠️ エラー発生',
            tag: 'plain_text',
          },
          template: 'red',
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: `**エラー内容**\n${errorMessage}`,
              tag: 'lark_md',
            },
          },
          ...(errorDetails
            ? [
                {
                  tag: 'hr' as const,
                },
                {
                  tag: 'div' as const,
                  text: {
                    content: `**詳細**\n${errorDetails}`,
                    tag: 'lark_md' as const,
                  },
                },
              ]
            : []),
          {
            tag: 'hr',
          },
          {
            tag: 'note',
            elements: [
              {
                tag: 'plain_text',
                content: `発生日時: ${timestamp}`,
              },
            ],
          },
        ],
      },
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Lark error webhook failed: ${response.status} ${response.statusText}`)
    }

    console.log('Lark error notification sent successfully')
  } catch (error) {
    console.error('Failed to send Lark error notification:', error)
    // エラー通知の失敗は致命的ではないため、エラーをスローしない
  }
}
