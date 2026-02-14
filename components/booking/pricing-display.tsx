// 【ファイル概要】
// 選択された日程と人数に基づいて、宿泊料金の計算結果を表示するコンポーネントです。
// 1泊あたりの単価、泊数、合計金額をユーザーに分かりやすく提示します。


'use client'

import { useMemo } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { calculatePrice, formatCurrency, PRICING } from '@/lib/booking/pricing'
import { cn } from '@/lib/utils'

interface PricingDisplayProps {
  numberOfNights: number
  numberOfGuests: number
  className?: string
}

export function PricingDisplay({ numberOfNights, numberOfGuests, className }: PricingDisplayProps) {
  const { locale, t } = useI18n()

  const pricing = useMemo(() => {
    if (numberOfNights < 1) return null
    return calculatePrice(numberOfNights, numberOfGuests)
  }, [numberOfNights, numberOfGuests])

  if (!pricing) {
    return (
      <div className={cn('bg-card rounded-lg border border-border p-4', className)}>
        <p className="text-muted-foreground text-center">{t.booking.selectDates}</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-card rounded-lg border border-border p-4', className)}>
      <h3 className="font-semibold text-lg text-foreground mb-4">{t.booking.totalAmount}</h3>
      
      {/* Pricing Breakdown */}
      <div className="space-y-3">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-foreground">{t.booking.basePrice}</span>
            <span className="text-muted-foreground text-sm ml-2">
              ({formatCurrency(pricing.ratePerNight, locale)} × {pricing.numberOfNights}{t.booking.nights})
            </span>
          </div>
          <span className="font-medium text-foreground">{formatCurrency(pricing.baseTotal, locale)}</span>
        </div>

        {/* Additional Guest Fee */}
        {pricing.additionalGuests > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <span className="text-foreground">{t.booking.additionalGuest}</span>
              <span className="text-muted-foreground text-sm ml-2">
                ({formatCurrency(PRICING.additionalGuestRate, locale)} × {pricing.additionalGuests}{locale === 'ja' ? '名' : ''} × {pricing.numberOfNights}{t.booking.nights})
              </span>
            </div>
            <span className="font-medium text-foreground">{formatCurrency(pricing.additionalGuestTotal, locale)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg text-foreground">{t.booking.totalAmount}</span>
            <span className="font-bold text-2xl text-primary">{formatCurrency(pricing.totalAmount, locale)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{t.pricing.taxIncluded}</p>
        </div>
      </div>
    </div>
  )
}

export function PricingTable({ className }: { className?: string }) {
  const { locale, t } = useI18n()

  return (
    <div className={cn('bg-card rounded-lg border border-border p-6', className)}>
      <h3 className="font-semibold text-lg text-foreground mb-4">{t.pricing.title}</h3>
      
      {/* Base Rates */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{t.pricing.baseRate}</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-foreground">{t.pricing.night1}</span>
            <span className="font-medium text-foreground">{formatCurrency(PRICING.baseRates[1], locale)}{t.booking.perNight}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-foreground">{t.pricing.night2}</span>
            <span className="font-medium text-foreground">{formatCurrency(PRICING.baseRates[2], locale)}{t.booking.perNight}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border bg-primary/5 -mx-2 px-2 rounded">
            <span className="text-foreground font-medium">{t.pricing.night3plus}</span>
            <span className="font-semibold text-primary">{formatCurrency(PRICING.baseRates[3], locale)}{t.booking.perNight}</span>
          </div>
        </div>
      </div>

      {/* Additional Guest */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{t.pricing.additionalGuest}</h4>
        <div className="flex justify-between items-center py-2">
          <span className="text-foreground">{locale === 'ja' ? '3名様〜' : '3rd guest onwards'}</span>
          <span className="font-medium text-foreground">{formatCurrency(PRICING.additionalGuestRate, locale)}{t.pricing.perNightPerPerson}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">{t.pricing.taxIncluded}</p>
    </div>
  )
}
