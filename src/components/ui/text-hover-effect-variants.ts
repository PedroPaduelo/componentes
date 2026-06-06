import { cva } from "class-variance-authority"

export const textHoverEffectVariants = cva(
  "relative w-full overflow-hidden rounded-lg border border-border bg-background",
  {
    variants: {
      density: {
        compact: "h-32",
        default: "h-40",
        relaxed: "h-56",
      },
    },
    defaultVariants: {
      density: "default",
    },
  }
)
