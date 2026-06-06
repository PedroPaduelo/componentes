import * as React from "react"

import { cn } from "@/lib/utils"

interface ShootingStar {
  id: number
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  distance: number
}

export interface ShootingStarsProps {
  minSpeed?: number
  maxSpeed?: number
  minDelay?: number
  maxDelay?: number
  starColor?: string
  trailColor?: string
  starWidth?: number
  starHeight?: number
  className?: string
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4)
  const offset = Math.random() * window.innerWidth

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 }
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 }
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 }
    case 3:
      return { x: 0, y: offset, angle: 315 }
    default:
      return { x: 0, y: 0, angle: 45 }
  }
}

function ShootingStars({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}: ShootingStarsProps) {
  const [star, setStar] = React.useState<ShootingStar | null>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint()
      const newStar: ShootingStar = {
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      }
      setStar(newStar)

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay
      timeoutId = setTimeout(createStar, randomDelay)
    }

    createStar()

    return () => clearTimeout(timeoutId)
  }, [minSpeed, maxSpeed, minDelay, maxDelay])

  React.useEffect(() => {
    let animationFrameId: number

    const moveStar = () => {
      setStar((prevStar) => {
        if (!prevStar) return null

        const newX =
          prevStar.x + prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180)
        const newY =
          prevStar.y + prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180)
        const newDistance = prevStar.distance + prevStar.speed
        const newScale = 1 + newDistance / 100

        if (
          newX < -20 ||
          newX > window.innerWidth + 20 ||
          newY < -20 ||
          newY > window.innerHeight + 20
        ) {
          return null
        }

        return {
          ...prevStar,
          x: newX,
          y: newY,
          distance: newDistance,
          scale: newScale,
        }
      })
      animationFrameId = requestAnimationFrame(moveStar)
    }

    animationFrameId = requestAnimationFrame(moveStar)

    return () => cancelAnimationFrame(animationFrameId)
  }, [star])

  return (
    <svg
      ref={svgRef}
      data-slot="shooting-stars"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill="url(#shooting-star-gradient)"
          transform={`rotate(${star.angle}, ${
            star.x + (starWidth * star.scale) / 2
          }, ${star.y + starHeight / 2})`}
        />
      )}
      <defs>
        <linearGradient id="shooting-star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={trailColor} stopOpacity={0} />
          <stop offset="100%" stopColor={starColor} stopOpacity={1} />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface StarProps {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number | null
}

export interface StarsBackgroundProps {
  starDensity?: number
  allStarsTwinkle?: boolean
  twinkleProbability?: number
  minTwinkleSpeed?: number
  maxTwinkleSpeed?: number
  className?: string
}

function StarsBackground({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}: StarsBackgroundProps) {
  const [stars, setStars] = React.useState<StarProps[]>([])
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const generateStars = React.useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * height
      const numStars = Math.floor(area * starDensity)
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.05 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        }
      })
    },
    [
      starDensity,
      allStarsTwinkle,
      twinkleProbability,
      minTwinkleSpeed,
      maxTwinkleSpeed,
    ]
  )

  React.useEffect(() => {
    const updateStars = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
      setStars(generateStars(width, height))
    }

    updateStars()

    const resizeObserver = new ResizeObserver(updateStars)
    const canvas = canvasRef.current
    if (canvas) {
      resizeObserver.observe(canvas)
    }

    return () => {
      if (canvas) {
        resizeObserver.unobserve(canvas)
      }
      resizeObserver.disconnect()
    }
  }, [generateStars])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 +
            Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5)
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => cancelAnimationFrame(animationFrameId)
  }, [stars])

  return (
    <canvas
      ref={canvasRef}
      data-slot="stars-background"
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  )
}

export { ShootingStars, StarsBackground }
