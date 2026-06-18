import { CATEGORIES, type Category } from "@/data/components"
import type { ComponentOrigin } from "@/data/families"
import { ORIGIN_VALUES } from "@/lib/family-filter"
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

// ---------------------------------------------------------------------------
// OriginFilter — chips de origem (shadcn / Fluid / chanhdai / @pierre/trees)
// ---------------------------------------------------------------------------

type OriginFilterProps = {
  value: ComponentOrigin | null
  onChange: (value: ComponentOrigin | null) => void
  counts?: Record<string, number>
}

export function OriginFilter({ value, onChange, counts }: OriginFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por origem"
      className="flex flex-wrap gap-2"
    >
      <Button
        type="button"
        size="sm"
        variant={value === null ? "default" : "outline"}
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        Origens
      </Button>
      {ORIGIN_VALUES.map((origin) => {
        const isActive = value === origin
        const count = counts?.[origin]
        return (
          <Button
            key={origin}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? null : origin)}
          >
            {origin}
            {typeof count === "number" ? (
              <span className="ml-1 text-xs opacity-70">{count}</span>
            ) : null}
          </Button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TagFilter — chips de tags populares
// ---------------------------------------------------------------------------

type TagFilterProps = {
  tags: string[]
  value: string | null
  onChange: (value: string | null) => void
  counts?: Record<string, number>
}

export function TagFilter({ tags, value, onChange, counts }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div
      role="group"
      aria-label="Filtrar por tag"
      className="flex flex-wrap gap-2"
    >
      <Button
        type="button"
        size="sm"
        variant={value === null ? "default" : "outline"}
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        Tags
      </Button>
      {tags.map((tag) => {
        const isActive = value === tag
        const count = counts?.[tag]
        return (
          <Button
            key={tag}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? null : tag)}
          >
            {tag}
            {typeof count === "number" ? (
              <span className="ml-1 text-xs opacity-70">{count}</span>
            ) : null}
          </Button>
        )
      })}
    </div>
  )
}
