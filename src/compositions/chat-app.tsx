import { useEffect, useState } from "react"
import {
  Copy,
  RefreshCw,
  Paperclip,
  Sparkles,
  MessageSquarePlus,
  Trash2,
  Settings,
  Search,
} from "lucide-react"

import { ButtonFluid } from "@/components/ui/button-fluid"
import { ChatMessageFluid } from "@/components/ui/index"
import {
  ThinkingStepsFluid,
  ThinkingStepsHeaderFluid,
  ThinkingStepsContentFluid,
  ThinkingStepFluid,
  ThinkingStepSourcesFluid,
  ThinkingStepSourceFluid,
  ThinkingStepDetailsFluid,
} from "@/components/ui/index"
import { ThinkingIndicatorFluid } from "@/components/ui/thinking-indicator-fluid"
import { FileThumbnailFluid } from "@/components/ui/file-thumbnail-fluid"
import { InputMessageFluid } from "@/components/ui/input-message-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import { GlassDock } from "@/components/ui/glass-dock"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { ThemeToggleEffect } from "@/components/ui/theme-toggle-effect"

/* -------------------------------------------------------------------------- */
/*                              attachment helper                              */
/* -------------------------------------------------------------------------- */

/**
 * Generates a small in-memory PNG `File` so the attachment thumbnails have real
 * content to render (FileThumbnailFluid reads a real `File`). Runs once on mount.
 */
function useGeneratedImageFile() {
  const [file, setFile] = useState<File | null>(null)
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 240
    canvas.height = 240
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 240, 240)
      grad.addColorStop(0, "#6366f1")
      grad.addColorStop(1, "#ec4899")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 240, 240)
      ctx.fillStyle = "rgba(255,255,255,0.92)"
      ctx.font = "bold 120px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("UI", 120, 132)
    }
    canvas.toBlob((blob) => {
      if (blob) setFile(new File([blob], "mockup.png", { type: "image/png" }))
    }, "image/png")
  }, [])
  return file
}

/* -------------------------------------------------------------------------- */
/*                                 mock data                                   */
/* -------------------------------------------------------------------------- */

type Msg =
  | { id: number; from: "user"; text: string; time?: string; withFile?: boolean }
  | { id: number; from: "assistant"; text: string }

const INITIAL_MESSAGES: Msg[] = [
  {
    id: 1,
    from: "user",
    text: "Pode revisar esse mockup e sugerir melhorias de acessibilidade?",
    time: "Hoje 14:31",
    withFile: true,
  },
  {
    id: 2,
    from: "assistant",
    text: "Claro! O contraste do texto secundário está abaixo de 4.5:1. Sugiro usar um tom mais escuro e adicionar `aria-label` nos botões só com ícone.",
  },
  {
    id: 3,
    from: "user",
    text: "Perfeito. E sobre a navegação por teclado?",
    time: "Hoje 14:33",
  },
]

/* -------------------------------------------------------------------------- */
/*                                  ChatApp                                    */
/* -------------------------------------------------------------------------- */

export function ChatApp() {
  const attachment = useGeneratedImageFile()
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES)
  const [value, setValue] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [thinking, setThinking] = useState(true)

  function handleSend(text: string, sentFiles: File[]) {
    const trimmed = text.trim()
    if (!trimmed && sentFiles.length === 0) return
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        from: "user",
        text: trimmed || "(anexo enviado)",
        time: "Agora",
        withFile: sentFiles.length > 0,
      },
    ])
    setValue("")
    setFiles([])
    setThinking(true)
  }

  function newChat() {
    setMessages(INITIAL_MESSAGES)
    setValue("")
    setFiles([])
    setThinking(true)
  }

  return (
    <div className="mx-auto flex h-[78vh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={18} />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Assistente IA</span>
            <span className="text-[11px] text-muted-foreground">
              Online · responde em segundos
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipFluid content="Buscar na conversa">
            <ButtonFluid variant="ghost" size="icon-sm" aria-label="Buscar">
              <Search size={16} />
            </ButtonFluid>
          </TooltipFluid>
          <TooltipFluid content="Nova conversa">
            <ButtonFluid
              variant="ghost"
              size="icon-sm"
              aria-label="Nova conversa"
              onClick={newChat}
            >
              <MessageSquarePlus size={16} />
            </ButtonFluid>
          </TooltipFluid>
          <TooltipFluid content="Trocar tema">
            <span className="inline-flex">
              <ThemeToggleEffect variant="circle" />
            </span>
          </TooltipFluid>
          <ThemeSwitcher />
        </div>
      </header>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
        {messages.map((m) =>
          m.from === "user" ? (
            <ChatMessageFluid
              key={m.id}
              from="user"
              time={m.time}
              files={m.withFile && attachment ? [attachment] : undefined}
            >
              {m.text}
            </ChatMessageFluid>
          ) : (
            <ChatMessageFluid
              key={m.id}
              from="assistant"
              actions={
                <>
                  <ButtonFluid variant="ghost" size="icon-sm" aria-label="Copiar">
                    <Copy />
                  </ButtonFluid>
                  <ButtonFluid
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Regenerar"
                  >
                    <RefreshCw />
                  </ButtonFluid>
                </>
              }
            >
              {m.text}
            </ChatMessageFluid>
          )
        )}

        {/* Thinking state: reasoning steps + live indicator */}
        {thinking && (
          <div className="flex w-full max-w-[80%] flex-col gap-2 self-start">
            <ThinkingStepsFluid defaultOpen>
              <ThinkingStepsHeaderFluid>Pensando</ThinkingStepsHeaderFluid>
              <ThinkingStepsContentFluid>
                <ThinkingStepFluid
                  index={0}
                  icon="search"
                  label="Lendo o anexo enviado"
                  description="Extraindo hierarquia visual e contraste."
                  status="complete"
                />
                <ThinkingStepFluid
                  index={1}
                  icon="globe"
                  label="Consultando diretrizes WCAG"
                  status="complete"
                >
                  <ThinkingStepSourcesFluid>
                    <ThinkingStepSourceFluid color="blue">
                      w3.org/WCAG
                    </ThinkingStepSourceFluid>
                    <ThinkingStepSourceFluid color="green">
                      mdn.dev
                    </ThinkingStepSourceFluid>
                  </ThinkingStepSourcesFluid>
                </ThinkingStepFluid>
                <ThinkingStepFluid
                  index={2}
                  icon="check"
                  label="Montando recomendações"
                  status="active"
                  isLast
                >
                  <ThinkingStepDetailsFluid
                    summary="Ver raciocínio"
                    details={[
                      "Priorizou contraste e foco visível.",
                      "Verificou ordem de tabulação.",
                    ]}
                  />
                </ThinkingStepFluid>
              </ThinkingStepsContentFluid>
            </ThinkingStepsFluid>
            <div className="flex items-center gap-2 pl-1 text-[13px] text-muted-foreground">
              <ThinkingIndicatorFluid />
              <span>Gerando resposta…</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Action dock ────────────────────────────────────────────────── */}
      <div className="flex shrink-0 justify-center pb-1 pt-2">
        <GlassDock
          items={[
            { title: "Nova conversa", icon: MessageSquarePlus, onClick: newChat },
            {
              title: thinking ? "Parar geração" : "Gerar resposta",
              icon: Sparkles,
              onClick: () => setThinking((t) => !t),
            },
            {
              title: "Limpar conversa",
              icon: Trash2,
              onClick: () => {
                setMessages([])
                setThinking(false)
              },
            },
            { title: "Configurações", icon: Settings },
          ]}
        />
      </div>

      {/* ── Composer ───────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <InputMessageFluid
          value={value}
          onValueChange={setValue}
          files={files}
          onFilesChange={setFiles}
          placeholder="Escreva uma mensagem…"
          onSend={handleSend}
          leftSlot={({ openFilePicker }) => (
            <TooltipFluid content="Anexar arquivo">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Anexar"
                onClick={() => openFilePicker()}
              >
                <Paperclip size={16} />
              </ButtonFluid>
            </TooltipFluid>
          )}
        />
        {attachment && files.length === 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Anexo recente:
            </span>
            <FileThumbnailFluid file={attachment} size={40} />
          </div>
        )}
      </div>
    </div>
  )
}
