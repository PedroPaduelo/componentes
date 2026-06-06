import * as React from "react"
import { Carousel, AppleCard } from "@/components/ui/apple-cards-carousel"

type Example = {
  title: string
  description?: string
  code: string
  render: React.ReactNode
}

const cards = [
  {
    src: "https://picsum.photos/seed/apple-cards-1/800/600",
    title: "Design System",
    category: "UI/UX",
    content: (
      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <p>
          Um design system é um conjunto de componentes reutilizáveis, guias e
          padrões que definem a identidade visual de um produto. Ele garante
          consistência em todas as telas e interações.
        </p>
        <p>
          Ao centralizar tokens de cor, tipografia e espaçamento, equipes de
          design e desenvolvimento conseguem iterar mais rápido sem sacrificar
          qualidade.
        </p>
        <img
          src="https://picsum.photos/seed/apple-cards-modal-1/600/400"
          alt="Design system overview"
          className="w-full rounded-xl object-cover"
        />
      </div>
    ),
  },
  {
    src: "https://picsum.photos/seed/apple-cards-2/800/600",
    title: "Motion & Animation",
    category: "Frontend",
    content: (
      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <p>
          Animações bem projetadas guiam o usuário, fornecem feedback e tornam a
          experiência mais fluida. A biblioteca motion/react permite criar
          transições declarativas com layoutId.
        </p>
        <p>
          O efeito de expansão de cards (como neste carrossel) usa layoutId para
          animar suavemente entre o card compacto e o modal fullscreen.
        </p>
        <img
          src="https://picsum.photos/seed/apple-cards-modal-2/600/400"
          alt="Animation example"
          className="w-full rounded-xl object-cover"
        />
      </div>
    ),
  },
  {
    src: "https://picsum.photos/seed/apple-cards-3/800/600",
    title: "Acessibilidade",
    category: "Inclusão",
    content: (
      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <p>
          Construir interfaces acessíveis não é opcional. Significa garantir que
          teclado, leitores de tela e outras tecnologias assistivas funcionem
          perfeitamente.
        </p>
        <p>
          Este carrossel suporta fechamento por Escape, clique fora do modal e
          botão X — três formas de sair que cobrem diferentes necessidades.
        </p>
      </div>
    ),
  },
  {
    src: "https://picsum.photos/seed/apple-cards-4/800/600",
    title: "Performance Web",
    category: "Engenharia",
    content: (
      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <p>
          Performance é UX. Cada milisegundo conta: lazy loading de imagens,
          code splitting por rota e virtualização de listas são técnicas
          essenciais.
        </p>
        <p>
          O BlurImage deste carrossel usa loading=&quot;lazy&quot; e um estado
          de blur que transiciona suavemente quando a imagem carrega.
        </p>
        <img
          src="https://picsum.photos/seed/apple-cards-modal-4/600/400"
          alt="Performance metrics"
          className="w-full rounded-xl object-cover"
        />
      </div>
    ),
  },
  {
    src: "https://picsum.photos/seed/apple-cards-5/800/600",
    title: "Dark Mode",
    category: "Theming",
    content: (
      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <p>
          Dark mode não é só inverter cores. Requer ajuste de contraste,
          saturação e elevação de superfícies para manter a hierarquia visual
          legível.
        </p>
        <p>
          Os cards deste carrossel usam bg-gray-100 no light e dark:bg-neutral-900
          no dark, enquanto o modal usa bg-white dark:bg-neutral-900.
        </p>
      </div>
    ),
  },
]

const basicExample: Example = {
  title: "Básico",
  description:
    "Carrossel horizontal estilo Apple com 5 cards que expandem em modal via layoutId. Navegação por setas e scroll.",
  code: `<Carousel
  items={cards.map((card, i) => (
    <AppleCard
      key={i}
      card={card}
      index={i}
      layout
    />
  ))}
/>`,
  render: (
    <div className="w-full">
      <Carousel
        items={cards.map((card, i) => (
          <AppleCard
            key={i}
            card={card}
            index={i}
            layout
          />
        ))}
      />
    </div>
  ),
}

const noLayoutExample: Example = {
  title: "Sem layoutId",
  description:
    "Mesmo carrossel sem animação de expansão compartilhada (layoutId desligado). O modal abre sem transição de layout.",
  code: `<Carousel
  items={cards.map((card, i) => (
    <AppleCard
      key={i}
      card={card}
      index={i}
      layout={false}
    />
  ))}
/>`,
  render: (
    <div className="w-full">
      <Carousel
        items={cards.map((card, i) => (
          <AppleCard
            key={i}
            card={card}
            index={i}
            layout={false}
          />
        ))}
      />
    </div>
  ),
}

export const examplesAppleCardsCarousel: Record<string, Example[]> = {
  "apple-cards-carousel": [basicExample, noLayoutExample],
}
