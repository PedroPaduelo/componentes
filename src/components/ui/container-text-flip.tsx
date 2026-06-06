import * as React from "react"
import { motion } from "motion/react"

import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"

const DEFAULT_WORDS = ["better", "modern", "beautiful", "awesome"]
const DEFAULT_INTERVAL = 3000
const DEFAULT_ANIMATION_DURATION = 700
const LETTER_STAGGER = 0.02
const WIDTH_PADDING = 30

export interface ContainerTextFlipProps
  extends Omit<
    React.HTMLAttributes<HTMLParagraphElement>,
    | "children"
    | "onDrag"
    | "onDragEnd"
    | "onDragStart"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
    | "onTransitionEnd"
  > {
  /** Array de palavras que o componente cicla continuamente. */
  words?: string[]
  /** Intervalo (ms) entre cada troca de palavra. */
  interval?: number
  /** Classes adicionais aplicadas ao container animado. */
  className?: string
  /** Classes adicionais aplicadas ao wrapper interno da palavra atual. */
  textClassName?: string
  /** Duração (ms) das transições de troca de palavra. */
  animationDuration?: number
}

/**
 * ContainerTextFlip — container animado que muda de largura suavemente para
 * acomodar a palavra atual e cicla por uma lista de palavras com stagger de
 * blur por letra. Inspirado em `container-text-flip` do Aceternity UI,
 * reescrito com motion v12 (`motion/react`), sem "use client", sem @ts-ignore,
 * sem as any, com tokens semânticos shadcn (text-foreground, bg-muted, border)
 * e wrapper com altura mínima para evitar CLS durante a troca.
 *
 * @example
 *   <ContainerTextFlip
 *     words={["rápido", "bonito", "moderno"]}
 *     className="text-primary"
 *   />
 */
function ContainerTextFlip({
  words = DEFAULT_WORDS,
  interval = DEFAULT_INTERVAL,
  className,
  textClassName,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  ...props
}: ContainerTextFlipProps) {
  const id = React.useId()
  const { resolvedTheme } = useTheme()
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0)
  const [width, setWidth] = React.useState<number | "auto">("auto")
  const textRef = React.useRef<HTMLDivElement>(null)

  const updateWidthForWord = React.useCallback(() => {
    if (textRef.current) {
      const textWidth = textRef.current.scrollWidth + WIDTH_PADDING
      setWidth(textWidth)
    }
  }, [])

  React.useLayoutEffect(() => {
    updateWidthForWord()
  }, [updateWidthForWord, currentWordIndex])

  React.useEffect(() => {
    if (words.length <= 1) return
    const intervalId = window.setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, interval)
    return () => window.clearInterval(intervalId)
  }, [words, interval])

  const currentWord = words[currentWordIndex] ?? ""
  const letters = currentWord.split("")

  return (
    <motion.p
      data-slot="container-text-flip"
      data-theme={resolvedTheme}
      layout
      layoutId={`words-here-${id}`}
      animate={{ width }}
      transition={{ duration: animationDuration / 2000 }}
      className={cn(
        "relative inline-block min-h-[1.5em] overflow-hidden whitespace-nowrap rounded-lg pt-2 pb-3 text-center text-4xl font-bold md:text-7xl",
        "text-foreground",
        "bg-gradient-to-b from-muted to-muted/60",
        "border border-border",
        "shadow-md shadow-black/5 dark:shadow-black/20",
        className,
      )}
      key={currentWord}
      {...props}
    >
      <motion.div
        transition={{
          duration: animationDuration / 1000,
          ease: "easeInOut",
        }}
        className={cn("inline-block", textClassName)}
        ref={textRef}
        layoutId={`word-div-${currentWord}-${id}`}
      >
        <motion.div className="inline-block">
          {letters.map((letter, index) => (
            <motion.span
              key={`${id}-${currentWord}-${index}`}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: index * LETTER_STAGGER }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.p>
  )
}

export { ContainerTextFlip }
