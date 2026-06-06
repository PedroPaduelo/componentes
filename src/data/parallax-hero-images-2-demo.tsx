/**
 * Demo do ParallaxHeroImages2 (variante scroll-driven).
 *
 * Mora em arquivo próprio (não em `examples-*.tsx`) porque cria um componente
 * com hook (`useRef`) e o arquivo de examples também exporta a const
 * `examplesParallaxHeroImages2` — misturar componente + não-componente no mesmo
 * módulo dispara o lint `react-refresh/only-export-components`.
 *
 * O componente provê a área scrollável própria que dirige o parallax: o card de
 * detalhe da vitrine não tem scroll de janela suficiente, então passamos a ref
 * do container rolável via `scrollRef`.
 */

import { useRef } from "react"
import { ParallaxHeroImages2 } from "@/components/ui/parallax-hero-images-2"

const IMAGES = [
  "https://picsum.photos/seed/ph2-1/400/300",
  "https://picsum.photos/seed/ph2-2/400/300",
  "https://picsum.photos/seed/ph2-3/400/300",
  "https://picsum.photos/seed/ph2-4/400/300",
  "https://picsum.photos/seed/ph2-5/400/300",
  "https://picsum.photos/seed/ph2-6/400/300",
  "https://picsum.photos/seed/ph2-7/400/300",
  "https://picsum.photos/seed/ph2-8/400/300",
]

export function ParallaxHeroImages2Demo() {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={scrollRef}
      className="h-[500px] w-full overflow-y-auto rounded-lg border border-border bg-neutral-50 dark:bg-neutral-950"
    >
      <div className="relative min-h-[160vh]">
        <div className="sticky top-0 h-[500px]">
          <ParallaxHeroImages2 scrollRef={scrollRef} images={IMAGES} />
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
}
