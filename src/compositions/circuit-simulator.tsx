/**
 * Composição "Logic Circuit Simulator" (circuit-simulator).
 *
 * Simulador de circuitos lógicos digitais no estilo CircuLearn / Logic.ly,
 * construído sobre o React Flow (@xyflow/react) já tematizado da vitrine.
 * O DIFERENCIAL: a lógica é computada de verdade e o sinal propaga AO VIVO
 * pelo grafo — alternar uma entrada reacende portas, fios e lâmpadas na hora.
 *
 *  - Canvas central <ReactFlow> (dentro de <ReactFlowProvider>) com Background
 *    pontilhado, Controls e MiniMap (cor por tipo), `fitView`, estado via
 *    useNodesState/useEdgesState e onConnect → addEdge + recomputação.
 *  - nodeTypes customizados memoizados: `switch` (entrada clicável on/off),
 *    portas `and`/`or`/`not`/`xor`/`nand`/`nor` (1–2 inputs + 1 output) e
 *    `lamp` (saída que acende ao receber 1).
 *  - Motor de simulação: avaliação iterativa com ponto-fixo (guarda de
 *    iterações p/ ciclos) que propaga dos switches pelas portas até as lâmpadas
 *    e energiza as edges cujo sinal de origem é 1.
 *  - Paleta arrastável à esquerda (drag&drop → screenToFlowPosition cria o nó).
 *  - Toolbar: adicionar componente, auto-organizar (switches | portas | lâmpadas),
 *    ajustar à tela, toggles MiniMap/Grade e a Tabela-verdade (o "wow"
 *    educacional: varia os switches e tabula as saídas num dialog).
 *  - Painel direito: switches com toggles e estado das lâmpadas; excluir nó.
 *
 * Determinístico (IDs por contador em ref, sem aleatoriedade); tema reativo via
 * tokens shadcn; o verde/âmbar do sinal é estado físico (não token). Sem backend.
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
  CircuitBoard,
  Plus,
  LayoutTemplate,
  Maximize2,
  Map as MapIcon,
  Grid3x3,
  Trash2,
  Table2,
  ToggleLeft,
  Lightbulb,
  MousePointer2,
  Power,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  SwitchNode,
  AndNode,
  OrNode,
  NotNode,
  XorNode,
  NandNode,
  NorNode,
  LampNode,
  type CircuitNode,
  type CircuitNodeKind,
  type GateKind,
} from "@/compositions/circuit-simulator-nodes"

/* -------------------------------------------------------------------------- */
/*  Modelo / dados                                                            */
/* -------------------------------------------------------------------------- */

type PaletteItem = {
  kind: CircuitNodeKind
  label: string
  hint: string
  icon: typeof CircuitBoard
}

/** Itens da paleta / templates de criação de nó. */
const PALETTE: PaletteItem[] = [
  { kind: "switch", label: "Entrada", hint: "Switch on/off", icon: ToggleLeft },
  { kind: "and", label: "AND", hint: "E lógico", icon: CircuitBoard },
  { kind: "or", label: "OR", hint: "OU lógico", icon: CircuitBoard },
  { kind: "not", label: "NOT", hint: "Inversor", icon: CircuitBoard },
  { kind: "xor", label: "XOR", hint: "OU exclusivo", icon: CircuitBoard },
  { kind: "nand", label: "NAND", hint: "Não-E", icon: CircuitBoard },
  { kind: "nor", label: "NOR", hint: "Não-OU", icon: CircuitBoard },
  { kind: "lamp", label: "Lâmpada", hint: "Saída", icon: Lightbulb },
]

const GATE_KINDS: GateKind[] = ["and", "or", "not", "xor", "nand", "nor"]

/** Cor decorativa do MiniMap por tipo (não são tokens de tema). */
const MINIMAP_COLOR: Record<CircuitNodeKind, string> = {
  switch: "#10b981",
  and: "#0ea5e9",
  or: "#0ea5e9",
  not: "#8b5cf6",
  xor: "#8b5cf6",
  nand: "#0ea5e9",
  nor: "#0ea5e9",
  lamp: "#f59e0b",
}

/** Rótulo curto default por tipo (usado ao criar via paleta). */
const DEFAULT_LABEL: Record<CircuitNodeKind, string> = {
  switch: "IN",
  and: "AND",
  or: "OR",
  not: "NOT",
  xor: "XOR",
  nand: "NAND",
  nor: "NOR",
  lamp: "OUT",
}

function mkNode(
  id: string,
  kind: CircuitNodeKind,
  label: string,
  x: number,
  y: number,
): CircuitNode {
  return { id, type: kind, position: { x, y }, data: { label, value: 0 } }
}

const INITIAL_NODES: CircuitNode[] = [
  mkNode("a", "switch", "A", 0, 40),
  mkNode("b", "switch", "B", 0, 220),
  mkNode("g-and", "and", "AND", 240, 30),
  mkNode("g-or", "or", "OR", 240, 170),
  mkNode("g-xor", "xor", "XOR", 240, 310),
  mkNode("g-not", "not", "NOT", 240, 440),
  mkNode("l-and", "lamp", "A·B", 470, 30),
  mkNode("l-or", "lamp", "A+B", 470, 170),
  mkNode("l-xor", "lamp", "A⊕B", 470, 310),
  mkNode("l-not", "lamp", "¬A", 470, 440),
]

function mkEdge(
  id: string,
  source: string,
  target: string,
  targetHandle: string,
): Edge {
  return { id, source, target, targetHandle }
}

const INITIAL_EDGES: Edge[] = [
  mkEdge("e1", "a", "g-and", "a"),
  mkEdge("e2", "b", "g-and", "b"),
  mkEdge("e3", "a", "g-or", "a"),
  mkEdge("e4", "b", "g-or", "b"),
  mkEdge("e5", "a", "g-xor", "a"),
  mkEdge("e6", "b", "g-xor", "b"),
  mkEdge("e7", "a", "g-not", "a"),
  mkEdge("e8", "g-and", "l-and", "in"),
  mkEdge("e9", "g-or", "l-or", "in"),
  mkEdge("e10", "g-xor", "l-xor", "in"),
  mkEdge("e11", "g-not", "l-not", "in"),
]

/* -------------------------------------------------------------------------- */
/*  Motor de simulação                                                        */
/* -------------------------------------------------------------------------- */

type Bit = 0 | 1

/**
 * Avalia o circuito propagando o sinal dos switches pelas portas até as
 * lâmpadas. Avaliação iterativa com ponto-fixo e guarda de iterações para
 * tolerar ciclos (que estabilizam ou param no limite). `switchOverride`
 * permite forçar valores de switch (usado pela tabela-verdade).
 */
function simulate(
  nodes: CircuitNode[],
  edges: Edge[],
  switchOverride?: Map<string, Bit>,
): Map<string, Bit> {
  const val = new Map<string, Bit>()
  for (const n of nodes) {
    if (n.type === "switch") {
      val.set(n.id, switchOverride?.get(n.id) ?? n.data.value)
    } else {
      val.set(n.id, 0)
    }
  }

  const inputValue = (target: string, handle: string): Bit => {
    let v: Bit = 0
    for (const e of edges) {
      if (e.target !== target) continue
      const h = e.targetHandle ?? "a"
      if (h !== handle) continue
      if (val.get(e.source) === 1) v = 1
    }
    return v
  }

  const lampValue = (target: string): Bit => {
    let v: Bit = 0
    for (const e of edges) {
      if (e.target === target && val.get(e.source) === 1) v = 1
    }
    return v
  }

  const maxIter = nodes.length + 2
  for (let iter = 0; iter < maxIter; iter += 1) {
    let changed = false
    for (const n of nodes) {
      if (n.type === "switch") continue
      const a = inputValue(n.id, "a") === 1
      const b = inputValue(n.id, "b") === 1
      let next: Bit = 0
      switch (n.type) {
        case "and":
          next = a && b ? 1 : 0
          break
        case "nand":
          next = a && b ? 0 : 1
          break
        case "or":
          next = a || b ? 1 : 0
          break
        case "nor":
          next = a || b ? 0 : 1
          break
        case "xor":
          next = a !== b ? 1 : 0
          break
        case "not":
          next = a ? 0 : 1
          break
        case "lamp":
          next = lampValue(n.id)
          break
        default:
          next = 0
      }
      if (val.get(n.id) !== next) {
        val.set(n.id, next)
        changed = true
      }
    }
    if (!changed) break
  }
  return val
}

/** Layout determinístico em colunas: switches | portas | lâmpadas. */
function columnsLayout(nodes: CircuitNode[]): CircuitNode[] {
  const colOf = (k: CircuitNodeKind): number =>
    k === "switch" ? 0 : k === "lamp" ? 2 : 1
  const COL_X = [0, 250, 500]
  const ROW = 130
  const counters = [0, 0, 0]
  return nodes.map((n) => {
    const c = colOf(n.type as CircuitNodeKind)
    const row = counters[c]
    counters[c] += 1
    return { ...n, position: { x: COL_X[c], y: row * ROW } }
  })
}

/* -------------------------------------------------------------------------- */
/*  Componente interno (dentro do ReactFlowProvider)                          */
/* -------------------------------------------------------------------------- */

const ON_STROKE = "#10b981"

function energizeEdge(edge: Edge, val: Map<string, Bit>): Edge {
  const on = val.get(edge.source) === 1
  return {
    ...edge,
    type: "smoothstep",
    animated: on,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: on
      ? { stroke: ON_STROKE, strokeWidth: 2.5 }
      : { stroke: "var(--muted-foreground)", strokeWidth: 1.5 },
  }
}

function CircuitSimulatorInner() {
  const { resolvedTheme } = useTheme()
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<CircuitNode>(INITIAL_NODES)
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
      switch: SwitchNode,
      and: AndNode,
      or: OrNode,
      not: NotNode,
      xor: XorNode,
      nand: NandNode,
      nor: NorNode,
      lamp: LampNode,
    }),
    [],
  )

  // Definidos antes do attach de onToggle (referência estável via ref).
  const applyRef = React.useRef<
    (baseNodes: CircuitNode[], baseEdges: Edge[]) => void
  >(() => {})
  const toggleSwitch = React.useCallback((id: string) => {
    const flipped = nodesRef.current.map((n) =>
      n.id === id && n.type === "switch"
        ? { ...n, data: { ...n.data, value: (n.data.value === 1 ? 0 : 1) as Bit } }
        : n,
    )
    applyRef.current(flipped, edgesRef.current)
  }, [])

  const withToggles = React.useCallback(
    (list: CircuitNode[]): CircuitNode[] =>
      list.map((n) =>
        n.type === "switch"
          ? { ...n, data: { ...n.data, onToggle: () => toggleSwitch(n.id) } }
          : n,
      ),
    [toggleSwitch],
  )

  const apply = React.useCallback(
    (baseNodes: CircuitNode[], baseEdges: Edge[]) => {
      const val = simulate(baseNodes, baseEdges)
      setNodes(
        withToggles(
          baseNodes.map((n) => ({
            ...n,
            data: { ...n.data, value: val.get(n.id) ?? 0 },
          })),
        ),
      )
      setEdges(baseEdges.map((e) => energizeEdge(e, val)))
    },
    [setNodes, setEdges, withToggles],
  )
  applyRef.current = apply

  // Simulação inicial (energiza fios + anexa toggles aos switches).
  React.useEffect(() => {
    apply(INITIAL_NODES, INITIAL_EDGES)
  }, [apply])

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  )

  const onConnect = React.useCallback(
    (connection: Connection) => {
      const next = addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${connection.targetHandle ?? "in"}`,
        },
        edgesRef.current,
      )
      apply(nodesRef.current, next)
    },
    [apply],
  )

  const onSelectionChange = React.useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedId(sel.length > 0 ? sel[0].id : null)
    },
    [],
  )

  const addNode = React.useCallback(
    (kind: CircuitNodeKind, position?: { x: number; y: number }) => {
      idRef.current += 1
      const id = `node-${idRef.current}`
      const pos = position ?? { x: 220, y: 40 + (idRef.current % 5) * 50 }
      const label =
        kind === "switch"
          ? `IN${idRef.current}`
          : DEFAULT_LABEL[kind]
      const next = nodesRef.current.concat(mkNode(id, kind, label, pos.x, pos.y))
      apply(next, edgesRef.current)
    },
    [apply],
  )

  const onDragStart = React.useCallback(
    (event: React.DragEvent, kind: CircuitNodeKind) => {
      event.dataTransfer.setData("application/circuit-kind", kind)
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
        "application/circuit-kind",
      ) as CircuitNodeKind
      if (!PALETTE.some((p) => p.kind === kind)) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addNode(kind, position)
    },
    [addNode, screenToFlowPosition],
  )

  const deleteNode = React.useCallback(
    (id: string) => {
      const nextNodes = nodesRef.current.filter((n) => n.id !== id)
      const nextEdges = edgesRef.current.filter(
        (e) => e.source !== id && e.target !== id,
      )
      apply(nextNodes, nextEdges)
      setSelectedId((cur) => (cur === id ? null : cur))
    },
    [apply],
  )

  const autoLayout = React.useCallback(() => {
    apply(columnsLayout(nodesRef.current), edgesRef.current)
    window.setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 60)
  }, [apply, fitView])

  // Tabela-verdade: varia todos os switches e tabula as saídas (lâmpadas).
  const truthTable = React.useMemo(() => {
    const switches = nodes
      .filter((n) => n.type === "switch")
      .sort((x, y) => x.data.label.localeCompare(y.data.label))
    const lamps = nodes
      .filter((n) => n.type === "lamp")
      .sort((x, y) => x.data.label.localeCompare(y.data.label))
    const tooMany = switches.length > 6
    const rows: { inputs: Bit[]; outputs: Bit[] }[] = []
    if (!tooMany && switches.length > 0 && lamps.length > 0) {
      const combos = 1 << switches.length
      for (let mask = 0; mask < combos; mask += 1) {
        const override = new Map<string, Bit>()
        const inputs: Bit[] = []
        switches.forEach((s, i) => {
          const bit: Bit = ((mask >> (switches.length - 1 - i)) & 1) as Bit
          override.set(s.id, bit)
          inputs.push(bit)
        })
        const val = simulate(nodes, edges, override)
        const outputs = lamps.map((l) => (val.get(l.id) ?? 0) as Bit)
        rows.push({ inputs, outputs })
      }
    }
    return {
      switches,
      lamps,
      rows,
      tooMany,
      empty: switches.length === 0 || lamps.length === 0,
    }
  }, [nodes, edges])

  const switchNodes = React.useMemo(
    () => nodes.filter((n) => n.type === "switch"),
    [nodes],
  )
  const lampNodes = React.useMemo(
    () => nodes.filter((n) => n.type === "lamp"),
    [nodes],
  )
  const litLamps = lampNodes.filter((n) => n.data.value === 1).length
  const gateCount = nodes.filter((n) =>
    GATE_KINDS.includes(n.type as GateKind),
  ).length

  return (
    <div
      data-slot="circuit-simulator"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CircuitBoard className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">
              Logic Circuit Simulator
            </p>
            <p className="text-[11px] text-muted-foreground">
              Propagação de sinal ao vivo
            </p>
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default" className="gap-1.5">
              <Plus className="size-4" /> Componente
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Adicionar ao canvas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PALETTE.map((item) => (
              <DropdownMenuItem key={item.kind} onSelect={() => addNode(item.kind)}>
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

        <div className="ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Table2 className="size-4" />
                <span className="hidden sm:inline">Tabela-verdade</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Tabela-verdade</DialogTitle>
                <DialogDescription>
                  Todas as combinações das entradas e a saída de cada lâmpada do
                  circuito atual.
                </DialogDescription>
              </DialogHeader>
              {truthTable.empty ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Adicione ao menos uma entrada e uma lâmpada para gerar a tabela.
                </p>
              ) : truthTable.tooMany ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Muitas entradas ({truthTable.switches.length}) para tabular —
                  reduza para 6 ou menos.
                </p>
              ) : (
                <div className="max-h-80 overflow-auto rounded-lg border border-border">
                  <table className="w-full border-collapse text-center text-sm">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                      <tr>
                        {truthTable.switches.map((s) => (
                          <th
                            key={s.id}
                            className="border-b border-border px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400"
                          >
                            {s.data.label}
                          </th>
                        ))}
                        {truthTable.lamps.map((l) => (
                          <th
                            key={l.id}
                            className="border-b border-l border-border px-3 py-2 font-semibold text-amber-600 dark:text-amber-400"
                          >
                            {l.data.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {truthTable.rows.map((row, ri) => (
                        <tr key={ri} className="odd:bg-muted/30">
                          {row.inputs.map((bit, i) => (
                            <td
                              key={i}
                              className="px-3 py-1.5 font-medium text-muted-foreground"
                            >
                              {bit}
                            </td>
                          ))}
                          {row.outputs.map((bit, i) => (
                            <td
                              key={i}
                              className={cn(
                                "border-l border-border px-3 py-1.5 font-semibold",
                                bit === 1
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground",
                              )}
                            >
                              {bit}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Corpo: paleta | canvas | painel */}
      <div className="flex min-h-0 flex-1">
        {/* Paleta */}
        <aside className="hidden w-52 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border bg-card/40 p-3 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Componentes
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
              className="group flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="size-4" />
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
            Clique numa{" "}
            <span className="font-medium text-foreground">entrada</span> para
            ligá-la e ver o sinal propagar.
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
                    MINIMAP_COLOR[(n.type as CircuitNodeKind) ?? "and"]
                  }
                />
              ) : null}
            </ReactFlow>
          </div>
        </div>

        {/* Painel direito */}
        <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-l border-border bg-card/40 p-4 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Entradas
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {switchNodes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma entrada no circuito.
              </p>
            ) : (
              switchNodes.map((s) => {
                const on = s.data.value === 1
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSwitch(s.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm shadow-sm transition-colors",
                      on
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Power
                        className={cn(
                          "size-4",
                          on
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      />
                      {s.data.label}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 text-xs font-semibold tabular-nums",
                        on
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {on ? "1" : "0"}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Saídas
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {lampNodes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma lâmpada no circuito.
              </p>
            ) : (
              lampNodes.map((l) => {
                const on = l.data.value === 1
                return (
                  <div
                    key={l.id}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm",
                      on
                        ? "border-amber-400/50 bg-amber-400/10"
                        : "border-border bg-card",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Lightbulb
                        className={cn(
                          "size-4",
                          on ? "text-amber-500" : "text-muted-foreground",
                        )}
                        fill={on ? "currentColor" : "none"}
                      />
                      {l.data.label}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 text-xs font-semibold tabular-nums",
                        on
                          ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {on ? "1" : "0"}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {selectedNode ? (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Selecionado
              </p>
              <div className="mt-2 rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-medium">
                  {selectedNode.data.label}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {selectedNode.type}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2 w-full gap-1.5"
                onClick={() => deleteNode(selectedNode.id)}
              >
                <Trash2 className="size-4" /> Excluir nó
              </Button>
            </div>
          ) : (
            <div className="mt-auto flex flex-col items-center gap-2 pt-6 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MousePointer2 className="size-4" />
              </span>
              <p className="max-w-[12rem] text-[11px] text-muted-foreground">
                Selecione um nó para excluí-lo. Ligue pontos para criar fios.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ToggleLeft className="size-3.5" /> {switchNodes.length} entradas
        </span>
        <span className="flex items-center gap-1.5">
          <CircuitBoard className="size-3.5" /> {gateCount} portas
        </span>
        <span className="flex items-center gap-1.5">
          <Lightbulb className="size-3.5" /> {litLamps}/{lampNodes.length} acesas
        </span>
        <span className="ml-auto hidden items-center gap-1.5 sm:flex">
          {edges.length} fios
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export function CircuitSimulator() {
  return (
    <ReactFlowProvider>
      <CircuitSimulatorInner />
    </ReactFlowProvider>
  )
}
