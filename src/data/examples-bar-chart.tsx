import { BarChart } from "@/components/ui/bar-chart"

import type { Example } from "./examples"

const REVENUE = [
  { label: "Jan", value: 52 },
  { label: "Fev", value: 47 },
  { label: "Mar", value: 61 },
  { label: "Abr", value: 58 },
  { label: "Mai", value: 73 },
  { label: "Jun", value: 69 },
  { label: "Jul", value: 84 },
  { label: "Ago", value: 78 },
  { label: "Set", value: 92 },
  { label: "Out", value: 88 },
  { label: "Nov", value: 96 },
  { label: "Dez", value: 100 },
]

const basicExample: Example = {
  title: "Receita por mês",
  description:
    "Série de 12 meses normalizada ao maior valor. Cor padrão (bg-primary) e altura proporcional.",
  code: `import { BarChart } from "@/components/ui/bar-chart"

const revenue = [
  { label: "Jan", value: 52 },
  { label: "Fev", value: 47 },
  { label: "Mar", value: 61 },
  { label: "Dez", value: 100 },
]

export function Demo() {
  return (
    <div className="w-full max-w-xl">
      <BarChart series={revenue} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xl">
      <BarChart series={REVENUE} />
    </div>
  ),
}

const accentExample: Example = {
  title: "Cor de destaque (accent)",
  description:
    "A mesma série com `accent` apontando para uma cor semântica (emerald).",
  code: `import { BarChart } from "@/components/ui/bar-chart"

export function Demo() {
  return (
    <div className="w-full max-w-xl">
      <BarChart
        accent="bg-emerald-500"
        series={[
          { label: "Seg", value: 58 },
          { label: "Ter", value: 72 },
          { label: "Qua", value: 64 },
          { label: "Qui", value: 81 },
          { label: "Sex", value: 96 },
        ]}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xl">
      <BarChart
        accent="bg-emerald-500"
        series={[
          { label: "Seg", value: 58 },
          { label: "Ter", value: 72 },
          { label: "Qua", value: 64 },
          { label: "Qui", value: 81 },
          { label: "Sex", value: 96 },
        ]}
      />
    </div>
  ),
}

export const examplesBarChart: Record<string, Example[]> = {
  "bar-chart": [basicExample, accentExample],
}
