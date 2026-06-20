/**
 * Variants do ProgressCircleTremor.
 *
 * Separado em arquivo `.ts` (não `.tsx`) para satisfazer
 * `react-refresh/only-export-components` do ESLint: este arquivo exporta
 * apenas constantes e tipos auxiliares, sem JSX.
 *
 * Mapeamento das 5 variants do Tremor ProgressCircle → classes Tailwind
 * literais (NÃO interpolar — Tailwind v4 não detecta classes dinâmicas).
 *
 * Como `cva()` não suporta `slots` (recurso do `tv()` do Tremor), usamos
 * dois helpers `cva` separados, um para cada "slot" (background e circle),
 * e os empacotamos em um objeto `progressCircleTremorVariants` que
 * preserva a API original do Tremor (`variants({ variant })` →
 * `{ background, circle }`).
 */

import { cva, type VariantProps } from "class-variance-authority"

const progressCircleTremorBackgroundVariants = cva("", {
  variants: {
    variant: {
      default: "stroke-blue-200 dark:stroke-blue-500/30",
      neutral: "stroke-gray-200 dark:stroke-gray-500/40",
      warning: "stroke-yellow-200 dark:stroke-yellow-500/30",
      error: "stroke-red-200 dark:stroke-red-500/30",
      success: "stroke-emerald-200 dark:stroke-emerald-500/30",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const progressCircleTremorCircleVariants = cva("", {
  variants: {
    variant: {
      default: "stroke-blue-500 dark:stroke-blue-500",
      neutral: "stroke-gray-500 dark:stroke-gray-500",
      warning: "stroke-yellow-500 dark:stroke-yellow-500",
      error: "stroke-red-500 dark:stroke-red-500",
      success: "stroke-emerald-500 dark:stroke-emerald-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

/**
 * Função que devolve as classes dos 2 slots (background + circle) a partir
 * da variant. Preserva a API `{ background, circle }` do Tremor original
 * (que usava `tv({ slots: { background, circle } })`).
 */
export const progressCircleTremorVariants = (
  props: VariantProps<typeof progressCircleTremorBackgroundVariants> = {},
): { background: string; circle: string } => ({
  background: progressCircleTremorBackgroundVariants(props),
  circle: progressCircleTremorCircleVariants(props),
})

export type ProgressCircleTremorVariant = NonNullable<
  VariantProps<typeof progressCircleTremorBackgroundVariants>["variant"]
>