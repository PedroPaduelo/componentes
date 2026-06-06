import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

/**
 * Polimórfico: `T` é inferido a partir de `as` (default `"button"`), e o spread
 * propaga as props HTML do elemento escolhido (ex.: `href`/`target` para `as="a"`,
 * `type`/`disabled` para `as="button"`).
 */
export type HoverBorderGradientProps<
  T extends React.ElementType = "button"
> = Omit<
  React.ComponentPropsWithoutRef<T>,
  "children" | "onMouseEnter" | "onMouseLeave" | "as"
> & {
  /** Tag/elemento HTML a renderizar (default: `button`). Aceita `a`, `div`, etc. */
  as?: T
  /** Classes extras aplicadas ao container externo (a casca com `p-px`). */
  containerClassName?: string
  /** Classes extras aplicadas ao miolo (área do conteúdo, com bg e texto). */
  className?: string
  /** Duração em segundos entre cada troca de direção do gradiente (1 = 1s). */
  duration?: number
  /** Sentido do ciclo de direção: horário (`true`) ou anti-horário (`false`). */
  clockwise?: boolean
  children?: React.ReactNode
}

const DIRECTIONS: readonly Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]

/** Gradientes radiais brancos que "varrem" a borda em loop, um por direção. */
const MOVING_MAP: Record<Direction, string> = {
  TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  BOTTOM:
    "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  RIGHT:
    "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
}

/** Cor de destaque (highlight) que toma conta da borda no hover — azul Aceternity. */
const HIGHLIGHT =
  "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)"

/**
 * Botão (ou wrapper polimórfico) com borda que ganha gradiente animado ao passar o mouse.
 *
 * Inspirado no `hover-border-gradient` da Aceternity UI: a "borda" é um efeito visual
 * produzido por um `motion.div` com gradiente radial (blur 2px) atrás de uma máscara
 * interna escura. Quando parado, a direção do gradiente rotaciona a cada `duration`s
 * (TOP → LEFT → BOTTOM → RIGHT); ao entrar com o mouse, o gradiente vira o highlight
 * azul Aceternity.
 *
 * Cores são fixas (brand do efeito): container preto/branco translúcido, miolo preto
 * com texto branco. Não segue tema shadcn.
 */
function HoverBorderGradient<T extends React.ElementType = "button">({
  as,
  containerClassName,
  className,
  duration = 1,
  clockwise = true,
  children,
  ...props
}: HoverBorderGradientProps<T>) {
  const [hovered, setHovered] = React.useState<boolean>(false)
  const [direction, setDirection] = React.useState<Direction>("TOP")

  const Tag = (as ?? "button") as React.ElementType

  const rotateDirection = React.useCallback(
    (current: Direction): Direction => {
      const idx = DIRECTIONS.indexOf(current)
      const nextIdx = clockwise
        ? (idx - 1 + DIRECTIONS.length) % DIRECTIONS.length
        : (idx + 1) % DIRECTIONS.length
      return DIRECTIONS[nextIdx] as Direction
    },
    [clockwise]
  )

  React.useEffect(() => {
    if (hovered) return
    const interval = setInterval(() => {
      setDirection((prev) => rotateDirection(prev))
    }, duration * 1000)
    return () => clearInterval(interval)
  }, [hovered, duration, rotateDirection])

  return (
    <Tag
      data-slot="hover-border-gradient"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-min w-fit items-center justify-center overflow-visible rounded-full border border-transparent bg-black/20 p-px decoration-clone transition duration-500 hover:bg-black/10 dark:bg-white/20 dark:hover:bg-white/10",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "z-10 w-auto rounded-[inherit] bg-black px-4 py-2 text-white",
          className
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
    </Tag>
  )
}

export { HoverBorderGradient }
