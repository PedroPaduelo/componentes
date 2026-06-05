/**
 * Examples — Images Badge (Aceternity UI).
 *
 * Badge com ícone de pasta + texto que, no hover, faz até 3 imagens saírem
 * num leque animado (fan-out via translate/spread/rotation).
 *
 * Imagens via picsum.photos com seeds fixos (estáveis, sem 404, sem dep).
 * `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { ImagesBadge } from "@/components/ui/images-badge"

const IMAGES = [
  "https://picsum.photos/seed/badge-a/200/150",
  "https://picsum.photos/seed/badge-b/200/150",
  "https://picsum.photos/seed/badge-c/200/150",
]

const imagesBadgeDefaultExample: Example = {
  title: "Default",
  description: "Badge com 3 imagens; passe o mouse para o leque animado.",
  code: `<ImagesBadge
  text="3 imagens"
  images={[
    "https://picsum.photos/seed/badge-a/200/150",
    "https://picsum.photos/seed/badge-b/200/150",
    "https://picsum.photos/seed/badge-c/200/150",
  ]}
/>`,
  render: (
    <div className="flex min-h-[120px] items-center justify-center">
      <ImagesBadge text="3 imagens" images={IMAGES} />
    </div>
  ),
}

const imagesBadgeLargeExample: Example = {
  title: "Large",
  description: "Pasta e imagens ampliadas, com leque mais alto e espalhado.",
  code: `<ImagesBadge
  text="Galeria"
  images={[
    "https://picsum.photos/seed/badge-a/200/150",
    "https://picsum.photos/seed/badge-b/200/150",
    "https://picsum.photos/seed/badge-c/200/150",
  ]}
  folderSize={{ width: 48, height: 36 }}
  teaserImageSize={{ width: 40, height: 28 }}
  hoverImageSize={{ width: 140, height: 108 }}
  hoverTranslateY={-110}
  hoverSpread={50}
/>`,
  render: (
    <div className="flex min-h-[200px] items-center justify-center">
      <ImagesBadge
        text="Galeria"
        images={IMAGES}
        folderSize={{ width: 48, height: 36 }}
        teaserImageSize={{ width: 40, height: 28 }}
        hoverImageSize={{ width: 140, height: 108 }}
        hoverTranslateY={-110}
        hoverSpread={50}
      />
    </div>
  ),
}

const imagesBadgeCompactExample: Example = {
  title: "Compact",
  description: "Versão menor para uso inline em listas e metadados.",
  code: `<ImagesBadge
  text="Anexos"
  images={[
    "https://picsum.photos/seed/badge-a/200/150",
    "https://picsum.photos/seed/badge-b/200/150",
    "https://picsum.photos/seed/badge-c/200/150",
  ]}
  folderSize={{ width: 24, height: 18 }}
  teaserImageSize={{ width: 14, height: 10 }}
  hoverImageSize={{ width: 36, height: 24 }}
  hoverTranslateY={-28}
  hoverSpread={14}
/>`,
  render: (
    <div className="flex min-h-[120px] items-center justify-center">
      <ImagesBadge
        text="Anexos"
        images={IMAGES}
        folderSize={{ width: 24, height: 18 }}
        teaserImageSize={{ width: 14, height: 10 }}
        hoverImageSize={{ width: 36, height: 24 }}
        hoverTranslateY={-28}
        hoverSpread={14}
      />
    </div>
  ),
}

const imagesBadgeWideSpreadExample: Example = {
  title: "Wide Spread",
  description: "Leque mais aberto e com maior rotação entre as imagens.",
  code: `<ImagesBadge
  text="Coleção"
  images={[
    "https://picsum.photos/seed/badge-a/200/150",
    "https://picsum.photos/seed/badge-b/200/150",
    "https://picsum.photos/seed/badge-c/200/150",
  ]}
  hoverSpread={35}
  hoverRotation={20}
/>`,
  render: (
    <div className="flex min-h-[120px] items-center justify-center">
      <ImagesBadge
        text="Coleção"
        images={IMAGES}
        hoverSpread={35}
        hoverRotation={20}
      />
    </div>
  ),
}

export const examplesImagesBadge: Record<string, Example[]> = {
  "images-badge": [
    imagesBadgeDefaultExample,
    imagesBadgeLargeExample,
    imagesBadgeCompactExample,
    imagesBadgeWideSpreadExample,
  ],
}
