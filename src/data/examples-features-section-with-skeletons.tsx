import {
  FeaturesSectionWithSkeletons,
  SkeletonBars,
  SkeletonImageGrid,
  SkeletonRipple,
  type FeatureItem,
} from "@/components/ui/features-section-with-skeletons"
import type { Example } from "@/data/examples"

const GALLERY_IMAGES = [
  "https://picsum.photos/seed/feat-1/300/300",
  "https://picsum.photos/seed/feat-2/300/300",
  "https://picsum.photos/seed/feat-3/300/300",
  "https://picsum.photos/seed/feat-4/300/300",
]

const FEATURES: FeatureItem[] = [
  {
    title: "Captura visual ágil",
    description:
      "Organize referências e mockups em uma grade interativa — passe o mouse para destacar cada peça.",
    skeleton: <SkeletonImageGrid images={GALLERY_IMAGES} />,
    className:
      "col-span-1 lg:col-span-4 border-b border-border lg:border-r",
  },
  {
    title: "Analytics em tempo real",
    description:
      "Acompanhe métricas vivas com barras que respiram conforme os dados chegam.",
    skeleton: <SkeletonBars />,
    className: "col-span-1 lg:col-span-2 border-b border-border",
  },
  {
    title: "Alcance global",
    description:
      "Distribua para o mundo todo — sinal pulsante representando sua rede de borda.",
    skeleton: <SkeletonRipple />,
    className: "col-span-1 lg:col-span-3 lg:border-r border-border",
  },
  {
    title: "Pipeline de entrega",
    description:
      "Da ideia ao deploy com fluxo contínuo e feedback visual instantâneo.",
    skeleton: <SkeletonBars />,
    className: "col-span-1 lg:col-span-3",
  },
]

const featuresSectionBasic: Example = {
  title: "Seção de features (bento)",
  description:
    "Grade bento responsiva (lg:grid-cols-6) com cards de feature; cada card recebe um skeleton animado via motion/react como preview. As classes de span em className controlam o layout: aqui temos 4 cards somando 6 colunas por linha.",
  code: `<FeaturesSectionWithSkeletons
  heading="Tudo que sua equipe precisa"
  subheading="Da ideia à entrega, uma plataforma completa."
  features={[
    {
      title: "Captura visual ágil",
      description: "Organize referências e mockups...",
      skeleton: <SkeletonImageGrid images={GALLERY_IMAGES} />,
      className: "col-span-1 lg:col-span-4 border-b border-border lg:border-r",
    },
    {
      title: "Analytics em tempo real",
      description: "Acompanhe métricas vivas...",
      skeleton: <SkeletonBars />,
      className: "col-span-1 lg:col-span-2 border-b border-border",
    },
    {
      title: "Alcance global",
      description: "Distribua para o mundo todo...",
      skeleton: <SkeletonRipple />,
      className: "col-span-1 lg:col-span-3 lg:border-r border-border",
    },
    {
      title: "Pipeline de entrega",
      description: "Da ideia ao deploy...",
      skeleton: <SkeletonBars />,
      className: "col-span-1 lg:col-span-3",
    },
  ]}
/>`,
  render: (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <FeaturesSectionWithSkeletons features={FEATURES} />
    </div>
  ),
}

const featuresSectionCompact: Example = {
  title: "Duas features lado a lado",
  description:
    "Versão enxuta com 2 cards (cada um ocupando metade do grid) e cabeçalho customizado via props heading/subheading. Ideal para destacar poucos diferenciais.",
  code: `<FeaturesSectionWithSkeletons
  heading="Construído para velocidade"
  subheading="Menos fricção, mais entrega."
  features={[
    {
      title: "Insights instantâneos",
      description: "Dados que se atualizam enquanto você observa.",
      skeleton: <SkeletonBars />,
      className: "col-span-1 lg:col-span-3 lg:border-r border-border",
    },
    {
      title: "Distribuição global",
      description: "Sua aplicação perto de cada usuário.",
      skeleton: <SkeletonRipple />,
      className: "col-span-1 lg:col-span-3",
    },
  ]}
/>`,
  render: (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <FeaturesSectionWithSkeletons
        heading="Construído para velocidade"
        subheading="Menos fricção, mais entrega."
        features={[
          {
            title: "Insights instantâneos",
            description: "Dados que se atualizam enquanto você observa.",
            skeleton: <SkeletonBars />,
            className: "col-span-1 lg:col-span-3 lg:border-r border-border",
          },
          {
            title: "Distribuição global",
            description: "Sua aplicação perto de cada usuário.",
            skeleton: <SkeletonRipple />,
            className: "col-span-1 lg:col-span-3",
          },
        ]}
      />
    </div>
  ),
}

export const examplesFeaturesSectionWithSkeletons: Record<string, Example[]> = {
  "features-section-with-skeletons": [
    featuresSectionBasic,
    featuresSectionCompact,
  ],
}
