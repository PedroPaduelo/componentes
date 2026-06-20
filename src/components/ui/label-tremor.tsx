/**
 * Tremor Label [v0.0.2] — `<label>` estilizado Tremor Raw.
 *
 * Adaptado de
 * https://github.com/tremorlabs/tremor/blob/main/src/components/Label/Label.tsx
 * (Apache-2.0).
 *
 * Adaptações para Vitrine UI:
 *   - Sem dependência de `@radix-ui/react-label` — a tag `<label>` nativa do
 *     HTML já fornece toda a semântica necessária (associação implícita
 *     por aninhamento ou explícita via `htmlFor`). Isso evita arrastar
 *     `@radix-ui/react-label` como dependência nova só por um wrapper.
 *   - Sem `disabled` no `LabelHTMLAttributes` (HTML `<label>` não tem
 *     `disabled` próprio — quem controla o estado disabled é o input
 *     associado, e a AC pede apenas `htmlFor` + spread). Mantemos a
 *     tipagem nativa do React.
 *   - `cx` → `cn` de `@/lib/utils` (mesma semântica: clsx + tailwind-merge).
 *   - `focusRing` aplicado (consistente com a AC e com o restante dos
 *     wrappers Tremor da Vitrine).
 *
 * @see https://www.tremor.so/docs/components/label
 */

import * as React from "react"

import { cx as cn, focusRing } from "@/lib/tremor-utils"

export type LabelTremorProps = React.LabelHTMLAttributes<HTMLLabelElement>

export function LabelTremor({
  className,
  ...props
}: LabelTremorProps): React.JSX.Element {
  return (
    <label
      data-slot="label-tremor"
      tremor-id="tremor-raw"
      className={cn(
        // base
        "text-sm font-medium leading-none",
        // text color
        "text-gray-900 dark:text-gray-50",
        // focus
        focusRing,
        className,
      )}
      {...props}
    />
  )
}