/**
 * Hero Parallax (Aceternity UI), adaptado ao padrão da vitrine.
 *
 * Reimplementação fiel do registry `hero-parallax`: header + 3 fileiras de 5
 * thumbnails que transladam horizontalmente em direções opostas, com o conjunto
 * rotacionando (rotateX/rotateZ), transladando (translateY) e esmaecendo
 * (opacity) conforme o scroll — tudo suavizado por springs.
 *
 * Diferenças vs. original (zero-dívida + integração na vitrine):
 *  - Removido `"use client"` (Vite não usa diretiva RSC).
 *  - Imports de `motion/react` (motion@12), não `framer-motion`.
 *  - Named export único `HeroParallax`; `Header`/`ProductCard` ficam internos.
 *  - `data-slot="hero-parallax"` no elemento raiz + `cn()` pra mesclar className.
 *  - Tipos extraídos pra `hero-parallax-types.ts` (evita o lint
 *    react-refresh/only-export-components reclamar de tipos+componente juntos).
 *
 * GOTCHA scroll/altura: o elemento raiz mantém a "pista" alta (`h-[300vh]`) e o
 * `useScroll` usa `target: ref` (o próprio raiz) + `container: scrollRef` — NÃO a
 * window. Na vitrine, o EXAMPLE envolve este componente num container scrollável
 * de ~500px (`overflow-y-auto`) e passa o ref desse container via `scrollRef`;
 * rolar dentro dele faz o `scrollYProgress` evoluir de 0 → 1 e dispara o parallax
 * sem depender do scroll da página/janela. Sem `scrollRef`, cai pra rolagem da
 * janela (comportamento do registry original).
 */

import * as React from "react"
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"
import type { HeroParallaxProps, Product } from "@/components/ui/hero-parallax-types"

function Header({
  heading,
  description,
}: {
  heading?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="relative left-0 top-0 mx-auto w-full max-w-7xl px-4 py-20 md:py-40">
      <h1 className="text-2xl font-bold text-foreground md:text-7xl">
        {heading ?? (
          <>
            The Ultimate <br /> development studio
          </>
        )}
      </h1>
      <p className="mt-8 max-w-2xl text-base text-muted-foreground md:text-xl">
        {description ??
          "We build beautiful products with the latest technologies and frameworks. We are a team of passionate developers and designers that love to build amazing products."}
      </p>
    </div>
  )
}

function ProductCard({
  product,
  translate,
}: {
  product: Product
  translate: MotionValue<number>
}) {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      className="group/product relative h-96 w-[30rem] shrink-0"
    >
      <a href={product.link} className="block group-hover/product:shadow-2xl">
        <img
          src={product.thumbnail}
          height="600"
          width="600"
          className="absolute inset-0 h-full w-full object-cover object-left-top"
          alt={product.title}
        />
      </a>
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-black opacity-0 group-hover/product:opacity-80" />
      <h2 className="absolute bottom-4 left-4 text-white opacity-0 group-hover/product:opacity-100">
        {product.title}
      </h2>
    </motion.div>
  )
}

function HeroParallax({
  products,
  heading,
  description,
  scrollRef,
  className,
  ...rest
}: HeroParallaxProps) {
  const firstRow = products.slice(0, 5)
  const secondRow = products.slice(5, 10)
  const thirdRow = products.slice(10, 15)

  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    container: scrollRef,
    offset: ["start start", "end start"],
  })

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 }

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  )
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  )
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  )
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  )
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  )
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  )

  return (
    <div
      ref={ref}
      data-slot="hero-parallax"
      className={cn(
        "relative flex h-[300vh] flex-col self-auto overflow-hidden py-40 antialiased [perspective:1000px] [transform-style:preserve-3d]",
        className
      )}
      {...rest}
    >
      <Header heading={heading} description={description} />
      <motion.div style={{ rotateX, rotateZ, translateY, opacity }}>
        <motion.div className="mb-20 flex flex-row-reverse space-x-20 space-x-reverse">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="mb-20 flex flex-row space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-20 space-x-reverse">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export { HeroParallax }
