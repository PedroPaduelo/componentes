/**
 * Composição "Hero Gallery".
 *
 * Showcase coeso de uma galeria/portfólio montado APENAS com componentes do
 * registry da vitrine:
 * - Hero topo: `ParallaxHeroImages` (parallax dirigido pelo mouse) + heading.
 * - Destaques 3D: `CardContainer`/`CardBody`/`CardItem` (inclinam no hover).
 * - Scroll reveal: `ContainerScroll` (via demo, dirigido pela rolagem da página).
 * - Galeria parallax: `HeroParallax` (via demo, dirigido pela rolagem da página).
 * - Coleção: `ExpandableCards` (cards que expandem para um modal).
 *
 * Os sub-componentes scroll-driven (que usam `useScroll`/refs) vivem em
 * `hero-gallery-demo.tsx` para não disparar o lint
 * `react-refresh/only-export-components`.
 */

import { Button } from "@/components/ui/button"
import {
  CardBody,
  CardContainer,
  CardItem,
} from "@/components/ui/3d-card"
import { ExpandableCards } from "@/components/ui/expandable-cards"
import type { ExpandableCard } from "@/components/ui/expandable-cards-types"
import { ParallaxHeroImages } from "@/components/ui/parallax-hero-images"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FocusCards } from "@/components/ui/focus-cards"
import type { FocusCardItem } from "@/components/ui/focus-cards"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import type { Testimonial } from "@/components/ui/animated-testimonials-types"
import { ColourfulText } from "@/components/ui/colourful-text"

import {
  HeroGalleryContainerScroll,
  HeroGalleryParallax,
} from "./hero-gallery-demo"
import { HeroGalleryStats } from "./hero-gallery-stats"

const HERO_IMAGES = [
  "https://picsum.photos/seed/hg-hero-1/400/300",
  "https://picsum.photos/seed/hg-hero-2/400/300",
  "https://picsum.photos/seed/hg-hero-3/400/300",
  "https://picsum.photos/seed/hg-hero-4/400/300",
  "https://picsum.photos/seed/hg-hero-5/400/300",
  "https://picsum.photos/seed/hg-hero-6/400/300",
]

const FEATURED = [
  {
    title: "Aurora",
    blurb: "Uma paisagem de luzes em movimento capturada ao amanhecer.",
    seed: "hg-card-aurora",
  },
  {
    title: "Concreto",
    blurb: "Linhas e texturas brutalistas em tons monocromáticos.",
    seed: "hg-card-concrete",
  },
  {
    title: "Litoral",
    blurb: "O encontro entre o mar e a areia em uma manhã calma.",
    seed: "hg-card-coast",
  },
]

const collection: ExpandableCard[] = [
  {
    title: "Montanhas",
    description: "Coleção Alpina",
    src: "https://picsum.photos/seed/hg-coll-mountains/300/300",
    ctaText: "Ver",
    ctaLink: "#",
    content: () => (
      <p>
        Picos cobertos de neve fotografados ao longo de uma travessia de cinco
        dias pelos Alpes. A série explora a escala monumental da paisagem e a
        solidão luminosa das altitudes.
      </p>
    ),
  },
  {
    title: "Metrópole",
    description: "Coleção Urbana",
    src: "https://picsum.photos/seed/hg-coll-city/300/300",
    ctaText: "Ver",
    ctaLink: "#",
    content: () => (
      <p>
        Ensaios noturnos em grandes centros urbanos, com longa exposição para
        capturar os rastros de luz do tráfego e a vida que pulsa entre os
        arranha-céus.
      </p>
    ),
  },
  {
    title: "Deserto",
    description: "Coleção Árida",
    src: "https://picsum.photos/seed/hg-coll-desert/300/300",
    ctaText: "Ver",
    ctaLink: "#",
    content: () => (
      <p>
        Dunas e formações rochosas registradas na hora dourada, quando as
        sombras alongadas revelam a textura escultural do deserto.
      </p>
    ),
  },
  {
    title: "Floresta",
    description: "Coleção Verde",
    src: "https://picsum.photos/seed/hg-coll-forest/300/300",
    ctaText: "Ver",
    ctaLink: "#",
    content: () => (
      <p>
        Florestas temperadas envoltas em neblina, onde a luz difusa atravessa o
        dossel e desenha feixes suaves entre os troncos.
      </p>
    ),
  },
]

/** Categorias navegáveis — cada uma troca o conjunto de imagens do FocusCards. */
const CATEGORIES: { id: string; label: string; cards: FocusCardItem[] }[] = [
  {
    id: "natureza",
    label: "Natureza",
    cards: [
      { title: "Cordilheira ao amanhecer", src: "https://picsum.photos/seed/hg-nat-1/600/700" },
      { title: "Cascata na mata", src: "https://picsum.photos/seed/hg-nat-2/600/700" },
      { title: "Dunas douradas", src: "https://picsum.photos/seed/hg-nat-3/600/700" },
    ],
  },
  {
    id: "urbano",
    label: "Urbano",
    cards: [
      { title: "Skyline noturno", src: "https://picsum.photos/seed/hg-urb-1/600/700" },
      { title: "Metrô em movimento", src: "https://picsum.photos/seed/hg-urb-2/600/700" },
      { title: "Geometria de concreto", src: "https://picsum.photos/seed/hg-urb-3/600/700" },
    ],
  },
  {
    id: "retrato",
    label: "Retrato",
    cards: [
      { title: "Luz de janela", src: "https://picsum.photos/seed/hg-ret-1/600/700" },
      { title: "Olhar contra a luz", src: "https://picsum.photos/seed/hg-ret-2/600/700" },
      { title: "Silhueta urbana", src: "https://picsum.photos/seed/hg-ret-3/600/700" },
    ],
  },
]

/** Depoimentos de fotógrafos e clientes para o carrossel AnimatedTestimonials. */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "A galeria deu à minha série de paisagens uma apresentação que eu nunca consegui em portfólios tradicionais. O efeito 3D ao rolar é hipnótico.",
    name: "Helena Vasquez",
    designation: "Fotógrafa de paisagem",
    src: "https://picsum.photos/seed/hg-tt-helena/500/500",
  },
  {
    quote:
      "Migramos o acervo da agência inteira em uma tarde. A navegação por categorias deixou cada ensaio fácil de achar para os clientes.",
    name: "Rafael Monteiro",
    designation: "Diretor de arte",
    src: "https://picsum.photos/seed/hg-tt-rafael/500/500",
  },
  {
    quote:
      "O que mais me conquistou foi a fidelidade de cor no dark mode. As fotos noturnas finalmente respiram do jeito que eu editei.",
    name: "Camila Duarte",
    designation: "Fotógrafa de rua",
    src: "https://picsum.photos/seed/hg-tt-camila/500/500",
  },
]

export function HeroGallery() {
  return (
    <div className="flex flex-col">
      {/* ----------------------------------------------------------------- */}
      {/* Hero — Parallax Hero Images                                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative h-[460px] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <ParallaxHeroImages variant="default" images={HERO_IMAGES} />
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <span className="pointer-events-auto mb-5 inline-flex items-center rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur">
            Galeria interativa
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Hero Gallery
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Uma vitrine de imagens com profundidade, inclinação 3D e revelações
            ao rolar — tudo montado só com peças do registry.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#destaques">Explorar destaques</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#colecao">Ver coleção</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Stats / credenciais                                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b bg-background py-12">
        <div className="mx-auto max-w-6xl px-6">
          <HeroGalleryStats />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Destaques — 3D Cards                                              */}
      {/* ----------------------------------------------------------------- */}
      <section id="destaques" className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Destaques da semana
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Passe o mouse sobre cada cartão — ele inclina seguindo o cursor e
              os elementos flutuam em profundidades distintas.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {FEATURED.map((item) => (
              <CardContainer key={item.title} className="inter-var">
                <CardBody className="group/card relative h-auto w-[20rem] rounded-xl border border-border bg-card p-6 text-card-foreground">
                  <CardItem translateZ={50} className="text-xl font-bold">
                    {item.title}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ={60}
                    className="mt-2 max-w-sm text-sm text-muted-foreground"
                  >
                    {item.blurb}
                  </CardItem>
                  <CardItem translateZ={100} className="mt-4 w-full">
                    <img
                      src={`https://picsum.photos/seed/${item.seed}/600/400`}
                      height={400}
                      width={600}
                      className="h-52 w-full rounded-xl object-cover group-hover/card:shadow-xl"
                      alt={item.title}
                    />
                  </CardItem>
                  <div className="mt-6 flex items-center justify-between">
                    <CardItem
                      translateZ={20}
                      as="a"
                      href="#"
                      className="text-xs font-normal"
                    >
                      Ver série →
                    </CardItem>
                    <CardItem translateZ={20}>
                      <Button size="sm">Curtir</Button>
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Scroll reveal — Container Scroll Animation                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Imagem em destaque
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Role a página para revelar a foto principal: o card sai inclinado
              e vem pra frente com uma animação 3D dirigida pelo scroll.
            </p>
          </div>
          <HeroGalleryContainerScroll />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Categorias — Tabs + Focus Cards                                   */}
      {/* ----------------------------------------------------------------- */}
      <section id="categorias" className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Navegue por categoria
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Escolha um tema e foque em uma imagem — as demais desfocam para
              destacar a que está sob o cursor.
            </p>
          </div>
          <Tabs defaultValue="natureza" className="items-center">
            <TabsList className="mx-auto">
              {CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-10 w-full">
                <FocusCards cards={category.cards} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Galeria parallax — Hero Parallax                                  */}
      {/* ----------------------------------------------------------------- */}
      {/* Full-bleed: o HeroParallax precisa da largura total para as fileiras
          deslizarem horizontalmente e traz seu próprio header interno. */}
      <section className="overflow-hidden border-t bg-background">
        <HeroGalleryParallax />
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Coleção — Expandable Cards                                        */}
      {/* ----------------------------------------------------------------- */}
      <section id="colecao" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Coleções
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Clique em uma coleção para expandi-la em um modal — Escape ou
              clique fora para fechar.
            </p>
          </div>
          <ExpandableCards cards={collection} />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Depoimentos — Animated Testimonials                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Quem expõe por aqui
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Fotógrafos e estúdios que usam a galeria para apresentar seus
              ensaios.
            </p>
          </div>
          <AnimatedTestimonials testimonials={TESTIMONIALS} autoplay />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CTA final                                                         */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Mostre seu trabalho com{" "}
            <ColourfulText text="profundidade" />
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Suba seus ensaios e ganhe uma galeria interativa com parallax,
            inclinação 3D e revelações ao rolar — sem escrever uma linha de
            código.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#destaques">Começar agora</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#categorias">Ver categorias</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
