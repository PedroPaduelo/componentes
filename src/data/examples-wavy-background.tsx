import type { Example } from "@/data/examples"
import { WavyBackground } from "@/components/ui/wavy-background"

/* -------------------------------------------------------------------------- */
/*                              wavy-background                                */
/* -------------------------------------------------------------------------- */

const wavyBackgroundBasicExample: Example = {
  title: "Básico",
  description:
    "Ondas coloridas suaves animadas em canvas atrás de um hero escuro, com as cores e velocidade padrão.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg">
  <WavyBackground containerClassName="h-[420px]">
    <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
      Hero waves are cool
    </h2>
    <p className="mt-4 text-center text-base text-white/80">
      Fundo animado em &lt;canvas&gt; com simplex noise.
    </p>
  </WavyBackground>
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg">
      <WavyBackground containerClassName="h-[420px]">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Hero waves are cool
        </h2>
        <p className="mt-4 text-center text-base text-white/80">
          Fundo animado em &lt;canvas&gt; com simplex noise.
        </p>
      </WavyBackground>
    </div>
  ),
}

const wavyBackgroundCustomExample: Example = {
  title: "Customizado",
  description:
    "Paleta personalizada, velocidade lenta, ondas mais espessas e maior opacidade — para um clima mais marcante.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg">
  <WavyBackground
    containerClassName="h-[420px]"
    colors={["#f97316", "#fb7185", "#a855f7", "#6366f1"]}
    speed="slow"
    waveWidth={70}
    waveOpacity={0.7}
    backgroundFill="#0a0a0a"
  >
    <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
      Slow sunset waves
    </h2>
    <p className="mt-4 text-center text-base text-white/80">
      Cores quentes, ondas largas e movimento suave.
    </p>
  </WavyBackground>
</div>`,
  render: (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg">
      <WavyBackground
        containerClassName="h-[420px]"
        colors={["#f97316", "#fb7185", "#a855f7", "#6366f1"]}
        speed="slow"
        waveWidth={70}
        waveOpacity={0.7}
        backgroundFill="#0a0a0a"
      >
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Slow sunset waves
        </h2>
        <p className="mt-4 text-center text-base text-white/80">
          Cores quentes, ondas largas e movimento suave.
        </p>
      </WavyBackground>
    </div>
  ),
}

export const examplesWavyBackground: Record<string, Example[]> = {
  "wavy-background": [wavyBackgroundBasicExample, wavyBackgroundCustomExample],
}
