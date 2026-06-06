import { HeroSectionWithMousemove } from "@/components/ui/hero-section-with-mousemove"
import type { Example } from "@/data/examples"

const heroMousemoveBasic: Example = {
  title: "Básico",
  description:
    "Hero com elementos flutuantes que reagem ao movimento do cursor com profundidades distintas.",
  code: `<HeroSectionWithMousemove />`,
  render: <HeroSectionWithMousemove />,
}

const heroMousemoveCustom: Example = {
  title: "Conteúdo e itens customizados",
  description:
    "Título, descrição e itens flutuantes próprios — cada item com sua profundidade (depth) e posição.",
  code: `<HeroSectionWithMousemove
  title="Sua plataforma, em outra dimensão"
  description="Cada cartão se move proporcionalmente à profundidade que você definir."
  items={[
    {
      src: "https://picsum.photos/seed/custom-a/240/180",
      alt: "Estúdio criativo",
      depth: 50,
      position: "left-[8%] top-[16%]",
    },
    {
      src: "https://picsum.photos/seed/custom-b/220/160",
      alt: "Ambiente de trabalho",
      depth: 20,
      position: "right-[10%] bottom-[18%]",
    },
  ]}
/>`,
  render: (
    <HeroSectionWithMousemove
      title="Sua plataforma, em outra dimensão"
      description="Cada cartão se move proporcionalmente à profundidade que você definir."
      items={[
        {
          src: "https://picsum.photos/seed/custom-a/240/180",
          alt: "Estúdio criativo",
          depth: 50,
          position: "left-[8%] top-[16%]",
        },
        {
          src: "https://picsum.photos/seed/custom-b/220/160",
          alt: "Ambiente de trabalho",
          depth: 20,
          position: "right-[10%] bottom-[18%]",
        },
      ]}
    />
  ),
}

export const examplesHeroSectionWithMousemove: Record<string, Example[]> = {
  "hero-section-with-mousemove": [heroMousemoveBasic, heroMousemoveCustom],
}
