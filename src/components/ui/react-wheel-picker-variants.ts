import { cva } from "class-variance-authority"

/**
 * Variantes de WheelPicker no padrão shadcn/ui.
 *
 * - `density`: controla o `--rwp-item-height` (altura de cada item)
 * - `variant`: estilo do container externo (default, ghost)
 *
 * A altura do wrapper é controlada por `--rwp-height` (default 320px)
 * e pode ser sobrescrita via CSS inline ou className/style.
 */
export const reactWheelPickerVariants = cva(
  "relative w-full overflow-hidden rounded-lg border border-border bg-background text-foreground",
  {
    variants: {
      density: {
        compact: "[--rwp-item-height:24px]",
        default: "[--rwp-item-height:32px]",
        relaxed: "[--rwp-item-height:40px]",
      },
      variant: {
        default: "",
        ghost: "border-transparent bg-transparent",
      },
    },
    defaultVariants: {
      density: "default",
      variant: "default",
    },
  }
)
