'use client'

import { useI18n } from '@/lib/i18n/context'
import { BookingForm } from '@/components/booking/booking-form'

export function BookingSection() {
  const { t } = useI18n()

  return (
    <section id="booking" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            {t.booking.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.booking.selectDates}
          </p>
        </div>

        <BookingForm />
      </div>
    </section>
  )
}
