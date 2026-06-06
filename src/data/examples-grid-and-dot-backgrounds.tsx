import { GridAndDotBackgrounds } from "@/components/ui/grid-and-dot-backgrounds"
import type { Example } from "@/data/examples"

const gridBasic: Example = {
  title: "Grid",
  description:
    "Malha de linhas em CSS puro com fade radial nas bordas e heading sobreposto. As cores derivam dos tokens, adaptando a light/dark.",
  code: `<GridAndDotBackgrounds variant="grid" className="h-[24rem]">
  <h2 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
    Grid Background
  </h2>
  <p className="mt-3 max-w-md text-sm text-muted-foreground">
    Fundo de malha com máscara radial — nítido no centro, esmaecido nas bordas.
  </p>
</GridAndDotBackgrounds>`,
  render: (
    <GridAndDotBackgrounds variant="grid" className="h-[24rem]">
      <h2 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
        Grid Background
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Fundo de malha com máscara radial — nítido no centro, esmaecido nas
        bordas.
      </p>
    </GridAndDotBackgrounds>
  ),
}

const gridSmall: Example = {
  title: "Grid pequeno",
  description: "Mesma malha com células menores (20px) para uma textura densa.",
  code: `<GridAndDotBackgrounds variant="grid-small" className="h-[24rem]">
  <h2 className="text-3xl font-bold md:text-5xl">Small Grid</h2>
</GridAndDotBackgrounds>`,
  render: (
    <GridAndDotBackgrounds variant="grid-small" className="h-[24rem]">
      <h2 className="text-3xl font-bold md:text-5xl">Small Grid</h2>
    </GridAndDotBackgrounds>
  ),
}

const dotBasic: Example = {
  title: "Dot",
  description:
    "Padrão de pontos (radial-gradient) com a mesma máscara de fade. Cor customizada via prop lineColor.",
  code: `<GridAndDotBackgrounds
  variant="dot"
  lineColor="color-mix(in oklab, var(--primary) 60%, transparent)"
  className="h-[24rem]"
>
  <h2 className="text-3xl font-bold md:text-5xl">Dot Background</h2>
  <p className="mt-3 max-w-md text-sm text-muted-foreground">
    Pontos espaçados, ideais para heros e seções de destaque.
  </p>
</GridAndDotBackgrounds>`,
  render: (
    <GridAndDotBackgrounds
      variant="dot"
      lineColor="color-mix(in oklab, var(--primary) 60%, transparent)"
      className="h-[24rem]"
    >
      <h2 className="text-3xl font-bold md:text-5xl">Dot Background</h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Pontos espaçados, ideais para heros e seções de destaque.
      </p>
    </GridAndDotBackgrounds>
  ),
}

export const examplesGridAndDotBackgrounds: Record<string, Example[]> = {
  "grid-and-dot-backgrounds": [gridBasic, gridSmall, dotBasic],
}
