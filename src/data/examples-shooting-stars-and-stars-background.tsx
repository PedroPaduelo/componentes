import {
  ShootingStars,
  StarsBackground,
} from "@/components/ui/shooting-stars-and-stars-background"

import type { Example } from "@/data/examples"

const shootingStarsBasic: Example = {
  title: "Básico",
  description:
    "Céu noturno da Aceternity UI: estrelas estáticas cintilando em canvas (StarsBackground) com estrelas cadentes atravessando em SVG (ShootingStars). Wrapper relative de altura fixa e fundo escuro fixo (brand do efeito).",
  code: `<div className="relative flex h-[40rem] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
  <h2 className="relative z-10 text-center text-3xl font-bold text-white md:text-4xl">
    Shooting Stars Background
  </h2>
  <ShootingStars />
  <StarsBackground />
</div>`,
  render: (
    <div className="relative flex h-[40rem] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
      <h2 className="relative z-10 text-center text-3xl font-bold text-white md:text-4xl">
        Shooting Stars Background
      </h2>
      <ShootingStars />
      <StarsBackground />
    </div>
  ),
}

const shootingStarsCustom: Example = {
  title: "Cores e ritmo customizados",
  description:
    "Estrelas cadentes com gradiente esmeralda/ciano, mais frequentes (delays menores) e mais rápidas, sobre um céu mais denso de estrelas cintilantes.",
  code: `<div className="relative flex h-[40rem] w-full items-center justify-center overflow-hidden rounded-lg bg-[#0a0a1a]">
  <p className="relative z-10 max-w-md text-center text-lg text-white/80">
    Faça uma viagem pelo cosmos com fachos cadentes esmeralda.
  </p>
  <ShootingStars
    starColor="#10b981"
    trailColor="#22d3ee"
    minDelay={600}
    maxDelay={2000}
    minSpeed={20}
    maxSpeed={40}
  />
  <StarsBackground starDensity={0.0003} />
</div>`,
  render: (
    <div className="relative flex h-[40rem] w-full items-center justify-center overflow-hidden rounded-lg bg-[#0a0a1a]">
      <p className="relative z-10 max-w-md text-center text-lg text-white/80">
        Faça uma viagem pelo cosmos com fachos cadentes esmeralda.
      </p>
      <ShootingStars
        starColor="#10b981"
        trailColor="#22d3ee"
        minDelay={600}
        maxDelay={2000}
        minSpeed={20}
        maxSpeed={40}
      />
      <StarsBackground starDensity={0.0003} />
    </div>
  ),
}

export const examplesShootingStarsAndStarsBackground: Record<string, Example[]> =
  {
    "shooting-stars-and-stars-background": [
      shootingStarsBasic,
      shootingStarsCustom,
    ],
  }
