import type {
  Edge,
  EdgeTypes,
  Node,
  NodeTypes,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react"

/**
 * Props do wrapper `ReactFlowDiagram` — suite de diagramas tematizada shadcn.
 *
 * Embrulha `ReactFlowProvider` + `ReactFlow`, expõe controles booleanos para
 * Background/Controls/MiniMap e repassa o restante das props ao container raiz.
 */
export type ReactFlowDiagramProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Nós do grafo. */
  nodes: Node[]
  /** Arestas do grafo. */
  edges: Edge[]
  /** Handler de mudança de nós (drag, seleção, remoção). */
  onNodesChange?: OnNodesChange
  /** Handler de mudança de arestas. */
  onEdgesChange?: OnEdgesChange
  /** Handler de conexão (ao ligar dois handles). */
  onConnect?: OnConnect
  /** Mapa de tipos de nós customizados. */
  nodeTypes?: NodeTypes
  /** Mapa de tipos de arestas customizadas. */
  edgeTypes?: EdgeTypes
  /** Ajusta a viewport para enquadrar todo o grafo. Default: `true`. */
  fitView?: boolean
  /** Exibe o MiniMap (canto inferior direito). Default: `true`. */
  showMiniMap?: boolean
  /** Exibe os Controls (zoom/fit/lock). Default: `true`. */
  showControls?: boolean
  /** Exibe o Background pontilhado. Default: `true`. */
  showBackground?: boolean
  /** Permite arrastar nós. Default: `true`. */
  nodesDraggable?: boolean
  /** Permite criar conexões. Default: `true`. */
  nodesConnectable?: boolean
}

/** Formato do `data` do nó shadcn customizado. */
export type ShadcnNodeData = {
  /** Título em destaque do node. */
  label: string
  /** Subtítulo/descrição opcional. */
  description?: string
  /** Texto curto de badge opcional (canto superior). */
  badge?: string
}

export type ShadcnNode = Node<ShadcnNodeData, "shadcn">
