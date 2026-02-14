// 【ファイル概要】
// ユーザーがブラウザ上で操作する「予約フォーム」のコンポーネントです。
// カレンダーでの日付選択、宿泊者情報の入力、APIへの送信処理を行います。
// 数値変換のエラー対策（NaN防止）を追加しています。

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar as CalendarIcon, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { PricingDisplay } from './pricing-display'
import { BookingCalendar } from './booking-calendar'

const formSchema = z.object({
  guestName: z.string().min(2, {
    message: 'お名前は2文字以上で入力してください',
  }),
  email: z.string().email({
    message: '有効なメールアドレスを入力してください',
  }),
  numberOfGuests: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: '人数を選択してください',
  }),
})

export function BookingForm() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: '',
      email: '',
      numberOfGuests: '2', // 初期値を文字列の '2' に設定
    },
  })

  // 泊数の計算 (安全策: checkIn/Outが無い場合は0)
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // フォームの値から人数を数値として取得 (安全策: 変換失敗時は0にする)
  const numberOfGuestsStr = form.watch('numberOfGuests')
  const numberOfGuests = parseInt(numberOfGuestsStr, 10) || 0

  const handleCheckInSelect = (date: Date) => {
    setCheckIn(date)
    setCheckOut(null) // Reset checkout when checkin changes
  }

  const handleCheckOutSelect = (date: Date) => {
    setCheckOut(date)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!checkIn || !checkOut) {
      toast({
        title: "日程を選択してください",
        description: "チェックイン日とチェックアウト日を指定してください。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: values.guestName,
          email: values.email,
          numberOfGuests: parseInt(values.numberOfGuests, 10),
          checkInDate: format(checkIn, 'yyyy-MM-dd'),
          checkOutDate: format(checkOut, 'yyyy-MM-dd'),
          paymentStatus: 'Pending',
          paymentMethod: 'AirPAY', // Indicate AirPAY usage
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '予約の作成に失敗しました')
      }

      setIsSuccess(true)
      toast({
        title: "予約リクエストを受け付けました",
        description: "確認メールをお送りします。決済用リンクよりお支払いをお願いいたします。",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "予約処理中に問題が発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
        <h3 className="text-2xl font-bold text-green-600 mb-4">予約リクエスト完了</h3>
        <p className="text-muted-foreground mb-6">
          ご予約ありがとうございます。<br />
          ご入力いただいたメールアドレス宛に、確認メールと決済用リンク（AirPAY）をお送りいたします。<br />
          お支払いの完了をもって予約確定となります。
        </p>
        <Button onClick={() => window.location.reload()}>
          新しい予約を作成する
        </Button>
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
        
        {/* checkIn と checkOut が両方ある場合のみ表示 */}
        {checkIn && checkOut && (
          <PricingDisplay 
            nights={nights} 
            guests={numberOfGuests} 
          />
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">2. お客様情報</h3>
        <div className="bg-card rounded-lg border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>お名前</FormLabel>
                    <FormControl>
                      <Input placeholder="山田 太郎" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="taro@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      予約確認メールと決済リンクをお送りします
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>宿泊人数</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="人数を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}名
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!checkIn || !checkOut || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    '予約リクエストを送信する'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  ※「予約リクエストを送信する」を押すと、仮予約となります。<br/>
                  後ほど送付されるメールよりAirPAYにてお支払いをお願いいたします。
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
