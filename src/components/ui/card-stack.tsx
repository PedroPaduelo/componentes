import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import type {
  CardStackItem,
  CardStackProps,
  HighlightProps,
} from "@/components/ui/card-stack-types"

/**
 * Pilha de cards de testimonials (Aceternity UI) que rotaciona automaticamente:
 * a cada ~5s o card do topo vai pro fundo. Cada card é um motion.div com `top`
 * e `scale` derivados do índice, animados. Adaptado ao padrão da vitrine
 * (data-slot, named export, cn) e ao tema (light/dark via classes `dark:`).
 */
function CardStack({
  items,
  offset = 10,
  scaleFactor = 0.06,
  className,
}: CardStackProps) {
  const [cards, setCards] = React.useState<CardStackItem[]>(items)

  React.useEffect(() => {
    setCards(items)
  }, [items])

  React.useEffect(() => {
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      setCards((prev) => {
        const next = [...prev]
        const last = next.pop()
        if (last) next.unshift(last)
        return next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      data-slot="card-stack"
      className={cn("relative h-60 w-60 md:h-60 md:w-96", className)}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute flex h-60 w-60 flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-4 shadow-xl shadow-black/[0.1] md:h-60 md:w-96 dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]"
          style={{ transformOrigin: "top center" }}
          animate={{
            top: index * -offset,
            scale: 1 - index * scaleFactor,
            zIndex: cards.length - index,
          }}
        >
          <div className="font-normal text-neutral-700 dark:text-neutral-200">
            {card.content}
          </div>
          <div>
            <p className="font-medium text-neutral-500 dark:text-white">
              {card.name}
            </p>
            <p className="font-normal text-neutral-400 dark:text-neutral-200">
              {card.designation}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/** Destaca um trecho do conteúdo com fundo emerald (brand do efeito). */
function Highlight({ children, className }: HighlightProps) {
  return (
    <span
      className={cn(
        "rounded-sm bg-emerald-100 px-1 py-0.5 font-bold text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500",
        className
      )}
    >
      {children}
    </span>
  )
}

export { CardStack, Highlight }
