import * as React from "react"

/** Variante do padrão de fundo. */
export type GridDotVariant = "grid" | "grid-small" | "dot"

export type GridAndDotBackgroundsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color"
> & {
  /**
   * Tipo de padrão renderizado.
   * - `grid`: malha de linhas com células de 40px (default).
   * - `grid-small`: malha de linhas com células de 20px.
   * - `dot`: pontos espaçados em 20px.
   * @default "grid"
   */
  variant?: GridDotVariant
  /**
   * Tamanho da célula do padrão em pixels (lado do quadrado / espaçamento
   * entre pontos). Sobrescreve o default por variante.
   */
  size?: number
  /**
   * Cor das linhas/pontos. Aceita qualquer valor CSS válido.
   * @default derivada do token --foreground (adapta a light/dark)
   */
  lineColor?: string
  /**
   * Aplica a máscara radial que faz o padrão desvanecer nas bordas.
   * @default true
   */
  faded?: boolean
  /** Classe extra aplicada ao container (alias semântico de `className`). */
  containerClassName?: string
}
