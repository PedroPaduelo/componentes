import { HBarChart } from "@/components/ui/h-bar-chart"

import type { Example } from "./examples"

const CHANNELS = [
  { label: "Orgânico", value: 100 },
  { label: "Indicação", value: 62 },
  { label: "Social", value: 51 },
  { label: "E-mail", value: 38 },
  { label: "Direto", value: 27 },
]

const basicExample: Example = {
  title: "Canais de aquisição",
  description:
    "Ranking de canais normalizado ao maior valor. Rótulo à esquerda, valor à direita.",
  code: `import { HBarChart } from "@/components/ui/h-bar-chart"

const channels = [
  { label: "Orgânico", value: 100 },
  { label: "Indicação", value: 62 },
  { label: "Social", value: 51 },
  { label: "E-mail", value: 38 },
  { label: "Direto", value: 27 },
]

export function Demo() {
  return (
    <div className="w-full max-w-md">
      <HBarChart series={channels} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <HBarChart series={CHANNELS} />
    </div>
  ),
}

export const examplesHBarChart: Record<string, Example[]> = {
  "h-bar-chart": [basicExample],
}
