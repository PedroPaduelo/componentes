import * as React from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"

/** Paleta determinística do badge do ponteiro (sem Math.random pra estabilidade de render). */
const POINTER_COLORS = [
  "#0ea5e9",
  "#737373",
  "#14b8a6",
  "#22c55e",
  "#3b82f6",
  "#ef4444",
  "#eab308",
] as const

export type FollowerPointerCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  /** Conteúdo sobre o qual o ponteiro customizado é exibido. */
  children: React.ReactNode
  /** Rótulo (ou nó) mostrado ao lado do ponteiro. */
  title?: string | React.ReactNode
  /** Índice da cor do badge na paleta (default: 0). */
  colorIndex?: number
}

export type FollowPointerProps = {
  x: MotionValue<number>
  y: MotionValue<number>
  title?: string | React.ReactNode
  colorIndex?: number
}

function FollowerPointerCard({
  children,
  className,
  title,
  colorIndex = 0,
  ...props
}: FollowerPointerCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const [isInside, setIsInside] = React.useState(false)

  React.useEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect())
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rect) {
      x.set(e.clientX - rect.left + window.scrollX)
      y.set(e.clientY - rect.top + window.scrollY)
    }
  }

  return (
    <div
      data-slot="following-pointer"
      onMouseLeave={() => setIsInside(false)}
      onMouseEnter={() => setIsInside(true)}
      onMouseMove={handleMouseMove}
      style={{ cursor: "none" }}
      ref={ref}
      className={cn("relative", className)}
      {...props}
    >
      <AnimatePresence>
        {isInside && (
          <FollowPointer x={x} y={y} title={title} colorIndex={colorIndex} />
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}

function FollowPointer({ x, y, title, colorIndex = 0 }: FollowPointerProps) {
  const color = POINTER_COLORS[colorIndex % POINTER_COLORS.length]

  return (
    <motion.div
      data-slot="following-pointer-cursor"
      className="absolute z-50 h-4 w-4 rounded-full"
      style={{ top: y, left: x, pointerEvents: "none" }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform stroke-sky-600 text-sky-500"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
      </svg>
      <motion.div
        style={{ backgroundColor: color }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="min-w-max rounded-full px-2 py-2 text-xs whitespace-nowrap text-white"
      >
        {title || "William Shakespeare"}
      </motion.div>
    </motion.div>
  )
}

export { FollowerPointerCard, FollowPointer }
