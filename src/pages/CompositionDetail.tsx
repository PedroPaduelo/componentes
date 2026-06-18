import { Suspense } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, Sparkles, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CodeBlockCommand } from "@/components/ui/code-block-command"
import { CopyPromptButton } from "@/components/showcase/CopyPromptButton"
import { compositionScreens } from "@/compositions"
import { getCompositionBySlug } from "@/data/compositions"
import {
  buildCompositionPrompt,
  getCompositionAddCommand,
  getCompositionExportName,
} from "@/data/composition-prompt"
import { COMPOSITIONS_SKILL } from "@/data/ai-skills"
import { NotFound } from "@/pages/NotFound"

/**
 * Página de detalhe/preview de uma composição. Resolve o slug pela rota,
 * valida no registry e renderiza a tela correspondente. Inclui:
 *  - instalação do BLOCO inteiro via registry shadcn (CodeBlockCommand);
 *  - botão "Copiar prompt para IA" direcionando o uso da skill de composições.
 */
export function CompositionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const composition = slug ? getCompositionBySlug(slug) : undefined

  if (!composition) {
    return <NotFound variant="page" />
  }

  const Screen = compositionScreens[composition.slug]
  const widthClass = composition.wide ? "max-w-[1600px]" : "max-w-6xl"
  const addCommand = getCompositionAddCommand(composition.slug)
  const exportName = getCompositionExportName(composition.slug)

  return (
    <div className={`mx-auto ${widthClass} px-4 py-12 sm:px-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {composition.name}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {composition.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CopyPromptButton prompt={buildCompositionPrompt(composition)} />
          <Button asChild variant="outline">
            <Link to="/compositions">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Instalar bloco — registry shadcn */}
      <section className="mt-8 rounded-xl border border-border bg-muted/30 p-5 sm:p-6">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Terminal className="h-4 w-4 text-primary" />
            Instalar este bloco
          </h2>
          <Link
            to="/instalacao#skills"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <Sparkles className="size-3.5" />
            Usar com IA (skill)
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Um comando baixa a tela inteira e instala automaticamente todos os
          componentes da vitrine que ela usa. Requer{" "}
          <code className="font-mono text-xs text-foreground">shadcn init</code>{" "}
          no seu projeto — veja a{" "}
          <Link
            to="/instalacao"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            página de instalação
          </Link>
          .
        </p>
        <div className="mt-3">
          <CodeBlockCommand code={addCommand} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Depois, renderize a tela:{" "}
          <code className="font-mono text-xs text-foreground">
            {`import { ${exportName} } from "@/compositions/${composition.slug}"`}
          </code>
          . Para instruções completas de IA, use a skill{" "}
          <code className="font-mono text-xs text-foreground">
            {COMPOSITIONS_SKILL.slug}
          </code>
          .
        </p>
      </section>

      <div className="mt-8 overflow-hidden rounded-lg border border-border">
        {Screen ? (
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <Screen />
          </Suspense>
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
