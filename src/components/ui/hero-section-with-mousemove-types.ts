import type * as React from "react"

/** Um item flutuante que reage ao movimento do mouse no hero. */
export type HeroFloatingItem = {
  /** URL da imagem exibida no card flutuante. */
  src: string
  /** Texto alternativo da imagem (acessibilidade). */
  alt: string
  /**
   * Profundidade do parallax: quanto maior, mais o item se desloca com o
   * movimento do mouse. Valores típicos entre 10 e 60.
   */
  depth: number
  /** Posicionamento absoluto (classes Tailwind, ex.: `"left-10 top-12"`). */
  position: string
}

/** Props do componente `HeroSectionWithMousemove`. */
export type HeroSectionWithMousemoveProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> & {
  /** Título principal do hero. */
  title?: React.ReactNode
  /** Subtítulo / descrição abaixo do título. */
  description?: React.ReactNode
  /**
   * Itens flutuantes que reagem ao mouse com parallax. Cada um tem `depth`
   * (intensidade do deslocamento) e `position` (classes de posicionamento).
   */
  items?: HeroFloatingItem[]
}
