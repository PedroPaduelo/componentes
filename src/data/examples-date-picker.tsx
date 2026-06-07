import type { Example } from "@/data/examples"
import { DatePickerBasicDemo, DatePickerWithDefaultDemo } from "@/data/date-picker-demo"

const datePickerBasicExample: Example = {
  title: "Básico",
  description: "Date picker com popover para seleção de data única.",
  code: `const [date, setDate] = useState<Date | undefined>()

return (
  <DatePicker
    selected={date}
    onSelect={setDate}
    placeholder="Selecione uma data"
  />
)`,
  render: <DatePickerBasicDemo />,
}

const datePickerWithDefaultExample: Example = {
  title: "Com data inicial",
  description: "Date picker pré-preenchido com a data de hoje.",
  code: `const [date, setDate] = useState<Date | undefined>(new Date())

return (
  <DatePicker
    selected={date}
    onSelect={setDate}
    placeholder="Selecione uma data"
  />
)`,
  render: <DatePickerWithDefaultDemo />,
}

export const examplesDatePicker: Record<string, Example[]> = {
  "date-picker": [datePickerBasicExample, datePickerWithDefaultExample],
}
