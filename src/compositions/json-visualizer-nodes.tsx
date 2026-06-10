/**
 * Custom nodes da composição "JSON Visualizer" (React Flow / @xyflow/react).
 *
 * Dois tipos visuais, ambos cards tematizados (`bg-card`/`border-border`):
 *  - `jsonObject`: header com `{}` + contagem de chaves; lista os campos. Campos
 *    primitivos aparecem inline como `chave: valor` coloridos por tipo; campos
 *    cujo valor é objeto/array viram uma linha "chave →" com um Handle source
 *    próprio (alinhado à linha) que liga ao nó filho.
 *  - `jsonArray`: header com `[]` + length; itens primitivos inline (`[i]: valor`)
 *    e itens objeto/array como linha com Handle source para o filho.
 *
 * Um Handle target único (esquerda) recebe a aresta do pai. A raiz ganha
 * `ring`/destaque. Exporta SÓ componentes + tipos (sem const runtime) para
 * respeitar `react-refresh/only-export-components`.
 */
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Braces, Brackets, CornerDownRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Tipo do valor JSON de um campo. */
export type JsonValueType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array"

/** Um campo (chave/índice) listado dentro de um nó. */
export type JsonField = {
  /** Nome da chave (objeto) ou índice (array, ex.: "0"). */
  key: string
  /** Tipo do valor. */
  type: JsonValueType
  /** Texto formatado do valor primitivo ("" quando é filho). */
  value: string
  /** `true` quando o valor é objeto/array (vira nó filho com edge). */
  isChild: boolean
  /** id do Handle source desta linha (quando `isChild`). */
  handleId?: string
}

/** `data` de cada nó do grafo JSON. */
export type JsonNodeData = {
  /** "object" ou "array". */
  kind: "object" | "array"
  /** Caminho estável (ex.: `$.user.address`). */
  path: string
  /** Rótulo curto (a chave que originou o nó, ou "root"). */
  label: string
  /** Campos a renderizar. */
  fields: JsonField[]
  /** Quantidade total de entradas (chaves ou itens). */
  size: number
  /** `true` quando é o nó raiz. */
  isRoot: boolean
}

export type JsonObjectNodeType = Node<JsonNodeData, "jsonObject">
export type JsonArrayNodeType = Node<JsonNodeData, "jsonArray">
export type JsonGraphNode = JsonObjectNodeType | JsonArrayNodeType

/** Classe de cor do valor por tipo (literais — sem interpolação Tailwind). */
const VALUE_COLOR: Record<JsonValueType, string> = {
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-sky-600 dark:text-sky-400",
  boolean: "text-violet-600 dark:text-violet-400",
  null: "text-muted-foreground",
  object: "text-amber-600 dark:text-amber-400",
  array: "text-amber-600 dark:text-amber-400",
}

const HANDLE_CLASS =
  "!size-2 !border !border-background !bg-muted-foreground/70"

function NodeShell({ data, selected }: NodeProps<JsonGraphNode>) {
  const isArray = data.kind === "array"
  const Icon = isArray ? Brackets : Braces

  return (
    <div
      data-slot="json-node"
      data-kind={data.kind}
      data-root={data.isRoot ? "true" : "false"}
      className={cn(
        "min-w-[12rem] max-w-[18rem] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-colors",
        data.isRoot ? "border-primary/60" : "border-border",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />

      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-2 border-b px-3 py-2",
          data.isRoot
            ? "border-primary/30 bg-primary/10"
            : "border-border bg-muted/40",
        )}
      >
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md",
            isArray
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-primary/15 text-primary",
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {data.label}
        </span>
        <span className="shrink-0 rounded-full bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {isArray ? `${data.size} itens` : `${data.size} chaves`}
        </span>
      </div>

      {/* Campos */}
      {data.fields.length > 0 ? (
        <ul className="divide-y divide-border/60">
          {data.fields.map((f) => (
            <li
              key={f.key}
              className="relative flex items-center gap-2 px-3 py-1.5 font-mono text-xs"
            >
              {f.isChild ? (
                <>
                  <CornerDownRight className="size-3 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {isArray ? `[${f.key}]` : f.key}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold",
                      "bg-amber-500/10",
                      VALUE_COLOR[f.type],
                    )}
                  >
                    {f.type === "array" ? "[ ]" : "{ }"}
                  </span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={f.handleId}
                    className={HANDLE_CLASS}
                  />
                </>
              ) : (
                <>
                  <span className="min-w-0 shrink-0 truncate font-medium text-muted-foreground">
                    {isArray ? `[${f.key}]` : f.key}
                    <span className="text-muted-foreground/60">:</span>
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-right",
                      VALUE_COLOR[f.type],
                    )}
                    title={f.value}
                  >
                    {f.value}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-3 py-2 font-mono text-xs italic text-muted-foreground">
          {isArray ? "array vazio" : "objeto vazio"}
        </p>
      )}
    </div>
  )
}

export function JsonObjectNode(props: NodeProps<JsonGraphNode>) {
  return <NodeShell {...props} />
}

export function JsonArrayNode(props: NodeProps<JsonGraphNode>) {
  return <NodeShell {...props} />
}
