// 【ファイル概要】
// トップページのヒーローセクション（ファーストビュー）コンポーネントです。
// 背景画像、キャッチコピー、予約への誘導ボタン（CTA）を魅力的に表示します。

'use client'

import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function HeroSection() {
  const { t } = useI18n()

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-foreground overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: 'url("https://raw.githubusercontent.com/OfficePlata/lark-booking-app/c011a8e3a3f6f1ed6caefc03101f4c587fc6e54d/public/Stay%20Yokaban_%E8%83%8C%E6%99%AF.svg")',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/40 to-foreground/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-background mb-6 leading-tight text-balance">
          {t.hero.title}
        </h1>
        <p className="text-lg sm:text-xl text-background/80 mb-10 max-w-2xl mx-auto text-pretty">
          {t.hero.subtitle}
        </p>
        <Link href="#booking">
          <Button size="lg" className="text-base px-8 py-6">
            {t.hero.cta}
          </Button>
        </Link>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-background/40 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-background/60 rounded-full" />
        </div>
      </div>
    </section>
  )
}
