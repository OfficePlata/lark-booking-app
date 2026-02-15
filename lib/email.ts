// 【ファイル概要】
// メール送信用のユーティリティ関数です。
// 予約確認メールをユーザーに送信します。

interface ReservationEmailData {
  guestName: string
  email: string
  checkInDate: string
  checkOutDate: string
  numberOfNights: number
  numberOfGuests: number
  totalAmount: number
  paymentStatus: string
}

/**
 * 予約確認メールを送信
 */
export async function sendReservationConfirmationEmail(
  reservation: ReservationEmailData
): Promise<void> {
  const emailApiUrl = process.env.EMAIL_API_URL
  const emailApiKey = process.env.EMAIL_API_KEY
  
  if (!emailApiUrl || !emailApiKey) {
    console.warn('Email API is not configured. Skipping email notification.')
    return
  }

  try {
    const emailContent = generateEmailContent(reservation)
    
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emailApiKey}`,
      },
      body: JSON.stringify({
        to: reservation.email,
        subject: '【YADO】予約リクエストを受け付けました / Reservation Request Received',
        html: emailContent,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to send email:', response.status, errorText)
      throw new Error(`Email API returned ${response.status}`)
    }

    console.log('Confirmation email sent successfully to:', reservation.email)
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    // メール送信の失敗は予約処理自体を失敗させない
  }
}

/**
 * メールコンテンツを生成
 */
function generateEmailContent(reservation: ReservationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>予約リクエスト確認</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">YADO</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">予約リクエストを受け付けました</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      ${reservation.guestName} 様
    </p>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
      この度は、YADOへのご予約リクエストをいただき、誠にありがとうございます。<br>
      以下の内容で予約リクエストを受け付けいたしました。
    </p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <h2 style="font-size: 18px; margin: 0 0 15px 0; color: #111827;">📋 予約内容</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">チェックイン</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${reservation.checkInDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">チェックアウト</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${reservation.checkOutDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">宿泊数</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${reservation.numberOfNights}泊</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">人数</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${reservation.numberOfGuests}名</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">合計金額</td>
          <td style="padding: 12px 0 0 0; text-align: right; color: #667eea; font-size: 20px; font-weight: 700;">¥${reservation.totalAmount.toLocaleString()}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>📌 重要なお知らせ</strong><br>
        これは予約リクエストの受付確認メールです。予約の確定ではございません。<br>
        担当者が内容を確認後、決済リンクをお送りいたします。
      </p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 16px; margin: 0 0 10px 0; color: #111827;">次のステップ</h3>
      <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
        <li style="margin-bottom: 8px;">担当者が予約内容を確認します（通常24時間以内）</li>
        <li style="margin-bottom: 8px;">決済リンクをメールでお送りします</li>
        <li style="margin-bottom: 8px;">決済完了後、予約が確定します</li>
      </ol>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        ご不明な点がございましたら、このメールに返信してお問い合わせください。<br>
        If you have any questions, please reply to this email.
      </p>
    </div>
    
  </div>
  
  <div style="text-align: center; padding: 20px 0;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
      © ${new Date().getFullYear()} YADO. All rights reserved.
    </p>
  </div>
  
</body>
</html>
  `.trim()
}
