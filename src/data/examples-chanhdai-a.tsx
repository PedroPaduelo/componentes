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

const fluidGradientTextBasic: Example = {
  title: "Básico",
  description: "Texto com gradiente fluido em SVG que segue o cursor do mouse.",
  code: `<div className="w-full text-foreground">
  <FluidGradientText text="shadcn" />
</div>`,
  render: (
    <div className="w-full text-foreground">
      <FluidGradientText text="shadcn" />
    </div>
  ),
}

const fluidGradientTextCustom: Example = {
  title: "Texto customizado",
  description: "Variando o texto e a altura do viewBox para um layout diferente.",
  code: `<div className="w-full text-foreground">
  <FluidGradientText text="vitrine" svgViewBoxHeight={200} />
</div>`,
  render: (
    <div className="w-full text-foreground">
      <FluidGradientText text="vitrine" svgViewBoxHeight={200} />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                               glow-card-grid                               */
/* -------------------------------------------------------------------------- */

const glowCardGridBasic: Example = {
  title: "Grade de cards",
  description: "Grade responsiva de cards com efeito de brilho que segue o cursor.",
  code: `<GlowCardGrid columns={3}>
  <GlowCard icon="https://unavatar.io/x/shadcn" iconAlt="shadcn">
    <h2 className="text-base leading-none font-semibold text-foreground">shadcn</h2>
    <p className="text-sm leading-none text-foreground/50">@shadcn</p>
  </GlowCard>
  <GlowCard icon="https://unavatar.io/x/orcdev" iconAlt="OrcDev">
    <h2 className="text-base leading-none font-semibold text-foreground">OrcDev</h2>
    <p className="text-sm leading-none text-foreground/50">@orcdev</p>
  </GlowCard>
  <GlowCard icon="https://unavatar.io/x/davidhdev" iconAlt="David Haz">
    <h2 className="text-base leading-none font-semibold text-foreground">David Haz</h2>
    <p className="text-sm leading-none text-foreground/50">@davidhdev</p>
  </GlowCard>
  <GlowCard icon="https://unavatar.io/x/shuding" iconAlt="Shu">
    <h2 className="text-base leading-none font-semibold text-foreground">Shu</h2>
    <p className="text-sm leading-none text-foreground/50">@shuding</p>
  </GlowCard>
  <GlowCard icon="https://unavatar.io/x/emilkowalski" iconAlt="Emil Kowalski">
    <h2 className="text-base leading-none font-semibold text-foreground">Emil Kowalski</h2>
    <p className="text-sm leading-none text-foreground/50">@emilkowalski</p>
  </GlowCard>
  <GlowCard icon="https://unavatar.io/x/iamncdai" iconAlt="Chánh Đại">
    <h2 className="text-base leading-none font-semibold text-foreground">Chánh Đại</h2>
    <p className="text-sm leading-none text-foreground/50">@iamncdai</p>
  </GlowCard>
</GlowCardGrid>`,
  render: (
    <GlowCardGrid columns={3}>
      <GlowCard icon="https://unavatar.io/x/shadcn" iconAlt="shadcn">
        <h2 className="text-base leading-none font-semibold text-foreground">shadcn</h2>
        <p className="text-sm leading-none text-foreground/50">@shadcn</p>
      </GlowCard>
      <GlowCard icon="https://unavatar.io/x/orcdev" iconAlt="OrcDev">
        <h2 className="text-base leading-none font-semibold text-foreground">OrcDev</h2>
        <p className="text-sm leading-none text-foreground/50">@orcdev</p>
      </GlowCard>
      <GlowCard icon="https://unavatar.io/x/davidhdev" iconAlt="David Haz">
        <h2 className="text-base leading-none font-semibold text-foreground">David Haz</h2>
        <p className="text-sm leading-none text-foreground/50">@davidhdev</p>
      </GlowCard>
      <GlowCard icon="https://unavatar.io/x/shuding" iconAlt="Shu">
        <h2 className="text-base leading-none font-semibold text-foreground">Shu</h2>
        <p className="text-sm leading-none text-foreground/50">@shuding</p>
      </GlowCard>
      <GlowCard icon="https://unavatar.io/x/emilkowalski" iconAlt="Emil Kowalski">
        <h2 className="text-base leading-none font-semibold text-foreground">Emil Kowalski</h2>
        <p className="text-sm leading-none text-foreground/50">@emilkowalski</p>
      </GlowCard>
      <GlowCard icon="https://unavatar.io/x/iamncdai" iconAlt="Chánh Đại">
        <h2 className="text-base leading-none font-semibold text-foreground">Chánh Đại</h2>
        <p className="text-sm leading-none text-foreground/50">@iamncdai</p>
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

const shimmeringTextCustomColor: Example = {
  title: "Cores customizadas",
  description: "Customize as cores base e do highlight via props (exemplo amarelo do chanhdai).",
  code: `<ShimmeringText
  color="#fbbf24"
  shimmerColor="#ca8a04"
  className="text-2xl font-semibold"
>
  Processing your request with AI …
</ShimmeringText>`,
  render: (
    <ShimmeringText
      color="#fbbf24"
      shimmerColor="#ca8a04"
      className="text-2xl font-semibold"
    >
      Processing your request with AI …
    </ShimmeringText>
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
  "fluid-gradient-text": [fluidGradientTextBasic, fluidGradientTextCustom],
  "glow-card-grid": [glowCardGridBasic],
  "shimmering-text": [shimmeringTextBasic, shimmeringTextInline, shimmeringTextCustomColor],
}
