import * as React from "react"

/**
 * Tipos do 3D Card Effect (Aceternity UI), reimplementado padronizado shadcn.
 *
 * Mantido em arquivo separado (.ts puro, sem JSX) para satisfazer o
 * react-refresh/only-export-components (o .tsx só exporta componentes).
 */

export type CardContainerProps = {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
}

export type CardBodyProps = {
  children?: React.ReactNode
  className?: string
}

export type CardItemProps = {
  /** Elemento (ou componente) a renderizar. Default: "div". */
  as?: React.ElementType
  children?: React.ReactNode
  className?: string
  translateX?: number | string
  translateY?: number | string
  translateZ?: number | string
  rotateX?: number | string
  rotateY?: number | string
  rotateZ?: number | string
  /** Props extras encaminhadas ao elemento subjacente (href, onClick, etc.). */
  [key: string]: unknown
}
