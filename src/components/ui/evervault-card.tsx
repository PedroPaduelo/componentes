import * as React from "react"
import { useState, useEffect } from "react"
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"
import type { EvervaultCardProps } from "./evervault-card-types"

/**
 * Alfabeto alfanumérico usado por `generateRandomString` para preencher
 * a chuva de caracteres que aparece sob o mask radial.
 */
const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

/**
 * Gera uma string aleatória de `length` caracteres usando o alfabeto
 * alfanumérico. Função pura, determinística apenas pelo gerador PRNG
 * do runtime (Math.random).
 */
function generateRandomString(length: number): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(
      Math.floor(Math.random() * CHARACTERS.length),
    )
  }
  return result
}

type CardPatternProps = {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  randomString: string
}

/**
 * Camada visual com o gradient verde→azul e a chuva de caracteres
 * revelada por um mask radial que segue o cursor. Helper interno do
 * `EvervaultCard` — não é exportado.
 */
function CardPattern({ mouseX, mouseY, randomString }: CardPatternProps) {
  const maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50" />
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-blue-700 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
        style={{ WebkitMaskImage: maskImage, maskImage }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-100"
        style={{ WebkitMaskImage: maskImage, maskImage }}
      >
        <p className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500">
          {randomString}
        </p>
      </motion.div>
    </div>
  )
}

/**
 * Card da Aceternity UI que revela uma chuva de caracteres aleatórios
 * sob um mask radial seguindo o cursor. Ideal para hero, CTAs
 * criptografados e destaque visual. Reimplementado padronizado shadcn.
 *
 * Envólucro `aspect-square` — passe uma altura (`h-[400px]` ou similar)
 * no PAI, senão o card colapsa para 0×0.
 */
function EvervaultCard({ text, className, ...rest }: EvervaultCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const [randomString, setRandomString] = useState("")

  useEffect(() => {
    setRandomString(generateRandomString(1500))
  }, [])

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
    setRandomString(generateRandomString(1500))
  }

  return (
    <div
      data-slot="evervault-card"
      className={cn(
        "p-0.5 bg-transparent aspect-square flex items-center justify-center w-full h-full relative",
        className,
      )}
      {...rest}
    >
      <div
        onMouseMove={onMouseMove}
        className="group/card rounded-3xl w-full relative overflow-hidden bg-transparent flex items-center justify-center h-full"
      >
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative h-44 w-44 rounded-full flex items-center justify-center text-white font-bold text-4xl">
            <div className="absolute w-full h-full bg-white/[0.8] dark:bg-black/[0.8] blur-sm rounded-full" />
            <span className="dark:text-white text-black z-20">{text}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { EvervaultCard }
