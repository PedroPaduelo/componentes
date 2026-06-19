import { LineChart } from "@/components/ui/line-chart"

import type { Example } from "./examples"

const TRAFFIC_LABELS = [
  "00h", "02h", "04h", "06h", "08h", "10h",
  "12h", "14h", "16h", "18h", "20h", "22h",
]

const TRAFFIC_SERIES = [
  12, 8, 6, 9, 24, 48,
  62, 71, 65, 58, 44, 31,
]

const basicExample: Example = {
  title: "Tráfego por hora",
  description:
    "Série simples de 12 pontos com área preenchida, grid e eixos. A escala Y é normalizada ao min/max dos dados.",
  code: `import { LineChart } from "@/components/ui/line-chart"

export function Demo() {
  return (
    <div className="w-full max-w-xl">
      <LineChart
        series={[
          { label: "Requests", data: [12, 8, 6, 9, 24, 48, 62, 71, 65, 58, 44, 31] },
        ]}
        xLabels={["00h", "02h", "04h", "06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"]}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xl">
      <LineChart
        series={[{ label: "Requests", data: TRAFFIC_SERIES }]}
        xLabels={TRAFFIC_LABELS}
      />
    </div>
  ),
}

const multiSeriesExample: Example = {
  title: "Múltiplas séries",
  description:
    "Duas séries concorrentes normalizadas pelo mesmo min/max global, com legenda e cores distintas.",
  code: `import { LineChart } from "@/components/ui/line-chart"

export function Demo() {
  return (
    <div className="w-full max-w-xl">
      <LineChart
        series={[
          { label: "API", data: [40, 35, 50, 45, 60, 55, 70], className: "stroke-primary" },
          { label: "CDN", data: [20, 25, 30, 28, 35, 40, 48], className: "stroke-emerald-500" },
        ]}
        xLabels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xl">
      <LineChart
        series={[
          { label: "API", data: [40, 35, 50, 45, 60, 55, 70], className: "stroke-primary" },
          { label: "CDN", data: [20, 25, 30, 28, 35, 40, 48], className: "stroke-emerald-500" },
        ]}
        xLabels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
      />
    </div>
  ),
}

const minimalExample: Example = {
  title: "Sem área, grid e legenda",
  description:
    "Apenas as linhas poligonais — showArea/showGrid/showLegend desativados para máxima densidade.",
  code: `import { LineChart } from "@/components/ui/line-chart"

export function Demo() {
  return (
    <div className="w-full max-w-xl">
      <LineChart
        series={[
          { label: "Latência", data: [85, 72, 90, 65, 78, 82, 70] },
        ]}
        xLabels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
        showArea={false}
        showGrid={false}
        showLegend={false}
        height="h-32"
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xl">
      <LineChart
        series={[{ label: "Latência", data: [85, 72, 90, 65, 78, 82, 70] }]}
        xLabels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
        showArea={false}
        showGrid={false}
        showLegend={false}
        height="h-32"
      />
    </div>
  ),
}

export const examplesLineChart: Record<string, Example[]> = {
  "line-chart": [basicExample, multiSeriesExample, minimalExample],
}
