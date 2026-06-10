import * as React from "react"
import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"

import { ReactFlowDiagram } from "@/components/ui/react-flow"

const INTERACTIVE_NODES: Node[] = [
  { id: "1", position: { x: 60, y: 40 }, data: { label: "Início" } },
  { id: "2", position: { x: 280, y: 40 }, data: { label: "Etapa A" } },
  { id: "3", position: { x: 170, y: 180 }, data: { label: "Fim" } },
]

const INTERACTIVE_EDGES: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3", animated: true },
]

/**
 * Demo interativo: estado de nós/arestas controlado com `useNodesState`/
 * `useEdgesState` e novas conexões via `onConnect` + `addEdge`.
 */
export function ReactFlowInteractiveDemo() {
  const [nodes, , onNodesChange] = useNodesState<Node>(INTERACTIVE_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INTERACTIVE_EDGES)

  const onConnect = React.useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  )

  return (
    <ReactFlowDiagram
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  )
}
