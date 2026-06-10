import * as React from "react"
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { reactFlowNodeTypes } from "@/components/ui/react-flow-node-types"

const PALETTE: { type: string; label: string; badge: string }[] = [
  { type: "shadcn", label: "Entrada", badge: "IN" },
  { type: "shadcn", label: "Processo", badge: "JOB" },
  { type: "shadcn", label: "Saída", badge: "OUT" },
]

const INITIAL_NODES: Node[] = [
  {
    id: "dnd-1",
    type: "shadcn",
    position: { x: 80, y: 120 },
    data: { label: "Entrada", description: "Arraste mais nós da paleta", badge: "IN" },
  },
]

let dndId = 100

function DragAndDropCanvas() {
  const { resolvedTheme } = useTheme()
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { screenToFlowPosition } = useReactFlow()

  const onConnect = React.useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  )

  const onDragStart = React.useCallback(
    (event: React.DragEvent, payload: (typeof PALETTE)[number]) => {
      event.dataTransfer.setData("application/reactflow", JSON.stringify(payload))
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
      const raw = event.dataTransfer.getData("application/reactflow")
      if (!raw) return
      const payload = JSON.parse(raw) as (typeof PALETTE)[number]
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      dndId += 1
      const newNode: Node = {
        id: `dnd-${dndId}`,
        type: payload.type,
        position,
        data: { label: payload.label, badge: payload.badge },
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes],
  )

  return (
    <div className="flex h-full w-full gap-3">
      <aside className="flex w-40 shrink-0 flex-col gap-2 rounded-lg border border-border bg-card p-3">
        <p className="text-xs font-medium text-muted-foreground">Paleta</p>
        {PALETTE.map((item) => (
          <div
            key={item.label}
            draggable
            onDragStart={(event) => onDragStart(event, item)}
            className="cursor-grab rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground active:cursor-grabbing"
          >
            {item.label}
          </div>
        ))}
      </aside>
      <div ref={wrapperRef} className="h-full flex-1 overflow-hidden rounded-lg border border-border">
        <ReactFlow
          colorMode={resolvedTheme}
          nodes={nodes}
          edges={edges}
          nodeTypes={reactFlowNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  )
}

/** Demo standalone do exemplo drag-and-drop (precisa de hooks do React Flow). */
export function ReactFlowDndDemo() {
  return (
    <div data-slot="react-flow" className="h-[500px] w-full">
      <ReactFlowProvider>
        <DragAndDropCanvas />
      </ReactFlowProvider>
    </div>
  )
}
