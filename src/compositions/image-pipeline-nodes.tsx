/**
 * Custom nodes da composição "Image Processing Pipeline" (React Flow / @xyflow/react).
 *
 * O DIFERENCIAL da tela: cada nó renderiza num `<canvas>` a imagem JÁ processada
 * por aquela etapa, encadeada da origem até a saída (estilo chaiNNer). Três
 * famílias de nó:
 *  - `source`  → só Handle de saída; carrega a imagem base (picsum).
 *  - operações → Handle de entrada + saída; mostram o preview do filtro aplicado
 *    e, quando parametrizáveis, um badge com o valor atual.
 *  - `output`  → só Handle de entrada; preview ampliado + botão "Baixar PNG".
 *
 * Cada nó é um Card shadcn (`bg-card`/`border-border`) tematizado light/dark e
 * memoizado. Exporta SÓ componentes + tipos (constantes/motor moram em
 * image-pipeline-types.ts) para respeitar `react-refresh/only-export-components`.
 */
import * as React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  ImageDown,
  Download,
  Contrast,
  Sun,
  Aperture,
  Palette,
  CircleDashed,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  OP_META,
  PARAM_CONFIG,
  PREVIEW_W,
  PREVIEW_H,
  OUTPUT_W,
  OUTPUT_H,
  isParamKind,
  type ImagePipeKind,
  type ImagePipeNode,
} from "@/compositions/image-pipeline-types"

/* -------------------------------------------------------------------------- */
/*  Ícones por tipo                                                           */
/* -------------------------------------------------------------------------- */

const KIND_ICON: Record<ImagePipeKind, LucideIcon> = {
  source: ImageIcon,
  grayscale: CircleDashed,
  invert: Aperture,
  brightness: Sun,
  contrast: Contrast,
  blur: CircleDashed,
  threshold: Aperture,
  sepia: Palette,
  output: ImageDown,
}

const HANDLE_BASE = "!size-3 !border-2 !border-background !bg-primary"

/* -------------------------------------------------------------------------- */
/*  Canvas de preview                                                         */
/* -------------------------------------------------------------------------- */

let drawScratch: HTMLCanvasElement | null = null
function getDrawScratch(w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null
  if (!drawScratch) drawScratch = document.createElement("canvas")
  drawScratch.width = w
  drawScratch.height = h
  return drawScratch
}

/**
 * `<canvas>` que desenha o `ImageData` processado (escalado para o tamanho de
 * exibição). Sem imagem ainda, mostra um placeholder cinza com hachura.
 */
function PreviewCanvas({
  preview,
  width,
  height,
}: {
  preview: ImageData | null | undefined
  width: number
  height: number
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, width, height)

    if (!preview) {
      ctx.fillStyle = "rgba(148, 163, 184, 0.18)"
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)"
      ctx.lineWidth = 1
      for (let x = -height; x < width; x += 12) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + height, height)
        ctx.stroke()
      }
      return
    }

    const scratch = getDrawScratch(preview.width, preview.height)
    const sctx = scratch?.getContext("2d")
    if (!scratch || !sctx) return
    sctx.putImageData(preview, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(scratch, 0, 0, preview.width, preview.height, 0, 0, width, height)
  }, [preview, width, height])

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      data-slot="image-pipeline-preview"
      className="block w-full rounded-md border border-border bg-muted"
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Cabeçalho compartilhado                                                   */
/* -------------------------------------------------------------------------- */

function NodeHeader({ kind, label }: { kind: ImagePipeKind; label: string }) {
  const Icon = KIND_ICON[kind]
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{label}</p>
        <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
          {OP_META[kind].label}
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Source                                                                    */
/* -------------------------------------------------------------------------- */

function SourceNodeBase({ data, selected }: NodeProps<ImagePipeNode>) {
  return (
    <div
      data-slot="image-pipeline-node"
      data-kind="source"
      className={cn(
        "w-[200px] rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition-all",
        selected ? "border-primary ring-2 ring-ring" : "border-border",
      )}
    >
      <NodeHeader kind="source" label={data.label} />
      <div className="mt-2.5">
        <PreviewCanvas preview={data.preview} width={PREVIEW_W} height={PREVIEW_H} />
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        seed <span className="font-medium text-foreground">{data.seed ?? 0}</span>{" "}
        · picsum
      </p>
      <Handle type="source" position={Position.Right} className={HANDLE_BASE} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Operação                                                                  */
/* -------------------------------------------------------------------------- */

function OperationNodeBase({ type, data, selected }: NodeProps<ImagePipeNode>) {
  const kind = (type ?? "grayscale") as ImagePipeKind
  const param = isParamKind(kind)
  const cfg = param ? PARAM_CONFIG[kind] : null
  const amount = data.amount ?? cfg?.default ?? 0
  return (
    <div
      data-slot="image-pipeline-node"
      data-kind={kind}
      className={cn(
        "w-[200px] rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition-all",
        selected ? "border-primary ring-2 ring-ring" : "border-border",
      )}
    >
      <Handle type="target" position={Position.Left} className={HANDLE_BASE} />
      <div className="flex items-center justify-between gap-2">
        <NodeHeader kind={kind} label={data.label} />
        {param ? (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
            {amount}
            {cfg?.unit ?? ""}
          </span>
        ) : null}
      </div>
      <div className="mt-2.5">
        <PreviewCanvas preview={data.preview} width={PREVIEW_W} height={PREVIEW_H} />
      </div>
      <Handle type="source" position={Position.Right} className={HANDLE_BASE} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Output                                                                    */
/* -------------------------------------------------------------------------- */

function OutputNodeBase({ data, selected }: NodeProps<ImagePipeNode>) {
  const downloadRef = React.useRef<HTMLCanvasElement | null>(null)

  const handleDownload = React.useCallback(() => {
    const preview = data.preview
    if (!preview) return
    const canvas = downloadRef.current ?? document.createElement("canvas")
    canvas.width = preview.width
    canvas.height = preview.height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.putImageData(preview, 0, 0)
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "pipeline-result.png"
    a.click()
  }, [data.preview])

  return (
    <div
      data-slot="image-pipeline-node"
      data-kind="output"
      className={cn(
        "w-[320px] rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition-all",
        selected ? "border-primary ring-2 ring-ring" : "border-border",
      )}
    >
      <Handle type="target" position={Position.Left} className={HANDLE_BASE} />
      <NodeHeader kind="output" label={data.label} />
      <div className="mt-2.5">
        <PreviewCanvas preview={data.preview} width={OUTPUT_W} height={OUTPUT_H} />
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={!data.preview}
        data-slot="image-pipeline-download"
        className={cn(
          "mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors",
          data.preview
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        <Download className="size-3.5" /> Baixar PNG
      </button>
      <canvas ref={downloadRef} className="hidden" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Exports memoizados                                                        */
/* -------------------------------------------------------------------------- */

export const SourceNode = React.memo(SourceNodeBase)
export const OperationNode = React.memo(OperationNodeBase)
export const OutputNode = React.memo(OutputNodeBase)
