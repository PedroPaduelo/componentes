import type { Example } from "@/data/examples"
import { Boxes } from "@/components/ui/background-boxes"
import { cn } from "@/lib/utils"

/**
 * Examples do Background Boxes (Aceternity UI).
 *
 * O componente é um fundo decorativo pensado para superfícies escuras. O
 * example "Básico" o coloca atrás de um heading, com um overlay de máscara
 * radial (`[mask-image:radial-gradient(transparent,white)]`) que suaviza as
 * bordas, e o texto em `z-20` por cima.
 */

const backgroundBoxesBasicExample: Example = {
  title: "Básico",
  description:
    "Grid de células num fundo escuro; o hover acende cada célula com uma cor aleatória. Heading por cima com máscara radial.",
  code: `<div className="relative h-96 w-full overflow-hidden rounded-lg bg-slate-900 flex items-center justify-center">
  <div className="absolute inset-0 z-20 w-full h-full bg-slate-900 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

  <Boxes />

  <h1 className="md:text-4xl text-xl text-white relative z-20 font-bold">
    Tailwind is Awesome
  </h1>
  <p className="text-center mt-2 text-neutral-300 relative z-20">
    Framework de utilitários para construir UIs rapidamente.
  </p>
</div>`,
  render: (
    <div className="relative flex h-96 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-900">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-20 h-full w-full bg-slate-900",
          "[mask-image:radial-gradient(transparent,white)]",
        )}
      />

      <Boxes />

      <div className="relative z-20 flex flex-col items-center">
        <h1 className="text-xl font-bold text-white md:text-4xl">
          Tailwind is Awesome
        </h1>
        <p className="mt-2 text-center text-neutral-300">
          Framework de utilitários para construir UIs rapidamente.
        </p>
      </div>
    </div>
  ),
}

export const examplesBackgroundBoxes: Record<string, Example[]> = {
  "background-boxes": [backgroundBoxesBasicExample],
}
