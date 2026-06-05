import * as React from "react"
import { cn } from "@/lib/utils"
import { type FlipTextProps } from "./flip-text-types"

/**
 * FlipText — cada caractere do `children` rotaciona no eixo X com timing
 * staggered (sine wave), criando um efeito de onda 3D contínuo.
 *
 * Implementação puramente CSS: `perspective` no wrapper,
 * `transform-style: preserve-3d` em words e chars, e `::before`/`::after`
 * com `backface-visibility: hidden` para o flip. Veja o bloco
 * `Flip Text` no topo de `src/index.css` (keyframe + classes `.flip-char`).
 *
 * A cor do texto é herdada via `color: inherit` e `-webkit-text-fill-color:
 * currentColor` nas faces, então o componente se adapta automaticamente a
 * `text-foreground`, `text-blue-500`, etc.
 */
function FlipText({
  className,
  children,
  duration = 2.2,
  delay = 0,
  loop = true,
  separator = " ",
}: FlipTextProps) {
  const words = React.useMemo(
    () => children.split(separator),
    [children, separator],
  )
  const totalChars = children.length

  const getCharIndex = (wordIndex: number, charIndex: number) => {
    let index = 0
    for (let i = 0; i < wordIndex; i++) {
      index += words[i].length + (separator === " " ? 1 : separator.length)
    }
    return index + charIndex
  }

  return (
    <span
      data-slot="flip-text"
      className={cn("flip-text-wrapper inline-block leading-none", className)}
      style={{ perspective: "1000px" }}
    >
      {words.map((word, wordIndex) => {
        const chars = word.split("")
        return (
          <span
            key={wordIndex}
            className="word inline-block whitespace-nowrap"
            style={{ transformStyle: "preserve-3d" }}
          >
            {chars.map((char, charIndex) => {
              const currentGlobalIndex = getCharIndex(wordIndex, charIndex)
              const normalizedIndex = currentGlobalIndex / totalChars
              const sineValue = Math.sin(normalizedIndex * (Math.PI / 2))
              const calculatedDelay = sineValue * (duration * 0.25) + delay
              return (
                <span
                  key={charIndex}
                  className="flip-char inline-block relative"
                  data-char={char}
                  style={
                    {
                      "--flip-duration": `${duration}s`,
                      "--flip-delay": `${calculatedDelay}s`,
                      "--flip-iteration": loop ? "infinite" : "1",
                      transformStyle: "preserve-3d",
                    } as React.CSSProperties & Record<`--${string}`, string>
                  }
                >
                  {char}
                </span>
              )
            })}
            {separator === " " && wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
            {separator !== " " && wordIndex < words.length - 1 && (
              <span className="inline-block">{separator}</span>
            )}
          </span>
        )
      })}
    </span>
  )
}

export { FlipText }
