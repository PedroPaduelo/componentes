/**
 * Custom nodes da composição "Data Pipeline" (React Flow / @xyflow/react).
 *
 * O DIFERENCIAL da tela: os dados fluem por blocos de transformação e o nó
 * `chart` renderiza, AO VIVO, uma tabela + um mini gráfico de barras do
 * resultado final — recalculado quando qualquer bloco muda. Quatro famílias:
 *  - `source`    → só Handle de saída; mostra o dataset e nº de linhas/colunas.
 *  - transformes → Handle de entrada + saída (`filter`/`group`/`sort`); resumem
 *    a operação e quantas linhas saíram.
 *  - `chart`     → só Handle de entrada; tabela + barras (o destaque visual).
 *
 * Cada nó é um Card shadcn (`bg-card`/`border-border`) tematizado light/dark e
 * memoizado. Exporta SÓ componentes (constantes/motor moram em
 * data-pipeline-types.ts) para respeitar `react-refresh/only-export-components`.
 */
import * as React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Database,
  Filter,
  Group,
  ArrowDownUp,
  BarChart3,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AGG_LABEL,
  DATASETS,
  OP_META,
  formatCell,
  isNumericColumn,
  type DataPipeKind,
  type DataPipeNode,
  type Table,
} from "@/compositions/data-pipeline-types"

/* -------------------------------------------------------------------------- */
/*  Ícones por tipo                                                           */
/* -------------------------------------------------------------------------- */

const KIND_ICON: Record<DataPipeKind, LucideIcon> = {
  source: Database,
  filter: Filter,
  group: Group,
  sort: ArrowDownUp,
  chart: BarChart3,
}

const HANDLE_BASE = "!size-3 !border-2 !border-background !bg-primary"

/* -------------------------------------------------------------------------- */
/*  Cabeçalho compartilhado                                                   */
/* -------------------------------------------------------------------------- */

function NodeHeader({ kind, label }: { kind: DataPipeKind; label: string }) {
  const Icon = KIND_ICON[kind]
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{label}</p>
        <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
          {OP_META[kind].label}
        </p>
      </div>
    </div>
  )
}

function WarningRow({ message }: { message: string }) {
  return (
    <div className="mt-2 flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">
      <TriangleAlert className="size-3 shrink-0 text-amber-500" />
      <span className="truncate">{message}</span>
    </div>
  )
}

const shellClass = (selected: boolean | undefined, width: string) =>
  cn(
    "rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition-all",
    width,
    selected ? "border-primary ring-2 ring-ring" : "border-border",
  )

/* -------------------------------------------------------------------------- */
/*  Source                                                                    */
/* -------------------------------------------------------------------------- */

function SourceNodeBase({ data, selected }: NodeProps<DataPipeNode>) {
  const dataset = DATASETS[data.dataset ?? "sales"]
  const table = data.result?.table ?? dataset.table
  return (
    <div
      data-slot="data-pipeline-node"
      data-kind="source"
      className={shellClass(selected, "w-[200px]")}
    >
      <NodeHeader kind="source" label={data.label} />
      <div className="mt-2.5 rounded-md border border-border bg-muted/50 px-2.5 py-2">
        <p className="truncate text-xs font-medium">{dataset.label}</p>
        <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
          {table.rows.length} linhas · {table.columns.length} colunas
        </p>
      </div>
      <Handle type="source" position={Position.Right} className={HANDLE_BASE} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Transformações (filter / group / sort)                                    */
/* -------------------------------------------------------------------------- */

function describeTransform(node: DataPipeNode): string {
  const d = node.data
  switch (node.type) {
    case "filter":
      return d.filterColumn
        ? `${d.filterColumn} ${d.filterOp ?? ">"} ${d.filterValue ?? ""}`
        : "sem condição"
    case "group":
      return d.groupColumn
        ? `${AGG_LABEL[d.aggregation ?? "sum"]}${
            d.aggregation === "count" ? "" : ` de ${d.aggColumn ?? "?"}`
          } por ${d.groupColumn}`
        : "sem agrupamento"
    case "sort":
      return d.sortColumn
        ? `${d.sortColumn} · ${d.sortDir === "asc" ? "crescente" : "decrescente"}`
        : "sem ordenação"
    default:
      return ""
  }
}

function TransformNodeBase({ type, data, selected }: NodeProps<DataPipeNode>) {
  const kind = (type ?? "filter") as DataPipeKind
  const result = data.result
  const rowCount = result?.table?.rows.length ?? 0
  return (
    <div
      data-slot="data-pipeline-node"
      data-kind={kind}
      className={shellClass(selected, "w-[210px]")}
    >
      <Handle type="target" position={Position.Left} className={HANDLE_BASE} />
      <NodeHeader kind={kind} label={data.label} />
      <div className="mt-2.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5">
        <p className="truncate font-mono text-[11px] text-foreground">
          {describeTransform({ type, data } as DataPipeNode)}
        </p>
      </div>
      {result?.warning ? (
        <WarningRow message={result.warning} />
      ) : (
        <p className="mt-2 text-[10px] tabular-nums text-muted-foreground">
          {rowCount} linhas na saída
        </p>
      )}
      <Handle type="source" position={Position.Right} className={HANDLE_BASE} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Chart (output) — tabela + mini gráfico de barras ao vivo                  */
/* -------------------------------------------------------------------------- */

const MAX_BARS = 8
const MAX_TABLE_ROWS = 6

function pickPlotColumns(
  table: Table,
): { labelCol: string; valueCol: string } | null {
  if (table.columns.length === 0 || table.rows.length === 0) return null
  const numeric = table.columns.find((c) => isNumericColumn(table, c))
  if (!numeric) return null
  const label =
    table.columns.find((c) => c !== numeric && !isNumericColumn(table, c)) ??
    table.columns.find((c) => c !== numeric) ??
    table.columns[0]
  return { labelCol: label, valueCol: numeric }
}

function MiniBarChart({ table }: { table: Table }) {
  const plot = pickPlotColumns(table)
  if (!plot) {
    return (
      <p className="py-4 text-center text-[11px] text-muted-foreground">
        Sem coluna numérica para plotar
      </p>
    )
  }
  const rows = table.rows.slice(0, MAX_BARS)
  const values = rows.map((r) => Number(r[plot.valueCol]) || 0)
  const max = Math.max(1, ...values.map((v) => Math.abs(v)))
  return (
    <div
      data-slot="data-pipeline-chart"
      className="flex h-28 items-end gap-1.5 rounded-md border border-border bg-muted/40 p-2"
    >
      {rows.map((row, i) => {
        const value = values[i]
        const pct = Math.max(4, (Math.abs(value) / max) * 100)
        return (
          <div
            key={`${row[plot.labelCol]}-${i}`}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
            title={`${row[plot.labelCol]}: ${formatCell(value)}`}
          >
            <span className="text-[8px] tabular-nums text-muted-foreground">
              {formatCell(value)}
            </span>
            <div
              data-slot="data-pipeline-bar"
              className="w-full rounded-t bg-primary transition-all"
              style={{ height: `${pct}%` }}
            />
            <span className="w-full truncate text-center text-[8px] text-muted-foreground">
              {String(row[plot.labelCol])}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ResultTable({ table }: { table: Table }) {
  const rows = table.rows.slice(0, MAX_TABLE_ROWS)
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-muted/60">
            {table.columns.map((c) => (
              <th
                key={c}
                className="truncate border-b border-border px-2 py-1 text-left font-medium text-muted-foreground"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="even:bg-muted/30">
              {table.columns.map((c) => (
                <td
                  key={c}
                  className="truncate border-b border-border/60 px-2 py-1 tabular-nums"
                >
                  {formatCell(row[c] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChartNodeBase({ data, selected }: NodeProps<DataPipeNode>) {
  const result = data.result
  const table = result?.table
  const hasData = table != null && table.rows.length > 0
  return (
    <div
      data-slot="data-pipeline-node"
      data-kind="chart"
      className={shellClass(selected, "w-[320px]")}
    >
      <Handle type="target" position={Position.Left} className={HANDLE_BASE} />
      <NodeHeader kind="chart" label={data.label} />
      {result?.warning ? (
        <WarningRow message={result.warning} />
      ) : null}
      {hasData ? (
        <div className="mt-2.5 flex flex-col gap-2.5">
          <MiniBarChart table={table} />
          <ResultTable table={table} />
          <p className="text-[10px] tabular-nums text-muted-foreground">
            {table.rows.length} linhas no resultado
          </p>
        </div>
      ) : (
        <p className="mt-3 py-6 text-center text-[11px] text-muted-foreground">
          Conecte uma etapa para ver o resultado
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Exports memoizados                                                        */
/* -------------------------------------------------------------------------- */

export const SourceNode = React.memo(SourceNodeBase)
export const TransformNode = React.memo(TransformNodeBase)
export const ChartNode = React.memo(ChartNodeBase)
