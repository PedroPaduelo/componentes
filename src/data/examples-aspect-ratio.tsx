import { AspectRatio } from "@/components/ui/aspect-ratio"
import type { Example } from "@/data/examples"

const aspectRatio169Example: Example = {
  title: "16:9",
  description: "Proporção widescreen para vídeos e imagens.",
  code: `<AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
  <img
    src="https://picsum.photos/seed/aspect-ratio/800/450"
    alt="16:9 placeholder"
    className="size-full rounded-lg object-cover"
  />
</AspectRatio>`,
  render: (
    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
      <img
        src="https://picsum.photos/seed/aspect-ratio/800/450"
        alt="16:9 placeholder"
        className="size-full rounded-lg object-cover"
      />
    </AspectRatio>
  ),
}

const aspectRatioSquareExample: Example = {
  title: "1:1",
  description: "Proporção quadrada para avatares e thumbnails.",
  code: `<AspectRatio ratio={1 / 1} className="bg-muted rounded-lg">
  <img
    src="https://picsum.photos/seed/square/400/400"
    alt="1:1 placeholder"
    className="size-full rounded-lg object-cover"
  />
</AspectRatio>`,
  render: (
    <AspectRatio ratio={1 / 1} className="bg-muted rounded-lg">
      <img
        src="https://picsum.photos/seed/square/400/400"
        alt="1:1 placeholder"
        className="size-full rounded-lg object-cover"
      />
    </AspectRatio>
  ),
}

export const examplesAspectRatio: Record<string, Example[]> = {
  "aspect-ratio": [aspectRatio169Example, aspectRatioSquareExample],
}
