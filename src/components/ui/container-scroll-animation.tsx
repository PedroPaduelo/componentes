/**
 * Container Scroll Animation (Aceternity UI) — adaptado ao padrão da vitrine.
 *
 * Efeito de scroll 3D: conforme o usuário rola, um card/mockup rotaciona em
 * rotateX (20deg → 0), escala (1.05 → 1 desktop / 0.7 → 0.9 mobile) e o título
 * translada pra cima. Dirigido por `useScroll({ target })` + `useTransform`.
 *
 * Correções zero-dívida em relação ao registry original:
 * - Sem `"use client"`.
 * - Import de `motion/react` (o projeto usa `motion@12`, NÃO `framer-motion`).
 * - Named export único `ContainerScroll` (Header/Card são internos).
 * - Sem `any`: subcomponentes tipados com `MotionValue<number>`.
 * - `data-slot="container-scroll-animation"` no JSX raiz.
 * - Detecção de mobile via `window.innerWidth` com listener `resize` + cleanup.
 *
 * Tema (decisão de tokenização): o mockup de device tinha cores hardcoded
 * (`border-[#6C6C6C] bg-[#222222]` na moldura, `bg-gray-100 dark:bg-zinc-900`
 * na tela). Foram trocadas por tokens para reagir ao tema: a moldura/bezel usa
 * `border-border bg-muted` (mantém o aspecto de "frame" físico, neutro e visível
 * tanto no light quanto no dark, sem o preto chapado que parecia bug no light) e
 * a tela interna usa `bg-background` (superfície de conteúdo coerente com o
 * resto da vitrine).
 */

import * as React from "react"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"

type ContainerScrollProps = {
  /** Conteúdo do título exibido acima do card (sobe conforme o scroll). */
  titleComponent: React.ReactNode
  /** Conteúdo do mockup renderizado dentro do card 3D. */
  children: React.ReactNode
  /** Classe extra aplicada ao wrapper raiz. */
  className?: string
  /**
   * Ref do elemento scrollável que dirige a animação. Útil quando o
   * `ContainerScroll` vive dentro de uma área `overflow-y-auto` própria (em vez
   * da rolagem da janela). Quando omitido, usa a rolagem da janela.
   */
  scrollRef?: React.RefObject<HTMLElement | null>
}

function ContainerScroll({
  titleComponent,
  children,
  className,
  scrollRef,
}: ContainerScrollProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollRef,
    offset: ["start end", "end start"],
  })
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const scaleDimensions: [number, number] = isMobile ? [0.7, 0.9] : [1.05, 1]

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions)
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div
      ref={containerRef}
      data-slot="container-scroll-animation"
      className={cn(
        "relative flex h-[60rem] items-center justify-center p-2 md:h-[80rem] md:p-20",
        className,
      )}
    >
      <div
        className="relative w-full py-10 md:py-40"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  )
}

type HeaderProps = {
  translate: MotionValue<number>
  titleComponent: React.ReactNode
}

function Header({ translate, titleComponent }: HeaderProps) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  )
}

type CardProps = {
  rotate: MotionValue<number>
  scale: MotionValue<number>
  children: React.ReactNode
}

function Card({ rotate, scale, children }: CardProps) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="mx-auto -mt-12 h-[30rem] w-full max-w-5xl rounded-[30px] border-4 border-border bg-muted p-2 shadow-2xl md:h-[40rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-background md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  )
}

export { ContainerScroll }
export type { ContainerScrollProps }
