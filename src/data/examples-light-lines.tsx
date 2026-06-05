import { LightLines } from "@/components/ui/light-lines"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                               light-lines                                  */
/* -------------------------------------------------------------------------- */

const lightLinesBasic: Example = {
  title: "Básico",
  description:
    "Defaults do efeito: gradiente azul (#2462F6 → #5999F8), luzes e linhas brancas. Background animado de hero com 17 luzes verticais.",
  code: `<div className="relative h-[320px] w-full overflow-hidden rounded-lg">
  <LightLines>
    <div className="relative z-10 flex h-full items-center justify-center text-2xl font-semibold text-white">
      Light Lines
    </div>
  </LightLines>
</div>`,
  render: (
    <div className="relative h-[320px] w-full overflow-hidden rounded-lg">
      <LightLines>
        <div className="relative z-10 flex h-full items-center justify-center text-2xl font-semibold text-white">
          Light Lines
        </div>
      </LightLines>
    </div>
  ),
}

const lightLinesPurple: Example = {
  title: "Purple Theme",
  description:
    "Gradiente roxo (#6B21A8 → #A855F7) com velocidade reduzida (speedMultiplier 0.5) para um movimento mais sutil.",
  code: `<div className="relative h-[320px] w-full overflow-hidden rounded-lg">
  <LightLines
    gradientFrom="#6B21A8"
    gradientTo="#A855F7"
    speedMultiplier={0.5}
  >
    <div className="relative z-10 flex h-full items-center justify-center text-2xl font-semibold text-white">
      Purple Theme
    </div>
  </LightLines>
</div>`,
  render: (
    <div className="relative h-[320px] w-full overflow-hidden rounded-lg">
      <LightLines
        gradientFrom="#6B21A8"
        gradientTo="#A855F7"
        speedMultiplier={0.5}
      >
        <div className="relative z-10 flex h-full items-center justify-center text-2xl font-semibold text-white">
          Purple Theme
        </div>
      </LightLines>
    </div>
  ),
}

const lightLinesCyber: Example = {
  title: "Cyber/Dark",
  description:
    "Fundo escuro (#0f0f0f → #1a1a2e) com luzes verdes neon (#4ade80), linhas verdes a 0.1 de opacidade e velocidade acelerada (speedMultiplier 1.5).",
  code: `<div className="relative h-[320px] w-full overflow-hidden rounded-lg">
  <LightLines
    gradientFrom="#0f0f0f"
    gradientTo="#1a1a2e"
    lightColor="#4ade80"
    lineColor="#4ade80"
    linesOpacity={0.1}
    speedMultiplier={1.5}
  >
    <div className="relative z-10 flex h-full items-center justify-center text-2xl font-semibold text-white">
      Cyber Mode
    </div>
  </LightLines>
</div>`,
  render: (
    <div className="relative h-[320px] w-full overflow-hidden rounded-lg">
      <LightLines
        gradientFrom="#0f0f0f"
        gradientTo="#1a1a2e"
        lightColor="#4ade80"
        lineColor="#4ade80"
        linesOpacity={0.1}
        speedMultiplier={1.5}
      >
        <div className="relative z-10 flex h-full items-center justify-center text-2xl font-semibold text-white">
          Cyber Mode
        </div>
      </LightLines>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI light-lines component.
 * Keyed by component slug; consumed by the showcase.
 */
export const examplesLightLines: Record<string, Example[]> = {
  "light-lines": [lightLinesBasic, lightLinesPurple, lightLinesCyber],
}
