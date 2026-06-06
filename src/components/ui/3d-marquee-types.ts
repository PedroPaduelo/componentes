/**
 * Tipos públicos do componente `3d-marquee` (Aceternity UI).
 *
 * Mantidos em arquivo `.ts` separado para satisfazer a regra
 * `react-refresh/only-export-components` do projeto: o componente
 * (`3d-marquee.tsx`) exporta só o componente React; os tipos ficam aqui.
 */

import type * as React from "react"

export interface ThreeDMarqueeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** URLs das imagens exibidas no grid 3D. Mínimo recomendado: 16 (4 por coluna). */
  images: readonly string[]
  /** Classe extra aplicada ao wrapper externo. */
  className?: string
}
