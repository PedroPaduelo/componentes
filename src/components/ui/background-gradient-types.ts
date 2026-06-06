import * as React from "react"

/**
 * Tipos do Background Gradient (Aceternity UI), reimplementado padronizado shadcn.
 *
 * Mantido em arquivo separado (.ts puro, sem JSX) para satisfazer o
 * react-refresh/only-export-components (o .tsx só exporta componentes).
 */
export interface BackgroundGradientProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children?: React.ReactNode
  /** Classe do wrapper de conteúdo interno (relative z-10). */
  className?: string
  /** Classe do container raiz que recebe os gradientes. */
  containerClassName?: string
  /** Anima a posição dos gradientes em loop. Default: true. */
  animate?: boolean
}
