import * as React from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"

export type EncryptedTextProps = {
  /** Texto final que será revelado. */
  text: string
  className?: string
  /**
   * Tempo em milissegundos entre revelar cada caractere real subsequente.
   * Menor é mais rápido. Padrão 50ms por caractere.
   */
  revealDelayMs?: number
  /** Conjunto de caracteres customizado para o efeito de embaralhamento. */
  charset?: string
  /**
   * Tempo em milissegundos entre flips de embaralhamento dos caracteres não revelados.
   * Menor é mais "nervoso". Padrão 50ms.
   */
  flipDelayMs?: number
  /** Classe CSS para os caracteres embaralhados/criptografados. */
  encryptedClassName?: string
  /** Classe CSS para os caracteres revelados. */
  revealedClassName?: string
}

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?"

function generateRandomCharacter(charset: string): string {
  const index = Math.floor(Math.random() * charset.length)
  return charset.charAt(index)
}

function generateGibberishPreservingSpaces(
  original: string,
  charset: string,
): string {
  if (!original) return ""
  let result = ""
  for (let i = 0; i < original.length; i += 1) {
    const ch = original[i]
    result += ch === " " ? " " : generateRandomCharacter(charset)
  }
  return result
}

export function EncryptedText({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
}: EncryptedTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  const [revealCount, setRevealCount] = React.useState<number>(0)
  const animationFrameRef = React.useRef<number | null>(null)
  const startTimeRef = React.useRef<number>(0)
  const lastFlipTimeRef = React.useRef<number>(0)
  const scrambleCharsRef = React.useRef<string[]>(
    text ? generateGibberishPreservingSpaces(text, charset).split("") : [],
  )

  React.useEffect(() => {
    if (!isInView) return

    // Reseta o estado para uma animação nova sempre que as dependências mudam.
    const initial = text
      ? generateGibberishPreservingSpaces(text, charset)
      : ""
    scrambleCharsRef.current = initial.split("")
    startTimeRef.current = performance.now()
    lastFlipTimeRef.current = startTimeRef.current
    setRevealCount(0)

    let isCancelled = false

    const update = (now: number) => {
      if (isCancelled) return

      const elapsedMs = now - startTimeRef.current
      const totalLength = text.length
      const currentRevealCount = Math.min(
        totalLength,
        Math.floor(elapsedMs / Math.max(1, revealDelayMs)),
      )

      setRevealCount(currentRevealCount)

      if (currentRevealCount >= totalLength) {
        return
      }

      // Re-randomiza os caracteres embaralhados não revelados em intervalo.
      const timeSinceLastFlip = now - lastFlipTimeRef.current
      if (timeSinceLastFlip >= Math.max(0, flipDelayMs)) {
        for (let index = 0; index < totalLength; index += 1) {
          if (index >= currentRevealCount) {
            if (text[index] !== " ") {
              scrambleCharsRef.current[index] = generateRandomCharacter(charset)
            } else {
              scrambleCharsRef.current[index] = " "
            }
          }
        }
        lastFlipTimeRef.current = now
      }

      animationFrameRef.current = requestAnimationFrame(update)
    }

    animationFrameRef.current = requestAnimationFrame(update)

    return () => {
      isCancelled = true
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isInView, text, revealDelayMs, charset, flipDelayMs])

  if (!text) return null

  return (
    <motion.span
      ref={ref}
      data-slot="encrypted-text"
      className={cn(className)}
      aria-label={text}
      role="text"
    >
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount
        const displayChar = isRevealed
          ? char
          : char === " "
            ? " "
            : (scrambleCharsRef.current[index] ??
              generateRandomCharacter(charset))

        return (
          <span
            key={index}
            className={cn(isRevealed ? revealedClassName : encryptedClassName)}
          >
            {displayChar}
          </span>
        )
      })}
    </motion.span>
  )
}
