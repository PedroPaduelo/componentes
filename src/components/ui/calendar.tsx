import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

export type CalendarProps = DayPickerProps

/**
 * Calendário base shadcn/ui.
 *
 * Migrado para a API de classNames do `react-day-picker` v9 (as chaves mudaram
 * por completo em relação à v8: `head_cell` → `weekday`, `cell`/`day` →
 * `day`/`day_button`, `caption` → `month_caption`, `nav_button_*` →
 * `button_previous`/`button_next`, `day_selected` → `selected`,
 * `day_range_*` → `range_*`, etc.). Na v9, modificadores (selected/today/range)
 * são aplicados no `<td>` (Day); por isso estilizamos o botão via `[&>button]`.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption:
          "flex justify-center pt-1 relative items-center h-7 w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 top-1 z-10 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 top-1 z-10 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&[data-selected=true]]:bg-accent"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal"
        ),
        selected: cn(
          "rounded-md",
          "[&>button]:bg-primary [&>button]:text-primary-foreground",
          "[&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground"
        ),
        today:
          "[&:not([data-selected=true])>button]:bg-accent [&:not([data-selected=true])>button]:text-accent-foreground",
        outside: "text-muted-foreground [&>button]:opacity-50",
        disabled: "text-muted-foreground [&>button]:opacity-50",
        range_start: "!rounded-r-none rounded-l-md",
        range_end: "!rounded-l-none rounded-r-md",
        range_middle: cn(
          "!rounded-none",
          "[&>button]:!bg-accent [&>button]:!text-accent-foreground",
          "[&>button:hover]:!bg-accent [&>button:hover]:!text-accent-foreground"
        ),
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="size-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
