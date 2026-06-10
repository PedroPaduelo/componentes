import type { NodeTypes } from "@xyflow/react"

import { ShadcnCardNode } from "@/components/ui/react-flow-nodes"

/** `nodeTypes` default — registra o node shadcn sob a chave `"shadcn"`. */
export const reactFlowNodeTypes: NodeTypes = {
  shadcn: ShadcnCardNode,
}
