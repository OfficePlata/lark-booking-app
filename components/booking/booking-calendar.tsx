// 【ファイル概要】
// 予約カレンダーのUIコンポーネントです。
// ユーザーがチェックイン・チェックアウト日を選択するためのインターフェースを提供します。
// 予約済み日付の無効化（グレーアウト）や、日付選択ロジックを制御します。

'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'
import { checkBookingRestriction, isDateInPast } from '@/lib/booking/restrictions'

interface BookingCalendarProps {
  selectedCheckIn: Date | null
  selectedCheckOut: Date | null
  onSelectCheckIn: (date: Date) => void
  onSelectCheckOut: (date: Date) => void
  bookedDates?: string[]
  className?: string
}

export function BookingCalendar({
  selectedCheckIn,
  selectedCheckOut,
  onSelectCheckIn,
  onSelectCheckOut,
  bookedDates = [],
  className,
}: BookingCalendarProps) {
  const { locale, t } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const bookedDatesSet = useMemo(() => new Set(bookedDates), [bookedDates])

  const weekDays = locale === 'ja' 
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const monthName = currentMonth.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'long',
  })

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    clickedDate.setHours(0, 0, 0, 0)

    if (isDateInPast(clickedDate)) return
    
    // toISOString() ではなく format() を使ってローカル時間での日付文字列を取得
    const dateStr = format(clickedDate, 'yyyy-MM-dd')

    // 未選択、または両方選択済みの状態（＝新規チェックインを選ぶ）
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      if (bookedDatesSet.has(dateStr)) return // 予約済みの日はチェックイン不可
      onSelectCheckIn(clickedDate)
      return
    }

    // チェックインが選択済みで、チェックアウトを選ぶ状態
    if (selectedCheckIn && !selectedCheckOut) {
      if (clickedDate <= selectedCheckIn) {
        // チェックインより前をクリックした場合：チェックイン日を再設定
        if (bookedDatesSet.has(dateStr)) return
        onSelectCheckIn(clickedDate)
      } else {
        // 間の日が予約済みかチェック
        let hasBookedInRange = false
        let currentDate = new Date(selectedCheckIn)
        currentDate.setDate(currentDate.getDate() + 1)
        
        while (currentDate < clickedDate) {
          if (bookedDatesSet.has(format(currentDate, 'yyyy-MM-dd'))) {
            hasBookedInRange = true
            break
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        if (hasBookedInRange) {
          // 間に予約がある場合は、クリックした日を新しいチェックインにする
          if (bookedDatesSet.has(dateStr)) return
          onSelectCheckIn(clickedDate)
        } else {
          // 間に予約がなければ、チェックアウト日として確定（クリックした日自体が予約済みでもOK）
          onSelectCheckOut(clickedDate)
        }
      }
    }
  }

  const isDateSelected = (day: number): 'check-in' | 'check-out' | 'in-range' | null => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    date.setHours(0, 0, 0, 0)

    if (selectedCheckIn) {
      const checkIn = new Date(selectedCheckIn)
      checkIn.setHours(0, 0, 0, 0)
      
      if (date.getTime() === checkIn.getTime()) {
        return 'check-in'
      }
    }

    if (selectedCheckOut) {
      const checkOut = new Date(selectedCheckOut)
      checkOut.setHours(0, 0, 0, 0)
      
      if (date.getTime() === checkOut.getTime()) {
        return 'check-out'
      }
    }

    if (selectedCheckIn && selectedCheckOut) {
      if (date > selectedCheckIn && date < selectedCheckOut) {
        return 'in-range'
      }
    }

    return null
  }

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    date.setHours(0, 0, 0, 0)

    if (isDateInPast(date)) return true

    // toISOString() ではなく format() を使う
    const dateStr = format(date, 'yyyy-MM-dd')

    // チェックアウト日を選択中の場合
    if (selectedCheckIn && !selectedCheckOut) {
      if (date <= selectedCheckIn) {
        // 過去に戻ってチェックインをやり直せるようにするが、予約済みの日はNG
        return bookedDatesSet.has(dateStr)
      }
      
      // 間の日が予約済みかチェック
      let currentDate = new Date(selectedCheckIn)
      currentDate.setDate(currentDate.getDate() + 1)
      while (currentDate < date) {
        if (bookedDatesSet.has(format(currentDate, 'yyyy-MM-dd'))) {
          return true // 間に予約がある日以降は選べない
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // 間に予約がない場合、date自体が予約済み（他の人のチェックイン日）であっても選択可能！
      return false
    }

    // チェックイン日を選択する場合（通常時）
    return bookedDatesSet.has(dateStr)
  }

  const restriction = useMemo(() => {
    if (selectedCheckIn) {
      return checkBookingRestriction(selectedCheckIn)
    }
    return checkBookingRestriction(new Date())
  }, [selectedCheckIn])

  return (
    <div className={cn('bg-card rounded-lg border border-border p-4', className)}>
      {/* Restriction Notice */}
      {restriction.isRestricted && (
        <div className="mb-4 p-3 bg-accent/50 rounded-lg text-sm text-foreground/80">
          <p className="font-medium">{t.restrictions.title}</p>
          <p>{t.restrictions.message}</p>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium text-foreground">{monthName}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-xs font-medium py-2',
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-muted-foreground'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const disabled = isDateDisabled(day)
          const selected = isDateSelected(day)
          const dayOfWeek = (firstDayOfMonth + i) % 7

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => handleDateClick(day)}
              className={cn(
                'aspect-square flex items-center justify-center text-sm rounded-md transition-colors',
                disabled && 'text-muted-foreground/40 cursor-not-allowed line-through',
                !disabled && !selected && 'hover:bg-accent cursor-pointer',
                selected === 'check-in' && 'bg-primary text-primary-foreground font-medium',
                selected === 'check-out' && 'bg-primary text-primary-foreground font-medium',
                selected === 'in-range' && 'bg-primary/20',
                !disabled && !selected && dayOfWeek === 0 && 'text-red-500',
                !disabled && !selected && dayOfWeek === 6 && 'text-blue-500'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>{t.calendar.selected}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted line-through flex items-center justify-center text-muted-foreground/40">-</div>
          <span>{t.calendar.unavailable}</span>
        </div>
      </div>
    </div>
  )
}
