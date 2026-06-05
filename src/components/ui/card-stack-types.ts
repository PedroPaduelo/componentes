import type * as React from "react"

/** Um card de testimonial da pilha. */
export type CardStackItem = {
  id: number
  name: string
  designation: string
  content: React.ReactNode
}

export type CardStackProps = {
  /** Itens exibidos na pilha. A ordem inicial define a profundidade. */
  items: CardStackItem[]
  /** Deslocamento vertical (px) entre cards empilhados. Default: 10. */
  offset?: number
  /** Fator de redução de escala por profundidade. Default: 0.06. */
  scaleFactor?: number
  /** Classe extra aplicada ao wrapper. */
  className?: string
}

export type HighlightProps = {
  children: React.ReactNode
  className?: string
}
