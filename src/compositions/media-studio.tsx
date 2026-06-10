/**
 * Composição "Generative Media Studio" (media-studio).
 *
 * Estúdio de mídia generativa no estilo Bleu AI (buildbleu.com), construído
 * sobre o React Flow (@xyflow/react) já tematizado da vitrine. O pipeline vai de
 * INPUTS (texto/imagem do usuário) → GENERATION (texto/imagem/vídeo/áudio) →
 * LAYOUT (mosaico de saída). Diferenciais sobre as outras composições React Flow:
 *  - Paleta à esquerda AGRUPADA POR CATEGORIA (Inputs · Generation · Layout) com
 *    headers; itens arrastáveis (drag&drop → screenToFlowPosition).
 *  - Nós de geração com THUMBNAIL do asset (picsum, CORS-friendly) — imagem,
 *    vídeo (com play), áudio (waveform) e texto (preview).
 *  - Simulação ▶ Gerar: percorre o grafo dos inputs ao output marcando cada nó
 *    como `generating` (skeleton pulsando) e depois `done` (o asset aparece),
 *    destacando as edges do caminho; ao final o Output monta o mosaico (timers
 *    em ref, limpos no unmount).
 *  - Inspetor à direita: prompt (textarea), modelo (select por categoria),
 *    seed e proporção; exclui o nó.
 *  - Toolbar: adicionar nó (dropdown por categoria), auto-organizar em camadas,
 *    ajustar à tela (fitView), toggles MiniMap/Grade e Gerar. Barra de status.
 *
 * Determinístico (IDs por contador em ref; seeds fixas); tema reativo via tokens
 * shadcn; o canvas herda o tema do React Flow pelo `data-slot="react-flow"`.
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
  Type,
  ImageIcon,
  Sparkles,
  Wand2,
  Clapperboard,
  AudioLines,
  LayoutGrid,
  Plus,
  Play,
  Square,
  LayoutTemplate,
  Maximize2,
  Map as MapIcon,
  Grid3x3,
  Trash2,
  MousePointer2,
  Layers,
  GitBranch,
  Clapperboard as ClapperIcon,
  type LucideIcon,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TextInputNode,
  ImageInputNode,
  TextGenNode,
  ImageGenNode,
  VideoGenNode,
  AudioGenNode,
  OutputNode,
} from "@/compositions/media-studio-nodes"
import {
  NODE_CATEGORY,
  thumbUrl,
  type MediaAsset,
  type MediaCategory,
  type MediaNode,
  type MediaNodeData,
  type MediaNodeKind,
} from "@/compositions/media-studio-types"

/* -------------------------------------------------------------------------- */
/*  Modelo / dados                                                            */
/* -------------------------------------------------------------------------- */

const STEP_MS = 900
const GEN_MS = 620

/** Modelos disponíveis por tipo de nó (select do inspetor). */
const MODELS: Record<MediaNodeKind, readonly string[]> = {
  textInput: [],
  imageInput: [],
  textGen: ["gpt-4o", "claude-3.5-sonnet", "gemini-1.5-pro", "llama-3.1-70b"],
  imageGen: ["Flux", "SDXL", "DALL·E 3", "Midjourney"],
  videoGen: ["Runway Gen-3", "Sora", "Pika", "Kling"],
  audioGen: ["ElevenLabs", "Suno", "MusicGen"],
  output: [],
}

const ASPECTS = ["1:1", "16:9", "9:16", "4:3"] as const

/** Texto fake "gerado" pelos nós de texto quando concluídos. */
const TEXT_PREVIEWS: Record<string, string> = {
  default:
    "Cena cinematográfica ao entardecer, luz dourada, névoa suave sobre montanhas, paleta quente, lente 35mm, alto detalhe.",
}

type PaletteItem = {
  kind: MediaNodeKind
  label: string
  icon: LucideIcon
  hint: string
}

type PaletteGroup = {
  category: MediaCategory
  label: string
  items: PaletteItem[]
}

/** Paleta agrupada por categoria. */
const PALETTE_GROUPS: PaletteGroup[] = [
  {
    category: "inputs",
    label: "Inputs",
    items: [
      { kind: "textInput", label: "User Text Input", icon: Type, hint: "Prompt" },
      { kind: "imageInput", label: "User Image Input", icon: ImageIcon, hint: "Referência" },
    ],
  },
  {
    category: "generation",
    label: "Generation",
    items: [
      { kind: "textGen", label: "Text Generation", icon: Sparkles, hint: "LLM" },
      { kind: "imageGen", label: "Image Generation", icon: Wand2, hint: "Flux" },
      { kind: "videoGen", label: "Video Generation", icon: Clapperboard, hint: "Runway" },
      { kind: "audioGen", label: "Audio Generation", icon: AudioLines, hint: "Suno" },
    ],
  },
  {
    category: "layout",
    label: "Layout",
    items: [
      { kind: "output", label: "Output Layout", icon: LayoutGrid, hint: "Mosaico" },
    ],
  },
]

const PALETTE: PaletteItem[] = PALETTE_GROUPS.flatMap((g) => g.items)

/** Cor decorativa do MiniMap por categoria (não são tokens de tema). */
const MINIMAP_COLOR: Record<MediaCategory, string> = {
  inputs: "#0ea5e9",
  generation: "#a855f7",
  layout: "#10b981",
}

const EDGE_BASE: Partial<Edge> = {
  type: "smoothstep",
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
}

/** Defaults de criação por tipo de nó. */
function defaultData(kind: MediaNodeKind, seed: number): MediaNodeData {
  const base: MediaNodeData = {
    label: PALETTE.find((p) => p.kind === kind)?.label ?? kind,
    seed,
  }
  if (NODE_CATEGORY[kind] === "generation") {
    base.model = MODELS[kind][0]
    base.status = "idle"
  }
  if (kind === "imageGen" || kind === "videoGen") base.aspect = "16:9"
  if (kind === "textInput") base.prompt = "Uma paisagem épica ao pôr do sol"
  if (kind === "textGen") base.prompt = "Refine o prompt para máximo detalhe"
  return base
}

function mkNode(
  id: string,
  kind: MediaNodeKind,
  data: MediaNodeData,
  x: number,
  y: number,
): MediaNode {
  return { id, type: kind, position: { x, y }, data }
}

function mkEdge(id: string, source: string, target: string): Edge {
  return { id, source, target, ...EDGE_BASE }
}

const INITIAL_NODES: MediaNode[] = [
  mkNode(
    "n1",
    "textInput",
    { label: "User Text Input", prompt: "Uma cidade futurista ao entardecer, neon, chuva", seed: 1 },
    0,
    20,
  ),
  mkNode(
    "n2",
    "imageInput",
    { label: "User Image Input", seed: 7 },
    0,
    250,
  ),
  mkNode(
    "n3",
    "textGen",
    {
      label: "Text Generation",
      model: "gpt-4o",
      prompt: "Refine o prompt em estilo cinematográfico",
      seed: 3,
      status: "idle",
    },
    300,
    60,
  ),
  mkNode(
    "n4",
    "imageGen",
    { label: "Image Generation", model: "Flux", aspect: "16:9", seed: 12, status: "idle" },
    600,
    120,
  ),
  mkNode(
    "n5",
    "videoGen",
    { label: "Video Generation", model: "Runway Gen-3", aspect: "16:9", seed: 21, status: "idle" },
    900,
    0,
  ),
  mkNode(
    "n6",
    "audioGen",
    { label: "Audio Generation", model: "Suno", seed: 33, status: "idle" },
    900,
    240,
  ),
  mkNode("n7", "output", { label: "Output Layout", seed: 0 }, 1200, 120),
]

const INITIAL_EDGES: Edge[] = [
  mkEdge("e1", "n1", "n3"),
  mkEdge("e2", "n3", "n4"),
  mkEdge("e3", "n2", "n4"),
  mkEdge("e4", "n4", "n5"),
  mkEdge("e5", "n3", "n6"),
  mkEdge("e6", "n4", "n7"),
  mkEdge("e7", "n5", "n7"),
  mkEdge("e8", "n6", "n7"),
]

/* -------------------------------------------------------------------------- */
/*  Helpers de grafo                                                          */
/* -------------------------------------------------------------------------- */

/** Ordem de execução: BFS a partir dos nós sem aresta de entrada (inputs). */
function executionOrder(nodes: MediaNode[], edges: Edge[]): string[] {
  const incoming = new Set(edges.map((e) => e.target))
  const roots = nodes.filter((n) => !incoming.has(n.id)).map((n) => n.id)
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    const list = adj.get(e.source) ?? []
    list.push(e.target)
    adj.set(e.source, list)
  }
  const order: string[] = []
  const seen = new Set<string>()
  const queue = [...roots]
  while (queue.length > 0) {
    const id = queue.shift() as string
    if (seen.has(id)) continue
    seen.add(id)
    order.push(id)
    for (const next of adj.get(id) ?? []) {
      if (!seen.has(next)) queue.push(next)
    }
  }
  for (const n of nodes) if (!seen.has(n.id)) order.push(n.id)
  return order
}

/** Layout determinístico em camadas (esquerda → direita). */
function layeredLayout(nodes: MediaNode[], edges: Edge[]): MediaNode[] {
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
      const offset = (i - (ids.length - 1) / 2) * ROW
      pos.set(id, { x: d * COL, y: 120 + offset })
    })
  }
  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }))
}

/** Assets (imagem/vídeo) que chegam ao nó de saída a partir de nós concluídos. */
function collectOutputAssets(nodes: MediaNode[], edges: Edge[]): MediaAsset[] {
  const output = nodes.find((n) => n.type === "output")
  if (!output) return []
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const assets: MediaAsset[] = []
  for (const e of edges) {
    if (e.target !== output.id) continue
    const src = byId.get(e.source)
    if (!src) continue
    const isVisual =
      src.type === "imageGen" || src.type === "videoGen" || src.type === "imageInput"
    const ready = src.type === "imageInput" || src.data.status === "done"
    if (isVisual && ready) {
      assets.push({
        id: src.id,
        kind: src.type as MediaNodeKind,
        url: thumbUrl(src.data.seed ?? 0, 240, 160),
      })
    }
  }
  return assets
}

/* -------------------------------------------------------------------------- */
/*  Componente interno (dentro do ReactFlowProvider)                          */
/* -------------------------------------------------------------------------- */

function MediaStudioInner() {
  const { resolvedTheme } = useTheme()
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<MediaNode>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showMiniMap, setShowMiniMap] = React.useState(true)
  const [showGrid, setShowGrid] = React.useState(true)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [runningLabel, setRunningLabel] = React.useState<string | null>(null)

  const idRef = React.useRef(INITIAL_NODES.length)
  const seedRef = React.useRef(40)
  const timersRef = React.useRef<number[]>([])

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }, [])

  React.useEffect(() => () => clearTimers(), [clearTimers])

  const nodeTypes = React.useMemo<NodeTypes>(
    () => ({
      textInput: TextInputNode,
      imageInput: ImageInputNode,
      textGen: TextGenNode,
      imageGen: ImageGenNode,
      videoGen: VideoGenNode,
      audioGen: AudioGenNode,
      output: OutputNode,
    }),
    [],
  )

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
    },
    [setEdges],
  )

  const onSelectionChange = React.useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedId(sel.length > 0 ? sel[0].id : null)
    },
    [],
  )

  const addNode = React.useCallback(
    (kind: MediaNodeKind, position?: { x: number; y: number }) => {
      idRef.current += 1
      seedRef.current += 1
      const id = `node-${idRef.current}`
      const pos = position ?? { x: 320, y: 60 + (idRef.current % 5) * 40 }
      setNodes((nds) => nds.concat(mkNode(id, kind, defaultData(kind, seedRef.current), pos.x, pos.y)))
    },
    [setNodes],
  )

  const onDragStart = React.useCallback(
    (event: React.DragEvent, kind: MediaNodeKind) => {
      event.dataTransfer.setData("application/media-kind", kind)
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
      const kind = event.dataTransfer.getData("application/media-kind") as MediaNodeKind
      if (!PALETTE.some((p) => p.kind === kind)) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addNode(kind, position)
    },
    [addNode, screenToFlowPosition],
  )

  const updateSelected = React.useCallback(
    (patch: Partial<MediaNodeData>) => {
      if (!selectedId) return
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      )
    },
    [selectedId, setNodes],
  )

  const deleteSelected = React.useCallback(() => {
    if (!selectedId) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedId))
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedId && e.target !== selectedId),
    )
    setSelectedId(null)
  }, [selectedId, setNodes, setEdges])

  const autoLayout = React.useCallback(() => {
    setNodes((nds) => layeredLayout(nds, edges))
    window.setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50)
  }, [edges, fitView, setNodes])

  const resetRun = React.useCallback(() => {
    clearTimers()
    setIsGenerating(false)
    setRunningLabel(null)
    setNodes((nds) =>
      nds.map((n) =>
        NODE_CATEGORY[n.type as MediaNodeKind] === "generation"
          ? { ...n, data: { ...n.data, status: "idle" } }
          : n.type === "output"
            ? { ...n, data: { ...n.data, assets: undefined } }
            : n,
      ),
    )
    setEdges((eds) => eds.map((e) => ({ ...e, style: undefined })))
  }, [clearTimers, setNodes, setEdges])

  const runSimulation = React.useCallback(() => {
    clearTimers()
    const order = executionOrder(nodes, edges)
    if (order.length === 0) return
    setIsGenerating(true)
    // reset visual antes de iniciar
    setNodes((nds) =>
      nds.map((n) =>
        NODE_CATEGORY[n.type as MediaNodeKind] === "generation"
          ? { ...n, data: { ...n.data, status: "idle" } }
          : n.type === "output"
            ? { ...n, data: { ...n.data, assets: undefined } }
            : n,
      ),
    )

    order.forEach((id, i) => {
      const node = nodes.find((n) => n.id === id)
      const kind = node?.type as MediaNodeKind | undefined
      const isGen = kind ? NODE_CATEGORY[kind] === "generation" : false
      const startAt = i * STEP_MS

      const tStart = window.setTimeout(() => {
        setRunningLabel(node?.data.label ?? null)
        const reached = new Set(order.slice(0, i + 1))
        setEdges((eds) =>
          eds.map((e) =>
            reached.has(e.source) && reached.has(e.target)
              ? { ...e, style: { stroke: "var(--primary)", strokeWidth: 2.5 } }
              : { ...e, style: undefined },
          ),
        )
        if (isGen) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, status: "generating" } } : n,
            ),
          )
        }
      }, startAt)
      timersRef.current.push(tStart)

      if (isGen) {
        const tDone = window.setTimeout(() => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === id
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: "done",
                      ...(kind === "textGen"
                        ? { text: TEXT_PREVIEWS.default }
                        : {}),
                    },
                  }
                : n,
            ),
          )
        }, startAt + GEN_MS)
        timersRef.current.push(tDone)
      }
    })

    const end = window.setTimeout(
      () => {
        setNodes((nds) => {
          const ready = nds.map((n) =>
            NODE_CATEGORY[n.type as MediaNodeKind] === "generation"
              ? { ...n, data: { ...n.data, status: "done" as const } }
              : n,
          )
          const assets = collectOutputAssets(ready, edges)
          return ready.map((n) =>
            n.type === "output" ? { ...n, data: { ...n.data, assets } } : n,
          )
        })
        setEdges((eds) => eds.map((e) => ({ ...e, style: undefined })))
        setIsGenerating(false)
        setRunningLabel(null)
      },
      order.length * STEP_MS + GEN_MS + 400,
    )
    timersRef.current.push(end)
  }, [clearTimers, nodes, edges, setNodes, setEdges])

  const counts = React.useMemo(() => {
    let inputs = 0
    let generation = 0
    let layout = 0
    for (const n of nodes) {
      const cat = NODE_CATEGORY[n.type as MediaNodeKind]
      if (cat === "inputs") inputs += 1
      else if (cat === "generation") generation += 1
      else layout += 1
    }
    return { inputs, generation, layout }
  }, [nodes])

  const selectedKind = selectedNode?.type as MediaNodeKind | undefined
  const isGenNode = selectedKind ? NODE_CATEGORY[selectedKind] === "generation" : false
  const hasAspect = selectedKind === "imageGen" || selectedKind === "videoGen"
  const hasPrompt = selectedKind === "textInput" || selectedKind === "textGen"

  return (
    <div
      data-slot="media-studio"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ClapperIcon className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">Generative Media Studio</p>
            <p className="text-[11px] text-muted-foreground">Geração de mídia visual</p>
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default" className="gap-1.5">
              <Plus className="size-4" /> Adicionar nó
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {PALETTE_GROUPS.map((group, gi) => (
              <React.Fragment key={group.category}>
                {gi > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                {group.items.map((item) => (
                  <DropdownMenuItem key={item.kind} onSelect={() => addNode(item.kind)}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </React.Fragment>
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

        <div className="ml-auto flex items-center gap-2">
          {isGenerating ? (
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={resetRun}>
              <Square className="size-4" /> Parar
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 bg-fuchsia-600 text-white hover:bg-fuchsia-600/90"
              onClick={runSimulation}
            >
              <Play className="size-4" /> Gerar
            </Button>
          )}
        </div>
      </div>

      {/* Corpo: paleta | canvas | inspetor */}
      <div className="flex min-h-0 flex-1">
        {/* Paleta agrupada por categoria */}
        <aside className="hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto border-r border-border bg-card/40 p-3 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Paleta
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Arraste para o canvas
            </p>
          </div>
          {PALETTE_GROUPS.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {group.label}
              </p>
              {group.items.map((item) => (
                <div
                  key={item.kind}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.kind)}
                  className="group flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {item.hint}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
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
                    MINIMAP_COLOR[NODE_CATEGORY[(n.type as MediaNodeKind) ?? "imageGen"]]
                  }
                />
              ) : null}
            </ReactFlow>
          </div>
        </div>

        {/* Inspetor */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card/40 p-4 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inspetor
          </p>
          {selectedNode ? (
            <div className="mt-3 flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Categoria
                </p>
                <p className="mt-0.5 text-sm font-medium capitalize">
                  {NODE_CATEGORY[selectedNode.type as MediaNodeKind]}
                </p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Título</span>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => updateSelected({ label: e.target.value })}
                />
              </label>

              {hasPrompt ? (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Prompt</span>
                  <Textarea
                    rows={3}
                    value={selectedNode.data.prompt ?? ""}
                    onChange={(e) => updateSelected({ prompt: e.target.value })}
                  />
                </label>
              ) : null}

              {isGenNode && selectedKind ? (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Modelo</span>
                  <Select
                    value={selectedNode.data.model ?? MODELS[selectedKind][0]}
                    onValueChange={(value) => updateSelected({ model: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS[selectedKind].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              ) : null}

              {hasAspect ? (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Proporção</span>
                  <Select
                    value={selectedNode.data.aspect ?? ASPECTS[0]}
                    onValueChange={(value) => updateSelected({ aspect: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Proporção" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECTS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              ) : null}

              {selectedKind && selectedKind !== "output" ? (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Seed</span>
                  <Input
                    type="number"
                    min={0}
                    value={selectedNode.data.seed ?? 0}
                    onChange={(e) => updateSelected({ seed: Number(e.target.value) })}
                  />
                </label>
              ) : null}

              <Button
                variant="destructive"
                size="sm"
                className="mt-1 gap-1.5"
                onClick={deleteSelected}
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
                Clique num nó do canvas para editar o prompt, o modelo e a seed.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Layers className="size-3.5" /> {nodes.length} nós
        </span>
        <span className="flex items-center gap-1.5">
          <GitBranch className="size-3.5" /> {edges.length} conexões
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <Sparkles className="size-3.5" /> {counts.generation} gerações
        </span>
        {isGenerating ? (
          <span className="flex items-center gap-1.5 text-fuchsia-600 dark:text-fuchsia-400">
            <Sparkles className="size-3.5 animate-pulse" />
            Gerando{runningLabel ? `: ${runningLabel}` : "…"}
          </span>
        ) : (
          <span className="hidden truncate md:inline">
            {selectedNode ? (
              <>
                Selecionado:{" "}
                <span className="font-medium text-foreground">
                  {selectedNode.data.label}
                </span>
              </>
            ) : (
              "Pronto para gerar"
            )}
          </span>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export function MediaStudio() {
  return (
    <ReactFlowProvider>
      <MediaStudioInner />
    </ReactFlowProvider>
  )
}
