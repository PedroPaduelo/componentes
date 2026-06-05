/**
 * Tipos públicos do componente `FlipText`.
 *
 * Este arquivo existe separado de `flip-text.tsx` por causa do lint
 * `react-refresh/only-export-components`: um arquivo `.tsx` que mistura a
 * declaração do componente com tipos/interfaces dispara o lint. Mantemos
 * o `flip-text.tsx` puro (apenas o componente) e os types aqui.
 *
 * Consumidores devem importar o componente de `@/components/ui/flip-text`
 * e os types do mesmo caminho (o barrel `index.ts` re-exporta ambos).
 */

import type * as React from "react"

/**
 * Props do componente `FlipText`.
 *
 * Cada caractere do `children` rotaciona no eixo X com timing staggered
 * (sine wave), criando um efeito de onda 3D contínuo. O componente é
 * puramente CSS — sem deps externas, sem JS de animação.
 */
export type FlipTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Texto a ser renderizado com efeito flip. Caracteres são tratados individualmente. */
  children: string
  /**
   * Duração da animação por ciclo, em segundos. Default: 2.2.
   * Valores menores = animação mais rápida, valores maiores = mais lenta.
   */
  duration?: number
  /**
   * Delay inicial em segundos antes do primeiro ciclo. Default: 0.
   * Útil pra sincronizar o início do efeito com outros elementos.
   */
  delay?: number
  /**
   * Se true (default), a animação repete infinitamente. Se false, roda
   * apenas uma vez e para na posição final.
   */
  loop?: boolean
  /**
   * String usada como separador visual entre palavras. Default: " ".
   * Espaços são preservados visualmente como `&nbsp;`; outros separadores
   * são renderizados como um span inline.
   */
  separator?: string
}
