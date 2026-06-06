import type { Example } from "./examples"
import { ThreeDMarquee } from "@/components/ui/3d-marquee"

/**
 * 24 imagens do picsum (6 por coluna × 4 colunas) — variedade visual
 * garantida pelos seeds únicos.
 */
const baseImages = Array.from(
  { length: 24 },
  (_, i) => `https://picsum.photos/seed/3d-marquee-${i + 1}/970/700`,
)

const basicCode = `<ThreeDMarquee
  images={[
    "https://picsum.photos/seed/3d-marquee-1/970/700",
    "https://picsum.photos/seed/3d-marquee-2/970/700",
    "https://picsum.photos/seed/3d-marquee-3/970/700",
    "https://picsum.photos/seed/3d-marquee-4/970/700",
    "https://picsum.photos/seed/3d-marquee-5/970/700",
    "https://picsum.photos/seed/3d-marquee-6/970/700",
    "https://picsum.photos/seed/3d-marquee-7/970/700",
    "https://picsum.photos/seed/3d-marquee-8/970/700",
    "https://picsum.photos/seed/3d-marquee-9/970/700",
    "https://picsum.photos/seed/3d-marquee-10/970/700",
    "https://picsum.photos/seed/3d-marquee-11/970/700",
    "https://picsum.photos/seed/3d-marquee-12/970/700",
    "https://picsum.photos/seed/3d-marquee-13/970/700",
    "https://picsum.photos/seed/3d-marquee-14/970/700",
    "https://picsum.photos/seed/3d-marquee-15/970/700",
    "https://picsum.photos/seed/3d-marquee-16/970/700",
    "https://picsum.photos/seed/3d-marquee-17/970/700",
    "https://picsum.photos/seed/3d-marquee-18/970/700",
    "https://picsum.photos/seed/3d-marquee-19/970/700",
    "https://picsum.photos/seed/3d-marquee-20/970/700",
    "https://picsum.photos/seed/3d-marquee-21/970/700",
    "https://picsum.photos/seed/3d-marquee-22/970/700",
    "https://picsum.photos/seed/3d-marquee-23/970/700",
    "https://picsum.photos/seed/3d-marquee-24/970/700",
  ]}
/>`

const basicRender = (
  <div className="relative h-[600px] w-full overflow-hidden rounded-lg border">
    <ThreeDMarquee images={baseImages} />
  </div>
)

export const examples3dMarquee: Record<string, Example[]> = {
  "3d-marquee": [
    {
      title: "Básico — 24 imagens",
      description:
        "Grid 4 colunas em perspectiva 3D (rotateX 55°, rotateZ -45°). Cada coluna rola em loop infinito reverso, com durações alternadas (10s nas pares, 15s nas ímpares) para o efeito de marquee contínuo.",
      code: basicCode,
      render: basicRender,
    },
  ],
}
