/**
 * Componentes de demo (com useState) usados pelos examples do
 * DashboardFilterBar. Mantidos em arquivo separado para o
 * `examplesDashboardFilterBar` ficar puro (só constantes), evitando
 * o lint `react-refresh/only-export-components`.
 */

import { useState } from "react"

import { DashboardFilterBar } from "@/components/ui/dashboard-filter-bar"

const DATA_SOURCES = [
  { label: "PostgreSQL — produção", value: "pg-prod" },
  { label: "Redis — cache", value: "redis-cache" },
  { label: "ClickHouse — analytics", value: "clickhouse" },
]

const INITIAL_FILTERS = ["Status: ativo", "Região: EU"]

export function DashboardFilterBarBasicDemo() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    new Date(2025, 0, 15)
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    new Date(2025, 5, 30)
  )
  const [dataSource, setDataSource] = useState("pg-prod")
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  return (
    <div className="w-full max-w-2xl">
      <DashboardFilterBar
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        dataSource={dataSource}
        dataSourceOptions={DATA_SOURCES}
        onDataSourceChange={setDataSource}
        activeFilters={filters.map((label, i) => ({
          label,
          onRemove: () => setFilters(filters.filter((_, j) => j !== i)),
        }))}
      />
    </div>
  )
}
