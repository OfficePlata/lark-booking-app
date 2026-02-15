/**
 * 料金計算ロジック
 * 特別料金（SpecialRate）に対応した日別料金計算を行います
 */

import { SpecialRate } from '@/lib/lark'

export interface DailyRate {
  date: string // YYYY-MM-DD形式
  ratePerNight: number
  isSpecialRate: boolean
  specialRateName?: string
}

export interface PricingCalculation {
  // 基本情報
  numberOfNights: number
  numberOfGuests: number
  
  // 日別料金
  dates: DailyRate[]
  
  // 基本料金（宿泊料金の合計）
  baseTotal: number
  ratePerNight: number // 平均単価（特別料金がない場合のみ意味がある）
  
  // 追加人数料金
  additionalGuests: number // 追加人数（3名以上の場合）
  additionalGuestTotal: number // 追加人数料金の合計
  
  // 合計金額
  totalAmount: number
}

/**
 * 宿泊料金を計算（特別料金対応版）
 */
export function calculatePrice(
  checkInDate: Date,
  checkOutDate: Date,
  numberOfGuests: number,
  specialRates: SpecialRate[] = []
): PricingCalculation {
  // 宿泊数を計算
  const numberOfNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // 基本料金（2名まで）
  const defaultBasePrice = 18000

  // 追加人数料金（3名以上の場合、1名あたり5,000円/泊）
  const additionalGuests = numberOfGuests > 2 ? numberOfGuests - 2 : 0
  const additionalGuestFeePerNight = 5000

  // 日別料金を計算
  const dates: DailyRate[] = []
  let baseTotal = 0

  for (let i = 0; i < numberOfNights; i++) {
    const currentDate = new Date(checkInDate)
    currentDate.setDate(currentDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]

    // この日に適用される特別料金を探す（優先度が高い順）
    const applicableRate = specialRates
      .filter(rate => dateStr >= rate.startDate && dateStr <= rate.endDate)
      .sort((a, b) => b.priority - a.priority)[0]

    let ratePerNight: number
    let isSpecialRate: boolean
    let specialRateName: string | undefined

    if (applicableRate) {
      // 特別料金が適用される
      ratePerNight = applicableRate.pricePerNight
      isSpecialRate = true
      specialRateName = applicableRate.name
    } else {
      // 通常料金
      ratePerNight = defaultBasePrice
      isSpecialRate = false
    }

    dates.push({
      date: dateStr,
      ratePerNight,
      isSpecialRate,
      specialRateName,
    })

    baseTotal += ratePerNight
  }

  // 追加人数料金の合計
  const additionalGuestTotal = additionalGuests * additionalGuestFeePerNight * numberOfNights

  // 合計金額
  const totalAmount = baseTotal + additionalGuestTotal

  // 平均単価（参考値）
  const averageRatePerNight = numberOfNights > 0 ? baseTotal / numberOfNights : 0

  return {
    numberOfNights,
    numberOfGuests,
    dates,
    baseTotal,
    ratePerNight: averageRatePerNight,
    additionalGuests,
    additionalGuestTotal,
    totalAmount,
  }
}

/**
 * 金額を日本円形式でフォーマット
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}
