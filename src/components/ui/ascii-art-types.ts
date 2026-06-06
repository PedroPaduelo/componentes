import type { HTMLAttributes } from "react"

export type AsciiArtAnimationStyle = "fade" | "typewriter" | "matrix" | "none"

export type AsciiArtObjectFit = "cover" | "contain" | "fill"

export type AsciiArtProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** URL da imagem (CORS-friendly, ex.: picsum.photos). */
  src: string
  /** Número de colunas ASCII (resolução). Maior = mais detalhe. */
  resolution?: number
  /** Preset de charset ou string customizada. */
  charset?: string
  /** Cor do texto ASCII (ignorado se colored=true). */
  color?: string
  /** Cor de fundo. */
  backgroundColor?: string
  /** Inverte claro/escuro. */
  inverted?: boolean
  /** ASCII colorido usando cores da imagem. */
  colored?: boolean
  /** Habilita animação no load. */
  animated?: boolean
  /** Estilo de animação. */
  animationStyle?: AsciiArtAnimationStyle
  /** Duração da animação fade em segundos. */
  animationDuration?: number
  /** Font family para os caracteres ASCII. */
  fontFamily?: string
  /** Só anima quando entra na viewport. */
  animateOnView?: boolean
  /** Como a imagem se encaixa na grid ASCII. */
  objectFit?: AsciiArtObjectFit
}
