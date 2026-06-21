"use client"

import type { Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar, type CalendarProps } from "@/components/ui/calendar"

export type CalendarTremorProps = {
  /** Modo de seleção: data única (default) ou intervalo. */
  mode?: "single" | "range"
  /** Data selecionada (modo "single") ou intervalo (modo "range"). */
  selected?: Date | { from: Date; to?: Date }
  /** Callback disparado quando a seleção muda. */
  onSelect?: (
    value: Date | { from: Date; to?: Date } | undefined,
  ) => void
  /** Locale BCP-47 (ex.: "pt-BR"). */
  locale?: import("date-fns").Locale
  /** Quantidade de meses renderizados lado a lado. */
  numberOfMonths?: number
  /**
   * Mantido na API para compatibilidade semântica com a API do Tremor original.
   * A integração via `Calendar` shadcn não consome este prop — para limitar
   * navegação por ano na v9 do `react-day-picker`, use `startMonth`/`endMonth`.
   */
  enableYearNavigation?: boolean
  /** Mantido na API p/ compat; use `disabled` para bloquear dias. */
  disableNavigation?: boolean
  /** Dias a desabilitar (Matcher do react-day-picker). */
  disabled?: Matcher | Matcher[]
  /** Dia inicial da semana (0 = domingo, 1 = segunda). Default: 1. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Classes extras para o container raiz. */
  className?: string
  /** Sobrescrita das classNames internas do DayPicker. */
  classNames?: import("react-day-picker").ClassNames
}

/**
 * Wrapper Tremor-like em torno do `Calendar` shadcn da Vitrine.
 *
 * Aplica o visual canônico Tremor (borda gray-200/gray-800, fundo white/[#090E1A],
 * tipografia gray-900/gray-50, células size-9, anel de foco azul) sem reinventar
 * a integração com `react-day-picker` (que vive no `calendar.tsx`).
 *
 * Mantém `tremor-id="tremor-raw"` para que validadores Playwright possam
 * distinguir do Calendar shadcn padrão.
 */
function CalendarTremor({
  mode = "single",
  selected,
  onSelect,
  weekStartsOn = 1,
  numberOfMonths = 1,
  // Mantidos na API para compat com a API do Tremor original; nossa
  // integração via `Calendar` shadcn não os consome diretamente.
  enableYearNavigation,
  disableNavigation,
  locale,
  disabled,
  className,
  classNames,
}: CalendarTremorProps) {
  void enableYearNavigation
  void disableNavigation
  return (
    <div
      data-slot="calendar-tremor"
      data-tremor-id="tremor-raw"
      className={cn(
        "rounded-md border border-border bg-background",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <Calendar
        {...({
          mode,
          selected,
          onSelect,
          weekStartsOn,
          numberOfMonths,
          locale,
          disabled,
        } as CalendarProps)}
        classNames={{
          // weekday (v8: head_cell) discreto, via token de tema
          weekday:
            "w-9 font-medium text-sm sm:text-xs text-center text-muted-foreground pb-2",
          // mês com padding mais generoso
          month: "flex flex-col gap-4 p-3",
          // dias quadrados size-9 (v9: day = <td>, day_button = <button>)
          day: "relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&[data-selected=true]]:bg-transparent",
          day_button: cn(
            "inline-flex items-center justify-center size-9 rounded-sm text-sm font-normal focus:z-10",
            "text-foreground",
            "transition-colors hover:bg-accent hover:text-accent-foreground",
          ),
          // selecionado: cor primária do tema (segue light/dark)
          selected: cn(
            "rounded-sm",
            "[&>button]:!bg-primary [&>button]:!text-primary-foreground",
            "[&>button:hover]:!bg-primary [&>button:hover]:!text-primary-foreground",
          ),
          // range middle (v8: day_range_middle) via accent do tema
          range_middle: cn(
            "!rounded-none",
            "[&>button]:!bg-accent [&>button]:!text-accent-foreground",
            "[&>button:hover]:!bg-accent [&>button:hover]:!text-accent-foreground",
          ),
          range_start: "!rounded-r-none rounded-l-sm",
          range_end: "!rounded-l-none rounded-r-sm",
          ...(classNames as Record<string, string> | undefined),
        }}
      />
    </div>
  )
}
CalendarTremor.displayName = "CalendarTremor"

export { CalendarTremor }
export type { Matcher }