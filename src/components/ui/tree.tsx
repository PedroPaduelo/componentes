import * as React from "react"
import { FileTree as FileTreeModel } from "@pierre/trees"
import { FileTree as FileTreeReact } from "@pierre/trees/react"
import { type VariantProps } from "class-variance-authority"
import { useTheme } from "@/components/theme/theme-provider"
import { cn } from "@/lib/utils"
import { treeVariants } from "@/components/ui/tree-variants"

// ─── Tipos públicos ────────────────────────────────────────────────

export type TreeDensity = "compact" | "default" | "relaxed"

export type TreeProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof treeVariants> & {
    /**
     * Lista de paths que formam a árvore.
     * Ex.: ["src/index.ts", "src/lib/utils.ts", "src/components/ui/button.tsx"]
     */
    data: readonly string[]

    /** Cabeçalho opcional renderizado acima da árvore. */
    header?: React.ReactNode

    /**
     * Nível de expansão inicial.
     * - `"closed"`: tudo fechado
     * - `"open"`: tudo aberto
     * - `number`: expande até N níveis de profundidade
     * @default "open"
     */
    initialExpansion?: "closed" | "open" | number

    /** Paths a expandir inicialmente (se `initialExpansion` não for "open"). */
    initialExpandedPaths?: readonly string[]

    /** Habilita busca na árvore. */
    search?: boolean

    /**
     * Ordenação dos itens.
     * @default "default"
     */
    sort?: "default" | false

    /** Habilita drag & drop. */
    dragAndDrop?: boolean

    /** Habilita renomeação in-place. */
    renaming?: boolean

    /** Callback disparado quando a seleção muda. */
    onSelectionChange?: (paths: readonly string[]) => void
  }

// ─── Componente ────────────────────────────────────────────────────

function Tree({
  data,
  header,
  initialExpansion = "open",
  initialExpandedPaths,
  search,
  sort = "default",
  dragAndDrop,
  renaming,
  onSelectionChange,
  density,
  variant,
  className,
  ...hostProps
}: TreeProps) {
  const { resolvedTheme } = useTheme()

  // O modelo FileTree é criado uma vez, quando data muda.
  const model = React.useMemo(() => {
    return new FileTreeModel({
      paths: data,
      initialExpansion:
        initialExpansion === "open"
          ? "open"
          : initialExpansion === "closed"
            ? "closed"
            : initialExpansion,
      initialExpandedPaths: initialExpandedPaths as string[] | undefined,
      sort: sort === "default" ? "default" : undefined,
      search: search === true,
      dragAndDrop: dragAndDrop === true,
      renaming: renaming === true,
    })
  }, [
    data,
    initialExpansion,
    initialExpandedPaths,
    sort,
    search,
    dragAndDrop,
    renaming,
  ])

  // Limpeza ao desmontar
  React.useEffect(() => {
    return () => {
      model.cleanUp()
    }
  }, [model])

  // Sincroniza a seleção externa
  React.useEffect(() => {
    if (!onSelectionChange) return
    const unsub = model.subscribe(() => {
      onSelectionChange(model.getSelectedPaths())
    })
    return unsub
  }, [model, onSelectionChange])

  return (
    <div
      data-slot="tree"
      data-density={density ?? "default"}
      data-theme={resolvedTheme}
      style={{ colorScheme: resolvedTheme }}
      className={cn(treeVariants({ density, variant, className }))}
      {...hostProps}
    >
      <FileTreeReact
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model={model as any}
        header={header}
      />
    </div>
  )
}

export { Tree }
