import { DashboardFilterBar } from "@/components/ui/dashboard-filter-bar"

import type { Example } from "./examples"
import { DashboardFilterBarBasicDemo } from "./examples-dashboard-filter-bar-demos"

const basicExample: Example = {
  title: "Barra de filtros completa",
  description:
    "Date range picker, seletor de fonte de dados e chips de filtros ativos removíveis.",
  code: `import { useState } from "react"
import { DashboardFilterBar } from "@/components/ui/dashboard-filter-bar"

export function Demo() {
  const [dateFrom, setDateFrom] = useState(new Date(2025, 0, 15))
  const [dateTo, setDateTo] = useState(new Date(2025, 5, 30))
  const [dataSource, setDataSource] = useState("pg-prod")
  const [filters, setFilters] = useState([
    "Status: ativo",
    "Região: EU",
  ])

  return (
    <DashboardFilterBar
      dateFrom={dateFrom}
      onDateFromChange={setDateFrom}
      dateTo={dateTo}
      onDateToChange={setDateTo}
      dataSource={dataSource}
      dataSourceOptions={[
        { label: "PostgreSQL — produção", value: "pg-prod" },
        { label: "Redis — cache", value: "redis-cache" },
        { label: "ClickHouse — analytics", value: "clickhouse" },
      ]}
      onDataSourceChange={setDataSource}
      activeFilters={filters.map((label, i) => ({
        label,
        onRemove: () => setFilters(filters.filter((_, j) => j !== i)),
      }))}
    />
  )
}`,
  render: <DashboardFilterBarBasicDemo />,
}

const minimalExample: Example = {
  title: "Sem filtros ativos",
  description:
    "Apenas date pickers e seletor — chips aparecem conforme o usuário aplica filtros.",
  code: `import { DashboardFilterBar } from "@/components/ui/dashboard-filter-bar"

export function Demo() {
  return (
    <DashboardFilterBar
      dataSourceOptions={[
        { label: "PostgreSQL", value: "pg" },
        { label: "MongoDB", value: "mongo" },
      ]}
    />
  )
}`,
  render: (
    <div className="w-full max-w-2xl">
      <DashboardFilterBar
        dataSourceOptions={[
          { label: "PostgreSQL", value: "pg" },
          { label: "MongoDB", value: "mongo" },
        ]}
      />
    </div>
  ),
}

export const examplesDashboardFilterBar: Record<string, Example[]> = {
  "dashboard-filter-bar": [basicExample, minimalExample],
}
