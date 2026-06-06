import * as React from "react"

import { cn } from "@/lib/utils"

/** Padrões de dithering suportados. */
export type DitheringMode = "bayer" | "halftone" | "noise" | "crosshatch"

/** Modos de processamento de cor aplicados ao dither. */
export type ColorMode = "original" | "grayscale" | "duotone" | "custom"

export interface DitherShaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** URL da imagem a ser processada pelo dither. */
  src: string
  /** Tamanho da célula do grid de dither (em px). 4 = matriz 4x4, ≥5 = 8x8. */
  gridSize?: number
  /** Tipo de dithering aplicado. */
  ditherMode?: DitheringMode
  /** Modo de cor. */
  colorMode?: ColorMode
  /** Inverte a saída. */
  invert?: boolean
  /** Multiplicador de pixelização (1 = sem, >1 = mais pixelado). */
  pixelRatio?: number
  /** Cor primária do modo `duotone`. */
  primaryColor?: string
  /** Cor secundária do modo `duotone`. */
  secondaryColor?: string
  /** Paleta custom (hex/rgb) para o modo `custom`. */
  customPalette?: string[]
  /** Brilho (-1 a 1). */
  brightness?: number
  /** Contraste (0 a 2; 1 = normal). */
  contrast?: number
  /** Cor de fundo (qualquer CSS color). "transparent" = sem fundo. */
  backgroundColor?: string
  /** Comportamento de object-fit. */
  objectFit?: "cover" | "contain" | "fill" | "none"
  /** Viés do threshold (0 a 1). */
  threshold?: number
  /** Ativa animação contínua (noise dithering). */
  animated?: boolean
  /** Velocidade da animação (maior = mais rápido). */
  animationSpeed?: number
  /** Classes Tailwind adicionais (ex.: altura/largura do wrapper). */
  className?: string
}

/** Matriz Bayer 4x4 para ordered dithering. */
const BAYER_MATRIX_4x4: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/** Matriz Bayer 8x8 para ordered dithering mais fino. */
const BAYER_MATRIX_8x8: number[][] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

type RGB = [number, number, number]

function parseColor(color: string): RGB {
  if (color.startsWith("#")) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      return [
        parseInt(hex[0]! + hex[0]!, 16),
        parseInt(hex[1]! + hex[1]!, 16),
        parseInt(hex[2]! + hex[2]!, 16),
      ]
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ]
  }
  const match = color.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i)
  if (match) {
    return [parseInt(match[1]!), parseInt(match[2]!), parseInt(match[3]!)]
  }
  return [0, 0, 0]
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Dither Shader (Aceternity UI) — aplica um algoritmo de dithering
 * (Bayer/halftone/noise/crosshatch) sobre uma imagem renderizada num
 * `<canvas>`, com suporte a múltiplos modos de cor (grayscale/duotone/custom).
 *
 * Não usa WebGL — opera via Canvas 2D, dispensando libs de shader.
 * Cleanup no unmount: cancela o rAF ativo e desconecta o ResizeObserver.
 */
function DitherShader({
  src,
  gridSize = 4,
  ditherMode = "bayer",
  colorMode = "original",
  invert = false,
  pixelRatio = 1,
  primaryColor = "#000000",
  secondaryColor = "#ffffff",
  customPalette = ["#000000", "#ffffff"],
  brightness = 0,
  contrast = 1,
  backgroundColor = "transparent",
  objectFit = "cover",
  threshold = 0.5,
  animated = false,
  animationSpeed = 0.02,
  className,
  ...hostProps
}: DitherShaderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const animationRef = React.useRef<number | null>(null)
  const timeRef = React.useRef<number>(0)
  const imageRef = React.useRef<HTMLImageElement | null>(null)
  const imageDataRef = React.useRef<ImageData | null>(null)
  const dimensionsRef = React.useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  const [dimensions, setDimensions] = React.useState<{
    width: number
    height: number
  }>({ width: 0, height: 0 })

  const parsedPrimaryColor = parseColor(primaryColor)
  const parsedSecondaryColor = parseColor(secondaryColor)
  const parsedCustomPalette = React.useMemo(
    () => customPalette.map(parseColor),
    [customPalette],
  )

  const applyDithering = React.useCallback(
    (
      ctx: CanvasRenderingContext2D,
      displayWidth: number,
      displayHeight: number,
      time: number = 0,
    ) => {
      if (!imageDataRef.current) return

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, displayWidth, displayHeight)
      } else {
        ctx.clearRect(0, 0, displayWidth, displayHeight)
      }

      const sourceData = imageDataRef.current.data
      const sourceWidth = imageDataRef.current.width
      const sourceHeight = imageDataRef.current.height

      const effectivePixelSize = Math.max(1, Math.floor(gridSize * pixelRatio))
      const matrixSize = gridSize <= 4 ? 4 : 8
      const bayerMatrix = gridSize <= 4 ? BAYER_MATRIX_4x4 : BAYER_MATRIX_8x8
      const matrixScale = matrixSize === 4 ? 16 : 64

      for (let y = 0; y < displayHeight; y += effectivePixelSize) {
        for (let x = 0; x < displayWidth; x += effectivePixelSize) {
          const srcX = Math.floor((x / displayWidth) * sourceWidth)
          const srcY = Math.floor((y / displayHeight) * sourceHeight)
          const srcIdx = (srcY * sourceWidth + srcX) * 4

          let r = sourceData[srcIdx] ?? 0
          let g = sourceData[srcIdx + 1] ?? 0
          let b = sourceData[srcIdx + 2] ?? 0
          const a = sourceData[srcIdx + 3] ?? 0

          if (a < 10) continue

          r = clamp((r - 128) * contrast + 128 + brightness * 255, 0, 255)
          g = clamp((g - 128) * contrast + 128 + brightness * 255, 0, 255)
          b = clamp((b - 128) * contrast + 128 + brightness * 255, 0, 255)

          const luminance = getLuminance(r, g, b) / 255

          let ditherThreshold: number
          const matrixX = Math.floor(x / gridSize) % matrixSize
          const matrixY = Math.floor(y / gridSize) % matrixSize

          switch (ditherMode) {
            case "bayer":
              ditherThreshold = bayerMatrix[matrixY]![matrixX]! / matrixScale
              break
            case "halftone": {
              const angle = Math.PI / 4
              const scale = gridSize * 2
              const rotX = x * Math.cos(angle) + y * Math.sin(angle)
              const rotY = -x * Math.sin(angle) + y * Math.cos(angle)
              const pattern =
                (Math.sin(rotX / scale) + Math.sin(rotY / scale) + 2) / 4
              ditherThreshold = pattern
              break
            }
            case "noise": {
              const noiseVal =
                Math.sin(x * 12.9898 + y * 78.233 + time * 100) * 43758.5453
              ditherThreshold = noiseVal - Math.floor(noiseVal)
              break
            }
            case "crosshatch": {
              const line1 = (x + y) % (gridSize * 2) < gridSize ? 1 : 0
              const line2 =
                (x - y + gridSize * 4) % (gridSize * 2) < gridSize ? 1 : 0
              ditherThreshold = (line1 + line2) / 2
              break
            }
            default:
              ditherThreshold = bayerMatrix[matrixY]![matrixX]! / matrixScale
          }

          ditherThreshold = ditherThreshold * (1 - threshold) + threshold * 0.5

          let outputColor: RGB

          switch (colorMode) {
            case "grayscale": {
              const shouldBeDark = luminance < ditherThreshold
              outputColor = shouldBeDark ? [0, 0, 0] : [255, 255, 255]
              break
            }
            case "duotone": {
              const shouldBeDark = luminance < ditherThreshold
              outputColor = shouldBeDark
                ? parsedPrimaryColor
                : parsedSecondaryColor
              break
            }
            case "custom": {
              if (parsedCustomPalette.length === 2) {
                const shouldBeDark = luminance < ditherThreshold
                outputColor = shouldBeDark
                  ? parsedCustomPalette[0]!
                  : parsedCustomPalette[1]!
              } else {
                const adjustedLuminance =
                  luminance + (ditherThreshold - 0.5) * 0.5
                const paletteIndex = Math.floor(
                  clamp(adjustedLuminance, 0, 1) *
                    (parsedCustomPalette.length - 1),
                )
                outputColor = parsedCustomPalette[paletteIndex]!
              }
              break
            }
            case "original":
            default: {
              const ditherAmount = ditherThreshold - 0.5
              const adjustedR = clamp(r + ditherAmount * 64, 0, 255)
              const adjustedG = clamp(g + ditherAmount * 64, 0, 255)
              const adjustedB = clamp(b + ditherAmount * 64, 0, 255)

              const levels = 4
              outputColor = [
                Math.round(adjustedR / (255 / levels)) * (255 / levels),
                Math.round(adjustedG / (255 / levels)) * (255 / levels),
                Math.round(adjustedB / (255 / levels)) * (255 / levels),
              ]
              break
            }
          }

          if (invert) {
            outputColor = [
              255 - outputColor[0],
              255 - outputColor[1],
              255 - outputColor[2],
            ]
          }

          ctx.fillStyle = `rgb(${outputColor[0]}, ${outputColor[1]}, ${outputColor[2]})`
          ctx.fillRect(x, y, effectivePixelSize, effectivePixelSize)
        }
      }
    },
    [
      gridSize,
      ditherMode,
      colorMode,
      invert,
      pixelRatio,
      parsedPrimaryColor,
      parsedSecondaryColor,
      parsedCustomPalette,
      brightness,
      contrast,
      backgroundColor,
      threshold,
    ],
  )

  // ResizeObserver para acompanhar o container (displaySize) → state.dimensions.
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          dimensionsRef.current = { width, height }
          setDimensions({ width, height })
        }
      }
    })

    resizeObserver.observe(container)
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Carrega imagem + renderiza dither; reage a dimensões, props de cor/modo/animação.
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return

    let isCancelled = false

    const processImage = (img: HTMLImageElement) => {
      if (isCancelled) return

      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
      const displayWidth = dimensions.width
      const displayHeight = dimensions.height

      canvas.width = Math.floor(displayWidth * dpr)
      canvas.height = Math.floor(displayHeight * dpr)

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.resetTransform()
      ctx.scale(dpr, dpr)

      const offscreen = document.createElement("canvas")
      const iw = img.naturalWidth || displayWidth
      const ih = img.naturalHeight || displayHeight

      let dw = displayWidth
      let dh = displayHeight
      let dx = 0
      let dy = 0

      if (objectFit === "cover") {
        const scale = Math.max(displayWidth / iw, displayHeight / ih)
        dw = Math.ceil(iw * scale)
        dh = Math.ceil(ih * scale)
        dx = Math.floor((displayWidth - dw) / 2)
        dy = Math.floor((displayHeight - dh) / 2)
      } else if (objectFit === "contain") {
        const scale = Math.min(displayWidth / iw, displayHeight / ih)
        dw = Math.ceil(iw * scale)
        dh = Math.ceil(ih * scale)
        dx = Math.floor((displayWidth - dw) / 2)
        dy = Math.floor((displayHeight - dh) / 2)
      } else if (objectFit === "fill") {
        dw = displayWidth
        dh = displayHeight
      } else {
        dw = iw
        dh = ih
        dx = Math.floor((displayWidth - dw) / 2)
        dy = Math.floor((displayHeight - dh) / 2)
      }

      offscreen.width = displayWidth
      offscreen.height = displayHeight
      const offCtx = offscreen.getContext("2d")
      if (!offCtx) return

      offCtx.drawImage(img, dx, dy, dw, dh)

      try {
        imageDataRef.current = offCtx.getImageData(
          0,
          0,
          displayWidth,
          displayHeight,
        )
      } catch {
        // CORS ou imagem tainted — sem ImageData não há dither. Silencioso.
        return
      }

      applyDithering(ctx, displayWidth, displayHeight, 0)

      if (animated) {
        const animate = () => {
          if (isCancelled) return
          timeRef.current += animationSpeed
          applyDithering(ctx, displayWidth, displayHeight, timeRef.current)
          animationRef.current = requestAnimationFrame(animate)
        }
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (imageRef.current && imageRef.current.complete) {
      processImage(imageRef.current)
    } else {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = src

      img.onload = () => {
        if (isCancelled) return
        imageRef.current = img
        processImage(img)
      }
      // Falha de carregamento: canvas fica vazio (sem onerror ruidoso).
    }

    return () => {
      isCancelled = true
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [src, dimensions, objectFit, animated, animationSpeed, applyDithering])

  return (
    <div
      ref={containerRef}
      data-slot="dither-shader"
      className={cn("relative h-full w-full overflow-hidden", className)}
      {...hostProps}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: "pixelated" }}
        aria-label="Dithered image"
        role="img"
      />
    </div>
  )
}

export { DitherShader }
