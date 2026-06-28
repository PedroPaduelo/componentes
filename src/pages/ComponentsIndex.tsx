import { Link } from "react-router-dom"

import { DocBreadcrumb } from "@/components/showcase/DocBreadcrumb"
import {
  DOMAIN_ICONS,
  DOMAIN_LABELS,
  GROUP_ICONS,
} from "@/components/layout/category-icons"
import {
  DOMAIN_IDS,
  listGroups,
  type GroupWithCount,
} from "@/data/groups"

/** Conta no formato "N famílias · M componentes" (singular/plural correto). */
function countLabel(group: GroupWithCount): string {
  const families = `${group.familyCount} ${
    group.familyCount === 1 ? "família" : "famílias"
  }`
  const components = `${group.componentCount} ${
    group.componentCount === 1 ? "componente" : "componentes"
  }`
  return `${families} · ${components}`
}

/** Card de um grupo: ícone + label + descrição + contagem, linka a group-page. */
function GroupCard({ group }: { group: GroupWithCount }) {
  const Icon = GROUP_ICONS[group.id]
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
        {countLabel(group)}
      </p>
    </Link>
  )
}

/**
 * Rota índice `/components`: OVERVIEW dos 16 grupos da vitrine.
 *
 * Renderiza um índice de fato: os 16 grupos (via {@link listGroups}, já com
 * `familyCount`/`componentCount`) organizados pelos 3 DOMÍNIOS macro
 * (`DOMAIN_IDS`: primitivos → aplicações → visual).
 *
 * Cada grupo vira um card com ícone, rótulo, descrição curta e contagem
 * (famílias · componentes), linkando para a group-page
 * `/components/grupo/:groupId`. Renderiza dentro do `DocsLayout` (sidebar à
 * esquerda já presente), então o miolo só precisa do conteúdo central.
 */
export function ComponentsIndex() {
  const groups = listGroups()
  const sections = DOMAIN_IDS.map((domain) => ({
    domain,
    groups: groups.filter((g) => g.domain === domain),
  })).filter((section) => section.groups.length > 0)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <DocBreadcrumb className="mb-6" segments={[{ label: "Componentes" }]} />

      <header className="space-y-3 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Componentes
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Explore o catálogo organizado em {groups.length} grupos, agrupados por
          domínio. Escolha um grupo para ver suas famílias e variantes com
          preview, código e instalação.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {sections.map((section) => {
          const DomainIcon = DOMAIN_ICONS[section.domain]
          return (
            <section key={section.domain} className="space-y-5">
              <div className="flex items-center gap-2.5">
                <DomainIcon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {DOMAIN_LABELS[section.domain]}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
