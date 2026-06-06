import type { ReactNode } from "react"

export interface NoiseBackgroundProps {
  children?: ReactNode
  className?: string
  containerClassName?: string
  gradientColors?: string[]
  noiseIntensity?: number
  speed?: number
  backdropBlur?: boolean
  animating?: boolean
}
