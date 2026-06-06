import { useMemo, useRef } from "react"
import { motion, useScroll, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import type { ParallaxHeroImages2Props } from "./parallax-hero-images-2-types"

/**
 * ParallaxHeroImages2 — variante 2 (scroll-driven) do parallax hero da
 * Aceternity UI.
 *
 * As imagens são organizadas em 3 colunas. Conforme a rolagem avança, cada
 * coluna translada verticalmente em velocidade/sentido distintos (coluna do
 * meio mais lenta e em sentido oposto), criando profundidade. Há também um leve
 * zoom-out do conjunto, reforçando a sensação de saída de cena.
 *
 * O progresso vem de `useScroll`. Em áreas scrolláveis próprias (ex.: card de
 * detalhe da vitrine, sem scroll de janela suficiente), passe `scrollRef` com a
 * ref do container rolável — o efeito mede a rolagem interna. Sem `scrollRef`, o
 * progresso é medido pela rolagem da janela (uso típico em hero full-page).
 *
 * Os tipos públicos ficam em `./parallax-hero-images-2-types.ts` para satisfazer
 * o lint `react-refresh/only-export-components`.
 *
 * @example
 *   const ref = useRef<HTMLDivElement | null>(null)
 *   <div ref={ref} className="h-[500px] overflow-y-auto">
 *     <div className="min-h-[150vh]">
 *       <ParallaxHeroImages2 scrollRef={ref} images={[...]} />
 *     </div>
 *   </div>
 */

/** Configuração de spring para suavizar o seguimento da rolagem. */
const SPRING_CONFIG = { stiffness: 120, damping: 30, mass: 0.4 } as const

/** Distribui as imagens (máx. 8) em 3 colunas, alternando o índice. */
function splitIntoColumns(images: string[]): [string[], string[], string[]] {
  const cols: [string[], string[], string[]] = [[], [], []]
  images.slice(0, 8).forEach((src, index) => {
    cols[index % 3].push(src)
  })
  return cols
}

export function ParallaxHeroImages2({
  images,
  scrollRef,
  className,
  imageClassName,
}: ParallaxHeroImages2Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  const columns = useMemo(() => splitIntoColumns(images), [images])

  const { scrollYProgress } = useScroll({
    target: rootRef,
    container: scrollRef,
    offset: ["start end", "end start"],
  })

  // Colunas laterais sobem; a do meio desce mais devagar (sentido oposto).
  const yOuter = useSpring(
    useTransform(scrollYProgress, [0, 1], [120, -120]),
    SPRING_CONFIG,
  )
  const yInner = useSpring(
    useTransform(scrollYProgress, [0, 1], [-90, 90]),
    SPRING_CONFIG,
  )
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 1], [1.08, 0.96]),
    SPRING_CONFIG,
  )

  const columnY = [yOuter, yInner, yOuter] as const

  return (
    <div
      ref={rootRef}
      data-slot="parallax-hero-images-2"
      className={cn(
        "relative grid h-full w-full grid-cols-3 gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4",
        className,
      )}
    >
      {columns.map((colImages, colIndex) => (
        <motion.div
          key={colIndex}
          style={{ y: columnY[colIndex], scale }}
          className="flex flex-col gap-3 sm:gap-4"
        >
          {colImages.map((src, imgIndex) => (
            <img
              key={`${colIndex}-${imgIndex}`}
              src={src}
              alt=""
              loading="lazy"
              draggable={false}
              className={cn(
                "h-32 w-full rounded-xl object-cover shadow-lg sm:h-44",
                imageClassName,
              )}
            />
          ))}
        </motion.div>
      ))}
    </div>
  )
}
