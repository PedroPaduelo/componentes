import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"
import { cn } from "@/lib/utils"
import {
  type MagneticButtonProps,
  MAGNETIC_DEFAULT_STRENGTH,
  MAGNETIC_DEFAULT_MAX_DISTANCE,
  MAGNETIC_SPRING_CONFIG,
} from "./magnetic-button-types"

function MagneticButton({
  children,
  strength = MAGNETIC_DEFAULT_STRENGTH,
  maxDistance = MAGNETIC_DEFAULT_MAX_DISTANCE,
  className,
  ...hostProps
}: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, MAGNETIC_SPRING_CONFIG)
  const springY = useSpring(y, MAGNETIC_SPRING_CONFIG)
  const [hasMoved, setHasMoved] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = (e.clientX - cx) * strength
    let dy = (e.clientY - cy) * strength
    const distance = Math.hypot(dx, dy)
    if (distance > maxDistance) {
      const scale = maxDistance / distance
      dx *= scale
      dy *= scale
    }
    x.set(dx)
    y.set(dy)
    if (!hasMoved) setHasMoved(true)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setHasMoved(false)
  }

  return (
    <div
      data-slot="magnetic-button"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "cursor-pointer rounded-lg border border-dashed transition-colors duration-150",
        "[--show-color:var(--color-blue-500)]",
        className,
      )}
      style={{
        borderColor: hasMoved ? "var(--show-color)" : "transparent",
        backgroundColor: hasMoved
          ? "color-mix(in srgb, var(--show-color) 20%, transparent)"
          : "transparent",
      }}
      {...hostProps}
    >
      <motion.div style={{ x: springX, y: springY }}>
        {children}
      </motion.div>
    </div>
  )
}

export { MagneticButton }
