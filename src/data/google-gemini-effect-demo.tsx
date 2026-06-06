import { useRef } from "react"
import { useScroll, useTransform } from "motion/react"

import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect"

/**
 * Demo do Google Gemini Effect numa área scrollável PRÓPRIA.
 *
 * O efeito desenha as 5 curvas via `pathLength` (0 → 1). Aqui derivamos esses
 * cinco `MotionValue` de `useScroll({ target, offset })` mapeados com
 * `useTransform`, de modo que o progresso evolua ao rolar DENTRO da área
 * (`overflow-y-auto`) — sem depender da rolagem da janela (gotcha do projeto:
 * em /components/:slug não há window-scroll suficiente).
 */
export function GoogleGeminiEffectDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2])
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2])
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2])
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2])
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2])

  return (
    <div className="h-[480px] w-full overflow-y-auto rounded-lg border border-border bg-black">
      <div
        ref={ref}
        className="relative h-[300vh] w-full"
      >
        <div className="sticky top-0 flex h-[480px] items-center justify-center overflow-hidden">
          <GoogleGeminiEffect
            className="top-1/2 -translate-y-1/2"
            title="Role para revelar"
            description="As cinco curvas se desenham conforme você rola esta área."
            pathLengths={[
              pathLengthFirst,
              pathLengthSecond,
              pathLengthThird,
              pathLengthFourth,
              pathLengthFifth,
            ]}
          />
        </div>
      </div>
    </div>
  )
}
