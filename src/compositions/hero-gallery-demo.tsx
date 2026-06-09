/**
 * Demos com hooks/refs da composição "Hero Gallery".
 *
 * Os componentes scroll-driven do registry (`HeroParallax`, `ContainerScroll`)
 * são dirigidos pela ROLAGEM DA PÁGINA (rolagem da janela) — o jeito natural do
 * efeito Aceternity. Por isso NÃO passamos `scrollRef`: cada um observa o
 * próprio elemento entrando/saindo da viewport conforme o usuário desce a
 * página, e a animação 3D evolui junto com o scroll.
 *
 * Esses sub-componentes vivem aqui (e não inline no `hero-gallery.tsx`) para
 * manter o arquivo de composição com um único export de componente — evitando
 * ruído no Fast Refresh.
 */

import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import { HeroParallax } from "@/components/ui/hero-parallax"
import type { Product } from "@/components/ui/hero-parallax-types"

const PRODUCTS: Product[] = Array.from({ length: 15 }, (_, i) => ({
  title: `Gallery ${i + 1}`,
  link: "#",
  thumbnail: `https://picsum.photos/seed/hg-parallax-${i + 1}/600/400`,
}))

/**
 * Hero Parallax dirigido pela rolagem da página. Conforme o usuário desce, as
 * três fileiras de imagens deslizam em direções opostas e o conjunto se
 * "abre" (rotateX/rotateZ/translateY) com profundidade.
 */
export function HeroGalleryParallax() {
  return (
    <HeroParallax
      products={PRODUCTS}
      heading={
        <>
          A galeria <br /> em movimento
        </>
      }
      description="Continue descendo a página: as três fileiras deslizam em direções opostas, com profundidade e leve rotação 3D."
    />
  )
}

/**
 * Container Scroll dirigido pela rolagem da página. O card começa deitado
 * (rotateX 20°) ao entrar por baixo e ENDIREITA até ficar de frente (0°) quando
 * alcança o centro da viewport — a imagem "vem para a frente" conforme o scroll.
 *
 * O `offset` calibra essa faixa: progresso 0 quando o topo do card encosta na
 * base da tela; progresso 1 quando o centro do card alcança o centro da tela.
 */
export function HeroGalleryContainerScroll() {
  return (
    <ContainerScroll
      offset={["start end", "center center"]}
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
  )
}
