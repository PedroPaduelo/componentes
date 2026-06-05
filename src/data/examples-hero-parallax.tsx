/**
 * Examples — Hero Parallax (Aceternity UI).
 *
 * O efeito é dirigido por `useScroll` apontando pro elemento raiz do
 * `HeroParallax` (que mantém a "pista" alta `h-[300vh]`) usando como `container`
 * o ref de uma área scrollável PRÓPRIA. Pra que o `scrollYProgress` evolua de
 * 0 → 1 dentro da página de detalhe, o `HeroParallaxDemo` envolve o componente
 * num container `h-[500px] overflow-y-auto` e passa o ref desse container via
 * `scrollRef`. Rolar DENTRO desse container dispara o parallax (rows transladam
 * em direções opostas + rotação/opacity do conjunto). NUNCA `min-h-screen` aqui
 * — isso estouraria o layout do card de detalhe.
 *
 * Este arquivo fica SÓ com constantes (`Example`). O componente de demo (que usa
 * hook/ref) vive em `examples-hero-parallax-demos.tsx` pra não disparar o lint
 * `react-refresh/only-export-components`. Thumbnails via `picsum.photos`. `code`
 * e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { HeroParallaxDemo } from "@/data/examples-hero-parallax-demos"

const heroParallaxBasicExample: Example = {
  title: "Básico",
  description:
    "Role a área abaixo: as 3 fileiras transladam horizontalmente em direções opostas e o conjunto rotaciona/esmaece suavemente (springs).",
  code: `const products = [
  { title: "Moonbeam", link: "#", thumbnail: "https://picsum.photos/seed/hp1/600/400" },
  // ...15 produtos (3 fileiras de 5)
]

function HeroParallaxDemo() {
  // Container scrollável próprio: rolar DENTRO dispara o parallax. O ref é
  // passado via \`scrollRef\` pro useScroll usar como \`container\` (não a window).
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[500px] w-full overflow-y-auto rounded-lg border border-border bg-background"
    >
      <HeroParallax products={products} scrollRef={scrollRef} />
    </div>
  )
}`,
  render: <HeroParallaxDemo />,
}

export const examplesHeroParallax: Record<string, Example[]> = {
  "hero-parallax": [heroParallaxBasicExample],
}
