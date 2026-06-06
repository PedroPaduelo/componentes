/**
 * Tipos públicos do componente `ParallaxHeroImages2`.
 *
 * Separado de `parallax-hero-images-2.tsx` por causa do lint
 * `react-refresh/only-export-components`: um `.tsx` que mistura a declaração do
 * componente com tipos/interfaces exportados dispara o lint. Mantemos o `.tsx`
 * puro (apenas o componente) e os types aqui.
 *
 * Consumidores importam o componente E os types de
 * `@/components/ui/parallax-hero-images-2` (o barrel `index.ts` re-exporta).
 */

/**
 * Props do componente `ParallaxHeroImages2` — variante 2 (scroll-driven) do
 * parallax hero da Aceternity UI.
 *
 * Diferente da v1 (mouse-driven), aqui as imagens são distribuídas em colunas e
 * transladam verticalmente conforme a ROLAGEM avança: colunas alternadas sobem
 * e descem em velocidades diferentes, criando profundidade. Ideal para hero
 * sections com conteúdo sobreposto.
 */
export interface ParallaxHeroImages2Props {
  /**
   * Lista de URLs de imagens. Renderiza no máximo 8 (o excedente é descartado
   * via slice). São distribuídas igualmente entre as colunas.
   */
  images: string[]
  /**
   * Referência do elemento scrollável que dirige o parallax. Quando omitido, o
   * progresso é medido pela rolagem da janela. Em áreas scrolláveis próprias
   * (ex.: card de detalhe da vitrine), passe a ref do container rolável para o
   * efeito reagir à rolagem interna.
   */
  scrollRef?: React.RefObject<HTMLElement | null>
  /** Classes CSS adicionais para o container raiz. */
  className?: string
  /** Classes CSS aplicadas a cada `<img>`. */
  imageClassName?: string
}
