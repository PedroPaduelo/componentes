import * as React from "react"
import type { Example } from "@/data/examples"
import { CodeBlockCommand } from "@/components/ui/code-block-command"
import { DotGridSpotlight } from "@/components/ui/dot-grid-spotlight"
import { FluidGradientText } from "@/components/ui/fluid-gradient-text"
import { GlowCardGrid, GlowCard } from "@/components/ui/glow-card-grid"
import { ShimmeringText } from "@/components/ui/shimmering-text"

/* -------------------------------------------------------------------------- */
/*                            code-block-command                              */
/* -------------------------------------------------------------------------- */

const codeBlockCommandBasic: Example = {
  title: "Básico",
  description: "Bloco de comando de shell com syntax highlight e botão de copiar.",
  code: `<CodeBlockCommand code="npm install @tanstack/react-query" />`,
  render: (
    <div className="w-full">
      <CodeBlockCommand code="npm install @tanstack/react-query" />
    </div>
  ),
}

const codeBlockCommandGhost: Example = {
  title: "Variante ghost",
  description: "Versão sem fundo/borda destacados, ideal para inline em docs.",
  code: `<CodeBlockCommand
  code="npx shadcn@latest add button"
  variant="ghost"
  language="shell"
/>`,
  render: (
    <div className="w-full">
      <CodeBlockCommand
        code="npx shadcn@latest add button"
        variant="ghost"
        language="shell"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             dot-grid-spotlight                             */
/* -------------------------------------------------------------------------- */

const dotGridSpotlightBasic: Example = {
  title: "Básico",
  description: "Fundo de grade de pontos revelados por um spotlight que segue o cursor.",
  code: `<DotGridSpotlight className="flex h-64 w-full items-center justify-center rounded-lg border border-border">
  <span className="text-sm text-muted-foreground">Passe o mouse aqui</span>
</DotGridSpotlight>`,
  render: (
    <DotGridSpotlight className="flex h-64 w-full items-center justify-center rounded-lg border border-border">
      <span className="text-sm text-muted-foreground">Passe o mouse aqui</span>
    </DotGridSpotlight>
  ),
}

const dotGridSpotlightCustom: Example = {
  title: "Personalizado",
  description: "Ajuste de espaçamento, tamanho dos pontos e raio do spotlight.",
  code: `<DotGridSpotlight
  dotSpacing={18}
  dotSize={1.5}
  spotlightSize={220}
  className="flex h-64 w-full items-center justify-center rounded-lg border border-border"
>
  <span className="text-sm font-medium">Grade densa</span>
</DotGridSpotlight>`,
  render: (
    <DotGridSpotlight
      dotSpacing={18}
      dotSize={1.5}
      spotlightSize={220}
      className="flex h-64 w-full items-center justify-center rounded-lg border border-border"
    >
      <span className="text-sm font-medium">Grade densa</span>
    </DotGridSpotlight>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             fluid-gradient-text                            */
/* -------------------------------------------------------------------------- */

const fluidGradientTextHeading: Example = {
  title: "Título",
  description: "Texto com gradiente animado fluido, ideal para destaques.",
  code: `<FluidGradientText as="h1" className="text-4xl font-bold">
  Gradiente animado
</FluidGradientText>`,
  render: (
    <FluidGradientText as="h1" className="text-4xl font-bold">
      Gradiente animado
    </FluidGradientText>
  ),
}

const fluidGradientTextInline: Example = {
  title: "Inline rápido",
  description: "Aplicado em trecho inline com animação acelerada.",
  code: `<p className="text-lg">
  Construído com{" "}
  <FluidGradientText speed="fast" className="font-semibold">
    React + Tailwind
  </FluidGradientText>
</p>`,
  render: (
    <p className="text-lg">
      Construído com{" "}
      <FluidGradientText speed="fast" className="font-semibold">
        React + Tailwind
      </FluidGradientText>
    </p>
  ),
}

/* -------------------------------------------------------------------------- */
/*                               glow-card-grid                               */
/* -------------------------------------------------------------------------- */

const glowCardGridBasic: Example = {
  title: "Grade de cards",
  description: "Grade responsiva de cards com efeito de brilho que segue o cursor.",
  code: `<GlowCardGrid columns={3}>
  <GlowCard>
    <span className="text-sm font-medium">Card 1</span>
  </GlowCard>
  <GlowCard>
    <span className="text-sm font-medium">Card 2</span>
  </GlowCard>
  <GlowCard>
    <span className="text-sm font-medium">Card 3</span>
  </GlowCard>
</GlowCardGrid>`,
  render: (
    <GlowCardGrid columns={3}>
      <GlowCard>
        <span className="text-sm font-medium">Card 1</span>
      </GlowCard>
      <GlowCard>
        <span className="text-sm font-medium">Card 2</span>
      </GlowCard>
      <GlowCard>
        <span className="text-sm font-medium">Card 3</span>
      </GlowCard>
    </GlowCardGrid>
  ),
}

/* -------------------------------------------------------------------------- */
/*                               shimmering-text                              */
/* -------------------------------------------------------------------------- */

const shimmeringTextBasic: Example = {
  title: "Estado de carregamento",
  description: "Texto com efeito de brilho deslizante para indicar carregamento.",
  code: `<ShimmeringText as="h2" className="text-2xl font-semibold">
  Carregando…
</ShimmeringText>`,
  render: (
    <ShimmeringText as="h2" className="text-2xl font-semibold">
      Carregando…
    </ShimmeringText>
  ),
}

const shimmeringTextInline: Example = {
  title: "Inline com duração custom",
  description: "Trecho inline com animação mais lenta.",
  code: `<p className="text-base">
  Status:{" "}
  <ShimmeringText duration={3} className="font-medium">
    Sincronizando dados
  </ShimmeringText>
</p>`,
  render: (
    <p className="text-base">
      Status:{" "}
      <ShimmeringText duration={3} className="font-medium">
        Sincronizando dados
      </ShimmeringText>
    </p>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the chanhdai "a" batch.
 * Keyed by component slug; consumed by the showcase.
 *
 * The `React` namespace import is required by project convention even
 * though `jsx: "react-jsx"` makes the runtime reference implicit.
 * The `_reactAnchor` constant below anchors the namespace at the value
 * level so `noUnusedLocals` stays happy without affecting runtime output.
 */
const _reactAnchor: React.ReactElement | null = null
void _reactAnchor

export const examplesChanhdaiA: Record<string, Example[]> = {
  "code-block-command": [codeBlockCommandBasic, codeBlockCommandGhost],
  "dot-grid-spotlight": [dotGridSpotlightBasic, dotGridSpotlightCustom],
  "fluid-gradient-text": [fluidGradientTextHeading, fluidGradientTextInline],
  "glow-card-grid": [glowCardGridBasic],
  "shimmering-text": [shimmeringTextBasic, shimmeringTextInline],
}
