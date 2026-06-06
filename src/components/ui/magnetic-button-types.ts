import type * as React from "react"

export type MagneticButtonProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onMouseMove" | "onMouseLeave"
> & {
  /** Conteúdo do botão (será envolvido pelo motion.div magnético). */
  children: React.ReactNode
  /** Multiplicador de força do deslocamento (0..1). Padrão: 0.5 (mais sutil que o 0.8 do original). */
  strength?: number
  /** Distância máxima em px do cursor até o wrapper. Padrão: 100. */
  maxDistance?: number
}

export const MAGNETIC_DEFAULT_STRENGTH = 0.5
export const MAGNETIC_DEFAULT_MAX_DISTANCE = 100
export const MAGNETIC_SPRING_CONFIG = {
  stiffness: 150,
  damping: 25,
  mass: 0.1,
} as const
