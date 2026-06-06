import type * as React from "react"

export type HeroHighlightProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: React.ReactNode
  /** Classe aplicada ao container interno (z-20) que envolve o conteúdo. */
  className?: string
  /** Classe aplicada ao wrapper externo (fundo de pontos + hover mask). */
  containerClassName?: string
}

export type HeroHighlightTextProps = {
  children: React.ReactNode
  className?: string
}
