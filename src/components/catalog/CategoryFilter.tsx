import type { ComponentOrigin } from "@/data/families"
import { ORIGIN_VALUES } from "@/lib/family-filter"
import { Button } from "@/components/ui/button"

/**
 * Stub do filtro de categoria: as 4 categorias antigas foram removidas em favor
 * de uma taxonomia única baseada nos 17 GRUPOS (ver `src/data/groups.ts`).
 * Mantido como no-op exportado apenas para preservar a API consumida pelo
 * `AiIndex`, que será atualizado num passo seguinte. Renderiza `null`.
 */
export type CategoryFilterValue = string | "Todos"

export const ALL_CATEGORIES: CategoryFilterValue = "Todos"

type CategoryFilterProps = {
  value: CategoryFilterValue
  onChange: (value: CategoryFilterValue) => void
  counts?: Record<string, number>
}

/** No-op: não renderiza UI. A taxonomia única é o `GroupFilter`. */
export function CategoryFilter(props: CategoryFilterProps): null {
  // Acessa `props` para silenciar o lint sem desabilitar a regra.
  void props
  return null
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
