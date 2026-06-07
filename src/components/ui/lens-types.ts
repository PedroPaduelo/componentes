import * as React from "react"

export type LensPosition = {
  x: number
  y: number
}

export type LensProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Conteúdo a ser ampliado pela lente (imagem, card, etc). */
  children: React.ReactNode
  /** Fator de zoom aplicado dentro da lente. Padrão: 1.5. */
  zoomFactor?: number
  /** Diâmetro da lente em pixels. Padrão: 170. */
  lensSize?: number
  /** Posição fixa da lente quando `isStatic` é true. */
  position?: LensPosition
  /** Renderiza a lente em posição fixa (sem seguir o cursor). */
  isStatic?: boolean
  /** Estado controlado de hover (opcional). */
  hovering?: boolean
  /** Setter do estado controlado de hover (opcional). */
  setHovering?: (hovering: boolean) => void
}
