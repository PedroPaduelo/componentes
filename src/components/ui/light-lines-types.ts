/**
 * Tipos públicos do componente `LightLines`.
 *
 * Este arquivo existe separado de `light-lines.tsx` por causa do lint
 * `react-refresh/only-export-components`: um arquivo `.tsx` que mistura a
 * declaração do componente com tipos/interfaces dispara o lint. Mantemos
 * o `light-lines.tsx` puro (apenas o componente) e os types aqui.
 *
 * Consumidores devem importar o componente de `@/components/ui/light-lines`
 * e os types do mesmo caminho (o barrel `index.ts` re-exporta ambos).
 */

import type { ReactNode } from "react"

/**
 * Props do componente `LightLines`.
 *
 * Background animado de "light trails" em linhas verticais: um SVG com luzes
 * retangulares que se movem verticalmente (umas descendo, outras subindo) em
 * loop infinito via `requestAnimationFrame`, sobre linhas verticais estáticas
 * translúcidas e um gradiente de fundo. Efeito típico de hero / Feedback.
 *
 * Cores brand FIXAS por padrão (azul) — decisão intencional do lote VengenceUI:
 * o efeito tem identidade visual própria e não segue tokens semânticos do tema
 * shadcn. Todas as cores são configuráveis por prop.
 */
export interface LightLinesProps {
  /** Classes CSS adicionais pro container raiz. */
  className?: string
  /**
   * Opacidade das linhas verticais estáticas (0..1).
   * @default 0.05
   */
  linesOpacity?: number
  /**
   * Opacidade das luzes animadas (0..1).
   * @default 0.9
   */
  lightsOpacity?: number
  /**
   * Multiplicador de velocidade da animação.
   * @default 1
   */
  speedMultiplier?: number
  /**
   * Cor inicial do gradiente de fundo.
   * @default "#2462F6"
   */
  gradientFrom?: string
  /**
   * Cor final do gradiente de fundo.
   * @default "#5999F8"
   */
  gradientTo?: string
  /**
   * Cor das luzes animadas.
   * @default "#fff"
   */
  lightColor?: string
  /**
   * Cor das linhas verticais estáticas.
   * @default "#fff"
   */
  lineColor?: string
  /** Conteúdo sobreposto ao background. */
  children?: ReactNode
}
