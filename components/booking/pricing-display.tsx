'use client'

// ========================================
// 料金表示コンポーネント
// ========================================
//
// 【このファイルの役割】
// 1. PricingDisplay: 予約フォーム内で、選択された日程・人数に基づく料金内訳を表示
// 2. PricingSection: トップページの料金プランカードを表示
//
// 【PricingDisplayの使用箇所】
// - components/booking/booking-form.tsx で使用
// - チェックイン・チェックアウト日が選択された後に表示される
//
// 【PricingSectionの使用箇所】
// - トップページの料金セクションで使用

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { calculatePrice, formatCurrency } from '@/lib/booking/pricing'
import { SpecialRate } from '@/lib/lark'
import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'

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
              {t.booking.baseRate || '宿泊料金'} ({price.numberOfNights}泊)<br/>
              <span className="text-xs opacity-80">
                {hasSpecialRate ? '特別料金適用期間が含まれています' : `通常料金 (${formatCurrency(price.dates[0]?.price || 0)} /泊)`}
              </span>
            </div>
            <span>{formatCurrency(price.baseTotal)}</span>
          </div>

          {/* 追加人数料金（3名以上の場合のみ表示） */}
          {price.additionalGuestTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                追加人数 ({price.additionalGuests}名 × {price.numberOfNights}泊)
              </span>
              <span>{formatCurrency(price.additionalGuestTotal)}</span>
            </div>
          )}

          <Separator className="my-4" />

          {/* 合計金額 */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{t.booking.total}</span>
            <span className="font-bold text-xl text-primary">{formatCurrency(price.totalAmount)}</span>
          </div>
          <p className="text-xs text-right text-muted-foreground mt-1">(税込)</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ========================================
// PricingSection: トップページの料金プランカード
// ========================================

/**
 * 料金プランの定数
 * 
 * 【料金体系】
 * - 基本料金: ¥18,000~/泊（2名様）
 * - 最大2名様まで一棟貸切
 * - 3名様以上は準備中（+¥6,000/名）
 * - 連泊割引: 2泊で¥15,000/泊、3泊以上で¥12,000/泊
 */
const PLANS = [
  {
    name: '基本プラン',
    description: '最大2名様まで一棟貸切',
    price: '¥18,000~',
    unit: '/泊 (2名様)',
    features: [
      '一棟完全貸切',
      'Wi-Fi / 電源完備',
      'キッチン / 調理器具利用可',
      'アメニティ完備',
      '駐車場あり (2台)',
    ],
    buttonText: '予約する',
    href: '#booking',
    popular: true,
  },
]

/**
 * トップページに表示される料金プランセクション
 * 
 * 【表示内容】
 * - 料金プランカード（基本プラン）
 * - 連泊割引の説明
 * - 3名様以上の追加料金の説明（準備中）
 */
export function PricingSection() {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
          宿泊料金
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          シンプルでわかりやすい料金体系。連泊するほどお得になります。
        </p>
      </div>
      
      <div className="grid w-full justify-center gap-8 pt-8 md:grid-cols-1 lg:max-w-3xl lg:mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg relative' : ''}>
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                人気プラン
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm font-semibold text-muted-foreground">{plan.unit}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                {/* 3名様以上は準備中 */}
                <p>※3名様以上は +¥6,000/名（準備中）</p>
                <p>※連泊割引あり（2泊で単価¥15,000、3泊以上で¥12,000）</p>
              </div>
              
              <ul className="mt-8 space-y-3 text-left">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild size="lg">
                <Link href={plan.href}>{plan.buttonText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
