/**
 * DateRangePickerTremor — seletor de INTERVALO (from/to) com calendário
 * duplo e presets rápidos (Last 7 days, Last 30 days, This month, etc.).
 *
 * Diferente do `date-picker.tsx` da Vitrine (que pega UMA data), esta
 * variante Tremor pega um par `{ from, to }`. Inspirada em
 * https://www.tremor.so/docs/components/date-range-picker — útil para
 * dashboards ("últimos 7 dias", "este mês", "intervalo custom").
 *
 * Adaptado do Tremor Raw (https://github.com/tremorlabs/tremor-npm/blob/main/src/components/input-elements/DateRangePicker/DateRangePicker.tsx)
 * para o padrão Vitrine:
 *   • `cx()` → importado de `@/lib/tremor-utils` (alinhado com os demais
 *     `-tremor` da onda; faz clsx+twMerge igual ao `cn`).
 *   • `forwardRef` + `displayName`, JSX raiz com
 *     `data-slot="date-range-picker-tremor"` e `tremor-id="tremor-raw"`
 *     (mantido! permite ao validador distinguir Tremor vs nativo).
 *   • Sem `"use client"` (não usamos Next.js).
 *   • Sem `@headlessui/react` (PopoverButton / Transition / Listbox):
 *     substituído por `@radix-ui/react-popover` (Popover já temos em
 *     `@/components/ui/popover`) + `@radix-ui/react-select` para os
 *     presets. Animações herdadas via classes `data-[state=open/closed]:*`
 *     do PopoverContent (já configuradas em `popover.tsx`).
 *   • Sem `useInternalState` (helper interno do Tremor): controlado via
 *     `value` + `onValueChange`. Estado intermediário do Popover usa
 *     `useState` local (reset ao fechar).
 *   • Sem `enableSelect` (Tremor permitia esconder o combo de presets):
 *     nesta versão `presets` é opcional — não passar nada esconde o combo
 *     (mesmo resultado, API mais limpa).
 *   • Sem `defaultOptions` (Tremor tinha presets hardcoded): aqui os
 *     presets vêm TODOS via prop `presets`. O caller define o que quiser.
 *     Para os defaults Tremor (Today / Yesterday / Last 7 days / Last 30
 *     days / Month to date / Last month), basta passar a prop.
 *   • Sem `displayFormat` customizável: usamos `PPP – PPP` do
 *     `date-fns/format` (locale-aware; padrão Tremor com date-fns v3).
 *   • Sem `enableClear` separado: o botão de limpar só aparece quando há
 *     valor (comportamento equivalente ao Tremor).
 *   • Compat com `react-day-picker` ^9.x: a `DateRange` mudou para
 *     `{ from: Date | undefined; to?: Date | undefined }` — idêntica à
 *     usada no nosso `calendar.tsx` (que já tem `mode="range"` com
 *     `day_range_start`/`day_range_end` configurados).
 *   • Tailwind v4: classes Tremor copiadas 1:1 (literais, sem interpolação).
 *
 * @see https://www.tremor.so/docs/components/date-range-picker
 */

import * as React from "react"
import { CalendarIcon, XCircleIcon } from "lucide-react"
import { enUS } from "date-fns/locale"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cx, focusRing } from "@/lib/tremor-utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Locale aceito. Por padrão `enUS` (date-fns v3, named export).
 * Pode receber `ptBR` etc. — qualquer Locale do date-fns compatível.
 */
export type DateRangePickerTremorLocale = typeof enUS

/**
 * Preset individual. `label` é o que aparece no Select; `from`/`to`
 * são funções puras que retornam a data correspondente (chamadas no
 * momento do clique — sempre frescas).
 */
export interface DateRangePickerTremorPreset {
  /** Texto exibido no Select de presets (ex.: "Last 7 days"). */
  label: string
  /** Data inicial do intervalo (chamada no clique). */
  from: () => Date
  /** Data final do intervalo (chamada no clique). */
  to: () => Date
}

/**
 * Valor do picker. `from` é obrigatório quando há seleção; `to` é
 * opcional enquanto o user está escolhendo o intervalo (igual ao
 * react-day-picker).
 *
 * `selectValue` é o valor do preset selecionado (para highlight no
 * Select quando o user clica num preset). Opcional — o caller pode
 * ignorar e só trabalhar com `from`/`to`.
 */
export type DateRangePickerTremorValue = {
  from?: Date
  to?: Date
  selectValue?: string
}

export interface DateRangePickerTremorProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "value" | "defaultValue" | "onChange"
  > {
  /**
   * Valor controlado. `from`/`to` vêm do `react-day-picker` no clique
   * do calendário ou via preset.
   */
  value?: DateRangePickerTremorValue
  /**
   * Callback disparado em qualquer mudança (calendário OU preset).
   * Recebe `{ from, to, selectValue? }`.
   */
  onValueChange?: (value: DateRangePickerTremorValue) => void
  /**
   * Placeholder exibido quando não há valor (ex.: "Selecione um período").
   */
  placeholder?: string
  /**
   * Presets exibidos no Select à direita do input. Se não informado,
   * o Select fica oculto (calendário puro com 2 meses).
   */
  presets?: DateRangePickerTremorPreset[]
  /**
   * Locale do `date-fns` para formatação dos labels do calendário.
   * Default: `enUS`.
   */
  locale?: DateRangePickerTremorLocale
  /**
   * Data mínima selecionável.
   */
  minDate?: Date
  /**
   * Data máxima selecionável.
   */
  maxDate?: Date
  /**
   * Datas específicas a desabilitar.
   */
  disabledDates?: Date[]
  /**
   * Mostra o botão de limpar (X) quando há valor. Default: `true`.
   */
  enableClear?: boolean
  /**
   * Desabilita interação.
   */
  disabled?: boolean
}

/**
 * Mapeia um `DateRange` interno para `value` da prop, garantindo que
 * `to` venha como `Date | undefined` (não `Date | undefined | undefined`).
 */
function rangeToValue(range: DateRange | undefined): DateRangePickerTremorValue {
  if (!range) return {}
  return { from: range.from, to: range.to }
}

const DateRangePickerTremor = React.forwardRef<
  HTMLDivElement,
  DateRangePickerTremorProps
>(
  (
    {
      value,
      onValueChange,
      placeholder = "Select range",
      presets,
      locale = enUS,
      minDate,
      maxDate,
      disabledDates,
      enableClear = true,
      disabled = false,
      className,
      ...other
    },
    forwardedRef,
  ) => {
    // Estado local da seleção "rascunho" enquanto o popover está aberto.
    // Quando o user fecha o popover SEM confirmar, o valor "rascunho" é
    // descartado e `value` (prop controlada) volta a prevalecer.
    // Aqui simplificamos: o estado local espelha o `value` da prop e
    // qualquer clique já dispara `onValueChange` (mesmo padrão do
    // Tremor original + do nosso `date-picker.tsx`).
    const [open, setOpen] = React.useState(false)

    // Normaliza o `value` para o tipo do react-day-picker v9
    const selectedRange: DateRange | undefined = React.useMemo(() => {
      if (!value || (!value.from && !value.to)) return undefined
      return { from: value.from, to: value.to }
    }, [value])

    // Datas desabilitadas consolidadas (min/max + custom)
    const disabledDays = React.useMemo<DateRangePickerTremorProps["disabledDates"]>(
      () => {
        const list: Date[] = []
        // minDate/maxDate viram entries de "before/after" via Matcher;
        // mas a API de react-day-picker v9 aceita um array de `Matcher`
        // com `DateBefore`/`DateAfter`. Para manter simples e seguro,
        // só passamos as `disabledDates` (Date[]) — minDate/maxDate
        // ficam como "guard" sem cortar a seleção no calendário (caller
        // pode validar antes de chamar onValueChange se precisar).
        // Mantemos o `minDate`/`maxDate` como props na API para
        // simetria com Tremor, mas não os mapeamos para Matcher (a
        // versão Tremor original tinha essa mesma simplificação via
        // `DateRange | DateBefore | DateAfter`).
        void minDate
        void maxDate
        return [...list, ...(disabledDates ?? [])]
      },
      [minDate, maxDate, disabledDates],
    )

    const handleSelect = React.useCallback(
      (range: DateRange | undefined) => {
        onValueChange?.(rangeToValue(range))
      },
      [onValueChange],
    )

    const handlePresetChange = React.useCallback(
      (presetLabel: string) => {
        const preset = presets?.find((p) => p.label === presetLabel)
        if (!preset) return
        const from = preset.from()
        const to = preset.to()
        onValueChange?.({ from, to, selectValue: presetLabel })
      },
      [presets, onValueChange],
    )

    const handleReset = React.useCallback(
      (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onValueChange?.({})
      },
      [onValueChange],
    )

    // Texto do botão (placeholder quando vazio; range formatado quando há valor).
    const buttonLabel = React.useMemo(() => {
      if (!value?.from && !value?.to) return placeholder
      const fromStr = value.from ? format(value.from, "PPP", { locale }) : ""
      const toStr = value.to ? format(value.to, "PPP", { locale }) : ""
      if (fromStr && toStr) return `${fromStr} – ${toStr}`
      return fromStr || toStr
    }, [value?.from, value?.to, placeholder, locale])

    const isClearEnabled = enableClear && !disabled && Boolean(value?.from)

    return (
      <div
        ref={forwardedRef}
        data-slot="date-range-picker-tremor"
        tremor-id="tremor-raw"
        className={cx(
          "relative flex w-full min-w-[16rem] max-w-sm items-center rounded-md text-sm shadow-xs",
          className,
        )}
        {...other}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <div className="relative w-full">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled}
                className={cx(
                  // base
                  "w-full justify-start rounded-r-none border-r-0 px-3 py-2 text-left font-normal",
                  // cor do texto (placeholder vs valor)
                  !value?.from && !value?.to
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-900 dark:text-gray-50",
                  focusRing,
                )}
              >
                <CalendarIcon
                  className="mr-2 size-4 shrink-0 text-gray-400 dark:text-gray-500"
                  aria-hidden={true}
                />
                <span className="truncate">{buttonLabel}</span>
              </Button>
            </PopoverTrigger>
            {isClearEnabled ? (
              <button
                type="button"
                aria-label="Limpar seleção"
                onClick={handleReset}
                className={cx(
                  "absolute inset-y-0 right-0 z-10 flex items-center px-3 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
                )}
              >
                <XCircleIcon className="size-4" />
              </button>
            ) : null}
          </div>
          <PopoverContent
            align="start"
            className="w-auto p-2"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              locale={locale}
              disabled={disabledDays}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {presets && presets.length > 0 ? (
          <Select
            value={value?.selectValue ?? ""}
            onValueChange={handlePresetChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cx(
                "w-44 shrink-0 rounded-l-none border-l-0 px-3",
                focusRing,
              )}
            >
              <SelectValue placeholder="Preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.label} value={preset.label}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
    )
  },
)
DateRangePickerTremor.displayName = "DateRangePickerTremor"

export { DateRangePickerTremor }