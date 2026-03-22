import { SpecialRate } from "@/lib/lark"
import { format } from "date-fns" // ★ タイムゾーンズレ防止のために追加

// 基本設定
export const BASE_CONFIG = {
  baseGuestCount: 2,      // 基本料金に含まれる人数
  additionalGuestRate: 6000, // 追加人数1名あたりの料金 (+6,000円) ※準備中のため現在は使用不可
  maxGuests: 2,           // 最大宿泊人数 (2名) ※3名様以上は準備中
  defaultRates: {
    1: 18000, // 1泊のみの単価 (2名分)
    2: 15000, // 2連泊時の単価 (2名分)
    3: 12000, // 3連泊時の単価 (2名分)
    4: 12000, // 4連泊時の単価 (2名分)
    5: 11000, // 5連泊時の単価 (2名分)
    6: 11000, // 6連泊時の単価 (2名分)
    7: 11000, // 7連泊時の単価 (2名分)
    8: 10000, // 8連泊時の単価 (2名分)
    9: 10000, // 9連泊時の単価 (2名分)
    10: 9500, // 10連泊時の単価 (2名分)
    11: 9500, // 11連泊時の単価 (2名分)
    12: 9500, // 12連泊時の単価 (2名分)
    13: 9500, // 13連泊時の単価 (2名分)
    14: 9500, // 14連泊時の単価 (2名分)
    15: 9500, // 15連泊時の単価 (2名分)
    16: 9500, // 16連泊時の単価 (2名分)
    17: 9500, // 17連泊時の単価 (2名分)
    18: 9500, // 18連泊時の単価 (2名分)
    19: 9500, // 19連泊時の単価 (2名分)
    20: 9500, // 20連泊時の単価 (2名分)
  } as Record<number, number> // 型を明示
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
  
  const numGuests = guests || 2
  
  // 1. バリデーション
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return createEmptyBreakdown(numGuests)
  }

  // 2. 泊数計算
  const oneDay = 1000 * 60 * 60 * 24
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const numberOfNights = Math.round(diffTime / oneDay)

  if (numberOfNights <= 0) return createEmptyBreakdown(numGuests)

  // 3. 基本単価決定 (連泊割引)
  // ★ 宿泊数に応じた金額を動的に取得する（20泊を超える場合は20泊の料金を適用）
  const rateKey = Math.min(numberOfNights, 20)
  const standardRate = BASE_CONFIG.defaultRates[rateKey] || BASE_CONFIG.defaultRates[1]

  // 4. 日ごとの計算 (特別料金適用)
  const dateDetails = []
  let baseTotal = 0

  for (let i = 0; i < numberOfNights; i++) {
    const d = new Date(checkIn.getTime() + (i * oneDay))
    
    // ★ toISOString() の罠を回避し、date-fnsでローカル時間にフォーマット
    const dateStr = format(d, 'yyyy-MM-dd')

    // 特別料金を探す
    const special = specialRates?.find(r => 
      dateStr >= r.startDate && dateStr <= r.endDate
    ) 

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
    numberOfGuests: guests,
    baseTotal: 0,
    additionalGuests: 0,
    additionalGuestTotal: 0,
    totalAmount: 0,
    dates: [],
    ratePerNight: 0
  }
}
