/**
 * Custom nodes do "Mapa da Documentação" da composição Docs Portal
 * (React Flow / @xyflow/react).
 *
 * Três tipos visuais, todos tematizados com tokens shadcn:
 *  - `docRoot`  — pílula central com `bg-primary` (o portal inteiro).
 *  - `docGroup` — card de seção (Começando, Componentes, Fundamentos) com ícone,
 *    ponto de cor do ramo e contagem de páginas.
 *  - `docPage`  — card de página com ícone, título e badge. A página ATUAL
 *    (`data.active`) ganha `ring-2 ring-primary` para se destacar no mapa.
 *
 * A navegação (clicar num nó de página) é tratada pela composição via
 * `onNodeClick` do ReactFlow — por isso os nós não carregam callbacks no `data`.
 * Exporta SÓ componentes + tipos para respeitar `react-refresh/only-export-components`.
 */
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { FileCode2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Cores de ramo por seção (decorativas — não são tokens de tema). */
export type DocMapGroupColor =
  | "sky"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "teal"

export type DocRootNodeData = {
  /** Nome do portal exibido na raiz. */
  label: string
}

export type DocGroupNodeData = {
  /** Nome da seção. */
  label: string
  /** Cor do ramo da seção. */
  color: DocMapGroupColor
  /** Ícone da seção (mesmo da sidebar). */
  icon: LucideIcon
  /** Quantidade de páginas na seção. */
  count: number
}

export type DocPageNodeData = {
  /** Título da página. */
  label: string
  /** Selo/categoria da página. */
  badge: string
  /** Cor do ramo herdada da seção. */
  color: DocMapGroupColor
  /** `true` quando esta é a página atualmente aberta na vista "doc". */
  active: boolean
}

export type DocRootNodeType = Node<DocRootNodeData, "docRoot">
export type DocGroupNodeType = Node<DocGroupNodeData, "docGroup">
export type DocPageNodeType = Node<DocPageNodeData, "docPage">
export type DocMapNodeType =
  | DocRootNodeType
  | DocGroupNodeType
  | DocPageNodeType

/** Classe do ponto de cor do ramo (literais — sem interpolação Tailwind). */
const DOT: Record<DocMapGroupColor, string> = {
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
}

const HANDLE_CLASS =
  "!size-2 !border !border-background !bg-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100"

export function DocRootNode({ data }: NodeProps<DocRootNodeType>) {
  return (
    <div
      data-slot="docmap-node"
      data-kind="root"
      className="group flex items-center gap-2 rounded-2xl border border-transparent bg-primary px-5 py-3 text-primary-foreground shadow-md"
    >
      <span className="flex size-6 items-center justify-center rounded-md bg-primary-foreground/15">
        <FileCode2 className="size-3.5" />
      </span>
      <p className="text-sm font-semibold leading-tight">{data.label}</p>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </div>
  )
}

export function DocGroupNode({ data }: NodeProps<DocGroupNodeType>) {
  const Icon = data.icon
  return (
    <div
      data-slot="docmap-node"
      data-kind="group"
      className="group flex min-w-[10rem] items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-card-foreground shadow-sm transition-colors hover:border-primary/40"
    >
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", DOT[data.color])} />
          <p className="truncate text-sm font-semibold leading-tight">
            {data.label}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {data.count} página{data.count === 1 ? "" : "s"}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </div>
  )
}

export function DocPageNode({ data }: NodeProps<DocPageNodeType>) {
  return (
    <div
      data-slot="docmap-node"
      data-kind="page"
      data-active={data.active ? "true" : "false"}
      className={cn(
        "group flex min-w-[9rem] max-w-[15rem] cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow",
        data.active
          ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "border-border",
      )}
    >
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md",
          data.active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <FileCode2 className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">{data.label}</p>
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", DOT[data.color])} />
          {data.badge}
        </p>
      </div>
    </div>
  )
}
