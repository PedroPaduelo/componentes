import { SquigglyText } from "@/components/ui/squiggly-text"

import type { Example } from "@/data/examples"

const squigglyBasic: Example = {
  title: "Básico",
  description:
    "Padrão com 5 steps, stepDuration 80ms e scale alternando [6, 8] — vibração sutil estilo 'caneta tremendo' em qualquer texto inline.",
  code: `<SquigglyText>Texto tremendo</SquigglyText>`,
  render: (
    <div className="flex w-full items-center justify-center min-h-[160px] py-10 text-4xl font-semibold tracking-tight">
      <SquigglyText>Texto tremendo</SquigglyText>
    </div>
  ),
}

const squigglyAggressive: Example = {
  title: "Scale agressivo + mais lento",
  description:
    "Scale 20 fixo, stepDuration 150ms e baseFrequency 0.05 — distorção forte e vagarosa, ótimo para títulos de impacto.",
  code: `<SquigglyText
  scale={20}
  stepDuration={150}
  baseFrequency={0.05}
>
  Calma tensa
</SquigglyText>`,
  render: (
    <div className="flex w-full items-center justify-center min-h-[160px] py-10 text-4xl font-semibold tracking-tight">
      <SquigglyText scale={20} stepDuration={150} baseFrequency={0.05}>
        Calma tensa
      </SquigglyText>
    </div>
  ),
}

const squigglyBlock: Example = {
  title: "Em bloco (as=\"div\") + mais steps",
  description:
    "Renderiza como bloco com 8 steps e troca rápida (60ms) — ideal para parágrafos de hero com efeito de 'wobble' contínuo.",
  code: `<SquigglyText
  as="div"
  steps={8}
  stepDuration={60}
>
  Parágrafo tremendo em bloco
</SquigglyText>`,
  render: (
    <div className="flex w-full items-center justify-center min-h-[160px] py-10">
      <SquigglyText
        as="div"
        steps={8}
        stepDuration={60}
        className="max-w-2xl text-center text-2xl font-semibold tracking-tight"
      >
        Parágrafo tremendo em bloco
      </SquigglyText>
    </div>
  ),
}

const squigglyScaleTuple: Example = {
  title: "Scale como tupla alternada",
  description:
    "scale=[2, 14] faz o displacement alternar entre steps calmos e agressivos. Combinado com numOctaves=5, o ruído fica mais detalhado.",
  code: `<SquigglyText
  scale={[2, 14]}
  numOctaves={5}
>
  Pulso irregular
</SquigglyText>`,
  render: (
    <div className="flex w-full items-center justify-center min-h-[160px] py-10 text-4xl font-semibold tracking-tight">
      <SquigglyText scale={[2, 14]} numOctaves={5}>
        Pulso irregular
      </SquigglyText>
    </div>
  ),
}

export const examplesSquigglyText: Record<string, Example[]> = {
  "squiggly-text": [
    squigglyBasic,
    squigglyAggressive,
    squigglyBlock,
    squigglyScaleTuple,
  ],
}
