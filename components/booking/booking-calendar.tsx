'use client'

import { useState, useMemo } from 'react'
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

    // Check if date is bookable
    if (isDateInPast(clickedDate)) return
    
    const dateStr = clickedDate.toISOString().split('T')[0]
    if (bookedDatesSet.has(dateStr)) return

    // If no check-in selected, or both are selected, start fresh with check-in
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      onSelectCheckIn(clickedDate)
      onSelectCheckOut(clickedDate) // Reset checkout
      return
    }

    // If check-in is selected but not checkout
    if (selectedCheckIn && !selectedCheckOut) {
      if (clickedDate <= selectedCheckIn) {
        // Clicked before or on check-in, make it new check-in
        onSelectCheckIn(clickedDate)
      } else {
        // Check if any booked dates are in the range
        const hasBookedInRange = Array.from(bookedDatesSet).some(bookedDate => {
          const d = new Date(bookedDate)
          return d > selectedCheckIn && d < clickedDate
        })
        
        if (hasBookedInRange) {
          // Start fresh if there's a booked date in between
          onSelectCheckIn(clickedDate)
        } else {
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

    const dateStr = date.toISOString().split('T')[0]
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
