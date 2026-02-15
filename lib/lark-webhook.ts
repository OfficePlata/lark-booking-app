// 【ファイル概要】
// Lark Webhookに通知を送信するユーティリティ関数です。
// 予約作成時にLarkに通知を送信します。

interface ReservationNotification {
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
 * Lark Webhookに予約通知を送信
 */
export async function sendLarkNotification(reservation: ReservationNotification): Promise<void> {
  const webhookUrl = process.env.LARK_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.warn('LARK_WEBHOOK_URL is not configured. Skipping Lark notification.')
    return
  }

  try {
    const message = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: '🎉 新規予約リクエスト',
          },
          template: 'blue',
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `**お客様情報**\n👤 お名前: ${reservation.guestName}\n📧 メール: ${reservation.email}`,
            },
          },
          {
            tag: 'hr',
          },
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `**宿泊情報**\n📅 チェックイン: ${reservation.checkInDate}\n📅 チェックアウト: ${reservation.checkOutDate}\n🌙 宿泊数: ${reservation.numberOfNights}泊\n👥 人数: ${reservation.numberOfGuests}名`,
            },
          },
          {
            tag: 'hr',
          },
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `**料金情報**\n💰 合計金額: ¥${reservation.totalAmount.toLocaleString()}\n💳 決済方法: ${reservation.paymentMethod}\n📊 決済状況: ${reservation.paymentStatus}`,
            },
          },
          {
            tag: 'note',
            elements: [
              {
                tag: 'plain_text',
                content: `受付日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
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
      const errorText = await response.text()
      console.error('Failed to send Lark notification:', response.status, errorText)
      throw new Error(`Lark Webhook returned ${response.status}`)
    }

    console.log('Lark notification sent successfully')
  } catch (error) {
    console.error('Error sending Lark notification:', error)
    // 通知の失敗は予約処理自体を失敗させない
  }
}

/**
 * エラー通知をLarkに送信
 */
export async function sendLarkErrorNotification(error: {
  title: string
  message: string
  details?: string
}): Promise<void> {
  const webhookUrl = process.env.LARK_WEBHOOK_URL
  
  if (!webhookUrl) {
    return
  }

  try {
    const message = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: `⚠️ ${error.title}`,
          },
          template: 'red',
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `**エラー内容**\n${error.message}`,
            },
          },
          ...(error.details
            ? [
                {
                  tag: 'hr' as const,
                },
                {
                  tag: 'div' as const,
                  text: {
                    tag: 'lark_md' as const,
                    content: `**詳細**\n\`\`\`\n${error.details}\n\`\`\``,
                  },
                },
              ]
            : []),
          {
            tag: 'note',
            elements: [
              {
                tag: 'plain_text',
                content: `発生日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
              },
            ],
          },
        ],
      },
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })
  } catch (err) {
    console.error('Error sending Lark error notification:', err)
  }
}
