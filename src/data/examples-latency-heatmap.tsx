import { LatencyHeatmap } from "@/components/ui/latency-heatmap"

import type { Example } from "./examples"

/** Gera uma matriz coluna-maior determinística (sem Math.random). */
function buildColumns(cols: number, rows: number): number[][] {
  return Array.from({ length: cols }, (_, c) => {
    const center = (Math.sin(c * 0.4) * 0.5 + 0.5) * (rows - 1)
    return Array.from({ length: rows }, (_, r) => {
      const dist = Math.abs(r - center)
      return Math.min(1, Math.max(0, 1 - dist / 2.2))
    })
  })
}

const COLUMNS = buildColumns(28, 7)

const basicExample: Example = {
  title: "Heatmap de latência",
  description:
    "Matriz coluna-maior (`columns`): cada coluna é um array de valores por linha (0..1). Eixos opcionais à esquerda (lento/rápido) e abaixo (janela/agora). A escala de cor padrão vai de teal a rosa.",
  code: `import { LatencyHeatmap } from "@/components/ui/latency-heatmap"

export function Demo() {
  // columns: number[][] — cada coluna com 1 valor (0..1) por linha
  return <LatencyHeatmap columns={columns} rows={7} />
}`,
  render: (
    <div className="w-full max-w-lg rounded-lg border border-border bg-card/40 p-4">
      <LatencyHeatmap columns={COLUMNS} rows={7} />
    </div>
  ),
}

const customScaleExample: Example = {
  title: "Escala e rótulos custom",
  description:
    "Passe `colorScale` para trocar a paleta (aqui, monocromático em `primary`) e `rowLabels`/`colLabels` para os eixos — ou `false` para escondê-los.",
  code: `<LatencyHeatmap
  columns={columns}
  rows={7}
  rowLabels={["p99", "p50"]}
  colLabels={["-28t", "agora"]}
  colorScale={(v) => \`color-mix(in oklab, var(--primary) \${Math.round(v * 100)}%, transparent)\`}
/>`,
  render: (
    <div className="w-full max-w-lg rounded-lg border border-border bg-card/40 p-4">
      <LatencyHeatmap
        columns={COLUMNS}
        rows={7}
        rowLabels={["p99", "p50"]}
        colLabels={["-28t", "agora"]}
        colorScale={(v) =>
          `color-mix(in oklab, var(--primary) ${Math.round(v * 100)}%, transparent)`
        }
      />
    </div>
  ),
}

export const examplesLatencyHeatmap: Record<string, Example[]> = {
  "latency-heatmap": [basicExample, customScaleExample],
}
