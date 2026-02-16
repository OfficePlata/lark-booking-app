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
import { BASE_CONFIG } from '@/lib/booking/pricing'

const formSchema = z.object({
  guestName: z.string().min(2, { message: 'お名前は2文字以上で入力してください' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  numberOfGuests: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: '人数を選択してください',
  }),
})

export function BookingForm() {
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

  // 予約済み日付と予約不可日を取得し、カレンダーに反映
  useEffect(() => {
    async function loadBookedDates() {
      try {
        // 今日から2年後までの予約済み日付を取得
        const today = new Date()
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 2)
        const start = today.toISOString().split('T')[0]
        const end = futureDate.toISOString().split('T')[0]

        const res = await fetch(`/api/reservations?action=booked-dates&start=${start}&end=${end}`)
        const data = await res.json()
        if (data.bookedDates && Array.isArray(data.bookedDates)) {
          // isBooked: true の日付のみを抽出
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
      toast({ title: "日程を選択してください", variant: "destructive" })
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
      toast({ title: "予約リクエスト完了", description: "確認メールをお送りします。" })
    } catch (error) {
      toast({ title: "エラー", description: "処理中に問題が発生しました", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
        <h3 className="text-2xl font-bold text-green-600 mb-4">予約リクエスト完了</h3>
        <p className="text-muted-foreground mb-6">メールにて決済リンクをお送りします。</p>
        <Button onClick={() => window.location.reload()}>続けて予約する</Button>
      </div>
    )
  }

  const guestOptions = Array.from({ length: BASE_CONFIG.maxGuests }, (_, i) => i + 1)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="text-lg font-medium mb-4">1. 日程の選択</h3>
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
        <h3 className="text-lg font-medium mb-4">2. お客様情報</h3>
        <div className="bg-card rounded-lg border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="guestName" render={({ field }) => (
                  <FormItem><FormLabel>お名前</FormLabel><FormControl><Input placeholder="山田 太郎" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>メールアドレス</FormLabel><FormControl><Input type="email" placeholder="mail@example.com" {...field} /></FormControl><FormDescription>決済リンクを送付します</FormDescription><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="numberOfGuests" render={({ field }) => (
                  <FormItem><FormLabel>宿泊人数</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {guestOptions.map(n => (
                          <SelectItem key={n} value={String(n)}>{n}名</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={!checkIn || !checkOut || isLoading}>
                  {isLoading ? '送信中...' : '予約リクエストを送信'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
