"use client"

import type { Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar, type CalendarProps } from "@/components/ui/calendar"
import { focusRing } from "@/lib/tremor-utils"

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
        "rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#090E1A]",
        focusRing,
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
          // head/head_cell mais discreto (Tremor: gray-400/gray-600)
          head_cell:
            "w-9 font-medium text-sm sm:text-xs text-center text-gray-400 dark:text-gray-600 pb-2",
          // mês com padding mais generoso
          month: "space-y-4 p-3",
          // nav do shadcn já tem botões outline; só ajusto espaçamento
          nav: "gap-1 flex items-center rounded-full size-full justify-between p-4",
          // dias quadrados size-9, focus z-10
          day: cn(
            "size-9 rounded-sm text-sm focus:z-10",
            "text-gray-900 dark:text-gray-50",
            "hover:bg-gray-200 dark:hover:bg-gray-700",
          ),
          // range middle Tremor
          day_range_middle: cn(
            "rounded-none",
            "aria-selected:bg-gray-100 aria-selected:text-gray-900",
            "dark:aria-selected:bg-gray-900 dark:aria-selected:text-gray-50",
          ),
          day_range_start: "rounded-r-none rounded-l",
          day_range_end: "rounded-l-none rounded-r",
          day_selected: cn(
            "rounded-sm",
            "aria-selected:bg-blue-500 aria-selected:text-white",
            "dark:aria-selected:bg-blue-500 dark:aria-selected:text-white",
          ),
          ...(classNames as Record<string, string> | undefined),
        }}
      />
    </div>
  )
}
CalendarTremor.displayName = "CalendarTremor"

export { CalendarTremor }
export type { Matcher }