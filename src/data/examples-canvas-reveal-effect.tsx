import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect"
import type { Example } from "./examples"

const CanvasRevealBasic: Example = {
  title: "Canvas Reveal Effect — Básico",
  description:
    "Efeito de revelação com dot matrix WebGL usando shader customizado @react-three/fiber + three. Animação surge do centro para as bordas.",
  code: `<div className="relative h-[40rem] w-full rounded-2xl overflow-hidden">
  <CanvasRevealEffect
    animationSpeed={0.4}
    colors={[[0, 255, 255]]}
    dotSize={3}
    showGradient={true}
  />
  <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
    <h2 className="text-3xl font-bold text-white md:text-5xl">
      Canvas Reveal
    </h2>
    <p className="mt-2 text-sm text-white/70">
      Dot matrix WebGL com shader customizada
    </p>
  </div>
</div>`,
  render: (
    <div className="relative h-[40rem] w-full rounded-2xl border border-border overflow-hidden bg-background">
      <CanvasRevealEffect
        animationSpeed={0.4}
        colors={[[0, 255, 255]]}
        dotSize={3}
        showGradient={true}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h2 className="text-3xl font-bold text-white md:text-5xl">
          Canvas Reveal
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Dot matrix WebGL com shader customizada
        </p>
      </div>
    </div>
  ),
}

const CanvasRevealMultiColor: Example = {
  title: "Canvas Reveal — Multi Color",
  description:
    "Efeito com múltiplas cores no dot matrix (cyan, magenta, amarelo) e velocidade de animação mais rápida.",
  code: `<div className="relative h-[30rem] w-full rounded-2xl overflow-hidden">
  <CanvasRevealEffect
    animationSpeed={0.8}
    colors={[[0, 255, 255], [255, 0, 255], [255, 255, 0]]}
    dotSize={4}
    showGradient={false}
  />
  <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
    <h2 className="text-2xl font-bold text-foreground md:text-4xl">
      Multi Color
    </h2>
    <p className="mt-2 text-sm text-muted-foreground">
      Cyan, magenta e amarelo
    </p>
  </div>
</div>`,
  render: (
    <div className="relative h-[30rem] w-full rounded-2xl border border-border overflow-hidden bg-background">
      <CanvasRevealEffect
        animationSpeed={0.8}
        colors={[[0, 255, 255], [255, 0, 255], [255, 255, 0]]}
        dotSize={4}
        showGradient={false}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-4xl">
          Multi Color
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cyan, magenta e amarelo
        </p>
      </div>
    </div>
  ),
}

export const examplesCanvasRevealEffect: Record<string, Example[]> = {
  "canvas-reveal-effect": [CanvasRevealBasic, CanvasRevealMultiColor],
}
