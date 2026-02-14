// 【ファイル概要】
// 選択された日程と人数に基づいて、宿泊料金の計算結果を表示するコンポーネントです。
// 連泊数に応じた単価の変動や、追加人数料金の内訳をユーザーに提示します。

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { calculatePrice, formatCurrency } from '@/lib/booking/pricing'
import { useI18n } from '@/lib/i18n/context'

interface PricingDisplayProps {
  nights: number
  guests: number
}

export function PricingDisplay({ nights, guests }: PricingDisplayProps) {
  const { t } = useI18n()
  
  // 計算実行
  // nights や guests が 0 や NaN の場合、calculatePrice内で安全に処理されるか、
  // ここでガードして表示を制御する
  if (!nights || nights <= 0) return null;

  const price = calculatePrice(nights, guests)

  // NaNチェック
  if (isNaN(price.totalAmount)) return null

  return (
    <Card className="mt-6 border-2 border-primary/10 bg-primary/5">
      <CardContent className="pt-6">
        <h4 className="font-semibold text-lg mb-4">{t.booking.priceDetails}</h4>
        
        <div className="space-y-3 text-sm">
          {/* 基本料金 (単価 × 泊数) */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              {t.booking.baseRate} ({formatCurrency(price.ratePerNight)} × {nights}泊)
            </span>
            <span>{formatCurrency(price.baseTotal)}</span>
          </div>

          {/* 追加人数料金（発生している場合のみ表示） */}
          {price.additionalGuestTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                追加人数 ({price.additionalGuests}名 × {formatCurrency(5000)} × {nights}泊)
              </span>
              <span>{formatCurrency(price.additionalGuestTotal)}</span>
            </div>
          )}

          <Separator className="my-4" />

          {/* 合計 */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{t.booking.total}</span>
            <span className="font-bold text-xl text-primary">
              {formatCurrency(price.totalAmount)}
            </span>
          </div>
          
          <p className="text-xs text-right text-muted-foreground mt-1">
            (税込)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
