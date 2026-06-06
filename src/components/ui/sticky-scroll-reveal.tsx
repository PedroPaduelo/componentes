import * as React from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { cn } from "@/lib/utils"

export type StickyScrollContentItem = {
  /** Título da seção (aparece em destaque no painel sticky). */
  title: string
  /** Texto descritivo abaixo do título. */
  description: string
  /** Conteúdo opcional exibido dentro do card sticky à direita (ex.: imagem, código, componente). */
  content?: React.ReactNode
}

export type StickyScrollProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "content" | "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onTransitionEnd"
> & {
  /**
   * Lista de seções. Cada item vira um bloco no lado esquerdo; o card sticky
   * à direita troca o `content` (ou background gradiente) conforme a seção
   * ativa muda via `useScroll` no container.
   */
  content: StickyScrollContentItem[]
  /** Classes extras aplicadas ao card sticky à direita (substitui o gradiente default). */
  contentClassName?: string
}

const DEFAULT_BACKGROUND_COLORS = [
  "#0f172a", // slate-900
  "#000000", // black
  "#171717", // neutral-900
] as const

const DEFAULT_LINEAR_GRADIENTS = [
  "linear-gradient(to bottom right, #06b6d4, #10b981)", // cyan-500 → emerald-500
  "linear-gradient(to bottom right, #ec4899, #6366f1)", // pink-500 → indigo-500
  "linear-gradient(to bottom right, #f97316, #eab308)", // orange-500 → yellow-500
] as const

function StickyScroll({
  content,
  contentClassName,
  className,
  ...hostProps
}: StickyScrollProps) {
  const [activeCard, setActiveCard] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  })

  const cardLength = content.length
  const backgroundColors = DEFAULT_BACKGROUND_COLORS
  const linearGradients = DEFAULT_LINEAR_GRADIENTS

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength)
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint)
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index
        }
        return acc
      },
      0,
    )
    setActiveCard(closestBreakpointIndex)
  })

  const [backgroundGradient, setBackgroundGradient] = React.useState<string>(
    linearGradients[0],
  )

  React.useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length])
  }, [activeCard, linearGradients])

  return (
    <motion.div
      ref={ref}
      data-slot="sticky-scroll-reveal"
      animate={{
        backgroundColor:
          backgroundColors[activeCard % backgroundColors.length],
      }}
      className={cn(
        "relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-md p-10",
        className,
      )}
      {...hostProps}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={`${item.title}-${index}`} className="my-20">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-2xl font-bold text-slate-100"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="mt-10 max-w-sm text-base text-slate-300"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md bg-white lg:block",
          contentClassName,
        )}
      >
        {content[activeCard]?.content ?? null}
      </div>
    </motion.div>
  )
}

export { StickyScroll }
