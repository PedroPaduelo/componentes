import { MarkerType, type Edge, type Node } from "@xyflow/react"

import { ReactFlowDiagram } from "@/components/ui/react-flow"
import { reactFlowNodeTypes } from "@/components/ui/react-flow-node-types"
import { ReactFlowInteractiveDemo } from "@/data/react-flow-demos"
import { ReactFlowDndDemo } from "@/data/react-flow-dnd-demo"
import type { Example } from "@/data/examples"

/* ------------------------------- 2. custom node ------------------------------ */

const customNodes: Node[] = [
  {
    id: "c1",
    type: "shadcn",
    position: { x: 40, y: 40 },
    data: { label: "API Gateway", description: "Roteia requisições externas", badge: "edge" },
  },
  {
    id: "c2",
    type: "shadcn",
    position: { x: 320, y: 40 },
    data: { label: "Auth Service", description: "Valida tokens JWT", badge: "core" },
  },
  {
    id: "c3",
    type: "shadcn",
    position: { x: 180, y: 220 },
    data: { label: "Postgres", description: "Persistência de usuários", badge: "db" },
  },
]

const customEdges: Edge[] = [
  { id: "ce1", source: "c1", target: "c2", animated: true },
  { id: "ce2", source: "c2", target: "c3" },
]

/* -------------------------------- 3. flowchart ------------------------------- */

const flowNodes: Node[] = [
  { id: "f1", position: { x: 180, y: 0 }, data: { label: "Início" }, style: { borderRadius: 999 } },
  { id: "f2", position: { x: 160, y: 100 }, data: { label: "Pagamento aprovado?" } },
  { id: "f3", position: { x: 0, y: 220 }, data: { label: "Enviar pedido" } },
  { id: "f4", position: { x: 320, y: 220 }, data: { label: "Cancelar" } },
]

const flowEdges: Edge[] = [
  { id: "fe1", source: "f1", target: "f2", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "fe2", source: "f2", target: "f3", label: "sim", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "fe3", source: "f2", target: "f4", label: "não", markerEnd: { type: MarkerType.ArrowClosed } },
]

/* -------------------------------- 4. org chart ------------------------------- */

const orgNodes: Node[] = [
  { id: "o1", type: "shadcn", position: { x: 220, y: 0 }, data: { label: "CEO", badge: "C-level" } },
  { id: "o2", type: "shadcn", position: { x: 60, y: 140 }, data: { label: "CTO", badge: "eng" } },
  { id: "o3", type: "shadcn", position: { x: 380, y: 140 }, data: { label: "CFO", badge: "fin" } },
  { id: "o4", type: "shadcn", position: { x: 0, y: 280 }, data: { label: "Frontend" } },
  { id: "o5", type: "shadcn", position: { x: 180, y: 280 }, data: { label: "Backend" } },
]

const orgEdges: Edge[] = [
  { id: "oe1", source: "o1", target: "o2", type: "smoothstep" },
  { id: "oe2", source: "o1", target: "o3", type: "smoothstep" },
  { id: "oe3", source: "o2", target: "o4", type: "smoothstep" },
  { id: "oe4", source: "o2", target: "o5", type: "smoothstep" },
]

/* ------------------------------ 6. animated edges ---------------------------- */

const animatedNodes: Node[] = [
  { id: "a1", position: { x: 40, y: 100 }, data: { label: "Produtor" } },
  { id: "a2", position: { x: 260, y: 30 }, data: { label: "Fila" } },
  { id: "a3", position: { x: 260, y: 180 }, data: { label: "Worker" } },
  { id: "a4", position: { x: 480, y: 100 }, data: { label: "Consumidor" } },
]

const animatedEdges: Edge[] = [
  { id: "ae1", source: "a1", target: "a2", animated: true },
  { id: "ae2", source: "a1", target: "a3", animated: true, type: "smoothstep" },
  { id: "ae3", source: "a2", target: "a4", animated: true, type: "step" },
  { id: "ae4", source: "a3", target: "a4", animated: true, type: "smoothstep" },
]

/* ------------------------------------------------------------------ examples */

const interactiveExample: Example = {
  title: "Diagrama interativo",
  description:
    "Nós e arestas com estado (useNodesState/useEdgesState). Arraste os nós, conecte handles e use MiniMap + Controls + Background.",
  code: `import {
  ReactFlowDiagram,
} from "@/components/ui/react-flow"
import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
} from "@xyflow/react"

function Demo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = (c: Connection) =>
    setEdges((eds) => addEdge(c, eds))

  return (
    <ReactFlowDiagram
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  )
}`,
  render: (
    <div className="h-[500px] w-full">
      <ReactFlowInteractiveDemo />
    </div>
  ),
}

const customNodeExample: Example = {
  title: "Custom node shadcn",
  description:
    "Nós tematizados com tokens shadcn (bg-card, border-border) e handles em bg-primary, via nodeTypes.",
  code: `import { ReactFlowDiagram } from "@/components/ui/react-flow"
import { reactFlowNodeTypes } from "@/components/ui/react-flow-nodes"

const nodes = [
  {
    id: "c1",
    type: "shadcn",
    position: { x: 40, y: 40 },
    data: { label: "API Gateway", description: "Roteia requisições", badge: "edge" },
  },
  // ...
]

<ReactFlowDiagram
  nodes={nodes}
  edges={edges}
  nodeTypes={reactFlowNodeTypes}
/>`,
  render: (
    <div className="h-[500px] w-full">
      <ReactFlowDiagram nodes={customNodes} edges={customEdges} nodeTypes={reactFlowNodeTypes} />
    </div>
  ),
}

const flowchartExample: Example = {
  title: "Flowchart",
  description:
    "Fluxo com nó de decisão e arestas rotuladas (sim/não) com setas direcionais (markerEnd).",
  code: `import { MarkerType } from "@xyflow/react"

const edges = [
  { id: "fe1", source: "f1", target: "f2", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "fe2", source: "f2", target: "f3", label: "sim", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "fe3", source: "f2", target: "f4", label: "não", markerEnd: { type: MarkerType.ArrowClosed } },
]

<ReactFlowDiagram nodes={nodes} edges={edges} showMiniMap={false} />`,
  render: (
    <div className="h-[500px] w-full">
      <ReactFlowDiagram nodes={flowNodes} edges={flowEdges} showMiniMap={false} />
    </div>
  ),
}

const orgChartExample: Example = {
  title: "Organograma hierárquico",
  description:
    "Layout em árvore com posições calculadas e arestas smoothstep ligando os níveis.",
  code: `const nodes = [
  { id: "o1", type: "shadcn", position: { x: 220, y: 0 }, data: { label: "CEO", badge: "C-level" } },
  { id: "o2", type: "shadcn", position: { x: 60, y: 140 }, data: { label: "CTO", badge: "eng" } },
  // ...
]
const edges = [
  { id: "oe1", source: "o1", target: "o2", type: "smoothstep" },
  // ...
]

<ReactFlowDiagram nodes={nodes} edges={edges} nodeTypes={reactFlowNodeTypes} />`,
  render: (
    <div className="h-[500px] w-full">
      <ReactFlowDiagram nodes={orgNodes} edges={orgEdges} nodeTypes={reactFlowNodeTypes} />
    </div>
  ),
}

const dragAndDropExample: Example = {
  title: "Drag and drop",
  description:
    "Paleta lateral arrastando nós para o canvas (onDrop/onDragOver + screenToFlowPosition via useReactFlow).",
  code: `import { useReactFlow } from "@xyflow/react"

function Canvas() {
  const { screenToFlowPosition } = useReactFlow()

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const payload = JSON.parse(
      event.dataTransfer.getData("application/reactflow"),
    )
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })
    setNodes((nds) => nds.concat({ id, type: payload.type, position, data: { label: payload.label } }))
  }

  return <ReactFlow onDrop={onDrop} onDragOver={onDragOver} ... />
}`,
  render: (
    <div className="h-[500px] w-full">
      <ReactFlowDndDemo />
    </div>
  ),
}

const animatedEdgesExample: Example = {
  title: "Arestas animadas",
  description:
    "Arestas com animated: true e tipos diferentes (default, smoothstep, step) mostrando o pulse de fluxo.",
  code: `const edges = [
  { id: "ae1", source: "a1", target: "a2", animated: true },
  { id: "ae2", source: "a1", target: "a3", animated: true, type: "smoothstep" },
  { id: "ae3", source: "a2", target: "a4", animated: true, type: "step" },
  { id: "ae4", source: "a3", target: "a4", animated: true, type: "smoothstep" },
]

<ReactFlowDiagram nodes={nodes} edges={edges} />`,
  render: (
    <div className="h-[500px] w-full">
      <ReactFlowDiagram nodes={animatedNodes} edges={animatedEdges} />
    </div>
  ),
}

export const examplesReactFlow: Record<string, Example[]> = {
  "react-flow": [
    interactiveExample,
    customNodeExample,
    flowchartExample,
    orgChartExample,
    dragAndDropExample,
    animatedEdgesExample,
  ],
}
