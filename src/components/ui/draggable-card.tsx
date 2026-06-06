import * as React from "react"
import { useRef, useState, useEffect } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationControls,
  animate,
} from "motion/react"

import { cn } from "@/lib/utils"
import type {
  DraggableCardBodyProps,
  DraggableCardContainerProps,
} from "@/components/ui/draggable-card-types"

/**
 * Draggable Card (Aceternity UI) — reimplementação padronizada shadcn.
 *
 * DraggableCardContainer aplica perspective:3000px; cada DraggableCardBody é
 * um motion.div arrastável (dragConstraints = viewport) com física de mola
 * (useVelocity + useSpring) e rotação 3D seguindo o cursor. Ao soltar, o
 * gesto de arrastar ganha um spring com bounce proporcional à velocidade.
 *
 * data-slot:
 *  - draggable-card-container → wrapper com perspective
 *  - draggable-card-body      → card arrastável (motion.div)
 */

function DraggableCardContainer({
  className,
  children,
  ...rest
}: DraggableCardContainerProps) {
  return (
    <div
      data-slot="draggable-card-container"
      className={cn("[perspective:3000px] relative", className)}
      {...rest}
    >
      {children}
    </div>
  )
}

function DraggableCardBody({
  className,
  children,
  ...rest
}: DraggableCardBodyProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()
  const [constraints, setConstraints] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  })

  // physics biatch
  const velocityX = useVelocity(mouseX)
  const velocityY = useVelocity(mouseY)

  const springConfig = {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  }

  const rotateX = useSpring(
    useTransform(mouseY, [-300, 300], [25, -25]),
    springConfig,
  )
  const rotateY = useSpring(
    useTransform(mouseX, [-300, 300], [-25, 25]),
    springConfig,
  )

  const opacity = useSpring(
    useTransform(mouseX, [-300, 0, 300], [0.8, 1, 0.8]),
    springConfig,
  )

  const glareOpacity = useSpring(
    useTransform(mouseX, [-300, 0, 300], [0.2, 0, 0.2]),
    springConfig,
  )

  useEffect(() => {
    // Atualiza as constraints na montagem e em redimensionamento da janela
    const updateConstraints = () => {
      if (typeof window === "undefined") return
      setConstraints({
        top: -window.innerHeight / 2,
        left: -window.innerWidth / 2,
        right: window.innerWidth / 2,
        bottom: window.innerHeight / 2,
      })
    }

    updateConstraints()
    window.addEventListener("resize", updateConstraints)
    return () => {
      window.removeEventListener("resize", updateConstraints)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e
    const rect = cardRef.current?.getBoundingClientRect()
    const width = rect?.width ?? 0
    const height = rect?.height ?? 0
    const left = rect?.left ?? 0
    const top = rect?.top ?? 0
    const centerX = left + width / 2
    const centerY = top + height / 2
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    mouseX.set(deltaX)
    mouseY.set(deltaY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      data-slot="draggable-card-body"
      drag
      dragConstraints={constraints}
      onDragStart={() => {
        document.body.style.cursor = "grabbing"
      }}
      onDragEnd={(_event, info) => {
        document.body.style.cursor = "default"

        controls.start({
          rotateX: 0,
          rotateY: 0,
          transition: {
            type: "spring",
            ...springConfig,
          },
        })

        const currentVelocityX = velocityX.get()
        const currentVelocityY = velocityY.get()

        const velocityMagnitude = Math.sqrt(
          currentVelocityX * currentVelocityX +
            currentVelocityY * currentVelocityY,
        )
        const bounce = Math.min(0.8, velocityMagnitude / 1000)

        animate(info.point.x, info.point.x + currentVelocityX * 0.3, {
          duration: 0.8,
          ease: [0.2, 0, 0, 1],
          bounce,
          type: "spring",
          stiffness: 50,
          damping: 15,
          mass: 0.8,
        })

        animate(info.point.y, info.point.y + currentVelocityY * 0.3, {
          duration: 0.8,
          ease: [0.2, 0, 0, 1],
          bounce,
          type: "spring",
          stiffness: 50,
          damping: 15,
          mass: 0.8,
        })
      }}
      style={{
        rotateX,
        rotateY,
        opacity,
        willChange: "transform",
      }}
      animate={controls}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative min-h-96 w-80 overflow-hidden rounded-md bg-neutral-100 p-6 shadow-2xl transform-3d dark:bg-neutral-900 cursor-grab active:cursor-grabbing select-none",
        className,
      )}
      {...rest}
    >
      {children}
      <motion.div
        style={{
          opacity: glareOpacity,
        }}
        className="pointer-events-none absolute inset-0 bg-white select-none"
      />
    </motion.div>
  )
}

export { DraggableCardContainer, DraggableCardBody }
