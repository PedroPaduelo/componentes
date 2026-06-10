import { Handle, Position, type NodeProps } from "@xyflow/react"

import { cn } from "@/lib/utils"
import type { ShadcnNode } from "@/components/ui/react-flow-types"

/**
 * Node customizado no estilo shadcn: um cartão com `bg-card`/`border-border`,
 * título, descrição e badge opcional. Handles tematizados com `bg-primary`.
 */
function ShadcnCardNode({ data, selected }: NodeProps<ShadcnNode>) {
  return (
    <div
      data-slot="react-flow-node"
      className={cn(
        "min-w-44 max-w-64 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground shadow-sm transition-shadow",
        selected && "ring-2 ring-ring",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2.5 !border-2 !border-background !bg-primary"
      />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight">{data.label}</p>
        {data.badge ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            {data.badge}
          </span>
        ) : null}
      </div>
      {data.description ? (
        <p className="mt-1 text-xs leading-snug text-muted-foreground">
          {data.description}
        </p>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2.5 !border-2 !border-background !bg-primary"
      />
    </div>
  )
}

export { ShadcnCardNode }
