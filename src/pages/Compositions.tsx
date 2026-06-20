import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { FilterX } from "lucide-react"

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui"
import { compositions } from "@/data/compositions"
import { isDashboardComposition } from "@/lib/composition-filter"

/**
 * Galeria de composições — telas inteiras montadas com os componentes
 * da vitrine. Cada card leva à página de preview correspondente.
 *
 * Filtro runtime via query param (REORG task D1):
 *  - `?category=dashboard` → mostra apenas composições dashboard-like
 *    (ver `isDashboardComposition` em `composition-filter.ts`).
 *  - sem param → mostra todas as composições (comportamento padrão).
 *
 * O registry de composições (`data/compositions.ts`) NÃO é alterado —
 * a categoria formal continua "Aplicação" / "Marketing" / etc. O filtro é
 * puramente runtime e segue o mesmo padrão de `Home.tsx` que já lê
 * `searchParams.get("category")` (issue LOW cmqjn9aac).
 */
export function Compositions() {
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get("category")
  const isDashboardFilter = categoryParam === "dashboard"

  const filteredCompositions = useMemo(() => {
    if (!isDashboardFilter) return compositions
    return compositions.filter(isDashboardComposition)
  }, [isDashboardFilter])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Composições
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Telas completas montadas a partir dos componentes da vitrine. Use
          como ponto de partida para suas próprias páginas.
        </p>
      </header>

      {isDashboardFilter ? (
        <div
          className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
        >
          <FilterX className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-foreground">
            Filtrado: composições de dashboard
          </span>
          <span className="text-muted-foreground">
            · {filteredCompositions.length}{" "}
            {filteredCompositions.length === 1 ? "composição" : "composições"}
          </span>
          <Link
            to="/compositions"
            className="ml-auto text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            Limpar filtro
          </Link>
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompositions.map((composition) => (
          <Link
            key={composition.slug}
            to={`/compositions/${composition.slug}`}
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors group-hover:border-foreground/30">
              <CardHeader>
                <CardTitle className="transition-colors group-hover:text-foreground">
                  {composition.name}
                </CardTitle>
                <CardDescription>{composition.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {composition.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
