/**
 * Componentes de demo (com useState) usados pelos examples do
 * ChartTemplateGallery. Mantidos em arquivo separado para o
 * `examplesChartTemplateGallery` ficar puro (só constantes), evitando
 * o lint `react-refresh/only-export-components`.
 */

import { useState } from "react"
import {
  AreaChart,
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  TrendingUp,
} from "lucide-react"

import { ChartTemplateGallery } from "@/components/ui/chart-template-gallery"

const CHART_TEMPLATES = [
  {
    id: "bar",
    name: "Bar Chart",
    icon: BarChart3,
    description: "Comparar valores entre categorias distintas.",
    preview: (
      <div className="flex h-12 items-end gap-1">
        <div className="w-3 rounded-sm bg-current opacity-40" style={{ height: "40%" }} />
        <div className="w-3 rounded-sm bg-current opacity-60" style={{ height: "65%" }} />
        <div className="w-3 rounded-sm bg-current opacity-80" style={{ height: "50%" }} />
        <div className="w-3 rounded-sm bg-current" style={{ height: "90%" }} />
        <div className="w-3 rounded-sm bg-current opacity-70" style={{ height: "70%" }} />
      </div>
    ),
  },
  {
    id: "line",
    name: "Line Chart",
    icon: LineChart,
    description: "Visualizar tendências ao longo do tempo.",
    preview: (
      <svg viewBox="0 0 100 40" className="h-12 w-full">
        <polyline
          points="0,30 20,22 40,26 60,12 80,18 100,6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-60"
        />
      </svg>
    ),
  },
  {
    id: "area",
    name: "Area Chart",
    icon: AreaChart,
    description: "Volume acumulado com gradiente sob a curva.",
    preview: (
      <svg viewBox="0 0 100 40" className="h-12 w-full">
        <polygon
          points="0,40 0,28 20,20 40,24 60,10 80,16 100,4 100,40"
          fill="currentColor"
          className="opacity-20"
        />
      </svg>
    ),
  },
  {
    id: "pie",
    name: "Pie Chart",
    icon: PieChart,
    description: "Proporções relativas de um total.",
    preview: (
      <div className="flex h-12 items-center gap-2">
        <div className="size-8 rounded-full border-4 border-current opacity-40" style={{ borderColor: "currentColor", borderTopColor: "transparent" }} />
        <div className="size-8 rounded-full opacity-60" style={{
          background: "conic-gradient(currentColor 0% 60%, transparent 60% 100%)",
        }} />
      </div>
    ),
  },
  {
    id: "scatter",
    name: "Scatter Plot",
    icon: ScatterChart,
    description: "Correlação entre duas variáveis numéricas.",
    preview: (
      <div className="flex h-12 items-center gap-2">
        <div className="flex gap-1">
          <span className="size-1.5 rounded-full bg-current opacity-50" />
          <span className="size-1.5 rounded-full bg-current opacity-70 mt-2" />
          <span className="size-1.5 rounded-full bg-current opacity-40 mt-4" />
          <span className="size-1.5 rounded-full bg-current opacity-80 mt-1" />
          <span className="size-1.5 rounded-full bg-current opacity-60 mt-3" />
        </div>
      </div>
    ),
  },
  {
    id: "trend",
    name: "Trend Indicator",
    icon: TrendingUp,
    description: "KPI com seta de variação percentual.",
  },
]

export function ChartTemplateGalleryInteractiveDemo() {
  const [selected, setSelected] = useState("bar")

  return (
    <div className="w-full max-w-xl">
      <ChartTemplateGallery
        templates={CHART_TEMPLATES}
        selected={selected}
        onSelect={setSelected}
      />
      <p className="mt-3 text-sm text-muted-foreground">
        Selecionado:{" "}
        <span className="font-medium text-foreground">
          {CHART_TEMPLATES.find((t) => t.id === selected)?.name}
        </span>
      </p>
    </div>
  )
}
