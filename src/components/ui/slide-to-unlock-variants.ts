import { cva } from "class-variance-authority"

export const slideToUnlockVariants = cva(
  "relative w-full overflow-hidden rounded-xl bg-muted p-1 shadow-inner inset-ring-1 inset-ring-foreground/10",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        destructive: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
