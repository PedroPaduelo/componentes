import { BackgroundLines } from "@/components/ui/background-lines"

import type { Example } from "@/data/examples"

const backgroundLinesBasic: Example = {
  title: "Básico",
  description:
    "SVG de fundo com múltiplos paths curvos coloridos animando em padrão de onda (loop), com heading + parágrafo sobrepostos (z-20). Adapta ao tema light e dark.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg flex items-center justify-center">
  <BackgroundLines className="flex items-center justify-center">
    <div className="relative z-20 flex flex-col items-center justify-center px-4 text-center">
      <h2 className="bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-2xl font-bold text-transparent dark:from-neutral-600 dark:to-white md:text-4xl lg:text-5xl">
        Sanjana Airlines, <br /> Sajana Textiles.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-700 dark:text-neutral-400 md:text-base">
        Linhas onduladas animadas correm pelo fundo em loop contínuo, criando um
        efeito de hero vibrante e colorido inspirado no height.app.
      </p>
    </div>
  </BackgroundLines>
</div>`,
  render: (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg">
      <BackgroundLines className="flex items-center justify-center">
        <div className="relative z-20 flex flex-col items-center justify-center px-4 text-center">
          <h2 className="bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-2xl font-bold text-transparent dark:from-neutral-600 dark:to-white md:text-4xl lg:text-5xl">
            Sanjana Airlines, <br /> Sajana Textiles.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-700 dark:text-neutral-400 md:text-base">
            Linhas onduladas animadas correm pelo fundo em loop contínuo,
            criando um efeito de hero vibrante e colorido inspirado no
            height.app.
          </p>
        </div>
      </BackgroundLines>
    </div>
  ),
}

export const examplesBackgroundLines: Record<string, Example[]> = {
  "background-lines": [backgroundLinesBasic],
}
