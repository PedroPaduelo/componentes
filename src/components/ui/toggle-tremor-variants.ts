import { cva, type VariantProps } from "class-variance-authority"

/**
 * ToggleTremor — variants de cor para o estado PRESSED do botão toggle.
 *
 * Estado UNPRESSED é fixo (branco no light / #090E1A no dark com borda
 * cinza) — não há variants para ele, só para o "ligado". Isso casa com
 * a AC da task:
 *
 *   pressed   (default) → `bg-blue-500 text-white`
 *   pressed   (success) → `bg-emerald-500 text-white`
 *   pressed   (warning) → `bg-amber-500 text-white`
 *   pressed   (error)   → `bg-red-500 text-white`
 *   unpressed           → `bg-white dark:bg-[#090E1A]
 *                          border border-gray-200 dark:border-gray-800`
 *
 * Strings literais (NÃO interpolar) — Tailwind v4 não detecta classes
 * em template literals.
 */
export const toggleTremorVariants = cva("", {
  variants: {
    variant: {
      default: ["bg-blue-500 text-white"],
      success: ["bg-emerald-500 text-white"],
      warning: ["bg-amber-500 text-white"],
      error: ["bg-red-500 text-white"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type ToggleTremorVariants = VariantProps<typeof toggleTremorVariants>

/** Variants aceitas (literal union) para uso no types da `ToggleTremorProps`. */
export type ToggleTremorVariant = NonNullable<
  ToggleTremorVariants["variant"]
>