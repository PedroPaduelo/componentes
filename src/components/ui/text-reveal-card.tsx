import * as React from "react"
import { motion, type MotionStyle } from "motion/react"

import { cn } from "@/lib/utils"

const STAR_COUNT = 80

export interface TextRevealCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Texto "escondido" (base, cor #323238) que aparece por trás do revealText. */
  text: string
  /** Texto "revelado" (gradient white→neutral-300) que aparece conforme o mouse arrasta. */
  revealText: string
  /** Conteúdo auxiliar renderizado no topo do card (ex.: título + descrição). */
  children?: React.ReactNode
}

function TextRevealCard({
  text,
  revealText,
  children,
  className,
  ...props
}: TextRevealCardProps) {
  const [widthPercentage, setWidthPercentage] = React.useState(0)
  const [left, setLeft] = React.useState(0)
  const [localWidth, setLocalWidth] = React.useState(0)
  const [isMouseOver, setIsMouseOver] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setLeft(rect.left)
      setLocalWidth(rect.width)
    }
  }, [])

  function mouseMoveHandler(event: React.MouseEvent<HTMLDivElement>) {
    const { clientX } = event
    if (cardRef.current) {
      const relativeX = clientX - left
      setWidthPercentage((relativeX / localWidth) * 100)
    }
  }

  function touchMoveHandler(event: React.TouchEvent<HTMLDivElement>) {
    const clientX = event.touches[0]?.clientX
    if (clientX !== undefined && cardRef.current) {
      const relativeX = clientX - left
      setWidthPercentage((relativeX / localWidth) * 100)
    }
  }

  function mouseEnterHandler() {
    setIsMouseOver(true)
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false)
    setWidthPercentage(0)
  }

  const rotateDeg = (widthPercentage - 50) * 0.1

  return (
    <div
      ref={cardRef}
      data-slot="text-reveal-card"
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onMouseMove={mouseMoveHandler}
      onTouchStart={mouseEnterHandler}
      onTouchEnd={mouseLeaveHandler}
      onTouchMove={touchMoveHandler}
      className={cn(
        "w-[40rem] max-w-full rounded-lg border border-white/[0.08] bg-[#1d1c20] p-8 relative overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
      <div className="relative flex h-40 items-center overflow-hidden">
        <motion.div
          style={{ width: "100%" }}
          animate={
            isMouseOver
              ? {
                  opacity: widthPercentage > 0 ? 1 : 0,
                  clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
                }
              : {
                  clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
                }
          }
          transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
          className="absolute z-20 will-change-transform bg-[#1d1c20]"
        >
          <p
            style={{
              textShadow: "4px 4px 15px rgba(0,0,0,0.5)",
            } satisfies MotionStyle}
            className="bg-gradient-to-b from-white to-neutral-300 bg-clip-text py-10 text-base font-bold text-transparent sm:text-[3rem]"
          >
            {revealText}
          </p>
        </motion.div>
        <motion.div
          animate={{
            left: `${widthPercentage}%`,
            rotate: `${rotateDeg}deg`,
            opacity: widthPercentage > 0 ? 1 : 0,
          }}
          transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
          className="absolute z-50 h-40 w-[8px] will-change-transform bg-gradient-to-b from-transparent via-neutral-800 to-transparent"
        />
        <div className="overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]">
          <p className="bg-[#323238] bg-clip-text py-10 text-base font-bold text-transparent sm:text-[3rem]">
            {text}
          </p>
          <MemoizedStars />
        </div>
      </div>
    </div>
  )
}

export interface TextRevealCardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

function TextRevealCardTitle({
  className,
  children,
  ...props
}: TextRevealCardTitleProps) {
  return (
    <h2
      data-slot="text-reveal-card-title"
      className={cn("mb-2 text-lg text-white", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

export interface TextRevealCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

function TextRevealCardDescription({
  className,
  children,
  ...props
}: TextRevealCardDescriptionProps) {
  return (
    <p
      data-slot="text-reveal-card-description"
      className={cn("text-sm text-[#a9a9a9]", className)}
      {...props}
    >
      {children}
    </p>
  )
}

interface StarsProps {
  count?: number
}

function Stars({ count = STAR_COUNT }: StarsProps) {
  const randomMove = () => Math.random() * 4 - 2
  const randomOpacity = () => Math.random()
  const randomScalar = () => Math.random()

  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${randomScalar() * 100}% + ${randomMove()}px)`,
            left: `calc(${randomScalar() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: randomScalar() * 10 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${randomScalar() * 100}%`,
            left: `${randomScalar() * 100}%`,
            width: "2px",
            height: "2px",
            backgroundColor: "white",
            borderRadius: "50%",
            zIndex: 1,
          } satisfies MotionStyle}
          className="inline-block"
        />
      ))}
    </div>
  )
}

const MemoizedStars = React.memo(Stars)

export {
  TextRevealCard,
  TextRevealCardTitle,
  TextRevealCardDescription,
  MemoizedStars,
}
