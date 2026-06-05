import { Vortex } from "@/components/ui/vortex"

import type { Example } from "@/data/examples"

const vortexBasic: Example = {
  title: "Básico",
  description:
    "Redemoinho de partículas animado em canvas com CTA branco sobreposto. Wrapper contido (h-[30rem]) e fundo escuro fixo (brand do efeito).",
  code: `<div className="h-[30rem] w-full overflow-hidden rounded-lg">
  <Vortex
    backgroundColor="#000000"
    className="flex h-full w-full flex-col items-center justify-center px-2 py-4 md:px-10"
  >
    <h2 className="text-center text-2xl font-bold text-white md:text-5xl">
      The hell is this?
    </h2>
    <p className="mt-4 max-w-xl text-center text-sm text-white md:text-base">
      This is chemical burn. It&apos;ll hurt more than you&apos;ve ever been
      burned and you&apos;ll have a scar.
    </p>
    <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700">
        Order now
      </button>
      <button className="px-4 py-2 text-white">Watch trailer</button>
    </div>
  </Vortex>
</div>`,
  render: (
    <div className="h-[30rem] w-full overflow-hidden rounded-lg">
      <Vortex
        backgroundColor="#000000"
        className="flex h-full w-full flex-col items-center justify-center px-2 py-4 md:px-10"
      >
        <h2 className="text-center text-2xl font-bold text-white md:text-5xl">
          The hell is this?
        </h2>
        <p className="mt-4 max-w-xl text-center text-sm text-white md:text-base">
          This is chemical burn. It&apos;ll hurt more than you&apos;ve ever been
          burned and you&apos;ll have a scar.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700">
            Order now
          </button>
          <button className="px-4 py-2 text-white">Watch trailer</button>
        </div>
      </Vortex>
    </div>
  ),
}

const vortexGreen: Example = {
  title: "Custom (vortex verde)",
  description:
    "Mesmo efeito com matiz verde (baseHue=120), maior amplitude vertical (rangeY=800) e menos partículas (particleCount=500).",
  code: `<div className="h-[30rem] w-full overflow-hidden rounded-lg">
  <Vortex
    backgroundColor="#000000"
    rangeY={800}
    particleCount={500}
    baseHue={120}
    className="flex h-full w-full flex-col items-center justify-center px-2 py-4 md:px-10"
  >
    <h2 className="text-center text-2xl font-bold text-white md:text-5xl">
      Grow with the vortex
    </h2>
    <p className="mt-4 max-w-xl text-center text-sm text-white md:text-base">
      Um redemoinho esmeralda que cobre toda a altura — ideal para heros de
      produto com pegada orgânica.
    </p>
    <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
      <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition duration-200 hover:bg-emerald-700">
        Get started
      </button>
      <button className="px-4 py-2 text-white">Learn more</button>
    </div>
  </Vortex>
</div>`,
  render: (
    <div className="h-[30rem] w-full overflow-hidden rounded-lg">
      <Vortex
        backgroundColor="#000000"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex h-full w-full flex-col items-center justify-center px-2 py-4 md:px-10"
      >
        <h2 className="text-center text-2xl font-bold text-white md:text-5xl">
          Grow with the vortex
        </h2>
        <p className="mt-4 max-w-xl text-center text-sm text-white md:text-base">
          Um redemoinho esmeralda que cobre toda a altura — ideal para heros de
          produto com pegada orgânica.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition duration-200 hover:bg-emerald-700">
            Get started
          </button>
          <button className="px-4 py-2 text-white">Learn more</button>
        </div>
      </Vortex>
    </div>
  ),
}

export const examplesVortex: Record<string, Example[]> = {
  vortex: [vortexBasic, vortexGreen],
}
