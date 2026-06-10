/**
 * Composição "Data Pipeline" (data-pipeline).
 *
 * Pipeline de transformação de dados no estilo Datablocks, construído sobre o
 * React Flow (@xyflow/react) já tematizado da vitrine. O DIFERENCIAL (o "wow"):
 * os dados fluem por blocos de transformação (filtrar, agrupar, ordenar) e o nó
 * final renderiza uma TABELA + um MINI GRÁFICO DE BARRAS recalculado AO VIVO
 * quando qualquer bloco muda (parâmetro, dataset ou topologia).
 *
 *  - Canvas central <ReactFlow> (dentro de <ReactFlowProvider>) com Background
 *    pontilhado, Controls e MiniMap, `fitView`, estado via useNodesState/
 *    useEdgesState e onConnect → addEdge + recomputação.
 *  - nodeTypes customizados memoizados: `source` (dataset), `filter`/`group`/
 *    `sort` (transformações puras em JS) e `chart` (tabela + barras).
 *  - Motor (data-pipeline-types.ts): avalia o grafo em ordem topológica do
 *    source até o chart, encadeando o resultado de cada etapa.
 *  - Paleta arrastável à esquerda (drag&drop → screenToFlowPosition).
 *  - Inspector à direita: parâmetros do bloco selecionado (selects de coluna/
 *    operador/agregação, input de valor) e excluir bloco.
 *  - Toolbar: adicionar bloco, auto-organizar (cadeia esquerda→direita), ajustar
 *    à tela, toggles MiniMap/Grade e "Exportar CSV" do resultado final.
 *
 * Determinístico (IDs por contador em ref, dataset fixo); tema reativo via
 * tokens shadcn. Sem backend.
 */
import * as React from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  type Edge,
  type NodeTypes,
  type Connection,
  type OnSelectionChangeParams,
} from "@xyflow/react"
import {
  Database,
  Plus,
  LayoutTemplate,
  Maximize2,
  Map as MapIcon,
  Grid3x3,
  Trash2,
  Download,
  Filter,
  Group as GroupIcon,
  ArrowDownUp,
  BarChart3,
  MousePointer2,
  Workflow,
  Table2,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  SourceNode,
  TransformNode,
  ChartNode,
} from "@/compositions/data-pipeline-nodes"
import {
  computeGraph,
  tableToCsv,
  DATASETS,
  DATASET_IDS,
  TRANSFORM_KINDS,
  FILTER_OPS,
  AGGREGATIONS,
  AGG_LABEL,
  OP_META,
  isNumericColumn,
  type DataPipeKind,
  type DataPipeNode,
  type DataPipeNodeData,
  type TransformKind,
  type FilterOp,
  type Aggregation,
  type SortDir,
} from "@/compositions/data-pipeline-types"

/* -------------------------------------------------------------------------- */
/*  Dados iniciais                                                            */
/* -------------------------------------------------------------------------- */

/** Cor decorativa do MiniMap por tipo (não são tokens de tema). */
const MINIMAP_COLOR: Record<DataPipeKind, string> = {
  source: "#10b981",
  filter: "#0ea5e9",
  group: "#8b5cf6",
  sort: "#f59e0b",
  chart: "#22c55e",
}

const PALETTE_ICON: Record<TransformKind | "chart", typeof Filter> = {
  filter: Filter,
  group: GroupIcon,
  sort: ArrowDownUp,
  chart: BarChart3,
}

function mkNode(
  id: string,
  kind: DataPipeKind,
  x: number,
  y: number,
  data: Partial<DataPipeNodeData> = {},
): DataPipeNode {
  return {
    id,
    type: kind,
    position: { x, y },
    data: { label: data.label ?? OP_META[kind].label, ...data, result: null },
  }
}

const INITIAL_NODES: DataPipeNode[] = [
  mkNode("src", "source", 0, 140, { label: "Dataset", dataset: "sales" }),
  mkNode("flt", "filter", 250, 60, {
    label: "Filtrar",
    filterColumn: "revenue",
    filterOp: ">",
    filterValue: "0",
  }),
  mkNode("grp", "group", 510, 60, {
    label: "Agrupar",
    groupColumn: "region",
    aggColumn: "revenue",
    aggregation: "sum",
  }),
  mkNode("srt", "sort", 770, 60, {
    label: "Ordenar",
    sortColumn: "sum_revenue",
    sortDir: "desc",
  }),
  mkNode("cht", "chart", 1030, 40, { label: "Gráfico" }),
]

const EDGE_BASE: Partial<Edge> = {
  type: "smoothstep",
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
}

function mkEdge(id: string, source: string, target: string): Edge {
  return { id, source, target, ...EDGE_BASE }
}

const INITIAL_EDGES: Edge[] = [
  mkEdge("e1", "src", "flt"),
  mkEdge("e2", "flt", "grp"),
  mkEdge("e3", "grp", "srt"),
  mkEdge("e4", "srt", "cht"),
]

/* -------------------------------------------------------------------------- */
/*  Layout em cadeia (esquerda → direita por profundidade)                    */
/* -------------------------------------------------------------------------- */

function chainLayout(nodes: DataPipeNode[], edges: Edge[]): DataPipeNode[] {
  const incoming = new Set(edges.map((e) => e.target))
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    const list = adj.get(e.source) ?? []
    list.push(e.target)
    adj.set(e.source, list)
  }
  const depth = new Map<string, number>()
  const roots = nodes.filter((n) => !incoming.has(n.id)).map((n) => n.id)
  const queue: Array<{ id: string; d: number }> = roots.map((id) => ({ id, d: 0 }))
  let guard = 0
  while (queue.length > 0 && guard < nodes.length * nodes.length + 10) {
    guard += 1
    const { id, d } = queue.shift() as { id: string; d: number }
    const prev = depth.get(id)
    if (prev !== undefined && prev >= d) continue
    depth.set(id, d)
    for (const next of adj.get(id) ?? []) queue.push({ id: next, d: d + 1 })
  }
  const byDepth = new Map<number, string[]>()
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0
    const list = byDepth.get(d) ?? []
    list.push(n.id)
    byDepth.set(d, list)
  }
  const COL = 270
  const ROW = 200
  const pos = new Map<string, { x: number; y: number }>()
  for (const [d, ids] of byDepth) {
    ids.forEach((id, i) => {
      pos.set(id, { x: d * COL, y: i * ROW })
    })
  }
  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }))
}

/* -------------------------------------------------------------------------- */
/*  Componente interno (dentro do ReactFlowProvider)                          */
/* -------------------------------------------------------------------------- */

function DataPipelineInner() {
  const { resolvedTheme } = useTheme()
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<DataPipeNode>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showMiniMap, setShowMiniMap] = React.useState(true)
  const [showGrid, setShowGrid] = React.useState(true)

  const idRef = React.useRef(0)
  const nodesRef = React.useRef(nodes)
  const edgesRef = React.useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const nodeTypes = React.useMemo<NodeTypes>(
    () => ({
      source: SourceNode,
      filter: TransformNode,
      group: TransformNode,
      sort: TransformNode,
      chart: ChartNode,
    }),
    [],
  )

  // Recomputa o pipeline inteiro e injeta o resultado em cada nó.
  const recompute = React.useCallback(() => {
    const results = computeGraph(nodesRef.current, edgesRef.current)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, result: results.get(n.id) ?? null },
      })),
    )
  }, [setNodes])

  // Cálculo inicial (recompute é estável: depende só de setNodes).
  React.useEffect(() => {
    recompute()
  }, [recompute])

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  )

  // Tabela que ENTRA no nó selecionado (para listar colunas disponíveis).
  const inputColumns = React.useMemo<string[]>(() => {
    if (!selectedNode) return []
    const incoming = edges.find((e) => e.target === selectedNode.id)
    if (!incoming) return []
    const srcNode = nodes.find((n) => n.id === incoming.source)
    return srcNode?.data.result?.table?.columns ?? []
  }, [selectedNode, edges, nodes])

  const inputTable = React.useMemo(() => {
    if (!selectedNode) return null
    const incoming = edges.find((e) => e.target === selectedNode.id)
    if (!incoming) return null
    const srcNode = nodes.find((n) => n.id === incoming.source)
    return srcNode?.data.result?.table ?? null
  }, [selectedNode, edges, nodes])

  const onConnect = React.useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.target}`,
            ...EDGE_BASE,
          },
          eds,
        ),
      )
      window.setTimeout(recompute, 0)
    },
    [setEdges, recompute],
  )

  const onSelectionChange = React.useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedId(sel.length > 0 ? sel[0].id : null)
    },
    [],
  )

  const addBlock = React.useCallback(
    (kind: TransformKind | "chart", position?: { x: number; y: number }) => {
      idRef.current += 1
      const id = `n-${idRef.current}`
      const pos = position ?? { x: 320, y: 60 + (idRef.current % 5) * 70 }
      setNodes((nds) => nds.concat(mkNode(id, kind, pos.x, pos.y)))
      window.setTimeout(recompute, 0)
    },
    [setNodes, recompute],
  )

  const onDragStart = React.useCallback(
    (event: React.DragEvent, kind: TransformKind | "chart") => {
      event.dataTransfer.setData("application/data-block", kind)
      event.dataTransfer.effectAllowed = "move"
    },
    [],
  )

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const kind = event.dataTransfer.getData("application/data-block") as
        | TransformKind
        | "chart"
      if (kind !== "chart" && !TRANSFORM_KINDS.includes(kind as TransformKind)) {
        return
      }
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addBlock(kind, position)
    },
    [addBlock, screenToFlowPosition],
  )

  const patchData = React.useCallback(
    (id: string, patch: Partial<DataPipeNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      )
      window.setTimeout(recompute, 0)
    },
    [setNodes, recompute],
  )

  const deleteNode = React.useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id))
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
      setSelectedId((cur) => (cur === id ? null : cur))
      window.setTimeout(recompute, 0)
    },
    [setNodes, setEdges, recompute],
  )

  const autoLayout = React.useCallback(() => {
    setNodes((nds) => chainLayout(nds, edgesRef.current))
    window.setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 60)
  }, [setNodes, fitView])

  // Resultado final (tabela do nó chart) para exportar CSV / status.
  const resultTable = React.useMemo(() => {
    const chart = nodes.find((n) => n.type === "chart")
    return chart?.data.result?.table ?? null
  }, [nodes])

  const exportCsv = React.useCallback(() => {
    if (!resultTable || resultTable.rows.length === 0) return
    const csv = tableToCsv(resultTable)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data-pipeline.csv"
    a.click()
    URL.revokeObjectURL(url)
  }, [resultTable])

  const resultRows = resultTable?.rows.length ?? 0
  const hasResult = resultRows > 0

  return (
    <div
      data-slot="data-pipeline"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Workflow className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">Data Pipeline</p>
            <p className="text-[11px] text-muted-foreground">
              Resultado recalculado ao vivo
            </p>
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default" className="gap-1.5">
              <Plus className="size-4" /> Bloco
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Adicionar ao canvas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[...TRANSFORM_KINDS, "chart" as const].map((kind) => {
              const Icon = PALETTE_ICON[kind]
              return (
                <DropdownMenuItem key={kind} onSelect={() => addBlock(kind)}>
                  <Icon className="size-4" />
                  <span>{OP_META[kind].label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {OP_META[kind].hint}
                  </span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" variant="outline" className="gap-1.5" onClick={autoLayout}>
          <LayoutTemplate className="size-4" />
          <span className="hidden md:inline">Auto-organizar</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => fitView({ duration: 400, padding: 0.2 })}
        >
          <Maximize2 className="size-4" />
          <span className="hidden md:inline">Ajustar à tela</span>
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <Button
          size="sm"
          variant={showMiniMap ? "secondary" : "ghost"}
          aria-pressed={showMiniMap}
          className="gap-1.5"
          onClick={() => setShowMiniMap((v) => !v)}
        >
          <MapIcon className="size-4" />
          <span className="hidden lg:inline">MiniMap</span>
        </Button>
        <Button
          size="sm"
          variant={showGrid ? "secondary" : "ghost"}
          aria-pressed={showGrid}
          className="gap-1.5"
          onClick={() => setShowGrid((v) => !v)}
        >
          <Grid3x3 className="size-4" />
          <span className="hidden lg:inline">Grade</span>
        </Button>

        <div className="ml-auto">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={exportCsv}
            disabled={!hasResult}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Corpo: paleta | canvas | inspector */}
      <div className="flex min-h-0 flex-1">
        {/* Paleta */}
        <aside className="hidden w-52 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border bg-card/40 p-3 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Blocos
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Arraste para o canvas
            </p>
          </div>
          {[...TRANSFORM_KINDS, "chart" as const].map((kind) => {
            const Icon = PALETTE_ICON[kind]
            return (
              <div
                key={kind}
                draggable
                onDragStart={(e) => onDragStart(e, kind)}
                className="group flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{OP_META[kind].label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {OP_META[kind].hint}
                  </p>
                </div>
              </div>
            )
          })}
          <div className="mt-auto rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            Ligue a saída de um bloco à entrada do próximo — o gráfico recalcula
            na hora.
          </div>
        </aside>

        {/* Canvas */}
        <div className="relative min-w-0 flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <div data-slot="react-flow" className="absolute inset-0">
            <ReactFlow
              colorMode={resolvedTheme}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              proOptions={{ hideAttribution: true }}
            >
              {showGrid ? (
                <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
              ) : null}
              <Controls />
              {showMiniMap ? (
                <MiniMap
                  pannable
                  zoomable
                  nodeColor={(n) =>
                    MINIMAP_COLOR[(n.type as DataPipeKind) ?? "filter"]
                  }
                />
              ) : null}
            </ReactFlow>
          </div>
        </div>

        {/* Inspector */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card/40 p-4 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inspetor
          </p>

          {selectedNode ? (
            <div className="mt-3 flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Bloco
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {OP_META[selectedNode.type as DataPipeKind].label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {OP_META[selectedNode.type as DataPipeKind].hint}
                </p>
              </div>

              <SelectedInspector
                node={selectedNode}
                inputColumns={inputColumns}
                isNumeric={(col) =>
                  inputTable ? isNumericColumn(inputTable, col) : false
                }
                onPatch={patchData}
              />

              <Button
                variant="destructive"
                size="sm"
                className="mt-1 gap-1.5"
                onClick={() => deleteNode(selectedNode.id)}
              >
                <Trash2 className="size-4" /> Excluir bloco
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MousePointer2 className="size-5" />
              </span>
              <p className="text-sm font-medium">Nenhum bloco selecionado</p>
              <p className="max-w-[12rem] text-xs text-muted-foreground">
                Clique num bloco para ajustar a transformação — o gráfico
                atualiza na hora.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Database className="size-3.5" /> {nodes.length} blocos
        </span>
        <span className="flex items-center gap-1.5">
          <Workflow className="size-3.5" /> {edges.length} conexões
        </span>
        <span className="ml-auto flex items-center gap-1.5 tabular-nums">
          <Table2 className="size-3.5" /> {resultRows} linhas no resultado
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Inspector do bloco selecionado                                            */
/* -------------------------------------------------------------------------- */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium text-muted-foreground">{children}</span>
  )
}

function SelectedInspector({
  node,
  inputColumns,
  isNumeric,
  onPatch,
}: {
  node: DataPipeNode
  inputColumns: string[]
  isNumeric: (col: string) => boolean
  onPatch: (id: string, patch: Partial<DataPipeNodeData>) => void
}) {
  const id = node.id
  const data = node.data
  const cols = inputColumns

  if (node.type === "source") {
    return (
      <label className="flex flex-col gap-1.5">
        <FieldLabel>Dataset de origem</FieldLabel>
        <Select
          value={data.dataset ?? "sales"}
          onValueChange={(v) => onPatch(id, { dataset: v as typeof data.dataset })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATASET_IDS.map((dsId) => (
              <SelectItem key={dsId} value={dsId}>
                {DATASETS[dsId].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    )
  }

  if (cols.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        Conecte uma entrada neste bloco para configurar a transformação.
      </p>
    )
  }

  if (node.type === "filter") {
    return (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Coluna</FieldLabel>
          <Select
            value={data.filterColumn ?? ""}
            onValueChange={(v) => onPatch(id, { filterColumn: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {cols.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Operador</FieldLabel>
          <Select
            value={data.filterOp ?? ">"}
            onValueChange={(v) => onPatch(id, { filterOp: v as FilterOp })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPS.map((op) => (
                <SelectItem key={op} value={op}>
                  {op === "contains" ? "contém" : op}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Valor</FieldLabel>
          <Input
            value={data.filterValue ?? ""}
            onChange={(e) => onPatch(id, { filterValue: e.target.value })}
            placeholder="ex.: 1000"
          />
        </label>
      </div>
    )
  }

  if (node.type === "group") {
    const numericCols = cols.filter(isNumeric)
    const agg = data.aggregation ?? "sum"
    return (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Agrupar por</FieldLabel>
          <Select
            value={data.groupColumn ?? ""}
            onValueChange={(v) => onPatch(id, { groupColumn: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {cols.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Agregação</FieldLabel>
          <Select
            value={agg}
            onValueChange={(v) => onPatch(id, { aggregation: v as Aggregation })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGGREGATIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {AGG_LABEL[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        {agg !== "count" ? (
          <label className="flex flex-col gap-1.5">
            <FieldLabel>Coluna do valor</FieldLabel>
            <Select
              value={data.aggColumn ?? ""}
              onValueChange={(v) => onPatch(id, { aggColumn: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {(numericCols.length > 0 ? numericCols : cols).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        ) : null}
      </div>
    )
  }

  if (node.type === "sort") {
    return (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Coluna</FieldLabel>
          <Select
            value={data.sortColumn ?? ""}
            onValueChange={(v) => onPatch(id, { sortColumn: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {cols.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Direção</FieldLabel>
          <Select
            value={data.sortDir ?? "desc"}
            onValueChange={(v) => onPatch(id, { sortDir: v as SortDir })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Decrescente</SelectItem>
              <SelectItem value="asc">Crescente</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
    )
  }

  // chart
  return (
    <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
      O bloco de gráfico plota a tabela final automaticamente. Ajuste os blocos
      anteriores para mudar o resultado.
    </p>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                     */
/* -------------------------------------------------------------------------- */

export function DataPipeline() {
  return (
    <ReactFlowProvider>
      <DataPipelineInner />
    </ReactFlowProvider>
  )
}
