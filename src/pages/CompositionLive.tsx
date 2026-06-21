import { Suspense } from "react"
import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { compositionScreens } from "@/compositions"
import { getCompositionBySlug } from "@/data/compositions"
import { cn } from "@/lib/utils"

/**
 * Página minimal que renderiza SÓ a composição em full screen, sem Header,
 * Footer, padding ou bordas. Projetada para ser aberta numa aba nova via
 * o botão "Live demo" na CompositionDetail.
 *
 * Dois mecanismos de "esticar para a viewport", sem modificar as composições
 * (que mantêm h-[78vh]/h-[82vh], bordas e max-width na página de detalhe):
 *
 *  1. Chat: o container de conversa (`[data-conversation-id]`) vira `h-screen`
 *     sem moldura — vence por specificity (classe + attribute).
 *  2. Telas "app" (`wide: true` no registry — ai-ide, dba-workbench,
 *     observability, workflow-builder, etc.): força o ROOT da composição
 *     (filho direto; `<Suspense>` é transparente no DOM) a ocupar a tela
 *     inteira, removendo a moldura (altura fixa, max-width, borda, sombra)
 *     que ela usa na página de detalhe. Usa `!` (important) para vencer a
 *     altura fixa do próprio root (ex.: `h-[82vh]` do ai-ide).
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
    <div className="fixed inset-0 overflow-auto bg-background">
      <div
        className={cn(
          // 1. Chat: container de conversa preenche a viewport, sem moldura.
          "[&_[data-conversation-id]]:h-screen [&_[data-conversation-id]]:max-w-none [&_[data-conversation-id]]:rounded-none [&_[data-conversation-id]]:border-0 [&_[data-conversation-id]]:shadow-none",
          // 2. Telas app (wide): root da composição ocupa a tela inteira.
          composition.wide &&
            "[&>*]:!h-screen [&>*]:!max-w-none [&>*]:!rounded-none [&>*]:!border-0 [&>*]:!shadow-none",
        )}
      >
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
