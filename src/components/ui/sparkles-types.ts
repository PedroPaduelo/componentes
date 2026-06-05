/**
 * Tipos públicos do componente Sparkles (SparklesCore).
 *
 * Extraídos para um módulo separado para manter `sparkles.tsx` com export
 * exclusivo de componente (regra eslint react-refresh/only-export-components).
 */

export interface SparklesCoreProps {
  /** id opcional repassado ao `<canvas>` (útil para múltiplas instâncias). */
  id?: string
  /** Classe(s) aplicada(s) ao container raiz. */
  className?: string
  /** Cor de fundo do container. Default: transparente. */
  background?: string
  /** Tamanho fixo (em px) de cada partícula. Se omitido, usa minSize/maxSize. */
  particleSize?: number
  /** Raio mínimo (em px) das partículas. Default ~0.4. */
  minSize?: number
  /** Raio máximo (em px) das partículas. Default ~1. */
  maxSize?: number
  /** Velocidade do twinkle/drift. Default ~1. */
  speed?: number
  /** Cor das partículas. Default "#FFFFFF". */
  particleColor?: string
  /**
   * Densidade de partículas — número-base escalado pela área do canvas.
   * Default ~120. Valores típicos: 100–1200.
   */
  particleDensity?: number
}
