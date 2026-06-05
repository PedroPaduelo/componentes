import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"
import type { DottedGlowBackgroundProps } from "@/components/ui/dotted-glow-background-types"

/**
 * Fundo de pontos baseado em canvas (Aceternity UI) que brilha e esmaece de
 * forma orgânica.
 * - Usa uma grade estável de pontos.
 * - Cada ponto tem fase + velocidade próprias, produzindo um shimmer orgânico.
 * - Suporta alta densidade (devicePixelRatio) e redimensiona via ResizeObserver.
 * - Tema reativo: lê CSS variables (ex.: "--color-neutral-500") conforme o
 *   tema resolvido pelo provider caseiro (useTheme().resolvedTheme).
 */
function DottedGlowBackground({
  className,
  gap = 12,
  radius = 2,
  color = "rgba(0,0,0,0.7)",
  darkColor,
  glowColor = "rgba(0, 170, 255, 0.85)",
  darkGlowColor,
  colorLightVar,
  colorDarkVar,
  glowColorLightVar,
  glowColorDarkVar,
  opacity = 0.6,
  backgroundOpacity = 0,
  speedMin = 0.4,
  speedMax = 1.3,
  speedScale = 1,
}: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme } = useTheme()

  const [resolvedColor, setResolvedColor] = useState<string>(color)
  const [resolvedGlowColor, setResolvedGlowColor] = useState<string>(glowColor)

  // Resolve o valor de uma CSS variable a partir do container ou do root.
  useEffect(() => {
    const container = containerRef.current ?? document.documentElement

    const resolveCssVariable = (variableName?: string): string | null => {
      if (!variableName) return null
      const normalized = variableName.startsWith("--")
        ? variableName
        : `--${variableName}`
      const fromEl = getComputedStyle(container)
        .getPropertyValue(normalized)
        .trim()
      if (fromEl) return fromEl
      const fromRoot = getComputedStyle(document.documentElement)
        .getPropertyValue(normalized)
        .trim()
      return fromRoot || null
    }

    const isDark = resolvedTheme === "dark"
    let nextColor: string = color
    let nextGlow: string = glowColor

    if (isDark) {
      const varDot = resolveCssVariable(colorDarkVar)
      const varGlow = resolveCssVariable(glowColorDarkVar)
      nextColor = varDot || darkColor || nextColor
      nextGlow = varGlow || darkGlowColor || nextGlow
    } else {
      const varDot = resolveCssVariable(colorLightVar)
      const varGlow = resolveCssVariable(glowColorLightVar)
      nextColor = varDot || nextColor
      nextGlow = varGlow || nextGlow
    }

    setResolvedColor(nextColor)
    setResolvedGlowColor(nextGlow)
  }, [
    resolvedTheme,
    color,
    darkColor,
    glowColor,
    darkGlowColor,
    colorLightVar,
    colorDarkVar,
    glowColorLightVar,
    glowColorDarkVar,
  ])

  // Refs auxiliares: o loop de rAF lê estes valores sem reiniciar a cada render.
  const colorRef = useRef(resolvedColor)
  const glowColorRef = useRef(resolvedGlowColor)
  const opacityRef = useRef(opacity)
  const backgroundOpacityRef = useRef(backgroundOpacity)
  const radiusRef = useRef(radius)
  const speedScaleRef = useRef(speedScale)

  useEffect(() => {
    colorRef.current = resolvedColor
  }, [resolvedColor])
  useEffect(() => {
    glowColorRef.current = resolvedGlowColor
  }, [resolvedGlowColor])
  useEffect(() => {
    opacityRef.current = opacity
  }, [opacity])
  useEffect(() => {
    backgroundOpacityRef.current = backgroundOpacity
  }, [backgroundOpacity])
  useEffect(() => {
    radiusRef.current = radius
  }, [radius])
  useEffect(() => {
    speedScaleRef.current = speedScale
  }, [speedScale])

  useEffect(() => {
    const el = canvasRef.current
    const container = containerRef.current
    if (!el || !container) return

    const ctx = el.getContext("2d")
    if (!ctx) return

    let raf = 0
    let stopped = false
    let isVisible = true

    const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      el.width = Math.max(1, Math.floor(width * dpr))
      el.height = Math.max(1, Math.floor(height * dpr))
      el.style.width = `${Math.floor(width)}px`
      el.style.height = `${Math.floor(height)}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ro = new ResizeObserver(() => {
      resize()
      regenDots()
    })
    ro.observe(container)
    resize()

    // Metadados dos pontos: regerados a cada resize.
    let dots: { x: number; y: number; phase: number; speed: number }[] = []

    function regenDots() {
      if (!container) return
      dots = []
      const { width, height } = container.getBoundingClientRect()
      const cols = Math.ceil(width / gap) + 2
      const rows = Math.ceil(height / gap) + 2
      const min = Math.min(speedMin, speedMax)
      const max = Math.max(speedMin, speedMax)
      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          const x = i * gap + (j % 2 === 0 ? 0 : gap * 0.5)
          const y = j * gap
          const phase = Math.random() * Math.PI * 2
          const span = Math.max(max - min, 0)
          const speed = min + Math.random() * span
          dots.push({ x, y, phase, speed })
        }
      }
    }

    regenDots()

    const draw = (now: number) => {
      if (stopped) return
      if (!isVisible || !container) {
        raf = requestAnimationFrame(draw)
        return
      }
      const { width, height } = container.getBoundingClientRect()
      const currentOpacity = opacityRef.current
      const currentBgOpacity = backgroundOpacityRef.current
      const currentRadius = radiusRef.current

      ctx.clearRect(0, 0, el.width, el.height)
      ctx.globalAlpha = currentOpacity

      // Fade radial opcional no fundo (default 0 = transparente).
      if (currentBgOpacity > 0) {
        const grad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.4,
          Math.min(width, height) * 0.1,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.7,
        )
        grad.addColorStop(0, "rgba(0,0,0,0)")
        grad.addColorStop(
          1,
          `rgba(0,0,0,${Math.min(Math.max(currentBgOpacity, 0), 1)})`,
        )
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.fillStyle = colorRef.current

      const time = (now / 1000) * Math.max(speedScaleRef.current, 0)
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        // Onda triangular linear 0..1..0 para glow/dim suave.
        const mod = (time * d.speed + d.phase) % 2
        const lin = mod < 1 ? mod : 2 - mod
        const a = 0.25 + 0.55 * lin

        if (a > 0.6) {
          const glow = (a - 0.6) / 0.4
          ctx.shadowColor = glowColorRef.current
          ctx.shadowBlur = 6 * glow
        } else {
          ctx.shadowColor = "transparent"
          ctx.shadowBlur = 0
        }

        ctx.globalAlpha = a * currentOpacity
        ctx.beginPath()
        ctx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      raf = requestAnimationFrame(draw)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0.1 },
    )
    observer.observe(container)

    raf = requestAnimationFrame(draw)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      ro.disconnect()
    }
  }, [gap, speedMin, speedMax])

  return (
    <div
      ref={containerRef}
      data-slot="dotted-glow-background"
      className={cn("absolute inset-0", className)}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  )
}

export { DottedGlowBackground }
