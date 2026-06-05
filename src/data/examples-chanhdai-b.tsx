/**
 * Examples — lote chanhdai (B): exemplos data-driven para 5 componentes.
 * Cada entrada segue o tipo `Example` (title/description/code/render), com
 * `code` espelhando o JSX de `render`.
 */

import * as React from "react"
import type { Example } from "@/data/examples"
import { GitHubContributions } from "@/components/ui/github-contributions"
import { Label } from "@/components/ui/label"
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

const days: React.ComponentProps<typeof ReactWheelPicker>["options"] = Array.from(
  { length: 31 },
  (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: String(i + 1).padStart(2, "0"),
  })
)

const months: React.ComponentProps<typeof ReactWheelPicker>["options"] = Array.from(
  { length: 12 },
  (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: String(i + 1).padStart(2, "0"),
  })
)

const years: React.ComponentProps<typeof ReactWheelPicker>["options"] = Array.from(
  { length: 11 },
  (_, i) => ({
    value: String(2020 + i),
    label: String(2020 + i),
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
  code: `<div className="space-y-1">
  <MiddleTruncation text="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" maxLength={20} ellipsis="..." />
  <MiddleTruncation text="/usr/local/share/applications/components/vitrine.tsx" maxLength={28} ellipsis="..." />
  <MiddleTruncation text="contato.suporte.equipe@empresa-exemplo.com.br" maxLength={24} ellipsis="..." />
</div>`,
  render: (
    <div className="space-y-1">
      <MiddleTruncation
        text="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        maxLength={20}
        ellipsis="..."
        as="div"
      />
      <MiddleTruncation
        text="/usr/local/share/applications/components/vitrine.tsx"
        maxLength={28}
        ellipsis="..."
        as="div"
      />
      <MiddleTruncation
        text="contato.suporte.equipe@empresa-exemplo.com.br"
        maxLength={24}
        ellipsis="..."
        as="div"
      />
    </div>
  ),
}

const middleTruncationMinEndExample: Example = {
  title: "Preservar fim (minEnd)",
  description:
    "Garante que os últimos N caracteres nunca sejam cortados — útil para preservar a extensão de um path.",
  code: `<div className="space-y-1">
  <MiddleTruncation
    text="/usr/local/share/applications/components/button.tsx"
    maxLength={28}
    minEnd={4}
    ellipsis="..."
  />
</div>`,
  render: (
    <div className="space-y-1">
      <MiddleTruncation
        text="/usr/local/share/applications/components/button.tsx"
        maxLength={28}
        minEnd={4}
        ellipsis="..."
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
  <div className="grid gap-1.5">
    <Label htmlFor="hours">Horas</Label>
    <ReactWheelPicker id="hours" options={hours} defaultValue="3" />
  </div>
</div>`,
  render: (
    <div className="w-32 mx-auto">
      <div className="grid gap-1.5">
        <Label htmlFor="hours">Horas</Label>
        <ReactWheelPicker id="hours" options={hours} defaultValue="3" />
      </div>
    </div>
  ),
}

const reactWheelPickerDateExample: Example = {
  title: "Data (dia / mês / ano)",
  description:
    "Date picker com 3 colunas sincronizadas — Dia, Mês e Ano lado a lado.",
  code: `const days = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: String(i + 1).padStart(2, "0"),
}))
const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: String(i + 1).padStart(2, "0"),
}))
const years = Array.from({ length: 11 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}))

<div className="flex items-end justify-center gap-4">
  <div className="grid gap-1.5">
    <Label htmlFor="day">Dia</Label>
    <ReactWheelPicker id="day" options={days} defaultValue="15" className="w-24" />
  </div>
  <div className="grid gap-1.5">
    <Label htmlFor="month">Mês</Label>
    <ReactWheelPicker id="month" options={months} defaultValue="06" className="w-24" />
  </div>
  <div className="grid gap-1.5">
    <Label htmlFor="year">Ano</Label>
    <ReactWheelPicker id="year" options={years} defaultValue="2025" className="w-28" />
  </div>
</div>`,
  render: (
    <div className="flex items-end justify-center gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="day">Dia</Label>
        <ReactWheelPicker id="day" options={days} defaultValue="15" className="w-24" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="month">Mês</Label>
        <ReactWheelPicker
          id="month"
          options={months}
          defaultValue="06"
          className="w-24"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="year">Ano</Label>
        <ReactWheelPicker
          id="year"
          options={years}
          defaultValue="2025"
          className="w-28"
        />
      </div>
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
  "middle-truncation": [middleTruncationExample, middleTruncationMinEndExample],
  "mobius-loop-icon": [mobiusLoopSpeedsExample, mobiusLoopGradientExample],
  "react-wheel-picker": [reactWheelPickerExample, reactWheelPickerDateExample],
  "scroll-fade-effect": [scrollFadeExample],
}
