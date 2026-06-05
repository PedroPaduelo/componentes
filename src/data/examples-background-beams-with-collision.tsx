/**
 * Examples — Background Beams With Collision (Aceternity UI).
 *
 * Feixes verticais caem do topo e explodem em partículas ao colidir com a base.
 * O componente já traz o próprio fundo (claro no light, escuro no dark); aqui
 * o ancoramos num container contido (`relative h-[420px] w-full overflow-hidden
 * rounded-lg`) e forçamos o efeito a preencher essa altura com `!h-full` /
 * `md:!h-full` (neutraliza o `h-96 md:h-[40rem]` padrão) — NUNCA `h-screen`.
 * `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"

const backgroundBeamsCollisionBasicExample: Example = {
  title: "Básico",
  description:
    "Feixes coloridos caem do topo e explodem em partículas ao colidir com a base. O heading fica centralizado por cima do efeito.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg">
  <BackgroundBeamsWithCollision className="!h-full rounded-lg md:!h-full">
    <h2 className="relative z-20 max-w-2xl px-4 text-center text-2xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
      What&apos;s cooler than Beams?{" "}
      <span className="relative inline-block">Exploding beams.</span>
    </h2>
  </BackgroundBeamsWithCollision>
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg">
      <BackgroundBeamsWithCollision className="!h-full rounded-lg md:!h-full">
        <h2 className="relative z-20 max-w-2xl px-4 text-center text-2xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
          What&apos;s cooler than Beams?{" "}
          <span className="relative inline-block">Exploding beams.</span>
        </h2>
      </BackgroundBeamsWithCollision>
    </div>
  ),
}

export const examplesBackgroundBeamsWithCollision: Record<string, Example[]> = {
  "background-beams-with-collision": [backgroundBeamsCollisionBasicExample],
}
