import * as React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme/use-theme"
import type {
  AnimatedTestimonialsProps,
  Testimonial,
} from "./animated-testimonials-types"

/** Intervalo (ms) entre cada troca automática quando `autoplay` é true. */
const AUTOPLAY_INTERVAL_MS = 5000
/** Amplitude máxima (em graus) da rotação aleatória no eixo Y das imagens. */
const RANDOM_ROTATE_Y_RANGE = 10
/** Duração (s) da transição de troca de imagem. */
const IMAGE_TRANSITION_S = 0.4
/** Duração (s) da transição de troca do bloco de texto. */
const TEXT_TRANSITION_S = 0.2
/** Delay (s) entre cada palavra no stagger de blur. */
const LETTER_STAGGER_S = 0.02

function randomRotateY(): number {
  return (
    Math.floor(Math.random() * (RANDOM_ROTATE_Y_RANGE * 2 + 1)) -
    RANDOM_ROTATE_Y_RANGE
  )
}

/**
 * AnimatedTestimonials — carrossel de depoimentos com AnimatePresence
 * (motion v12) da Aceternity UI, reimplementado padronizado shadcn:
 *
 * - Substitui @tabler/icons-react (IconArrowLeft/Right) por
 *   `ChevronLeft`/`ChevronRight` do `lucide-react` (já é dep).
 * - Imagens via `<img>` com `src` arbitrário (picsum.photos é o padrão
 *   usado nos examples da vitrine).
 * - Tokens semânticos: `text-black dark:text-white` e
 *   `text-gray-500 dark:text-neutral-500` (manter tons neutros,
 *   identidade do efeito Aceternity — não é brand dark fixo).
 * - "use client" removido (Vite, não Next).
 * - Sem `as any`, sem `@ts-ignore`, sem `console.*`.
 * - `data-slot="animated-testimonials"` no wrapper raiz.
 * - Tipos extraídos em `./animated-testimonials-types.ts`
 *   (padrão do projeto para `react-refresh/only-export-components`).
 *
 * @example
 *   <AnimatedTestimonials
 *     testimonials={[
 *       { quote: "...", name: "Ana", designation: "Designer", src: "https://picsum.photos/seed/ana/500" },
 *     ]}
 *     autoplay
 *   />
 */
function AnimatedTestimonials({
  testimonials,
  autoplay = false,
  className,
  ...props
}: AnimatedTestimonialsProps) {
  const { resolvedTheme } = useTheme()
  const [active, setActive] = useState(0)

  const handleNext = React.useCallback((): void => {
    if (testimonials.length === 0) return
    setActive((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const handlePrev = React.useCallback((): void => {
    if (testimonials.length === 0) return
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  const isActive = (index: number): boolean => index === active

  useEffect(() => {
    if (!autoplay || testimonials.length <= 1) return
    const interval = setInterval(handleNext, AUTOPLAY_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [autoplay, handleNext, testimonials.length])

  const current: Testimonial | undefined = testimonials[active]

  if (!current) return null

  const words = current.quote.split(" ")

  return (
    <div
      data-slot="animated-testimonials"
      data-theme={resolvedTheme}
      className={cn(
        "mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12",
        className,
      )}
      {...props}
    >
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: IMAGE_TRANSITION_S,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{
              duration: TEXT_TRANSITION_S,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {current.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              {current.designation}
            </p>
            <motion.p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
              {words.map((word, index) => (
                <motion.span
                  key={`${active}-${index}-${word}`}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{
                    duration: TEXT_TRANSITION_S,
                    ease: "easeInOut",
                    delay: LETTER_STAGGER_S * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              type="button"
              onClick={handlePrev}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { AnimatedTestimonials }
