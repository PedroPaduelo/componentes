import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"

export function CalendarBasicDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </div>
  )
}

export function CalendarRangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })
  return (
    <div className="flex justify-center">
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        className="rounded-md border"
        numberOfMonths={1}
      />
    </div>
  )
}
