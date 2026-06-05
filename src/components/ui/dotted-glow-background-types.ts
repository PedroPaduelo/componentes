export type DottedGlowBackgroundProps = {
  className?: string
  /** distância entre os centros dos pontos, em pixels */
  gap?: number
  /** raio base de cada ponto, em CSS px */
  radius?: number
  /** cor do ponto (pulsa por alpha) */
  color?: string
  /** cor opcional do ponto no dark mode */
  darkColor?: string
  /** cor de sombra/glow para os pontos brilhantes */
  glowColor?: string
  /** cor de glow opcional no dark mode */
  darkGlowColor?: string
  /** nome de CSS variable para a cor do ponto no light (ex.: --color-neutral-500) */
  colorLightVar?: string
  /** nome de CSS variable para a cor do ponto no dark (ex.: --color-neutral-100) */
  colorDarkVar?: string
  /** nome de CSS variable para a cor do glow no light */
  glowColorLightVar?: string
  /** nome de CSS variable para a cor do glow no dark */
  glowColorDarkVar?: string
  /** opacidade global da camada inteira */
  opacity?: number
  /** opacidade do fade radial de fundo (0 = fundo transparente) */
  backgroundOpacity?: number
  /** velocidade mínima por ponto, em rad/s */
  speedMin?: number
  /** velocidade máxima por ponto, em rad/s */
  speedMax?: number
  /** multiplicador global de velocidade */
  speedScale?: number
}
