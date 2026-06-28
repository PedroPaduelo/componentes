import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { SparklesCore } from "@/components/ui/sparkles"
import type {
  ContainerCoverBeamProps,
  ContainerCoverCircleProps,
  ContainerCoverProps,
} from "@/components/ui/container-cover-types"

/**
 * Container Cover (Aceternity UI "cover") — destaque animado para um trecho de
 * texto inline: ao passar o mouse, o fundo escurece, partículas (sparkles)
 * percorrem a área, beams horizontais varrem o bloco e o texto treme/encolhe.
 *
 * Reimplementação fiel do `Cover` da Aceternity, adaptada ao padrão do projeto
 * (named export, `data-slot`, `motion/react`, sem `"use client"`).
 */
function ContainerCover({ children, className }: ContainerCoverProps) {
  const [hovered, setHovered] = React.useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [beamPositions, setBeamPositions] = React.useState<number[]>([])

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    setContainerWidth(el.clientWidth)

    const height = el.clientHeight
    const numberOfBeams = Math.floor(height / 10)
    const positions = Array.from(
      { length: numberOfBeams },
      (_, i) => (i + 1) * (height / (numberOfBeams + 1)),
    )
    setBeamPositions(positions)
  }, [])

  return (
    <span
      data-slot="container-cover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className="group/cover relative inline-block rounded-sm bg-neutral-100 px-2 py-2 align-middle transition duration-200 hover:bg-neutral-900 dark:bg-neutral-900"
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.2 } }}
            className="pointer-events-none absolute inset-0 block h-full w-full overflow-hidden"
          >
            <motion.span
              animate={{ translateX: ["-50%", "0%"] }}
              transition={{
                translateX: {
                  duration: 10,
                  ease: "linear",
                  repeat: Infinity,
                },
              }}
              className="flex h-full w-[200%]"
            >
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={500}
                className="h-full w-full"
                particleColor="#FFFFFF"
              />
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={500}
                className="h-full w-full"
                particleColor="#FFFFFF"
              />
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>

      {beamPositions.map((position, index) => (
        <ContainerCoverBeam
          key={index}
          hovered={hovered}
          duration={Math.random() * 2 + 1}
          delay={Math.random() * 2 + 1}
          width={containerWidth}
          style={{ top: `${position}px` }}
        />
      ))}

      <motion.span
        key={String(hovered)}
        animate={{
          scale: hovered ? 0.8 : 1,
          x: hovered ? [0, -30, 30, -30, 30, 0] : 0,
          y: hovered ? [0, 30, -30, 30, -30, 0] : 0,
        }}
        exit={{ filter: "none", scale: 1, x: 0, y: 0 }}
        transition={{
          duration: 0.2,
          x: { duration: 0.2, repeat: Infinity, repeatType: "loop" },
          y: { duration: 0.2, repeat: Infinity, repeatType: "loop" },
          scale: { duration: 0.2 },
          filter: { duration: 0.2 },
        }}
        className={cn(
          "relative z-20 inline-block text-neutral-900 transition duration-200 group-hover/cover:text-white dark:text-white",
          className,
        )}
      >
        {children}
      </motion.span>

      <ContainerCoverCircle className="absolute -top-px -right-px" />
      <ContainerCoverCircle className="absolute -right-px -bottom-px" delay={0.4} />
      <ContainerCoverCircle className="absolute -top-px -left-px" delay={0.8} />
      <ContainerCoverCircle className="absolute -bottom-px -left-px" delay={1.6} />
    </span>
  )
}

function ContainerCoverBeam({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  style,
}: ContainerCoverBeamProps) {
  const id = React.useId()

  return (
    <motion.svg
      width={width}
      height="1"
      viewBox={`0 0 ${width} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute inset-x-0 w-full", className)}
      style={style}
    >
      <motion.path d={`M0 0.5H${width}`} stroke={`url(#svgGradient-${id})`} />

      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          key={String(hovered)}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: hovered ? "-10%" : "-5%", y1: 0, y2: 0 }}
          animate={{ x1: "110%", x2: hovered ? "100%" : "105%", y1: 0, y2: 0 }}
          transition={{
            duration: hovered ? 0.5 : (duration ?? 2),
            ease: "linear",
            repeat: Infinity,
            delay: hovered ? Math.random() * (1 - 0.2) + 0.2 : 0,
            repeatDelay: hovered ? Math.random() * (2 - 1) + 1 : (delay ?? 1),
          }}
        >
          <stop stopColor="#2EB9DF" stopOpacity="0" />
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  )
}

function ContainerCoverCircle({ className, delay }: ContainerCoverCircleProps) {
  return (
    <span
      aria-hidden="true"
      style={delay ? { animationDelay: `${delay}s` } : undefined}
      className={cn(
        "pointer-events-none block h-2 w-2 animate-pulse rounded-full bg-neutral-600 opacity-20 group-hover/cover:hidden dark:bg-white",
        className,
      )}
    />
  )
}

export { ContainerCover, ContainerCoverBeam, ContainerCoverCircle }
