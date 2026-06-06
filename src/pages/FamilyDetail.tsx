import { useCallback, useEffect, useState } from "react"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlockCommand } from "@/components/ui/code-block-command"
import { ExampleBlock } from "@/components/showcase/ExampleBlock"
import { CodeBlock } from "@/components/showcase/CodeBlock"
import { OnThisPage, type TocSection } from "@/components/showcase/OnThisPage"
import { OriginBadge } from "@/components/catalog/OriginBadge"
import { ORIGIN_DESCRIPTIONS } from "@/components/catalog/origin-meta"
import type { ComponentMeta } from "@/data/components"
import {
  getFamilyBase,
  getOrigin,
  groupByFamily,
  type ComponentOrigin,
  type Family,
} from "@/data/families"
import { getExamplesBySlug } from "@/data/examples"
import { getComponentInstall } from "@/data/component-install"
import { NotFound } from "@/pages/NotFound"

/** Resolve a família cujo base bate exatamente com o param. */
function findFamilyByBase(base: string): Family | undefined {
  return groupByFamily().find((f) => f.base === base)
}

/** Deriva a origem de um ComponentMeta a partir de slug/tags. */
function originOf(variant: ComponentMeta): ComponentOrigin {
  return getOrigin(variant.slug, variant.tags)
}

/**
 * Página de família: /components/:id
 *
 * Resolve o param `id`:
 *  1. Se `id` é um BASE de família (getFamilyBase(id) === id e existe família)
 *     → renderiza a página de família.
 *  2. Se `id` é o slug de uma VARIANTE (ex.: "button-fluid") → redireciona
 *     (replace) pra `/components/<base>#<id>`, preservando deep-links antigos.
 *  3. Se não casa nada → NotFound.
 */
export function FamilyDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()

  if (!id) {
    return <NotFound variant="component" />
  }

  const base = getFamilyBase(id)

  // É uma variante (não o base canônico): redireciona pra base#slug.
  if (base !== id) {
    return <Navigate to={`/components/${base}#${id}`} replace />
  }

  const family = findFamilyByBase(base)
  if (!family) {
    return <NotFound variant="component" />
  }

  return <FamilyView family={family} hash={location.hash} />
}

/** Render efetivo da família (separado pra usar hooks sem condicional). */
function FamilyView({ family, hash }: { family: Family; hash: string }) {
  const multi = family.variants.length > 1
  const [active, setActive] = useState<string>(family.variants[0].slug)
  const representative = family.variants[0]

  const scrollTo = useCallback((slug: string) => {
    const el = document.getElementById(slug)
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }
  }, [])

  // Scroll-to-anchor: se há hash na URL, ativa a aba e rola até a seção.
  useEffect(() => {
    const slug = hash.replace(/^#/, "")
    if (!slug) return
    if (document.getElementById(slug)) {
      setActive(slug)
      scrollTo(slug)
    }
  }, [hash, scrollTo])

  const handleTabChange = useCallback(
    (slug: string) => {
      setActive(slug)
      scrollTo(slug)
    },
    [scrollTo]
  )

  const tocSections = buildTocSections(family, multi)

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-8 sm:px-8 sm:py-12">
      <article className="min-w-0 max-w-3xl flex-1">
        {/* Breadcrumb leve — a navegação principal é a sidebar. */}
        <nav
          aria-label="Trilha de navegação"
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link
            to="/components"
            className="transition-colors hover:text-foreground"
          >
            Componentes
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
          <span className="font-medium text-foreground">{family.name}</span>
        </nav>

        {/* Header da página */}
        <header className="space-y-4 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{family.category}</Badge>
            {family.origins.map((origin) => (
              <OriginBadge key={origin} origin={origin} />
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {family.name}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {representative.description}
          </p>
          {multi ? (
            <p className="text-sm text-muted-foreground">
              {family.variants.length} variantes nesta família.
            </p>
          ) : null}
        </header>

        {/* Abas de navegação — só quando há mais de uma variante. */}
        {multi ? (
          <nav className="mt-8" aria-label="Variantes da família">
            <Tabs value={active} onValueChange={handleTabChange}>
              <TabsList className="flex-wrap">
                {family.variants.map((variant) => (
                  <TabsTrigger key={variant.slug} value={variant.slug}>
                    {variant.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </nav>
        ) : null}

        {/* Seções por variante */}
        <div className="mt-10 space-y-20">
          {family.variants.map((variant) => (
            <VariantSection key={variant.slug} variant={variant} multi={multi} />
          ))}
        </div>
      </article>

      {/* TOC "Nesta página" — coluna direita (xl+) */}
      <OnThisPage sections={tocSections} />
    </div>
  )
}

/**
 * Deriva as seções do índice "Nesta página" a partir da família.
 *
 * - Família multi-variante: uma entrada por variante (depth 1, âncora
 *   `section-<slug>`) com as três subseções (Uso/Instalação/Dica, depth 2).
 * - Família de variante única: as três subseções viram entradas de topo
 *   (depth 1), apontando para `<slug>-uso` / `-instalacao` / `-dica`.
 */
function buildTocSections(family: Family, multi: boolean): TocSection[] {
  if (!multi) {
    const slug = family.variants[0].slug
    return [
      { id: `${slug}-uso`, label: "Uso", depth: 1 },
      { id: `${slug}-instalacao`, label: "Instalação", depth: 1 },
      { id: `${slug}-dica`, label: "Dica de uso", depth: 1 },
    ]
  }
  return family.variants.flatMap((variant) => [
    { id: `section-${variant.slug}`, label: variant.name, depth: 1 as const },
    { id: `${variant.slug}-uso`, label: "Uso", depth: 2 as const },
    { id: `${variant.slug}-instalacao`, label: "Instalação", depth: 2 as const },
    { id: `${variant.slug}-dica`, label: "Dica de uso", depth: 2 as const },
  ])
}

/**
 * Seção de documentação de uma variante, no formato doc:
 * header → Uso (exemplos via ExampleBlock) → Instalação → Dica de uso.
 *
 * Headings semânticos: h2 para o nome da variante (quando multi-variante) ou
 * para as subseções (quando família de variante única); h3 para subseções
 * dentro de uma variante multi. Todos com `id` para ancoragem do TOC (FASE 3).
 */
function VariantSection({
  variant,
  multi,
}: {
  variant: ComponentMeta
  multi: boolean
}) {
  const origin = originOf(variant)
  const items = getExamplesBySlug(variant.slug)
  const install = getComponentInstall(variant.slug)
  const tip = buildUsageTip(variant, origin)

  // Em família multi-variante, o título da variante é h2 e as subseções são h3.
  // Em família de variante única, as subseções viram h2 diretamente.
  const SubHeading = multi ? "h3" : "h2"
  const usageId = `${variant.slug}-uso`
  const installId = `${variant.slug}-instalacao`
  const tipId = `${variant.slug}-dica`

  const importSnippet = `import { ${install.exportName} } from "${install.importPath}"`

  return (
    <section
      id={variant.slug}
      aria-labelledby={`section-${variant.slug}`}
      className="scroll-mt-24 space-y-10"
    >
      {/* Header da variante (sempre h2 — âncora do TOC) */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id={`section-${variant.slug}`}
            className="text-2xl font-semibold tracking-tight"
          >
            {variant.name}
          </h2>
          <OriginBadge origin={origin} />
        </div>
        {multi ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {variant.description}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {ORIGIN_DESCRIPTIONS[origin]}
        </p>
      </header>

      {/* Uso — exemplos ao vivo (preview + código copiável) */}
      <div className="space-y-6">
        <SubHeading
          id={usageId}
          className="scroll-mt-24 text-lg font-semibold tracking-tight"
        >
          Uso
        </SubHeading>
        {items && items.length > 0 ? (
          <div className="space-y-10">
            {items.map((example, index) => (
              <ExampleBlock
                key={`${variant.slug}-${index}-${example.title}`}
                title={example.title}
                description={example.description}
                code={example.code}
                render={example.render}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Exemplos em breve para <strong>{variant.name}</strong>.
          </p>
        )}
      </div>

      {/* Instalação — comando de dep (quando houver) + import path */}
      <div className="space-y-4">
        <SubHeading
          id={installId}
          className="scroll-mt-24 text-lg font-semibold tracking-tight"
        >
          Instalação
        </SubHeading>
        {install.depCommand ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Instale a dependência necessária:
            </p>
            <CodeBlockCommand code={install.depCommand} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem dependência externa — copie o arquivo do componente para o seu
            projeto.
          </p>
        )}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Importe e use no seu código:
          </p>
          <CodeBlock code={importSnippet} language="tsx" />
          {!install.exportConfirmed ? (
            <p className="text-xs text-muted-foreground">
              O nome do export é derivado do componente — confira o arquivo
              fonte para o nome e a API exatos.
            </p>
          ) : null}
        </div>
      </div>

      {/* Dica de uso — parágrafo curto derivado de description/tags */}
      <div className="space-y-3">
        <SubHeading
          id={tipId}
          className="scroll-mt-24 text-lg font-semibold tracking-tight"
        >
          Dica de uso
        </SubHeading>
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{tip}</p>
        </div>
      </div>
    </section>
  )
}

/**
 * Gera um parágrafo curto de "quando usar / boas práticas".
 *
 * Prioriza o texto curado em `variant.usage` (registry). Quando ausente, cai
 * no fallback derivado de description + tags — que NÃO inventa API nem props,
 * só recombina os metadados existentes em uma frase orientativa.
 */
function buildUsageTip(
  variant: ComponentMeta,
  origin: ComponentOrigin
): string {
  if (variant.usage && variant.usage.trim().length > 0) {
    return variant.usage.trim()
  }
  const keywords = variant.tags
    .filter((t) => t !== "fluid" && t !== origin.toLowerCase())
    .slice(0, 3)
  const keywordPart =
    keywords.length > 0
      ? ` Boa escolha em contextos de ${keywords.join(", ")}.`
      : ""
  const originPart =
    origin === "shadcn"
      ? ""
      : ` Variante ${origin}, indicada quando você quer o acabamento visual dessa coleção.`
  return `${variant.description}${keywordPart}${originPart}`
}
