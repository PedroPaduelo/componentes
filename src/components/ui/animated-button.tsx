import * as React from "react"
import { motion, type MotionProps, type TargetAndTransition } from "motion/react"
import { cn } from "@/lib/utils"

export type AnimatedButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  whileTap?: MotionProps["whileTap"]
  transition?: MotionProps["transition"]
}

const DEFAULT_TAP = { scale: 0.97 }
const DEFAULT_TRANSITION = {
  stiffness: 20,
  damping: 15,
  mass: 2,
  scale: { type: "spring" as const, stiffness: 10, damping: 5, mass: 0.1 },
}

const asMotion = (
  vars: Record<string, string | number | string[] | number[]>,
): TargetAndTransition => vars as unknown as TargetAndTransition

function AnimatedButton({
  children = "Browse Components",
  className = "",
  whileTap = DEFAULT_TAP,
  transition = DEFAULT_TRANSITION,
  ...rest
}: AnimatedButtonProps) {
  return (
    <motion.button
      data-slot="animated-button"
      whileTap={whileTap}
      transition={transition}
      className={cn(
        "px-6 py-2 rounded-md relative overflow-hidden bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-800",
        "text-neutral-900 dark:text-neutral-100 [--shine:rgba(0,0,0,.66)] dark:[--shine:rgba(255,255,255,.66)]",
        className,
      )}
      {...(rest as MotionProps)}
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
    </motion.button>
  )
}

export { AnimatedButton }
