import { FocusCards } from "@/components/ui/focus-cards"
import type { Example } from "@/data/examples"

const cards = [
  {
    title: "Forest Adventure",
    src: "https://picsum.photos/seed/focus-forest/600/400",
  },
  {
    title: "Coastal Sunrise",
    src: "https://picsum.photos/seed/focus-coast/600/400",
  },
  {
    title: "Urban Exploration",
    src: "https://picsum.photos/seed/focus-urban/600/400",
  },
  {
    title: "Mountain Peaks",
    src: "https://picsum.photos/seed/focus-mountain/600/400",
  },
  {
    title: "Desert Dunes",
    src: "https://picsum.photos/seed/focus-desert/600/400",
  },
  {
    title: "Night Sky",
    src: "https://picsum.photos/seed/focus-night/600/400",
  },
]

const focusCardsExample: Example = {
  title: "Galeria com foco reverso",
  description:
    "Grid de 6 cards de imagem. Ao passar o mouse sobre um card, os demais ganham blur leve e scale reduzido, destacando o item hovered.",
  code: `<FocusCards
  cards={[
    { title: "Forest Adventure", src: "https://picsum.photos/seed/focus-forest/600/400" },
    { title: "Coastal Sunrise", src: "https://picsum.photos/seed/focus-coast/600/400" },
    { title: "Urban Exploration", src: "https://picsum.photos/seed/focus-urban/600/400" },
    { title: "Mountain Peaks", src: "https://picsum.photos/seed/focus-mountain/600/400" },
    { title: "Desert Dunes", src: "https://picsum.photos/seed/focus-desert/600/400" },
    { title: "Night Sky", src: "https://picsum.photos/seed/focus-night/600/400" },
  ]}
/>`,
  render: (
    <div className="w-full">
      <FocusCards cards={cards} />
    </div>
  ),
}

const focusCardsThree: Example = {
  title: "3 cards minimal",
  description:
    "Versão compacta com 3 cards apenas, ideal para seções de destaque.",
  code: `<FocusCards
  cards={[
    { title: "Forest Adventure", src: "https://picsum.photos/seed/focus-forest/600/400" },
    { title: "Coastal Sunrise", src: "https://picsum.photos/seed/focus-coast/600/400" },
    { title: "Urban Exploration", src: "https://picsum.photos/seed/focus-urban/600/400" },
  ]}
/>`,
  render: (
    <div className="w-full">
      <FocusCards cards={cards.slice(0, 3)} />
    </div>
  ),
}

export const examplesFocusCards: Record<string, Example[]> = {
  "focus-cards": [focusCardsExample, focusCardsThree],
}
