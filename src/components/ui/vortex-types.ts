import * as React from "react"

export type VortexProps = {
  /** Conteúdo sobreposto ao canvas (CTA, texto, botões). */
  children?: React.ReactNode
  /** Classe aplicada ao wrapper dos children (camada `z-10`). */
  className?: string
  /** Classe aplicada ao container raiz que envolve canvas + children. */
  containerClassName?: string
  /** Quantidade de partículas do redemoinho. */
  particleCount?: number
  /** Amplitude vertical (em px) onde as partículas nascem em torno do centro. */
  rangeY?: number
  /** Matiz base (HSL hue) das partículas. */
  baseHue?: number
  /** Velocidade base das partículas. */
  baseSpeed?: number
  /** Variação de velocidade somada à base. */
  rangeSpeed?: number
  /** Raio base (espessura) do traço das partículas. */
  baseRadius?: number
  /** Variação de raio somada à base. */
  rangeRadius?: number
  /** Cor de fundo do canvas. */
  backgroundColor?: string
}
