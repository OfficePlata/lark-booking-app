// 【重要】lib/booking/pricing.ts として保存してください
import { SpecialRate } from "@/lib/lark"

// 基本設定
export const BASE_CONFIG = {
  baseGuestCount: 2,
  additionalGuestRate: 5000,
  defaultRates: {
    1: 18000, 
    2: 15000, 
    3: 12000, 
  }
}

export interface PricingBreakdown {
  numberOfNights: number
  numberOfGuests: number
  baseTotal: number
  additionalGuests: number
  additionalGuestTotal: number
  totalAmount: number
  // UI表示用詳細
  dates: { date: string, price: number, isSpecialRate: boolean, specialRateName?: string }[]
  ratePerNight?: number
}

// 金額フォーマット関数
export function formatCurrency(amount: number) {
  if (amount === undefined || amount === null || isNaN(amount)) return '¥0'
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}

export function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  guests: number,
  specialRates: SpecialRate[] = []
): PricingBreakdown {
  // 1. バリデーション
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return createEmptyBreakdown(guests)
  }

  // 2. 泊数計算
  const oneDay = 1000 * 60 * 60 * 24
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const numberOfNights = Math.round(diffTime / oneDay)

  if (numberOfNights <= 0) return createEmptyBreakdown(guests)

  // 3. 基本単価決定 (連泊割引)
  let standardRate = BASE_CONFIG.defaultRates[1]
  if (numberOfNights === 2) standardRate = BASE_CONFIG.defaultRates[2]
  if (numberOfNights >= 3) standardRate = BASE_CONFIG.defaultRates[3]

  // 4. 日ごとの計算 (特別料金適用)
  const dateDetails = []
  let baseTotal = 0

  for (let i = 0; i < numberOfNights; i++) {
    const d = new Date(checkIn.getTime() + (i * oneDay))
    const dateStr = d.toISOString().split('T')[0]

    // 特別料金を探す
    const special = specialRates?.find(r => 
      dateStr >= r.startDate && dateStr <= r.endDate
    ) // 優先度はAPI側でソート済みと仮定、あるいはここでsortしても良い

    let dailyPrice = standardRate
    let isSpecial = false
    let rateName = undefined

    if (special) {
      dailyPrice = special.pricePerNight
      isSpecial = true
      rateName = special.name
    }

    baseTotal += dailyPrice
    dateDetails.push({
      date: dateStr,
      price: dailyPrice,
      isSpecialRate: isSpecial,
      specialRateName: rateName
    })
  }

  // 5. 追加人数計算
  const numGuests = guests || 2
  const additionalGuests = Math.max(0, numGuests - BASE_CONFIG.baseGuestCount)
  const additionalGuestTotal = additionalGuests * BASE_CONFIG.additionalGuestRate * numberOfNights

  // 6. 合計
  const totalAmount = baseTotal + additionalGuestTotal

  return {
    numberOfNights,
    numberOfGuests: numGuests,
    baseTotal,
    additionalGuests,
    additionalGuestTotal,
    totalAmount,
    dates: dateDetails,
    ratePerNight: standardRate
  }
}

function createEmptyBreakdown(guests: number): PricingBreakdown {
  return {
    numberOfNights: 0,
    numberOfGuests: guests || 2,
    baseTotal: 0,
    additionalGuests: 0,
    additionalGuestTotal: 0,
    totalAmount: 0,
    dates: [],
    ratePerNight: 0
  }
}
