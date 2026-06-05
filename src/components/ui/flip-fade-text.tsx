import { useEffect, useState, useMemo, useCallback, memo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import type { FlipFadeTextProps } from "./flip-fade-text-types"

/**
 * FlipFadeText — cicla por uma lista de palavras com animação 3D por letra.
 *
 * Cada palavra entra/sai com flip 3D (rotateX), blur e translate por LETRA,
 * com stagger configurável entre letras. Ideal para loading states e hero
 * sections.
 *
 * Stack: motion v12 (`motion/react`), sem deps externas adicionais.
 * Cores brand FIXAS (`text-neutral-800` / `text-neutral-100`) — decisão
 * intencional do lote VengenceUI: o efeito 3D tem identidade visual própria
 * e não segue tokens semânticos do tema shadcn.
 *
 * Os tipos públicos ficam em `./flip-fade-text-types.ts` para satisfazer
 * o lint `react-refresh/only-export-components`.
 */

const defaultWords: readonly string[] = [
  "LOADING",
  "COMPUTING",
  "SEARCHING",
  "RETRIEVING",
  "ASSEMBLING",
]

/** Subcomponente memoizado: uma única letra com flip 3D + blur. */
const Letter = memo(function Letter({
  char,
  letterDuration,
}: {
  char: string
  letterDuration: number
}) {
  return (
    <motion.span
      style={{ transformStyle: "preserve-3d" }}
      variants={{
        initial: {
          rotateX: 90,
          y: 20,
          opacity: 0,
          filter: "blur(8px)",
        },
        animate: {
          rotateX: 0,
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          transition: {
            duration: letterDuration,
            ease: [0.2, 0.65, 0.3, 0.9],
          },
        },
        exit: {
          rotateX: -90,
          y: -20,
          opacity: 0,
          filter: "blur(8px)",
          transition: {
            duration: letterDuration * 0.67,
            ease: "easeIn" as const,
          },
        },
      }}
      className="inline-block"
    >
      {char}
    </motion.span>
  )
})

/** Subcomponente memoizado: uma palavra completa (conjunto de letras). */
const Word = memo(function Word({
  text,
  staggerDelay,
  exitStaggerDelay,
  letterDuration,
  textClassName,
}: {
  text: string
  staggerDelay: number
  exitStaggerDelay: number
  letterDuration: number
  textClassName?: string
}) {
  const letters = useMemo(() => text.split(""), [text])

  return (
    <motion.div
      className={cn(
        "flex gap-[0.1em] text-4xl md:text-6xl font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100",
        textClassName,
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 1 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
        exit: {
          opacity: 1,
          transition: {
            staggerChildren: exitStaggerDelay,
          },
        },
      }}
    >
      {letters.map((char, i) => (
        <Letter
          // chave única por letra + índice (caracteres repetidos no mesmo
          // texto precisam de chave distinta para o stagger do framer-motion)
          key={`${char}-${i}`}
          char={char}
          letterDuration={letterDuration}
        />
      ))}
    </motion.div>
  )
})

/**
 * Texto 3D flip animado por letra, ciclando por uma lista de palavras.
 *
 * @example
 *   <FlipFadeText />
 *   <FlipFadeText
 *     words={["SYNCING", "PROCESSING", "ANALYZING", "OPTIMIZING"]}
 *     interval={2000}
 *   />
 */
export function FlipFadeText({
  words,
  interval = 2500,
  className,
  textClassName,
  letterDuration = 0.6,
  staggerDelay = 0.1,
  exitStaggerDelay = 0.05,
}: FlipFadeTextProps) {
  // Sempre materializa um array novo (evita mutação de `defaultWords` que é
  // `as const`) e mantém a referência estável enquanto `words` não muda.
  const wordList = useMemo<string[]>(
    () => (words && words.length > 0 ? [...words] : [...defaultWords]),
    [words],
  )
  const [index, setIndex] = useState(0)

  // Callback estável que avança para a próxima palavra.
  const updateIndex = useCallback(() => {
    setIndex((prev) => (prev + 1) % wordList.length)
  }, [wordList.length])

  // Reinicia o timer se `interval` ou `wordList.length` mudarem.
  useEffect(() => {
    const timer = setInterval(updateIndex, interval)
    return () => clearInterval(timer)
  }, [updateIndex, interval])

  const currentWord = useMemo(() => wordList[index], [wordList, index])

  return (
    <div
      data-slot="flip-fade-text"
      className={cn("flex items-center justify-center min-h-[200px]", className)}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="wait">
          <Word
            key={currentWord}
            text={currentWord}
            staggerDelay={staggerDelay}
            exitStaggerDelay={exitStaggerDelay}
            letterDuration={letterDuration}
            textClassName={textClassName}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}
