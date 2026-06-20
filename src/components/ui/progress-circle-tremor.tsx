/**
 * ProgressCircleTremor — círculo de progresso SVG (variante Tremor).
 *
 * Portado de https://github.com/tremorlabs/tremor (Tremor Raw v3) para a
 * Vitrine UI. Componente de "família alternativa" para o radial-gauge
 * existente (slug `radial-gauge`, arco 270°): este aqui desenha um anel
 * COMPLETO de progresso (360°), com duas circunferências (trilha de fundo
 * + progresso), 5 variants de cor e conteúdo centralizado opcional.
 *
 * Diferenças em relação ao Tremor original:
 * - `tv()` (tailwind-variants) → `cva()` em arquivo separado
 *   (`progress-circle-tremor-variants.ts`).
 * - `cx` do Tremor → `cx` de @/lib/tremor-utils (mesma semântica).
 * - Removido `"use client"` (Vitrine não usa Next.js).
 * - `data-slot="progress-circle-tremor"` no container externo.
 * - Variants separados em `progress-circle-tremor-variants.ts` (regra
 *   `react-refresh/only-export-components` do ESLint).
 */

import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { cx } from "@/lib/tremor-utils"
import {
  progressCircleTremorVariants,
} from "./progress-circle-tremor-variants"

export type ProgressCircleTremorProps = Omit<
  React.SVGProps<SVGSVGElement>,
  "value"
> &
  VariantProps<typeof progressCircleTremorVariants> & {
    /** Valor atual do progresso (0..max). Default: 0. */
    value?: number
    /** Valor máximo da escala. Default: 100. */
    max?: number
    /** Anima a transição do dashoffset. Default: true. */
    showAnimation?: boolean
    /** Raio do círculo em px. Default: 32. */
    radius?: number
    /** Espessura do traço em px. Default: 6. */
    strokeWidth?: number
    /** Conteúdo exibido no centro (ex.: "75%"). */
    children?: React.ReactNode
  }

const ProgressCircleTremor = React.forwardRef<
  SVGSVGElement,
  ProgressCircleTremorProps
>(
  (
    {
      value = 0,
      max = 100,
      radius = 32,
      strokeWidth = 6,
      showAnimation = true,
      variant,
      className,
      children,
      ...props
    }: ProgressCircleTremorProps,
    forwardedRef,
  ) => {
    const safeValue = Math.min(max, Math.max(value, 0))
    const normalizedRadius = radius - strokeWidth / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const offset = circumference - (safeValue / max) * circumference

    const { background, circle } = progressCircleTremorVariants({ variant })
    return (
      <div
        className={cn("relative")}
        role="progressbar"
        aria-label="Progress circle"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        data-max={max}
        data-value={safeValue ?? null}
        data-slot="progress-circle-tremor"
        tremor-id="tremor-raw"
      >
        <svg
          ref={forwardedRef}
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className={cx("-rotate-90 transform", className)}
          {...props}
        >
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            stroke=""
            strokeLinecap="round"
            className={cx("transition-colors ease-linear", background)}
          />
          {safeValue >= 0 ? (
            <circle
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              fill="transparent"
              stroke=""
              strokeLinecap="round"
              className={cx(
                "transition-colors ease-linear",
                circle,
                showAnimation &&
                  "transform-gpu transition-all duration-300 ease-in-out",
              )}
            />
          ) : null}
        </svg>
        <div
          className={cx("absolute inset-0 flex items-center justify-center")}
        >
          {children}
        </div>
      </div>
    )
  },
)
ProgressCircleTremor.displayName = "ProgressCircleTremor"

export { ProgressCircleTremor }