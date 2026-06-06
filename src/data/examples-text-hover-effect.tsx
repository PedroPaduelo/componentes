import { TextHoverEffect } from "@/components/ui/text-hover-effect"

import type { Example } from "@/data/examples"

const textHoverEffectBasicExample: Example = {
  title: "Básico",
  description:
    "Passe o mouse sobre o texto: o stroke base aparece suavemente e o gradiente radial revela o preenchimento multicolor seguindo o cursor.",
  code: `import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export function Demo() {
  return (
    <div className="w-full">
      <TextHoverEffect text="Hover me" />
    </div>
  )
}`,
  render: (
    <div className="w-full">
      <TextHoverEffect text="Hover me" />
    </div>
  ),
}

const textHoverEffectAnimatedExample: Example = {
  title: "Suavizado",
  description:
    "Com `duration` maior, o radial mask desliza suavemente até o cursor (efeito prazeroso de 'atraso').",
  code: `import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export function Demo() {
  return (
    <div className="w-full">
      <TextHoverEffect text="Aceleração" duration={0.6} />
    </div>
  )
}`,
  render: (
    <div className="w-full">
      <TextHoverEffect text="Aceleração" duration={0.6} />
    </div>
  ),
}

const textHoverEffectDenseExample: Example = {
  title: "Densidade relaxed",
  description:
    "Variante relaxed: container mais alto, melhor para títulos/headings longos.",
  code: `import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export function Demo() {
  return (
    <div className="w-full">
      <TextHoverEffect
        text="componentes"
        density="relaxed"
        duration={0.4}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full">
      <TextHoverEffect
        text="componentes"
        density="relaxed"
        duration={0.4}
      />
    </div>
  ),
}

const textHoverEffectCustomGradientExample: Example = {
  title: "Gradiente custom",
  description:
    "Passe `gradientStops` para trocar a paleta signature (amarelo/vermelho/azul/ciano/violeta) por uma de sua marca.",
  code: `import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export function Demo() {
  return (
    <div className="w-full">
      <TextHoverEffect
        text="sunset"
        duration={0.5}
        gradientStops={[
          { offset: "0%", color: "#fb923c" },
          { offset: "50%", color: "#f43f5e" },
          { offset: "100%", color: "#a855f7" },
        ]}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full">
      <TextHoverEffect
        text="sunset"
        duration={0.5}
        gradientStops={[
          { offset: "0%", color: "#fb923c" },
          { offset: "50%", color: "#f43f5e" },
          { offset: "100%", color: "#a855f7" },
        ]}
      />
    </div>
  ),
}

export const examplesTextHoverEffect: Record<string, Example[]> = {
  "text-hover-effect": [
    textHoverEffectBasicExample,
    textHoverEffectAnimatedExample,
    textHoverEffectDenseExample,
    textHoverEffectCustomGradientExample,
  ],
}
