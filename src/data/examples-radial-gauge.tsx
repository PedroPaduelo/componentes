import { RadialGauge } from "@/components/ui/radial-gauge"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Medidor radial (270°)",
  description:
    "Arco de 270° com valor/unidade/rótulo no miolo. `value` é normalizado em `[min, max]` (default 0–100). A cor do arco vem de `color`.",
  code: `import { RadialGauge } from "@/components/ui/radial-gauge"

export function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <RadialGauge value={72} unit="%" label="CPU" />
      <RadialGauge value={48} unit="%" label="Memória" color="#8b5cf6" />
      <RadialGauge value={91} unit="%" label="Disco" size={140} thickness={14} />
    </div>
  )
}`,
  render: (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <RadialGauge value={72} unit="%" label="CPU" />
      <RadialGauge value={48} unit="%" label="Memória" color="#8b5cf6" />
      <RadialGauge value={91} unit="%" label="Disco" size={140} thickness={14} />
    </div>
  ),
}

const thresholdsExample: Example = {
  title: "Cor por faixa (thresholds) e miolo custom",
  description:
    "Passe `thresholds` para colorir o arco por faixa de valor (verde/âmbar/vermelho). Use `children` para um miolo totalmente custom.",
  code: `import { RadialGauge } from "@/components/ui/radial-gauge"

const THRESHOLDS = [
  { upTo: 60, color: "#10b981" },
  { upTo: 85, color: "#f59e0b" },
  { upTo: 100, color: "#f43f5e" },
]

export function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <RadialGauge value={42} unit="%" label="ok" thresholds={THRESHOLDS} />
      <RadialGauge value={78} unit="%" label="atenção" thresholds={THRESHOLDS} />
      <RadialGauge value={96} thresholds={THRESHOLDS} size={132}>
        <span className="text-xl font-bold tabular-nums text-rose-500">96</span>
        <span className="text-[10px] text-muted-foreground">crítico</span>
      </RadialGauge>
    </div>
  )
}`,
  render: (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <RadialGauge
        value={42}
        unit="%"
        label="ok"
        thresholds={[
          { upTo: 60, color: "#10b981" },
          { upTo: 85, color: "#f59e0b" },
          { upTo: 100, color: "#f43f5e" },
        ]}
      />
      <RadialGauge
        value={78}
        unit="%"
        label="atenção"
        thresholds={[
          { upTo: 60, color: "#10b981" },
          { upTo: 85, color: "#f59e0b" },
          { upTo: 100, color: "#f43f5e" },
        ]}
      />
      <RadialGauge
        value={96}
        size={132}
        thresholds={[
          { upTo: 60, color: "#10b981" },
          { upTo: 85, color: "#f59e0b" },
          { upTo: 100, color: "#f43f5e" },
        ]}
      >
        <span className="text-xl font-bold tabular-nums text-rose-500">96</span>
        <span className="text-[10px] text-muted-foreground">crítico</span>
      </RadialGauge>
    </div>
  ),
}

export const examplesRadialGauge: Record<string, Example[]> = {
  "radial-gauge": [basicExample, thresholdsExample],
}
