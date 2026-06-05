import { cva } from "class-variance-authority"

export const codeBlockCommandVariants = cva(
  "relative overflow-hidden rounded-lg border border-border bg-muted font-mono text-sm",
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
  },
)
