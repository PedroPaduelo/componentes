import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

export type HoverBorderGradientProps = {
  children?: React.ReactNode
  containerClassName?: string
  className?: string
  duration?: number
  clockwise?: boolean
  onClick?: React.MouseEventHandler
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  "aria-label"?: string
}

const DIRECTIONS: readonly Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]

const MOVING_MAP: Record<Direction, string> = {
  TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  BOTTOM:
    "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  RIGHT:
    "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
}

const HIGHLIGHT =
  "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)"

function HoverBorderGradient({
  children,
  containerClassName,
  className,
  duration = 1,
  clockwise = true,
  onClick,
  type,
  disabled,
  "aria-label": ariaLabel,
}: HoverBorderGradientProps) {
  const [hovered, setHovered] = React.useState<boolean>(false)
  const [direction, setDirection] = React.useState<Direction>("TOP")

  const rotateDirection = React.useCallback(
    (current: Direction): Direction => {
      const idx = DIRECTIONS.indexOf(current)
      const nextIdx = clockwise
        ? (idx - 1 + DIRECTIONS.length) % DIRECTIONS.length
        : (idx + 1) % DIRECTIONS.length
      return DIRECTIONS[nextIdx] as Direction
    },
    [clockwise],
  )

  React.useEffect(() => {
    if (hovered) return
    const interval = setInterval(() => {
      setDirection((prev) => rotateDirection(prev))
    }, duration * 1000)
    return () => clearInterval(interval)
  }, [hovered, duration, rotateDirection])

  return (
    <button
      data-slot="hover-border-gradient"
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-min w-fit items-center justify-center overflow-visible rounded-full border border-transparent bg-black/20 p-px decoration-clone transition duration-500 hover:bg-black/10 dark:bg-white/20 dark:hover:bg-white/10",
        containerClassName,
      )}
    >
      <div
        className={cn(
          "z-10 w-auto rounded-[inherit] bg-black px-4 py-2 text-white",
          className,
        )}
      >
        {children}
      </div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]"
        style={{ filter: "blur(2px)" }}
        initial={{ background: MOVING_MAP[direction] }}
        animate={{
          background: hovered
            ? [MOVING_MAP[direction], HIGHLIGHT]
            : MOVING_MAP[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2px] z-[1] flex-none rounded-[inherit] bg-black"
      />
    </button>
  )
}

export { HoverBorderGradient }
