/**
 * Demos com hooks/refs da composição "Hero Gallery".
 *
 * Os componentes scroll-driven do registry (`HeroParallax`, `ContainerScroll`)
 * usam `useScroll({ container })` apontando para uma área scrollável PRÓPRIA.
 * Por isso precisam de um `useRef` + wrapper `overflow-y-auto`, passando o ref
 * via `scrollRef`. Esses sub-componentes (que usam hooks) vivem aqui — um
 * arquivo com export ÚNICO de componente por export — para não disparar o lint
 * `react-refresh/only-export-components` no `hero-gallery.tsx`, que também
 * exporta a função de composição.
 */

import * as React from "react"

import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import { HeroParallax } from "@/components/ui/hero-parallax"
import type { Product } from "@/components/ui/hero-parallax-types"

const PRODUCTS: Product[] = Array.from({ length: 15 }, (_, i) => ({
  title: `Gallery ${i + 1}`,
  link: "#",
  thumbnail: `https://picsum.photos/seed/hg-parallax-${i + 1}/600/400`,
}))

/**
 * Hero Parallax dentro de uma área scrollável própria. Rolar DENTRO do
 * container dispara o efeito de parallax das 3 fileiras.
 */
export function HeroGalleryParallax() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[520px] w-full overflow-y-auto rounded-xl border border-border bg-background"
    >
      <HeroParallax
        products={PRODUCTS}
        scrollRef={scrollRef}
        heading={
          <>
            A galeria <br /> em movimento
          </>
        }
        description="Role esta área para ver as três fileiras de imagens deslizarem em direções opostas com profundidade."
      />
    </div>
  )
}

/**
 * Container Scroll dentro de uma área scrollável própria. Rolar revela o card
 * 3D rotacionando (rotateX), escalando e o título subindo.
 */
export function HeroGalleryContainerScroll() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[520px] w-full overflow-y-auto rounded-xl border border-border bg-background"
    >
      <div className="flex min-h-[150vh] flex-col">
        <ContainerScroll
          scrollRef={scrollRef}
          titleComponent={
            <h2 className="text-2xl font-semibold text-foreground">
              Role para revelar <br />
              <span className="mt-1 block text-4xl leading-none font-bold md:text-[4.5rem]">
                A imagem de destaque
              </span>
            </h2>
          }
        >
          <img
            src="https://picsum.photos/seed/hg-scroll/1400/720"
            alt="Destaque da galeria"
            className="mx-auto h-full w-full rounded-2xl object-cover object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
    </div>
  )
}
