import { ChartWidget } from "@/components/ui/chart-widget"
import { BarChart } from "@/components/ui/bar-chart"
import { Button } from "@/components/ui/button"

import type { Example } from "./examples"

const REVENUE = [
  { label: "Jan", value: 52 },
  { label: "Fev", value: 47 },
  { label: "Mar", value: 61 },
  { label: "Abr", value: 58 },
  { label: "Mai", value: 73 },
  { label: "Jun", value: 69 },
]

const basicExample: Example = {
  title: "Widget com BarChart",
  description:
    "Card com cabeçalho (título + badge do tipo), corpo com gráfico embutido e rodapé com query SQL + duração.",
  code: `import { ChartWidget } from "@/components/ui/chart-widget"
import { BarChart } from "@/components/ui/bar-chart"

export function Demo() {
  return (
    <div className="w-full max-w-md">
      <ChartWidget
        title="Receita por mês"
        chartType="bar"
        query="SELECT month, SUM(total) FROM orders GROUP BY month"
        durationMs={42}
      >
        <BarChart series={[
          { label: "Jan", value: 52 },
          { label: "Fev", value: 47 },
          { label: "Mar", value: 61 },
          { label: "Abr", value: 58 },
          { label: "Mai", value: 73 },
          { label: "Jun", value: 69 },
        ]} />
      </ChartWidget>
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <ChartWidget
        title="Receita por mês"
        chartType="bar"
        query="SELECT month, SUM(total) FROM orders GROUP BY month"
        durationMs={42}
      >
        <BarChart series={REVENUE} />
      </ChartWidget>
    </div>
  ),
}

const loadingExample: Example = {
  title: "Estado de carregamento",
  description:
    "Quando loading=true, o corpo exibe um Skeleton no lugar do conteúdo.",
  code: `import { ChartWidget } from "@/components/ui/chart-widget"

export function Demo() {
  return (
    <div className="w-full max-w-md">
      <ChartWidget title="Carregando dados..." chartType="line" loading>
        <div />
      </ChartWidget>
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <ChartWidget title="Carregando dados..." chartType="line" loading>
        <div />
      </ChartWidget>
    </div>
  ),
}

const withActionsExample: Example = {
  title: "Com ações no header",
  description:
    "O slot actions permite adicionar botões (ex.: exportar, atualizar) no canto direito do cabeçalho.",
  code: `import { ChartWidget } from "@/components/ui/chart-widget"
import { BarChart } from "@/components/ui/bar-chart"
import { Button } from "@/components/ui/button"

export function Demo() {
  return (
    <div className="w-full max-w-md">
      <ChartWidget
        title="Vendas Q1"
        chartType="bar"
        actions={
          <Button variant="ghost" size="sm">Exportar</Button>
        }
      >
        <BarChart series={[
          { label: "Jan", value: 52 },
          { label: "Fev", value: 47 },
          { label: "Mar", value: 61 },
        ]} />
      </ChartWidget>
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <ChartWidget
        title="Vendas Q1"
        chartType="bar"
        actions={<Button variant="ghost" size="sm">Exportar</Button>}
      >
        <BarChart series={[
          { label: "Jan", value: 52 },
          { label: "Fev", value: 47 },
          { label: "Mar", value: 61 },
        ]} />
      </ChartWidget>
    </div>
  ),
}

export const examplesChartWidget: Record<string, Example[]> = {
  "chart-widget": [basicExample, loadingExample, withActionsExample],
}
