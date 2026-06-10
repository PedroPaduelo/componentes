/**
 * Composição "JSON Visualizer" (json-visualizer).
 *
 * Visualizador de JSON como GRAFO no estilo json-sea (altenull/json-sea),
 * construído sobre o React Flow (@xyflow/react) tematizado da vitrine.
 *
 * O DIFERENCIAL ("wow"): cola/edita um JSON no editor à esquerda e o grafo é
 * RECONSTRUÍDO — cada objeto/array vira um nó (campos primitivos inline,
 * coloridos por tipo) e cada chave/índice cujo valor é objeto/array vira uma
 * aresta para o nó filho. O layout em árvore (esquerda→direita) é determinístico
 * a partir da raiz, com `fitView` após reconstruir.
 *
 *  - Editor controlado (<textarea> mono) com JSON de exemplo, "Visualizar" e
 *    "Formatar". JSON inválido mostra erro na UI sem quebrar o grafo anterior.
 *  - Parser recursivo com IDs estáveis por caminho (`$.user.address`) — sem
 *    aleatoriedade — e guarda de profundidade.
 *  - Toolbar: Visualizar · Formatar · Carregar exemplo (2 prontos) · Ajustar à
 *    tela (fitView) · toggles Grade/MiniMap. Status: nº de nós e profundidade.
 *
 * Tema reativo via tokens shadcn; o canvas herda o tema pelo `colorMode`. No
 * mobile (<lg) o editor vira um painel no topo. Sem backend.
 */
import * as React from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Edge,
  type NodeTypes,
} from "@xyflow/react"
import {
  Braces,
  Play,
  WandSparkles,
  FileJson,
  Maximize2,
  Grid3x3,
  Map as MapIcon,
  AlertCircle,
  CheckCircle2,
  Share2,
  Layers,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import {
  JsonObjectNode,
  JsonArrayNode,
  type JsonField,
  type JsonGraphNode,
  type JsonNodeData,
  type JsonValueType,
} from "@/compositions/json-visualizer-nodes"

/* -------------------------------------------------------------------------- */
/*  Constantes de layout                                                      */
/* -------------------------------------------------------------------------- */

const COL_GAP = 340
const ROW_GAP = 150
const MAX_DEPTH = 16

const EDGE_BASE: Partial<Edge> = {
  type: "smoothstep",
  style: { stroke: "var(--muted-foreground)", strokeWidth: 1.5 },
}

/** Cor decorativa do MiniMap por tipo de nó (hex — não são tokens). */
const KIND_HEX = {
  object: "#6366f1",
  array: "#f59e0b",
} as const

/* -------------------------------------------------------------------------- */
/*  Exemplos                                                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLE_USER = `{
  "user": {
    "id": 1024,
    "name": "Ana Souza",
    "active": true,
    "address": {
      "city": "São Paulo",
      "zip": "01310-100",
      "geo": { "lat": -23.561, "lng": -46.656 }
    },
    "roles": ["admin", "editor"],
    "posts": [
      { "id": 1, "title": "Olá mundo", "likes": 42 },
      { "id": 2, "title": "React Flow", "likes": 87 }
    ]
  },
  "meta": { "version": "1.0", "generated": null }
}`

const EXAMPLE_API = `{
  "status": "ok",
  "page": 1,
  "results": [
    {
      "id": "a1",
      "type": "track",
      "title": "Nightfall",
      "artist": { "name": "Lumen", "verified": true },
      "tags": ["chill", "synth"]
    },
    {
      "id": "a2",
      "type": "album",
      "title": "Aurora",
      "tracks": 11,
      "artist": { "name": "Vela", "verified": false }
    }
  ],
  "pagination": { "next": 2, "total": 128, "hasMore": true }
}`

const EXAMPLES = [EXAMPLE_USER, EXAMPLE_API]

/* -------------------------------------------------------------------------- */
/*  Parser JSON → grafo                                                       */
/* -------------------------------------------------------------------------- */

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }

type ParseResult = {
  nodes: JsonGraphNode[]
  edges: Edge[]
  depth: number
}

function valueType(v: Json): JsonValueType {
  if (v === null) return "null"
  if (Array.isArray(v)) return "array"
  const t = typeof v
  if (t === "string") return "string"
  if (t === "number") return "number"
  if (t === "boolean") return "boolean"
  return "object"
}

function formatPrimitive(v: Json): string {
  if (v === null) return "null"
  if (typeof v === "string") return `"${v}"`
  return String(v)
}

/** Percorre o JSON gerando nós (objetos/arrays) e arestas para os filhos. */
function jsonToGraph(root: Json): ParseResult {
  const nodes: JsonGraphNode[] = []
  const edges: Edge[] = []
  let maxDepth = 0

  const walk = (value: Json, path: string, label: string, depth: number) => {
    if (depth > MAX_DEPTH) return
    maxDepth = Math.max(maxDepth, depth)

    const isArray = Array.isArray(value)
    const entries: Array<[string, Json]> = isArray
      ? (value as Json[]).map((v, i) => [String(i), v] as [string, Json])
      : Object.entries(value as { [key: string]: Json })

    const fields: JsonField[] = entries.map(([key, v]) => {
      const type = valueType(v)
      const isChild = type === "object" || type === "array"
      if (isChild) {
        const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`
        const handleId = `${path}::${key}`
        edges.push({
          id: `e:${childPath}`,
          source: path,
          sourceHandle: handleId,
          target: childPath,
          ...EDGE_BASE,
        })
        walk(v, childPath, isArray ? `${label}[${key}]` : key, depth + 1)
        return { key, type, value: "", isChild: true, handleId }
      }
      return { key, type, value: formatPrimitive(v), isChild: false }
    })

    const data: JsonNodeData = {
      kind: isArray ? "array" : "object",
      path,
      label,
      fields,
      size: entries.length,
      isRoot: depth === 0,
    }
    nodes.push({
      id: path,
      type: isArray ? "jsonArray" : "jsonObject",
      position: { x: 0, y: 0 },
      data,
    } as JsonGraphNode)
  }

  const rootType = valueType(root)
  if (rootType === "object" || rootType === "array") {
    walk(root, "$", "root", 0)
  } else {
    // Raiz primitiva: um único nó com o valor.
    const data: JsonNodeData = {
      kind: "object",
      path: "$",
      label: "root",
      fields: [
        {
          key: "value",
          type: rootType,
          value: formatPrimitive(root),
          isChild: false,
        },
      ],
      size: 1,
      isRoot: true,
    }
    nodes.push({
      id: "$",
      type: "jsonObject",
      position: { x: 0, y: 0 },
      data,
    } as JsonGraphNode)
  }

  return { nodes, edges, depth: maxDepth }
}

/** Layout em árvore horizontal determinístico (raiz à esquerda). */
function layoutTree(nodes: JsonGraphNode[], edges: Edge[]): JsonGraphNode[] {
  const children = new Map<string, string[]>()
  for (const e of edges) {
    const list = children.get(e.source) ?? []
    list.push(e.target)
    children.set(e.source, list)
  }
  const incoming = new Set(edges.map((e) => e.target))
  const roots = nodes.filter((n) => !incoming.has(n.id)).map((n) => n.id)

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
    cursor += 1
  }

  return nodes.map((n) => ({
    ...n,
    position: pos.get(n.id) ?? n.position,
  }))
}

/** Constrói grafo já posicionado a partir de um texto JSON. */
function buildGraph(text: string): {
  nodes: JsonGraphNode[]
  edges: Edge[]
  depth: number
} {
  const parsed = JSON.parse(text) as Json
  const { nodes, edges, depth } = jsonToGraph(parsed)
  return { nodes: layoutTree(nodes, edges), edges, depth }
}

const INITIAL = buildGraph(EXAMPLE_USER)

/* -------------------------------------------------------------------------- */
/*  Componente interno                                                        */
/* -------------------------------------------------------------------------- */

function JsonVisualizerInner() {
  const { resolvedTheme } = useTheme()
  const { fitView } = useReactFlow()

  const [text, setText] = React.useState(EXAMPLE_USER)
  const [error, setError] = React.useState<string | null>(null)
  const [depth, setDepth] = React.useState(INITIAL.depth)
  const [exampleIndex, setExampleIndex] = React.useState(0)
  const [showMiniMap, setShowMiniMap] = React.useState(true)
  const [showGrid, setShowGrid] = React.useState(true)

  const [nodes, setNodes, onNodesChange] = useNodesState<JsonGraphNode>(
    INITIAL.nodes,
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL.edges)

  const nodeTypes = React.useMemo<NodeTypes>(
    () => ({ jsonObject: JsonObjectNode, jsonArray: JsonArrayNode }),
    [],
  )

  const visualize = React.useCallback(
    (raw?: string) => {
      const source = raw ?? text
      try {
        const graph = buildGraph(source)
        setNodes(graph.nodes)
        setEdges(graph.edges)
        setDepth(graph.depth)
        setError(null)
        window.setTimeout(() => fitView({ duration: 400, padding: 0.18 }), 60)
      } catch (err) {
        setError(err instanceof Error ? err.message : "JSON inválido")
      }
    },
    [text, fitView, setNodes, setEdges],
  )

  const formatJson = React.useCallback(() => {
    try {
      const pretty = JSON.stringify(JSON.parse(text), null, 2)
      setText(pretty)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON inválido")
    }
  }, [text])

  const loadExample = React.useCallback(() => {
    const next = (exampleIndex + 1) % EXAMPLES.length
    setExampleIndex(next)
    const sample = EXAMPLES[next]
    setText(sample)
    visualize(sample)
  }, [exampleIndex, visualize])

  return (
    <div
      data-slot="json-visualizer"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Braces className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">JSON Visualizer</p>
            <p className="text-[11px] text-muted-foreground">
              JSON em grafo de nós
            </p>
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          size="sm"
          variant="default"
          className="gap-1.5"
          onClick={() => visualize()}
        >
          <Play className="size-4" />
          <span className="hidden sm:inline">Visualizar</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={formatJson}
        >
          <WandSparkles className="size-4" />
          <span className="hidden md:inline">Formatar</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={loadExample}
        >
          <FileJson className="size-4" />
          <span className="hidden md:inline">Carregar exemplo</span>
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => fitView({ duration: 400, padding: 0.18 })}
        >
          <Maximize2 className="size-4" />
          <span className="hidden lg:inline">Ajustar à tela</span>
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
      </div>

      {/* Corpo: editor | canvas */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Editor */}
        <div className="flex shrink-0 flex-col border-b border-border bg-card/40 lg:w-80 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Editor JSON
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {text.length} chars
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="Editor de JSON"
            className="h-40 w-full flex-1 resize-none bg-transparent px-3 pb-2 font-mono text-xs leading-relaxed text-foreground outline-none lg:h-auto"
          />
          {error ? (
            <div className="flex items-start gap-2 border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span className="min-w-0 break-words">JSON inválido: {error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>JSON válido</span>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="relative min-h-0 min-w-0 flex-1">
          <div data-slot="react-flow" className="absolute inset-0">
            <ReactFlow
              colorMode={resolvedTheme}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
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
                    const data = n.data as JsonNodeData
                    return data.isRoot ? "var(--primary)" : KIND_HEX[data.kind]
                  }}
                />
              ) : null}
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Braces className="size-3.5" /> {nodes.length} nós
        </span>
        <span className="flex items-center gap-1.5">
          <Share2 className="size-3.5" /> {edges.length} arestas
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="size-3.5" /> profundidade {depth}
        </span>
        <span className="ml-auto hidden truncate sm:inline">
          Edite o JSON e clique em{" "}
          <span className="font-medium text-foreground">Visualizar</span>
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export function JsonVisualizer() {
  return (
    <ReactFlowProvider>
      <JsonVisualizerInner />
    </ReactFlowProvider>
  )
}
