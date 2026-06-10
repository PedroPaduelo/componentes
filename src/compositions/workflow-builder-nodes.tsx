/**
 * Custom nodes da composição "Workflow Builder" (React Flow / @xyflow/react).
 *
 * Quatro tipos visualmente distintos — `trigger`, `action`, `condition` e
 * `output` — cada um um Card shadcn (`bg-card`/`border-border`) com chip de
 * ícone colorido, título, subtítulo e Handles tematizados (`bg-primary`).
 * Estados: selecionado (`ring-2 ring-ring`) e "executando" (`data.running`).
 *
 * Exporta SÓ componentes + tipos (sem const runtime) para respeitar a regra
 * `react-refresh/only-export-components`. O mapa `nodeTypes` é montado na
 * composição principal.
 */
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import {
  Webhook,
  Mail,
  Cloud,
  Database,
  GitBranch,
  Filter,
  Clock,
  CheckCircle2,
  Bell,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

/** Tipos de nó suportados pelo builder. */
export type WorkflowNodeKind = "trigger" | "action" | "condition" | "output"

/** Chave de ícone (string serializável — segura para exportar em JSON). */
export type WorkflowIconKey =
  | "webhook"
  | "mail"
  | "cloud"
  | "database"
  | "branch"
  | "filter"
  | "clock"
  | "check"
  | "bell"

/** Formato do `data` de cada nó do workflow. */
export type WorkflowNodeData = {
  /** Título em destaque. */
  label: string
  /** Subtítulo/descrição curta. */
  subtitle: string
  /** Ícone (lucide) via chave. */
  iconKey: WorkflowIconKey
  /** `true` enquanto o nó está aceso na simulação de execução. */
  running?: boolean
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeKind>

/** Mapa chave → componente de ícone lucide. */
const ICONS: Record<WorkflowIconKey, LucideIcon> = {
  webhook: Webhook,
  mail: Mail,
  cloud: Cloud,
  database: Database,
  branch: GitBranch,
  filter: Filter,
  clock: Clock,
  check: CheckCircle2,
  bell: Bell,
}

/** Classe do chip de ícone por tipo de nó (literais — sem interpolação). */
const CHIP: Record<WorkflowNodeKind, string> = {
  trigger: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  action: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  condition: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  output: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
}

const HANDLE_CLASS = "!size-3 !border-2 !border-background !bg-primary"

/** Casca comum: card + chip + textos + estados (selected/running). */
function NodeShell({
  kind,
  data,
  selected,
  children,
}: {
  kind: WorkflowNodeKind
  data: WorkflowNodeData
  selected: boolean
  children?: React.ReactNode
}) {
  const Icon = ICONS[data.iconKey]
  return (
    <div
      data-slot="workflow-node"
      data-kind={kind}
      data-running={data.running ? "true" : "false"}
      className={cn(
        "w-56 rounded-lg border border-border bg-card px-3 py-2.5 text-card-foreground shadow-sm transition-all",
        selected && "ring-2 ring-ring",
        data.running &&
          "ring-2 ring-primary shadow-md shadow-primary/20 [animation:pulse_1s_ease-in-out_infinite]",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            CHIP[kind],
          )}
        >
          <Icon className="size-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {data.label}
          </p>
          <p className="truncate text-xs leading-snug text-muted-foreground">
            {data.subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

/** Gatilho — só source (início do fluxo). */
export function TriggerNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <NodeShell kind="trigger" data={data} selected={selected}>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Ação — target + source (passo intermediário). */
export function ActionNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <NodeShell kind="action" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Condição — target + 2 source (ramos verdadeiro/falso, com rótulos). */
export function ConditionNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <NodeShell kind="condition" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <span>Sim</span>
        <span>Não</span>
      </div>
      <Handle
        id="true"
        type="source"
        position={Position.Bottom}
        style={{ left: "22%" }}
        className={HANDLE_CLASS}
      />
      <Handle
        id="false"
        type="source"
        position={Position.Bottom}
        style={{ left: "78%" }}
        className={HANDLE_CLASS}
      />
    </NodeShell>
  )
}

/** Saída — só target (fim do fluxo). */
export function OutputNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <NodeShell kind="output" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
    </NodeShell>
  )
}
