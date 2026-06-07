import type { Example } from "@/data/examples"
import { CalendarBasicDemo, CalendarRangeDemo } from "@/data/calendar-demo"

const calendarBasicExample: Example = {
  title: "Básico",
  description: "Calendário simples para seleção de uma data única.",
  code: `const [date, setDate] = useState<Date | undefined>(new Date())

return (
  <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-md border"
  />
)`,
  render: <CalendarBasicDemo />,
}

const calendarRangeExample: Example = {
  title: "Intervalo",
  description: "Calendário para seleção de um intervalo de datas.",
  code: `const [range, setRange] = useState<DateRange | undefined>({
  from: new Date(),
  to: new Date(new Date().setDate(new Date().getDate() + 7)),
})

return (
  <Calendar
    mode="range"
    selected={range}
    onSelect={setRange}
    className="rounded-md border"
    numberOfMonths={2}
  />
)`,
  render: <CalendarRangeDemo />,
}

export const examplesCalendar: Record<string, Example[]> = {
  calendar: [calendarBasicExample, calendarRangeExample],
}
