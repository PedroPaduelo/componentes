import { Bookmark, Clipboard, FileText, Sparkles, Table2 } from "lucide-react"

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"

import type { Example } from "@/data/examples"

const skeleton = (
  <div className="flex h-full min-h-24 w-full flex-1 rounded-xl bg-gradient-to-br from-muted/60 to-muted dark:from-muted/30 dark:to-muted/10" />
)

const skeletonImage = (seed: string) => (
  <div className="flex h-full min-h-24 w-full flex-1 overflow-hidden rounded-xl">
    <img
      src={`https://picsum.photos/seed/${seed}/600/300`}
      alt=""
      className="h-full w-full object-cover transition duration-300 group-hover/bento:scale-105"
    />
  </div>
)

const bentoItems = [
  {
    title: "Padrão de conexão",
    description: "Descubra as conexões secretas do universo.",
    header: skeletonImage("bento-connect"),
    icon: <Clipboard className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "A busca pela perfeição",
    description: "A busca interminável por perfeição leva ao progresso.",
    header: skeleton,
    icon: <FileText className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "A arte do design",
    description: "Descubra a beleza da transformação por meio do design.",
    header: skeletonImage("bento-design"),
    icon: <Sparkles className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "O poder da comunicação",
    description: "Entenda o impacto de uma comunicação eficaz na vida.",
    header: skeleton,
    icon: <Table2 className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "A alegria da exploração",
    description: "Sinta a emoção de explorar o desconhecido.",
    header: skeletonImage("bento-explore"),
    icon: <Bookmark className="h-4 w-4 text-muted-foreground" />,
  },
]

const bentoClassicExample: Example = {
  title: "Grid bento clássico",
  description:
    "Layout assimétrico com cards de tamanhos variados, cabeçalhos e ícones.",
  code: `<BentoGrid>
  {items.map((item, i) => (
    <BentoGridItem
      key={i}
      title={item.title}
      description={item.description}
      header={item.header}
      icon={item.icon}
      className={i === 0 || i === 3 ? "md:col-span-2" : ""}
    />
  ))}
</BentoGrid>`,
  render: (
    <div className="w-full">
      <BentoGrid>
        {bentoItems.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            icon={item.icon}
            className={i === 0 || i === 3 ? "md:col-span-2" : ""}
          />
        ))}
      </BentoGrid>
    </div>
  ),
}

const bentoSimpleExample: Example = {
  title: "Grid simétrico",
  description: "Três cards de igual tamanho, ideal para destaques de produto.",
  code: `<BentoGrid className="md:auto-rows-[14rem]">
  <BentoGridItem
    title="Rápido"
    description="Performance otimizada de ponta a ponta."
    header={<Skeleton />}
    icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
  />
  <BentoGridItem
    title="Acessível"
    description="Componentes prontos seguindo boas práticas."
    header={<Skeleton />}
    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
  />
  <BentoGridItem
    title="Customizável"
    description="Estilize com Tailwind e tokens do tema."
    header={<Skeleton />}
    icon={<Bookmark className="h-4 w-4 text-muted-foreground" />}
  />
</BentoGrid>`,
  render: (
    <div className="w-full">
      <BentoGrid className="md:auto-rows-[14rem]">
        <BentoGridItem
          title="Rápido"
          description="Performance otimizada de ponta a ponta."
          header={skeleton}
          icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
        />
        <BentoGridItem
          title="Acessível"
          description="Componentes prontos seguindo boas práticas."
          header={skeleton}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <BentoGridItem
          title="Customizável"
          description="Estilize com Tailwind e tokens do tema."
          header={skeleton}
          icon={<Bookmark className="h-4 w-4 text-muted-foreground" />}
        />
      </BentoGrid>
    </div>
  ),
}

export const examplesBentoGrid: Record<string, Example[]> = {
  "bento-grid": [bentoClassicExample, bentoSimpleExample],
}
