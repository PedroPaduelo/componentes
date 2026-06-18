import { useMemo } from "react"
import { ChevronDown, ClipboardCopy, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CopyPromptButton } from "@/components/showcase/CopyPromptButton"
import { cn } from "@/lib/utils"

type AiActionsMenuProps = {
  /** Markdown já gerado (saída de buildComponentPrompt / buildCompositionPrompt). */
  prompt: string
  className?: string
}

/** Destinos de IA suportados (URL + label + descrição). */
const AI_TARGETS = [
  {
    id: "chatgpt",
    label: "Abrir no ChatGPT",
    description: "Abre o chat com o prompt pré-preenchido",
    buildUrl: (encoded: string) => `https://chatgpt.com/?q=${encoded}`,
  },
  {
    id: "claude",
    label: "Abrir no Claude",
    description: "Abre uma nova conversa com o prompt",
    buildUrl: (encoded: string) => `https://claude.ai/new?q=${encoded}`,
  },
  {
    id: "v0",
    label: "Abrir no v0",
    description: "Abre o v0.dev com o prompt",
    buildUrl: (encoded: string) => `https://v0.dev/?q=${encoded}`,
  },
] as const

/**
 * Controle de ações de IA: "Copiar como Markdown" + dropdown "Abrir em"
 * (ChatGPT / Claude / v0).
 *
 * Reusa `CopyPromptButton` para o clipboard (mesma mecânica com fallback) e
 * monta URLs com o prompt URL-encoded para os 3 destinos de IA.
 *
 * O dropdown abre cada destino em nova aba (`target="_blank"` +
 * `rel="noopener noreferrer"`). O `?q=` na query string é o formato
 * convencionado pelo mercado (Park UI, shadcn, Aceternity, Magic UI).
 */
export function AiActionsMenu({ prompt, className }: AiActionsMenuProps) {
  // Encode só uma vez (memo — o prompt raramente muda dentro da mesma página).
  const encoded = useMemo(() => encodeURIComponent(prompt), [prompt])

  return (
    <div
      data-slot="ai-actions-menu"
      className={cn("flex items-center gap-2", className)}
    >
      <CopyPromptButton prompt={prompt} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Sparkles className="size-3.5" />
            Abrir em
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
            <ClipboardCopy className="size-3.5" />
            Abrir em IA
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {AI_TARGETS.map((target) => (
            <DropdownMenuItem
              key={target.id}
              asChild
            >
              <a
                href={target.buildUrl(encoded)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5"
              >
                <span className="text-sm font-medium">{target.label}</span>
                <span className="text-xs text-muted-foreground">
                  {target.description}
                </span>
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
