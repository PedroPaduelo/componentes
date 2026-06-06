import type { VariantProps } from "class-variance-authority"

import type { textHoverEffectVariants } from "./text-hover-effect-variants"

export type TextHoverEffectDensity = NonNullable<
  VariantProps<typeof textHoverEffectVariants>["density"]
>

export type TextHoverEffectGradientStop = {
  offset: string
  color: string
}

export type TextHoverEffectProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof textHoverEffectVariants> & {
    /** Texto a renderizar em SVG (mantém o efeito visual em qualquer string). */
    text: string
    /**
     * Duração (segundos) da transição do radial mask entre posições do cursor.
     * `0` (padrão) = sem interpolação, segue instantaneamente. Use 0.3–1.5
     * para um leve "lag" prazeroso.
     */
    duration?: number
    /**
     * Stops do gradiente revelado no hover. Cores são parte da identidade
     * visual do efeito (paleta signature da Aceternity), então são fixas no
     * default mas podem ser customizadas.
     */
    gradientStops?: readonly TextHoverEffectGradientStop[]
    /** Largura do stroke no SVG (viewBox 0 0 300 100). */
    strokeWidth?: number
  }
