import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  LayoutGrid,
  LineChart,
  type LucideIcon,
} from "lucide-react"

import { DocBreadcrumb } from "@/components/showcase/DocBreadcrumb"
import { GROUP_ICONS } from "@/components/layout/category-icons"
import {
  GROUP_BY_ID,
  listGroups,
  type GroupWithCount,
} from "@/data/groups"
import { compositions } from "@/data/compositions"

/**
 * Slugs canônicos dos 2 sub-grupos que formam a "superfície de dashboard".
 * Mantidos em constante (não derivados) porque a rota é semântica: dashboards
 * = charts + data, e qualquer reorganização do taxonomy passa pela task A1
 * (groups.ts) — esta página apenas CONSOME os ids.
 */
const DASHBOARD_GROUP_IDS = ["dashboards-charts", "dashboards-data"] as const

/**
 * Soma as contagens (componentes + famílias) dos 2 sub-grupos de dashboard.
 *
 * Usa o `listGroups()` da task O2.3 (já com `componentCount`/`familyCount`
 * derivados do registry) e filtra pelos 2 ids canônicos acima — sem
 * duplicar a contagem nem reimplementar a derivação. Retorna
 * `{ componentCount, familyCount }` para o stat grande do header.
 */
function getDashboardTotals(): { componentCount: number; familyCount: number } {
  const groups = listGroups()
  const subset = groups.filter((g) =>
    (DASHBOARD_GROUP_IDS as readonly string[]).includes(g.id),
  )
  return subset.reduce(
    (acc, g) => ({
      componentCount: acc.componentCount + g.componentCount,
      familyCount: acc.familyCount + g.familyCount,
    }),
    { componentCount: 0, familyCount: 0 },
  )
}

/**
 * Conta composições com a tag `"dashboard"` no registry de composições.
 *
 * É a mesma semântica que a task D1 (composition-filter.ts +
 * Compositions.tsx + DashboardIndex CTA) vai usar para o filtro
 * `?category=dashboard` em `/compositions` — a tag `"dashboard"` é o
 * contrato atual do registry. Composições com categoria "Aplicação" que
 * são dashboards (ex.: `observability-center`, `dba-workbench`) NÃO
 * carregam a tag `"dashboard"`, então não entram nessa contagem. A
 * evolução para um predicado mais largo é responsabilidade de D1.
 */
function countDashboardCompositions(): number {
  return compositions.filter((c) => c.tags?.includes("dashboard")).length
}

/** Card de um sub-grupo (Dashboards & Charts / Dashboards & Data). */
function DashboardGroupCard({ group }: { group: GroupWithCount }) {
  const Icon: LucideIcon = group.icon ?? GROUP_ICONS[group.id] ?? BarChart3
  return (
    <Link
      to={`/components/grupo/${group.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground transition-colors group-hover:border-foreground/20">
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="text-base font-semibold tracking-tight">{group.label}</h3>
      </div>
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {group.description}
      </p>
      <p className="mt-auto pt-1 text-xs font-medium tabular-nums text-muted-foreground/80">
        {group.componentCount}{" "}
        {group.componentCount === 1 ? "componente" : "componentes"} ·{" "}
        {group.familyCount}{" "}
        {group.familyCount === 1 ? "família" : "famílias"}
      </p>
    </Link>
  )
}

/**
 * Rota índice `/dashboard` (REORG): OVERVIEW standalone da superfície de
 * dashboard. Diferente de `/components/grupo/dashboards-charts` (que é uma
 * group-page aninhada na sidebar de docs), esta página é uma porta de
 * entrada dedicada para quem quer CONSTRUIR um dashboard analítico — vê
 * os 2 sub-grupos (charts + data) e o atalho para composições prontas.
 *
 * Renderiza standalone dentro de `<Layout>` (Header + Footer + main, sem
 * sidebar de docs). Próxima task C2 cuida de plugar a rota em `App.tsx` e
 * adicionar link no Header. Reusa o padrão de card de `ComponentsIndex.tsx`
 * para os 2 sub-grupos, com `DocBreadcrumb` (segmento "Dashboard" sem link,
 * como página atual) e stat agregado no header.
 */
export function DashboardIndex() {
  const groups = listGroups().filter((g) =>
    (DASHBOARD_GROUP_IDS as readonly string[]).includes(g.id),
  )
  // Ordena os 2 cards pela ordem canônica (charts antes de data).
  groups.sort(
    (a, b) =>
      (GROUP_BY_ID[a.id]?.order ?? 0) - (GROUP_BY_ID[b.id]?.order ?? 0),
  )

  const totals = getDashboardTotals()
  const compositionCount = countDashboardCompositions()
  const compositionLabel = `${compositionCount} ${
    compositionCount === 1 ? "composição" : "composições"
  }`

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <DocBreadcrumb className="mb-6" segments={[{ label: "Dashboard" }]} />

      <header className="space-y-3 border-b border-border pb-8">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="size-5 text-primary" aria-hidden />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Componentes para construir dashboards analíticos: gráficos, KPI/métricas,
          tabelas de dados, observabilidade e dev shells.
        </p>
        <p className="text-sm font-medium tabular-nums text-muted-foreground/80">
          {totals.componentCount} componentes · 2 sub-grupos ·{" "}
          {compositionLabel}
        </p>
      </header>

      {/* Sub-grupos (Dashboards & Charts + Dashboards & Data) */}
      <section className="mt-10 space-y-5">
        <div className="flex items-center gap-2.5">
          <LayoutGrid
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sub-grupos
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <DashboardGroupCard key={group.id} group={group} />
          ))}
        </div>
      </section>

      {/* CTA composições de dashboard */}
      <section className="mt-10 rounded-xl border border-border bg-muted/30 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LineChart
                className="size-4 shrink-0 text-primary"
                aria-hidden
              />
              <h2 className="text-base font-semibold tracking-tight">
                Composições de dashboard
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Telas completas prontas — dashboards SaaS, IDE para DBA, centro
              de observabilidade, AI Dashboard Builder e mais — que você pode
              instalar pelo registry do shadcn e customizar.
            </p>
          </div>
          <Link
            to="/compositions?category=dashboard"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-foreground/20 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
          >
            Ver composições de dashboard
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  )
}
