// 【ファイル概要】
// 予約フォームの本体コンポーネントです。
// カレンダー、人数選択、お客様情報入力、料金表示などを統合し、予約リクエストを送信します。

'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
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
import { useI18n } from '@/lib/i18n/context'

export function BookingForm() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // 特別料金データの状態管理
  const [specialRates, setSpecialRates] = useState<SpecialRate[]>([])

  // Create form schema with translated messages
  const formSchema = z.object({
    guestName: z.string().min(2, { message: t.booking.nameMinLength }),
    email: z.string().email({ message: t.booking.emailInvalid }),
    numberOfGuests: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: t.booking.guestsRequired,
    }),
  })

  // ページ読み込み時に特別料金を取得
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { guestName: '', email: '', numberOfGuests: '2' },
  })

  // 人数を数値として取得（デフォルト2名）
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
      if (!response.ok) throw new Error('予約作成に失敗しました')
      setIsSuccess(true)
      toast({ title: t.booking.requestSuccess, description: t.booking.requestSuccessDesc })
    } catch (error) {
      toast({ title: t.booking.errorTitle, description: t.booking.errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
        <h3 className="text-2xl font-bold text-green-600 mb-4">{t.booking.successTitle}</h3>
        <p className="text-muted-foreground mb-6">{t.booking.successMessage}</p>
        <Button onClick={() => window.location.reload()}>{t.booking.continueBooking}</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="text-lg font-medium mb-4">{t.booking.step1}</h3>
        <BookingCalendar
          selectedCheckIn={checkIn}
          selectedCheckOut={checkOut}
          onSelectCheckIn={handleCheckInSelect}
          onSelectCheckOut={handleCheckOutSelect}
          className="mb-6"
        />
        
        {/* 日程が選択されたら料金表示コンポーネントを表示 */}
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}{t.booking.guestsCount}
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
