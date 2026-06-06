import type { Example } from "./examples"

const compareLandscape: Example = {
  title: "Paisagem",
  description:
    "Comparação de duas fotos de paisagem com slider arrastável (drag).",
  code: `<Compare
  firstImage="https://picsum.photos/seed/compare-before/800/800"
  secondImage="https://picsum.photos/seed/compare-after/800/800"
  slideMode="drag"
  className="rounded-2xl"
/>`,
  render: (
    <div className="w-full max-w-md mx-auto">
      <Compare
        firstImage="https://picsum.photos/seed/compare-before/800/800"
        secondImage="https://picsum.photos/seed/compare-after/800/800"
        slideMode="drag"
        className="rounded-2xl"
      />
    </div>
  ),
}

const compareHover: Example = {
  title: "Hover mode",
  description:
    "Slider segue o mouse automaticamente ao passar sobre a imagem.",
  code: `<Compare
  firstImage="https://picsum.photos/seed/compare-hover-1/800/800"
  secondImage="https://picsum.photos/seed/compare-hover-2/800/800"
  slideMode="hover"
  initialSliderPercentage={30}
  className="rounded-2xl"
/>`,
  render: (
    <div className="w-full max-w-md mx-auto">
      <Compare
        firstImage="https://picsum.photos/seed/compare-hover-1/800/800"
        secondImage="https://picsum.photos/seed/compare-hover-2/800/800"
        slideMode="hover"
        initialSliderPercentage={30}
        className="rounded-2xl"
      />
    </div>
  ),
}

import { Compare } from "@/components/ui/compare"

export const examplesCompare: Record<string, Example[]> = {
  compare: [compareLandscape, compareHover],
}
