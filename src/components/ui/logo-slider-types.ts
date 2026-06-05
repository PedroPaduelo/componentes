/**
 * Tipos públicos do componente `LogoSlider`.
 *
 * Este arquivo existe separado de `logo-slider.tsx` por causa do lint
 * `react-refresh/only-export-components`: um arquivo `.tsx` que mistura a
 * declaração do componente com tipos/interfaces dispara o lint. Mantemos
 * o `logo-slider.tsx` puro (apenas o componente) e os types aqui.
 *
 * Consumidores devem importar o componente de `@/components/ui/logo-slider`
 * e os types do mesmo caminho (o barrel `index.ts` re-exporta ambos).
 */

import type { ReactNode } from "react"

/**
 * Props do componente `LogoSlider`.
 *
 * Marquee infinito de logos (CSS puro, sem motion) com blur progressivo nas
 * bordas. Os logos são duplicados internamente para garantir loop sem emenda.
 */
export interface LogoSliderProps {
  /** Lista de logos (ReactNode) a exibir no marquee. */
  logos: ReactNode[]
  /**
   * Direção do scroll do marquee.
   * @default "left"
   */
  direction?: "left" | "right"
  /**
   * Duração (em segundos) de um ciclo completo da animação.
   * Quanto menor, mais rápido o marquee.
   * @default 40
   */
  speed?: number
  /**
   * Pausa a animação enquanto o cursor está sobre o slider.
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Exibe os painéis de blur progressivo nas bordas esquerda/direita.
   * @default true
   */
  showBlur?: boolean
  /**
   * Espaçamento (em pixels) entre os logos.
   * @default 64
   */
  gap?: number
  /** Classes CSS adicionais para o container raiz. */
  className?: string
}
