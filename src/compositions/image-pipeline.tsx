/**
 * Composição "Image Processing Pipeline" (image-pipeline).
 *
 * Pipeline visual de processamento de imagem no estilo chaiNNer, construído
 * sobre o React Flow (@xyflow/react) já tematizado da vitrine. O DIFERENCIAL
 * (o "wow"): cada nó renderiza num `<canvas>` a imagem JÁ processada por aquela
 * etapa, encadeada da origem (picsum, CORS-friendly) até a saída.
 *
 *  - Canvas central <ReactFlow> (dentro de <ReactFlowProvider>) com Background
 *    pontilhado, Controls e MiniMap (cor por tipo), `fitView`, estado via
 *    useNodesState/useEdgesState e onConnect → addEdge + recomputação.
 *  - nodeTypes customizados memoizados: `source` (carrega a imagem), operações
 *    (grayscale/invert/brightness/contrast/blur/threshold/sepia) e `output`.
 *  - Motor (image-pipeline-types.ts): avalia o grafo em ordem topológica a
 *    partir do source e aplica cada filtro sobre o ImageData do nó anterior
 *    (Canvas 2D puro; blur via ctx.filter). Recomputa quando a imagem carrega,
 *    um parâmetro muda (slider) ou a topologia muda (nova conexão/nó). O recompute
 *    é coalescido num requestAnimationFrame.
 *  - Paleta arrastável à esquerda (drag&drop → screenToFlowPosition cria o nó).
 *  - Inspector à direita: parâmetros do nó selecionado (sliders / seed da
 *    origem) e excluir nó.
 *  - Toolbar: adicionar operação, auto-organizar (cadeia esquerda→direita),
 *    ajustar à tela, toggles MiniMap/Grade e "Baixar resultado" (PNG do output).
 *
 * Determinístico (IDs por contador em ref, mesma seed → mesma imagem); tema
 * reativo via tokens shadcn. Sem backend.
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
  Workflow,
  Plus,
  LayoutTemplate,
  Maximize2,
  Map as MapIcon,
  Grid3x3,
  Trash2,
  Download,
  Image as ImageIcon,
  Sliders,
  RefreshCw,
  MousePointer2,
  Layers,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
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
  OperationNode,
  OutputNode,
} from "@/compositions/image-pipeline-nodes"
import {
  computeGraph,
  imageToData,
  defaultAmount,
  isParamKind,
  OP_META,
  OPERATION_KINDS,
  PARAM_CONFIG,
  PROC_W,
  PROC_H,
  type ImagePipeKind,
  type ImagePipeNode,
  type OperationKind,
} from "@/compositions/image-pipeline-types"

/* -------------------------------------------------------------------------- */
/*  Dados                                                                     */
/* -------------------------------------------------------------------------- */

/** Cor decorativa do MiniMap por tipo (não são tokens de tema). */
const MINIMAP_COLOR: Record<ImagePipeKind, string> = {
  source: "#10b981",
  grayscale: "#64748b",
  invert: "#8b5cf6",
  brightness: "#f59e0b",
  contrast: "#0ea5e9",
  blur: "#06b6d4",
  threshold: "#ec4899",
  sepia: "#d97706",
  output: "#22c55e",
}

type ImageCacheEntry = {
  img: HTMLImageElement
  data: ImageData | null
  loaded: boolean
}

function mkNode(
  id: string,
  kind: ImagePipeKind,
  x: number,
  y: number,
  extra?: { seed?: number; amount?: number; label?: string },
): ImagePipeNode {
  return {
    id,
    type: kind,
    position: { x, y },
    data: {
      label: extra?.label ?? OP_META[kind].label,
      seed: extra?.seed,
      amount: extra?.amount ?? (isParamKind(kind) ? defaultAmount(kind) : undefined),
      preview: null,
    },
  }
}

const INITIAL_NODES: ImagePipeNode[] = [
  mkNode("src", "source", 0, 130, { seed: 17, label: "Imagem" }),
  mkNode("gray", "grayscale", 280, 20),
  mkNode("bright", "brightness", 560, 20, { amount: 28 }),
  mkNode("blur", "blur", 840, 40, { amount: 3 }),
  mkNode("out", "output", 1140, 40, { label: "Resultado" }),
  mkNode("inv", "invert", 280, 320),
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
  mkEdge("e1", "src", "gray"),
  mkEdge("e2", "gray", "bright"),
  mkEdge("e3", "bright", "blur"),
  mkEdge("e4", "blur", "out"),
  mkEdge("e5", "src", "inv"),
]

/* -------------------------------------------------------------------------- */
/*  Layout em cadeia (esquerda → direita por profundidade)                    */
/* -------------------------------------------------------------------------- */

function chainLayout(nodes: ImagePipeNode[], edges: Edge[]): ImagePipeNode[] {
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
  while (queue.length > 0) {
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
  const COL = 300
  const ROW = 230
  const pos = new Map<string, { x: number; y: number }>()
  for (const [d, ids] of byDepth) {
    ids.forEach((id, i) => {
      pos.set(id, { x: d * COL, y: i * ROW })
    })
  }
  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }))
}

/** Dispara o download de um ImageData como PNG. */
function downloadImageData(preview: ImageData, filename: string): void {
  const canvas = document.createElement("canvas")
  canvas.width = preview.width
  canvas.height = preview.height
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.putImageData(preview, 0, 0)
  const a = document.createElement("a")
  a.href = canvas.toDataURL("image/png")
  a.download = filename
  a.click()
}

/* -------------------------------------------------------------------------- */
/*  Componente interno (dentro do ReactFlowProvider)                          */
/* -------------------------------------------------------------------------- */

function ImagePipelineInner() {
  const { resolvedTheme } = useTheme()
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<ImagePipeNode>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showMiniMap, setShowMiniMap] = React.useState(true)
  const [showGrid, setShowGrid] = React.useState(true)

  const idRef = React.useRef(0)
  const rafRef = React.useRef<number | null>(null)
  const imageCacheRef = React.useRef<Map<number, ImageCacheEntry>>(new Map())
  const computeRef = React.useRef<() => void>(() => {})

  const nodesRef = React.useRef(nodes)
  const edgesRef = React.useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const nodeTypes = React.useMemo<NodeTypes>(
    () => ({
      source: SourceNode,
      output: OutputNode,
      grayscale: OperationNode,
      invert: OperationNode,
      brightness: OperationNode,
      contrast: OperationNode,
      blur: OperationNode,
      threshold: OperationNode,
      sepia: OperationNode,
    }),
    [],
  )

  const schedule = React.useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      computeRef.current()
    })
  }, [])

  const computePreviews = React.useCallback(() => {
    const cache = imageCacheRef.current
    const resolver = (node: ImagePipeNode): ImageData | null => {
      const seed = node.data.seed ?? 0
      let entry = cache.get(seed)
      if (!entry) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        const created: ImageCacheEntry = { img, data: null, loaded: false }
        img.onload = () => {
          created.loaded = true
          created.data = imageToData(img)
          schedule()
        }
        img.onerror = () => {
          created.loaded = true
          created.data = null
          schedule()
        }
        cache.set(seed, created)
        img.src = `https://picsum.photos/seed/${seed}/320/240`
        entry = created
      }
      return entry.loaded ? entry.data : null
    }

    const result = computeGraph(nodesRef.current, edgesRef.current, resolver)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, preview: result.get(n.id) ?? null },
      })),
    )
  }, [setNodes, schedule])

  computeRef.current = computePreviews

  // Processamento inicial + limpeza (cancela rAF e libera handlers de imagem).
  React.useEffect(() => {
    schedule()
    const cache = imageCacheRef.current
    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      for (const entry of cache.values()) {
        entry.img.onload = null
        entry.img.onerror = null
      }
    }
  }, [schedule])

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  )

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
      schedule()
    },
    [setEdges, schedule],
  )

  const onSelectionChange = React.useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedId(sel.length > 0 ? sel[0].id : null)
    },
    [],
  )

  const addOperation = React.useCallback(
    (kind: OperationKind, position?: { x: number; y: number }) => {
      idRef.current += 1
      const id = `op-${idRef.current}`
      const pos = position ?? { x: 320, y: 60 + (idRef.current % 5) * 60 }
      setNodes((nds) => nds.concat(mkNode(id, kind, pos.x, pos.y)))
      schedule()
    },
    [setNodes, schedule],
  )

  const onDragStart = React.useCallback(
    (event: React.DragEvent, kind: OperationKind) => {
      event.dataTransfer.setData("application/image-op", kind)
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
      const kind = event.dataTransfer.getData("application/image-op") as OperationKind
      if (!OPERATION_KINDS.includes(kind)) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addOperation(kind, position)
    },
    [addOperation, screenToFlowPosition],
  )

  const updateAmount = React.useCallback(
    (id: string, amount: number) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, amount } } : n,
        ),
      )
      schedule()
    },
    [setNodes, schedule],
  )

  const updateSeed = React.useCallback(
    (id: string, seed: number) => {
      const safe = Number.isFinite(seed) ? Math.max(0, Math.round(seed)) : 0
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, seed: safe } } : n,
        ),
      )
      schedule()
    },
    [setNodes, schedule],
  )

  const deleteNode = React.useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id))
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
      setSelectedId((cur) => (cur === id ? null : cur))
      schedule()
    },
    [setNodes, setEdges, schedule],
  )

  const autoLayout = React.useCallback(() => {
    setNodes((nds) => chainLayout(nds, edgesRef.current))
    window.setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 60)
  }, [setNodes, fitView])

  const downloadResult = React.useCallback(() => {
    const output = nodesRef.current.find((n) => n.type === "output")
    if (output?.data.preview) {
      downloadImageData(output.data.preview, "pipeline-result.png")
    }
  }, [])

  const nodeCount = nodes.length
  const opCount = nodes.filter(
    (n) => n.type !== "source" && n.type !== "output",
  ).length
  const hasResult = nodes.some(
    (n) => n.type === "output" && n.data.preview != null,
  )

  return (
    <div
      data-slot="image-pipeline"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Workflow className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">
              Image Processing Pipeline
            </p>
            <p className="text-[11px] text-muted-foreground">
              Preview ao vivo em cada nó
            </p>
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default" className="gap-1.5">
              <Plus className="size-4" /> Operação
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Adicionar ao canvas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {OPERATION_KINDS.map((kind) => (
              <DropdownMenuItem key={kind} onSelect={() => addOperation(kind)}>
                <Layers className="size-4" />
                <span>{OP_META[kind].label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {OP_META[kind].hint}
                </span>
              </DropdownMenuItem>
            ))}
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
            onClick={downloadResult}
            disabled={!hasResult}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Baixar resultado</span>
          </Button>
        </div>
      </div>

      {/* Corpo: paleta | canvas | inspector */}
      <div className="flex min-h-0 flex-1">
        {/* Paleta */}
        <aside className="hidden w-52 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border bg-card/40 p-3 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Operações
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Arraste para o canvas
            </p>
          </div>
          {OPERATION_KINDS.map((kind) => (
            <div
              key={kind}
              draggable
              onDragStart={(e) => onDragStart(e, kind)}
              className="group flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sliders className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{OP_META[kind].label}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {OP_META[kind].hint}
                </p>
              </div>
            </div>
          ))}
          <div className="mt-auto rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            Ligue a saída de um nó à entrada do próximo — o preview recalcula na
            hora.
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
                    MINIMAP_COLOR[(n.type as ImagePipeKind) ?? "grayscale"]
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
                  Operação
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {OP_META[selectedNode.type as ImagePipeKind].label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {OP_META[selectedNode.type as ImagePipeKind].hint}
                </p>
              </div>

              {selectedNode.type === "source" ? (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Seed da imagem (picsum)
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={selectedNode.data.seed ?? 0}
                      onChange={(e) =>
                        updateSeed(selectedNode.id, Number(e.target.value))
                      }
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Próxima imagem"
                      onClick={() =>
                        updateSeed(
                          selectedNode.id,
                          (selectedNode.data.seed ?? 0) + 1,
                        )
                      }
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                  </div>
                </label>
              ) : null}

              {isParamKind(selectedNode.type as ImagePipeKind) ? (
                (() => {
                  const kind = selectedNode.type as keyof typeof PARAM_CONFIG
                  const cfg = PARAM_CONFIG[kind]
                  const amount = selectedNode.data.amount ?? cfg.default
                  return (
                    <label className="flex flex-col gap-2">
                      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        Ajuste
                        <span className="tabular-nums text-foreground">
                          {amount}
                          {cfg.unit ?? ""}
                        </span>
                      </span>
                      <Slider
                        min={cfg.min}
                        max={cfg.max}
                        step={cfg.step}
                        value={[amount]}
                        onValueChange={(v) =>
                          updateAmount(selectedNode.id, v[0] ?? cfg.default)
                        }
                      />
                    </label>
                  )
                })()
              ) : null}

              <Button
                variant="destructive"
                size="sm"
                className="mt-1 gap-1.5"
                onClick={() => deleteNode(selectedNode.id)}
              >
                <Trash2 className="size-4" /> Excluir nó
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MousePointer2 className="size-5" />
              </span>
              <p className="text-sm font-medium">Nenhum nó selecionado</p>
              <p className="max-w-[12rem] text-xs text-muted-foreground">
                Clique num nó para ajustar seu parâmetro ou trocar a imagem de
                origem.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="size-3.5" /> {nodeCount} nós
        </span>
        <span className="flex items-center gap-1.5">
          <Sliders className="size-3.5" /> {opCount} operações
        </span>
        <span className="flex items-center gap-1.5">
          <Workflow className="size-3.5" /> {edges.length} conexões
        </span>
        <span className="ml-auto hidden items-center gap-1.5 sm:flex tabular-nums">
          {PROC_W} × {PROC_H} px
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export function ImagePipeline() {
  return (
    <ReactFlowProvider>
      <ImagePipelineInner />
    </ReactFlowProvider>
  )
}
