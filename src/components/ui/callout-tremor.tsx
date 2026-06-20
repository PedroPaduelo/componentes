/**
 * Tremor Callout [v1.0.0] — banner destacado com ícone + título + texto.
 *
 * Bloco de destaque compacto, similar a um `Alert` shadcn mas com layout
 * horizontal (ícone à esquerda + título + texto à direita) e 5 variants
 * semânticas de cor (default/info/success/warning/error).
 *
 * Adaptado do Tremor Raw (Apache-2.0):
 * https://github.com/tremorlabs/tremor/blob/main/src/components/Callout/Callout.tsx
 *
 * Adaptações para Vitrine UI:
 *   - `"use client"` REMOVIDO (não usamos Next.js).
 *   - `tv()` (tailwind-variants) → `cva` (`callout-tremor-variants.ts`).
 *   - `cx` → `cn` de `@/lib/utils`.
 *   - `forwardRef` REMOVIDO: o Tremor upstream usa forwardRef, mas nenhum
 *     caso de uso da Vitrine (Catálogo, Docs, Composições) precisa de ref
 *     programático num banner de callout. Mantém o componente como função
 *     simples (alinhado com `bar-list-tremor.tsx`).
 *   - `variant: "neutral"` do Tremor → `"info"` (alinhado com a task
 *     `cmqljj9v1030pp30i63l2t8z2` e com a nomenclatura shadcn).
 *   - `icon: React.ElementType | React.ReactElement` → o discriminator
 *     Tremor original (`typeof Icon === "function"`) não cobre SVGs
 *     funcionais modernos (Function Component); usamos `isValidElement`
 *     para discriminar ReactNode vs componente. Quando for ElementType
 *     (ex.: `Info` do lucide), renderizamos `<Icon className="size-5" />`
 *     conforme a task exige.
 *
 * @see https://www.tremor.so/docs/components/callout
 */

import * as React from "react"
import { isValidElement } from "react"

import { cn } from "@/lib/utils"

import {
  calloutTremorVariants,
  type CalloutTremorVariant,
} from "./callout-tremor-variants"

export interface CalloutTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Título em destaque (linha 1, com ícone à esquerda). */
  title: string
  /** Conteúdo secundário (linha 2, abaixo do título). */
  children?: React.ReactNode
  /**
   * Ícone exibido à esquerda do título. Aceita:
   * - um Component (ElementType) — ex.: `Info` do lucide-react
   * - um ReactNode — ex.: `<MyCustomIcon />` ou `<svg>`
   */
  icon?: React.ElementType | React.ReactNode
  /** Cor semântica do banner. Default: `"default"`. */
  variant?: CalloutTremorVariant
}

export function CalloutTremor({
  title,
  icon: Icon,
  className,
  variant,
  children,
  ...props
}: CalloutTremorProps) {
  return (
    <div
      className={cn(calloutTremorVariants({ variant }), className)}
      data-slot="callout-tremor"
      tremor-id="tremor-raw"
      {...props}
    >
      <div className="flex items-start">
        {Icon ? (
          isValidElement(Icon) ? (
            Icon
          ) : (
            (() => {
              const IconComponent = Icon as React.ComponentType<{
                className?: string
                "aria-hidden"?: boolean
              }>
              return (
                <IconComponent
                  className="mr-1.5 size-5 shrink-0"
                  aria-hidden={true}
                />
              )
            })()
          )
        ) : null}
        <span className="font-semibold">{title}</span>
      </div>
      {children ? (
        <div className="mt-2 overflow-y-auto">{children}</div>
      ) : null}
    </div>
  )
}
