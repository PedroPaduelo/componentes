import { DitherShader } from "@/components/ui/dither-shader"

import type { Example } from "@/data/examples"

const ditherShaderBasicExample: Example = {
  title: "Bayer + grayscale",
  description:
    "Dithering Bayer 4x4 sobre uma foto em escala de cinza — padrão clássico de ordered dithering usado em revistas e impressoras.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
  <DitherShader
    src="https://picsum.photos/seed/dither-1/800/600?grayscale"
    ditherMode="bayer"
    colorMode="grayscale"
    gridSize={4}
    className="absolute inset-0"
  />
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
      <DitherShader
        src="https://picsum.photos/seed/dither-1/800/600?grayscale"
        ditherMode="bayer"
        colorMode="grayscale"
        gridSize={4}
        className="absolute inset-0"
      />
    </div>
  ),
}

const ditherShaderDuotoneExample: Example = {
  title: "Duotone colorido",
  description:
    "Dither halftone em modo duotone — duas cores (índigo profundo + âmbar) substituem preto/branco mantendo a profundidade da imagem.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
  <DitherShader
    src="https://picsum.photos/seed/dither-2/800/600"
    ditherMode="halftone"
    colorMode="duotone"
    gridSize={6}
    primaryColor="#1e1b4b"
    secondaryColor="#fbbf24"
    className="absolute inset-0"
  />
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
      <DitherShader
        src="https://picsum.photos/seed/dither-2/800/600"
        ditherMode="halftone"
        colorMode="duotone"
        gridSize={6}
        primaryColor="#1e1b4b"
        secondaryColor="#fbbf24"
        className="absolute inset-0"
      />
    </div>
  ),
}

const ditherShaderAnimatedExample: Example = {
  title: "Noise animado",
  description:
    "Dithering por ruído animado — o padrão de pixels muda continuamente, criando um efeito estilo 'TV estática' sobre a imagem.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
  <DitherShader
    src="https://picsum.photos/seed/dither-3/800/600?grayscale"
    ditherMode="noise"
    colorMode="grayscale"
    gridSize={3}
    pixelRatio={2}
    animated
    animationSpeed={0.04}
    className="absolute inset-0"
  />
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
      <DitherShader
        src="https://picsum.photos/seed/dither-3/800/600?grayscale"
        ditherMode="noise"
        colorMode="grayscale"
        gridSize={3}
        pixelRatio={2}
        animated
        animationSpeed={0.04}
        className="absolute inset-0"
      />
    </div>
  ),
}

export const examplesDitherShader: Record<string, Example[]> = {
  "dither-shader": [
    ditherShaderBasicExample,
    ditherShaderDuotoneExample,
    ditherShaderAnimatedExample,
  ],
}
