import type * as React from "react"

export type TracingBeamProps = {
  /** Conteúdo ao lado do qual o beam é desenhado. */
  children: React.ReactNode
  /**
   * Ref opcional do contêiner scrollável que dirige o progresso do beam.
   * Quando informada, o `useScroll` mede a rolagem DESSE elemento em vez da
   * janela — necessário quando o componente vive dentro de uma área com
   * `overflow-y-auto` (ex.: o card de detalhe da vitrine).
   */
  scrollRef?: React.RefObject<HTMLElement | null>
  className?: string
}
