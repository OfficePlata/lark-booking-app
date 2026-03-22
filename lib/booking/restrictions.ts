// 【ファイル概要】
// 予約制限に関するビジネスロジックを定義するファイルです。
// 現在は最低1泊から予約可能です。
// 将来的に「最低3泊から」といった制限を追加する場合は、このファイルを修正してください。

export interface BookingRestriction {
  isRestricted: boolean
  minNights: number
  restrictionLiftDate: Date
  message: string
}

/**
 * 予約制限をチェックする
 * 
 * 【現在の設定】
 * - 最低1泊から予約可能（制限なし）
 * 
 * @param checkInDate - チェックイン日
 * @returns 予約制限の詳細
 */
export function checkBookingRestriction(checkInDate: Date): BookingRestriction {
  // 現在は制限なし（1泊から予約OK）
  return {
    isRestricted: false,
    minNights: 1,
    restrictionLiftDate: new Date(),
    message: '1泊から予約可能です',
  }
}

/**
 * 宿泊数のバリデーション
 * 
 * 【チェック内容】
 * - チェックアウト日がチェックイン日より後であること
 * - 最低宿泊数を満たしていること（現在は1泊以上）
 * 
 * @param checkInDate - チェックイン日
 * @param checkOutDate - チェックアウト日
 * @returns バリデーション結果
 */
export function validateBookingNights(
  checkInDate: Date,
  checkOutDate: Date
): { isValid: boolean; message: string; nights: number } {
  // 宿泊数を計算
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
  const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  // チェックアウト日がチェックイン日より後であること
  if (nights < 1) {
    return {
      isValid: false,
      message: 'チェックアウト日はチェックイン日より後にしてください',
      nights: 0,
    }
  }
  
  // 最低宿泊数のチェック（現在は1泊以上）
  const restriction = checkBookingRestriction(checkInDate)
  
  if (nights < restriction.minNights) {
    return {
      isValid: false,
      message: restriction.message,
      nights,
    }
  }
  
  return {
    isValid: true,
    message: '予約可能です',
    nights,
  }
}

/**
 * 最低チェックアウト日を取得
 * 
 * @param checkInDate - チェックイン日
 * @returns 最低チェックアウト日
 */
export function getMinCheckOutDate(checkInDate: Date): Date {
  const restriction = checkBookingRestriction(checkInDate)
  const minCheckOut = new Date(checkInDate)
  minCheckOut.setDate(minCheckOut.getDate() + restriction.minNights)
  return minCheckOut
}

/**
 * 日付をフォーマットして表示用文字列を返す
 * 
 * @param date - フォーマットする日付
 * @param locale - 'ja'（日本語）または 'en'（英語）
 * @returns フォーマットされた日付文字列
 */
export function formatDate(date: Date, locale: 'ja' | 'en' = 'ja'): string {
  if (locale === 'ja') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 2つの日付間の宿泊数を計算
 * 
 * @param checkIn - チェックイン日
 * @param checkOut - チェックアウト日
 * @returns 宿泊数
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const timeDiff = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

/**
 * 日付が過去かどうかを判定
 * 
 * @param date - 判定する日付
 * @returns 過去の日付ならtrue
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * 指定された範囲内の全日付を配列で返す
 * 
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 日付の配列
 */
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  
  while (current < endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}
