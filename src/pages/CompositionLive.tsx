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
 *  1. Telas "app" registradas como `wide: true` (ai-ide, dba-workbench,
 *     observability, workflow-builder, mind-map, db-schema-designer, etc.):
 *     força o ROOT da composição (filho direto; `<Suspense>` é transparente
 *     no DOM) a ocupar a tela inteira, removendo a moldura (altura fixa,
 *     max-width, borda, sombra) que ela usa na página de detalhe. Usa `!`
 *     (important) para vencer a altura fixa do próprio root (ex.: `h-[82vh]`
 *     do ai-ide).
 *  2. Chat apps (`chat-app`, `chat-inbox-pro`): mesmo tratamento das telas
 *     `wide` — esses dois também têm moldura (`h-[78vh]` + `max-w-6xl` +
 *     borda + sombra) que precisa sair pra ocupar a viewport na live demo.
 *     Diferente das telas `wide`, o atributo `data-conversation-id` está nas
 *     LINHAS da lista de conversas (não no container raiz), então a regra
 *     antiga baseada nesse atributo estava aplicando h-screen/max-w-none em
 *     cada item da lista, o que não resolvia o problema. Por isso
 *     substituímos por uma lista de slugs explícita.
 */

const FULLSCREEN_CHAT_SLUGS = new Set([
  "chat-app",
  "chat-inbox-pro",
  "voa-crm",
])

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

  const isFullscreen = composition.wide || FULLSCREEN_CHAT_SLUGS.has(composition.slug)

  return (
    <div className="fixed inset-0 overflow-auto bg-background">
      <div
        className={cn(
          // Telas app (wide) e chat apps (chat-app, chat-inbox-pro):
          // root da composição ocupa a viewport inteira, sem moldura.
          // Importante (`!`) para vencer a altura fixa do próprio root
          // (ex.: `h-[78vh]` do chat-app, `h-[82vh]` do ai-ide).
          isFullscreen &&
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
