/**
 * Custom node da composição "Database Schema Designer" (React Flow /
 * @xyflow/react).
 *
 * `TableNode` representa uma tabela de banco como um Card shadcn
 * (`bg-card`/`border-border`) com header (ícone + nome da tabela) e uma lista
 * de colunas. Cada coluna é uma linha com: ícone de PK (chave) / FK (link),
 * nome, badge do tipo (`int`/`varchar`/`uuid`/…) e DOIS Handles posicionados
 * na altura da linha — um `target` à esquerda e um `source` à direita — com
 * `id = "<tableId>.<columnName>"`. As relações (edges) ligam o handle da
 * coluna FK de uma tabela ao handle da coluna PK de outra.
 *
 * Exporta SÓ o componente (sem const runtime) para respeitar a regra
 * `react-refresh/only-export-components`. Tipos e constantes de layout vivem em
 * `db-schema-designer-types.ts`; o mapa `nodeTypes` é montado na composição.
 */
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Table2, KeyRound, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ROW_HEIGHT,
  HEADER_HEIGHT,
  TABLE_WIDTH,
  type ColumnType,
  type TableNode as TableNodeType,
} from "@/compositions/db-schema-designer-types"

/** Badge de cor por tipo (literais — sem interpolação Tailwind). */
const TYPE_CLASS: Record<ColumnType, string> = {
  int: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  bigint: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  uuid: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  varchar: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  text: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  bool: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  timestamp: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  date: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  numeric: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  json: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
}

const HANDLE_CLASS = "!size-2.5 !border-2 !border-background !bg-primary"

/** Nó-tabela: header + lista de colunas com handle por linha. */
export function TableNode({ id, data, selected }: NodeProps<TableNodeType>) {
  return (
    <div
      data-slot="table-node"
      data-table={data.name}
      style={{ width: TABLE_WIDTH }}
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all",
        selected && "ring-2 ring-ring",
      )}
    >
      {/* Header */}
      <div
        style={{ height: HEADER_HEIGHT }}
        className="flex items-center gap-2 border-b border-border bg-primary/10 px-3"
      >
        <Table2 className="size-4 shrink-0 text-primary" strokeWidth={2} />
        <span className="truncate text-sm font-semibold">{data.name}</span>
      </div>

      {/* Colunas */}
      <div>
        {data.columns.map((col) => (
          <div
            key={col.name}
            data-slot="table-column"
            data-column={col.name}
            style={{ height: ROW_HEIGHT }}
            className="relative flex items-center gap-2 border-b border-border/60 px-3 last:border-b-0"
          >
            {/* Handle target (esquerda) — destino da relação */}
            <Handle
              id={`${id}.${col.name}`}
              type="target"
              position={Position.Left}
              style={{ top: ROW_HEIGHT / 2 }}
              className={HANDLE_CLASS}
            />

            <span className="flex w-4 shrink-0 justify-center">
              {col.pk ? (
                <KeyRound className="size-3.5 text-amber-500" strokeWidth={2.5} />
              ) : col.fk ? (
                <Link2 className="size-3.5 text-muted-foreground" strokeWidth={2} />
              ) : null}
            </span>

            <span
              className={cn(
                "min-w-0 flex-1 truncate text-xs",
                col.pk ? "font-semibold" : "font-medium",
              )}
            >
              {col.name}
            </span>

            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                TYPE_CLASS[col.type],
              )}
            >
              {col.type}
            </span>

            {/* Handle source (direita) — origem da relação */}
            <Handle
              id={`${id}.${col.name}`}
              type="source"
              position={Position.Right}
              style={{ top: ROW_HEIGHT / 2 }}
              className={HANDLE_CLASS}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
