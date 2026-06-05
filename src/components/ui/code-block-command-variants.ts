import { cva } from "class-variance-authority"

export const codeBlockCommandVariants = cva(
  "relative overflow-hidden rounded-[9px] border border-border bg-transparent font-mono text-base",
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
