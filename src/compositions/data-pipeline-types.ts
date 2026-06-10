/**
 * Tipos, datasets e o MOTOR de transformação de dados da composição
 * "Data Pipeline" (data-pipeline).
 *
 * Fica num módulo `.ts` separado (sem componentes) para que os custom nodes
 * (data-pipeline-nodes.tsx) e a composição (data-pipeline.tsx) compartilhem as
 * constantes/funções sem violar `react-refresh/only-export-components`.
 *
 * O pipeline opera sobre TABELAS (array de objetos). Cada nó transforma a
 * tabela do seu nó de entrada com uma operação pura em JS (filter/group/sort) e
 * passa adiante. `computeGraph` avalia o grafo em ordem topológica a partir do
 * `source` até o `chart`, que plota a tabela final. Estilo Datablocks.
 */
import type { Node } from "@xyflow/react"

/* -------------------------------------------------------------------------- */
/*  Tabela                                                                    */
/* -------------------------------------------------------------------------- */

/** Valor de célula (texto ou número). */
export type Cell = string | number
/** Uma linha = objeto coluna→valor. */
export type Row = Record<string, Cell>
/** Resultado de uma etapa: tabela + colunas conhecidas. */
export type Table = {
  columns: string[]
  rows: Row[]
}

/** Resultado de avaliação de um nó: tabela ou um aviso (input inválido). */
export type NodeResult = {
  table: Table | null
  warning?: string
}

const EMPTY_TABLE: Table = { columns: [], rows: [] }

/* -------------------------------------------------------------------------- */
/*  Datasets embutidos (determinísticos, sem fetch)                           */
/* -------------------------------------------------------------------------- */

export type DatasetId = "sales" | "traffic"

export type DatasetMeta = {
  id: DatasetId
  label: string
  hint: string
  table: Table
}

const SALES_ROWS: Row[] = [
  { region: "Sul", product: "Notebook", month: "Jan", units: 42, revenue: 168000 },
  { region: "Sul", product: "Monitor", month: "Jan", units: 88, revenue: 79200 },
  { region: "Sudeste", product: "Notebook", month: "Jan", units: 120, revenue: 480000 },
  { region: "Sudeste", product: "Teclado", month: "Jan", units: 210, revenue: 31500 },
  { region: "Nordeste", product: "Monitor", month: "Jan", units: 64, revenue: 57600 },
  { region: "Sul", product: "Notebook", month: "Fev", units: 51, revenue: 204000 },
  { region: "Sudeste", product: "Monitor", month: "Fev", units: 96, revenue: 86400 },
  { region: "Sudeste", product: "Notebook", month: "Fev", units: 134, revenue: 536000 },
  { region: "Nordeste", product: "Teclado", month: "Fev", units: 180, revenue: 27000 },
  { region: "Norte", product: "Monitor", month: "Fev", units: 38, revenue: 34200 },
  { region: "Sul", product: "Teclado", month: "Mar", units: 240, revenue: 36000 },
  { region: "Sudeste", product: "Notebook", month: "Mar", units: 158, revenue: 632000 },
  { region: "Nordeste", product: "Notebook", month: "Mar", units: 72, revenue: 288000 },
  { region: "Norte", product: "Monitor", month: "Mar", units: 45, revenue: 40500 },
  { region: "Centro-Oeste", product: "Monitor", month: "Mar", units: 53, revenue: 47700 },
  { region: "Centro-Oeste", product: "Teclado", month: "Mar", units: 130, revenue: 19500 },
]

const TRAFFIC_ROWS: Row[] = [
  { channel: "Orgânico", device: "Desktop", day: "Seg", visits: 1820, signups: 64 },
  { channel: "Orgânico", device: "Mobile", day: "Seg", visits: 2740, signups: 58 },
  { channel: "Pago", device: "Desktop", day: "Seg", visits: 980, signups: 91 },
  { channel: "Social", device: "Mobile", day: "Seg", visits: 1510, signups: 33 },
  { channel: "Orgânico", device: "Desktop", day: "Ter", visits: 2010, signups: 77 },
  { channel: "Pago", device: "Mobile", day: "Ter", visits: 1240, signups: 102 },
  { channel: "Social", device: "Desktop", day: "Ter", visits: 870, signups: 21 },
  { channel: "E-mail", device: "Mobile", day: "Ter", visits: 640, signups: 48 },
  { channel: "Orgânico", device: "Mobile", day: "Qua", visits: 3120, signups: 69 },
  { channel: "Pago", device: "Desktop", day: "Qua", visits: 1100, signups: 95 },
  { channel: "Social", device: "Mobile", day: "Qua", visits: 1680, signups: 40 },
  { channel: "E-mail", device: "Desktop", day: "Qua", visits: 720, signups: 55 },
]

function tableFrom(rows: Row[]): Table {
  return { columns: rows.length > 0 ? Object.keys(rows[0]) : [], rows }
}

export const DATASETS: Record<DatasetId, DatasetMeta> = {
  sales: {
    id: "sales",
    label: "Vendas por região",
    hint: "16 linhas · 5 colunas",
    table: tableFrom(SALES_ROWS),
  },
  traffic: {
    id: "traffic",
    label: "Tráfego do site",
    hint: "12 linhas · 5 colunas",
    table: tableFrom(TRAFFIC_ROWS),
  },
}

export const DATASET_IDS: DatasetId[] = ["sales", "traffic"]

/* -------------------------------------------------------------------------- */
/*  Tipos de nó                                                               */
/* -------------------------------------------------------------------------- */

export type TransformKind = "filter" | "group" | "sort"
export type DataPipeKind = "source" | TransformKind | "chart"

export type FilterOp = ">" | ">=" | "<" | "<=" | "==" | "!=" | "contains"
export type Aggregation = "sum" | "avg" | "count" | "min" | "max"
export type SortDir = "asc" | "desc"

export type DataPipeNodeData = {
  /** Rótulo curto exibido no cabeçalho. */
  label: string
  /** Dataset escolhido (apenas `source`). */
  dataset?: DatasetId
  /** Filtro (apenas `filter`). */
  filterColumn?: string
  filterOp?: FilterOp
  filterValue?: string
  /** Agregação (apenas `group`). */
  groupColumn?: string
  aggColumn?: string
  aggregation?: Aggregation
  /** Ordenação (apenas `sort`). */
  sortColumn?: string
  sortDir?: SortDir
  /** Resultado já calculado desta etapa (preenchido pelo motor). */
  result?: NodeResult | null
}

export type DataPipeNode = Node<DataPipeNodeData, DataPipeKind>

/* -------------------------------------------------------------------------- */
/*  Metadados                                                                 */
/* -------------------------------------------------------------------------- */

export type OpMeta = { label: string; hint: string }

export const OP_META: Record<DataPipeKind, OpMeta> = {
  source: { label: "Dataset", hint: "Origem dos dados" },
  filter: { label: "Filtrar", hint: "Mantém linhas que passam na condição" },
  group: { label: "Agrupar", hint: "Agrupa e agrega por coluna" },
  sort: { label: "Ordenar", hint: "Reordena as linhas" },
  chart: { label: "Gráfico", hint: "Tabela + barras do resultado" },
}

/** Blocos de transformação disponíveis na paleta/menu. */
export const TRANSFORM_KINDS: TransformKind[] = ["filter", "group", "sort"]

export const FILTER_OPS: FilterOp[] = [">", ">=", "<", "<=", "==", "!=", "contains"]
export const AGGREGATIONS: Aggregation[] = ["sum", "avg", "count", "min", "max"]

export const AGG_LABEL: Record<Aggregation, string> = {
  sum: "Soma",
  avg: "Média",
  count: "Contagem",
  min: "Mínimo",
  max: "Máximo",
}

/* -------------------------------------------------------------------------- */
/*  Helpers de coluna                                                         */
/* -------------------------------------------------------------------------- */

export function isNumericColumn(table: Table, column: string): boolean {
  return table.rows.some((r) => typeof r[column] === "number")
}

function toNumber(value: Cell): number {
  return typeof value === "number" ? value : Number(value)
}

export function formatCell(value: Cell): string {
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString("pt-BR")
      : value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
  }
  return value
}

/* -------------------------------------------------------------------------- */
/*  Operações puras sobre a tabela                                            */
/* -------------------------------------------------------------------------- */

function applyFilter(table: Table, data: DataPipeNodeData): NodeResult {
  const col = data.filterColumn
  if (!col || !table.columns.includes(col)) {
    return { table, warning: "Selecione uma coluna válida" }
  }
  const op = data.filterOp ?? ">"
  const raw = data.filterValue ?? ""
  const numericTarget = Number(raw)
  const hasNumber = raw.trim() !== "" && Number.isFinite(numericTarget)

  const rows = table.rows.filter((row) => {
    const cell = row[col]
    if (op === "contains") {
      return String(cell).toLowerCase().includes(raw.toLowerCase())
    }
    if (op === "==") return String(cell) === raw
    if (op === "!=") return String(cell) !== raw
    // operadores de comparação numérica
    if (!hasNumber) return false
    const n = toNumber(cell)
    if (!Number.isFinite(n)) return false
    switch (op) {
      case ">":
        return n > numericTarget
      case ">=":
        return n >= numericTarget
      case "<":
        return n < numericTarget
      case "<=":
        return n <= numericTarget
      default:
        return true
    }
  })
  return { table: { columns: table.columns, rows } }
}

function aggregate(values: number[], agg: Aggregation): number {
  if (agg === "count") return values.length
  if (values.length === 0) return 0
  switch (agg) {
    case "sum":
      return values.reduce((a, b) => a + b, 0)
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length
    case "min":
      return Math.min(...values)
    case "max":
      return Math.max(...values)
    default:
      return 0
  }
}

function applyGroup(table: Table, data: DataPipeNodeData): NodeResult {
  const groupCol = data.groupColumn
  if (!groupCol || !table.columns.includes(groupCol)) {
    return { table, warning: "Selecione a coluna de agrupamento" }
  }
  const agg = data.aggregation ?? "sum"
  const aggCol = data.aggColumn
  const needsValue = agg !== "count"
  if (needsValue && (!aggCol || !table.columns.includes(aggCol))) {
    return { table, warning: "Selecione a coluna do valor" }
  }

  const buckets = new Map<string, number[]>()
  const order: string[] = []
  for (const row of table.rows) {
    const key = String(row[groupCol])
    if (!buckets.has(key)) {
      buckets.set(key, [])
      order.push(key)
    }
    if (needsValue && aggCol) {
      const n = toNumber(row[aggCol])
      if (Number.isFinite(n)) buckets.get(key)?.push(n)
    } else {
      buckets.get(key)?.push(1)
    }
  }

  const valueLabel =
    agg === "count" ? "contagem" : `${agg}_${aggCol ?? ""}`
  const rows: Row[] = order.map((key) => {
    const value = aggregate(buckets.get(key) ?? [], agg)
    return {
      [groupCol]: key,
      [valueLabel]: Number.isInteger(value)
        ? value
        : Math.round(value * 100) / 100,
    }
  })
  return { table: { columns: [groupCol, valueLabel], rows } }
}

function applySort(table: Table, data: DataPipeNodeData): NodeResult {
  const col = data.sortColumn
  if (!col || !table.columns.includes(col)) {
    return { table, warning: "Selecione a coluna de ordenação" }
  }
  const dir = data.sortDir ?? "desc"
  const rows = [...table.rows].sort((a, b) => {
    const av = a[col]
    const bv = b[col]
    let cmp: number
    if (typeof av === "number" && typeof bv === "number") {
      cmp = av - bv
    } else {
      cmp = String(av).localeCompare(String(bv), "pt-BR", { numeric: true })
    }
    return dir === "asc" ? cmp : -cmp
  })
  return { table: { columns: table.columns, rows } }
}

/* -------------------------------------------------------------------------- */
/*  Avaliação do grafo                                                        */
/* -------------------------------------------------------------------------- */

type EdgeLike = { source: string; target: string }

/** Ordenação topológica (Kahn) tolerante a nós isolados/ciclos. */
function topoOrder(nodes: DataPipeNode[], edges: EdgeLike[]): string[] {
  const indeg = new Map<string, number>()
  const adj = new Map<string, string[]>()
  for (const n of nodes) indeg.set(n.id, 0)
  for (const e of edges) {
    if (!indeg.has(e.target) || !indeg.has(e.source)) continue
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1)
    const list = adj.get(e.source) ?? []
    list.push(e.target)
    adj.set(e.source, list)
  }
  const queue: string[] = []
  for (const [id, deg] of indeg) if (deg === 0) queue.push(id)
  const order: string[] = []
  const seen = new Set<string>()
  let guard = 0
  while (queue.length > 0 && guard < nodes.length + edges.length + 10) {
    guard += 1
    const id = queue.shift() as string
    if (seen.has(id)) continue
    seen.add(id)
    order.push(id)
    for (const next of adj.get(id) ?? []) {
      indeg.set(next, (indeg.get(next) ?? 1) - 1)
      if ((indeg.get(next) ?? 0) <= 0) queue.push(next)
    }
  }
  for (const n of nodes) if (!seen.has(n.id)) order.push(n.id)
  return order
}

/** Aplica a operação de um nó de transformação sobre a tabela de entrada. */
export function applyTransform(node: DataPipeNode, input: Table): NodeResult {
  switch (node.type) {
    case "filter":
      return applyFilter(input, node.data)
    case "group":
      return applyGroup(input, node.data)
    case "sort":
      return applySort(input, node.data)
    default:
      return { table: input }
  }
}

/**
 * Avalia todo o pipeline e devolve o `NodeResult` de cada nó. Cada nó consome a
 * saída do seu único nó de entrada (primeira aresta que chega nele).
 */
export function computeGraph(
  nodes: DataPipeNode[],
  edges: EdgeLike[],
): Map<string, NodeResult> {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const inputOf = new Map<string, string>()
  for (const e of edges) {
    if (!inputOf.has(e.target)) inputOf.set(e.target, e.source)
  }

  const out = new Map<string, NodeResult>()
  for (const id of topoOrder(nodes, edges)) {
    const node = byId.get(id)
    if (!node) continue

    if (node.type === "source") {
      const dataset = node.data.dataset ?? "sales"
      out.set(id, { table: DATASETS[dataset].table })
      continue
    }

    const srcId = inputOf.get(id)
    const input = srcId ? out.get(srcId)?.table ?? null : null

    if (!input) {
      out.set(id, { table: null, warning: "Conecte uma entrada" })
      continue
    }

    if (node.type === "chart") {
      out.set(id, { table: input })
      continue
    }

    out.set(id, applyTransform(node, input))
  }
  return out
}

/** Converte uma tabela em CSV (com cabeçalho). */
export function tableToCsv(table: Table): string {
  const escape = (v: Cell): string => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = table.columns.map(escape).join(",")
  const body = table.rows
    .map((row) => table.columns.map((c) => escape(row[c] ?? "")).join(","))
    .join("\n")
  return `${header}\n${body}`
}

/** Tabela vazia reutilizável (defensivo). */
export const emptyTable = (): Table => ({ ...EMPTY_TABLE })
