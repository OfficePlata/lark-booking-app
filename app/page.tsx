// 【ファイル概要】
// トップページ（ランディングページ）のメインコンポーネントです。
// ヒーローセクション、料金表、予約フォームなどの主要セクションを統合して表示します。

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero-section'
import { BookingSection } from '@/components/sections/booking-section'
import { PricingSection } from '@/components/sections/pricing-section'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <BookingSection />
      <PricingSection />
      <Footer />
    </main>
  )
}
