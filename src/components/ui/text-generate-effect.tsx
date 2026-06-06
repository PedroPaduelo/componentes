import * as React from "react"
import { motion, stagger, useAnimate } from "motion/react"

import { cn } from "@/lib/utils"

export type TextGenerateEffectProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Frase completa a ser animada, palavra a palavra. */
  words: string
  /**
   * Quando `true` (padrão), as palavras entram com `blur(10px) → blur(0)`.
   * Quando `false`, apenas a opacidade anima (sem blur).
   */
  filter?: boolean
  /** Duração da animação de cada palavra, em segundos. */
  duration?: number
}

function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
  ...props
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate()
  const wordsArray = React.useMemo(() => words.split(" "), [words])

  React.useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ?? 1,
        delay: stagger(0.2),
      },
    )
  }, [scope, animate, filter, duration])

  const renderWords = () => (
    <motion.div ref={scope} className="inline">
      {wordsArray.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          className={cn(
            "text-foreground opacity-0",
            idx > 0 && "ml-[0.25em]",
          )}
          style={{
            filter: filter ? "blur(10px)" : "none",
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )

  return (
    <div
      data-slot="text-generate-effect"
      className={cn("font-bold", className)}
      {...props}
    >
      <div className="mt-4">
        <div className="text-2xl leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  )
}

export { TextGenerateEffect }
