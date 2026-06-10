/**
 * Custom nodes da composição "Generative Media Studio" (React Flow / @xyflow/react).
 *
 * Sete tipos de nó orientados a GERAÇÃO DE MÍDIA agrupados por categoria — Inputs
 * (`textInput`, `imageInput`), Generation (`textGen`, `imageGen`, `videoGen`,
 * `audioGen`) e Layout (`output`). Cada um é um Card shadcn (`bg-card`/
 * `border-border`) com chip de ícone colorido, título, badge do modelo, Handles
 * tematizados e — o diferencial — uma área de ASSET que reflete o estado da
 * geração: `idle` (placeholder), `generating` (skeleton pulsando) e `done`
 * (thumbnail/preview do resultado). O nó de saída monta um MOSAICO dos assets
 * recebidos.
 *
 * Exporta SÓ componentes (sem const runtime) para respeitar a regra
 * `react-refresh/only-export-components`. Tipos/consts ficam em
 * `media-studio-types.ts`; o mapa `nodeTypes` é montado na composição principal.
 */
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Type,
  ImageIcon,
  Sparkles,
  Wand2,
  Clapperboard,
  AudioLines,
  LayoutGrid,
  Play,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  NODE_CATEGORY,
  thumbUrl,
  type MediaNode,
  type MediaNodeData,
  type MediaNodeKind,
} from "@/compositions/media-studio-types"

/** Mapa kind → componente de ícone lucide. */
const ICONS: Record<MediaNodeKind, LucideIcon> = {
  textInput: Type,
  imageInput: ImageIcon,
  textGen: Sparkles,
  imageGen: Wand2,
  videoGen: Clapperboard,
  audioGen: AudioLines,
  output: LayoutGrid,
}

/** Classe do chip de ícone por tipo de nó (literais — sem interpolação). */
const CHIP: Record<MediaNodeKind, string> = {
  textInput: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  imageInput: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  textGen: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  imageGen: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  videoGen: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  audioGen: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  output: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
}

const HANDLE_CLASS = "!size-3 !border-2 !border-background !bg-primary"

/** Waveform fake determinística (alturas em %) a partir da seed. */
function waveform(seed: number, bars = 28): number[] {
  const out: number[] = []
  let s = seed * 9301 + 49297
  for (let i = 0; i < bars; i += 1) {
    s = (s * 9301 + 49297) % 233280
    out.push(18 + (s % 82))
  }
  return out
}

/** Casca comum: card + chip + textos + estados (selected/generating). */
function NodeShell({
  kind,
  data,
  selected,
  children,
}: {
  kind: MediaNodeKind
  data: MediaNodeData
  selected: boolean
  children?: React.ReactNode
}) {
  const Icon = ICONS[kind]
  const generating = data.status === "generating"
  return (
    <div
      data-slot="media-node"
      data-kind={kind}
      data-category={NODE_CATEGORY[kind]}
      data-status={data.status ?? "idle"}
      data-generating={generating ? "true" : "false"}
      className={cn(
        "w-56 rounded-lg border border-border bg-card px-3 py-2.5 text-card-foreground shadow-sm transition-all",
        selected && "ring-2 ring-ring",
        generating &&
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
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {data.label}
          </p>
          {data.model ? (
            <p className="truncate text-xs leading-snug text-muted-foreground">
              {data.model}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  )
}

/** Badge pequeno para metadados (proporção/seed). */
function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  )
}

/** Skeleton de "gerando". */
function GeneratingBox({ label }: { label: string }) {
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 [animation:pulse_1s_ease-in-out_infinite]">
      <Sparkles className="size-5 text-primary" />
      <span className="text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

/** Placeholder idle (antes de gerar). */
function IdleBox({ label }: { label: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 text-[10px] font-medium text-muted-foreground">
      {label}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Inputs                                                                    */
/* -------------------------------------------------------------------------- */

/** Entrada de texto do usuário. Só source. */
export function TextInputNode({ data, selected }: NodeProps<MediaNode>) {
  return (
    <NodeShell kind="textInput" data={data} selected={selected}>
      <div className="mt-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
        <p className="line-clamp-3 text-[11px] leading-snug text-foreground">
          {data.prompt || "Descreva o que quer gerar…"}
        </p>
      </div>
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Entrada de imagem de referência (asset sempre presente). Só source. */
export function ImageInputNode({ data, selected }: NodeProps<MediaNode>) {
  return (
    <NodeShell kind="imageInput" data={data} selected={selected}>
      <div className="mt-2 overflow-hidden rounded-md border border-border">
        <img
          src={thumbUrl(data.seed ?? 1)}
          crossOrigin="anonymous"
          alt="Imagem de referência"
          className="h-24 w-full object-cover"
        />
      </div>
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/* -------------------------------------------------------------------------- */
/*  Generation                                                                */
/* -------------------------------------------------------------------------- */

/** Geração de texto — preview do texto gerado quando `done`. Target + source. */
export function TextGenNode({ data, selected }: NodeProps<MediaNode>) {
  const done = data.status === "done"
  return (
    <NodeShell kind="textGen" data={data} selected={selected}>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.model ? <MetaBadge>{data.model}</MetaBadge> : null}
      </div>
      <div className="mt-2">
        {data.status === "generating" ? (
          <GeneratingBox label="Escrevendo…" />
        ) : done ? (
          <div className="rounded-md border border-border bg-muted/50 px-2 py-1.5">
            <p className="line-clamp-4 text-[11px] leading-snug text-foreground">
              {data.text}
              <span className="ml-0.5 inline-block h-3 w-1 translate-y-0.5 bg-primary [animation:pulse_0.8s_ease-in-out_infinite]" />
            </p>
          </div>
        ) : (
          <IdleBox label="Prompt refinado" />
        )}
      </div>
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Geração de imagem — thumbnail quando `done`. Target + source. */
export function ImageGenNode({ data, selected }: NodeProps<MediaNode>) {
  const done = data.status === "done"
  return (
    <NodeShell kind="imageGen" data={data} selected={selected}>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.model ? <MetaBadge>{data.model}</MetaBadge> : null}
        {data.aspect ? <MetaBadge>{data.aspect}</MetaBadge> : null}
      </div>
      <div className="mt-2">
        {data.status === "generating" ? (
          <GeneratingBox label="Renderizando…" />
        ) : done ? (
          <div className="overflow-hidden rounded-md border border-border">
            <img
              src={thumbUrl(data.seed ?? 10)}
              crossOrigin="anonymous"
              alt={data.label}
              className="h-24 w-full object-cover"
            />
          </div>
        ) : (
          <IdleBox label="Imagem" />
        )}
      </div>
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Geração de vídeo — thumbnail + ícone play quando `done`. Target + source. */
export function VideoGenNode({ data, selected }: NodeProps<MediaNode>) {
  const done = data.status === "done"
  return (
    <NodeShell kind="videoGen" data={data} selected={selected}>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.model ? <MetaBadge>{data.model}</MetaBadge> : null}
        {data.aspect ? <MetaBadge>{data.aspect}</MetaBadge> : null}
      </div>
      <div className="mt-2">
        {data.status === "generating" ? (
          <GeneratingBox label="Animando…" />
        ) : done ? (
          <div className="relative overflow-hidden rounded-md border border-border">
            <img
              src={thumbUrl(data.seed ?? 20)}
              crossOrigin="anonymous"
              alt={data.label}
              className="h-24 w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm">
                <Play className="size-4 translate-x-0.5 fill-current" />
              </span>
            </span>
          </div>
        ) : (
          <IdleBox label="Vídeo" />
        )}
      </div>
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/** Geração de áudio — waveform quando `done`. Target + source. */
export function AudioGenNode({ data, selected }: NodeProps<MediaNode>) {
  const done = data.status === "done"
  const bars = waveform(data.seed ?? 30)
  return (
    <NodeShell kind="audioGen" data={data} selected={selected}>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.model ? <MetaBadge>{data.model}</MetaBadge> : null}
      </div>
      <div className="mt-2">
        {data.status === "generating" ? (
          <GeneratingBox label="Sintetizando…" />
        ) : done ? (
          <div className="flex h-24 items-center gap-0.5 rounded-md border border-border bg-muted/40 px-2">
            {bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-primary/70"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        ) : (
          <IdleBox label="Áudio" />
        )}
      </div>
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </NodeShell>
  )
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/* -------------------------------------------------------------------------- */

/** Saída — monta um mosaico dos assets recebidos. Só target. */
export function OutputNode({ data, selected }: NodeProps<MediaNode>) {
  const assets = data.assets ?? []
  return (
    <NodeShell kind="output" data={data} selected={selected}>
      <div className="mt-2">
        {assets.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {assets.slice(0, 4).map((asset) => (
              <div
                key={asset.id}
                className="relative overflow-hidden rounded-md border border-border"
              >
                <img
                  src={asset.url}
                  crossOrigin="anonymous"
                  alt={asset.kind}
                  className="h-16 w-full object-cover"
                />
                {asset.kind === "videoGen" ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Play className="size-4 translate-x-0.5 fill-background text-background drop-shadow" />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <IdleBox label="Mosaico final" />
        )}
      </div>
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
    </NodeShell>
  )
}
