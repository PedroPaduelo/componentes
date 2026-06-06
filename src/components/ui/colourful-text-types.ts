/**
 * ColourfulText — tipagem pública.
 *
 * Componente Aceternity UI: cada caractere do texto anima com cor
 * (reembaralhada a cada 5s entre 10 tons do espectro RGB), y, scale,
 * filter blur e opacity em loop. Cores são fixas (assinatura visual
 * do efeito) e NÃO seguem tokens semânticos do tema shadcn.
 */

import type { HTMLAttributes } from "react"

export type ColourfulTextProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** Texto a ser renderizado caractere a caractere com efeito colorido animado. */
  text: string
}
