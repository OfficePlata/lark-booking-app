import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero-section'
import { GallerySection } from '@/components/sections/gallery-section'
import { BookingSection } from '@/components/sections/booking-section'
import { PricingSection } from '@/components/sections/pricing-section'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'STAY YOKABAN',
  alternateName: 'ステイヨカバン',
  description: '鹿児島の民泊施設 STAY YOKABAN',
  url: 'https://stay-yokaban.33l.jp/',
  address: {
    '@type': 'PostalAddress',
    addressRegion: '鹿児島県',
    addressCountry: 'JP',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <Header />
        <HeroSection />
        <GallerySection />
        <BookingSection />
        <PricingSection />
        <Footer />
      </main>
    </>
  )
}
