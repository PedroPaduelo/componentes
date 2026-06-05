import { cva } from "class-variance-authority"

/**
 * Variantes de árvore (Tree) no padrão shadcn/ui.
 *
 * - `default`: árvore de arquivos com densidade padrão
 * - `compact`: densidade reduzida para telas pequenas
 * - `relaxed`: espaçamento generoso para apresentação
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