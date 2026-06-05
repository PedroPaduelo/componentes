/**
 * Background Beams With Collision (Aceternity UI), adaptado ao padrão da vitrine.
 *
 * Feixes verticais (beams) caem do topo e "explodem" em partículas ao colidir
 * com a linha/chão na base. Adaptações de zero-dívida sobre o source oficial:
 *  - sem "use client"; import de "motion/react"; named export sem default.
 *  - `data-slot="background-beams-with-collision"` no elemento raiz.
 *  - refs tipadas para React 19 (`RefObject<HTMLDivElement | null>`).
 *  - variants/transition tipados (Variants / Transition) — sem `any`.
 *  - cleanup de setInterval/setTimeout no unmount.
 *  - fundo adapta ao tema (light/dark) via classes Tailwind.
 */

import * as React from "react"
import {
  motion,
  AnimatePresence,
  type Variants,
  type Transition,
} from "motion/react"
import { cn } from "@/lib/utils"

type BeamOptions = {
  initialX?: number
  translateX?: number
  initialY?: number | string
  translateY?: number | string
  rotate?: number
  className?: string
  duration?: number
  delay?: number
  repeatDelay?: number
}

export type BackgroundBeamsWithCollisionProps = {
  children: React.ReactNode
  className?: string
}

const BEAMS: BeamOptions[] = [
  { initialX: 10, translateX: 10, duration: 7, repeatDelay: 3, delay: 2 },
  { initialX: 600, translateX: 600, duration: 3, repeatDelay: 3, delay: 4 },
  { initialX: 100, translateX: 100, duration: 7, repeatDelay: 7, className: "h-6" },
  { initialX: 400, translateX: 400, duration: 5, repeatDelay: 14, delay: 4 },
  { initialX: 800, translateX: 800, duration: 11, repeatDelay: 2, className: "h-20" },
  { initialX: 1000, translateX: 1000, duration: 4, repeatDelay: 2, className: "h-12" },
  { initialX: 1200, translateX: 1200, duration: 6, repeatDelay: 4, delay: 2, className: "h-6" },
]

function BackgroundBeamsWithCollision({
  children,
  className,
}: BackgroundBeamsWithCollisionProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const parentRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={parentRef}
      data-slot="background-beams-with-collision"
      className={cn(
        "relative flex h-96 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-white to-neutral-100 md:h-[40rem] dark:from-neutral-950 dark:to-neutral-800",
        className
      )}
    >
      {BEAMS.map((beam, idx) => (
        <CollisionMechanism
          key={`${beam.initialX}-beam-${idx}`}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {children}
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full bg-neutral-100 dark:bg-neutral-800"
        style={{
          boxShadow:
            "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset",
        }}
      />
    </div>
  )
}

type Collision = {
  detected: boolean
  coordinates: { x: number; y: number } | null
}

type CollisionMechanismProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  parentRef: React.RefObject<HTMLDivElement | null>
  beamOptions?: BeamOptions
}

function CollisionMechanism({
  parentRef,
  containerRef,
  beamOptions = {},
}: CollisionMechanismProps) {
  const beamRef = React.useRef<HTMLDivElement>(null)
  const [collision, setCollision] = React.useState<Collision>({
    detected: false,
    coordinates: null,
  })
  const [beamKey, setBeamKey] = React.useState(0)
  const [cycleCollisionDetected, setCycleCollisionDetected] =
    React.useState(false)

  React.useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !cycleCollisionDetected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        const parentRect = parentRef.current.getBoundingClientRect()

        if (beamRect.bottom >= containerRect.top) {
          const relativeX = beamRect.left - parentRect.left + beamRect.width / 2
          const relativeY = beamRect.bottom - parentRect.top

          setCollision({
            detected: true,
            coordinates: { x: relativeX, y: relativeY },
          })
          setCycleCollisionDetected(true)
        }
      }
    }

    const animationInterval = setInterval(checkCollision, 50)
    return () => clearInterval(animationInterval)
  }, [cycleCollisionDetected, containerRef, parentRef])

  React.useEffect(() => {
    if (!collision.detected || !collision.coordinates) return

    const resetTimeout = setTimeout(() => {
      setCollision({ detected: false, coordinates: null })
      setCycleCollisionDetected(false)
    }, 2000)

    const keyTimeout = setTimeout(() => {
      setBeamKey((prevKey) => prevKey + 1)
    }, 2000)

    return () => {
      clearTimeout(resetTimeout)
      clearTimeout(keyTimeout)
    }
  }, [collision])

  const beamInitial: Variants["initial"] = {
    translateY: beamOptions.initialY ?? "-200px",
    translateX: beamOptions.initialX ?? "0px",
    rotate: beamOptions.rotate ?? 0,
  }

  const beamVariants: Variants = {
    animate: {
      translateY: beamOptions.translateY ?? "1800px",
      translateX: beamOptions.translateX ?? "0px",
      rotate: beamOptions.rotate ?? 0,
    },
  }

  const beamTransition: Transition = {
    duration: beamOptions.duration ?? 8,
    repeat: Infinity,
    repeatType: "loop",
    ease: "linear",
    delay: beamOptions.delay ?? 0,
    repeatDelay: beamOptions.repeatDelay ?? 0,
  }

  return (
    <>
      <motion.div
        key={beamKey}
        ref={beamRef}
        animate="animate"
        initial={beamInitial}
        variants={beamVariants}
        transition={beamTransition}
        className={cn(
          "absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent",
          beamOptions.className
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function Explosion({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }))

  return (
    <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
      />
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{ x: span.directionX, y: span.directionY, opacity: 0 }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"
        />
      ))}
    </div>
  )
}

export { BackgroundBeamsWithCollision }
