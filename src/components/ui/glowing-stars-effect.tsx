import * as React from "react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"

const TOTAL_STARS = 108
const COLUMNS = 18

interface GlowingStarsBackgroundCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children?: React.ReactNode
}

function GlowingStarsBackgroundCard({
  className,
  children,
  ...props
}: GlowingStarsBackgroundCardProps) {
  const [mouseEnter, setMouseEnter] = React.useState(false)

  return (
    <div
      data-slot="glowing-stars-effect"
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
      className={cn(
        "h-full max-h-[20rem] w-full max-w-md rounded-xl border border-border bg-background p-4 dark:bg-[linear-gradient(110deg,#333_0.6%,#1a1a1a)]",
        className,
      )}
      {...props}
    >
      <div className="flex h-full items-center justify-center">
        <Illustration mouseEnter={mouseEnter} />
      </div>
      <div className="px-2 pb-6">{children}</div>
    </div>
  )
}

interface GlowingStarsDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

function GlowingStarsDescription({
  className,
  children,
  ...props
}: GlowingStarsDescriptionProps) {
  return (
    <p
      data-slot="glowing-stars-description"
      className={cn("max-w-[16rem] text-base text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

interface GlowingStarsTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

function GlowingStarsTitle({
  className,
  children,
  ...props
}: GlowingStarsTitleProps) {
  return (
    <h2
      data-slot="glowing-stars-title"
      className={cn("text-2xl font-bold text-foreground", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

interface IllustrationProps {
  mouseEnter: boolean
}

function Illustration({ mouseEnter }: IllustrationProps) {
  const [glowingStars, setGlowingStars] = React.useState<number[]>([])
  const highlightedStars = React.useRef<number[]>([])

  React.useEffect(() => {
    const interval = setInterval(() => {
      highlightedStars.current = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * TOTAL_STARS),
      )
      setGlowingStars([...highlightedStars.current])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="h-48 w-full p-1"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
        gap: "1px",
      }}
    >
      {Array.from({ length: TOTAL_STARS }).map((_, starIdx) => {
        const isGlowing = glowingStars.includes(starIdx)
        const delay = (starIdx % 10) * 0.1
        const staticDelay = starIdx * 0.01
        return (
          <div
            key={`matrix-col-${starIdx}`}
            className="relative flex items-center justify-center"
          >
            <Star
              isGlowing={mouseEnter ? true : isGlowing}
              delay={mouseEnter ? staticDelay : delay}
            />
            {mouseEnter && <Glow delay={staticDelay} />}
            <AnimatePresence mode="wait">
              {isGlowing && <Glow delay={delay} />}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

interface StarProps {
  isGlowing: boolean
  delay: number
}

function Star({ isGlowing, delay }: StarProps) {
  return (
    <motion.div
      key="star"
      initial={{ scale: 1 }}
      animate={{
        scale: isGlowing ? [1, 1.2, 2.5, 2.2, 1.5] : 1,
        background: isGlowing ? "#fff" : "#666",
      }}
      transition={{ duration: 2, ease: "easeInOut", delay }}
      className="z-20 h-[1px] w-[1px] rounded-full bg-[#666]"
    />
  )
}

interface GlowProps {
  delay: number
}

function Glow({ delay }: GlowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeInOut", delay }}
      className="absolute left-1/2 z-10 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-blue-500 shadow-2xl shadow-blue-400 blur-[1px]"
    />
  )
}

export {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle,
}
export type {
  GlowingStarsBackgroundCardProps,
  GlowingStarsDescriptionProps,
  GlowingStarsTitleProps,
}
