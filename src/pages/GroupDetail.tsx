import { useCallback, useEffect, useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"

import { AiActionsMenu } from "@/components/showcase/AiActionsMenu"
import { DocBreadcrumb } from "@/components/showcase/DocBreadcrumb"
import { DocPagerNav } from "@/components/showcase/DocPagerNav"
import { OnThisPage, type TocSection } from "@/components/showcase/OnThisPage"
import { OriginBadge } from "@/components/catalog/OriginBadge"
import { VariantSection } from "@/pages/FamilyDetail"
import { buildComponentPrompt } from "@/data/component-prompt"
import type { Family } from "@/data/families"
import {
  GROUPS,
  GROUP_BY_ID,
  getGroupItems,
  type Group,
  type GroupId,
} from "@/data/groups"
import { NotFound } from "@/pages/NotFound"

/** Type guard: o param da rota é um `GroupId` conhecido? */
function isGroupId(value: string): value is GroupId {
  return Object.prototype.hasOwnProperty.call(GROUP_BY_ID, value)
}

/**
 * Página de GRUPO: /components/grupo/:groupId
 *
 * Renderiza um grupo inteiro (cluster da O2.x) com TODAS as suas famílias e
 * variantes empilhadas em seções com âncora, reaproveitando `VariantSection`
 * (a mesma seção de variante da página de família: Uso / Instalação via
 * `InstallTabs` / Dica). Resolve o param:
 *  - `groupId` é um {@link GroupId} válido → renderiza o grupo;
 *  - caso contrário → NotFound (variante "component").
 *
 * A rota é mais específica que `/components/:id` (3 segmentos vs 2 + o estático
 * "grupo"), então não colide com a página de família.
 */
export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  const location = useLocation()

  if (!groupId || !isGroupId(groupId)) {
    return <NotFound variant="component" />
  }

  return <GroupView groupId={groupId} hash={location.hash} />
}

/** Render efetivo do grupo (separado pra usar hooks sem condicional). */
function GroupView({ groupId, hash }: { groupId: GroupId; hash: string }) {
  const group = GROUP_BY_ID[groupId]
  const families = getGroupItems(groupId)
  const Icon = group.icon
  const componentCount = families.reduce((n, f) => n + f.variants.length, 0)

  /** Markdown agregado do grupo: prompts de cada família concatenados. */
  const groupPrompt = useMemo(
    () => families.map((f) => buildComponentPrompt(f)).join("\n\n---\n\n"),
    [families],
  )

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }
  }, [])

  // Scroll-to-anchor: deep-link `#<slug>` (O2.7) rola até a seção da variante.
  useEffect(() => {
    const id = hash.replace(/^#/, "")
    if (!id) return
    if (document.getElementById(id)) {
      scrollTo(id)
    }
  }, [hash, scrollTo])

  const tocSections = buildGroupToc(families)

  // Navegação "Anterior / Próxima" entre GRUPOS, na ordem global de `GROUPS`.
  const { prev, next } = getAdjacentGroups(groupId)
  const pagerPrev = prev
    ? { href: `/components/grupo/${prev.id}`, label: prev.label }
    : undefined
  const pagerNext = next
    ? { href: `/components/grupo/${next.id}`, label: next.label }
    : undefined

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-8 sm:px-8 sm:py-12">
      <article className="min-w-0 max-w-3xl flex-1">
        {/* Breadcrumb: Componentes › <Grupo> (a página atual não tem link). */}
        <DocBreadcrumb
          className="mb-6"
          segments={[
            { label: "Componentes", href: "/components" },
            { label: group.label },
          ]}
        />

        {/* Header do grupo */}
        <header className="space-y-4 border-b border-border pb-8">
          <div className="flex items-center gap-3">
            {Icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {group.label}
            </h1>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">
            {group.description}
          </p>
          <p className="text-sm text-muted-foreground">
            {families.length} {families.length === 1 ? "família" : "famílias"} ·{" "}
            {componentCount}{" "}
            {componentCount === 1 ? "componente" : "componentes"}
          </p>
          <AiActionsMenu
            prompt={groupPrompt}
            className="shrink-0"
          />
        </header>

        {/* Seções: uma família por bloco (variantes empilhadas). */}
        <div className="mt-10 space-y-20">
          {families.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum componente neste grupo ainda.
            </p>
          ) : (
            families.map((family) =>
              family.variants.length === 1 ? (
                // Família de variante única: a própria VariantSection (id=slug).
                <VariantSection
                  key={family.base}
                  variant={family.variants[0]}
                  multi={false}
                />
              ) : (
                <FamilyGroupSection key={family.base} family={family} />
              )
            )
          )}
        </div>

        {/* Rodapé: navegação Anterior / Próxima entre grupos. */}
        <DocPagerNav prev={pagerPrev} next={pagerNext} />
      </article>

      {/* TOC "Nesta página" — coluna direita (xl+) */}
      <OnThisPage sections={tocSections} />
    </div>
  )
}

/**
 * Bloco de uma família COM múltiplas variantes dentro de um grupo: um cabeçalho
 * de família (âncora `grupo-<base>`, sem colidir com os slugs das variantes) +
 * cada variante via `VariantSection` (cada uma com `id=<slug>` e scroll-mt).
 */
function FamilyGroupSection({ family }: { family: Family }) {
  return (
    <section
      id={`grupo-${family.base}`}
      aria-labelledby={`grupo-heading-${family.base}`}
      className="scroll-mt-24 space-y-12"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Família
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id={`grupo-heading-${family.base}`}
            className="text-2xl font-bold tracking-tight"
          >
            {family.name}
          </h2>
          {family.origins.map((origin) => (
            <OriginBadge key={origin} origin={origin} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {family.variants.length} variantes nesta família.
        </p>
      </header>
      <div className="space-y-16">
        {family.variants.map((variant) => (
          <VariantSection key={variant.slug} variant={variant} multi />
        ))}
      </div>
    </section>
  )
}

/**
 * Deriva o índice "Nesta página" do grupo:
 *  - família de variante única → 1 entrada (depth 1) na âncora do slug;
 *  - família multi-variante → entrada da família (depth 1, âncora `grupo-<base>`)
 *    + uma entrada por variante (depth 2, âncora do slug).
 */
function buildGroupToc(families: Family[]): TocSection[] {
  return families.flatMap((family) => {
    if (family.variants.length === 1) {
      return [
        { id: family.variants[0].slug, label: family.name, depth: 1 as const },
      ]
    }
    return [
      { id: `grupo-${family.base}`, label: family.name, depth: 1 as const },
      ...family.variants.map((variant) => ({
        id: variant.slug,
        label: variant.name,
        depth: 2 as const,
      })),
    ]
  })
}

/** Resultado da navegação adjacente entre grupos (bordas → undefined). */
interface AdjacentGroups {
  prev?: Group
  next?: Group
}

/**
 * Grupos adjacentes (anterior/próximo) na ordem global de `GROUPS` (campo
 * `order`: primitivos → aplicações → visual). Bordas devolvem `undefined`.
 */
function getAdjacentGroups(groupId: GroupId): AdjacentGroups {
  const ordered = [...GROUPS].sort((a, b) => a.order - b.order)
  const index = ordered.findIndex((g) => g.id === groupId)
  if (index === -1) return {}
  return {
    prev: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  }
}
