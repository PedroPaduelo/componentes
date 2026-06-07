import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"

export function DatePickerBasicDemo() {
  const [date, setDate] = useState<Date | undefined>()
  return (
    <div className="w-full max-w-sm">
      <DatePicker
        selected={date}
        onSelect={setDate}
        placeholder="Selecione uma data"
      />
    </div>
  )
}

export function DatePickerWithDefaultDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <div className="w-full max-w-sm">
      <DatePicker
        selected={date}
        onSelect={setDate}
        placeholder="Selecione uma data"
      />
    </div>
  )
}
