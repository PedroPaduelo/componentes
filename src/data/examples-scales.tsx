/**
 * Examples — Scales (Aceternity UI).
 *
 * Background pattern de linhas via CSS puro. Demonstra as 3 orientações
 * (diagonal, horizontal, vertical) usando o `ScalesContainer`, além de um
 * exemplo com `size`/`color` customizados.
 *
 * Cada wrapper tem altura contida (`relative h-96 w-full overflow-hidden
 * rounded-lg border ...`) para o preview não esticar. `code` e `render`
 * mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { ScalesContainer } from "@/components/ui/scales"

const scalesDiagonalExample: Example = {
  title: "Diagonal",
  description: "Pattern padrão: linhas em diagonal (315deg) atrás do conteúdo.",
  code: `<ScalesContainer
  orientation="diagonal"
  size={10}
  containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
>
  <div className="flex h-96 items-center justify-center">
    <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
      Diagonal
    </span>
  </div>
</ScalesContainer>`,
  render: (
    <ScalesContainer
      orientation="diagonal"
      size={10}
      containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
    >
      <div className="flex h-96 items-center justify-center">
        <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
          Diagonal
        </span>
      </div>
    </ScalesContainer>
  ),
}

const scalesHorizontalExample: Example = {
  title: "Horizontal",
  description: "Linhas horizontais (0deg), com espaçamento um pouco maior.",
  code: `<ScalesContainer
  orientation="horizontal"
  size={14}
  containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
>
  <div className="flex h-96 items-center justify-center">
    <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
      Horizontal
    </span>
  </div>
</ScalesContainer>`,
  render: (
    <ScalesContainer
      orientation="horizontal"
      size={14}
      containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
    >
      <div className="flex h-96 items-center justify-center">
        <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
          Horizontal
        </span>
      </div>
    </ScalesContainer>
  ),
}

const scalesVerticalExample: Example = {
  title: "Vertical",
  description: "Linhas verticais (90deg), com espaçamento um pouco maior.",
  code: `<ScalesContainer
  orientation="vertical"
  size={14}
  containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
>
  <div className="flex h-96 items-center justify-center">
    <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
      Vertical
    </span>
  </div>
</ScalesContainer>`,
  render: (
    <ScalesContainer
      orientation="vertical"
      size={14}
      containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
    >
      <div className="flex h-96 items-center justify-center">
        <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
          Vertical
        </span>
      </div>
    </ScalesContainer>
  ),
}

const scalesCustomExample: Example = {
  title: "Cor e densidade customizadas",
  description:
    "Pattern diagonal com cor própria (sobrescreve o default reativo ao tema) e maior densidade via `size` menor.",
  code: `<ScalesContainer
  orientation="diagonal"
  size={6}
  color="color-mix(in oklab, var(--primary) 35%, transparent)"
  containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
>
  <div className="flex h-96 items-center justify-center">
    <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
      Custom
    </span>
  </div>
</ScalesContainer>`,
  render: (
    <ScalesContainer
      orientation="diagonal"
      size={6}
      color="color-mix(in oklab, var(--primary) 35%, transparent)"
      containerClassName="relative h-96 w-full overflow-hidden rounded-lg border"
    >
      <div className="flex h-96 items-center justify-center">
        <span className="rounded-md bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
          Custom
        </span>
      </div>
    </ScalesContainer>
  ),
}

export const examplesScales: Record<string, Example[]> = {
  scales: [
    scalesDiagonalExample,
    scalesHorizontalExample,
    scalesVerticalExample,
    scalesCustomExample,
  ],
}
