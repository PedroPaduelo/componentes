import { Link } from "react-router-dom"
import { ArrowLeft, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

type NotFoundProps = {
  /** Quando true, a mensagem é contextualizada a "componente não encontrado". */
  variant?: "component" | "page"
}

/**
 * Página de "não encontrado" usada em dois cenários:
 *  1. Slug inválido em /components/:slug (variant="component").
 *  2. Rota desconhecida da SPA — catch-all "*" (variant="page", default).
 *
 * Em ambos os casos oferece um caminho de volta ao catálogo/início.
 */
export function NotFound({ variant = "page" }: NotFoundProps) {
  const isComponent = variant === "component"
  const title = isComponent
    ? "Componente não encontrado"
    : "Página não encontrada"
  const description = isComponent
    ? "Não encontramos nenhum componente com esse slug. Confira a lista do catálogo."
    : "O endereço que você acessou não existe na vitrine."

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-7" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-8">
        <Link to="/">
          <ArrowLeft className="size-4" />
          Voltar ao catálogo
        </Link>
      </Button>
    </div>
  )
}
