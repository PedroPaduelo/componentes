import * as React from "react"
import { motion, type MotionProps, type TargetAndTransition } from "motion/react"
import { cn } from "@/lib/utils"

type AnimatedElement = "button" | "a" | "div" | "span"

export type AnimatedButtonProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> &
  Omit<MotionProps, "initial" | "animate" | "transition"> & {
    /** Conteúdo do botão. Default: "Browse Components". */
    children?: React.ReactNode
    /** Classes CSS adicionais. */
    className?: string
    /** Elemento motion a renderizar. Default: "button". */
    as?: AnimatedElement
    /** Estado desabilitado (atributo HTML nativo, passado para a raiz). */
    disabled?: boolean
    /** Animação de tap. Default: { scale: 0.97 }. */
    whileTap?: MotionProps["whileTap"]
    /** Transição. Default: spring custom. */
    transition?: MotionProps["transition"]
  }

const DEFAULT_TAP = { scale: 0.97 }
const DEFAULT_TRANSITION = {
  stiffness: 20,
  damping: 15,
  mass: 2,
  scale: { type: "spring" as const, stiffness: 10, damping: 5, mass: 0.1 },
}

/**
 * Cast de CSS custom property objects (ex.: `{ '--mask-x': '100%' }`) para o
 * formato aceito por `initial`/`animate` do motion. Não é `as any` — é um
 * double-cast intermediário (`unknown` → `TargetAndTransition`) que preserva
 * a checagem estrita de tipos no resto do código.
 */
const asMotion = (
  vars: Record<string, string | number | string[] | number[]>,
): TargetAndTransition => vars as unknown as TargetAndTransition

function AnimatedButton({
  children = "Browse Components",
  className = "",
  as = "button",
  whileTap = DEFAULT_TAP,
  transition = DEFAULT_TRANSITION,
  ...rest
}: AnimatedButtonProps) {
  // Switch tipado (substitui `(motion as any)[as]`). O cast explícito para
  // `React.ElementType` evita a explosão combinatória de tipos do union
  // `motion.a | motion.div | motion.span | motion.button` quando combinado
  // com o spread de `rest`.
  const Component = (
    as === "a"
      ? motion.a
      : as === "div"
        ? motion.div
        : as === "span"
          ? motion.span
          : motion.button
  ) as React.ElementType

  return (
    <Component
      data-slot="animated-button"
      {...rest}
      whileTap={whileTap}
      transition={transition}
      className={cn(
        "px-6 py-2 rounded-md relative overflow-hidden bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-800",
        "text-neutral-900 dark:text-neutral-100 [--shine:rgba(0,0,0,.66)] dark:[--shine:rgba(255,255,255,.66)]",
        className,
      )}
    >
      <motion.span
        className="tracking-wide font-light h-full w-full flex items-center justify-center relative z-10"
        style={{
          WebkitMaskImage:
            "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
          maskImage:
            "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
        }}
        initial={asMotion({ "--mask-x": "100%" })}
        animate={asMotion({ "--mask-x": "-100%" })}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
          repeatDelay: 1,
        }}
      >
        {children}
      </motion.span>

      <motion.span
        className="block absolute inset-0 rounded-md p-px"
        style={
          {
            background:
              "linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          } as React.CSSProperties
        }
        initial={asMotion({ backgroundPosition: "100% 0", opacity: 0 })}
        animate={asMotion({
          backgroundPosition: ["100% 0", "0% 0"],
          opacity: [0, 1, 0],
        })}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1,
        }}
      />
    </Component>
  )
}

export { AnimatedButton }
