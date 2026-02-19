'use client'

// ========================================
// 料金表示コンポーネント
// ========================================
//
// 【このファイルの役割】
// PricingDisplay: 予約フォーム内で、選択された日程・人数に基づく料金内訳を表示
//
// 【使用箇所】
// - components/booking/booking-form.tsx で使用
// - チェックイン・チェックアウト日が選択された後に表示される

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { calculatePrice, formatCurrency } from '@/lib/booking/pricing'
import { SpecialRate } from '@/lib/lark'
import { useI18n } from '@/lib/i18n/context'

// ========================================
// PricingDisplay: 予約フォーム内の料金内訳表示
// ========================================

interface PricingDisplayProps {
  checkIn: Date
  checkOut: Date
  guests: number
  specialRates: SpecialRate[]
}

/**
 * 予約フォーム内で料金の内訳を表示するコンポーネント
 * 
 * 【表示内容】
 * - 宿泊料金（泊数 × 単価）
 * - 特別料金が適用されている場合はその旨を表示
 * - 追加人数料金（3名以上の場合）
 * - 合計金額
 */
export function PricingDisplay({ checkIn, checkOut, guests, specialRates }: PricingDisplayProps) {
  const { t } = useI18n()
  if (!checkIn || !checkOut || guests <= 0) return null

  const price = calculatePrice(checkIn, checkOut, guests, specialRates)
  if (isNaN(price.totalAmount) || price.numberOfNights <= 0) return null

  const hasSpecialRate = price.dates.some(d => d.isSpecialRate)

  return (
    <Card className="mt-6 border-2 border-primary/10 bg-primary/5">
      <CardContent className="pt-6">
        <h4 className="font-semibold text-lg mb-4">{t.booking.priceDetails}</h4>
        <div className="space-y-3 text-sm">
          {/* 宿泊料金の内訳 */}
          <div className="flex justify-between items-start">
            <div className="text-muted-foreground">
              {t.booking.accommodationFee} ({price.numberOfNights}{t.booking.nights})<br/>
              <span className="text-xs opacity-80">
                {hasSpecialRate 
                  ? t.booking.specialRateIncluded 
                  : `${t.booking.standardRate} (${formatCurrency(price.dates[0]?.price || 0)} ${t.booking.perNight})`
                }
              </span>
            </div>
            <span>{formatCurrency(price.baseTotal)}</span>
          </div>

          {/* 追加人数料金（3名以上の場合のみ表示） */}
          {price.additionalGuestTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t.booking.additionalGuestsDetails} ({price.additionalGuests}{t.booking.guestUnit} × {price.numberOfNights}{t.booking.nights})
              </span>
              <span>{formatCurrency(price.additionalGuestTotal)}</span>
            </div>
          )}

          <Separator className="my-4" />

          {/* 合計金額 */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{t.booking.totalAmount}</span>
            <span className="font-bold text-xl text-primary">{formatCurrency(price.totalAmount)}</span>
          </div>
          <p className="text-xs text-right text-muted-foreground mt-1">{t.booking.taxIncludedSuffix}</p>
        </div>
      </CardContent>
    </Card>
  )
}
