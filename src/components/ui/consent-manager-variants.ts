import { cva } from "class-variance-authority"

export const consentManagerVariants = cva("", {
  variants: {
    position: {
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
    },
  },
  defaultVariants: {
    position: "bottom-right",
  },
})
