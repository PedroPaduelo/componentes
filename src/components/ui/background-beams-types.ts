/**
 * Tipos públicos do BackgroundBeams.
 *
 * Extraídos para um módulo `.ts` separado porque o componente em
 * `background-beams.tsx` é memoizado (React.memo) e o lint
 * `react-refresh/only-export-components` reclama quando um arquivo de
 * componente também exporta tipos/valores não-componente.
 */

export type BackgroundBeamsProps = {
  /** Classe extra mesclada via `cn` no container absoluto raiz. */
  className?: string
}
