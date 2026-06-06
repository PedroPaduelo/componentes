import * as React from "react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

/** Palavras padrão (originais do registry Aceternity). */
const DEFAULT_WORDS: readonly string[] = [
  "Landing Pages",
  "Component Blocks",
  "Page Sections",
  "3D Shaders",
]

/** Props do `<LayoutTextFlip />`. */
export interface LayoutTextFlipProps {
  /** Texto fixo exibido antes da palavra rotativa. */
  text: string
  /**
   * Lista de palavras que rotacionam com animação de flip.
   * @default ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"]
   */
  words?: readonly string[]
  /**
   * Intervalo (ms) entre cada troca de palavra.
   * @default 3000
   */
  duration?: number
  /**
   * Conteúdo opcional entre o título fixo e a palavra rotativa
   * (ex.: separador como "·" ou " — ").
   */
  children?: React.ReactNode
  /** Classes utilitárias adicionais no wrapper raiz. */
  className?: string
}

/**
 * Layout Text Flip (Aceternity UI) — título fixo + palavra que rotaciona
 * com flip vertical (y: -40 → 0 → +50) e blur de entrada/saída.
 *
 * O `layoutId` do título permite transição suave quando dois
 * `<LayoutTextFlip />` montam/desmontam na mesma página (ex.: hero
 * que muda de seção). A palavra rotativa usa `popLayout` para
 * preservar a posição do contêiner enquanto o texto desliza.
 *
 * Tema: usa tokens semânticos shadcn (`bg-card`, `text-card-foreground`,
 * `ring-border`) — funciona automaticamente em light/dark.
 */
export function LayoutTextFlip({
  text,
  words = DEFAULT_WORDS,
  duration = 3000,
  children,
  className,
}: LayoutTextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (words.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, duration)
    return () => clearInterval(interval)
  }, [words.length, duration])

  const activeWord = words.length > 0 ? words[currentIndex % words.length] : ""

  return (
    <span
      data-slot="layout-text-flip"
      className={cn(
        "inline-flex flex-wrap items-center gap-2 md:gap-3",
        className,
      )}
    >
      <motion.span
        layoutId="layout-text-flip-subtext"
        className="text-2xl font-bold tracking-tight drop-shadow-lg md:text-4xl"
      >
        {text}
      </motion.span>
      {children}
      <motion.span
        layout
        className={cn(
          "relative inline-flex w-fit items-center overflow-hidden rounded-md border border-transparent px-4 py-2 text-2xl font-bold tracking-tight shadow-sm ring-1 ring-border drop-shadow-lg md:text-4xl",
          "bg-card text-card-foreground",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={currentIndex}
            initial={{ y: -40, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 50, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="inline-block whitespace-nowrap"
          >
            {activeWord}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  )
}
