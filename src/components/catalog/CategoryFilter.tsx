import { CATEGORIES, type Category } from "@/data/components"
import { Button } from "@/components/ui/button"

/** "Todos" representa ausência de filtro de categoria. */
export type CategoryFilterValue = Category | "Todos"

export const ALL_CATEGORIES: CategoryFilterValue = "Todos"

type CategoryFilterProps = {
  value: CategoryFilterValue
  onChange: (value: CategoryFilterValue) => void
  /** Contagem de itens por valor de filtro, para exibir ao lado do rótulo. */
  counts?: Record<string, number>
}

export function CategoryFilter({
  value,
  onChange,
  counts,
}: CategoryFilterProps) {
  const options: CategoryFilterValue[] = [ALL_CATEGORIES, ...CATEGORIES]

  return (
    <div
      role="group"
      aria-label="Filtrar por categoria"
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const isActive = option === value
        const count = counts?.[option]
        return (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            onClick={() => onChange(option)}
          >
            {option}
            {typeof count === "number" ? (
              <span className="ml-1 text-xs opacity-70">{count}</span>
            ) : null}
          </Button>
        )
      })}
    </div>
  )
}
