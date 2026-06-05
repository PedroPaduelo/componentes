import * as React from "react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                          simplex noise 3D (inline)                          */
/* -------------------------------------------------------------------------- */

/**
 * Implementação clássica de simplex noise 3D (Stefan Gustavson),
 * reimplementada inline e totalmente tipada para evitar a dependência
 * externa `simplex-noise`. Retorna um valor no intervalo aproximado
 * [-1, 1] para coordenadas (x, y, z).
 */
type Noise3D = (x: number, y: number, z: number) => number

const GRAD3: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
]

function createNoise3D(): Noise3D {
  // Tabela de permutação base (0..255 embaralhados — clássica de Perlin/Gustavson).
  const permutation: number[] = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
    234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
    134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
    116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
    124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
    47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
    154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
    108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
    242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
    239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
    141, 128, 195, 78, 66, 215, 61, 156, 180,
  ]

  // Duplicar para 512 entradas evita o módulo dentro do loop crítico.
  const perm = new Uint8Array(512)
  const permMod12 = new Uint8Array(512)
  for (let i = 0; i < 512; i += 1) {
    const value = permutation[i & 255]
    perm[i] = value
    permMod12[i] = value % 12
  }

  const F3 = 1 / 3
  const G3 = 1 / 6

  const dot = (g: readonly [number, number, number], x: number, y: number, z: number): number =>
    g[0] * x + g[1] * y + g[2] * z

  return (xin: number, yin: number, zin: number): number => {
    // Skew para a célula simplex.
    const s = (xin + yin + zin) * F3
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const k = Math.floor(zin + s)
    const t = (i + j + k) * G3
    const x0 = xin - (i - t)
    const y0 = yin - (j - t)
    const z0 = zin - (k - t)

    let i1: number
    let j1: number
    let k1: number
    let i2: number
    let j2: number
    let k2: number

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1
        j1 = 0
        k1 = 0
        i2 = 1
        j2 = 1
        k2 = 0
      } else if (x0 >= z0) {
        i1 = 1
        j1 = 0
        k1 = 0
        i2 = 1
        j2 = 0
        k2 = 1
      } else {
        i1 = 0
        j1 = 0
        k1 = 1
        i2 = 1
        j2 = 0
        k2 = 1
      }
    } else {
      if (y0 < z0) {
        i1 = 0
        j1 = 0
        k1 = 1
        i2 = 0
        j2 = 1
        k2 = 1
      } else if (x0 < z0) {
        i1 = 0
        j1 = 1
        k1 = 0
        i2 = 0
        j2 = 1
        k2 = 1
      } else {
        i1 = 0
        j1 = 1
        k1 = 0
        i2 = 1
        j2 = 1
        k2 = 0
      }
    }

    const x1 = x0 - i1 + G3
    const y1 = y0 - j1 + G3
    const z1 = z0 - k1 + G3
    const x2 = x0 - i2 + 2 * G3
    const y2 = y0 - j2 + 2 * G3
    const z2 = z0 - k2 + 2 * G3
    const x3 = x0 - 1 + 3 * G3
    const y3 = y0 - 1 + 3 * G3
    const z3 = z0 - 1 + 3 * G3

    const ii = i & 255
    const jj = j & 255
    const kk = k & 255

    const gi0 = permMod12[ii + perm[jj + perm[kk]]]
    const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]]
    const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]]
    const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]]

    let n0 = 0
    let n1 = 0
    let n2 = 0
    let n3 = 0

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
    if (t0 >= 0) {
      t0 *= t0
      n0 = t0 * t0 * dot(GRAD3[gi0], x0, y0, z0)
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
    if (t1 >= 0) {
      t1 *= t1
      n1 = t1 * t1 * dot(GRAD3[gi1], x1, y1, z1)
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
    if (t2 >= 0) {
      t2 *= t2
      n2 = t2 * t2 * dot(GRAD3[gi2], x2, y2, z2)
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
    if (t3 >= 0) {
      t3 *= t3
      n3 = t3 * t3 * dot(GRAD3[gi3], x3, y3, z3)
    }

    return 32 * (n0 + n1 + n2 + n3)
  }
}

/* -------------------------------------------------------------------------- */
/*                               WavyBackground                               */
/* -------------------------------------------------------------------------- */

const DEFAULT_COLORS = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]

export interface WavyBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Conteúdo renderizado por cima das ondas. */
  children?: React.ReactNode
  /** Classe do container interno que envolve os children. */
  className?: string
  /** Classe do container externo (raiz). */
  containerClassName?: string
  /** Cores das ondas (ciclo). */
  colors?: string[]
  /** Largura do traço de cada onda (lineWidth do canvas). */
  waveWidth?: number
  /** Cor de preenchimento do fundo a cada frame. */
  backgroundFill?: string
  /** Intensidade do blur (px) aplicado ao canvas. */
  blur?: number
  /** Velocidade da animação. */
  speed?: "slow" | "fast"
  /** Opacidade global das ondas. */
  waveOpacity?: number
}

function WavyBackground({
  children,
  className,
  containerClassName,
  colors,
  waveWidth = 50,
  backgroundFill = "black",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: WavyBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  // Refs auxiliares: o loop de animação lê props mutáveis sem recriar o efeito.
  const colorsRef = React.useRef<string[]>(colors ?? DEFAULT_COLORS)
  const waveWidthRef = React.useRef<number>(waveWidth)
  const backgroundFillRef = React.useRef<string>(backgroundFill)
  const speedRef = React.useRef<"slow" | "fast">(speed)
  const waveOpacityRef = React.useRef<number>(waveOpacity)

  colorsRef.current = colors ?? DEFAULT_COLORS
  waveWidthRef.current = waveWidth
  backgroundFillRef.current = backgroundFill
  speedRef.current = speed
  waveOpacityRef.current = waveOpacity

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const noise = createNoise3D()
    let nt = 0
    let animationId = 0

    const getSpeed = (): number => (speedRef.current === "fast" ? 0.002 : 0.001)

    const resize = (): void => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      canvas.width = width
      canvas.height = height
      ctx.filter = `blur(${blur}px)`
    }

    const drawWave = (waveCount: number): void => {
      nt += getSpeed()
      const width = canvas.width
      const height = canvas.height
      const palette = colorsRef.current
      for (let i = 0; i < waveCount; i += 1) {
        ctx.beginPath()
        ctx.lineWidth = waveWidthRef.current
        ctx.strokeStyle = palette[i % palette.length]
        for (let x = 0; x < width; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100
          ctx.lineTo(x, y + height * 0.5)
        }
        ctx.stroke()
        ctx.closePath()
      }
    }

    const render = (): void => {
      ctx.globalAlpha = 1
      ctx.fillStyle = backgroundFillRef.current
      ctx.globalAlpha = waveOpacityRef.current
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawWave(5)
      animationId = requestAnimationFrame(render)
    }

    resize()
    render()

    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [blur])

  return (
    <div
      data-slot="wavy-background"
      className={cn(
        "relative flex h-screen flex-col items-center justify-center overflow-hidden",
        containerClassName,
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full"
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}

export { WavyBackground }
