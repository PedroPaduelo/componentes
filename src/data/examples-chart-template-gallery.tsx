import {
  AreaChart,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react"
import { ChartTemplateGallery } from "@/components/ui/chart-template-gallery"

import type { Example } from "./examples"
import {
  ChartTemplateGalleryInteractiveDemo,
} from "./examples-chart-template-gallery-demos"

const PREVIEW_TEMPLATES = [
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
]

const interactiveExample: Example = {
  title: "Galeria interativa",
  description:
    "Grid de templates de gráfico com seleção clicável, ícones e previews visuais.",
  code: `import { useState } from "react"
import { BarChart3, LineChart, PieChart } from "lucide-react"
import { ChartTemplateGallery } from "@/components/ui/chart-template-gallery"

export function Demo() {
  const [selected, setSelected] = useState("bar")

  return (
    <ChartTemplateGallery
      templates={[
        {
          id: "bar",
          name: "Bar Chart",
          icon: BarChart3,
          description: "Comparar valores entre categorias.",
        },
        {
          id: "line",
          name: "Line Chart",
          icon: LineChart,
          description: "Visualizar tendências ao longo do tempo.",
        },
        {
          id: "pie",
          name: "Pie Chart",
          icon: PieChart,
          description: "Proporções relativas de um total.",
        },
      ]}
      selected={selected}
      onSelect={setSelected}
    />
  )
}`,
  render: <ChartTemplateGalleryInteractiveDemo />,
}

const withPreviewExample: Example = {
  title: "Com previews visuais",
  description:
    "Templates podem incluir um ReactNode no campo preview para mostrar uma miniatura do gráfico.",
  code: `import { BarChart3 } from "lucide-react"
import { ChartTemplateGallery } from "@/components/ui/chart-template-gallery"

export function Demo() {
  return (
    <ChartTemplateGallery
      templates={[
        {
          id: "bar",
          name: "Bar Chart",
          icon: BarChart3,
          description: "Comparar valores entre categorias.",
          preview: (
            <div className="flex h-12 items-end gap-1">
              <div className="w-3 rounded-sm bg-current opacity-40" style={{ height: "40%" }} />
              <div className="w-3 rounded-sm bg-current opacity-60" style={{ height: "65%" }} />
              <div className="w-3 rounded-sm bg-current" style={{ height: "90%" }} />
            </div>
          ),
        },
      ]}
    />
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <ChartTemplateGallery templates={PREVIEW_TEMPLATES} />
    </div>
  ),
}

export const examplesChartTemplateGallery: Record<string, Example[]> = {
  "chart-template-gallery": [interactiveExample, withPreviewExample],
}
