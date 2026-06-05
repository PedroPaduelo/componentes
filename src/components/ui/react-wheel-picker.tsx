import * as React from "react"
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
  type WheelPickerValue,
} from "@ncdai/react-wheel-picker"
import "@ncdai/react-wheel-picker/dist/style.css"
import { type VariantProps } from "class-variance-authority"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"
import { reactWheelPickerVariants } from "@/components/ui/react-wheel-picker-variants"

// ─── Tipos públicos ────────────────────────────────────────────────

export type ReactWheelPickerDensity = "compact" | "default" | "relaxed"

export type ReactWheelPickerProps<T extends WheelPickerValue = string> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof reactWheelPickerVariants> & {
    /**
     * Array de opções para o picker.
     * Cada opção tem `value`, `label`, opcional `textValue` e `disabled`.
     */
    options: WheelPickerOption<T>[]

    /** Valor selecionado (controlled). */
    value?: T

    /** Valor inicial quando uncontrolled. */
    defaultValue?: T

    /** Callback disparado quando o valor muda. */
    onValueChange?: (value: T) => void

    /** Habilita scroll infinito. @default false */
    infinite?: boolean

    /** Número de opções visíveis no anel (múltiplo de 4). @default 8 */
    visibleCount?: number

    /** Sensibilidade do drag (maior = mais sensível). @default 1 */
    dragSensitivity?: number

    /** Sensibilidade do scroll (maior = mais sensível). @default 1 */
    scrollSensitivity?: number

    /** Altura de cada item em pixels. @default 32 */
    optionItemHeight?: number
  }

// ─── Componente ────────────────────────────────────────────────────

function ReactWheelPicker<T extends WheelPickerValue = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  infinite,
  visibleCount,
  dragSensitivity,
  scrollSensitivity,
  optionItemHeight,
  density,
  variant,
  className,
  ...hostProps
}: ReactWheelPickerProps<T>) {
  const { resolvedTheme } = useTheme()

  return (
    <div
      data-slot="react-wheel-picker"
      data-density={density ?? "default"}
      data-theme={resolvedTheme}
      style={{ colorScheme: resolvedTheme }}
      className={cn(
        reactWheelPickerVariants({ density, variant, className })
      )}
      {...hostProps}
    >
      <WheelPickerWrapper>
        <WheelPicker
          options={options}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          infinite={infinite}
          visibleCount={visibleCount}
          dragSensitivity={dragSensitivity}
          scrollSensitivity={scrollSensitivity}
          optionItemHeight={optionItemHeight}
        />
      </WheelPickerWrapper>
    </div>
  )
}

export { ReactWheelPicker }
