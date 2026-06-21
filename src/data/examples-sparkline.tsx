import { Sparkline } from "@/components/ui/sparkline"

import type { Example } from "./examples"

const RETENTION = [100, 94, 88, 83, 79, 76, 74, 72, 71, 70]
const TRAFFIC = [12, 18, 9, 22, 31, 27, 44, 38, 52, 49, 63, 71]

const basicExample: Example = {
  title: "Tendência de retenção",
  description:
    "Série de percentuais decrescentes normalizada ao min/max local. Cores padrão.",
  code: `import { Sparkline } from "@/components/ui/sparkline"

const retention = [100, 94, 88, 83, 79, 76, 74, 72, 71, 70]

export function Demo() {
  return (
    <div className="w-full max-w-xs">
      <Sparkline data={retention} showTooltip />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xs">
      <Sparkline data={RETENTION} showTooltip />
    </div>
  ),
}

const coloredExample: Example = {
  title: "Cores customizadas",
  description:
    "A mesma técnica com `stroke`/`fill` apontando para uma cor semântica (emerald).",
  code: `import { Sparkline } from "@/components/ui/sparkline"

export function Demo() {
  return (
    <div className="w-full max-w-xs">
      <Sparkline
        data={[12, 18, 9, 22, 31, 27, 44, 38, 52, 49, 63, 71]}
        stroke="stroke-emerald-500"
        fill="fill-emerald-500/10"
        showTooltip
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xs">
      <Sparkline
        data={TRAFFIC}
        stroke="stroke-emerald-500"
        fill="fill-emerald-500/10"
        showTooltip
      />
    </div>
  ),
}

export const examplesSparkline: Record<string, Example[]> = {
  sparkline: [basicExample, coloredExample],
}
