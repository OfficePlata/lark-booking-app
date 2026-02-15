/**
 * Lark Webhook通知機能
 */

interface ReservationData {
  guestName: string
  email: string
  checkInDate: string
  checkOutDate: string
  numberOfNights: number
  numberOfGuests: number
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
}

/**
 * Larkに予約通知を送信
 */
export async function sendLarkNotification(
  webhookUrl: string,
  reservation: ReservationData
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
            content: '🎉 新規予約リクエスト',
            tag: 'plain_text',
          },
          template: 'green',
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: `**お客様情報**\n👤 お名前: ${reservation.guestName}\n📧 メール: ${reservation.email}`,
              tag: 'lark_md',
            },
          },
          {
            tag: 'hr',
          },
          {
            tag: 'div',
            text: {
              content: `**宿泊情報**\n📅 チェックイン: ${reservation.checkInDate}\n📅 チェックアウト: ${reservation.checkOutDate}\n🌙 宿泊数: ${reservation.numberOfNights}泊\n👥 人数: ${reservation.numberOfGuests}名`,
              tag: 'lark_md',
            },
          },
          {
            tag: 'hr',
          },
          {
            tag: 'div',
            text: {
              content: `**料金情報**\n💰 合計金額: ¥${reservation.totalAmount.toLocaleString()}\n💳 決済方法: ${reservation.paymentMethod}\n📊 決済状況: ${reservation.paymentStatus}`,
              tag: 'lark_md',
            },
          },
          {
            tag: 'hr',
          },
          {
            tag: 'note',
            elements: [
              {
                tag: 'plain_text',
                content: `受付日時: ${timestamp}`,
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
      throw new Error(`Lark webhook failed: ${response.status} ${response.statusText}`)
    }

    console.log('Lark notification sent successfully')
  } catch (error) {
    console.error('Failed to send Lark notification:', error)
    throw error
  }
}
