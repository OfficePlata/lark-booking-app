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
