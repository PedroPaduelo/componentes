import { cva } from "class-variance-authority"

export const chevronsUpDownIconVariants = cva(
  "inline-flex items-center justify-center transition-transform",
  {
    variants: {
      size: {
        sm: "size-3.5",
        default: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)
