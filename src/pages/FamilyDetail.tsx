import { useCallback, useEffect, useState } from "react"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExampleBlock } from "@/components/showcase/ExampleBlock"
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Voltar */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Voltar ao catálogo
          </Link>
        </Button>
      </div>

      {/* Header da família */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {family.name}
          </h1>
          <Badge variant="secondary">{family.category}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {family.variants.length === 1
              ? "1 variante de"
              : `${family.variants.length} variantes de`}
          </span>
          {family.origins.map((origin) => (
            <OriginBadge key={origin} origin={origin} />
          ))}
        </div>
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
      <div className="mt-10 space-y-16">
        {family.variants.map((variant) => (
          <VariantSection key={variant.slug} variant={variant} />
        ))}
      </div>
    </div>
  )
}

/** Uma seção da página: header com badge de origem + examples da variante. */
function VariantSection({ variant }: { variant: ComponentMeta }) {
  const origin = originOf(variant)
  const items = getExamplesBySlug(variant.slug)

  return (
    <section
      id={variant.slug}
      aria-labelledby={`section-${variant.slug}`}
      className="scroll-mt-20 space-y-6"
    >
      <header className="space-y-2 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id={`section-${variant.slug}`}
            className="text-2xl font-semibold tracking-tight"
          >
            {variant.name}
          </h2>
          <OriginBadge origin={origin} />
        </div>
        <p className="text-sm text-muted-foreground">{variant.description}</p>
        <p className="text-xs text-muted-foreground">
          {ORIGIN_DESCRIPTIONS[origin]}
        </p>
      </header>

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
    </section>
  )
}
