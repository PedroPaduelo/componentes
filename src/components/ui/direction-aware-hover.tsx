import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type DirectionAwareHoverProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "children"
  | "onMouseEnter"
  | "onDrag"
  | "onDragEnd"
  | "onDragStart"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
> & {
  /** URL da imagem exibida no card (decorativa — `alt=""`). */
  imageUrl: string
  /** Conteúdo sobreposto no canto inferior esquerdo (ex.: nome + handle). */
  children: React.ReactNode
  /** Classes adicionais aplicadas ao wrapper do conteúdo sobreposto. */
  childrenClassName?: string
  /** Classes adicionais aplicadas à tag `<img>`. */
  imageClassName?: string
}

type HoverDirection = "top" | "right" | "bottom" | "left"

function DirectionAwareHover({
  imageUrl,
  children,
  childrenClassName,
  imageClassName,
  className,
  ...props
}: DirectionAwareHoverProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [direction, setDirection] = React.useState<HoverDirection>("left")

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    setDirection(getDirection(event, ref.current))
  }

  return (
    <motion.div
      ref={ref}
      data-slot="direction-aware-hover"
      onMouseEnter={handleMouseEnter}
      className={cn(
        "relative h-60 w-60 overflow-hidden rounded-lg bg-transparent md:h-96 md:w-96 group/card",
        className
      )}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.div
          className="relative h-full w-full"
          initial="initial"
          whileHover={direction}
          exit="exit"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 hidden bg-black/40 transition duration-500 group-hover/card:block"
          />
          <motion.div
            variants={imageVariants}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative h-full w-full bg-gray-50 dark:bg-black"
          >
            <img
              alt=""
              className={cn(
                "h-full w-full object-cover scale-[1.15]",
                imageClassName
              )}
              width={1000}
              height={1000}
              src={imageUrl}
            />
          </motion.div>
          <motion.div
            variants={textVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "absolute bottom-4 left-4 z-40 text-white",
              childrenClassName
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function getDirection(
  ev: React.MouseEvent<HTMLDivElement>,
  obj: HTMLElement
): HoverDirection {
  const { width: w, height: h, left, top } = obj.getBoundingClientRect()
  const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1)
  const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1)
  const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4
  return d === 0 ? "top" : d === 1 ? "right" : d === 2 ? "bottom" : "left"
}

const imageVariants = {
  initial: { x: 0, y: 0 },
  exit: { x: 0, y: 0 },
  top: { y: 20 },
  bottom: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
} as const

const textVariants = {
  initial: { x: 0, y: 0, opacity: 0 },
  exit: { x: 0, y: 0, opacity: 0 },
  top: { y: -20, opacity: 1 },
  bottom: { y: 2, opacity: 1 },
  left: { x: -2, opacity: 1 },
  right: { x: 20, opacity: 1 },
} as const

export { DirectionAwareHover }
