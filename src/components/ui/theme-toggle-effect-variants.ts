/**
 * Variantes de animação para o ThemeToggleEffect.
 * Cada variante produz um clipPath / filter distinto no toggle de tema.
 */
export type ThemeToggleEffectVariant =
  | "circle"
  | "circle-blur"
  | "circle-blur-top-left"
  | "triangle"
  | "triangle-blur"
  | "polygon"
  | "polygon-gradient"

/** Duração e easing recomendados por variante. */
export function getVariantOptions(
  variant: ThemeToggleEffectVariant,
): KeyframeAnimationOptions {
  switch (variant) {
    case "circle":
      return { duration: 400, easing: "ease-in-out", fill: "forwards" }
    case "circle-blur":
      return { duration: 500, easing: "ease-in-out", fill: "forwards" }
    case "circle-blur-top-left":
      return { duration: 500, easing: "ease-out", fill: "forwards" }
    case "triangle":
    case "triangle-blur":
      return {
        duration: 500,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      }
    case "polygon":
    case "polygon-gradient":
      return { duration: 600, easing: "ease-in-out", fill: "forwards" }
  }
}

/**
 * Retorna os keyframes de clipPath para a variante escolhida.
 *
 * @param variant  - nome da variante
 * @param origin   - ponto de origem {x, y} em px
 * @param maxDim   - maior dimensão do viewport (diagonal) em px
 */
export function getVariantKeyframes(
  variant: ThemeToggleEffectVariant,
  origin: { x: number; y: number },
  maxDim: number,
): Keyframe[] {
  const { x, y } = origin

  switch (variant) {
    // ── circle ──────────────────────────────────────────────
    case "circle":
      return [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${maxDim}px at ${x}px ${y}px)` },
      ]

    // ── circle-blur ─────────────────────────────────────────
    case "circle-blur":
      return [
        {
          clipPath: `circle(0px at ${x}px ${y}px)`,
          filter: "blur(20px)",
        },
        {
          clipPath: `circle(${maxDim}px at ${x}px ${y}px)`,
          filter: "blur(0px)",
        },
      ]

    // ── circle-blur-top-left ────────────────────────────────
    case "circle-blur-top-left":
      return [
        {
          clipPath: `circle(0px at ${x}px ${y}px)`,
          filter: "blur(16px)",
        },
        {
          clipPath: `circle(${maxDim}px at ${x}px ${y}px)`,
          filter: "blur(0px)",
        },
      ]

    // ── triangle ────────────────────────────────────────────
    case "triangle": {
      const r0 = 0
      const r1 = maxDim * 0.8
      return [
        {
          clipPath: `polygon(
            ${x}px ${y - r0}px,
            ${x - r0}px ${y + r0 * 0.577}px,
            ${x + r0}px ${y + r0 * 0.577}px
          )`,
        },
        {
          clipPath: `polygon(
            ${x}px ${y - r1}px,
            ${x - r1}px ${y + r1 * 0.577}px,
            ${x + r1}px ${y + r1 * 0.577}px
          )`,
        },
      ]
    }

    // ── triangle-blur ───────────────────────────────────────
    case "triangle-blur": {
      const r0 = 0
      const r1 = maxDim * 0.8
      return [
        {
          clipPath: `polygon(
            ${x}px ${y - r0}px,
            ${x - r0}px ${y + r0 * 0.577}px,
            ${x + r0}px ${y + r0 * 0.577}px
          )`,
          filter: "blur(16px)",
        },
        {
          clipPath: `polygon(
            ${x}px ${y - r1}px,
            ${x - r1}px ${y + r1 * 0.577}px,
            ${x + r1}px ${y + r1 * 0.577}px
          )`,
          filter: "blur(0px)",
        },
      ]
    }

    // ── polygon (estrela de 8 pontas) ───────────────────────
    case "polygon": {
      const outerR = maxDim
      const innerR = maxDim * 0.4
      const points = 8
      const buildStar = (scale: number): string => {
        const pts: string[] = []
        for (let i = 0; i < points * 2; i++) {
          const angle = (Math.PI * i) / points - Math.PI / 2
          const r = i % 2 === 0 ? outerR * scale : innerR * scale
          pts.push(`${x + r * Math.cos(angle)}px ${y + r * Math.sin(angle)}px`)
        }
        return `polygon(${pts.join(", ")})`
      }
      return [
        { clipPath: buildStar(0) },
        { clipPath: buildStar(1) },
      ]
    }

    // ── polygon-gradient (mesmo shape, gradiente via CSS) ───
    case "polygon-gradient": {
      const outerR = maxDim
      const innerR = maxDim * 0.4
      const points = 8
      const buildStar = (scale: number): string => {
        const pts: string[] = []
        for (let i = 0; i < points * 2; i++) {
          const angle = (Math.PI * i) / points - Math.PI / 2
          const r = i % 2 === 0 ? outerR * scale : innerR * scale
          pts.push(`${x + r * Math.cos(angle)}px ${y + r * Math.sin(angle)}px`)
        }
        return `polygon(${pts.join(", ")})`
      }
      return [
        { clipPath: buildStar(0) },
        { clipPath: buildStar(1) },
      ]
    }
  }
}

/**
 * Calcula a origem da animação conforme a variante.
 * - circle, circle-blur, polygon, polygon-gradient → centro do viewport
 * - circle-blur-top-left → canto superior esquerdo
 * - triangle, triangle-blur → centro do botão (passado via buttonRect)
 */
export function getVariantOrigin(
  variant: ThemeToggleEffectVariant,
  innerWidth: number,
  innerHeight: number,
  buttonRect?: DOMRect,
): { x: number; y: number } {
  switch (variant) {
    case "circle":
    case "circle-blur":
    case "polygon":
    case "polygon-gradient":
      return { x: innerWidth / 2, y: innerHeight / 2 }
    case "circle-blur-top-left":
      return { x: 0, y: 0 }
    case "triangle":
    case "triangle-blur":
      if (buttonRect) {
        return {
          x: buttonRect.left + buttonRect.width / 2,
          y: buttonRect.top + buttonRect.height / 2,
        }
      }
      // fallback: centro do viewport
      return { x: innerWidth / 2, y: innerHeight / 2 }
  }
}
