import { MetricGlowCard } from "@/components/ui/metric-glow-card"

import type { Example } from "./examples"

const METRICS = [
  { title: "Receita Mensal", value: "R$ 124.500", change: "+12.5%", positive: true },
  { title: "Usuários Ativos", value: "8.420", change: "+8.1%", positive: true },
  { title: "Taxa de Conversão", value: "3.24%", change: "-0.4%", positive: false },
  { title: "Tempo Médio", value: "4m 32s", change: "+15s", positive: false },
]

const gridExample: Example = {
  title: "Grade de métricas",
  description:
    "Conteúdo centrado (rótulo + valor em string livre + variação colorida). Pensado para morar dentro de uma casca com brilho (ex.: o GlowCard do glow-card-grid).",
  code: `import { MetricGlowCard } from "@/components/ui/metric-glow-card"

export function Demo() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m) => (
        <div key={m.title} className="rounded-xl border bg-card py-6">
          <MetricGlowCard
            title={m.title}
            value={m.value}
            change={m.change}
            positive={m.positive}
          />
        </div>
      ))}
    </div>
  )
}`,
  render: (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      {METRICS.map((m) => (
        <div key={m.title} className="rounded-xl border bg-card py-6">
          <MetricGlowCard
            title={m.title}
            value={m.value}
            change={m.change}
            positive={m.positive}
          />
        </div>
      ))}
    </div>
  ),
}

const plainExample: Example = {
  title: "Sem variação",
  description: "Omita `change` para mostrar apenas rótulo e valor.",
  code: `<MetricGlowCard title="Sessões hoje" value="12.904" />`,
  render: (
    <div className="rounded-xl border bg-card px-2 py-6">
      <MetricGlowCard title="Sessões hoje" value="12.904" />
    </div>
  ),
}

export const examplesMetricGlowCard: Record<string, Example[]> = {
  "metric-glow-card": [gridExample, plainExample],
}
