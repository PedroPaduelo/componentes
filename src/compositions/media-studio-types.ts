/**
 * Tipos e constantes runtime da composição "Generative Media Studio".
 *
 * Mora num arquivo `.ts` separado (sem componentes) para respeitar a regra
 * `react-refresh/only-export-components` — os nós (`.tsx`) só exportam
 * componentes; estas consts/funções utilitárias ficam aqui.
 */
import type { Node } from "@xyflow/react"

/** Tipos de nó suportados pelo estúdio de mídia. */
export type MediaNodeKind =
  | "textInput"
  | "imageInput"
  | "textGen"
  | "imageGen"
  | "videoGen"
  | "audioGen"
  | "output"

/** Categoria do nó (define paleta de cor e agrupamento). */
export type MediaCategory = "inputs" | "generation" | "layout"

/** Estado da geração de um nó. */
export type MediaStatus = "idle" | "generating" | "done"

/** Asset (imagem/vídeo) coletado pelo nó de saída. */
export type MediaAsset = {
  id: string
  kind: MediaNodeKind
  url: string
}

/** Formato do `data` de cada nó do estúdio. */
export type MediaNodeData = {
  /** Título em destaque. */
  label: string
  /** Modelo generativo (ex.: "Flux", "Runway"). */
  model?: string
  /** Prompt textual editável no inspetor. */
  prompt?: string
  /** Seed determinística (controla o thumbnail picsum). */
  seed?: number
  /** Proporção do asset (ex.: "1:1", "16:9"). */
  aspect?: string
  /** Estado da geração (nós de Generation). */
  status?: MediaStatus
  /** Texto "gerado" exibido nos nós de texto quando `done`. */
  text?: string
  /** Assets recebidos (apenas o nó `output`, monta o mosaico). */
  assets?: MediaAsset[]
}

export type MediaNode = Node<MediaNodeData, MediaNodeKind>

/** Categoria de cada tipo de nó. */
export const NODE_CATEGORY: Record<MediaNodeKind, MediaCategory> = {
  textInput: "inputs",
  imageInput: "inputs",
  textGen: "generation",
  imageGen: "generation",
  videoGen: "generation",
  audioGen: "generation",
  output: "layout",
}

/** URL determinística de thumbnail a partir da seed. */
export function thumbUrl(seed: number, w = 320, h = 200): string {
  return `https://picsum.photos/seed/media-${seed}/${w}/${h}`
}
