/**
 * Composição "Chat / Inbox Completo" (chat-inbox-pro).
 *
 * Inbox de mensagens estilo cliente de chat (estilo Telegram/iMessage/Linear
 * inbox) com 2 colunas principais:
 *  - Lista de conversas: busca (input controlado), abas de filtro (Todas /
 *    Não lidas / Favoritas via TabsSubtleFluid), item com avatar (picsum),
 *    pin, favorito, presença (online/ausente), prévia, ticks, badge de
 *    não-lidas. Conversas fixadas no topo.
 *  - Thread: header com avatar, nome, indicador de presença e subtítulo
 *    dinâmico ("Ativo agora" / "Visto há X" / "Digitando…"), ações em
 *    DropdownFluid (Fixar, Favoritar, Marcar como não lida, Silenciar,
 *    Limpar conversa). Separadores de data, agrupamento de mensagens
 *    consecutivas do mesmo autor, auto-scroll pro fim, avatares no
 *    assistant e resposta simulada com ThinkingIndicatorFluid.
 *
 * Composer (InputMessageFluid) é mantido. Quick replies, painel de detalhes
 * e responsividade <lg ficam para FASE 2.
 */
import { useEffect, useRef, useState } from "react"
import {
  BellOff,
  Check,
  CheckCheck,
  MoreVertical,
  Paperclip,
  Phone,
  Pin,
  PinOff,
  Search,
  Star,
  Trash2,
  Video,
  X,
  Mail,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { BadgeFluid } from "@/components/ui/badge-fluid"
import { ButtonFluid } from "@/components/ui/button-fluid"
import { ChatMessageFluid } from "@/components/ui/index"
import { FileThumbnailFluid } from "@/components/ui/file-thumbnail-fluid"
import { InputMessageFluid } from "@/components/ui/input-message-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import {
  TabsSubtleFluid,
  TabsSubtleFluidItem,
} from "@/components/ui/tabs-subtle-fluid"
import {
  DropdownFluid,
  DropdownFluidLabel,
  DropdownFluidSeparator,
} from "@/components/ui/dropdown-fluid"
import { MenuItemFluid } from "@/components/ui/menu-item-fluid"
import { ThinkingIndicatorFluid } from "@/components/ui/thinking-indicator-fluid"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { springs } from "@/lib/springs"

/* -------------------------------------------------------------------------- */
/*                              attachment helper                              */
/* -------------------------------------------------------------------------- */

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

type Role = "user" | "assistant"
type Presence = "online" | "away" | "offline"
type Ticks = "sent" | "delivered" | "read"

type Msg = {
  id: number
  from: Role
  text: string
  time?: string
  withFile?: boolean
  date: number
  ticks?: Ticks
}

type Conversation = {
  id: string
  name: string
  seed: string
  preview: string
  time: string
  presence: Presence
  pinned: boolean
  favorite: boolean
  lastSeenMin: number
}

type FilterTab = "all" | "unread" | "favorites"

const NOW_MS = Date.now()
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const TODAY_9AM = new Date(NOW_MS - 9 * HOUR).setHours(9, 0, 0, 0)
const TODAY_14_30 = new Date(NOW_MS - 30 * 60 * 1000).setHours(14, 30, 0, 0)
const YESTERDAY_17_40 = TODAY_9AM - 24 * HOUR
const YESTERDAY_16_02 = YESTERDAY_17_40 - 90 * 60 * 1000
const TWO_DAYS_AGO_09_15 = YESTERDAY_17_40 - 24 * HOUR
const THREE_DAYS_AGO_09_15 = TWO_DAYS_AGO_09_15 - 24 * HOUR

const CONVERSATIONS: Conversation[] = [
  { id: "ana", name: "Ana Marques", seed: "ana-marques", preview: "Perfeito, mando o contrato revisado ainda hoje 👍", time: "14:32", presence: "online", pinned: true, favorite: true, lastSeenMin: 0 },
  { id: "bruno", name: "Bruno Tavares", seed: "bruno-tavares", preview: "Subi o deploy de staging, dá uma olhada quando puder", time: "13:58", presence: "online", pinned: true, favorite: false, lastSeenMin: 2 },
  { id: "carla", name: "Carla Nóbrega", seed: "carla-nobrega", preview: "Anexei o mockup da nova home, o que achou?", time: "12:10", presence: "away", pinned: false, favorite: true, lastSeenMin: 18 },
  { id: "diego", name: "Diego Lemos", seed: "diego-lemos", preview: "Reunião confirmada pra amanhã às 10h então", time: "Ontem", presence: "offline", pinned: false, favorite: false, lastSeenMin: 60 * 18 },
  { id: "elaine", name: "Elaine Souza", seed: "elaine-souza", preview: "Valeu pela ajuda com o relatório, salvou meu dia!", time: "Ontem", presence: "offline", pinned: false, favorite: false, lastSeenMin: 60 * 22 },
  { id: "felipe", name: "Felipe Ramos", seed: "felipe-ramos", preview: "Bora marcar aquele café pra alinhar o roadmap?", time: "Seg", presence: "online", pinned: false, favorite: true, lastSeenMin: 4 },
]

const INITIAL_HISTORIES: Record<string, Msg[]> = {
  ana: [
    { id: 1, from: "assistant", text: "Oi! Consegui revisar a proposta comercial que você mandou.", date: TODAY_9AM },
    { id: 2, from: "user", text: "Boa! Tem algum ajuste que você sugere antes de fechar?", time: "Hoje 14:28", date: TODAY_9AM, ticks: "read" },
    { id: 3, from: "assistant", text: "Só a cláusula de SLA — sugiro deixar 99,9% em vez de 99,5%. O resto está ótimo.", date: TODAY_9AM },
    { id: 4, from: "user", text: "Faz sentido. Perfeito, mando o contrato revisado ainda hoje 👍", time: "Hoje 14:32", date: TODAY_14_30, ticks: "delivered" },
  ],
  bruno: [
    { id: 1, from: "assistant", text: "Subi o deploy de staging, dá uma olhada quando puder.", date: TODAY_9AM },
    { id: 2, from: "user", text: "Show, o build passou no CI?", time: "Hoje 13:55", date: TODAY_9AM, ticks: "read" },
    { id: 3, from: "assistant", text: "Passou tudo verde — testes e lint zerados. Só falta o seu OK pra promover pra produção.", date: TODAY_9AM },
  ],
  carla: [
    { id: 1, from: "assistant", text: "Anexei o mockup da nova home, o que achou?", withFile: true, date: THREE_DAYS_AGO_09_15 },
    { id: 2, from: "user", text: "Curti bastante o hero! Só acho o contraste do CTA meio baixo no modo claro.", time: "Hoje 12:08", date: THREE_DAYS_AGO_09_15, ticks: "read" },
    { id: 3, from: "assistant", text: "Boa observação, vou escurecer o botão e mando a v2 já já.", date: THREE_DAYS_AGO_09_15 },
  ],
  diego: [
    { id: 1, from: "user", text: "Conseguimos encaixar a call de planning amanhã?", time: "Ontem 17:40", date: YESTERDAY_16_02, ticks: "read" },
    { id: 2, from: "assistant", text: "Consigo sim. Reunião confirmada pra amanhã às 10h então.", date: YESTERDAY_17_40 },
  ],
  elaine: [
    { id: 1, from: "assistant", text: "Terminei o relatório trimestral com os números que você pediu.", date: YESTERDAY_16_02 },
    { id: 2, from: "user", text: "Valeu pela ajuda com o relatório, salvou meu dia!", time: "Ontem 16:02", date: YESTERDAY_16_02, ticks: "read" },
  ],
  felipe: [
    { id: 1, from: "assistant", text: "Bora marcar aquele café pra alinhar o roadmap?", date: TWO_DAYS_AGO_09_15 },
    { id: 2, from: "user", text: "Bora! Quinta de manhã funciona pra você?", time: "Seg 09:15", date: TWO_DAYS_AGO_09_15, ticks: "read" },
  ],
}

const INITIAL_UNREAD: Record<string, number> = {
  ana: 0, bruno: 3, carla: 1, diego: 0, elaine: 5, felipe: 2,
}

const AUTO_REPLIES: Record<string, string> = {
  ana: "Combinado! Qualquer coisa me chama no chat. 🚀",
  bruno: "Beleza, fico no aguardo do seu OK no PR.",
  carla: "Anotado! Vou subir a v2 ainda hoje.",
  diego: "Perfeito, confirmadíssimo então.",
  elaine: "Obrigado pelo feedback! Sucesso aí nas próximas entregas.",
  felipe: "Quinta de manhã tá ótimo pra mim, valeu!",
}

const SIMULATED_REPLY_MS = 1100

function avatarUrl(seed: string, size = 80) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

function dayLabel(date: number): string {
  const d = new Date(date)
  const today = new Date()
  const startOfDay = (dt: Date) =>
    new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
  const diff = startOfDay(today) - startOfDay(d)
  if (diff === 0) return "Hoje"
  if (diff === DAY) return "Ontem"
  if (diff < 7 * DAY) {
    return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d)
  }
  return DATE_FMT.format(d)
}

function isSameDay(a: number, b: number) {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="my-1 flex items-center justify-center gap-3"
    >
      <span className="h-px flex-1 bg-border" />
      <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

const PRESENCE_COLOR: Record<Presence, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground/40",
}

const PRESENCE_LABEL: Record<Presence, string> = {
  online: "Online",
  away: "Ausente",
  offline: "Offline",
}

type ConversationItemProps = {
  conversation: Conversation
  active: boolean
  unread: number
  previewTicks?: Ticks
  onSelect: () => void
}

function ConversationItem({ conversation, active, unread, previewTicks, onSelect }: ConversationItemProps) {
  const presenceColor = PRESENCE_COLOR[conversation.presence]
  return (
    <button
      type="button"
      onClick={onSelect}
      data-conversation-id={conversation.id}
      data-active={active ? "true" : undefined}
      aria-current={active ? "true" : undefined}
      aria-label={`Abrir conversa com ${conversation.name}, ${PRESENCE_LABEL[conversation.presence]}${unread > 0 ? `, ${unread} não lidas` : ""}${conversation.pinned ? ", fixada" : ""}${conversation.favorite ? ", favorita" : ""}`}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        active ? "border-border bg-accent" : "border-transparent hover:bg-accent/60"
      )}
    >
      <span className="relative inline-flex shrink-0">
        <img src={avatarUrl(conversation.seed)} alt="" width={40} height={40} loading="lazy" className="size-10 rounded-full object-cover" />
        <span aria-hidden className={cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card", presenceColor)} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            {conversation.pinned && <Pin size={11} strokeWidth={2.4} className="shrink-0 text-muted-foreground" aria-label="Fixada" />}
            <span className="truncate text-sm font-semibold text-foreground">{conversation.name}</span>
            {conversation.favorite && <Star size={11} strokeWidth={0} fill="currentColor" className="shrink-0 text-amber-500" aria-label="Favorita" />}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{conversation.time}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 truncate text-[13px] text-muted-foreground">
            {previewTicks && <TicksIcon state={previewTicks} className="shrink-0 text-muted-foreground" />}
            <span className="truncate">{conversation.preview}</span>
          </span>
          {unread > 0 ? (
            <BadgeFluid color="blue" size="sm" className="shrink-0 justify-center tabular-nums" aria-label={`${unread} mensagens não lidas`}>
              {unread}
            </BadgeFluid>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function TicksIcon({ state, className }: { state: Ticks; className?: string }) {
  if (state === "read") {
    return <CheckCheck size={13} strokeWidth={2.2} className={cn(className, "text-sky-500")} aria-label="Lida" />
  }
  if (state === "delivered") {
    return <CheckCheck size={13} strokeWidth={2} className={className} aria-label="Entregue" />
  }
  return <Check size={13} strokeWidth={2} className={className} aria-label="Enviada" />
}

function presenceSubtitle(presence: Presence, isTyping: boolean, lastSeenMin: number): string {
  if (isTyping) return "Digitando…"
  if (presence === "online") return "Ativo agora"
  if (presence === "away") return "Ausente"
  if (lastSeenMin < 60) return `Visto há ${lastSeenMin} min`
  const hours = Math.floor(lastSeenMin / 60)
  if (hours < 24) return `Visto há ${hours} h`
  const days = Math.floor(hours / 24)
  return `Visto há ${days} ${days === 1 ? "dia" : "dias"}`
}

export function ChatInboxPro() {
  const attachment = useGeneratedImageFile()
  const [selectedId, setSelectedId] = useState<string>("ana")
  const [histories, setHistories] = useState<Record<string, Msg[]>>(INITIAL_HISTORIES)
  const [unread, setUnread] = useState<Record<string, number>>(INITIAL_UNREAD)
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS)
  const [value, setValue] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<FilterTab>("all")
  const [thinkingId, setThinkingId] = useState<string | null>(null)
  const [muted, setMuted] = useState<Record<string, boolean>>({})

  const scrollRef = useRef<HTMLDivElement>(null)
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current)
    }
  }, [])

  const sortedConversations = sortConversations(conversations)
  const visibleConversations = filterConversations(sortedConversations, tab, query, unread)
  const previewTicks = derivePreviewTicks(histories)

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0]
  const messages = histories[selectedId] ?? []
  const isTypingHere = thinkingId === selectedId
  const selectedPresence = PRESENCE_COLOR[selected.presence]
  const subtitle = presenceSubtitle(selected.presence, isTypingHere, selected.lastSeenMin)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [selectedId, messages.length, isTypingHere])

  function selectConversation(id: string) {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current)
      thinkingTimerRef.current = null
    }
    setThinkingId(null)
    setSelectedId(id)
    setValue("")
    setFiles([])
    setUnread((prev) => (prev[id] ? { ...prev, [id]: 0 } : prev))
  }

  function handleSend(text: string, sentFiles: File[]) {
    const trimmed = text.trim()
    if (!trimmed && sentFiles.length === 0) return
    const targetId = selectedId

    setHistories((prev) => {
      const thread = prev[targetId] ?? []
      const nextId = thread.length ? Math.max(...thread.map((m) => m.id)) + 1 : 1
      const msg: Msg = {
        id: nextId,
        from: "user",
        text: trimmed || "(anexo enviado)",
        time: "Agora",
        withFile: sentFiles.length > 0,
        date: Date.now(),
        ticks: "sent",
      }
      return { ...prev, [targetId]: [...thread, msg] }
    })
    setValue("")
    setFiles([])

    const deliveredTimer = setTimeout(() => {
      setHistories((prev) => bumpLastUserTicks(prev, targetId, "delivered"))
    }, 600)
    const readTimer = setTimeout(() => {
      setHistories((prev) => bumpLastUserTicks(prev, targetId, "read"))
    }, SIMULATED_REPLY_MS - 80)

    if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current)
    setThinkingId(targetId)
    thinkingTimerRef.current = setTimeout(() => {
      setHistories((prev) => {
        const thread = prev[targetId] ?? []
        const nextId = thread.length ? Math.max(...thread.map((m) => m.id)) + 1 : 1
        const reply: Msg = {
          id: nextId,
          from: "assistant",
          text: AUTO_REPLIES[targetId] ?? "Beleza, anotado! Qualquer coisa me chama de volta.",
          date: Date.now(),
        }
        return { ...prev, [targetId]: [...thread, reply] }
      })
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, preview: trimmed || "Anexo enviado", time: "Agora", lastSeenMin: 0, presence: c.presence === "offline" ? "online" : c.presence }
            : c
        )
      )
      setThinkingId(null)
      thinkingTimerRef.current = null
    }, SIMULATED_REPLY_MS)
    const prevTimer = thinkingTimerRef.current
    thinkingTimerRef.current = setTimeout(
      () => {
        clearTimeout(deliveredTimer)
        clearTimeout(readTimer)
        if (typeof prevTimer === "number") clearTimeout(prevTimer)
      },
      SIMULATED_REPLY_MS + 100
    )
  }

  function togglePin(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)))
  }

  function toggleFavorite(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)))
  }

  function markAsUnread(id: string) {
    setUnread((prev) => ({ ...prev, [id]: prev[id] && prev[id] > 0 ? prev[id] : 1 }))
  }

  function toggleMute(id: string) {
    setMuted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function clearConversation(id: string) {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current)
      thinkingTimerRef.current = null
    }
    if (thinkingId === id) setThinkingId(null)
    setHistories((prev) => ({ ...prev, [id]: [] }))
  }

  const renderedItems = buildRenderedItems(messages)

  return (
    <div
      data-layout="chat-inbox-pro"
      className="flex h-[78vh] w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <aside className="flex w-80 shrink-0 flex-col border-r border-border">
        <header className="flex h-[3.75rem] shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Mensagens</h2>
          <span className="text-[11px] text-muted-foreground">
            {visibleConversations.length} de {conversations.length}
          </span>
        </header>
        <div className="shrink-0 px-3 pt-3">
          <SearchInput value={query} onChange={setQuery} />
        </div>
        <div className="shrink-0 px-3 pt-2">
          <TabsSubtleFluid selectedIndex={tabToIndex(tab)} onSelect={(i) => setTab(indexToTab(i))} activeLabel className="w-full">
            <TabsSubtleFluidItem icon={InboxAllIcon} label={`Todas (${conversations.length})`} index={0} />
            <TabsSubtleFluidItem icon={InboxUnreadIcon} label={`Não lidas (${totalUnread(unread)})`} index={1} />
            <TabsSubtleFluidItem icon={Star} label={`Favoritas (${countFavorites(conversations)})`} index={2} />
          </TabsSubtleFluid>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {visibleConversations.length > 0 ? (
            visibleConversations.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                active={c.id === selectedId}
                unread={unread[c.id] ?? 0}
                previewTicks={previewTicks[c.id]}
                onSelect={() => selectConversation(c.id)}
              />
            ))
          ) : (
            <EmptyListState
              hasQuery={query.trim().length > 0}
              tab={tab}
              onClearQuery={() => setQuery("")}
              onClearTab={() => setTab("all")}
            />
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[3.75rem] shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative inline-flex shrink-0">
              <img src={avatarUrl(selected.seed)} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
              <span aria-hidden className={cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card", selectedPresence)} />
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">{selected.name}</span>
              <span className={cn("flex items-center gap-1.5 text-[11px] transition-colors", isTypingHere ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground")} aria-live="polite">
                {isTypingHere ? (
                  <>
                    <motion.span aria-hidden className="size-1.5 rounded-full bg-sky-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    {subtitle}
                  </>
                ) : (
                  <>
                    <span aria-hidden className={cn("size-1.5 rounded-full", selectedPresence)} />
                    {subtitle}
                  </>
                )}
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
              <ButtonFluid variant="ghost" size="icon-sm" aria-label="Chamada de vídeo">
                <Video size={16} />
              </ButtonFluid>
            </TooltipFluid>
            <ThreadActions
              conversation={selected}
              muted={!!muted[selected.id]}
              onTogglePin={() => togglePin(selected.id)}
              onMarkUnread={() => markAsUnread(selected.id)}
              onToggleMute={() => toggleMute(selected.id)}
              onClear={() => clearConversation(selected.id)}
              onToggleFavorite={() => toggleFavorite(selected.id)}
            />
          </div>
        </header>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
          {renderedItems.length > 0 ? (
            renderedItems.map((item) => {
              if (item.kind === "day") {
                return <DateSeparator key={item.key} label={item.label} />
              }
              const m = item.m
              const isUser = m.from === "user"
              const showAssistantAvatar = !isUser && item.groupLast
              return (
                <div key={m.id} className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
                  <div className={cn("flex max-w-[80%] items-end gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
                    {!isUser && (
                      <span aria-hidden className={cn("size-7 shrink-0 self-end transition-opacity", showAssistantAvatar ? "opacity-100" : "invisible")}>
                        <img src={avatarUrl(selected.seed, 80)} alt="" width={28} height={28} loading="lazy" className="size-7 rounded-full object-cover" />
                      </span>
                    )}
                    <ChatMessageFluid
                      from={m.from}
                      time={m.time}
                      files={m.withFile && attachment ? [attachment] : undefined}
                      actions={
                        isUser
                          ? m.ticks ? <TicksIcon state={m.ticks} className={m.ticks === "read" ? "text-sky-500" : "text-muted-foreground"} /> : undefined
                          : (
                            <>
                              <ButtonFluid variant="ghost" size="icon-sm" aria-label="Copiar"><Check size={16} /></ButtonFluid>
                              <ButtonFluid variant="ghost" size="icon-sm" aria-label="Regenerar"><X size={16} /></ButtonFluid>
                            </>
                          )
                      }
                    >
                      {m.text}
                    </ChatMessageFluid>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="m-auto flex max-w-sm flex-col items-center gap-3 text-center">
              <p className="text-sm font-semibold text-foreground">Conversa vazia</p>
              <p className="text-[13px] text-muted-foreground">Mande uma mensagem pra {selected.name} ou use o menu acima para limpar.</p>
            </div>
          )}

          <AnimatePresence>
            {isTypingHere && (
              <motion.div
                key="thinking"
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={springs.fast}
                className="flex w-full max-w-[80%] items-end gap-2 self-start"
              >
                <span aria-hidden className="size-7 shrink-0 self-end">
                  <img src={avatarUrl(selected.seed, 80)} alt="" width={28} height={28} loading="lazy" className="size-7 rounded-full object-cover" />
                </span>
                <ChatMessageFluid from="assistant">
                  <ThinkingIndicatorFluid />
                </ChatMessageFluid>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                <ButtonFluid variant="ghost" size="icon-sm" aria-label="Anexar" onClick={() => openFilePicker()}>
                  <Paperclip size={16} />
                </ButtonFluid>
              </TooltipFluid>
            )}
          />
          {attachment && files.length === 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Anexo recente:</span>
              <FileThumbnailFluid file={attachment} size={40} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ThreadActions({ conversation, muted, onTogglePin, onMarkUnread, onToggleMute, onClear, onToggleFavorite }: {
  conversation: Conversation
  muted: boolean
  onTogglePin: () => void
  onMarkUnread: () => void
  onToggleMute: () => void
  onClear: () => void
  onToggleFavorite: () => void
}) {
  return (
    <Popover>
      <TooltipFluid content="Mais ações">
        <PopoverTrigger asChild>
          <ButtonFluid variant="ghost" size="icon-sm" aria-label="Mais ações">
            <MoreVertical size={16} />
          </ButtonFluid>
        </PopoverTrigger>
      </TooltipFluid>
      <PopoverContent align="end" sideOffset={6} className="p-0">
        <DropdownFluid data-slot="thread-actions">
          <DropdownFluidLabel>Conversa com {conversation.name}</DropdownFluidLabel>
          <DropdownFluidSeparator />
          <MenuItemFluid index={0} icon={conversation.pinned ? PinOff : Pin} label={conversation.pinned ? "Desafixar" : "Fixar"} onSelect={() => onTogglePin()} />
          <MenuItemFluid index={1} icon={Star} label={conversation.favorite ? "Remover dos favoritos" : "Favoritar"} onSelect={() => onToggleFavorite()} />
          <MenuItemFluid index={2} icon={Mail} label="Marcar como não lida" onSelect={() => onMarkUnread()} />
          <MenuItemFluid index={3} icon={BellOff} label={muted ? "Reativar notificações" : "Silenciar"} onSelect={() => onToggleMute()} />
          <DropdownFluidSeparator />
          <MenuItemFluid index={4} icon={Trash2} label="Limpar conversa" onSelect={() => onClear()} />
        </DropdownFluid>
      </PopoverContent>
    </Popover>
  )
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar conversas…"
        aria-label="Buscar conversas"
        className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-8 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground/20"
      />
      {value.length > 0 && (
        <button type="button" onClick={() => onChange("")} aria-label="Limpar busca" className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <X size={13} strokeWidth={2.4} />
        </button>
      )}
    </div>
  )
}

function EmptyListState({ hasQuery, tab, onClearQuery, onClearTab }: { hasQuery: boolean; tab: FilterTab; onClearQuery: () => void; onClearTab: () => void }) {
  let title: string
  let body: string
  if (hasQuery) {
    title = "Nenhum resultado"
    body = "Nada combina com sua busca nessa aba. Tente outro termo."
  } else if (tab === "unread") {
    title = "Tudo em dia ✨"
    body = "Você não tem mensagens não lidas no momento."
  } else {
    title = "Sem favoritas"
    body = "Marque conversas com a estrela para vê-las aqui."
  }
  return (
    <div role="status" className="m-auto flex max-w-xs flex-col items-center gap-3 px-4 py-10 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Search size={16} />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[12.5px] leading-snug text-muted-foreground">{body}</p>
      </div>
      {(hasQuery || tab !== "all") && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {hasQuery && <ButtonFluid variant="secondary" size="sm" onClick={onClearQuery}>Limpar busca</ButtonFluid>}
          {tab !== "all" && <ButtonFluid variant="tertiary" size="sm" onClick={onClearTab}>Ver todas</ButtonFluid>}
        </div>
      )}
    </div>
  )
}

function InboxAllIcon({ size = 16, strokeWidth = 1.5, className }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  )
}

function InboxUnreadIcon({ size = 16, strokeWidth = 1.5, className }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="19" cy="6" r="3" fill="currentColor" stroke="none" />
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  )
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return 0
  })
}

function totalUnread(unread: Record<string, number>): number {
  return Object.values(unread).reduce((acc, n) => acc + (n > 0 ? n : 0), 0)
}

function countFavorites(list: Conversation[]): number {
  return list.filter((c) => c.favorite).length
}

function tabToIndex(tab: FilterTab): number {
  if (tab === "all") return 0
  if (tab === "unread") return 1
  return 2
}

function indexToTab(index: number): FilterTab {
  if (index === 1) return "unread"
  if (index === 2) return "favorites"
  return "all"
}

function filterConversations(list: Conversation[], tab: FilterTab, query: string, unread: Record<string, number>): Conversation[] {
  const q = query.trim().toLowerCase()
  return list.filter((c) => {
    if (tab === "unread" && (unread[c.id] ?? 0) <= 0) return false
    if (tab === "favorites" && !c.favorite) return false
    if (q.length > 0) {
      const hay = `${c.name} ${c.preview}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

function derivePreviewTicks(histories: Record<string, Msg[]>): Record<string, Ticks | undefined> {
  const out: Record<string, Ticks | undefined> = {}
  for (const id in histories) {
    const thread = histories[id] ?? []
    for (let i = thread.length - 1; i >= 0; i--) {
      const m = thread[i]
      if (m.from === "user") {
        out[id] = m.ticks
        break
      }
    }
  }
  return out
}

function bumpLastUserTicks(histories: Record<string, Msg[]>, convId: string, to: Ticks): Record<string, Msg[]> {
  const thread = histories[convId] ?? []
  if (thread.length === 0) return histories
  let idx = -1
  for (let i = thread.length - 1; i >= 0; i--) {
    if (thread[i].from === "user") {
      idx = i
      break
    }
  }
  if (idx < 0) return histories
  const updated = { ...thread, [idx]: { ...thread[idx], ticks: to } }
  return { ...histories, [convId]: updated }
}

type RenderedItem =
  | { kind: "day"; key: string; label: string; date: number }
  | { kind: "msg"; key: string; m: Msg; groupFirst: boolean; groupLast: boolean }

function buildRenderedItems(messages: Msg[]): RenderedItem[] {
  const out: RenderedItem[] = []
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]
    const prev = messages[i - 1]
    const next = messages[i + 1]
    if (!prev || !isSameDay(prev.date, m.date)) {
      out.push({ kind: "day", key: `day-${m.id}`, label: dayLabel(m.date), date: m.date })
    }
    const groupFirst = !prev || prev.from !== m.from
    const groupLast = !next || next.from !== m.from
    out.push({ kind: "msg", key: `m-${m.id}`, m, groupFirst, groupLast })
  }
  return out
}
