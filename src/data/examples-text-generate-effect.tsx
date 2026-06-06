import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

import type { Example } from "@/data/examples"

const textGenerateBasic: Example = {
  title: "Básico",
  description:
    "Texto da Aceternity UI em que cada palavra entra com fade + blur desfocado (10px) com stagger de 0.2s, animados na montagem do componente via motion/react (useAnimate).",
  code: `<TextGenerateEffect
  words="A aceternity é uma grande biblioteca de componentes para você usar."
/>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <div className="w-full max-w-xl">
        <TextGenerateEffect
          words="A aceternity é uma grande biblioteca de componentes para você usar."
        />
      </div>
    </div>
  ),
}

const textGenerateNoFilter: Example = {
  title: "Sem blur (filter=false)",
  description:
    "Variante sem o blur: as palavras aparecem apenas com fade de opacidade — útil para textos longos ou quando o blur atrapalha a leitura.",
  code: `<TextGenerateEffect
  filter={false}
  duration={0.7}
  words="Animação de palavras sem blur, só opacidade."
/>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <div className="w-full max-w-xl">
        <TextGenerateEffect
          filter={false}
          duration={0.7}
          words="Animação de palavras sem blur, só opacidade."
        />
      </div>
    </div>
  ),
}

const textGenerateCustomDuration: Example = {
  title: "Duração customizada",
  description:
    "Stagger entre palavras e duração de cada palavra podem ser ajustados para um efeito mais lento/calmo ou mais rápido/dinâmico.",
  code: `<TextGenerateEffect
  duration={0.3}
  words="Cada palavra entra rápido e revela o texto todo em sequência."
/>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <div className="w-full max-w-xl">
        <TextGenerateEffect
          duration={0.3}
          words="Cada palavra entra rápido e revela o texto todo em sequência."
        />
      </div>
    </div>
  ),
}

export const examplesTextGenerateEffect: Record<string, Example[]> = {
  "text-generate-effect": [
    textGenerateBasic,
    textGenerateNoFilter,
    textGenerateCustomDuration,
  ],
}
