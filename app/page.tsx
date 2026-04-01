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
  description: '鹿児島市天文館エリアにある民泊。暮らすように泊まる、心地よいプライベート空間。',
  url: 'https://stay-yokaban.33l.jp',
  image: 'https://stay-yokaban.33l.jp/opengraph-image.jpg',
  telephone: '',
  email: 'zundare.hogane017@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '千日町9-23銀座ハイツ506号',
    addressLocality: '鹿児島市',
    addressRegion: '鹿児島県',
    postalCode: '892-0843',
    addressCountry: 'JP',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 31.5897,
    longitude: 130.5571,
  },
  priceRange: '¥16,000〜',
  checkinTime: '15:00',
  checkoutTime: '11:00',
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'キッチン', value: true },
    { '@type': 'LocationFeatureSpecification', name: '洗濯機', value: true },
  ],
  sameAs: ['https://www.instagram.com/017mori'],
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
