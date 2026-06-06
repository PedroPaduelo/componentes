/**
 * Composição "Testimonials Wall" — mural de depoimentos coeso montado apenas
 * com componentes do registry da vitrine:
 *
 *  - CardStack + Highlight (card-stack): depoimentos rotativos empilhados no topo.
 *  - TooltipCard (tooltip-card): hover nos avatares revela info do autor.
 *  - ImagesBadge (images-badge): galeria de fotos da comunidade em leque animado.
 *  - HoverEffect (card-hover-effect): grid de mais depoimentos com fundo deslizante.
 *
 * Tudo importado do barrel, usando tokens shadcn (light/dark). Avatares e
 * imagens via picsum.photos com seeds fixos (estáveis, sem 404, sem dep nova).
 */

import {
  CardStack,
  Highlight,
  HoverEffect,
  ImagesBadge,
  TooltipCard,
  WorkExperienceComponent,
} from "@/components/ui"

type Author = {
  name: string
  handle: string
  role: string
  avatar: string
}

const AUTHORS: Author[] = [
  {
    name: "Manu Arora",
    handle: "@mannupaaji",
    role: "Senior Software Engineer",
    avatar: "https://picsum.photos/seed/avatar1/64/64",
  },
  {
    name: "Sofia Lima",
    handle: "@sofialima",
    role: "Product Designer",
    avatar: "https://picsum.photos/seed/avatar2/64/64",
  },
  {
    name: "Tyler Durden",
    handle: "@tyler",
    role: "Manager, Project Mayhem",
    avatar: "https://picsum.photos/seed/avatar3/64/64",
  },
  {
    name: "Aiko Tanaka",
    handle: "@aikot",
    role: "Frontend Lead",
    avatar: "https://picsum.photos/seed/avatar4/64/64",
  },
  {
    name: "Diego Souza",
    handle: "@dsouza",
    role: "Founder, Indie Labs",
    avatar: "https://picsum.photos/seed/avatar5/64/64",
  },
]

const COMMUNITY_IMAGES = [
  "https://picsum.photos/seed/wall-a/200/150",
  "https://picsum.photos/seed/wall-b/200/150",
  "https://picsum.photos/seed/wall-c/200/150",
]

const STACK_ITEMS = [
  {
    id: 0,
    name: "Manu Arora",
    designation: "Senior Software Engineer",
    content: (
      <p>
        These components are amazing,{" "}
        <Highlight>I want to use them</Highlight> in every project. The DX is a
        godsend.
      </p>
    ),
  },
  {
    id: 1,
    name: "Sofia Lima",
    designation: "Product Designer",
    content: (
      <p>
        Handoff ficou trivial. <Highlight>Copy, paste, ship.</Highlight> Os
        tokens já respeitam o tema do produto.
      </p>
    ),
  },
  {
    id: 2,
    name: "Tyler Durden",
    designation: "Manager, Project Mayhem",
    content: (
      <p>
        The first rule of building UI is{" "}
        <Highlight>don't reinvent the wheel</Highlight>. This catalog saved us
        weeks.
      </p>
    ),
  },
]

/** Card de testimonial usado no grid de HoverEffect, com avatar + tooltip. */
function authorTooltipContent(author: Author) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={author.avatar}
        alt={author.name}
        className="size-12 shrink-0 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{author.name}</span>
        <span className="text-xs text-muted-foreground">{author.role}</span>
      </div>
    </div>
  )
}

const GRID_ITEMS = [
  {
    title: "Sofia Lima",
    description:
      "Migramos o design system inteiro em uma sprint. A consistência entre light e dark foi o que mais me impressionou.",
    link: "https://example.com/sofia",
  },
  {
    title: "Aiko Tanaka",
    description:
      "As animações via motion/react são suaves e nunca atrapalham a acessibilidade. Virou padrão no nosso time.",
    link: "https://example.com/aiko",
  },
  {
    title: "Diego Souza",
    description:
      "Como indie founder, isso me deu velocidade de uma equipe inteira. Lancei a landing em um fim de semana.",
    link: "https://example.com/diego",
  },
  {
    title: "Manu Arora",
    description:
      "O grid de hover effect ficou idêntico ao que eu queria, sem precisar tocar em CSS. Recomendo demais.",
    link: "https://example.com/manu",
  },
  {
    title: "Tyler Durden",
    description:
      "Documentação clara e exemplos copiáveis. A curva de aprendizado é basicamente zero.",
    link: "https://example.com/tyler",
  },
  {
    title: "Sofia Lima",
    description:
      "Os componentes compõem entre si sem conflito de estilo. Montar telas inteiras virou brincadeira.",
    link: "https://example.com/sofia2",
  },
]

const EXPERIENCES = [
  {
    company: "Northwind",
    role: "Staff Frontend Engineer",
    period: "2023 — Presente",
    description:
      "Lidera o design system da empresa usando a vitrine como base de componentes.",
    technologies: ["React", "TypeScript", "Tailwind"],
    logo: "https://picsum.photos/seed/exp-northwind/64/64",
    stats: [
      { label: "Telas", value: "120+" },
      { label: "Adoção", value: "98%" },
    ],
  },
  {
    company: "Indie Labs",
    role: "Founder & Product Engineer",
    period: "2021 — 2023",
    description:
      "Lançou três produtos SaaS reaproveitando composições inteiras da vitrine.",
    technologies: ["Next.js", "Vite", "shadcn/ui"],
    logo: "https://picsum.photos/seed/exp-indie/64/64",
  },
  {
    company: "Mayhem Studio",
    role: "Frontend Developer",
    period: "2019 — 2021",
    description:
      "Construiu landing pages de alta conversão com os efeitos animados do catálogo.",
    technologies: ["React", "Framer Motion"],
    logo: "https://picsum.photos/seed/exp-mayhem/64/64",
  },
]

export function TestimonialsWall() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Heading da seção */}
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Depoimentos
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Amado por times que constroem rápido
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Veja o que engenheiros, designers e founders dizem sobre montar
          interfaces com a nossa vitrine de componentes.
        </p>
      </header>

      {/* Topo: pilha rotativa de depoimentos + galeria da comunidade */}
      <div className="mt-12 flex flex-col items-center justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex h-72 w-full items-center justify-center lg:w-auto lg:flex-1">
          <CardStack items={STACK_ITEMS} />
        </div>

        <div className="flex w-full flex-col items-center gap-6 lg:w-auto lg:flex-1">
          {/* Faixa de avatares com tooltip do autor */}
          <div className="flex items-center justify-center">
            <div className="flex -space-x-3">
              {AUTHORS.map((author) => (
                <TooltipCard
                  key={author.handle}
                  content={authorTooltipContent(author)}
                >
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="size-12 cursor-pointer rounded-full border-2 border-background object-cover ring-1 ring-border transition-transform hover:z-10 hover:-translate-y-1"
                  />
                </TooltipCard>
              ))}
            </div>
          </div>
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Junte-se a{" "}
            <span className="font-medium text-foreground">centenas de times</span>{" "}
            que já compartilharam suas histórias na nossa comunidade.
          </p>

          {/* Galeria de fotos da comunidade */}
          <ImagesBadge
            text="Comunidade"
            images={COMMUNITY_IMAGES}
            folderSize={{ width: 44, height: 33 }}
            teaserImageSize={{ width: 36, height: 26 }}
            hoverImageSize={{ width: 120, height: 92 }}
            hoverTranslateY={-100}
            hoverSpread={44}
          />
        </div>
      </div>

      {/* Grid de mais depoimentos com efeito de hover deslizante */}
      <div className="mt-14">
        <h3 className="text-center text-xl font-semibold tracking-tight text-foreground">
          Mais histórias da comunidade
        </h3>
        <HoverEffect items={GRID_ITEMS} />
      </div>

      {/* Trajetória / Experiência da comunidade */}
      <div className="mx-auto mt-16 max-w-2xl">
        <h3 className="text-center text-xl font-semibold tracking-tight text-foreground">
          Trajetória de quem usa a vitrine
        </h3>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          A experiência de um dos nossos usuários mais ativos ao longo dos anos.
        </p>
        <div className="mt-8">
          <WorkExperienceComponent experiences={EXPERIENCES} variant="timeline" />
        </div>
      </div>
    </section>
  )
}
