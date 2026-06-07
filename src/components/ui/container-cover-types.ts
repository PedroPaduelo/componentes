/**
 * Tipos públicos do Container Cover (Aceternity UI "cover").
 *
 * Extraídos para módulo separado para manter `container-cover.tsx` com export
 * exclusivo de componentes (regra eslint react-refresh/only-export-components).
 */
import type * as React from "react"

export interface ContainerCoverProps {
  /** Conteúdo destacado pelo efeito (texto/inline elements). */
  children?: React.ReactNode
  /** Classe(s) extra aplicada(s) ao texto destacado. */
  className?: string
}

export interface ContainerCoverBeamProps {
  /** Classe(s) extra do `<svg>` da beam. */
  className?: string
  /** Atraso (s) entre repetições quando não está em hover. */
  delay?: number
  /** Duração (s) da animação do gradiente quando não está em hover. */
  duration?: number
  /** Estado de hover do container (acelera/intensifica a beam). */
  hovered?: boolean
  /** Largura (px) da linha — calculada a partir do container. */
  width?: number
  /** Estilo inline (ex.: posicionamento vertical via `top`). */
  style?: React.CSSProperties
}

export interface ContainerCoverCircleProps {
  /** Classe(s) de posicionamento absoluto do ponto. */
  className?: string
  /** Atraso (s) do pulse — desencontra os 4 cantos. */
  delay?: number
}
