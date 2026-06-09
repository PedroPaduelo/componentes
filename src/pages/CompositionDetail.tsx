import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { compositionScreens } from "@/compositions"
import { getCompositionBySlug } from "@/data/compositions"
import { NotFound } from "@/pages/NotFound"

/**
 * Página de detalhe/preview de uma composição. Resolve o slug pela rota,
 * valida no registry e renderiza a tela correspondente.
 */
export function CompositionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const composition = slug ? getCompositionBySlug(slug) : undefined

  if (!composition) {
    return <NotFound variant="page" />
  }

  const Screen = compositionScreens[composition.slug]
  const widthClass = composition.wide ? "max-w-[1600px]" : "max-w-6xl"

  return (
    <div className={`mx-auto ${widthClass} px-4 py-12 sm:px-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {composition.name}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {composition.description}
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link to="/compositions">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="mt-10 overflow-hidden rounded-lg border border-border">
        {Screen ? (
          <Screen />
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-muted-foreground">
              Esta composição ainda não tem uma tela disponível.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
