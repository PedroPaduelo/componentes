import { Suspense } from "react"
import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { compositionScreens } from "@/compositions"
import { getCompositionBySlug } from "@/data/compositions"

/**
 * Página minimal que renderiza SÓ a composição em full screen, sem Header,
 * Footer, padding ou bordas. Projetada para ser aberta numa aba nova via
 * o botão "Live demo" na CompositionDetail.
 */
export function CompositionLive() {
  const { slug } = useParams<{ slug: string }>()
  const composition = slug ? getCompositionBySlug(slug) : undefined

  if (!composition) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Composição não encontrada
      </div>
    )
  }

  const Screen = compositionScreens[composition.slug]

  if (!Screen) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Composição não encontrada
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <Screen />
      </Suspense>
    </div>
  )
}
