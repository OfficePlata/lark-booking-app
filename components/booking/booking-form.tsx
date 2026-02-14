// 【ファイル概要】
// ユーザーがブラウザ上で操作する「予約フォーム」のコンポーネントです。
// マウント時に「特別料金」を取得し、PricingDisplayへ渡します。

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

  // マウント時に料金APIを叩く
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/rates')
        const data = await res.json()
        if (data.rates) setSpecialRates(data.rates)
      } catch (e) {
        console.error('Rates fetch failed', e)
      }
    }
    fetchRates()
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
      if (!response.ok) throw new Error('Failed')
      setIsSuccess(true)
      toast({ title: "予約リクエスト完了", description: "確認メールをお送りします。" })
    } catch (error) {
      toast({ title: "エラー", description: "予約処理に失敗しました", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
        <h3 className="text-2xl font-bold text-green-600 mb-4">リクエスト送信完了</h3>
        <Button onClick={() => window.location.reload()}>戻る</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="text-lg font-medium mb-4">1. 日程の選択</h3>
        <BookingCalendar
          selectedCheckIn={checkIn}
          selectedCheckOut={checkOut}
          onSelectCheckIn={handleCheckInSelect}
          onSelectCheckOut={handleCheckOutSelect}
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
                  <FormItem><FormLabel>お名前</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>メールアドレス</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="numberOfGuests" render={({ field }) => (
                  <FormItem><FormLabel>宿泊人数</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{[1,2,3,4,5,6].map(n => <SelectItem key={n} value={String(n)}>{n}名</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              <Button type="submit" className="w-full" disabled={!checkIn || !checkOut || isLoading}>
                {isLoading ? '送信中...' : '予約リクエストを送信'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
