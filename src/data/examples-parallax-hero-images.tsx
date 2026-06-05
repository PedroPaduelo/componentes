/**
 * Examples — Parallax Hero Images (Aceternity UI).
 *
 * Efeito parallax dirigido pelo mouse: imagens em profundidades diferentes
 * transladam proporcionalmente ao cursor, com entrada fade-in + blur.
 *
 * Imagens via picsum.photos com seeds fixos (estáveis, sem 404, sem dep nova).
 * O demo oficial usa `min-h-screen` — aqui cada wrapper tem altura CONTIDA
 * (`h-[420px]`) com um heading sobreposto `z-10`, para caber no card de detalhe.
 * `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { ParallaxHeroImages } from "@/components/ui/parallax-hero-images"

const IMAGES = [
  "https://picsum.photos/seed/ph-1/400/300",
  "https://picsum.photos/seed/ph-2/400/300",
  "https://picsum.photos/seed/ph-3/400/300",
  "https://picsum.photos/seed/ph-4/400/300",
  "https://picsum.photos/seed/ph-5/400/300",
  "https://picsum.photos/seed/ph-6/400/300",
]

const parallaxHeroDefaultExample: Example = {
  title: "Default",
  description:
    "Imagens do meio mais próximas. Mova o mouse sobre a área para o parallax.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-950">
  <ParallaxHeroImages
    variant="default"
    images={[
      "https://picsum.photos/seed/ph-1/400/300",
      "https://picsum.photos/seed/ph-2/400/300",
      "https://picsum.photos/seed/ph-3/400/300",
      "https://picsum.photos/seed/ph-4/400/300",
      "https://picsum.photos/seed/ph-5/400/300",
      "https://picsum.photos/seed/ph-6/400/300",
    ]}
  />
  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
      Parallax Hero
    </h2>
    <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
      Mova o cursor — as imagens seguem com profundidade.
    </p>
  </div>
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-950">
      <ParallaxHeroImages variant="default" images={IMAGES} />
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
          Parallax Hero
        </h2>
        <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
          Mova o cursor — as imagens seguem com profundidade.
        </p>
      </div>
    </div>
  ),
}

const parallaxHeroEdgeFocusExample: Example = {
  title: "Edge Focus",
  description:
    "Imagens das bordas mais próximas — mapa de profundidade invertido.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-950">
  <ParallaxHeroImages
    variant="edge-focus"
    images={[
      "https://picsum.photos/seed/ph-1/400/300",
      "https://picsum.photos/seed/ph-2/400/300",
      "https://picsum.photos/seed/ph-3/400/300",
      "https://picsum.photos/seed/ph-4/400/300",
      "https://picsum.photos/seed/ph-5/400/300",
      "https://picsum.photos/seed/ph-6/400/300",
    ]}
  />
  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
      Edge Focus
    </h2>
    <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
      As bordas reagem mais ao movimento do mouse.
    </p>
  </div>
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-950">
      <ParallaxHeroImages variant="edge-focus" images={IMAGES} />
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
          Edge Focus
        </h2>
        <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
          As bordas reagem mais ao movimento do mouse.
        </p>
      </div>
    </div>
  ),
}

export const examplesParallaxHeroImages: Record<string, Example[]> = {
  "parallax-hero-images": [
    parallaxHeroDefaultExample,
    parallaxHeroEdgeFocusExample,
  ],
}
