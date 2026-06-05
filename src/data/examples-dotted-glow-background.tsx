/**
 * Examples — Dotted Glow Background (Aceternity UI).
 *
 * Camada de fundo em canvas com grade de pontos que pulsam (alpha animado) e
 * brilham (glow). Reage ao tema light/dark via CSS variables.
 *
 * Sem imagem remota: usamos conteúdo simples + ícone lucide / botão do projeto.
 * `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

const dottedGlowBasicExample: Example = {
  title: "Básico",
  description:
    "Pontos pulsando atrás de um conteúdo contido. Cores seguem o tema via CSS variables.",
  code: `<div className="relative h-[360px] w-full overflow-hidden rounded-lg border">
  <DottedGlowBackground
    colorLightVar="--color-neutral-500"
    colorDarkVar="--color-neutral-400"
    glowColorLightVar="--color-sky-500"
    glowColorDarkVar="--color-sky-400"
  />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-lg font-medium text-foreground">
      Dotted Glow Background
    </p>
  </div>
</div>`,
  render: (
    <div className="relative h-[360px] w-full overflow-hidden rounded-lg border">
      <DottedGlowBackground
        colorLightVar="--color-neutral-500"
        colorDarkVar="--color-neutral-400"
        glowColorLightVar="--color-sky-500"
        glowColorDarkVar="--color-sky-400"
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-lg font-medium text-foreground">
          Dotted Glow Background
        </p>
      </div>
    </div>
  ),
}

const dottedGlowCtaExample: Example = {
  title: "CTA",
  description:
    "Chamada para ação sobre o fundo de pontos, com glow mais intenso e pontos maiores.",
  code: `<div className="relative h-[360px] w-full overflow-hidden rounded-lg border">
  <DottedGlowBackground
    gap={16}
    radius={2.5}
    opacity={0.7}
    colorLightVar="--color-neutral-500"
    colorDarkVar="--color-neutral-300"
    glowColorLightVar="--color-violet-500"
    glowColorDarkVar="--color-violet-400"
    backgroundOpacity={0.35}
  />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
    <Sparkles className="size-8 text-foreground" />
    <h3 className="text-2xl font-semibold text-foreground">
      Construa interfaces que brilham
    </h3>
    <p className="max-w-md text-sm text-muted-foreground">
      Um fundo animado, leve e reativo ao tema — pronto pra colocar atrás
      do seu próximo hero.
    </p>
    <Button>Começar agora</Button>
  </div>
</div>`,
  render: (
    <div className="relative h-[360px] w-full overflow-hidden rounded-lg border">
      <DottedGlowBackground
        gap={16}
        radius={2.5}
        opacity={0.7}
        colorLightVar="--color-neutral-500"
        colorDarkVar="--color-neutral-300"
        glowColorLightVar="--color-violet-500"
        glowColorDarkVar="--color-violet-400"
        backgroundOpacity={0.35}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <Sparkles className="size-8 text-foreground" />
        <h3 className="text-2xl font-semibold text-foreground">
          Construa interfaces que brilham
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Um fundo animado, leve e reativo ao tema — pronto pra colocar atrás
          do seu próximo hero.
        </p>
        <Button>Começar agora</Button>
      </div>
    </div>
  ),
}

export const examplesDottedGlowBackground: Record<string, Example[]> = {
  "dotted-glow-background": [dottedGlowBasicExample, dottedGlowCtaExample],
}
