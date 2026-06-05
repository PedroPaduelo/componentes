import type * as React from "react"

/** Um produto exibido como thumbnail no Hero Parallax. */
export type Product = {
  /** Título do produto (também usado como `key` e no overlay de hover). */
  title: string
  /** URL de destino ao clicar no thumbnail. */
  link: string
  /** URL da imagem (thumbnail) do produto. */
  thumbnail: string
}

/** Props do componente `HeroParallax`. */
export type HeroParallaxProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /**
   * Lista de produtos (espera ~15, divididos em 3 fileiras de 5).
   * Fileiras 1 e 3 transladam num sentido; a fileira 2, no sentido oposto.
   */
  products: Product[]
  /**
   * Título do header. Se omitido, usa um título padrão.
   */
  heading?: React.ReactNode
  /**
   * Descrição do header. Se omitida, usa um texto padrão.
   */
  description?: React.ReactNode
  /**
   * Ref do elemento scrollável que dirige o parallax. Quando o `HeroParallax`
   * vive dentro de uma área `overflow-y-auto` própria (caso da vitrine), passe
   * o ref desse container — o `useScroll` o usa como `container` (em vez da
   * rolagem da janela), e a "pista" interna `h-[300vh]` como `target`.
   */
  scrollRef?: React.RefObject<HTMLElement | null>
}
