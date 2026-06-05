import { cva } from "class-variance-authority"

/**
 * Variantes de ScrollFadeEffect no padrão shadcn/ui.
 *
 * - `variant`: estilo do container externo (default, ghost)
 */
export const scrollFadeEffectVariants = cva(
  "relative w-full overflow-hidden rounded-lg border border-border bg-background text-foreground",
  {
    variants: {
      variant: {
        default: "",
        ghost: "border-transparent bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
