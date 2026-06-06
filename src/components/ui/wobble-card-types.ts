import * as React from "react"

/**
 * Tipos do Wobble Card (Aceternity UI), reimplementado padronizado shadcn.
 *
 * Mantido em arquivo separado (.ts puro, sem JSX) para satisfazer o
 * react-refresh/only-export-components (o .tsx só exporta o componente).
 */

/**
 * Card Aceternity que "balança" seguindo o cursor: o wrapper translada
 * proporcionalmente à posição do mouse, e o conteúdo interno faz o
 * movimento inverso + leve scale (≈ 1.03), criando a sensação de
 * profundidade. Inclui um noise overlay (SVG fractalNoise) para textura.
 */
export type WobbleCardProps = {
  /** Conteúdo renderizado sobre o noise overlay. */
  children?: React.ReactNode
  /** Classes extras aplicadas no container externo (mexem no tilt). */
  containerClassName?: string
  /** Classes extras aplicadas no conteúdo interno (mexem no inverse-tilt). */
  className?: string
}
