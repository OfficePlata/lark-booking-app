'use client'

import { useState, useMemo, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BookingCalendar } from './booking-calendar'
import { PricingDisplay } from './pricing-display'
import { SquarePaymentForm } from './square-payment-form'
import { calculateNights, checkBookingRestriction, validateBookingNights } from '@/lib/booking/restrictions'
import { calculatePrice, formatCurrency } from '@/lib/booking/pricing'
import { cn } from '@/lib/utils'
import { Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react'

type BookingStep = 'select-dates' | 'guest-info' | 'payment' | 'confirmation'

interface BookingFormData {
  checkInDate: Date | null
  checkOutDate: Date | null
  numberOfGuests: number
  guestName: string
  email: string
  phone: string
  notes: string
}

interface ReservationResult {
  reservationId: string
  transactionId?: string
}

export function BookingForm() {
  const { locale, t } = useI18n()
  const [step, setStep] = useState<BookingStep>('select-dates')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservation, setReservation] = useState<ReservationResult | null>(null)

  const [formData, setFormData] = useState<BookingFormData>({
    checkInDate: null,
    checkOutDate: null,
    numberOfGuests: 2,
    guestName: '',
    email: '',
    phone: '',
    notes: '',
  })

  const numberOfNights = useMemo(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      return calculateNights(formData.checkInDate, formData.checkOutDate)
    }
    return 0
  }, [formData.checkInDate, formData.checkOutDate])

  const pricing = useMemo(() => {
    if (numberOfNights > 0) {
      return calculatePrice(numberOfNights, formData.numberOfGuests)
    }
    return null
  }, [numberOfNights, formData.numberOfGuests])

  const restriction = useMemo(() => {
    if (formData.checkInDate) {
      return checkBookingRestriction(formData.checkInDate)
    }
    return null
  }, [formData.checkInDate])

  const validation = useMemo(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      return validateBookingNights(formData.checkInDate, formData.checkOutDate)
    }
    return null
  }, [formData.checkInDate, formData.checkOutDate])

  const canProceedToGuestInfo = useMemo(() => {
    return validation?.isValid === true && numberOfNights > 0
  }, [validation, numberOfNights])

  const canProceedToPayment = useMemo(() => {
    return (
      canProceedToGuestInfo &&
      formData.guestName.trim() !== '' &&
      formData.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
  }, [canProceedToGuestInfo, formData.guestName, formData.email])

  const handleCheckInSelect = useCallback((date: Date) => {
    setFormData(prev => ({ ...prev, checkInDate: date, checkOutDate: null }))
    setError(null)
  }, [])

  const handleCheckOutSelect = useCallback((date: Date) => {
    setFormData(prev => ({ ...prev, checkOutDate: date }))
    setError(null)
  }, [])

  const handleGuestCountChange = useCallback((count: number) => {
    setFormData(prev => ({ ...prev, numberOfGuests: Math.max(1, Math.min(6, count)) }))
  }, [])

  const handleInputChange = useCallback((field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handlePaymentSuccess = useCallback(async (transactionId: string) => {
    setReservation({
      reservationId: `RES-${Date.now()}`,
      transactionId,
    })
    setStep('confirmation')
  }, [])

  const handlePaymentError = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '-'
    return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Render Steps
  if (step === 'confirmation' && reservation) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">{t.confirmation.title}</h2>
          <p className="text-muted-foreground mb-6">{t.confirmation.thankYou}</p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">{t.confirmation.reservationId}</p>
            <p className="text-xl font-mono font-semibold text-foreground">{reservation.reservationId}</p>
          </div>

          <div className="text-left space-y-4 border-t border-border pt-6">
            <h3 className="font-medium text-foreground">{t.confirmation.details}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t.booking.checkIn}</p>
                <p className="font-medium text-foreground">{formatDateDisplay(formData.checkInDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.booking.checkOut}</p>
                <p className="font-medium text-foreground">{formatDateDisplay(formData.checkOutDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.booking.guests}</p>
                <p className="font-medium text-foreground">{formData.numberOfGuests}{t.booking.guestUnit}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.booking.totalAmount}</p>
                <p className="font-medium text-primary">{pricing ? formatCurrency(pricing.totalAmount, locale) : '-'}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6">{t.confirmation.emailSent}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 gap-2">
        {(['select-dates', 'guest-info', 'payment'] as const).map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : index < ['select-dates', 'guest-info', 'payment'].indexOf(step)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {index + 1}
            </div>
            {index < 2 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2',
                  index < ['select-dates', 'guest-info', 'payment'].indexOf(step)
                    ? 'bg-primary/40'
                    : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Step 1: Select Dates */}
      {step === 'select-dates' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <BookingCalendar
              selectedCheckIn={formData.checkInDate}
              selectedCheckOut={formData.checkOutDate}
              onSelectCheckIn={handleCheckInSelect}
              onSelectCheckOut={handleCheckOutSelect}
            />
          </div>

          <div className="space-y-6">
            {/* Date Selection Summary */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t.booking.checkIn}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{formatDateDisplay(formData.checkInDate)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t.booking.checkOut}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{formatDateDisplay(formData.checkOutDate)}</span>
                  </div>
                </div>
              </div>

              {numberOfNights > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {numberOfNights}{t.booking.nightsStay}
                  </p>
                </div>
              )}
            </div>

            {/* Guest Count */}
            <div className="bg-card rounded-lg border border-border p-4">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t.booking.guests}</Label>
              <div className="flex items-center gap-4 mt-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => handleGuestCountChange(formData.numberOfGuests - 1)}
                    disabled={formData.numberOfGuests <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium text-foreground">{formData.numberOfGuests}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => handleGuestCountChange(formData.numberOfGuests + 1)}
                    disabled={formData.numberOfGuests >= 6}
                  >
                    +
                  </Button>
                  <span className="text-muted-foreground ml-2">{t.booking.guestUnit}</span>
                </div>
              </div>
            </div>

            {/* Restriction Warning */}
            {restriction?.isRestricted && validation && !validation.isValid && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">{t.restrictions.shortStayRestricted}</p>
              </div>
            )}

            {/* Pricing */}
            <PricingDisplay numberOfNights={numberOfNights} numberOfGuests={formData.numberOfGuests} />

            {/* Continue Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={() => setStep('guest-info')}
              disabled={!canProceedToGuestInfo}
            >
              {t.common.next}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Guest Information */}
      {step === 'guest-info' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-4">{t.booking.confirmation}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.checkIn}</span>
                  <span className="text-foreground">{formatDateDisplay(formData.checkInDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.checkOut}</span>
                  <span className="text-foreground">{formatDateDisplay(formData.checkOutDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.guests}</span>
                  <span className="text-foreground">{formData.numberOfGuests}{t.booking.guestUnit}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-medium text-foreground">{t.booking.totalAmount}</span>
                  <span className="font-semibold text-primary">{pricing ? formatCurrency(pricing.totalAmount, locale) : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="guestName">{t.booking.guestName} *</Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">{t.booking.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">{t.booking.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">{t.booking.notes}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder={t.booking.notesPlaceholder}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('select-dates')}
                className="flex-1"
              >
                {t.common.back}
              </Button>
              <Button
                onClick={() => setStep('payment')}
                disabled={!canProceedToPayment}
                className="flex-1"
              >
                {t.booking.reserveAndPay}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 'payment' && pricing && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-4">{t.booking.confirmation}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.guestName}</span>
                  <span className="text-foreground">{formData.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.email}</span>
                  <span className="text-foreground">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.checkIn}</span>
                  <span className="text-foreground">{formatDateDisplay(formData.checkInDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.checkOut}</span>
                  <span className="text-foreground">{formatDateDisplay(formData.checkOutDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.booking.guests}</span>
                  <span className="text-foreground">{formData.numberOfGuests}{t.booking.guestUnit}</span>
                </div>
              </div>
            </div>

            <PricingDisplay numberOfNights={numberOfNights} numberOfGuests={formData.numberOfGuests} />
          </div>

          <div className="space-y-4">
            <SquarePaymentForm
              amount={pricing.totalAmount}
              guestName={formData.guestName}
              email={formData.email}
              checkInDate={formData.checkInDate!.toISOString()}
              checkOutDate={formData.checkOutDate!.toISOString()}
              numberOfGuests={formData.numberOfGuests}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('guest-info')}
              className="w-full"
            >
              {t.common.back}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
