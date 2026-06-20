/**
 * Tremor Toggle (par 2/2) — `<button>` com `aria-pressed` + variants de cor.
 *
 * DIFERENTE do nosso `toggle.tsx` (Radix `@radix-ui/react-toggle`):
 *   - Sem Radix — botão HTML nativo com estado gerenciado internamente
 *     (`useState` + prop opcional `defaultPressed`/`pressed`/`onPressedChange`).
 *   - Cor semântica aplicada SÓ quando PRESSED (`default`/`success`/`warning`/`error`).
 *     Unpressed sempre usa branco/#090E1A + borda cinza.
 *   - `aria-pressed` reflete o estado para acessibilidade (WAI-ARIA pattern).
 *
 * Adaptado de
 * https://github.com/tremorlabs/tremor/blob/main/src/components/Toggle/Toggle.tsx
 * (Apache-2.0) — versão simplificada para um único botão (sem
 * `ToggleGroup`/`ToggleGroupItem`).
 *
 * Adaptações para Vitrine UI:
 *   - `"use client"` REMOVIDO (não usamos Next.js).
 *   - Sem `@radix-ui/react-toggle` (a AC pede `<button>` nativo com
 *     `aria-pressed`).
 *   - Estado controlado / não-controlado:
 *       - `pressed?: boolean` + `onPressedChange?: (p: boolean) => void`
 *         → modo CONTROLADO.
 *       - `defaultPressed?: boolean` → modo NÃO-CONTROLADO (useState interno).
 *   - Variants em `toggle-tremor-variants.ts` (cva).
 *   - Re-exports centralizados em `toggle-tremor.ts` (barrel — workaround
 *     para `react-refresh/only-export-components`).
 *
 * @see https://www.tremor.so/docs/components/toggle
 */

import * as React from "react"

import { cx as cn, focusRing } from "@/lib/tremor-utils"

import {
  toggleTremorVariants,
  type ToggleTremorVariant,
} from "./toggle-tremor-variants"

export interface ToggleTremorProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "defaultChecked"
  > {
  /** Variante de cor aplicada quando o toggle está PRESSED. */
  variant?: ToggleTremorVariant
  /**
   * Estado controlado (modo CONTROLADO). Quando definido, o componente
   * ignora o estado interno e usa este valor. Use em conjunto com
   * `onPressedChange` para reagir a mudanças.
   */
  pressed?: boolean
  /**
   * Estado inicial (modo NÃO-CONTROLADO). Quando omitido, começa
   * unpressed (`false`).
   */
  defaultPressed?: boolean
  /**
   * Callback disparado sempre que o estado pressed muda (após clique do
   * usuário). Recebe o próximo valor.
   */
  onPressedChange?: (pressed: boolean) => void
}

export function ToggleTremor({
  className,
  variant,
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  type,
  disabled,
  ...props
}: ToggleTremorProps): React.JSX.Element {
  // Estado interno para o modo não-controlado.
  const [internalPressed, setInternalPressed] = React.useState<boolean>(
    defaultPressed,
  )

  // Decide qual valor usar: controlado tem prioridade sobre interno.
  const isControlled = controlledPressed !== undefined
  const pressed = isControlled ? controlledPressed : internalPressed

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    const next = !pressed
    if (!isControlled) {
      setInternalPressed(next)
    }
    onPressedChange?.(next)
    onClick?.(event)
  }

  return (
    <button
      // `type="button"` por padrão para evitar submit acidental em forms.
      type={type ?? "button"}
      data-slot="toggle-tremor"
      data-state={pressed ? "on" : "off"}
      tremor-id="tremor-raw"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        // base
        "inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-xs transition-colors",
        // unpressed: bg branco + borda cinza (FIXO, independente da variant)
        "bg-white dark:bg-[#090E1A]",
        "border-gray-200 dark:border-gray-800",
        "text-gray-700 dark:text-gray-300",
        // hover sutil só no estado unpressed (pressed já tem cor cheia)
        !pressed && "hover:bg-gray-50 dark:hover:bg-[#0E1424]",
        // pressed: cor da variant (sobrepõe bg/border/text do unpressed)
        pressed && toggleTremorVariants({ variant }),
        // disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // focus
        focusRing,
        className,
      )}
      {...props}
    />
  )
}