/**
 * Demos do example Hero Parallax — componentes (com hooks/ref).
 *
 * Separado de `examples-hero-parallax.tsx` (que fica só com constantes) pra o
 * lint `react-refresh/only-export-components` não reclamar de arquivo que
 * exporta componente + constante juntos.
 */

import * as React from "react"

import { HeroParallax } from "@/components/ui/hero-parallax"

const heroParallaxProducts = [
  { title: "Moonbeam", link: "#", thumbnail: "https://picsum.photos/seed/hp1/600/400" },
  { title: "Cursor", link: "#", thumbnail: "https://picsum.photos/seed/hp2/600/400" },
  { title: "Rogue", link: "#", thumbnail: "https://picsum.photos/seed/hp3/600/400" },
  { title: "Editorially", link: "#", thumbnail: "https://picsum.photos/seed/hp4/600/400" },
  { title: "Editrix AI", link: "#", thumbnail: "https://picsum.photos/seed/hp5/600/400" },
  { title: "Pixel Perfect", link: "#", thumbnail: "https://picsum.photos/seed/hp6/600/400" },
  { title: "Algochurn", link: "#", thumbnail: "https://picsum.photos/seed/hp7/600/400" },
  { title: "Aceternity UI", link: "#", thumbnail: "https://picsum.photos/seed/hp8/600/400" },
  { title: "Tailwind Master Kit", link: "#", thumbnail: "https://picsum.photos/seed/hp9/600/400" },
  { title: "SmartBridge", link: "#", thumbnail: "https://picsum.photos/seed/hp10/600/400" },
  { title: "Renderwork Studio", link: "#", thumbnail: "https://picsum.photos/seed/hp11/600/400" },
  { title: "Creme Digital", link: "#", thumbnail: "https://picsum.photos/seed/hp12/600/400" },
  { title: "Golden Bells Academy", link: "#", thumbnail: "https://picsum.photos/seed/hp13/600/400" },
  { title: "Invoker Labs", link: "#", thumbnail: "https://picsum.photos/seed/hp14/600/400" },
  { title: "E Free Invoice", link: "#", thumbnail: "https://picsum.photos/seed/hp15/600/400" },
]

/**
 * O container scrollável (`h-[500px] overflow-y-auto`) é o `container` do
 * useScroll do HeroParallax — passamos o ref via `scrollRef`. Rolar DENTRO dele
 * dispara o parallax sem depender da rolagem da janela. Altura contida em 500px
 * pra não estourar o layout do card de detalhe.
 */
export function HeroParallaxDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[500px] w-full overflow-y-auto rounded-lg border border-border bg-background"
    >
      <HeroParallax products={heroParallaxProducts} scrollRef={scrollRef} />
    </div>
  )
}
