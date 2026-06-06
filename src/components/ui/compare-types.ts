import type { HTMLAttributes } from "react"

export type CompareProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** URL da primeira imagem (exibida à esquerda do slider). */
  firstImage?: string
  /** URL da segunda imagem (exibida à direita, por baixo). */
  secondImage?: string
  /** Classe extra para o container da primeira imagem. */
  firstImageClassName?: string
  /** Classe extra para a segunda imagem. */
  secondImageClassname?: string
  /** Posição inicial do slider em porcentagem (0-100). Default: 50. */
  initialSliderPercentage?: number
  /** Modo de interação: "hover" segue o mouse, "drag" exige arrastar. */
  slideMode?: "hover" | "drag"
  /** Exibe o handle arrastável com ícone. Default: true. */
  showHandlebar?: boolean
  /** Ativa animação automática do slider. Default: false. */
  autoplay?: boolean
  /** Duração do ciclo de autoplay em ms. Default: 5000. */
  autoplayDuration?: number
}
