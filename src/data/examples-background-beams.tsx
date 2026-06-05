import { BackgroundBeams } from "@/components/ui/background-beams"

import type { Example } from "@/data/examples"

const backgroundBeamsBasic: Example = {
  title: "Básico",
  description:
    "Feixes de luz SVG percorrendo paths curvos sobre fundo escuro, atrás de um heading de hero.",
  code: `<div className="relative flex h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-neutral-950">
  <h1 className="relative z-10 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text text-center text-3xl font-bold text-transparent md:text-5xl">
    Join the waitlist
  </h1>
  <p className="relative z-10 mx-auto mt-3 max-w-lg px-4 text-center text-sm text-neutral-400">
    Welcome to the future. Sign up to get notified when we launch — beams of
    light included, no spam guaranteed.
  </p>
  <BackgroundBeams />
</div>`,
  render: (
    <div className="relative flex h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-neutral-950">
      <h1 className="relative z-10 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text text-center text-3xl font-bold text-transparent md:text-5xl">
        Join the waitlist
      </h1>
      <p className="relative z-10 mx-auto mt-3 max-w-lg px-4 text-center text-sm text-neutral-400">
        Welcome to the future. Sign up to get notified when we launch — beams of
        light included, no spam guaranteed.
      </p>
      <BackgroundBeams />
    </div>
  ),
}

export const examplesBackgroundBeams: Record<string, Example[]> = {
  "background-beams": [backgroundBeamsBasic],
}
