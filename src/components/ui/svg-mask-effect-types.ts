import type * as React from "react"

/** Props do `MaskContainer` (SVG Mask Effect, Aceternity UI). */
export type MaskContainerProps = {
  /** Conteúdo base, revelado pela máscara que segue o cursor no hover. */
  children?: string | React.ReactNode
  /** Texto exibido por padrão (a camada mascarada o cobre no hover). */
  revealText?: string | React.ReactNode
  /** Tamanho (px) da máscara em repouso. Default: 10. */
  size?: number
  /** Tamanho (px) da máscara no hover. Default: 600. */
  revealSize?: number
  /** Classes extras aplicadas ao container raiz. */
  className?: string
}
