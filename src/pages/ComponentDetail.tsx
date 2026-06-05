import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExampleBlock } from "@/components/showcase/ExampleBlock"
import { getComponentBySlug } from "@/data/components"
import { getExamplesBySlug } from "@/data/examples"
import { NotFound } from "@/pages/NotFound"

/**
 * Página de detalhe de um componente: /components/:slug
 *
 * Fluxo:
 *  1. Resolve o slug contra o registry. Se não existir, renderiza
 *     NotFound (variant="component") — sem crash.
 *  2. Renderiza o header (nome, Badge categoria, descrição, voltar).
 *  3. Renderiza os ExampleBlocks (preview ao vivo + código + copy).
 *  4. Slug válido sem examples → estado degradado "Exemplos em breve".
 */
export function ComponentDetail() {
  const { slug } = useParams<{ slug: string }>()
  const component = slug ? getComponentBySlug(slug) : undefined

  if (!component) {
    return <NotFound variant="component" />
  }

  const items = getExamplesBySlug(component.slug)

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

      {/* Header do componente */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {component.name}
          </h1>
          <Badge variant="secondary">{component.category}</Badge>
        </div>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          {component.description}
        </p>
      </header>

      {/* Lista de exemplos */}
      <section className="mt-10 space-y-10">
        {items && items.length > 0 ? (
          items.map((example, index) => (
            <ExampleBlock
              key={`${component.slug}-${index}-${example.title}`}
              title={example.title}
              description={example.description}
              code={example.code}
              render={example.render}
            />
          ))
        ) : (
          <EmptyExamples name={component.name} />
        )}
      </section>
    </div>
  )
}

/** Degradação elegante quando o slug existe mas ainda não tem exemplos. */
function EmptyExamples({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ArrowLeft className="size-6 rotate-45" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Exemplos em breve</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Ainda não cadastramos exemplos para <strong>{name}</strong>. Volte
        mais tarde — novos exemplos aparecem a cada atualização da vitrine.
      </p>
    </div>
  )
}
