import * as React from "react"

import { cn } from "@/lib/utils"
import type { SparklesCoreProps } from "@/components/ui/sparkles-types"

interface Particle {
  x: number
  y: number
  r: number
  /** Opacidade-base alvo do twinkle. */
  baseOpacity: number
  /** Fase do twinkle (rad). */
  phase: number
  /** Velocidade angular do twinkle. */
  twinkleSpeed: number
  /** Drift por frame. */
  dx: number
  dy: number
}

/**
 * SparklesCore — campo de partículas brancas animadas (twinkle + leve drift),
 * reimplementado em `<canvas>` puro + requestAnimationFrame.
 *
 * API de props compatível (drop-in) com o `SparklesCore` da Aceternity UI,
 * porém sem dependências de tsparticles.
 */
function SparklesCore({
  id,
  className,
  background = "transparent",
  particleSize,
  minSize = 0.4,
  maxSize = 1,
  speed = 1,
  particleColor = "#FFFFFF",
  particleDensity = 120,
}: SparklesCoreProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Props lidas pelo loop via refs auxiliares: evita reiniciar o rAF a cada
  // render quando o consumidor passa props inline.
  const propsRef = React.useRef({
    background,
    particleSize,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  })
  propsRef.current = {
    background,
    particleSize,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  }

  React.useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: Particle[] = []
    let width = 0
    let height = 0
    let rafId = 0

    const random = (min: number, max: number) => min + Math.random() * (max - min)

    const buildParticles = () => {
      const { minSize, maxSize, particleSize, particleDensity, speed } =
        propsRef.current
      // Escala a contagem pela área do canvas (referência: 800x400 px).
      const area = Math.max(width * height, 1)
      const count = Math.max(
        1,
        Math.round((particleDensity * area) / (800 * 400)),
      )
      const lo = Math.min(minSize, maxSize)
      const hi = Math.max(minSize, maxSize)
      particles = Array.from({ length: count }, () => {
        const r = particleSize ?? random(lo, hi)
        const drift = 0.05 * speed
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r,
          baseOpacity: random(0.2, 1),
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: random(0.005, 0.02) * speed,
          dx: random(-drift, drift),
          dy: random(-drift, drift),
        }
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = container.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildParticles()
    }

    const draw = () => {
      const { background, particleColor } = propsRef.current
      ctx.clearRect(0, 0, width, height)
      if (background && background !== "transparent") {
        ctx.fillStyle = background
        ctx.fillRect(0, 0, width, height)
      }
      ctx.fillStyle = particleColor
      for (const p of particles) {
        p.phase += p.twinkleSpeed
        const twinkle = 0.5 + 0.5 * Math.sin(p.phase)
        const opacity = Math.max(0, Math.min(1, p.baseOpacity * twinkle))

        p.x += p.dx
        p.y += p.dy
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      rafId = window.requestAnimationFrame(draw)
    }

    resize()
    rafId = window.requestAnimationFrame(draw)

    const observer = new ResizeObserver(() => resize())
    observer.observe(container)

    return () => {
      window.cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      data-slot="sparkles"
      className={cn("h-full w-full", className)}
      style={{ background }}
    >
      <canvas ref={canvasRef} id={id} className="block h-full w-full" />
    </div>
  )
}

export { SparklesCore }
