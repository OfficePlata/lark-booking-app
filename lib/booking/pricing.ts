// 【ファイル概要】
// 宿泊料金計算のビジネスロジックです。
// Larkから取得した「特別料金」と「基本の連泊割引」を組み合わせて、日ごとに正確な料金を計算します。

import { SpecialRate } from "@/lib/lark"

// 基本設定
export const BASE_CONFIG = {
  baseGuestCount: 2,      // 基本料金に含まれる人数
  additionalGuestRate: 5000, // 追加人数1名あたりの料金
  defaultRates: {
    1: 18000, // 1泊のみの単価
    2: 15000, // 2連泊時の単価
    3: 12000, // 3連泊以上の単価
  }
}

export interface PricingBreakdown {
  numberOfNights: number
  numberOfGuests: number
  dates: {
    date: string
    price: number
    isSpecialRate: boolean
    specialRateName?: string
  }[]
  baseTotal: number
  additionalGuests: number
  additionalGuestTotal: number
  totalAmount: number
  ratePerNight?: number // For backward compatibility / display summary
}

/**
 * 料金計算のメイン関数
 */
export function calculatePrice(
  checkIn: Date | number,
  checkOut: Date | number,
  guests?: number,
  specialRates: SpecialRate[] = []
): PricingBreakdown {
  
  // 引数が (nights, guests) の古い形式で呼ばれた場合のフォールバック（特別料金なし）
  if (typeof checkIn === 'number' && typeof checkOut === 'number') {
    return calculatePriceLegacy(checkIn, checkOut)
  }

  const inDate = checkIn as Date
  const outDate = checkOut as Date
  const numGuests = guests || 2

  const oneDay = 1000 * 60 * 60 * 24
  // 泊数計算
  const diffTime = outDate.getTime() - inDate.getTime()
  const numberOfNights = Math.round(diffTime / oneDay)

  if (numberOfNights <= 0) {
    return {
      numberOfNights: 0, numberOfGuests: numGuests, dates: [], baseTotal: 0,
      additionalGuests: 0, additionalGuestTotal: 0, totalAmount: 0
    }
  }

  // 1. 基本単価の決定 (連泊数による割引)
  let standardRate = BASE_CONFIG.defaultRates[1]
  if (numberOfNights === 2) standardRate = BASE_CONFIG.defaultRates[2]
  if (numberOfNights >= 3) standardRate = BASE_CONFIG.defaultRates[3]

  // 2. 日ごとの料金計算
  const dateDetails = []
  let baseTotal = 0

  for (let i = 0; i < numberOfNights; i++) {
    const currentDate = new Date(inDate.getTime() + (i * oneDay))
    const dateStr = currentDate.toISOString().split('T')[0]

    // 特別料金の検索 (期間内で、優先度が最も高いものを探す)
    const specialRate = specialRates
      .filter(r => dateStr >= r.startDate && dateStr <= r.endDate)
      .sort((a, b) => b.priority - a.priority)[0] // 優先度順

    if (specialRate) {
      dateDetails.push({
        date: dateStr,
        price: specialRate.pricePerNight,
        isSpecialRate: true,
        specialRateName: specialRate.name
      })
      baseTotal += specialRate.pricePerNight
    } else {
      dateDetails.push({
        date: dateStr,
        price: standardRate,
        isSpecialRate: false
      })
      baseTotal += standardRate
    }
  }

  // 3. 追加人数料金の計算
  const additionalGuests = Math.max(0, numGuests - BASE_CONFIG.baseGuestCount)
  const additionalGuestTotal = additionalGuests * BASE_CONFIG.additionalGuestRate * numberOfNights

  // 4. 合計
  const totalAmount = baseTotal + additionalGuestTotal

  return {
    numberOfNights,
    numberOfGuests: numGuests,
    dates: dateDetails,
    baseTotal,
    additionalGuests,
    additionalGuestTotal,
    totalAmount,
    ratePerNight: standardRate // 参考用
  }
}

// レガシーサポート
function calculatePriceLegacy(nights: number, guests: number): PricingBreakdown {
  let rate = BASE_CONFIG.defaultRates[1]
  if (nights === 2) rate = BASE_CONFIG.defaultRates[2]
  if (nights >= 3) rate = BASE_CONFIG.defaultRates[3]

  const baseTotal = rate * nights
  const additionalGuests = Math.max(0, guests - BASE_CONFIG.baseGuestCount)
  const additionalGuestTotal = additionalGuests * BASE_CONFIG.additionalGuestRate * nights
  const totalAmount = baseTotal + additionalGuestTotal

  return {
    numberOfNights: nights,
    numberOfGuests: guests,
    dates: [],
    baseTotal,
    additionalGuests,
    additionalGuestTotal,
    totalAmount,
    ratePerNight: rate
  }
}

export function formatCurrency(amount: number) {
  if (isNaN(amount)) return '¥0'
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}
