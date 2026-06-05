import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/showcase/CopyButton"

type CodeBlockProps = {
  /** Snippet de código a ser exibido (e copiado). */
  code: string
  /** Linguagem exibida no canto (puramente visual, sem syntax highlight). */
  language?: string
  className?: string
}

/**
 * Bloco de código com fonte mono, fundo contrastante e botão "Copiar".
 *
 * - Sem syntax highlight: o critério de aceite pede "bloco mono formatado",
 *   não coloração. Adicionar shiki/prism exigiria uma nova dep e, como a
 *   Task 3 é focada no showcase, mantemos a dep tree mínima.
 * - `whitespace-pre` e `break-words` no <pre> para não estourar a largura
 *   do container (especialmente em mobile).
 * - Fundo usa `bg-muted text-foreground` em vez de `bg-card` pra garantir
 *   contraste suficiente em dark e light.
 */
export function CodeBlock({ code, language = "tsx", className }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-foreground break-words whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}
