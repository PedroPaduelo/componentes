import { Suspense } from "react"
import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { compositionScreens } from "@/compositions"
import { getCompositionBySlug } from "@/data/compositions"

/**
 * Página minimal que renderiza SÓ a composição em full screen, sem Header,
 * Footer, padding ou bordas. Projetada para ser aberta numa aba nova via
 * o botão "Live demo" na CompositionDetail.
 *
 * O wrapper com seletor descendant `[&_[data-conversation-id]]` força o
 * container raiz da composição a ocupar toda a viewport quando renderizada
 * aqui — sem modificar a composição em si (que mantém h-[78vh] etc. na
 * página de detalhe).
 */
export function CompositionLive() {
  const { slug } = useParams<{ slug: string }>()
  const composition = slug ? getCompositionBySlug(slug) : undefined

  if (!composition) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-muted-foreground">
        Composição não encontrada
      </div>
    )
  }

  const Screen = compositionScreens[composition.slug]

  if (!Screen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-muted-foreground">
        Composição não encontrada
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto">
      <div className="[&_[data-conversation-id]]:h-screen [&_[data-conversation-id]]:max-w-none [&_[data-conversation-id]]:rounded-none [&_[data-conversation-id]]:border-0 [&_[data-conversation-id]]:shadow-none">
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <Screen />
        </Suspense>
      </div>
    </div>
  )
}
