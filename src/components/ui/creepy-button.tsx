import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

type Coords = { x: number; y: number }

export type CreepyButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "onMouseMove" | "onTouchMove" | "onMouseLeave"
> & {
  /** Conteúdo do botão (texto que aparece no cover). */
  children: React.ReactNode
  /** Classes adicionais pro container (botão raiz). */
  className?: string
  /** Classes adicionais pro cover (a parte que rotaciona em hover). */
  coverClassName?: string
  /** Handler de click. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const VISION_RANGE_X = 180
const VISION_RANGE_Y = 75

function CreepyButton({
  children,
  className,
  coverClassName,
  onClick,
  ...props
}: CreepyButtonProps) {
  const eyesRef = React.useRef<HTMLSpanElement>(null)
  const [eyeCoords, setEyeCoords] = React.useState<Coords>({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  const updateEyes = (e: React.MouseEvent | React.TouchEvent) => {
    const point =
      "touches" in e
        ? e.touches[0]
        : (e as React.MouseEvent)

    if (!eyesRef.current) return

    const eyesRect = eyesRef.current.getBoundingClientRect()
    const eyesCenter = {
      x: eyesRect.left + eyesRect.width / 2,
      y: eyesRect.top + eyesRect.height / 2,
    }

    const dx = point.clientX - eyesCenter.x
    const dy = point.clientY - eyesCenter.y
    const angle = Math.atan2(-dy, dx) + Math.PI / 2

    const distance = Math.hypot(dx, dy)

    const x =
      (Math.sin(angle) * Math.min(distance, VISION_RANGE_X)) / VISION_RANGE_X
    const y =
      (Math.cos(angle) * Math.min(distance, VISION_RANGE_Y)) / VISION_RANGE_Y

    setEyeCoords({ x, y })
  }

  const resetEyes = () => {
    setEyeCoords({ x: 0, y: 0 })
    setIsHovered(false)
  }

  // Cast explícito: `transform` aceita qualquer string CSS, mas o
  // `as React.CSSProperties` torna a tipagem do style explícita
  // para o TypeScript strict mode.
  const pupilStyle = {
    transform: `translate(calc(-50% + ${eyeCoords.x * 50}%), calc(-50% + ${eyeCoords.y * 50}%))`,
  } as React.CSSProperties

  return (
    <button
      data-slot="creepy-button"
      className={cn(
        "relative min-w-[9em] rounded-xl bg-black cursor-pointer outline-none select-none group",
        className,
      )}
      onClick={onClick}
      onMouseMove={(e) => {
        updateEyes(e)
        setIsHovered(true)
      }}
      onTouchMove={updateEyes}
      onMouseLeave={resetEyes}
      {...props}
    >
      {/* Olho (canto inferior direito) */}
      <span
        ref={eyesRef}
        className="absolute flex items-center gap-[0.375em] right-[1em] bottom-[0.5em] h-[0.75em] z-0 pointer-events-none"
      >
        <motion.span
          className="relative w-[0.75em] bg-white rounded-full overflow-hidden"
          animate={{ height: ["0.75em", "0.75em", "0em", "0.75em"] }}
          transition={{
            duration: 3,
            times: [0, 0.92, 0.96, 1],
            repeat: Infinity,
          }}
        >
          <span
            className="absolute top-1/2 left-1/2 w-[0.375em] h-[0.375em] bg-black rounded-full"
            style={pupilStyle}
          />
        </motion.span>
      </span>

      {/* Cover que rotaciona em hover */}
      <motion.span
        className={cn(
          "absolute inset-0 block rounded-xl bg-blue-500 text-white font-bold",
          "flex items-center justify-center px-4 py-2",
          coverClassName,
        )}
        animate={{ rotate: isHovered ? -12 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.span>

      {/* Spacer invisível para dar altura ao botão */}
      <span className="block opacity-0 px-4 py-2 font-bold">{children}</span>
    </button>
  )
}

export { CreepyButton }
