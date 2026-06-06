import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import type { ColourfulTextProps } from "./colourful-text-types"

/**
 * Espectro RGB (10 tons) — cores fixas do efeito (brand visual).
 * Reembaralhadas a cada 5s pra dar sensação de "onda" de cor.
 */
const PALETTE: readonly string[] = [
  "rgb(131, 179, 32)",
  "rgb(47, 195, 106)",
  "rgb(42, 169, 210)",
  "rgb(4, 112, 202)",
  "rgb(107, 10, 255)",
  "rgb(183, 0, 218)",
  "rgb(218, 0, 171)",
  "rgb(230, 64, 92)",
  "rgb(232, 98, 63)",
  "rgb(249, 129, 47)",
]

const SHUFFLE_INTERVAL_MS = 5000
const CHAR_ANIMATION_DURATION_S = 0.5
const CHAR_STAGGER_S = 0.05
const CHAR_Y_RANGE_PX = 3
const CHAR_BLUR_PEAK_PX = 5

/**
 * ColourfulText — texto com efeito de letras coloridas animadas.
 *
 * Inspirado no `colourful-text` da Aceternity UI, reescrito com
 * `motion/react` (motion v12), sem `"use client"`, named export,
 * paleta de cores RGB hardcoded (brand do efeito) e `data-slot`
 * no wrapper inline.
 *
 * @example
 *   <h1 className="text-3xl font-bold md:text-5xl">
 *     Faça seu app <ColourfulText text="crescer rápido" />
 *   </h1>
 */
function ColourfulText({ text, className, ...props }: ColourfulTextProps) {
  const [colors, setColors] = React.useState<readonly string[]>(PALETTE)
  const [tick, setTick] = React.useState<number>(0)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      const shuffled = [...PALETTE].sort(() => Math.random() - 0.5)
      setColors(shuffled)
      setTick((prev) => prev + 1)
    }, SHUFFLE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span
      data-slot="colourful-text"
      className={cn("inline font-sans tracking-tight", className)}
      {...props}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${tick}-${index}`}
          initial={{ y: 0 }}
          animate={{
            color: colors[index % colors.length],
            y: [0, -CHAR_Y_RANGE_PX, 0],
            scale: [1, 1.01, 1],
            filter: [
              "blur(0px)",
              `blur(${CHAR_BLUR_PEAK_PX}px)`,
              "blur(0px)",
            ],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: CHAR_ANIMATION_DURATION_S,
            delay: index * CHAR_STAGGER_S,
          }}
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

export { ColourfulText }
