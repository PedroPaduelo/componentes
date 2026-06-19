import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type DashboardFilterOption = {
  label: string
  value: string
}

export type DashboardActiveFilter = {
  label: string
  onRemove: () => void
}

export type DashboardFilterBarProps = {
  /** Selected "from" date for the date range picker */
  dateFrom?: Date
  /** Callback when the "from" date changes */
  onDateFromChange?: (date: Date | undefined) => void
  /** Selected "to" date for the date range picker */
  dateTo?: Date
  /** Callback when the "to" date changes */
  onDateToChange?: (date: Date | undefined) => void
  /** Currently selected data source value */
  dataSource?: string
  /** Available data source options for the Select */
  dataSourceOptions?: DashboardFilterOption[]
  /** Callback when the data source changes */
  onDataSourceChange?: (value: string) => void
  /** Active filter chips displayed as removable badges */
  activeFilters?: DashboardActiveFilter[]
  className?: string
}

function DashboardFilterBar({
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  dataSource,
  dataSourceOptions,
  onDataSourceChange,
  activeFilters,
  className,
}: DashboardFilterBarProps) {
  return (
    <div
      data-slot="dashboard-filter-bar"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 text-card-foreground",
        className
      )}
    >
      {/* Date range — "from" and "to" pickers */}
      <div className="flex items-center gap-1.5">
        <DatePicker
          selected={dateFrom}
          onSelect={onDateFromChange}
          placeholder="Data inicial"
          className="w-[150px]"
        />
        <span className="text-muted-foreground">–</span>
        <DatePicker
          selected={dateTo}
          onSelect={onDateToChange}
          placeholder="Data final"
          className="w-[150px]"
        />
      </div>

      {/* Data source selector */}
      {dataSourceOptions && dataSourceOptions.length > 0 && (
        <Select value={dataSource} onValueChange={onDataSourceChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Fonte de dados" />
          </SelectTrigger>
          <SelectContent>
            {dataSourceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Active filter chips */}
      {activeFilters && activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.label}-${index}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {filter.label}
              <button
                type="button"
                onClick={filter.onRemove}
                className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remover filtro: ${filter.label}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

DashboardFilterBar.displayName = "DashboardFilterBar"

export { DashboardFilterBar }
