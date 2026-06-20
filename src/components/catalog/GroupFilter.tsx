import { Button } from "@/components/ui/button"
import type { GroupId } from "@/data/groups"

/** "Todos" representa ausência de filtro de grupo. */
export type GroupFilterValue = GroupId | "all"

export const ALL_GROUPS: GroupFilterValue = "all"

/**
 * Opção de chip de grupo, com label, ícone (opcional) e contagem.
 * Recebido por prop para manter o componente desacoplado de `listGroups()`
 * — segue o padrão do CategoryFilter / OriginFilter / TagFilter.
 */
export type GroupFilterOption = {
  id: GroupId
  label: string
  /** Contagem de famílias/items disponíveis para este grupo (opcional). */
  count?: number
}

type GroupFilterProps = {
  value: GroupFilterValue
  onChange: (value: GroupFilterValue) => void
  /** Lista de opções a renderizar (já ordenada pelo caller). */
  options: GroupFilterOption[]
  /** Contagem total (exibida ao lado do chip "Todos"). */
  totalCount?: number
}

/**
 * Filtro por GRUPO na Home — chips horizontais com os 10 grupos da taxonomia
 * de clusterização (src/data/groups.ts) + chip "Todos" para limpar o filtro.
 *
 * Replica o padrão visual dos outros filtros do catálogo (CategoryFilter /
 * OriginFilter / TagFilter): `<Button size="sm">` com variant alternando entre
 * default (ativo) e outline (inativo), contagem em texto secundário à direita.
 */
export function GroupFilter({
  value,
  onChange,
  options,
  totalCount,
}: GroupFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por grupo"
      className="flex flex-wrap gap-2"
    >
      <Button
        type="button"
        size="sm"
        variant={value === ALL_GROUPS ? "default" : "outline"}
        aria-pressed={value === ALL_GROUPS}
        onClick={() => onChange(ALL_GROUPS)}
      >
        Todos
        {typeof totalCount === "number" ? (
          <span className="ml-1 text-xs opacity-70">{totalCount}</span>
        ) : null}
      </Button>
      {options.map((option) => {
        const isActive = option.id === value
        return (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className="ml-1 text-xs opacity-70">{option.count}</span>
            ) : null}
          </Button>
        )
      })}
    </div>
  )
}
