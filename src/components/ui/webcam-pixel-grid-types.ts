import type * as React from "react"

/** Modo de cor das células do grid. */
export type WebcamPixelColorMode = "webcam" | "monochrome"

export type WebcamPixelGridProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Número de colunas do grid. */
  gridCols?: number
  /** Número de linhas do grid. */
  gridRows?: number
  /** Elevação máxima (em px) aplicada às células com movimento. */
  maxElevation?: number
  /** Sensibilidade de movimento (0-1). Quanto menor, mais sensível. */
  motionSensitivity?: number
  /** Fator de suavização das transições de elevação (0-1). */
  elevationSmoothing?: number
  /** Modo de cor: "webcam" usa as cores reais; "monochrome" usa uma cor única. */
  colorMode?: WebcamPixelColorMode
  /** Cor base no modo monochrome (hex). */
  monochromeColor?: string
  /** Cor de fundo do canvas (hex/rgb/css). */
  backgroundColor?: string
  /** Espelha o feed da webcam horizontalmente. */
  mirror?: boolean
  /** Gap entre células (0-1, fração do tamanho da célula). */
  gapRatio?: number
  /** Cor da borda das células (hex). */
  borderColor?: string
  /** Opacidade da borda das células (0-1). */
  borderOpacity?: number
  /**
   * Quando `true`, NUNCA tenta acessar a webcam e renderiza o fallback animado.
   * Útil em ambientes sem câmera ou pra um preview determinístico.
   */
  forceFallback?: boolean
  /** Callback disparado quando o acesso à webcam falha (cai no fallback). */
  onWebcamError?: (error: Error) => void
  /** Callback disparado quando a webcam fica pronta. */
  onWebcamReady?: () => void
}
