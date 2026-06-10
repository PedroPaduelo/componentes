/**
 * Tipos, constantes e o MOTOR de processamento de imagem da composição
 * "Image Processing Pipeline" (image-pipeline).
 *
 * Fica num módulo `.ts` separado (sem componentes) para que os custom nodes
 * (image-pipeline-nodes.tsx) e a composição (image-pipeline.tsx) compartilhem
 * as constantes/funções sem violar a regra `react-refresh/only-export-components`.
 *
 * O processamento é Canvas 2D puro: as operações por pixel (grayscale, invert,
 * brightness, contrast, threshold, sepia) manipulam o `ImageData`; o blur usa
 * `ctx.filter = "blur(Npx)"`. `computeGraph` avalia o grafo em ordem topológica
 * a partir do(s) nó(s) de origem, encadeando o resultado de cada etapa.
 */
import type { Node } from "@xyflow/react"

/* -------------------------------------------------------------------------- */
/*  Dimensões                                                                 */
/* -------------------------------------------------------------------------- */

/** Resolução de trabalho (todo o pipeline processa nesse tamanho). */
export const PROC_W = 220
export const PROC_H = 165
/** Preview embutido em cada nó de operação. */
export const PREVIEW_W = 168
export const PREVIEW_H = 126
/** Preview ampliado do nó de saída. */
export const OUTPUT_W = 300
export const OUTPUT_H = 225

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                     */
/* -------------------------------------------------------------------------- */

/** Operações por pixel/filtro que recebem a imagem do nó anterior. */
export type OperationKind =
  | "grayscale"
  | "invert"
  | "brightness"
  | "contrast"
  | "blur"
  | "threshold"
  | "sepia"

/** Todos os tipos de nó do pipeline. */
export type ImagePipeKind = "source" | "output" | OperationKind

/** Operações cujo efeito é controlado por um parâmetro (slider). */
export type ParamKind = "brightness" | "contrast" | "blur" | "threshold"

export type ImagePipeNodeData = {
  /** Rótulo curto exibido no cabeçalho do nó. */
  label: string
  /** Seed do picsum (apenas no nó `source`). */
  seed?: number
  /** Valor do parâmetro (apenas operações de `ParamKind`). */
  amount?: number
  /** Imagem já processada por esta etapa (desenhada no `<canvas>` do nó). */
  preview?: ImageData | null
}

export type ImagePipeNode = Node<ImagePipeNodeData, ImagePipeKind>

/* -------------------------------------------------------------------------- */
/*  Metadados das operações                                                   */
/* -------------------------------------------------------------------------- */

export type ParamConfig = {
  min: number
  max: number
  step: number
  default: number
  unit?: string
}

/** Configuração do slider de cada operação parametrizável. */
export const PARAM_CONFIG: Record<ParamKind, ParamConfig> = {
  brightness: { min: -100, max: 100, step: 1, default: 25 },
  contrast: { min: -100, max: 100, step: 1, default: 30 },
  blur: { min: 0, max: 12, step: 1, default: 3, unit: "px" },
  threshold: { min: 0, max: 255, step: 1, default: 128 },
}

export const PARAM_KINDS: ParamKind[] = [
  "brightness",
  "contrast",
  "blur",
  "threshold",
]

/** Verdadeiro se a operação tem parâmetro ajustável. */
export function isParamKind(kind: ImagePipeKind): kind is ParamKind {
  return (PARAM_KINDS as string[]).includes(kind)
}

/** Valor inicial do parâmetro de uma operação (0 quando não parametrizável). */
export function defaultAmount(kind: ImagePipeKind): number {
  return isParamKind(kind) ? PARAM_CONFIG[kind].default : 0
}

export type OpMeta = {
  label: string
  hint: string
}

/** Rótulo + dica de cada tipo de nó (paleta, toolbar e inspector). */
export const OP_META: Record<ImagePipeKind, OpMeta> = {
  source: { label: "Carregar imagem", hint: "Origem do pipeline" },
  grayscale: { label: "Tons de cinza", hint: "Dessatura a imagem" },
  invert: { label: "Inverter", hint: "Negativo das cores" },
  brightness: { label: "Brilho", hint: "Clareia / escurece" },
  contrast: { label: "Contraste", hint: "Realça as bordas tonais" },
  blur: { label: "Desfoque", hint: "Suaviza (gaussiano)" },
  threshold: { label: "Limiar", hint: "Preto e branco puro" },
  sepia: { label: "Sépia", hint: "Tom envelhecido" },
  output: { label: "Resultado", hint: "Saída final" },
}

/** Ordem das operações na paleta/menu. */
export const OPERATION_KINDS: OperationKind[] = [
  "grayscale",
  "invert",
  "brightness",
  "contrast",
  "blur",
  "threshold",
  "sepia",
]

/* -------------------------------------------------------------------------- */
/*  Canvases de apoio (scratch) — só no browser                              */
/* -------------------------------------------------------------------------- */

function makeCanvas(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null
  const c = document.createElement("canvas")
  c.width = PROC_W
  c.height = PROC_H
  return c
}

let scratchA: HTMLCanvasElement | null = null
let scratchB: HTMLCanvasElement | null = null

function getScratchA(): HTMLCanvasElement | null {
  if (!scratchA) scratchA = makeCanvas()
  return scratchA
}
function getScratchB(): HTMLCanvasElement | null {
  if (!scratchB) scratchB = makeCanvas()
  return scratchB
}

/** Converte um elemento de imagem carregado em `ImageData` na resolução de trabalho. */
export function imageToData(img: HTMLImageElement): ImageData | null {
  const c = getScratchA()
  const ctx = c?.getContext("2d", { willReadFrequently: true })
  if (!c || !ctx) return null
  ctx.clearRect(0, 0, PROC_W, PROC_H)
  ctx.drawImage(img, 0, 0, PROC_W, PROC_H)
  try {
    return ctx.getImageData(0, 0, PROC_W, PROC_H)
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/*  Operações                                                                 */
/* -------------------------------------------------------------------------- */

const clamp = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v)

function cloneData(input: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(input.data),
    input.width,
    input.height,
  )
}

function applyBlur(input: ImageData, radius: number): ImageData {
  if (radius <= 0) return cloneData(input)
  const a = getScratchA()
  const b = getScratchB()
  const actx = a?.getContext("2d", { willReadFrequently: true })
  const bctx = b?.getContext("2d", { willReadFrequently: true })
  if (!a || !b || !actx || !bctx) return cloneData(input)
  actx.clearRect(0, 0, PROC_W, PROC_H)
  actx.putImageData(input, 0, 0)
  bctx.clearRect(0, 0, PROC_W, PROC_H)
  bctx.filter = `blur(${radius}px)`
  bctx.drawImage(a, 0, 0)
  bctx.filter = "none"
  try {
    return bctx.getImageData(0, 0, PROC_W, PROC_H)
  } catch {
    return cloneData(input)
  }
}

/**
 * Aplica uma operação sobre o `ImageData` de entrada e devolve um novo
 * `ImageData` (nunca muta a entrada). `amount` é o valor do slider.
 */
export function applyOperation(
  kind: OperationKind,
  input: ImageData,
  amount: number,
): ImageData {
  if (kind === "blur") return applyBlur(input, amount)

  const out = cloneData(input)
  const d = out.data
  const contrastFactor =
    (259 * (amount + 255)) / (255 * (259 - amount))

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]

    switch (kind) {
      case "grayscale": {
        const y = clamp(0.299 * r + 0.587 * g + 0.114 * b)
        d[i] = y
        d[i + 1] = y
        d[i + 2] = y
        break
      }
      case "invert": {
        d[i] = 255 - r
        d[i + 1] = 255 - g
        d[i + 2] = 255 - b
        break
      }
      case "brightness": {
        d[i] = clamp(r + amount)
        d[i + 1] = clamp(g + amount)
        d[i + 2] = clamp(b + amount)
        break
      }
      case "contrast": {
        d[i] = clamp(contrastFactor * (r - 128) + 128)
        d[i + 1] = clamp(contrastFactor * (g - 128) + 128)
        d[i + 2] = clamp(contrastFactor * (b - 128) + 128)
        break
      }
      case "threshold": {
        const y = 0.299 * r + 0.587 * g + 0.114 * b
        const v = y >= amount ? 255 : 0
        d[i] = v
        d[i + 1] = v
        d[i + 2] = v
        break
      }
      case "sepia": {
        d[i] = clamp(0.393 * r + 0.769 * g + 0.189 * b)
        d[i + 1] = clamp(0.349 * r + 0.686 * g + 0.168 * b)
        d[i + 2] = clamp(0.272 * r + 0.534 * g + 0.131 * b)
        break
      }
    }
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*  Avaliação do grafo                                                        */
/* -------------------------------------------------------------------------- */

type EdgeLike = { source: string; target: string }

/** Ordenação topológica (Kahn) tolerante a nós isolados. */
function topoOrder(nodes: ImagePipeNode[], edges: EdgeLike[]): string[] {
  const indeg = new Map<string, number>()
  const adj = new Map<string, string[]>()
  for (const n of nodes) indeg.set(n.id, 0)
  for (const e of edges) {
    if (!indeg.has(e.target) || !indeg.has(e.source)) continue
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1)
    const list = adj.get(e.source) ?? []
    list.push(e.target)
    adj.set(e.source, list)
  }
  const queue: string[] = []
  for (const [id, deg] of indeg) if (deg === 0) queue.push(id)
  const order: string[] = []
  const seen = new Set<string>()
  while (queue.length > 0) {
    const id = queue.shift() as string
    if (seen.has(id)) continue
    seen.add(id)
    order.push(id)
    for (const next of adj.get(id) ?? []) {
      indeg.set(next, (indeg.get(next) ?? 1) - 1)
      if ((indeg.get(next) ?? 0) <= 0) queue.push(next)
    }
  }
  // nós em ciclo/órfãos não visitados entram no fim (defensivo)
  for (const n of nodes) if (!seen.has(n.id)) order.push(n.id)
  return order
}

/**
 * Avalia todo o pipeline e devolve o `ImageData` de saída de cada nó.
 * `sourceResolver` fornece a imagem base de um nó `source` (ou null se ainda
 * não carregou). Cada operação consome a saída do seu único nó de entrada.
 */
export function computeGraph(
  nodes: ImagePipeNode[],
  edges: EdgeLike[],
  sourceResolver: (node: ImagePipeNode) => ImageData | null,
): Map<string, ImageData | null> {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const inputOf = new Map<string, string>()
  for (const e of edges) {
    if (!inputOf.has(e.target)) inputOf.set(e.target, e.source)
  }

  const out = new Map<string, ImageData | null>()
  for (const id of topoOrder(nodes, edges)) {
    const node = byId.get(id)
    if (!node) continue

    if (node.type === "source") {
      out.set(id, sourceResolver(node))
      continue
    }

    const srcId = inputOf.get(id)
    const input = srcId ? (out.get(srcId) ?? null) : null

    if (node.type === "output" || !input) {
      out.set(id, input)
      continue
    }

    out.set(
      id,
      applyOperation(node.type, input, node.data.amount ?? defaultAmount(node.type)),
    )
  }
  return out
}
