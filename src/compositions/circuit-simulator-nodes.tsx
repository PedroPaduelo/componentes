/**
 * Custom nodes da composição "Logic Circuit Simulator" (React Flow / @xyflow/react).
 *
 * Cinco famílias de nó do domínio de eletrônica digital — `switch` (entrada),
 * portas lógicas (`and`/`or`/`not`/`xor`/`nand`/`nor`), e `lamp` (saída) — cada
 * um um Card shadcn (`bg-card`/`border-border`) com Handles tematizados e
 * estado de sinal (0/1) refletido AO VIVO: quando energizado o nó acende com um
 * realce decorativo (emerald = estado físico ON, não token de tema).
 *
 * Exporta SÓ componentes + tipos (sem const runtime exposta) para respeitar a
 * regra `react-refresh/only-export-components`. O mapa `nodeTypes` é montado na
 * composição principal.
 */
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Lightbulb, ToggleLeft, ToggleRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Tipos de porta lógica suportados. */
export type GateKind = "and" | "or" | "not" | "xor" | "nand" | "nor"

/** Todos os tipos de nó do simulador. */
export type CircuitNodeKind = "switch" | "lamp" | GateKind

/** Formato do `data` de cada nó do circuito. */
export type CircuitNodeData = {
  /** Rótulo curto (ex.: "A", "AND", "S"). */
  label: string
  /** Valor lógico atual do nó (0 ou 1), computado pelo motor de simulação. */
  value: 0 | 1
  /** Callback do toggle — presente só nos nós `switch`. */
  onToggle?: () => void
}

export type CircuitNode = Node<CircuitNodeData, CircuitNodeKind>

/** Símbolo textual de cada porta lógica. */
const GATE_SYMBOL: Record<GateKind, string> = {
  and: "&",
  or: "≥1",
  not: "1",
  xor: "=1",
  nand: "&",
  nor: "≥1",
}

/** Nome legível de cada porta. */
const GATE_NAME: Record<GateKind, string> = {
  and: "AND",
  or: "OR",
  not: "NOT",
  xor: "XOR",
  nand: "NAND",
  nor: "NOR",
}

/** Portas que negam a saída (mostram a bolha de inversão). */
const INVERTED: Record<GateKind, boolean> = {
  and: false,
  or: false,
  not: true,
  xor: false,
  nand: true,
  nor: true,
}

const HANDLE_BASE = "!size-3 !border-2 !border-background"
const HANDLE_OFF = "!bg-muted-foreground"
const HANDLE_ON = "!bg-emerald-500"

/* -------------------------------------------------------------------------- */
/*  Switch (entrada)                                                          */
/* -------------------------------------------------------------------------- */

export function SwitchNode({ data, selected }: NodeProps<CircuitNode>) {
  const on = data.value === 1
  return (
    <button
      type="button"
      data-slot="circuit-node"
      data-kind="switch"
      data-value={data.value}
      data-on={on ? "true" : "false"}
      onClick={data.onToggle}
      className={cn(
        "flex w-36 items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left text-card-foreground shadow-sm transition-all",
        on
          ? "border-emerald-500/60 shadow-emerald-500/20"
          : "border-border",
        selected && "ring-2 ring-ring",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
          on
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        {on ? (
          <ToggleRight className="size-5" strokeWidth={2} />
        ) : (
          <ToggleLeft className="size-5" strokeWidth={2} />
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">
          {data.label}
        </p>
        <p
          className={cn(
            "text-xs font-medium leading-snug tabular-nums",
            on
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground",
          )}
        >
          {on ? "ON · 1" : "OFF · 0"}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={cn(HANDLE_BASE, on ? HANDLE_ON : HANDLE_OFF)}
      />
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Porta lógica genérica                                                     */
/* -------------------------------------------------------------------------- */

function GateNode({
  kind,
  data,
  selected,
}: {
  kind: GateKind
  data: CircuitNodeData
  selected: boolean
}) {
  const on = data.value === 1
  const single = kind === "not"
  const inverted = INVERTED[kind]
  return (
    <div
      data-slot="circuit-node"
      data-kind={kind}
      data-value={data.value}
      data-on={on ? "true" : "false"}
      className={cn(
        "relative w-32 rounded-lg border bg-card px-3 py-3 text-card-foreground shadow-sm transition-all",
        on ? "border-emerald-500/60 shadow-emerald-500/20" : "border-border",
        selected && "ring-2 ring-ring",
      )}
    >
      {/* entradas */}
      {single ? (
        <Handle
          id="a"
          type="target"
          position={Position.Left}
          className={cn(HANDLE_BASE, HANDLE_OFF)}
        />
      ) : (
        <>
          <Handle
            id="a"
            type="target"
            position={Position.Left}
            style={{ top: "32%" }}
            className={cn(HANDLE_BASE, HANDLE_OFF)}
          />
          <Handle
            id="b"
            type="target"
            position={Position.Left}
            style={{ top: "68%" }}
            className={cn(HANDLE_BASE, HANDLE_OFF)}
          />
        </>
      )}

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {GATE_NAME[kind]}
        </span>
        <span
          className={cn(
            "font-mono text-xl font-bold leading-none tabular-nums transition-colors",
            on ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
          )}
        >
          {GATE_SYMBOL[kind]}
        </span>
        <span
          className={cn(
            "mt-0.5 rounded px-1.5 text-[11px] font-semibold tabular-nums transition-colors",
            on
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {data.value}
        </span>
      </div>

      {/* bolha de inversão (NOT/NAND/NOR) */}
      {inverted ? (
        <span
          aria-hidden
          className={cn(
            "absolute right-1.5 top-1/2 size-2 -translate-y-1/2 rounded-full border transition-colors",
            on
              ? "border-emerald-500 bg-emerald-500/40"
              : "border-muted-foreground bg-card",
          )}
        />
      ) : null}

      <Handle
        type="source"
        position={Position.Right}
        className={cn(HANDLE_BASE, on ? HANDLE_ON : HANDLE_OFF)}
      />
    </div>
  )
}

export function AndNode({ data, selected }: NodeProps<CircuitNode>) {
  return <GateNode kind="and" data={data} selected={selected} />
}
export function OrNode({ data, selected }: NodeProps<CircuitNode>) {
  return <GateNode kind="or" data={data} selected={selected} />
}
export function NotNode({ data, selected }: NodeProps<CircuitNode>) {
  return <GateNode kind="not" data={data} selected={selected} />
}
export function XorNode({ data, selected }: NodeProps<CircuitNode>) {
  return <GateNode kind="xor" data={data} selected={selected} />
}
export function NandNode({ data, selected }: NodeProps<CircuitNode>) {
  return <GateNode kind="nand" data={data} selected={selected} />
}
export function NorNode({ data, selected }: NodeProps<CircuitNode>) {
  return <GateNode kind="nor" data={data} selected={selected} />
}

/* -------------------------------------------------------------------------- */
/*  Lamp (saída)                                                              */
/* -------------------------------------------------------------------------- */

export function LampNode({ data, selected }: NodeProps<CircuitNode>) {
  const on = data.value === 1
  return (
    <div
      data-slot="circuit-node"
      data-kind="lamp"
      data-value={data.value}
      data-on={on ? "true" : "false"}
      className={cn(
        "flex w-32 flex-col items-center gap-1 rounded-lg border bg-card px-3 py-3 text-card-foreground shadow-sm transition-all",
        on
          ? "border-amber-400/70 shadow-md shadow-amber-400/30"
          : "border-border",
        selected && "ring-2 ring-ring",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn(HANDLE_BASE, on ? "!bg-amber-400" : HANDLE_OFF)}
      />
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full transition-all",
          on
            ? "bg-amber-400/20 text-amber-500 [filter:drop-shadow(0_0_6px_rgb(251_191_36_/_0.7))]"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Lightbulb
          className="size-5"
          strokeWidth={2}
          fill={on ? "currentColor" : "none"}
        />
      </span>
      <p className="truncate text-xs font-semibold leading-tight">
        {data.label}
      </p>
      <span
        className={cn(
          "rounded px-1.5 text-[11px] font-semibold tabular-nums transition-colors",
          on
            ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        {on ? "ACESA" : "apagada"}
      </span>
    </div>
  )
}
