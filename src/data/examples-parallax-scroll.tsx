import { ParallaxScroll } from "@/components/ui/parallax-scroll"
import type { Example } from "@/data/examples"

const PARALLAX_IMAGES = [
  "https://picsum.photos/seed/parallax-1/400/400",
  "https://picsum.photos/seed/parallax-2/400/400",
  "https://picsum.photos/seed/parallax-3/400/400",
  "https://picsum.photos/seed/parallax-4/400/400",
  "https://picsum.photos/seed/parallax-5/400/400",
  "https://picsum.photos/seed/parallax-6/400/400",
  "https://picsum.photos/seed/parallax-7/400/400",
  "https://picsum.photos/seed/parallax-8/400/400",
  "https://picsum.photos/seed/parallax-9/400/400",
]

const parallaxScrollBasic: Example = {
  title: "Galeria com parallax",
  description:
    "A própria área (altura fixa de 40rem com overflow-y-auto) é rolável. Ao rolar, as 3 colunas se movem em velocidades e direções diferentes — as laterais sobem (-200px) e a do meio desce (+200px) — gerando o efeito de profundidade. Passe as URLs via prop images.",
  code: `<ParallaxScroll
  images={[
    "https://picsum.photos/seed/parallax-1/400/400",
    "https://picsum.photos/seed/parallax-2/400/400",
    "https://picsum.photos/seed/parallax-3/400/400",
    "https://picsum.photos/seed/parallax-4/400/400",
    "https://picsum.photos/seed/parallax-5/400/400",
    "https://picsum.photos/seed/parallax-6/400/400",
    "https://picsum.photos/seed/parallax-7/400/400",
    "https://picsum.photos/seed/parallax-8/400/400",
    "https://picsum.photos/seed/parallax-9/400/400",
  ]}
/>`,
  render: (
    <div className="w-full rounded-lg border border-border bg-background">
      <ParallaxScroll images={PARALLAX_IMAGES} />
    </div>
  ),
}

const parallaxScrollCompact: Example = {
  title: "Altura customizada",
  description:
    "A prop className mescla com as classes internas via cn(), então dá pra sobrescrever a altura da área rolável (aqui h-[28rem]). Quanto menor a área, mais cedo o parallax engata ao rolar.",
  code: `<ParallaxScroll
  className="h-[28rem]"
  images={[
    "https://picsum.photos/seed/parallax-1/400/400",
    "https://picsum.photos/seed/parallax-2/400/400",
    "https://picsum.photos/seed/parallax-3/400/400",
    "https://picsum.photos/seed/parallax-4/400/400",
    "https://picsum.photos/seed/parallax-5/400/400",
    "https://picsum.photos/seed/parallax-6/400/400",
  ]}
/>`,
  render: (
    <div className="w-full rounded-lg border border-border bg-background">
      <ParallaxScroll
        className="h-[28rem]"
        images={PARALLAX_IMAGES.slice(0, 6)}
      />
    </div>
  ),
}

export const examplesParallaxScroll: Record<string, Example[]> = {
  "parallax-scroll": [parallaxScrollBasic, parallaxScrollCompact],
}
