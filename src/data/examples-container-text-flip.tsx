import { ContainerTextFlip } from "@/components/ui/container-text-flip"

import type { Example } from "@/data/examples"

const containerTextFlipBasic: Example = {
  title: "Básico",
  description:
    "ContainerTextFlip cicla por uma lista de palavras (default: better/modern/beautiful/awesome), animando a largura do container para acomodar cada palavra e fazendo stagger de blur por letra (10px → nítido). Tema segue tokens semânticos shadcn (text-foreground, bg-muted, border).",
  code: `<h1 className="text-2xl font-bold text-foreground md:text-4xl">
  Construa software
  <ContainerTextFlip
    words={["rápido", "bonito", "moderno", "acessível"]}
    className="ml-2 align-middle"
  />
</h1>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <h1 className="flex flex-wrap items-center justify-center gap-2 text-center text-2xl font-bold text-foreground md:text-4xl">
        <span>Construa software</span>
        <ContainerTextFlip
          words={["rápido", "bonito", "moderno", "acessível"]}
          className="align-middle"
        />
      </h1>
    </div>
  ),
}

const containerTextFlipCustom: Example = {
  title: "Ritmo e classes customizadas",
  description:
    "interval (ms) controla quanto tempo cada palavra fica em tela antes da próxima troca. animationDuration (ms) controla a velocidade da animação de largura e do blur por letra. Útil pra hero pages com copy curta onde o ritmo do flip é parte da identidade visual.",
  code: `<ContainerTextFlip
  words={["criativa", "obstinada", "humilde", "curiosa"]}
  interval={1800}
  animationDuration={500}
  className="text-3xl font-semibold text-primary md:text-5xl"
/>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <ContainerTextFlip
        words={["criativa", "obstinada", "humilde", "curiosa"]}
        interval={1800}
        animationDuration={500}
        className="text-3xl font-semibold text-primary md:text-5xl"
      />
    </div>
  ),
}

export const examplesContainerTextFlip: Record<string, Example[]> = {
  "container-text-flip": [containerTextFlipBasic, containerTextFlipCustom],
}
