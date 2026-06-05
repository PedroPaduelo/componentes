import * as React from "react"
import { motion } from "motion/react"
import { createNoise3D } from "simplex-noise"

import { cn } from "@/lib/utils"
import type { VortexProps } from "./vortex-types"

function Vortex({
  children,
  className,
  containerClassName,
  particleCount = 700,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0.0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = "#000000",
}: VortexProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const animationFrameId = React.useRef<number | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particlePropCount = 9
    const particlePropsLength = particleCount * particlePropCount
    const baseTTL = 50
    const rangeTTL = 150
    const rangeHue = 100
    const noiseSteps = 3
    const xOff = 0.00125
    const yOff = 0.00125
    const zOff = 0.0005
    const TAU = 2 * Math.PI

    const noise3D = createNoise3D()
    let particleProps = new Float32Array(particlePropsLength)
    const center: [number, number] = [0, 0]
    let tick = 0

    const rand = (n: number): number => n * Math.random()
    const randRange = (n: number): number => n - rand(2 * n)
    const fadeInOut = (t: number, m: number): number => {
      const hm = 0.5 * m
      return Math.abs(((t + hm) % m) - hm) / hm
    }
    const lerp = (n1: number, n2: number, speed: number): number =>
      (1 - speed) * n1 + speed * n2

    const initParticle = (i: number): void => {
      const x = rand(canvas.width)
      const y = center[1] + randRange(rangeY)
      const vx = 0
      const vy = 0
      const life = 0
      const ttl = baseTTL + rand(rangeTTL)
      const speed = baseSpeed + rand(rangeSpeed)
      const radius = baseRadius + rand(rangeRadius)
      const hue = baseHue + rand(rangeHue)

      particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i)
    }

    const initParticles = (): void => {
      tick = 0
      particleProps = new Float32Array(particlePropsLength)
      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        initParticle(i)
      }
    }

    const checkBounds = (x: number, y: number): boolean =>
      x > canvas.width || x < 0 || y > canvas.height || y < 0

    const drawParticle = (
      x: number,
      y: number,
      x2: number,
      y2: number,
      life: number,
      ttl: number,
      radius: number,
      hue: number,
    ): void => {
      ctx.save()
      ctx.lineCap = "round"
      ctx.lineWidth = radius
      ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.closePath()
      ctx.restore()
    }

    const updateParticle = (i: number): void => {
      const i2 = 1 + i
      const i3 = 2 + i
      const i4 = 3 + i
      const i5 = 4 + i
      const i6 = 5 + i
      const i7 = 6 + i
      const i8 = 7 + i
      const i9 = 8 + i

      const x = particleProps[i]
      const y = particleProps[i2]
      const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU
      const vx = lerp(particleProps[i3], Math.cos(n), 0.5)
      const vy = lerp(particleProps[i4], Math.sin(n), 0.5)
      let life = particleProps[i5]
      const ttl = particleProps[i6]
      const speed = particleProps[i7]
      const x2 = x + vx * speed
      const y2 = y + vy * speed
      const radius = particleProps[i8]
      const hue = particleProps[i9]

      drawParticle(x, y, x2, y2, life, ttl, radius, hue)

      life++

      particleProps[i] = x2
      particleProps[i2] = y2
      particleProps[i3] = vx
      particleProps[i4] = vy
      particleProps[i5] = life

      if (checkBounds(x, y) || life > ttl) {
        initParticle(i)
      }
    }

    const drawParticles = (): void => {
      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        updateParticle(i)
      }
    }

    const renderGlow = (): void => {
      ctx.save()
      ctx.filter = "blur(8px) brightness(200%)"
      ctx.globalCompositeOperation = "lighter"
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()

      ctx.save()
      ctx.filter = "blur(4px) brightness(200%)"
      ctx.globalCompositeOperation = "lighter"
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()
    }

    const renderToScreen = (): void => {
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()
    }

    const draw = (): void => {
      tick++

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawParticles()
      renderGlow()
      renderToScreen()

      animationFrameId.current = window.requestAnimationFrame(draw)
    }

    const resize = (): void => {
      const { innerWidth, innerHeight } = window
      canvas.width = innerWidth
      canvas.height = innerHeight
      center[0] = 0.5 * canvas.width
      center[1] = 0.5 * canvas.height
    }

    const handleResize = (): void => {
      resize()
    }

    resize()
    initParticles()
    draw()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    }
  }, [
    particleCount,
    rangeY,
    baseHue,
    baseSpeed,
    rangeSpeed,
    baseRadius,
    rangeRadius,
    backgroundColor,
  ])

  return (
    <div
      data-slot="vortex"
      className={cn("relative h-full w-full", containerClassName)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
        className="absolute inset-0 z-0 flex h-full w-full items-center justify-center bg-transparent"
      >
        <canvas ref={canvasRef}></canvas>
      </motion.div>

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}

export { Vortex }
