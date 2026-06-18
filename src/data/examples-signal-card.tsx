import { AlertTriangle, Clock, Zap } from "lucide-react"

import { SignalCard } from "@/components/ui/signal-card"

import type { Example } from "./examples"

const P95 = [48, 52, 50, 58, 62, 60, 66, 71, 69, 74, 78, 81]
const RPS = [1820, 1900, 1880, 1950, 2010, 1990, 2080, 2120, 2100, 2180, 2210, 2240]
const ERR = [0.004, 0.006, 0.005, 0.008, 0.012, 0.01, 0.018, 0.02, 0.024, 0.03, 0.028, 0.034]

const basicExample: Example = {
  title: "Golden signals (latência, throughput, erro)",
  description:
    "Cartões de sinal com ícone, rótulo, valor (+ unidade), indicador de variação (`trend`) e mini-sparkline. A polaridade do trend (`trendPolarity`) define se subir é bom ou ruim; `tone` define o acento.",
  code: `import { AlertTriangle, Clock, Zap } from "lucide-react"

import { SignalCard } from "@/components/ui/signal-card"

export function Demo() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SignalCard
        label="Latência p95"
        icon={<Clock className="size-3.5" />}
        value="81ms"
        data={[48, 52, 50, 58, 62, 60, 66, 71, 69, 74, 78, 81]}
        trend={0.31}
        trendPolarity="up-bad"
        tone="amber"
      />
      <SignalCard
        label="Throughput"
        icon={<Zap className="size-3.5" />}
        value="2.2k"
        unit="rps"
        data={[1820, 1900, 1880, 1950, 2010, 1990, 2080, 2120, 2100, 2180, 2210, 2240]}
        trend={0.23}
        trendPolarity="up-good"
        tone="sky"
      />
      <SignalCard
        label="Taxa de erro"
        icon={<AlertTriangle className="size-3.5" />}
        value="3.40%"
        data={[0.004, 0.006, 0.005, 0.008, 0.012, 0.01, 0.018, 0.02, 0.024, 0.03, 0.028, 0.034]}
        trend={0.7}
        trendPolarity="up-bad"
        tone="rose"
      />
    </div>
  )
}`,
  render: (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
      <SignalCard
        label="Latência p95"
        icon={<Clock className="size-3.5" />}
        value="81ms"
        data={P95}
        trend={0.31}
        trendPolarity="up-bad"
        tone="amber"
      />
      <SignalCard
        label="Throughput"
        icon={<Zap className="size-3.5" />}
        value="2.2k"
        unit="rps"
        data={RPS}
        trend={0.23}
        trendPolarity="up-good"
        tone="sky"
      />
      <SignalCard
        label="Taxa de erro"
        icon={<AlertTriangle className="size-3.5" />}
        value="3.40%"
        data={ERR}
        trend={0.7}
        trendPolarity="up-bad"
        tone="rose"
      />
    </div>
  ),
}

const statusExample: Example = {
  title: "Acento por status de saúde",
  description:
    "Sem `tone`, a cor de acento deriva de `status` (healthy → verde, degraded → âmbar, critical → vermelho). Sem `trend`, o cabeçalho fica só com o rótulo.",
  code: `import { SignalCard } from "@/components/ui/signal-card"

export function Demo() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SignalCard label="Auth" value="34ms" data={[30, 32, 31, 34, 33, 35, 34]} status="healthy" />
      <SignalCard label="Orders" value="120ms" data={[60, 80, 90, 110, 130, 120, 125]} status="degraded" />
      <SignalCard label="Payments" value="540ms" data={[90, 140, 220, 360, 480, 520, 540]} status="critical" />
    </div>
  )
}`,
  render: (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
      <SignalCard label="Auth" value="34ms" data={[30, 32, 31, 34, 33, 35, 34]} status="healthy" />
      <SignalCard label="Orders" value="120ms" data={[60, 80, 90, 110, 130, 120, 125]} status="degraded" />
      <SignalCard label="Payments" value="540ms" data={[90, 140, 220, 360, 480, 520, 540]} status="critical" />
    </div>
  ),
}

export const examplesSignalCard: Record<string, Example[]> = {
  "signal-card": [basicExample, statusExample],
}
