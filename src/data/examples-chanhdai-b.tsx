/**
 * Examples — lote chanhdai (B): exemplos data-driven para 5 componentes.
 * Cada entrada segue o tipo `Example` (title/description/code/render), com
 * `code` espelhando o JSX de `render`.
 */

import * as React from "react"
import type { Example } from "@/data/examples"
import { GitHubContributions } from "@/components/ui/github-contributions"
import { MiddleTruncation } from "@/components/ui/middle-truncation"
import { MobiusLoopIcon } from "@/components/ui/mobius-loop-icon"
import { ReactWheelPicker } from "@/components/ui/react-wheel-picker"
import { ScrollFadeEffect } from "@/components/ui/scroll-fade-effect"
import { generateContributions } from "@/data/examples-helpers"

/* -------------------------------------------------------------------------- */
/*                          dados compartilhados                              */
/* -------------------------------------------------------------------------- */

const contribData = generateContributions(52)

const hours: React.ComponentProps<typeof ReactWheelPicker>["options"] = Array.from(
  { length: 12 },
  (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  })
)

/* -------------------------------------------------------------------------- */
/*                            github-contributions                            */
/* -------------------------------------------------------------------------- */

const githubContributionsGreenExample: Example = {
  title: "Escala verde",
  description: "Heatmap de contribuições no estilo GitHub com escala verde.",
  code: `<div className="w-full overflow-x-auto">
  <GitHubContributions data={contribData} colorScale="green" />
</div>`,
  render: (
    <div className="w-full overflow-x-auto">
      <GitHubContributions data={contribData} colorScale="green" />
    </div>
  ),
}

const githubContributionsShadcnExample: Example = {
  title: "Escala shadcn (30 semanas)",
  description: "Mesmo heatmap com escala monocromática shadcn e 30 semanas.",
  code: `<div className="w-full overflow-x-auto">
  <GitHubContributions data={contribData} colorScale="shadcn" weeks={30} />
</div>`,
  render: (
    <div className="w-full overflow-x-auto">
      <GitHubContributions data={contribData} colorScale="shadcn" weeks={30} />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                              middle-truncation                             */
/* -------------------------------------------------------------------------- */

const middleTruncationExample: Example = {
  title: "Truncamento no meio",
  description:
    "Preserva início e fim do texto, escondendo o miolo — ideal para hashes, paths e emails.",
  code: `<div className="font-mono text-sm space-y-1">
  <MiddleTruncation text="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" maxLength={20} />
  <MiddleTruncation text="/usr/local/share/applications/components/vitrine.tsx" maxLength={28} />
  <MiddleTruncation text="contato.suporte.equipe@empresa-exemplo.com.br" maxLength={24} />
</div>`,
  render: (
    <div className="font-mono text-sm space-y-1">
      <MiddleTruncation
        text="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        maxLength={20}
        as="div"
      />
      <MiddleTruncation
        text="/usr/local/share/applications/components/vitrine.tsx"
        maxLength={28}
        as="div"
      />
      <MiddleTruncation
        text="contato.suporte.equipe@empresa-exemplo.com.br"
        maxLength={24}
        as="div"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                              mobius-loop-icon                              */
/* -------------------------------------------------------------------------- */

const mobiusLoopSpeedsExample: Example = {
  title: "Velocidades",
  description: "O mesmo ícone animado em três velocidades.",
  code: `<div className="text-foreground flex gap-6 items-center">
  <MobiusLoopIcon size={32} speed="slow" />
  <MobiusLoopIcon size={32} speed="normal" />
  <MobiusLoopIcon size={32} speed="fast" />
</div>`,
  render: (
    <div className="text-foreground flex gap-6 items-center">
      <MobiusLoopIcon size={32} speed="slow" />
      <MobiusLoopIcon size={32} speed="normal" />
      <MobiusLoopIcon size={32} speed="fast" />
    </div>
  ),
}

const mobiusLoopGradientExample: Example = {
  title: "Gradiente customizado",
  description: "Cores de gradiente personalizadas via prop `colors`.",
  code: `<div className="text-foreground flex gap-6 items-center">
  <MobiusLoopIcon colors={["#6366f1", "#ec4899", "#f59e0b"]} size={48} />
</div>`,
  render: (
    <div className="text-foreground flex gap-6 items-center">
      <MobiusLoopIcon colors={["#6366f1", "#ec4899", "#f59e0b"]} size={48} />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             react-wheel-picker                             */
/* -------------------------------------------------------------------------- */

const reactWheelPickerExample: Example = {
  title: "Seletor de horas",
  description: "Picker estilo roda com seleção de 1 a 12.",
  code: `const hours = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}))

<div className="w-32 mx-auto">
  <ReactWheelPicker options={hours} defaultValue="3" />
</div>`,
  render: (
    <div className="w-32 mx-auto">
      <ReactWheelPicker options={hours} defaultValue="3" />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             scroll-fade-effect                             */
/* -------------------------------------------------------------------------- */

const scrollFadeExample: Example = {
  title: "Fade vertical",
  description:
    "Lista longa com gradiente de fade nas bordas conforme o scroll — requer altura fixa no wrapper.",
  code: `<ScrollFadeEffect className="h-48 w-full max-w-sm rounded-lg border border-border">
  <div className="space-y-2 p-4">
    {Array.from({ length: 15 }, (_, i) => (
      <p key={i} className="text-sm">Item {i + 1}</p>
    ))}
  </div>
</ScrollFadeEffect>`,
  render: (
    <ScrollFadeEffect className="h-48 w-full max-w-sm rounded-lg border border-border">
      <div className="space-y-2 p-4">
        {Array.from({ length: 15 }, (_, i) => (
          <p key={i} className="text-sm">
            Item {i + 1}
          </p>
        ))}
      </div>
    </ScrollFadeEffect>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                   */
/* -------------------------------------------------------------------------- */

export const examplesChanhdaiB: Record<string, Example[]> = {
  "github-contributions": [
    githubContributionsGreenExample,
    githubContributionsShadcnExample,
  ],
  "middle-truncation": [middleTruncationExample],
  "mobius-loop-icon": [mobiusLoopSpeedsExample, mobiusLoopGradientExample],
  "react-wheel-picker": [reactWheelPickerExample],
  "scroll-fade-effect": [scrollFadeExample],
}
