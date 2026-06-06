import { Link } from "react-router-dom"

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui"
import { compositions } from "@/data/compositions"

/**
 * Galeria de composições — telas inteiras montadas com os componentes
 * da vitrine. Cada card leva à página de preview correspondente.
 */
export function Compositions() {
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

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {compositions.map((composition) => (
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
