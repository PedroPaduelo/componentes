/**
 * Examples — Background Ripple Effect (Aceternity UI).
 *
 * Grade de células quadradas; ao clicar, propaga-se um ripple (onda de
 * opacidade) pelas vizinhas com delay proporcional à distância.
 *
 * O componente raiz é `absolute inset-0`, então cada example o ancora num
 * container contido (`relative h-[420px] w-full overflow-hidden rounded-lg
 * border`) — NUNCA `min-h-screen`. Grade reduzida pra caber bonito no card.
 * `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"

const backgroundRippleBasicExample: Example = {
  title: "Básico",
  description:
    "Clique em qualquer célula: o ripple se propaga pelas vizinhas com delay crescente conforme a distância.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
  <BackgroundRippleEffect rows={6} cols={12} cellSize={40} />
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
      <BackgroundRippleEffect rows={6} cols={12} cellSize={40} />
    </div>
  ),
}

const backgroundRippleHeadingExample: Example = {
  title: "Com título sobreposto",
  description:
    "Texto centralizado por cima da grade. Os cliques passam por baixo (o título não captura ponteiro) e disparam o ripple normalmente.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
  <BackgroundRippleEffect rows={7} cols={14} cellSize={36} />
  <div className="pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center gap-2 text-center">
    <span className="text-2xl font-semibold tracking-tight">
      Background Ripple
    </span>
    <span className="text-sm text-muted-foreground">
      Clique numa célula e veja a onda
    </span>
  </div>
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
      <BackgroundRippleEffect rows={7} cols={14} cellSize={36} />
      <div className="pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center gap-2 text-center">
        <span className="text-2xl font-semibold tracking-tight">
          Background Ripple
        </span>
        <span className="text-sm text-muted-foreground">
          Clique numa célula e veja a onda
        </span>
      </div>
    </div>
  ),
}

export const examplesBackgroundRippleEffect: Record<string, Example[]> = {
  "background-ripple-effect": [
    backgroundRippleBasicExample,
    backgroundRippleHeadingExample,
  ],
}
