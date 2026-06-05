import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

const CHARS = "!<>-_\\/[]{}—=+*^?#_"

export type CyberGlitchTextProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Texto-base a exibir e fazer scramble. */
  text: string
  /** Se true (default), roda scramble quando o componente monta. */
  scrambleOnMount?: boolean
  /** Intervalo (ms) entre iterações do scramble. Default: 40. */
  scrambleDuration?: number
}

function CyberGlitchText({
  text,
  className,
  scrambleOnMount = true,
  scrambleDuration = 40,
  ...hostProps
}: CyberGlitchTextProps) {
  const [displayText, setDisplayText] = React.useState(text)
  const [isHovered, setIsHovered] = React.useState(false)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = React.useCallback(() => {
    let iteration = 0
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((_letter, index) => {
            if (index < iteration) {
              return text[index]
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join("")
      )

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }

      iteration += 1 / 3
    }, scrambleDuration)
  }, [text, scrambleDuration])

  React.useEffect(() => {
    if (scrambleOnMount) {
      scramble()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [scramble, scrambleOnMount])

  return (
    <div
      data-slot="cyber-glitch-text"
      className={cn("relative inline-block group", className)}
      onMouseEnter={() => {
        setIsHovered(true)
        scramble()
      }}
      onMouseLeave={() => setIsHovered(false)}
      {...hostProps}
    >
      <span className="relative z-10">{displayText}</span>

      {isHovered && (
        <>
          <motion.span
            className="absolute top-0 left-[-2px] z-0 text-red-500 opacity-70 mix-blend-screen"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [-2, 2, -1, 3, 0], opacity: [0, 0.8, 0.4, 0.9, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
            aria-hidden="true"
          >
            {displayText}
          </motion.span>
          <motion.span
            className="absolute top-0 left-[2px] z-0 text-blue-500 opacity-70 mix-blend-screen"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [2, -2, 1, -3, 0], opacity: [0, 0.8, 0.4, 0.9, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror", delay: 0.05 }}
            aria-hidden="true"
          >
            {displayText}
          </motion.span>

          <motion.div
            className="absolute inset-0 bg-white/10 dark:bg-black/10 z-20 pointer-events-none mix-blend-overlay"
            initial={{ top: "0%", height: "0%" }}
            animate={{ top: ["0%", "40%", "80%", "0%"], height: ["2px", "5px", "1px", "0px"] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </>
      )}
    </div>
  )
}

export { CyberGlitchText }
