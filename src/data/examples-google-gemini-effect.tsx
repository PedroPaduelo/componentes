/**
 * Examples — Google Gemini Effect (Aceternity UI).
 *
 * O efeito é dirigido por `useScroll`, então o example usa uma área scrollável
 * PRÓPRIA (`GoogleGeminiEffectDemo`, arquivo separado pra fugir do
 * react-refresh/only-export-components). As 5 curvas coloridas (rosa/laranja/
 * azul-claro/azul/azul-forte) se desenham via `pathLength` conforme o scroll.
 *
 * Cores fixas (brand do efeito) + fundo escuro (decisão do projeto pra efeitos
 * "visual signature" Aceternity). `code` e `render` em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { GoogleGeminiEffectDemo } from "@/data/google-gemini-effect-demo"

const googleGeminiEffectBasicExample: Example = {
  title: "Básico",
  description:
    "Role a área abaixo: as cinco curvas coloridas se desenham (pathLength 0 → 1) conforme o scroll evolui. Os MotionValue vêm de useScroll + useTransform na área scrollável.",
  code: `function GoogleGeminiEffectDemo() {
  const ref = React.useRef<HTMLDivElement>(null)
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
      <div ref={ref} className="relative h-[300vh] w-full">
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
}`,
  render: <GoogleGeminiEffectDemo />,
}

export const examplesGoogleGeminiEffect: Record<string, Example[]> = {
  "google-gemini-effect": [googleGeminiEffectBasicExample],
}
