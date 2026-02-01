// Pricing Logic
// Base rate (for 1 room, up to 2 guests) varies by consecutive nights:
// - 1 night: ¥18,000/night
// - 2 nights: ¥15,000/night
// - 3+ nights: ¥12,000/night
// Additional guests (3rd person onwards): ¥5,000/night/person

export const PRICING = {
  baseRates: {
    1: 18000, // 1 night
    2: 15000, // 2 consecutive nights
    3: 12000, // 3+ consecutive nights
  },
  additionalGuestRate: 5000, // per night per person
  maxGuests: 6,
  minGuests: 1,
  baseGuestCount: 2, // Base price includes up to 2 guests
} as const

export interface PricingBreakdown {
  numberOfNights: number
  numberOfGuests: number
  ratePerNight: number
  baseTotal: number
  additionalGuests: number
  additionalGuestTotal: number
  totalAmount: number
}

/**
 * Calculate the total price for a stay
 * @param numberOfNights - Number of consecutive nights
 * @param numberOfGuests - Total number of guests
 * @returns Detailed pricing breakdown
 */
export function calculatePrice(numberOfNights: number, numberOfGuests: number): PricingBreakdown {
  // Determine the rate per night based on consecutive nights
  let ratePerNight: number
  if (numberOfNights >= 3) {
    ratePerNight = PRICING.baseRates[3]
  } else if (numberOfNights === 2) {
    ratePerNight = PRICING.baseRates[2]
  } else {
    ratePerNight = PRICING.baseRates[1]
  }

  // Calculate base total (for up to 2 guests)
  const baseTotal = ratePerNight * numberOfNights

  // Calculate additional guest charges
  const additionalGuests = Math.max(0, numberOfGuests - PRICING.baseGuestCount)
  const additionalGuestTotal = additionalGuests * PRICING.additionalGuestRate * numberOfNights

  // Total amount
  const totalAmount = baseTotal + additionalGuestTotal

  return {
    numberOfNights,
    numberOfGuests,
    ratePerNight,
    baseTotal,
    additionalGuests,
    additionalGuestTotal,
    totalAmount,
  }
}

/**
 * Format currency in Japanese Yen
 * @param amount - Amount in JPY
 * @param locale - 'ja' or 'en'
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, locale: 'ja' | 'en' = 'ja'): string {
  if (locale === 'ja') {
    return `¥${amount.toLocaleString('ja-JP')}`
  }
  return `¥${amount.toLocaleString('en-US')}`
}

/**
 * Get price per night for display
 * @param nights - Number of nights
 * @returns Price per night
 */
export function getPricePerNight(nights: number): number {
  if (nights >= 3) return PRICING.baseRates[3]
  if (nights === 2) return PRICING.baseRates[2]
  return PRICING.baseRates[1]
}
