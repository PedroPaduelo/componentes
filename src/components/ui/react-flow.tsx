import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"
import { reactFlowNodeTypes } from "@/components/ui/react-flow-node-types"
import type { ReactFlowDiagramProps } from "@/components/ui/react-flow-types"

/**
 * ReactFlowDiagram — suite de diagramas (React Flow / @xyflow/react)
 * padronizada para a vitrine shadcn.
 *
 * - Embrulha `ReactFlowProvider` + `ReactFlow` num container com altura fixa.
 * - `colorMode={resolvedTheme}` alterna a base clara/escura do React Flow;
 *   o ajuste fino vem dos overrides de token `--xy-*` em `src/index.css`.
 * - Background/Controls/MiniMap são opt-out via props booleanas.
 */
function ReactFlowDiagram({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes = reactFlowNodeTypes,
  edgeTypes,
  fitView = true,
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  nodesDraggable = true,
  nodesConnectable = true,
  className,
  ...rest
}: ReactFlowDiagramProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div
      data-slot="react-flow"
      className={cn(
        "h-[500px] w-full overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
      {...rest}
    >
      <ReactFlowProvider>
        <ReactFlow
          colorMode={resolvedTheme}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={fitView}
          nodesDraggable={nodesDraggable}
          nodesConnectable={nodesConnectable}
          proOptions={{ hideAttribution: true }}
        >
          {showBackground ? (
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          ) : null}
          {showControls ? <Controls /> : null}
          {showMiniMap ? <MiniMap pannable zoomable /> : null}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}

export { ReactFlowDiagram }
