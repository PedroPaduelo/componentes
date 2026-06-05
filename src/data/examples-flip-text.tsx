import { FlipText } from "@/components/ui/flip-text"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                               flip-text                                    */
/* -------------------------------------------------------------------------- */

const flipTextBasicExample: Example = {
  title: "Básico",
  description:
    "Cada caractere rotaciona no eixo X com timing staggered (sine wave), criando uma onda 3D contínua.",
  code: `<FlipText
  className="text-4xl font-bold text-foreground"
  duration={2.2}
>
  Build beautiful interfaces
</FlipText>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <FlipText
        className="text-4xl font-bold text-foreground"
        duration={2.2}
      >
        Build beautiful interfaces
      </FlipText>
    </div>
  ),
}

const flipTextDurationExample: Example = {
  title: "Duração custom",
  description:
    "Duas animações lado a lado comparando durações: rápida (1.5s) e lenta (3.5s).",
  code: `<div className="flex flex-col gap-8 items-center">
  <FlipText className="text-2xl font-semibold" duration={1.5}>
    Fast Animation
  </FlipText>
  <FlipText className="text-2xl font-semibold" duration={3.5}>
    Slow Animation
  </FlipText>
</div>`,
  render: (
    <div className="flex flex-col items-center gap-8 py-6">
      <FlipText className="text-2xl font-semibold" duration={1.5}>
        Fast Animation
      </FlipText>
      <FlipText className="text-2xl font-semibold" duration={3.5}>
        Slow Animation
      </FlipText>
    </div>
  ),
}

const flipTextDelayExample: Example = {
  title: "Com delay",
  description:
    "A onda 3D começa 0.5s após o mount — útil para sincronizar com outros elementos.",
  code: `<FlipText
  className="text-3xl font-bold"
  duration={2.2}
  delay={0.5}
>
  Delayed Start
</FlipText>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <FlipText
        className="text-3xl font-bold"
        duration={2.2}
        delay={0.5}
      >
        Delayed Start
      </FlipText>
    </div>
  ),
}

const flipTextStylesExample: Example = {
  title: "Estilos diferentes",
  description:
    "Combinações de tipografia e cor — o componente herda a cor via `currentColor`.",
  code: `<div className="flex flex-col gap-8 items-center">
  <FlipText className="text-5xl font-black text-blue-600 dark:text-blue-400">
    Bold & Colorful
  </FlipText>
  <FlipText className="text-3xl font-light italic text-muted-foreground">
    Light & Italic
  </FlipText>
  <FlipText className="text-2xl font-mono tracking-wider">
    Monospace Text
  </FlipText>
</div>`,
  render: (
    <div className="flex flex-col items-center gap-8 py-6">
      <FlipText className="text-5xl font-black text-blue-600 dark:text-blue-400">
        Bold & Colorful
      </FlipText>
      <FlipText className="text-3xl font-light italic text-muted-foreground">
        Light & Italic
      </FlipText>
      <FlipText className="text-2xl font-mono tracking-wider">
        Monospace Text
      </FlipText>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI flip-text batch.
 * Keyed by component slug; consumed by the showcase.
 */
export const examplesFlipText: Record<string, Example[]> = {
  "flip-text": [
    flipTextBasicExample,
    flipTextDurationExample,
    flipTextDelayExample,
    flipTextStylesExample,
  ],
}
