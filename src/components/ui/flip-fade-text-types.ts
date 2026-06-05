/**
 * Tipos públicos do componente `FlipFadeText`.
 *
 * Este arquivo existe separado de `flip-fade-text.tsx` por causa do lint
 * `react-refresh/only-export-components`: um arquivo `.tsx` que mistura a
 * declaração do componente com tipos/interfaces dispara o lint. Mantemos
 * o `flip-fade-text.tsx` puro (apenas o componente) e os types aqui.
 *
 * Consumidores devem importar o componente de `@/components/ui/flip-fade-text`
 * e os types do mesmo caminho (o barrel `index.ts` re-exporta ambos).
 */

import type { ReactNode } from "react"

/**
 * Props do componente `FlipFadeText`.
 *
 * Cicla por um array de palavras; cada palavra entra/sai com flip 3D
 * (rotateX), blur e translate por LETRA, com stagger configurável entre
 * letras. Efeito típico de "loading state" estilizado.
 */
export interface FlipFadeTextProps {
  /**
   * Array de palavras para ciclar.
   * @default ["LOADING","COMPUTING","SEARCHING","RETRIEVING","ASSEMBLING"]
   */
  words?: string[]
  /**
   * Intervalo (ms) entre transições de palavra.
   * @default 2500
   */
  interval?: number
  /** Classes CSS adicionais pro container raiz. */
  className?: string
  /** Classes CSS adicionais pro elemento de texto (a "word" animada). */
  textClassName?: string
  /**
   * Duração (s) de cada letra na animação.
   * @default 0.6
   */
  letterDuration?: number
  /**
   * Delay (s) entre letras na entrada (stagger).
   * @default 0.1
   */
  staggerDelay?: number
  /**
   * Delay (s) entre letras na saída (stagger).
   * @default 0.05
   */
  exitStaggerDelay?: number
  /**
   * Conteúdo alternativo (children). Se fornecido, **substitui** `words`.
   * Útil pra renderizar a primeira palavra via JSX antes da animação assumir.
   * ATENÇÃO: o ciclo só é ativado quando `words` tem mais de 1 item; se
   * `children` for uma string única, a animação roda uma vez e para.
   */
  children?: ReactNode
}
