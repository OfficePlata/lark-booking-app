'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { PricingDisplay } from './pricing-display'
import { BookingCalendar } from './booking-calendar'
import { SpecialRate } from '@/lib/lark'
import { BASE_CONFIG } from '@/lib/booking/pricing'
import { useI18n } from '@/lib/i18n/context'

const formSchema = z.object({
  guestName: z.string().min(2, { message: 'お名前は2文字以上で入力してください' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  numberOfGuests: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: '人数を選択してください',
  }),
})

export function BookingForm() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [specialRates, setSpecialRates] = useState<SpecialRate[]>([])
  const [bookedDates, setBookedDates] = useState<string[]>([])

  useEffect(() => {
    async function loadRates() {
      try {
        const res = await fetch('/api/rates')
        const data = await res.json()
        if (data.rates && Array.isArray(data.rates)) {
          setSpecialRates(data.rates)
        }
      } catch (e) {
        console.error('Failed to load rates', e)
      }
    }
    loadRates()
  }, [])

  useEffect(() => {
    async function loadBookedDates() {
      try {
        const today = new Date()
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 2)
        const start = today.toISOString().split('T')[0]
        const end = futureDate.toISOString().split('T')[0]

        const res = await fetch(`/api/reservations?action=booked-dates&start=${start}&end=${end}`)
        const data = await res.json()
        if (data.bookedDates && Array.isArray(data.bookedDates)) {
          const dates = data.bookedDates
            .filter((d: { date: string; isBooked: boolean }) => d.isBooked)
            .map((d: { date: string; isBooked: boolean }) => d.date)
          setBookedDates(dates)
        }
      } catch (e) {
        console.error('Failed to load booked dates', e)
      }
    }
    loadBookedDates()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { guestName: '', email: '', numberOfGuests: '2' },
  })

  const numberOfGuestsVal = form.watch('numberOfGuests')
  const numberOfGuests = parseInt(numberOfGuestsVal, 10) || 2

  const handleCheckInSelect = (date: Date) => { setCheckIn(date); setCheckOut(null); }
  const handleCheckOutSelect = (date: Date) => { setCheckOut(date); }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!checkIn || !checkOut) {
      toast({ title: t.booking.selectDatesError, variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: values.guestName,
          email: values.email,
          numberOfGuests: parseInt(values.numberOfGuests, 10),
          checkInDate: format(checkIn, 'yyyy-MM-dd'),
          checkOutDate: format(checkOut, 'yyyy-MM-dd'),
          paymentStatus: 'Pending',
          paymentMethod: 'AirPAY', 
        }),
      })
      if (!response.ok) throw new Error(t.booking.errorMessage)
      setIsSuccess(true)
      toast({ title: t.booking.successTitle, description: t.booking.successMessage })
    } catch (error) {
      toast({ title: t.booking.errorTitle, description: t.booking.errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
        <h3 className="text-2xl font-bold text-green-600 mb-4">{t.booking.requestSuccess}</h3>
        <p className="text-muted-foreground mb-6">{t.booking.requestSuccessDesc}</p>
        <Button onClick={() => window.location.reload()}>{t.booking.continueBooking}</Button>
      </div>
    )
  }

  const guestOptions = Array.from({ length: BASE_CONFIG.maxGuests }, (_, i) => i + 1)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="text-lg font-medium mb-4">{t.booking.step1}</h3>
        <BookingCalendar
          selectedCheckIn={checkIn}
          selectedCheckOut={checkOut}
          onSelectCheckIn={handleCheckInSelect}
          onSelectCheckOut={handleCheckOutSelect}
          bookedDates={bookedDates}
          className="mb-6"
        />
        {checkIn && checkOut && (
          <PricingDisplay 
            checkIn={checkIn} 
            checkOut={checkOut} 
            guests={numberOfGuests} 
            specialRates={specialRates} 
          />
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">{t.booking.step2}</h3>
        <div className="bg-card rounded-lg border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="guestName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.booking.guestNameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.booking.guestNamePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.booking.emailLabel}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t.booking.emailPlaceholder} {...field} />
                    </FormControl>
                    <FormDescription>{t.booking.emailDescription}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField control={form.control} name="numberOfGuests" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.booking.guestsLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guestOptions.map(n => (
                          <SelectItem key={n} value={String(n)}>
                            {n}{locale === 'en' ? (n === 1 ? ' guest' : ' guests') : t.booking.guestsCount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={!checkIn || !checkOut || isLoading}>
                  {isLoading ? t.booking.submitting : t.booking.submitButton}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
