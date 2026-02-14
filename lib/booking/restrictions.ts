// 【ファイル概要】
// 予約制限に関するビジネスロジックを定義するファイルです。
// 「最低3泊から」といった宿泊日数の制限や、予約可能な期間の判定ロジックを提供します。

// Booking Restrictions Logic
// Priority booking: 3+ night stays have priority
// Before the 20th of the previous month, only 3+ night stays are allowed
// After the 20th, 1-2 night stays become available

export interface BookingRestriction {
  isRestricted: boolean
  minNights: number
  restrictionLiftDate: Date
  message: string
}

/**
 * Check if short stays (1-2 nights) are restricted for a given check-in date
 * @param checkInDate - The desired check-in date
 * @returns Booking restriction details
 */
export function checkBookingRestriction(checkInDate: Date): BookingRestriction {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get the check-in month and year
  const checkInMonth = checkInDate.getMonth()
  const checkInYear = checkInDate.getFullYear()
  
  // Calculate the restriction lift date (20th of the previous month)
  let restrictionLiftMonth = checkInMonth - 1
  let restrictionLiftYear = checkInYear
  
  if (restrictionLiftMonth < 0) {
    restrictionLiftMonth = 11 // December
    restrictionLiftYear -= 1
  }
  
  const restrictionLiftDate = new Date(restrictionLiftYear, restrictionLiftMonth, 20)
  restrictionLiftDate.setHours(0, 0, 0, 0)
  
  // Check if we're before the restriction lift date
  const isRestricted = today < restrictionLiftDate
  
  return {
    isRestricted,
    minNights: isRestricted ? 3 : 1,
    restrictionLiftDate,
    message: isRestricted
      ? `Reservations of 3+ nights only until ${formatDate(restrictionLiftDate)}`
      : 'All stay lengths available',
  }
}

/**
 * Validate if a booking meets the minimum night requirement
 * @param checkInDate - Check-in date
 * @param checkOutDate - Check-out date
 * @returns Validation result
 */
export function validateBookingNights(
  checkInDate: Date,
  checkOutDate: Date
): { isValid: boolean; message: string; nights: number } {
  // Calculate number of nights
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
  const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  if (nights < 1) {
    return {
      isValid: false,
      message: 'Check-out date must be after check-in date',
      nights: 0,
    }
  }
  
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
    message: 'Booking is valid',
    nights,
  }
}

/**
 * Get the minimum check-out date based on check-in and restrictions
 * @param checkInDate - Check-in date
 * @returns Minimum check-out date
 */
export function getMinCheckOutDate(checkInDate: Date): Date {
  const restriction = checkBookingRestriction(checkInDate)
  const minCheckOut = new Date(checkInDate)
  minCheckOut.setDate(minCheckOut.getDate() + restriction.minNights)
  return minCheckOut
}

/**
 * Format date for display
 * @param date - Date to format
 * @param locale - 'ja' or 'en'
 * @returns Formatted date string
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
 * Calculate the number of nights between two dates
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Number of nights
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const timeDiff = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns true if the date is in the past
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Get all dates in a range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of dates
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
