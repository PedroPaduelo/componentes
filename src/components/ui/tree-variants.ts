import { cva } from "class-variance-authority"

/**
 * Variantes de árvore (Tree) no padrão shadcn/ui.
 *
 * - `density`: controla o `--trees-item-height` repassado para `@pierre/trees`
 * - `variant`: estilo do container externo (default, ghost)
 *
 * A altura do componente é controlada por `--trees-height` (default 420px)
 * e pode ser sobrescrita via CSS inline (`style={{ "--trees-height": "..." }}`)
 * ou via prop `className`/`style` no componente.
 */
export const treeVariants = cva(
  "relative w-full overflow-hidden rounded-lg border border-border bg-background text-foreground",
  {
    variants: {
      density: {
        compact: "[--trees-item-height:20px]",
        default: "[--trees-item-height:24px]",
        relaxed: "[--trees-item-height:32px]",
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
