// 【ファイル概要】
// 選択された日程と人数、そして「特別料金」に基づいて計算結果を表示します。
// 日ごとに異なる料金（平日、休日、特別日）を合算した正確な内訳を表示します。

// 【重要】components/booking/pricing-display.tsx として保存してください
'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { calculatePrice, formatCurrency } from '@/lib/booking/pricing'
import { SpecialRate } from '@/lib/lark'
import { useI18n } from '@/lib/i18n/context'

interface PricingDisplayProps {
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  specialRates: SpecialRate[]
}

export function PricingDisplay({ checkIn, checkOut, guests, specialRates }: PricingDisplayProps) {
  const { t } = useI18n()
  
  if (!checkIn || !checkOut) return null

  // 料金計算を実行
  const price = calculatePrice(checkIn, checkOut, guests, specialRates)

  // 計算結果が無効な場合は表示しない
  if (!price || price.numberOfNights <= 0) return null

  const hasSpecialRate = price.dates.some(d => d.isSpecialRate)

  return (
    <Card className="mt-6 border-2 border-primary/10 bg-primary/5">
      <CardContent className="pt-6">
        <h4 className="font-semibold text-lg mb-4">{t.booking.priceDetails || '料金内訳'}</h4>
        
        <div className="space-y-3 text-sm">
          {/* 基本料金 */}
          <div className="flex justify-between items-start">
            <div className="text-muted-foreground">
              {t.booking.baseRate || '宿泊料金'} ({price.numberOfNights}泊)<br/>
              <span className="text-xs opacity-80">
                {hasSpecialRate ? (
                  <span className="text-amber-600 font-bold">※特別料金適用期間が含まれています</span>
                ) : (
                  <>基本単価: {formatCurrency(price.ratePerNight || 0)} /泊 (2名様まで)</>
                )}
              </span>
            </div>
            <span className="font-medium">{formatCurrency(price.baseTotal)}</span>
          </div>

          {/* 追加人数料金 */}
          {price.additionalGuestTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                追加人数 ({price.additionalGuests}名 × {price.numberOfNights}泊)
              </span>
              <span>{formatCurrency(price.additionalGuestTotal)}</span>
            </div>
          )}

          <Separator className="my-4" />

          {/* 合計 */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{t.booking.total || '合計'}</span>
            <span className="font-bold text-xl text-primary">
              {formatCurrency(price.totalAmount)}
            </span>
          </div>
          
          <p className="text-xs text-right text-muted-foreground mt-1">(税込)</p>
        </div>
      </CardContent>
    </Card>
  )
}
