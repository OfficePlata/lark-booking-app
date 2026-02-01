'use client'

import { useI18n } from '@/lib/i18n/context'
import { PricingTable } from '@/components/booking/pricing-display'
import { formatCurrency, PRICING } from '@/lib/booking/pricing'

export function PricingSection() {
  const { locale, t } = useI18n()

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ja' 
              ? '連泊でさらにお得に。3連泊以上で最大33%割引。'
              : 'Save more with longer stays. Up to 33% off for 3+ nights.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Main Pricing Card */}
          <PricingTable className="md:col-span-2" />

          {/* Feature Cards */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'ja' ? '含まれるもの' : 'Included'}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">+</span>
                {locale === 'ja' ? '無料Wi-Fi' : 'Free Wi-Fi'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">+</span>
                {locale === 'ja' ? 'アメニティ完備' : 'Full amenities'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">+</span>
                {locale === 'ja' ? '駐車場無料' : 'Free parking'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">+</span>
                {locale === 'ja' ? 'チェックイン15:00 / チェックアウト10:00' : 'Check-in 3PM / Check-out 10AM'}
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'ja' ? 'キャンセルポリシー' : 'Cancellation Policy'}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs shrink-0 mt-0.5">-</span>
                {locale === 'ja' ? '7日前まで: 全額返金' : '7+ days before: Full refund'}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs shrink-0 mt-0.5">-</span>
                {locale === 'ja' ? '3-6日前: 50%返金' : '3-6 days before: 50% refund'}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs shrink-0 mt-0.5">-</span>
                {locale === 'ja' ? '2日前以降: 返金不可' : 'Within 2 days: No refund'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
