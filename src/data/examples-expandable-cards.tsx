import { ExpandableCards } from "@/components/ui/expandable-cards"
import type { ExpandableCard } from "@/components/ui/expandable-cards-types"
import type { Example } from "@/data/examples"

const cards: ExpandableCard[] = [
  {
    title: "Lana Del Rey",
    description: "Summertime Sadness",
    src: "https://picsum.photos/seed/lana/300/300",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => (
      <p>
        Lana Del Rey, an iconic American singer-songwriter, is celebrated for
        her melancholic and cinematic music style. Born Elizabeth Woolridge
        Grant, she has captivated audiences with her haunting voice and
        introspective lyrics.
      </p>
    ),
  },
  {
    title: "Babbu Maan",
    description: "Mitran Di Chhatri",
    src: "https://picsum.photos/seed/babbu/300/300",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => (
      <p>
        Babbu Maan, a legendary Punjabi singer, is renowned for his soulful
        voice and profound lyrics that resonate deeply with his audience. Born
        in the village of Khant Maanpur, he has become a cultural icon.
      </p>
    ),
  },
  {
    title: "Metallica",
    description: "For Whom the Bell Tolls",
    src: "https://picsum.photos/seed/metallica/300/300",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => (
      <p>
        Metallica, an iconic American heavy metal band, is renowned for their
        powerful sound and intense performances that resonate deeply with their
        audience. Formed in Los Angeles, they have become a cultural force.
      </p>
    ),
  },
  {
    title: "Lord Huron",
    description: "The Night We Met",
    src: "https://picsum.photos/seed/huron/300/300",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => (
      <p>
        Lord Huron, an indie folk band, is renowned for their atmospheric and
        cinematic sound, captivating audiences with their evocative
        storytelling and immersive musical landscapes.
      </p>
    ),
  },
]

const expandableCardsBasicExample: Example = {
  title: "Básico",
  description:
    "Lista de cards que expandem para um modal centralizado fullscreen via shared layout. Clique num card para abrir; Escape ou clique fora para fechar.",
  code: `import { ExpandableCards } from "@/components/ui/expandable-cards"
import type { ExpandableCard } from "@/components/ui/expandable-cards-types"

const cards: ExpandableCard[] = [
  {
    title: "Lana Del Rey",
    description: "Summertime Sadness",
    src: "https://picsum.photos/seed/lana/300/300",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => (
      <p>
        Lana Del Rey, an iconic American singer-songwriter, is celebrated for
        her melancholic and cinematic music style.
      </p>
    ),
  },
  // ...mais cards
]

<ExpandableCards cards={cards} />`,
  render: (
    <div className="w-full max-w-2xl mx-auto">
      <ExpandableCards cards={cards} />
    </div>
  ),
}

export const examplesExpandableCards: Record<string, Example[]> = {
  "expandable-cards": [expandableCardsBasicExample],
}
