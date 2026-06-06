import { useEffect, useState } from "react"
import {
  Paperclip,
  Phone,
  Video,
  Search,
  MoreVertical,
  Copy,
  RefreshCw,
} from "lucide-react"

import { ButtonFluid } from "@/components/ui/button-fluid"
import { BadgeFluid } from "@/components/ui/badge-fluid"
import { ChatMessageFluid } from "@/components/ui/index"
import { FileThumbnailFluid } from "@/components/ui/file-thumbnail-fluid"
import { InputMessageFluid } from "@/components/ui/input-message-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                              attachment helper                              */
/* -------------------------------------------------------------------------- */

/**
 * Generates a small in-memory PNG `File` so attachment thumbnails have real
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
      grad.addColorStop(0, "#0ea5e9")
      grad.addColorStop(1, "#8b5cf6")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 240, 240)
      ctx.fillStyle = "rgba(255,255,255,0.92)"
      ctx.font = "bold 110px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("IMG", 120, 132)
    }
    canvas.toBlob((blob) => {
      if (blob) setFile(new File([blob], "anexo.png", { type: "image/png" }))
    }, "image/png")
  }, [])
  return file
}

/* -------------------------------------------------------------------------- */
/*                                  types                                      */
/* -------------------------------------------------------------------------- */

type Msg = {
  id: number
  from: "user" | "assistant"
  text: string
  time?: string
  withFile?: boolean
}

type Conversation = {
  id: string
  name: string
  seed: string
  preview: string
  time: string
}

/* -------------------------------------------------------------------------- */
/*                                 mock data                                   */
/* -------------------------------------------------------------------------- */

const CONVERSATIONS: Conversation[] = [
  {
    id: "ana",
    name: "Ana Marques",
    seed: "ana-marques",
    preview: "Perfeito, mando o contrato revisado ainda hoje 👍",
    time: "14:32",
  },
  {
    id: "bruno",
    name: "Bruno Tavares",
    seed: "bruno-tavares",
    preview: "Subi o deploy de staging, dá uma olhada quando puder",
    time: "13:58",
  },
  {
    id: "carla",
    name: "Carla Nóbrega",
    seed: "carla-nobrega",
    preview: "Anexei o mockup da nova home, o que achou?",
    time: "12:10",
  },
  {
    id: "diego",
    name: "Diego Lemos",
    seed: "diego-lemos",
    preview: "Reunião confirmada pra amanhã às 10h então",
    time: "Ontem",
  },
  {
    id: "elaine",
    name: "Elaine Souza",
    seed: "elaine-souza",
    preview: "Valeu pela ajuda com o relatório, salvou meu dia!",
    time: "Ontem",
  },
  {
    id: "felipe",
    name: "Felipe Ramos",
    seed: "felipe-ramos",
    preview: "Bora marcar aquele café pra alinhar o roadmap?",
    time: "Seg",
  },
]

const INITIAL_HISTORIES: Record<string, Msg[]> = {
  ana: [
    {
      id: 1,
      from: "assistant",
      text: "Oi! Consegui revisar a proposta comercial que você mandou.",
    },
    {
      id: 2,
      from: "user",
      text: "Boa! Tem algum ajuste que você sugere antes de fechar?",
      time: "Hoje 14:28",
    },
    {
      id: 3,
      from: "assistant",
      text: "Só a cláusula de SLA — sugiro deixar 99,9% em vez de 99,5%. O resto está ótimo.",
    },
    {
      id: 4,
      from: "user",
      text: "Faz sentido. Perfeito, mando o contrato revisado ainda hoje 👍",
      time: "Hoje 14:32",
    },
  ],
  bruno: [
    {
      id: 1,
      from: "assistant",
      text: "Subi o deploy de staging, dá uma olhada quando puder.",
    },
    {
      id: 2,
      from: "user",
      text: "Show, o build passou no CI?",
      time: "Hoje 13:55",
    },
    {
      id: 3,
      from: "assistant",
      text: "Passou tudo verde — testes e lint zerados. Só falta o seu OK pra promover pra produção.",
    },
  ],
  carla: [
    {
      id: 1,
      from: "assistant",
      text: "Anexei o mockup da nova home, o que achou?",
      withFile: true,
    },
    {
      id: 2,
      from: "user",
      text: "Curti bastante o hero! Só acho o contraste do CTA meio baixo no modo claro.",
      time: "Hoje 12:08",
    },
    {
      id: 3,
      from: "assistant",
      text: "Boa observação, vou escurecer o botão e mando a v2 já já.",
    },
  ],
  diego: [
    {
      id: 1,
      from: "user",
      text: "Conseguimos encaixar a call de planning amanhã?",
      time: "Ontem 17:40",
    },
    {
      id: 2,
      from: "assistant",
      text: "Consigo sim. Reunião confirmada pra amanhã às 10h então.",
    },
  ],
  elaine: [
    {
      id: 1,
      from: "assistant",
      text: "Terminei o relatório trimestral com os números que você pediu.",
    },
    {
      id: 2,
      from: "user",
      text: "Valeu pela ajuda com o relatório, salvou meu dia!",
      time: "Ontem 16:02",
    },
  ],
  felipe: [
    {
      id: 1,
      from: "assistant",
      text: "Bora marcar aquele café pra alinhar o roadmap?",
    },
    {
      id: 2,
      from: "user",
      text: "Bora! Quinta de manhã funciona pra você?",
      time: "Seg 09:15",
    },
  ],
}

const INITIAL_UNREAD: Record<string, number> = {
  ana: 0,
  bruno: 3,
  carla: 1,
  diego: 0,
  elaine: 5,
  felipe: 2,
}

function avatarUrl(seed: string, size = 80) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}

/* -------------------------------------------------------------------------- */
/*                              ConversationItem                               */
/* -------------------------------------------------------------------------- */

type ConversationItemProps = {
  conversation: Conversation
  active: boolean
  unread: number
  onSelect: () => void
}

function ConversationItem({
  conversation,
  active,
  unread,
  onSelect,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-active={active ? "true" : undefined}
      aria-current={active ? "true" : undefined}
      aria-label={`Abrir conversa com ${conversation.name}`}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-border bg-accent"
          : "border-transparent hover:bg-accent/60"
      )}
    >
      <img
        src={avatarUrl(conversation.seed)}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {conversation.name}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {conversation.time}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-[13px] text-muted-foreground">
            {conversation.preview}
          </span>
          {unread > 0 && (
            <BadgeFluid
              color="blue"
              size="sm"
              className="shrink-0 justify-center tabular-nums"
              aria-label={`${unread} mensagens não lidas`}
            >
              {unread}
            </BadgeFluid>
          )}
        </div>
      </div>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*                                ChatInboxPro                                 */
/* -------------------------------------------------------------------------- */

export function ChatInboxPro() {
  const attachment = useGeneratedImageFile()
  const [selectedId, setSelectedId] = useState<string>("ana")
  const [histories, setHistories] =
    useState<Record<string, Msg[]>>(INITIAL_HISTORIES)
  const [unread, setUnread] = useState<Record<string, number>>(INITIAL_UNREAD)
  const [value, setValue] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const selected =
    CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0]
  const messages = histories[selectedId] ?? []

  function selectConversation(id: string) {
    setSelectedId(id)
    setValue("")
    setFiles([])
    setUnread((prev) => (prev[id] ? { ...prev, [id]: 0 } : prev))
  }

  function handleSend(text: string, sentFiles: File[]) {
    const trimmed = text.trim()
    if (!trimmed && sentFiles.length === 0) return
    setHistories((prev) => {
      const thread = prev[selectedId] ?? []
      const nextId = thread.length
        ? Math.max(...thread.map((m) => m.id)) + 1
        : 1
      const msg: Msg = {
        id: nextId,
        from: "user",
        text: trimmed || "(anexo enviado)",
        time: "Agora",
        withFile: sentFiles.length > 0,
      }
      return { ...prev, [selectedId]: [...thread, msg] }
    })
    setValue("")
    setFiles([])
  }

  return (
    <div className="flex h-[78vh] overflow-hidden bg-card text-card-foreground">
      {/* ── Conversation list ──────────────────────────────────────────── */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-border">
        <header className="flex h-[3.75rem] shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Mensagens</h2>
          <TooltipFluid content="Buscar conversas">
            <ButtonFluid variant="ghost" size="icon-sm" aria-label="Buscar">
              <Search size={16} />
            </ButtonFluid>
          </TooltipFluid>
        </header>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {CONVERSATIONS.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === selectedId}
              unread={unread[c.id] ?? 0}
              onSelect={() => selectConversation(c.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── Thread ─────────────────────────────────────────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Thread header */}
        <header className="flex h-[3.75rem] shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={avatarUrl(selected.seed)}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full object-cover"
            />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">
                {selected.name}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500" />
                Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipFluid content="Ligar">
              <ButtonFluid variant="ghost" size="icon-sm" aria-label="Ligar">
                <Phone size={16} />
              </ButtonFluid>
            </TooltipFluid>
            <TooltipFluid content="Chamada de vídeo">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Chamada de vídeo"
              >
                <Video size={16} />
              </ButtonFluid>
            </TooltipFluid>
            <TooltipFluid content="Mais ações">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Mais ações"
              >
                <MoreVertical size={16} />
              </ButtonFluid>
            </TooltipFluid>
          </div>
        </header>

        {/* Messages */}
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
                files={m.withFile && attachment ? [attachment] : undefined}
                actions={
                  <>
                    <ButtonFluid
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copiar"
                    >
                      <Copy />
                    </ButtonFluid>
                    <ButtonFluid
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Responder de novo"
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
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-border px-4 py-3">
          <InputMessageFluid
            value={value}
            onValueChange={setValue}
            files={files}
            onFilesChange={setFiles}
            placeholder={`Mensagem para ${selected.name}…`}
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
      </section>
    </div>
  )
}
