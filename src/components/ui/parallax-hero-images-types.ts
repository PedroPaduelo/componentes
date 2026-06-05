/**
 * Tipos públicos do componente `ParallaxHeroImages`.
 *
 * Este arquivo existe separado de `parallax-hero-images.tsx` por causa do lint
 * `react-refresh/only-export-components`: um arquivo `.tsx` que mistura a
 * declaração do componente com tipos/interfaces exportados dispara o lint.
 * Mantemos o `.tsx` puro (apenas o componente) e os types aqui.
 *
 * Consumidores devem importar o componente E os types de
 * `@/components/ui/parallax-hero-images` (o barrel `index.ts` re-exporta ambos).
 */

/**
 * Variante do mapa de profundidade — define quais imagens parecem "mais
 * próximas" (maior fator de profundidade ⇒ maior deslocamento no parallax).
 *
 * - `default`: as imagens do MEIO são as mais próximas.
 * - `edge-focus`: as imagens das BORDAS são as mais próximas.
 */
export type ParallaxHeroVariant = "default" | "edge-focus"

/**
 * Props do componente `ParallaxHeroImages`.
 *
 * Efeito parallax dirigido pelo mouse para hero sections: cada imagem é
 * posicionada em uma "profundidade" diferente e translada proporcionalmente ao
 * movimento do cursor (mais próximas se movem mais). Na entrada, cada imagem
 * faz fade-in com blur.
 */
export interface ParallaxHeroImagesProps {
  /**
   * Lista de URLs de imagens (obrigatória). No máximo 8 são renderizadas — o
   * excedente é descartado (slice). Cada índice mapeia para uma posição/
   * profundidade fixa conforme a `variant`.
   */
  images: string[]
  /** Classes CSS adicionais para o container raiz. */
  className?: string
  /** Classes CSS aplicadas a cada `<img>` (ex.: `w-60` para sizing). */
  imageClassName?: string
  /**
   * Mapa de profundidade por índice.
   * @default "default"
   */
  variant?: ParallaxHeroVariant
}
