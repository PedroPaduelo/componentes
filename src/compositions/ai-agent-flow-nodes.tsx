/**
 * Custom nodes da composição "AI Agent Pipeline" (React Flow / @xyflow/react).
 *
 * Seis tipos de nó orientados a IA/LLM — `input`, `prompt`, `model`, `tool`,
 * `memory` e `output` — cada um um Card shadcn (`bg-card`/`border-border`) com
 * chip de ícone colorido, título, subtítulo, badges opcionais (modelo,
 * temperatura, tokens) e Handles tematizados (`bg-primary`). Estados:
 * selecionado (`ring-2 ring-ring`) e "executando" (`data.running`). O nó de
 * saída ainda mostra um "token streaming" fake (`data.stream`) durante a
 * simulação.
 *
 * Exporta SÓ componentes + tipos (sem const runtime) para respeitar a regra
 * `react-refresh/only-export-components`. O mapa `nodeTypes` é montado na
 * composição principal.
 */
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import {
  MessageSquare,
  FileText,
  Brain,
  Wrench,
  Database,
  Sparkles,
  Search,
  Globe,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

/** Tipos de nó suportados pelo pipeline de agentes. */
export type AgentNodeKind =
  | "input"
  | "prompt"
  | "model"
  | "tool"
  | "memory"
  | "output"

/** Chave de ícone (string serializável — segura para exportar em JSON). */
export type AgentIconKey =
  | "message"
  | "prompt"
  | "model"
  | "tool"
  | "memory"
  | "output"
  | "search"
  | "globe"

/** Formato do `data` de cada nó do pipeline. */
export type AgentNodeData = {
  /** Título em destaque. */
  label: string
  /** Subtítulo/descrição curta. */
  subtitle: string
  /** Ícone (lucide) via chave. */
  iconKey: AgentIconKey
  /** Modelo do LLM (só nós `model`), ex.: "gpt-4o". */
  model?: string
  /** Temperatura do LLM (0–2), só nós `model`. */
  temperature?: number
  /** Limite de tokens, só nós `model`. */
  maxTokens?: number
  /** `true` enquanto o nó está aceso na simulação de execução. */
  running?: boolean
  /** Texto que vai aparecendo aos poucos no nó de saída (token streaming). */
  stream?: string
}

export type AgentNode = Node<AgentNodeData, AgentNodeKind>

/** Mapa chave → componente de ícone lucide. */
const ICONS: Record<AgentIconKey, LucideIcon> = {
  message: MessageSquare,
  prompt: FileText,
  model: Brain,
  tool: Wrench,
  memory: Database,
  output: Sparkles,
  search: Search,
  globe: Globe,
}

/** Classe do chip de ícone por tipo de nó (literais — sem interpolação). */
const CHIP: Record<AgentNodeKind, string> = {
  input: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  prompt: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  model: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  tool: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  memory: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  output: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
}

const HANDLE_CLASS = "!size-3 !border-2 !border-background !bg-primary"

/** Casca comum: card + chip + textos + estados (selected/running). */
function NodeShell({
  kind,
  data,
  selected,
  children,
}: {
  kind: AgentNodeKind
  data: AgentNodeData
  selected: boolean
  children?: React.ReactNode
}) {
  const Icon = ICONS[data.iconKey]
  return (
    <div
      data-slot="agent-node"
      data-kind={kind}
      data-running={data.running ? "true" : "false"}
      className={cn(
        "w-60 rounded-lg border border-border bg-card px-3 py-2.5 text-card-foreground shadow-sm transition-all",
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

/** Badge pequeno para metadados (modelo/temperatura/tokens). */
function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  )
}

/** Entrada — mensagem do usuário / gatilho. Só source. */
export function InputNode({ data, selected }: NodeProps<AgentNode>) {
  return (
    <NodeShell kind="input" data={data} selected={selected}>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Prompt de sistema — mostra preview do prompt. Target + source. */
export function PromptNode({ data, selected }: NodeProps<AgentNode>) {
  return (
    <NodeShell kind="prompt" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Modelo (LLM) — badges de modelo, temperatura e tokens. Target + source. */
export function ModelNode({ data, selected }: NodeProps<AgentNode>) {
  return (
    <NodeShell kind="model" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.model ? <MetaBadge>{data.model}</MetaBadge> : null}
        {data.temperature !== undefined ? (
          <MetaBadge>temp {data.temperature}</MetaBadge>
        ) : null}
        {data.maxTokens !== undefined ? (
          <MetaBadge>{data.maxTokens} tok</MetaBadge>
        ) : null}
      </div>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Ferramenta (função / API). Target + source. */
export function ToolNode({ data, selected }: NodeProps<AgentNode>) {
  return (
    <NodeShell kind="tool" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Memória / base de conhecimento (retriever). Target + source. */
export function MemoryNode({ data, selected }: NodeProps<AgentNode>) {
  return (
    <NodeShell kind="memory" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Resposta final — mostra token streaming durante a simulação. Só target. */
export function OutputNode({ data, selected }: NodeProps<AgentNode>) {
  return (
    <NodeShell kind="output" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      {data.stream ? (
        <div className="mt-2 rounded-md border border-border bg-muted/50 px-2 py-1.5">
          <p className="text-[11px] leading-snug text-foreground">
            {data.stream}
            <span className="ml-0.5 inline-block h-3 w-1 translate-y-0.5 bg-primary [animation:pulse_0.8s_ease-in-out_infinite]" />
          </p>
        </div>
      ) : null}
    </NodeShell>
  )
}
