import * as React from "react"

export type CanvasTextProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** Texto a ser renderizado com o efeito de linhas onduladas. */
  text: string
  /** Classes adicionais para o wrapper span. */
  className?: string
  /** Classes de fundo para detecção de cor do tema (bg + dark:bg). */
  backgroundClassName?: string
  /** Paleta de cores das linhas (cíclica). Padrão: 6 cores vibrantes. */
  colors?: string[]
  /** Duração de um ciclo completo da animação (segundos). Padrão: 5. */
  animationDuration?: number
  /** Espessura das linhas (px). Padrão: 1.5. */
  lineWidth?: number
  /** Espaçamento vertical entre linhas (px). Padrão: 10. */
  lineGap?: number
  /** Intensidade da curva das linhas (px). Padrão: 60. */
  curveIntensity?: number
  /** Se true, posiciona o canvas de forma absoluta sobre o conteúdo. */
  overlay?: boolean
}
