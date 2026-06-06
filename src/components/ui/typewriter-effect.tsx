import * as React from "react"
import { motion, stagger, useAnimate, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import type {
  TypewriterEffectProps,
  TypewriterEffectSmoothProps,
} from "@/components/ui/typewriter-effect-types"

/**
 * Typewriter Effect (Aceternity) — versão letra a letra.
 *
 * Cada caractere começa com `opacity: 0` e é revelado em sequência
 * (stagger 0.1s) quando o container entra na viewport. A animação
 * re-roda toda vez que o componente é re-montado no viewport.
 *
 * O cursor (`bg-primary`) pisca em loop com `repeat: Infinity`.
 */
function TypewriterEffect({
  words,
  className,
  cursorClassName,
}: TypewriterEffectProps) {
  const wordsArray = React.useMemo(
    () =>
      words.map((word) => ({
        ...word,
        text: word.text.split(""),
      })),
    [words],
  )

  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)
  React.useEffect(() => {
    if (!isInView) return
    animate(
      "span",
      {
        display: "inline-block",
        opacity: 1,
        width: "fit-content",
      },
      {
        duration: 0.3,
        delay: stagger(0.1),
        ease: "easeInOut",
      },
    )
  }, [animate, isInView])

  const renderWords = () => (
    <motion.div ref={scope} className="inline">
      {wordsArray.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.map((char: string, index: number) => (
            <motion.span
              key={`char-${index}`}
              initial={{}}
              className={cn(
                "text-foreground opacity-0",
                word.className,
              )}
            >
              {char}
            </motion.span>
          ))}
          &nbsp;
        </div>
      ))}
    </motion.div>
  )

  return (
    <div
      data-slot="typewriter-effect"
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className,
      )}
    >
      {renderWords()}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-primary",
          cursorClassName,
        )}
      />
    </div>
  )
}

/**
 * Typewriter Effect Smooth (Aceternity) — versão "máquina de escrever".
 *
 * O container revela a linha inteira animando `width: 0% → fit-content`
 * quando entra na viewport. Cursor piscante em loop ao lado.
 */
function TypewriterEffectSmooth({
  words,
  className,
  cursorClassName,
}: TypewriterEffectSmoothProps) {
  const wordsArray = React.useMemo(
    () =>
      words.map((word) => ({
        ...word,
        text: word.text.split(""),
      })),
    [words],
  )

  const renderWords = () => (
    <div>
      {wordsArray.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.map((char: string, index: number) => (
            <span
              key={`char-${index}`}
              className={cn("text-foreground", word.className)}
            >
              {char}
            </span>
          ))}
          &nbsp;
        </div>
      ))}
    </div>
  )

  return (
    <div
      data-slot="typewriter-effect-smooth"
      className={cn("flex space-x-1 my-6", className)}
    >
      <motion.div
        className="overflow-hidden pb-2"
        initial={{ width: "0%" }}
        whileInView={{ width: "fit-content" }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
        viewport={{ once: true }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text-3xl xl:text-5xl font-bold"
          style={{ whiteSpace: "nowrap" }}
        >
          {renderWords()}
          {" "}
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "block rounded-sm w-[4px] h-4 sm:h-6 xl:h-12 bg-primary",
          cursorClassName,
        )}
      />
    </div>
  )
}

export { TypewriterEffect, TypewriterEffectSmooth }
