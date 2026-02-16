import { SpecialRate } from "@/lib/lark"

// 基本設定
export const BASE_CONFIG = {
  baseGuestCount: 2,      // 基本料金に含まれる人数
  additionalGuestRate: 4000, // 追加人数1名あたりの料金 (+4,000円)
  maxGuests: 3,           // 最大宿泊人数 (3名)
  defaultRates: {
    1: 18000, // 1泊のみの単価 (2名分)
    2: 15000, // 2連泊時の単価 (2名分)
    3: 12000, // 3連泊以上の単価 (2名分)
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
  ratePerNight?: number
}

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
  
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return createEmptyBreakdown(numGuests)
  }

  const oneDay = 1000 * 60 * 60 * 24
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const numberOfNights = Math.round(diffTime / oneDay)

  if (numberOfNights <= 0) return createEmptyBreakdown(numGuests)

  let standardRate = BASE_CONFIG.defaultRates[1]
  if (numberOfNights === 2) standardRate = BASE_CONFIG.defaultRates[2]
  if (numberOfNights >= 3) standardRate = BASE_CONFIG.defaultRates[3]

  const dateDetails = []
  let baseTotal = 0

  for (let i = 0; i < numberOfNights; i++) {
    const d = new Date(checkIn.getTime() + (i * oneDay))
    const dateStr = d.toISOString().split('T')[0]

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

  const additionalGuests = Math.max(0, numGuests - BASE_CONFIG.baseGuestCount)
  const additionalGuestTotal = additionalGuests * BASE_CONFIG.additionalGuestRate * numberOfNights

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
