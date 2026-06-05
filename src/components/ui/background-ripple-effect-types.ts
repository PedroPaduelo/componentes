import type * as React from "react"

/** Coordenada (linha, coluna) da célula clicada no grid do ripple. */
export type RippleCell = {
  row: number
  col: number
}

export type BackgroundRippleEffectProps = {
  /** Número de linhas da grade. Default: 8. */
  rows?: number
  /** Número de colunas da grade. Default: 27. */
  cols?: number
  /** Tamanho (px) de cada célula quadrada. Default: 56. */
  cellSize?: number
  /** Classe extra no wrapper raiz. */
  className?: string
}

export type DivGridProps = {
  className?: string
  rows: number
  cols: number
  /** Tamanho (px) de cada célula. */
  cellSize: number
  borderColor: string
  fillColor: string
  clickedCell: RippleCell | null
  onCellClick?: (row: number, col: number) => void
  interactive?: boolean
}

/** Estilo de célula com as custom properties CSS que dirigem a animação do ripple. */
export type CellStyle = React.CSSProperties & {
  "--delay"?: string
  "--duration"?: string
}
