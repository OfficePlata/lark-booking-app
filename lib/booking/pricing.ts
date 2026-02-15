/**
 * 料金計算ロジック
 */

export interface PricingCalculation {
  basePrice: number
  numberOfNights: number
  numberOfGuests: number
  subtotal: number
  discount: number
  total: number
}

/**
 * 宿泊料金を計算
 */
export function calculatePrice(
  checkInDate: Date,
  checkOutDate: Date,
  numberOfGuests: number
): PricingCalculation {
  // 宿泊数を計算
  const numberOfNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // 基本料金（2名まで）
  const basePrice = 18000

  // 3名以上の場合、1名あたり5,000円追加
  const extraGuestFee = numberOfGuests > 2 ? (numberOfGuests - 2) * 5000 : 0

  // 1泊あたりの料金
  const pricePerNight = basePrice + extraGuestFee

  // 小計
  const subtotal = pricePerNight * numberOfNights

  // 連泊割引
  let discount = 0
  if (numberOfNights === 2) {
    discount = 3000 // 2泊で3,000円割引
  } else if (numberOfNights >= 3) {
    discount = 6000 // 3泊以上で6,000円割引
  }

  // 合計金額
  const total = subtotal - discount

  return {
    basePrice: pricePerNight,
    numberOfNights,
    numberOfGuests,
    subtotal,
    discount,
    total,
  }
}
