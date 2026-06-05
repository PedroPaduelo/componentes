import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  onReset?: () => void
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Nenhum componente encontrado</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Tente ajustar a busca ou selecionar outra categoria.
      </p>
      {onReset ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
          Limpar filtros
        </Button>
      ) : null}
    </div>
  )
}
