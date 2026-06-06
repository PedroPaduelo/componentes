import type * as React from "react"

export interface TimelineEntry {
  /** Rótulo da entrada (geralmente uma data ou marco). */
  title: string
  /** Conteúdo arbitrário renderizado ao lado/abaixo do marco. */
  content: React.ReactNode
}

export type TimelineProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de entradas exibidas na linha do tempo, na ordem. */
  data: TimelineEntry[]
  /** Título exibido no topo da timeline. */
  heading?: string
  /** Texto descritivo exibido abaixo do título. */
  description?: string
  /**
   * Ref opcional do elemento scrollável que controla o progresso da linha
   * animada. Quando a timeline vive numa área com scroll próprio (ex.: card de
   * detalhe), passe a ref desse contêiner; sem ela, o progresso é medido pela
   * rolagem da janela.
   */
  scrollRef?: React.RefObject<HTMLElement | null>
}
