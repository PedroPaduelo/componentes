/**
 * Composição "Mind Map" (mind-map).
 *
 * Mapa mental interativo no estilo Ameliorate / DoubleLoop / Miro, construído
 * sobre o React Flow (@xyflow/react) já tematizado da vitrine. O foco é a
 * FLUIDEZ de criação/edição:
 *  - Canvas central <ReactFlow> (dentro de <ReactFlowProvider>) com Background
 *    pontilhado, Controls, MiniMap (cor por ramo) e `fitView`.
 *  - MindNode customizado: pílula arredondada; DUPLO-CLIQUE entra em edição
 *    inline (textarea autofocado, Enter/blur confirma, Escape cancela); botão
 *    "+" cria filho conectado (já em edição) e "×" remove a sub-árvore.
 *  - Criar: "+" no nó ou Tab com nó selecionado cria um filho; DUPLO-CLIQUE no
 *    canvas vazio cria um nó solto; "Adicionar ideia" cria uma ideia central.
 *  - Edges bezier suaves, não-direcionais (cor `muted-foreground`).
 *  - Excluir: Delete/Backspace com nó selecionado remove o nó e seus filhos.
 *  - Toolbar: Adicionar ideia · Auto-organizar (árvore determinística) · Ajustar
 *    à tela · toggles Grade/MiniMap · Exportar (outline Markdown ou JSON, com
 *    copiar). Inspetor leve à direita: renomear, cor do ramo e excluir.
 *
 * Determinístico (IDs por contador em ref, sem aleatoriedade); tema reativo via
 * tokens shadcn; o canvas herda o tema pelo `data-slot="react-flow"`. Sem backend.
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
  type Edge,
  type NodeTypes,
  type Connection,
  type OnSelectionChangeParams,
} from "@xyflow/react"
import {
  Lightbulb,
  Plus,
  Network,
  Maximize2,
  Map as MapIcon,
  Grid3x3,
  Share2,
  Trash2,
  Copy,
  Check,
  MousePointer2,
  ListTree,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MindNode,
  type MindNodeType,
  type MindNodeData,
  type MindBranchColor,
} from "@/compositions/mind-map-nodes"

/* -------------------------------------------------------------------------- */
/*  Modelo / dados                                                            */
/* -------------------------------------------------------------------------- */

const COL_GAP = 240
const ROW_GAP = 70

/** Ordem das cores atribuídas aos ramos diretos da raiz. */
const BRANCH_PALETTE: MindBranchColor[] = [
  "sky",
  "violet",
  "emerald",
  "amber",
  "rose",
  "teal",
]

/** Cor decorativa do MiniMap por ramo (hex — não são tokens de tema). */
const BRANCH_HEX: Record<MindBranchColor, string> = {
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  teal: "#14b8a6",
}

const EDGE_BASE: Partial<Edge> = {
  type: "default",
  style: { stroke: "var(--muted-foreground)", strokeWidth: 1.5 },
}

type RawNode = {
  id: string
  label: string
  depth: number
  color: MindBranchColor
}

const RAW_NODES: RawNode[] = [
  { id: "n1", label: "Lançamento do Produto", depth: 0, color: "sky" },
  { id: "n2", label: "Marketing", depth: 1, color: "sky" },
  { id: "n3", label: "Engenharia", depth: 1, color: "violet" },
  { id: "n4", label: "Design", depth: 1, color: "emerald" },
  { id: "n5", label: "Vendas", depth: 1, color: "amber" },
  { id: "n6", label: "Campanha de lançamento", depth: 2, color: "sky" },
  { id: "n7", label: "Redes sociais", depth: 2, color: "sky" },
  { id: "n8", label: "API pública", depth: 2, color: "violet" },
  { id: "n9", label: "Infra & escala", depth: 2, color: "violet" },
  { id: "n10", label: "Identidade visual", depth: 2, color: "emerald" },
  { id: "n11", label: "Parcerias", depth: 2, color: "amber" },
  { id: "n12", label: "Onboarding", depth: 2, color: "amber" },
]

const INITIAL_EDGES: Edge[] = [
  { id: "e1", source: "n1", target: "n2", ...EDGE_BASE },
  { id: "e2", source: "n1", target: "n3", ...EDGE_BASE },
  { id: "e3", source: "n1", target: "n4", ...EDGE_BASE },
  { id: "e4", source: "n1", target: "n5", ...EDGE_BASE },
  { id: "e5", source: "n2", target: "n6", ...EDGE_BASE },
  { id: "e6", source: "n2", target: "n7", ...EDGE_BASE },
  { id: "e7", source: "n3", target: "n8", ...EDGE_BASE },
  { id: "e8", source: "n3", target: "n9", ...EDGE_BASE },
  { id: "e9", source: "n4", target: "n10", ...EDGE_BASE },
  { id: "e10", source: "n5", target: "n11", ...EDGE_BASE },
  { id: "e11", source: "n5", target: "n12", ...EDGE_BASE },
]

/* -------------------------------------------------------------------------- */
/*  Helpers de grafo                                                          */
/* -------------------------------------------------------------------------- */

function childrenMap(edges: Edge[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const e of edges) {
    const list = map.get(e.source) ?? []
    list.push(e.target)
    map.set(e.source, list)
  }
  return map
}

function rootIds(nodes: MindNodeType[], edges: Edge[]): string[] {
  const incoming = new Set(edges.map((e) => e.target))
  return nodes.filter((n) => !incoming.has(n.id)).map((n) => n.id)
}

/** Layout em árvore horizontal determinístico (raiz à esquerda, cresce à direita). */
function tidyTreeLayout(
  nodes: MindNodeType[],
  edges: Edge[],
): MindNodeType[] {
  const children = childrenMap(edges)
  const roots = rootIds(nodes, edges)
  const pos = new Map<string, { x: number; y: number }>()
  const visited = new Set<string>()
  let cursor = 0

  const place = (id: string, depth: number): number => {
    if (visited.has(id)) return cursor * ROW_GAP
    visited.add(id)
    const kids = (children.get(id) ?? []).filter((k) => !visited.has(k))
    let y: number
    if (kids.length === 0) {
      y = cursor * ROW_GAP
      cursor += 1
    } else {
      const ys = kids.map((k) => place(k, depth + 1))
      y = (ys[0] + ys[ys.length - 1]) / 2
    }
    pos.set(id, { x: depth * COL_GAP, y })
    return y
  }

  for (const r of roots) {
    place(r, 0)
    cursor += 1 // espaço entre árvores independentes
  }

  return nodes.map((n) => ({
    ...n,
    position: pos.get(n.id) ?? n.position,
  }))
}

/** Profundidade de cada nó por BFS a partir das raízes. */
function computeDepths(nodes: MindNodeType[], edges: Edge[]): Map<string, number> {
  const children = childrenMap(edges)
  const depth = new Map<string, number>()
  const queue: Array<{ id: string; d: number }> = rootIds(nodes, edges).map(
    (id) => ({ id, d: 0 }),
  )
  while (queue.length > 0) {
    const { id, d } = queue.shift() as { id: string; d: number }
    if (depth.has(id)) continue
    depth.set(id, d)
    for (const c of children.get(id) ?? []) queue.push({ id: c, d: d + 1 })
  }
  for (const n of nodes) if (!depth.has(n.id)) depth.set(n.id, 0)
  return depth
}

/** Coleta a sub-árvore (inclui o próprio id) a partir das arestas. */
function subtreeIds(start: string, edges: Edge[]): Set<string> {
  const children = childrenMap(edges)
  const ids = new Set<string>([start])
  const stack = [start]
  while (stack.length > 0) {
    const id = stack.pop() as string
    for (const c of children.get(id) ?? []) {
      if (!ids.has(c)) {
        ids.add(c)
        stack.push(c)
      }
    }
  }
  return ids
}

/** Outline Markdown a partir da hierarquia. */
function toMarkdown(nodes: MindNodeType[], edges: Edge[]): string {
  const children = childrenMap(edges)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const lines: string[] = []
  const visited = new Set<string>()
  const walk = (id: string, depth: number) => {
    if (visited.has(id)) return
    visited.add(id)
    const node = byId.get(id)
    if (!node) return
    lines.push(`${"  ".repeat(depth)}- ${node.data.label}`)
    for (const c of children.get(id) ?? []) walk(c, depth + 1)
  }
  for (const r of rootIds(nodes, edges)) walk(r, 0)
  return lines.join("\n")
}

/** JSON serializável do mapa. */
function toJson(nodes: MindNodeType[], edges: Edge[]): string {
  return JSON.stringify(
    {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        depth: n.data.depth,
        color: n.data.color,
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    },
    null,
    2,
  )
}

/** Constrói os nós iniciais com posições do layout em árvore. */
function buildInitialNodes(): MindNodeType[] {
  const base: MindNodeType[] = RAW_NODES.map((r) => ({
    id: r.id,
    type: "mind",
    position: { x: 0, y: 0 },
    data: { label: r.label, depth: r.depth, color: r.color },
  }))
  return tidyTreeLayout(base, INITIAL_EDGES)
}

const INITIAL_NODES = buildInitialNodes()

/* -------------------------------------------------------------------------- */
/*  Componente interno (dentro do ReactFlowProvider)                          */
/* -------------------------------------------------------------------------- */

function MindMapInner() {
  const { resolvedTheme } = useTheme()
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<MindNodeType>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [showMiniMap, setShowMiniMap] = React.useState(true)
  const [showGrid, setShowGrid] = React.useState(true)
  const [exportFormat, setExportFormat] = React.useState<"markdown" | "json">(
    "markdown",
  )
  const [copied, setCopied] = React.useState(false)

  const idRef = React.useRef(RAW_NODES.length)

  const nodeTypes = React.useMemo<NodeTypes>(() => ({ mind: MindNode }), [])

  const startEdit = React.useCallback((id: string) => setEditingId(id), [])
  const stopEdit = React.useCallback(() => setEditingId(null), [])

  const changeLabel = React.useCallback(
    (id: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n,
        ),
      )
    },
    [setNodes],
  )

  const addChild = React.useCallback(
    (parentId: string) => {
      idRef.current += 1
      const childId = `node-${idRef.current}`
      setNodes((nds) => {
        const parent = nds.find((n) => n.id === parentId)
        if (!parent) return nds
        const siblings = edges.filter((e) => e.source === parentId).length
        const depth = parent.data.depth + 1
        const color: MindBranchColor =
          parent.data.depth === 0
            ? BRANCH_PALETTE[siblings % BRANCH_PALETTE.length]
            : parent.data.color
        const child: MindNodeType = {
          id: childId,
          type: "mind",
          position: {
            x: parent.position.x + COL_GAP,
            y: parent.position.y + (siblings - 0.5) * ROW_GAP,
          },
          data: { label: "Nova ideia", depth, color },
        }
        return nds.concat(child)
      })
      setEdges((eds) =>
        addEdge(
          { id: `e-${parentId}-${childId}`, source: parentId, target: childId, ...EDGE_BASE },
          eds,
        ),
      )
      setSelectedId(childId)
      setEditingId(childId)
    },
    [edges, setNodes, setEdges],
  )

  const addLooseNode = React.useCallback(
    (position: { x: number; y: number }) => {
      idRef.current += 1
      const id = `node-${idRef.current}`
      const node: MindNodeType = {
        id,
        type: "mind",
        position,
        data: { label: "Nova ideia", depth: 0, color: "sky" },
      }
      setNodes((nds) => nds.concat(node))
      setSelectedId(id)
      setEditingId(id)
    },
    [setNodes],
  )

  const deleteSubtree = React.useCallback(
    (id: string) => {
      const toRemove = subtreeIds(id, edges)
      setNodes((nds) => nds.filter((n) => !toRemove.has(n.id)))
      setEdges((eds) =>
        eds.filter((e) => !toRemove.has(e.source) && !toRemove.has(e.target)),
      )
      setSelectedId(null)
      setEditingId(null)
    },
    [edges, setNodes, setEdges],
  )

  const recolorSubtree = React.useCallback(
    (id: string, color: MindBranchColor) => {
      const ids = subtreeIds(id, edges)
      setNodes((nds) =>
        nds.map((n) =>
          ids.has(n.id) ? { ...n, data: { ...n.data, color } } : n,
        ),
      )
    },
    [edges, setNodes],
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
      // recalcula profundidade dos nós após nova conexão
      window.setTimeout(() => {
        setEdges((eds) => {
          setNodes((nds) => {
            const depths = computeDepths(nds, eds)
            return nds.map((n) => ({
              ...n,
              data: { ...n.data, depth: depths.get(n.id) ?? n.data.depth },
            }))
          })
          return eds
        })
      }, 0)
    },
    [setEdges, setNodes],
  )

  const onSelectionChange = React.useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedId(sel.length > 0 ? sel[0].id : null)
    },
    [],
  )

  const autoLayout = React.useCallback(() => {
    setNodes((nds) => {
      const depths = computeDepths(nds, edges)
      const withDepth = nds.map((n) => ({
        ...n,
        data: { ...n.data, depth: depths.get(n.id) ?? n.data.depth },
      }))
      return tidyTreeLayout(withDepth, edges)
    })
    window.setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 60)
  }, [edges, fitView, setNodes])

  const onPaneDoubleClick = React.useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement
      // só cria nó solto quando o duplo-clique foi no pane (não num nó)
      if (!target.classList.contains("react-flow__pane")) return
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addLooseNode(position)
    },
    [addLooseNode, screenToFlowPosition],
  )

  // Atalhos de teclado: Tab cria filho, Delete/Backspace remove sub-árvore.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingId) return
      const active = document.activeElement
      const tag = active?.tagName.toLowerCase()
      if (tag === "input" || tag === "textarea") return
      if (!selectedId) return
      if (e.key === "Tab") {
        e.preventDefault()
        addChild(selectedId)
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteSubtree(selectedId)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, editingId, addChild, deleteSubtree])

  // Injeta callbacks + flag de edição no `data` a cada render (campos voláteis).
  const rfNodes = React.useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          editing: n.id === editingId,
          onStartEdit: startEdit,
          onChange: changeLabel,
          onStopEdit: stopEdit,
          onAddChild: addChild,
          onDelete: deleteSubtree,
        } satisfies MindNodeData,
      })),
    [nodes, editingId, startEdit, changeLabel, stopEdit, addChild, deleteSubtree],
  )

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  )

  const exportText = React.useMemo(
    () =>
      exportFormat === "markdown" ? toMarkdown(nodes, edges) : toJson(nodes, edges),
    [exportFormat, nodes, edges],
  )

  const copyExport = React.useCallback(() => {
    void navigator.clipboard?.writeText(exportText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }, [exportText])

  return (
    <div
      data-slot="mind-map"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Lightbulb className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">Mind Map</p>
            <p className="text-[11px] text-muted-foreground">
              Brainstorm visual
            </p>
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          size="sm"
          variant="default"
          className="gap-1.5"
          onClick={() =>
            addLooseNode({ x: 40, y: 40 + (idRef.current % 6) * 30 })
          }
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Adicionar ideia</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={autoLayout}
        >
          <Network className="size-4" />
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
          variant={showGrid ? "secondary" : "ghost"}
          aria-pressed={showGrid}
          className="gap-1.5"
          onClick={() => setShowGrid((v) => !v)}
        >
          <Grid3x3 className="size-4" />
          <span className="hidden lg:inline">Grade</span>
        </Button>
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

        <div className="ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Share2 className="size-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Exportar mapa mental</DialogTitle>
                <DialogDescription>
                  Gere um outline em Markdown a partir da hierarquia, ou o JSON
                  estruturado do mapa.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={exportFormat === "markdown" ? "default" : "outline"}
                  className="gap-1.5"
                  onClick={() => setExportFormat("markdown")}
                >
                  <ListTree className="size-4" /> Markdown
                </Button>
                <Button
                  size="sm"
                  variant={exportFormat === "json" ? "default" : "outline"}
                  onClick={() => setExportFormat("json")}
                >
                  JSON
                </Button>
              </div>
              <div className="relative">
                <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-muted/50 p-3 text-[11px] leading-relaxed">
                  <code>{exportText}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2 gap-1.5"
                  onClick={copyExport}
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

      {/* Corpo: canvas | inspetor */}
      <div className="flex min-h-0 flex-1">
        {/* Canvas */}
        <div className="relative min-w-0 flex-1" onDoubleClick={onPaneDoubleClick}>
          <div data-slot="react-flow" className="absolute inset-0">
            <ReactFlow
              colorMode={resolvedTheme}
              nodes={rfNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              deleteKeyCode={null}
              fitView
              minZoom={0.2}
              proOptions={{ hideAttribution: true }}
            >
              {showGrid ? (
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              ) : null}
              <Controls />
              {showMiniMap ? (
                <MiniMap
                  pannable
                  zoomable
                  nodeColor={(n) => {
                    const data = n.data as MindNodeData
                    return data.depth === 0
                      ? "var(--primary)"
                      : BRANCH_HEX[data.color]
                  }}
                />
              ) : null}
            </ReactFlow>
          </div>
        </div>

        {/* Inspetor leve */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card/40 p-4 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inspetor
          </p>
          {selectedNode ? (
            <div className="mt-3 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Texto da ideia
                </span>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => changeLabel(selectedNode.id, e.target.value)}
                />
              </label>

              {selectedNode.data.depth > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Cor do ramo
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {BRANCH_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Cor ${color}`}
                        aria-pressed={selectedNode.data.color === color}
                        onClick={() => recolorSubtree(selectedNode.id, color)}
                        className="relative flex size-7 items-center justify-center rounded-full border border-border transition-transform hover:scale-110"
                      >
                        <span
                          className="size-4 rounded-full"
                          style={{ backgroundColor: BRANCH_HEX[color] }}
                        />
                        {selectedNode.data.color === color ? (
                          <Check className="absolute size-3.5 text-white" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => addChild(selectedNode.id)}
              >
                <Plus className="size-4" /> Adicionar filho
              </Button>

              {selectedNode.data.depth > 0 ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => deleteSubtree(selectedNode.id)}
                >
                  <Trash2 className="size-4" /> Excluir ramo
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MousePointer2 className="size-5" />
              </span>
              <p className="text-sm font-medium">Nenhum nó selecionado</p>
              <p className="max-w-[13rem] text-xs text-muted-foreground">
                Duplo-clique num nó para editar, no "+" para criar um filho, ou
                no canvas vazio para uma ideia solta.
              </p>
            </div>
          )}

          <div className="mt-auto rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            Dica: <span className="font-medium text-foreground">Tab</span> cria
            um filho do nó selecionado e{" "}
            <span className="font-medium text-foreground">Delete</span> remove o
            ramo.
          </div>
        </aside>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Lightbulb className="size-3.5" /> {nodes.length} ideias
        </span>
        <span className="flex items-center gap-1.5">
          <Share2 className="size-3.5" /> {edges.length} conexões
        </span>
        <span className="ml-auto hidden truncate sm:inline">
          {selectedNode ? (
            <>
              Selecionado:{" "}
              <span className="font-medium text-foreground">
                {selectedNode.data.label}
              </span>
            </>
          ) : (
            "Duplo-clique para editar · Tab cria filho"
          )}
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export function MindMap() {
  return (
    <ReactFlowProvider>
      <MindMapInner />
    </ReactFlowProvider>
  )
}
