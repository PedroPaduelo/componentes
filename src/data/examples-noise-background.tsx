import { NoiseBackground } from "@/components/ui/noise-background"

import type { Example } from "./examples"

const noiseBackgroundBasic: Example = {
  title: "Básico",
  description:
    "Container com camadas de gradiente radial flutuantes, ruído sutil em mix-blend overlay e faixa de luz no topo. O conteúdo fica em primeiro plano sobre o efeito.",
  code: `<NoiseBackground
  containerClassName="relative h-[400px] w-full"
  noiseIntensity={0.25}
  speed={0.1}
  className="flex h-full items-center justify-center"
>
  <div className="text-center">
    <h2 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 md:text-5xl">
      Noise Background
    </h2>
    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">
      Gradientes flutuantes com textura de ruído.
    </p>
  </div>
</NoiseBackground>`,
  render: (
    <NoiseBackground
      containerClassName="relative h-[400px] w-full"
      noiseIntensity={0.25}
      speed={0.1}
      className="flex h-full items-center justify-center"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 md:text-5xl">
          Noise Background
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">
          Gradientes flutuantes com textura de ruído.
        </p>
      </div>
    </NoiseBackground>
  ),
}

const noiseBackgroundColored: Example = {
  title: "Cores e velocidade customizadas",
  description:
    "Variando `gradientColors` e `speed` a paleta e a velocidade do movimento mudam completamente. Aqui um sunset com ruído mais marcado, animação mais lenta e backdrop-blur.",
  code: `<NoiseBackground
  containerClassName="relative h-[400px] w-full"
  gradientColors={["rgb(249, 115, 22)", "rgb(236, 72, 153)", "rgb(168, 85, 247)"]}
  noiseIntensity={0.4}
  speed={0.05}
  backdropBlur
  className="flex h-full items-center justify-center"
>
  <h2 className="text-3xl font-bold text-white drop-shadow-md md:text-5xl">
    Sunset grain
  </h2>
</NoiseBackground>`,
  render: (
    <NoiseBackground
      containerClassName="relative h-[400px] w-full"
      gradientColors={[
        "rgb(249, 115, 22)",
        "rgb(236, 72, 153)",
        "rgb(168, 85, 247)",
      ]}
      noiseIntensity={0.4}
      speed={0.05}
      backdropBlur
      className="flex h-full items-center justify-center"
    >
      <h2 className="text-3xl font-bold text-white drop-shadow-md md:text-5xl">
        Sunset grain
      </h2>
    </NoiseBackground>
  ),
}

export const examplesNoiseBackground: Record<string, Example[]> = {
  "noise-background": [noiseBackgroundBasic, noiseBackgroundColored],
}
