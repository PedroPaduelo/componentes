import { AnimatedButton } from "@/components/ui/animated-button"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                           animated-button                                  */
/* -------------------------------------------------------------------------- */

const animatedButtonDefault: Example = {
  title: "Básico",
  description:
    "Botão animado com efeito padrão — text reveal e borda brilhante.",
  code: `<AnimatedButton>
  Get Started
</AnimatedButton>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <AnimatedButton>Get Started</AnimatedButton>
    </div>
  ),
}

const animatedButtonCustom: Example = {
  title: "Estilo customizado",
  description: "Sobrescreve cores de fundo e borda via className.",
  code: `<AnimatedButton className="bg-blue-500 text-white border-transparent">
  Custom Style
</AnimatedButton>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <AnimatedButton className="bg-blue-500 text-white border-transparent">
        Custom Style
      </AnimatedButton>
    </div>
  ),
}

const animatedButtonDisabled: Example = {
  title: "Desabilitado",
  description: "Estado desabilitado (opacidade reduzida via atributo nativo).",
  code: `<AnimatedButton disabled>
  Disabled
</AnimatedButton>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <AnimatedButton disabled>Disabled</AnimatedButton>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI animated-button batch.
 * Keyed by component slug; consumed by the showcase.
 */
export const animatedButtonExamples: Record<string, Example[]> = {
  "animated-button": [
    animatedButtonDefault,
    animatedButtonCustom,
    animatedButtonDisabled,
  ],
}
