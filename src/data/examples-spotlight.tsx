import { Spotlight } from "@/components/ui/spotlight"

import type { Example } from "@/data/examples"

const spotlightBasic: Example = {
  title: "Básico",
  description:
    "Facho de luz desfocado vindo do canto superior esquerdo sobre fundo escuro, com fade-in suave atrás de um hero.",
  code: `<div className="relative flex h-[480px] w-full overflow-hidden rounded-lg bg-black/[0.96] antialiased">
  <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
  <div className="relative z-10 mx-auto w-full max-w-3xl p-8 pt-24 md:pt-32">
    <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-6xl">
      Spotlight <br /> em foco.
    </h1>
    <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
      Um facho de luz que ilumina o conteúdo do canto. Ideal para heros e
      seções de destaque com fundo escuro.
    </p>
  </div>
</div>`,
  render: (
    <div className="relative flex h-[480px] w-full overflow-hidden rounded-lg bg-black/[0.96] antialiased">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
      <div className="relative z-10 mx-auto w-full max-w-3xl p-8 pt-24 md:pt-32">
        <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-6xl">
          Spotlight <br /> em foco.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
          Um facho de luz que ilumina o conteúdo do canto. Ideal para heros e
          seções de destaque com fundo escuro.
        </p>
      </div>
    </div>
  ),
}

const spotlightColored: Example = {
  title: "Cor customizada",
  description:
    "A prop `fill` aceita qualquer cor CSS — aqui um tom azulado vindo do canto direito.",
  code: `<div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/[0.96] antialiased">
  <Spotlight className="-top-20 right-0 md:right-32" fill="#60a5fa" />
  <p className="relative z-10 bg-gradient-to-b from-sky-200 to-sky-500 bg-clip-text text-center text-3xl font-bold text-transparent md:text-5xl">
    Luz azul
  </p>
</div>`,
  render: (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/[0.96] antialiased">
      <Spotlight className="-top-20 right-0 md:right-32" fill="#60a5fa" />
      <p className="relative z-10 bg-gradient-to-b from-sky-200 to-sky-500 bg-clip-text text-center text-3xl font-bold text-transparent md:text-5xl">
        Luz azul
      </p>
    </div>
  ),
}

export const examplesSpotlight: Record<string, Example[]> = {
  spotlight: [spotlightBasic, spotlightColored],
}
