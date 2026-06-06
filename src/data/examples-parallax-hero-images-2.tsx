/**
 * Examples — Parallax Hero Images 2 (Aceternity UI, variante scroll-driven).
 *
 * As imagens são distribuídas em 3 colunas que deslizam verticalmente conforme
 * a ROLAGEM avança (laterais sobem, meio desce), com leve zoom-out — diferente
 * da v1, que é mouse-driven.
 *
 * O efeito precisa de uma área scrollável própria (o card de detalhe não tem
 * scroll de janela suficiente). Por isso o render usa o componente
 * `ParallaxHeroImages2Demo`, que cria o container rolável e passa `scrollRef`.
 * O `code` mostra esse mesmo padrão de uso. Imagens via picsum.photos com seeds
 * fixos (estáveis, sem dep nova).
 */

import type { Example } from "@/data/examples"
import { ParallaxHeroImages2Demo } from "@/data/parallax-hero-images-2-demo"

const parallaxHero2ScrollExample: Example = {
  title: "Scroll-driven",
  description:
    "Role a área para ver as colunas deslizarem com profundidades diferentes.",
  code: `import { useRef } from "react"
import { ParallaxHeroImages2 } from "@/components/ui/parallax-hero-images-2"

export function HeroDemo() {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={scrollRef}
      className="h-[500px] w-full overflow-y-auto rounded-lg border border-border bg-neutral-50 dark:bg-neutral-950"
    >
      <div className="relative min-h-[160vh]">
        <div className="sticky top-0 h-[500px]">
          <ParallaxHeroImages2
            scrollRef={scrollRef}
            images={[
              "https://picsum.photos/seed/ph2-1/400/300",
              "https://picsum.photos/seed/ph2-2/400/300",
              "https://picsum.photos/seed/ph2-3/400/300",
              "https://picsum.photos/seed/ph2-4/400/300",
              "https://picsum.photos/seed/ph2-5/400/300",
              "https://picsum.photos/seed/ph2-6/400/300",
              "https://picsum.photos/seed/ph2-7/400/300",
              "https://picsum.photos/seed/ph2-8/400/300",
            ]}
          />
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
              Parallax Hero v2
            </h2>
            <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
              Role a área — as colunas deslizam com profundidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}`,
  render: <ParallaxHeroImages2Demo />,
}

export const examplesParallaxHeroImages2: Record<string, Example[]> = {
  "parallax-hero-images-2": [parallaxHero2ScrollExample],
}
