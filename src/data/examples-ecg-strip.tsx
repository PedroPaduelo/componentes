import { EcgStrip } from "@/components/ui/ecg-strip"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Faixa de batimento (ECG) animada",
  description:
    "Onda de ECG varrendo horizontalmente via requestAnimationFrame, com glow na cor do traço. A altura vem do container; ajuste `color`, `speed` e `amplitude`.",
  code: `import { EcgStrip } from "@/components/ui/ecg-strip"

export function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-14 rounded-lg border border-border bg-card px-2">
        <EcgStrip />
      </div>
      <div className="h-14 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#f43f5e" speed={2} amplitude={32} />
      </div>
    </div>
  )
}`,
  render: (
    <div className="flex w-full flex-col gap-4">
      <div className="h-14 rounded-lg border border-border bg-card px-2">
        <EcgStrip />
      </div>
      <div className="h-14 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#f43f5e" speed={2} amplitude={32} />
      </div>
    </div>
  ),
}

const pausedExample: Example = {
  title: "Congelado e em cor de status",
  description:
    "Com `paused`, a onda fica estática (sem rAF rodando). Cores de severidade (verde/âmbar/vermelho) comunicam a saúde do sinal.",
  code: `import { EcgStrip } from "@/components/ui/ecg-strip"

export function Demo() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="h-12 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#10b981" speed={1} />
      </div>
      <div className="h-12 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#f59e0b" speed={1.6} amplitude={28} />
      </div>
      <div className="h-12 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#f43f5e" paused />
      </div>
    </div>
  )
}`,
  render: (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="h-12 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#10b981" speed={1} />
      </div>
      <div className="h-12 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#f59e0b" speed={1.6} amplitude={28} />
      </div>
      <div className="h-12 rounded-lg border border-border bg-card px-2">
        <EcgStrip color="#f43f5e" paused />
      </div>
    </div>
  ),
}

export const examplesEcgStrip: Record<string, Example[]> = {
  "ecg-strip": [basicExample, pausedExample],
}
