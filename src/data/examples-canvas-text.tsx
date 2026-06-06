import { CanvasText } from "@/components/ui/canvas-text"
import type { Example } from "@/data/examples"

const canvasTextHeroExample: Example = {
  title: "Hero Headline",
  description:
    "Texto grande com efeito de linhas onduladas coloridas — ideal para hero sections.",
  code: `<CanvasText
  text="Canvas Text Effect"
  className="text-6xl font-bold"
/>`,
  render: (
    <div className="flex items-center justify-center rounded-xl border border-border bg-background p-8">
      <CanvasText
        text="Canvas Text Effect"
        className="text-6xl font-bold"
      />
    </div>
  ),
}

const canvasTextCustomColorsExample: Example = {
  title: "Cores customizadas",
  description:
    "Paleta de cores e intensidade de curva configuráveis.",
  code: `<CanvasText
  text="Ondas em tons quentes"
  className="text-4xl font-bold"
  colors={["#ff6b35", "#f7c59f", "#efefd0", "#004e89", "#1a659e"]}
  curveIntensity={40}
  animationDuration={3}
/>`,
  render: (
    <div className="flex items-center justify-center rounded-xl border border-border bg-background p-8">
      <CanvasText
        text="Ondas em tons quentes"
        className="text-4xl font-bold"
        colors={["#ff6b35", "#f7c59f", "#efefd0", "#004e89", "#1a659e"]}
        curveIntensity={40}
        animationDuration={3}
      />
    </div>
  ),
}

export const examplesCanvasText: Record<string, Example[]> = {
  "canvas-text": [canvasTextHeroExample, canvasTextCustomColorsExample],
}
