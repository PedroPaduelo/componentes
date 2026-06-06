import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

export type ParallaxScrollProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de URLs das imagens distribuídas nas 3 colunas. */
  images: readonly string[]
}

/**
 * Grade de imagens em 3 colunas que se movem em velocidades/direções
 * diferentes conforme o scroll do próprio container (área scrollável de
 * altura fixa). A coluna do meio sobe enquanto as laterais descem, criando
 * o efeito parallax. Usa `useScroll`/`useTransform` da motion.
 */
function ParallaxScroll({ images, className, ...props }: ParallaxScrollProps) {
  const gridRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    container: gridRef,
    offset: ["start start", "end start"],
  })

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200])
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200])
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200])

  const third = Math.ceil(images.length / 3)
  const firstPart = images.slice(0, third)
  const secondPart = images.slice(third, 2 * third)
  const thirdPart = images.slice(2 * third)

  const columns = [
    { items: firstPart, y: translateFirst, key: "grid-1" },
    { items: secondPart, y: translateSecond, key: "grid-2" },
    { items: thirdPart, y: translateThird, key: "grid-3" },
  ]

  return (
    <div
      data-slot="parallax-scroll"
      className={cn(
        "h-[40rem] w-full items-start overflow-y-auto rounded-lg",
        className,
      )}
      ref={gridRef}
      {...props}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 px-10 py-40 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((column) => (
          <div className="grid gap-10" key={column.key}>
            {column.items.map((src, idx) => (
              <motion.div style={{ y: column.y }} key={column.key + idx}>
                <img
                  src={src}
                  className="h-80 w-full rounded-lg object-cover object-left-top"
                  height={400}
                  width={400}
                  alt="thumbnail"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { ParallaxScroll }
