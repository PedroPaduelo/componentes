/**
 * Custom node da composição "Mind Map" (React Flow / @xyflow/react).
 *
 * Um único tipo visual — `mind` — renderizado como uma pílula/card arredondado
 * com o texto da ideia. O realce varia por PROFUNDIDADE: o nó raiz (depth 0)
 * usa `bg-primary`/`text-primary-foreground`; os demais usam `bg-card` com um
 * ponto de cor do ramo (`data.color`). Duplo-clique entra em modo de edição
 * (um textarea controlado, autofocado, Enter/blur confirma, Escape cancela),
 * um botão "+" cria um nó filho e um "×" remove a sub-árvore. Handles discretos
 * (esquerda = target, direita = source). Estado selecionado = `ring-2 ring-ring`.
 *
 * Exporta SÓ o componente + tipos (sem const runtime exportada) para respeitar
 * `react-refresh/only-export-components`. Callbacks e o flag `editing` chegam
 * pelo `data` (injetados pela composição principal a cada render).
 */
import * as React from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Cores de ramo (decorativas — não são tokens de tema). */
export type MindBranchColor =
  | "sky"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "teal"

/** Formato do `data` de cada nó do mapa. */
export type MindNodeData = {
  /** Texto da ideia. */
  label: string
  /** Profundidade na árvore (0 = raiz / ideia central). */
  depth: number
  /** Cor do ramo (ignorada na raiz, que usa `primary`). */
  color: MindBranchColor
  /** `true` enquanto este nó está em modo de edição inline. */
  editing?: boolean
  /** Pede para a composição entrar em edição neste nó. */
  onStartEdit?: (id: string) => void
  /** Confirma um novo texto para o nó. */
  onChange?: (id: string, label: string) => void
  /** Sai do modo de edição (sem alterar). */
  onStopEdit?: () => void
  /** Cria um nó filho conectado a este. */
  onAddChild?: (id: string) => void
  /** Remove este nó e toda a sub-árvore. */
  onDelete?: (id: string) => void
}

export type MindNodeType = Node<MindNodeData, "mind">

/** Classe do ponto de cor do ramo (literais — sem interpolação Tailwind). */
const DOT: Record<MindBranchColor, string> = {
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
}

const HANDLE_CLASS =
  "!size-2 !border !border-background !bg-muted-foreground/70 opacity-0 transition-opacity group-hover:opacity-100"

export function MindNode({ id, data, selected }: NodeProps<MindNodeType>) {
  const isRoot = data.depth === 0
  const [draft, setDraft] = React.useState(data.label)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (!data.editing) return
    setDraft(data.label)
    const t = window.setTimeout(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      el.select()
    }, 0)
    return () => window.clearTimeout(t)
  }, [data.editing, data.label])

  const commit = React.useCallback(() => {
    const value = draft.trim()
    data.onChange?.(id, value.length > 0 ? value : data.label)
    data.onStopEdit?.()
  }, [draft, data, id])

  const cancel = React.useCallback(() => {
    data.onStopEdit?.()
  }, [data])

  return (
    <div
      data-slot="mind-node"
      data-depth={data.depth}
      data-root={isRoot ? "true" : "false"}
      onDoubleClick={(e) => {
        e.stopPropagation()
        if (!data.editing) data.onStartEdit?.(id)
      }}
      className={cn(
        "group relative flex min-w-[8rem] max-w-[16rem] items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-sm transition-all",
        isRoot
          ? "border-transparent bg-primary text-primary-foreground shadow-md"
          : "border-border bg-card text-card-foreground hover:border-primary/40",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={HANDLE_CLASS}
      />

      {!isRoot ? (
        <span
          aria-hidden
          className={cn("size-2 shrink-0 rounded-full", DOT[data.color])}
        />
      ) : null}

      {data.editing ? (
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              commit()
            } else if (e.key === "Escape") {
              e.preventDefault()
              cancel()
            }
          }}
          className={cn(
            "nodrag nopan w-40 resize-none bg-transparent text-sm font-medium leading-tight outline-none",
            isRoot
              ? "text-primary-foreground placeholder:text-primary-foreground/60"
              : "text-foreground placeholder:text-muted-foreground",
          )}
          placeholder="Sua ideia…"
        />
      ) : (
        <p
          className={cn(
            "min-w-0 break-words text-sm leading-tight",
            isRoot ? "font-semibold" : "font-medium",
          )}
        >
          {data.label}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className={HANDLE_CLASS}
      />

      {/* Botão "+" — cria um filho */}
      <button
        type="button"
        aria-label="Adicionar nó filho"
        title="Adicionar ideia filha"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          data.onAddChild?.(id)
        }}
        className="absolute -right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground opacity-0 shadow transition-opacity hover:bg-primary/90 group-hover:opacity-100"
      >
        <Plus className="size-3.5" strokeWidth={2.5} />
      </button>

      {/* Botão "×" — remove a sub-árvore (oculto na raiz) */}
      {!isRoot ? (
        <button
          type="button"
          aria-label="Remover nó"
          title="Remover ramo"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            data.onDelete?.(id)
          }}
          className="absolute -right-3 -top-3 flex size-5 items-center justify-center rounded-full border border-background bg-destructive text-white opacity-0 shadow transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  )
}
