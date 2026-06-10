/**
 * Composição "AI Agent Pipeline" (ai-agent-flow).
 *
 * Orquestrador visual de agentes de IA / LLMs no estilo Flowise/Dify/Agentok,
 * construído sobre o React Flow (@xyflow/react) já tematizado da vitrine.
 * Demonstra a lib num app real do domínio de IA:
 *  - Canvas central <ReactFlow> (dentro de <ReactFlowProvider>) com Background
 *    pontilhado, Controls e MiniMap (cor por tipo de nó), `fitView`, estado via
 *    useNodesState/useEdgesState e onConnect → addEdge animado com seta.
 *  - 6 nodeTypes customizados tematizados (input/prompt/model/tool/memory/output)
 *    com ícone, título, subtítulo, badges (modelo/temperatura/tokens) e Handles.
 *  - Paleta arrastável à esquerda (drag&drop → screenToFlowPosition cria o nó).
 *  - Inspetor à direita: edita label/subtítulo e, para nós LLM, modelo (select),
 *    temperatura e tokens; exclui o nó selecionado.
 *  - Toolbar topo: adicionar nó, auto-organizar (layout em camadas), ajustar à
 *    tela (fitView), toggles MiniMap/Grade e ▶ Executar (simulação do grafo).
 *  - Simulação: percorre o grafo do input ao output acendendo nós em sequência,
 *    destacando o caminho e produzindo um "token streaming" fake no nó de saída
 *    (timers em ref, limpos no unmount).
 *  - Barra de status: contadores, nó selecionado e exportar JSON do grafo.
 *
 * Determinístico (IDs por contador em ref); tema reativo via tokens shadcn; canvas
 * herda o tema do React Flow pelo `data-slot="react-flow"`. Sem backend.
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
  MessageSquare,
  FileText,
  Brain,
  Wrench,
  Database,
  Sparkles,
  Plus,
  Play,
  Square,
  LayoutTemplate,
  Maximize2,
  Map as MapIcon,
  Grid3x3,
  Trash2,
  Code2,
  Copy,
  Check,
  MousePointer2,
  GitBranch,
  Bot,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InputNode,
  PromptNode,
  ModelNode,
  ToolNode,
  MemoryNode,
  OutputNode,
  type AgentNode,
  type AgentNodeData,
  type AgentNodeKind,
  type AgentIconKey,
} from "@/compositions/ai-agent-flow-nodes"

/* -------------------------------------------------------------------------- */
/*  Modelo / dados                                                            */
/* -------------------------------------------------------------------------- */

const STEP_MS = 760
/** Texto que "streama" token a token no nó de saída durante a simulação. */
const STREAM_TEXT =
  "Encontrei 3 documentos relevantes. Com base neles, o checkout falha quando o cupom expira no meio da sessão."
const STREAM_STEP_MS = 26

/** Modelos LLM disponíveis no select do inspetor. */
const MODEL_OPTIONS = [
  "gpt-4o",
  "gpt-4o-mini",
  "claude-3.5-sonnet",
  "gemini-1.5-pro",
  "llama-3.1-70b",
] as const

type PaletteItem = {
  kind: AgentNodeKind
  label: string
  subtitle: string
  iconKey: AgentIconKey
  icon: typeof MessageSquare
  hint: string
}

/** Itens da paleta / templates de criação de nó. */
const PALETTE: PaletteItem[] = [
  {
    kind: "input",
    label: "Mensagem",
    subtitle: "Entrada do usuário",
    iconKey: "message",
    icon: MessageSquare,
    hint: "Início",
  },
  {
    kind: "prompt",
    label: "System Prompt",
    subtitle: "Instruções do agente",
    iconKey: "prompt",
    icon: FileText,
    hint: "Contexto",
  },
  {
    kind: "model",
    label: "LLM",
    subtitle: "Modelo de linguagem",
    iconKey: "model",
    icon: Brain,
    hint: "Raciocínio",
  },
  {
    kind: "tool",
    label: "Ferramenta",
    subtitle: "Função / chamada de API",
    iconKey: "tool",
    icon: Wrench,
    hint: "Ação",
  },
  {
    kind: "memory",
    label: "Memória",
    subtitle: "Base de conhecimento",
    iconKey: "memory",
    icon: Database,
    hint: "Retrieval",
  },
  {
    kind: "output",
    label: "Resposta",
    subtitle: "Saída do agente",
    iconKey: "output",
    icon: Sparkles,
    hint: "Fim",
  },
]

/** Cor decorativa do MiniMap por tipo (não são tokens de tema). */
const MINIMAP_COLOR: Record<AgentNodeKind, string> = {
  input: "#10b981",
  prompt: "#f59e0b",
  model: "#8b5cf6",
  tool: "#0ea5e9",
  memory: "#f43f5e",
  output: "#14b8a6",
}

const EDGE_BASE: Partial<Edge> = {
  type: "smoothstep",
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
}

function mkNode(
  id: string,
  kind: AgentNodeKind,
  data: AgentNodeData,
  x: number,
  y: number,
): AgentNode {
  return { id, type: kind, position: { x, y }, data }
}

function mkEdge(id: string, source: string, target: string): Edge {
  return { id, source, target, ...EDGE_BASE }
}

const INITIAL_NODES: AgentNode[] = [
  mkNode(
    "n1",
    "input",
    { label: "Mensagem do usuário", subtitle: '"Por que o checkout falha?"', iconKey: "message" },
    320,
    0,
  ),
  mkNode(
    "n2",
    "prompt",
    {
      label: "System Prompt",
      subtitle: "Você é um agente de suporte técnico.",
      iconKey: "prompt",
    },
    320,
    140,
  ),
  mkNode(
    "n3",
    "model",
    {
      label: "Planejador",
      subtitle: "Decide quais ferramentas usar",
      iconKey: "model",
      model: "gpt-4o",
      temperature: 0.3,
      maxTokens: 1024,
    },
    320,
    300,
  ),
  mkNode(
    "n4",
    "tool",
    { label: "Buscar docs", subtitle: "API de documentação", iconKey: "search" },
    70,
    470,
  ),
  mkNode(
    "n5",
    "memory",
    { label: "Base de conhecimento", subtitle: "Embeddings + retrieval", iconKey: "memory" },
    570,
    470,
  ),
  mkNode(
    "n6",
    "model",
    {
      label: "Gerador de resposta",
      subtitle: "Sintetiza a resposta final",
      iconKey: "model",
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2048,
    },
    320,
    630,
  ),
  mkNode(
    "n7",
    "output",
    { label: "Resposta", subtitle: "Enviada ao usuário", iconKey: "output" },
    320,
    800,
  ),
]

const INITIAL_EDGES: Edge[] = [
  mkEdge("e1", "n1", "n2"),
  mkEdge("e2", "n2", "n3"),
  mkEdge("e3", "n3", "n4"),
  mkEdge("e4", "n3", "n5"),
  mkEdge("e5", "n4", "n6"),
  mkEdge("e6", "n5", "n6"),
  mkEdge("e7", "n6", "n7"),
]

/* -------------------------------------------------------------------------- */
/*  Helpers de grafo                                                          */
/* -------------------------------------------------------------------------- */

/** Ordem de execução: BFS a partir dos nós sem aresta de entrada (inputs). */
function executionOrder(nodes: AgentNode[], edges: Edge[]): string[] {
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

/** Layout determinístico em camadas (profundidade × largura). */
function layeredLayout(nodes: AgentNode[], edges: Edge[]): AgentNode[] {
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
  const COL = 270
  const ROW = 165
  const pos = new Map<string, { x: number; y: number }>()
  for (const [d, ids] of byDepth) {
    ids.forEach((id, i) => {
      const offset = (i - (ids.length - 1) / 2) * COL
      pos.set(id, { x: 320 + offset, y: d * ROW })
    })
  }
  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }))
}

/* -------------------------------------------------------------------------- */
/*  Componente interno (dentro do ReactFlowProvider)                          */
/* -------------------------------------------------------------------------- */

function AiAgentFlowInner() {
  const { resolvedTheme } = useTheme()
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNode>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showMiniMap, setShowMiniMap] = React.useState(true)
  const [showGrid, setShowGrid] = React.useState(true)
  const [isRunning, setIsRunning] = React.useState(false)
  const [runningLabel, setRunningLabel] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const idRef = React.useRef(INITIAL_NODES.length)
  const timersRef = React.useRef<number[]>([])

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }, [])

  React.useEffect(() => () => clearTimers(), [clearTimers])

  const nodeTypes = React.useMemo<NodeTypes>(
    () => ({
      input: InputNode,
      prompt: PromptNode,
      model: ModelNode,
      tool: ToolNode,
      memory: MemoryNode,
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
    (item: PaletteItem, position?: { x: number; y: number }) => {
      idRef.current += 1
      const id = `node-${idRef.current}`
      const pos = position ?? { x: 340, y: 60 + (idRef.current % 5) * 40 }
      const data: AgentNodeData = {
        label: item.label,
        subtitle: item.subtitle,
        iconKey: item.iconKey,
        ...(item.kind === "model"
          ? { model: "gpt-4o-mini", temperature: 0.7, maxTokens: 1024 }
          : {}),
      }
      setNodes((nds) => nds.concat(mkNode(id, item.kind, data, pos.x, pos.y)))
    },
    [setNodes],
  )

  const onDragStart = React.useCallback(
    (event: React.DragEvent, kind: AgentNodeKind) => {
      event.dataTransfer.setData("application/agent-kind", kind)
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
      const kind = event.dataTransfer.getData(
        "application/agent-kind",
      ) as AgentNodeKind
      const item = PALETTE.find((p) => p.kind === kind)
      if (!item) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addNode(item, position)
    },
    [addNode, screenToFlowPosition],
  )

  const updateSelected = React.useCallback(
    (patch: Partial<AgentNodeData>) => {
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
    setIsRunning(false)
    setRunningLabel(null)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, running: false, stream: undefined },
      })),
    )
    setEdges((eds) => eds.map((e) => ({ ...e, style: undefined })))
  }, [clearTimers, setNodes, setEdges])

  const runSimulation = React.useCallback(() => {
    clearTimers()
    const order = executionOrder(nodes, edges)
    if (order.length === 0) return
    setIsRunning(true)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, running: false, stream: undefined },
      })),
    )
    order.forEach((id, i) => {
      const t = window.setTimeout(() => {
        const done = new Set(order.slice(0, i + 1))
        setNodes((nds) =>
          nds.map((n) => ({ ...n, data: { ...n.data, running: n.id === id } })),
        )
        setEdges((eds) =>
          eds.map((e) =>
            done.has(e.source) && done.has(e.target)
              ? { ...e, style: { stroke: "var(--primary)", strokeWidth: 2.5 } }
              : { ...e, style: undefined },
          ),
        )
        const node = nodes.find((n) => n.id === id)
        setRunningLabel(node?.data.label ?? null)
        // token streaming no nó de saída
        if (node?.type === "output") {
          for (let c = 1; c <= STREAM_TEXT.length; c += 1) {
            const ts = window.setTimeout(() => {
              const partial = STREAM_TEXT.slice(0, c)
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id ? { ...n, data: { ...n.data, stream: partial } } : n,
                ),
              )
            }, c * STREAM_STEP_MS)
            timersRef.current.push(ts)
          }
        }
      }, i * STEP_MS)
      timersRef.current.push(t)
    })
    const streamDuration = STREAM_TEXT.length * STREAM_STEP_MS
    const end = window.setTimeout(
      () => {
        setNodes((nds) =>
          nds.map((n) => ({ ...n, data: { ...n.data, running: false } })),
        )
        setEdges((eds) => eds.map((e) => ({ ...e, style: undefined })))
        setIsRunning(false)
        setRunningLabel(null)
      },
      order.length * STEP_MS + streamDuration + 600,
    )
    timersRef.current.push(end)
  }, [clearTimers, nodes, edges, setNodes, setEdges])

  const graphJson = React.useMemo(
    () =>
      JSON.stringify(
        {
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
            data: {
              label: n.data.label,
              subtitle: n.data.subtitle,
              iconKey: n.data.iconKey,
              ...(n.data.model ? { model: n.data.model } : {}),
              ...(n.data.temperature !== undefined
                ? { temperature: n.data.temperature }
                : {}),
              ...(n.data.maxTokens !== undefined
                ? { maxTokens: n.data.maxTokens }
                : {}),
            },
          })),
          edges: edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
          })),
        },
        null,
        2,
      ),
    [nodes, edges],
  )

  const copyJson = React.useCallback(() => {
    void navigator.clipboard?.writeText(graphJson)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }, [graphJson])

  const isModel = selectedNode?.type === "model"

  return (
    <div
      data-slot="ai-agent-flow"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">AI Agent Pipeline</p>
            <p className="text-[11px] text-muted-foreground">Orquestração de LLMs</p>
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
            <DropdownMenuLabel>Tipos de nó</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PALETTE.map((item) => (
              <DropdownMenuItem key={item.kind} onSelect={() => addNode(item)}>
                <item.icon className="size-4" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {item.hint}
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

        <div className="ml-auto flex items-center gap-2">
          {isRunning ? (
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={resetRun}
            >
              <Square className="size-4" /> Parar
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600/90"
              onClick={runSimulation}
            >
              <Play className="size-4" /> Executar
            </Button>
          )}
        </div>
      </div>

      {/* Corpo: paleta | canvas | inspetor */}
      <div className="flex min-h-0 flex-1">
        {/* Paleta */}
        <aside className="hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto border-r border-border bg-card/40 p-3 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Paleta
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Arraste para o canvas
            </p>
          </div>
          {PALETTE.map((item) => (
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
          <div className="mt-auto rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            Dica: ligue os nós arrastando de um{" "}
            <span className="font-medium text-foreground">ponto</span> a outro para
            criar o fluxo de dados do agente.
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
                    MINIMAP_COLOR[(n.type as AgentNodeKind) ?? "model"]
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
                  Tipo
                </p>
                <p className="mt-0.5 text-sm font-medium capitalize">
                  {selectedNode.type}
                </p>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Título
                </span>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => updateSelected({ label: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Subtítulo
                </span>
                <Input
                  value={selectedNode.data.subtitle}
                  onChange={(e) => updateSelected({ subtitle: e.target.value })}
                />
              </label>

              {isModel ? (
                <>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Modelo
                    </span>
                    <Select
                      value={selectedNode.data.model ?? MODEL_OPTIONS[0]}
                      onValueChange={(value) => updateSelected({ model: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Temperatura</span>
                      <span className="tabular-nums text-foreground">
                        {(selectedNode.data.temperature ?? 0).toFixed(1)}
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.1}
                      value={selectedNode.data.temperature ?? 0}
                      onChange={(e) =>
                        updateSelected({ temperature: Number(e.target.value) })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Máx. de tokens
                    </span>
                    <Input
                      type="number"
                      min={1}
                      value={selectedNode.data.maxTokens ?? 1024}
                      onChange={(e) =>
                        updateSelected({ maxTokens: Number(e.target.value) })
                      }
                    />
                  </label>
                </>
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
                Clique em um nó do canvas para editar suas propriedades.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Database className="size-3.5" /> {nodes.length} nós
        </span>
        <span className="flex items-center gap-1.5">
          <GitBranch className="size-3.5" /> {edges.length} conexões
        </span>
        <span className="hidden truncate sm:inline">
          {selectedNode ? (
            <>
              Selecionado:{" "}
              <span className="font-medium text-foreground">
                {selectedNode.data.label}
              </span>
            </>
          ) : (
            "Nada selecionado"
          )}
        </span>
        {isRunning ? (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-3.5 animate-pulse" />
            Executando{runningLabel ? `: ${runningLabel}` : "…"}
          </span>
        ) : null}

        <div className="ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2">
                <Code2 className="size-3.5" /> Exportar JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Grafo do pipeline</DialogTitle>
                <DialogDescription>
                  Representação serializável dos nós e conexões do agente.
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-muted/50 p-3 text-[11px] leading-relaxed">
                  <code>{graphJson}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2 gap-1.5"
                  onClick={copyJson}
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export function AiAgentFlow() {
  return (
    <ReactFlowProvider>
      <AiAgentFlowInner />
    </ReactFlowProvider>
  )
}
