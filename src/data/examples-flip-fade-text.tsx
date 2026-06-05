import { FlipFadeText } from "@/components/ui/flip-fade-text"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                            flip-fade-text                                  */
/* -------------------------------------------------------------------------- */

const flipFadeTextDefault: Example = {
  title: "Básico",
  description:
    "Ciclo padrão com 5 palavras técnicas (LOADING, COMPUTING, SEARCHING, RETRIEVING, ASSEMBLING) e intervalo de 2500ms.",
  code: `<FlipFadeText />`,
  render: (
    <div className="flex items-center justify-center py-10">
      <FlipFadeText />
    </div>
  ),
}

const flipFadeTextCustomWords: Example = {
  title: "Palavras customizadas",
  description:
    "Array de palavras próprio + intervalo menor (2000ms) para ciclo mais dinâmico.",
  code: `<FlipFadeText
  words={["SYNCING", "PROCESSING", "ANALYZING", "OPTIMIZING"]}
  interval={2000}
/>`,
  render: (
    <div className="flex items-center justify-center py-10">
      <FlipFadeText
        words={["SYNCING", "PROCESSING", "ANALYZING", "OPTIMIZING"]}
        interval={2000}
      />
    </div>
  ),
}

const flipFadeTextFast: Example = {
  title: "Animação rápida",
  description:
    "Letras curtas e tempos de animação menores — efeito \"snappy\" para ações ágeis.",
  code: `<FlipFadeText
  words={["FAST", "QUICK", "RAPID", "SWIFT"]}
  interval={1500}
  letterDuration={0.3}
  staggerDelay={0.05}
  exitStaggerDelay={0.02}
/>`,
  render: (
    <div className="flex items-center justify-center py-10">
      <FlipFadeText
        words={["FAST", "QUICK", "RAPID", "SWIFT"]}
        interval={1500}
        letterDuration={0.3}
        staggerDelay={0.05}
        exitStaggerDelay={0.02}
      />
    </div>
  ),
}

const flipFadeTextCustomStyling: Example = {
  title: "Estilização customizada",
  description:
    "Sobrescreve tipografia/cor via `textClassName` — efeito azul grande, ideal para hero.",
  code: `<FlipFadeText
  words={["HELLO", "WORLD"]}
  textClassName="text-5xl md:text-7xl text-blue-600 dark:text-blue-400"
  interval={3000}
/>`,
  render: (
    <div className="flex items-center justify-center py-10">
      <FlipFadeText
        words={["HELLO", "WORLD"]}
        textClassName="text-5xl md:text-7xl text-blue-600 dark:text-blue-400"
        interval={3000}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI flip-fade-text batch.
 * Keyed by component slug; consumed by the showcase.
 */
export const examplesFlipFadeText: Record<string, Example[]> = {
  "flip-fade-text": [
    flipFadeTextDefault,
    flipFadeTextCustomWords,
    flipFadeTextFast,
    flipFadeTextCustomStyling,
  ],
}
