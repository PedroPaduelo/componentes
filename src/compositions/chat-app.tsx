/**
 * Composição "Chat / IA" (chat-app).
 *
 * App de assistente de IA em layout de 3 painéis estilo ChatGPT/Claude,
 * montado SÓ com componentes do registry da vitrine e contido no card
 * centralizado (não full-bleed):
 *  - Sidebar esquerda: lista de conversas selecionáveis (busca + nova conversa).
 *  - Thread central: header da conversa + histórico (ChatMessageFluid) +
 *    bloco de raciocínio (ThinkingStepsFluid + ThinkingIndicatorFluid) +
 *    composer (InputMessageFluid com anexo + FileThumbnailFluid).
 *  - Painel direito de contexto: assistente/modelo, tópicos, anexos e ações.
 *
 * Interatividade real (useState): trocar de conversa troca o histórico;
 * enviar mensagem adiciona a bolha do user na hora e dispara uma resposta
 * SIMULADA (thinking → resposta via setTimeout) com scroll automático ao fim;
 * "nova conversa" cria uma thread vazia ativa. Sem backend — tudo em memória.
 */
import { useEffect, useRef, useState } from "react"
import {
  Copy,
  RefreshCw,
  Paperclip,
  Sparkles,
  Plus,
  Search,
  PanelLeft,
  PanelRight,
  X,
  Cpu,
  Download,
  Share2,
  Trash2,
  ShieldCheck,
  Zap,
} from "lucide-react"

import { ButtonFluid } from "@/components/ui/button-fluid"
import { BadgeFluid } from "@/components/ui/badge-fluid"
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
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { ThemeToggleEffect } from "@/components/ui/theme-toggle-effect"
import { Input } from "@/components/ui/input"
import type { IconName } from "@/lib/icon-context"
import type { BadgeColor } from "@/components/ui/badge-fluid-variants"
import { cn } from "@/lib/utils"

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
/*                                   types                                     */
/* -------------------------------------------------------------------------- */

type Role = "user" | "assistant"

type Msg = {
  id: number
  from: Role
  text: string
  time?: string
  withFile?: boolean
}

type Conversation = {
  id: string
  title: string
  /** Assistant persona shown in the header and context panel. */
  persona: string
  /** Model label shown in the context panel. */
  model: string
  /** Short role/description of the persona. */
  role: string
  /** Avatar seed for picsum. */
  seed: string
  /** Last-message preview shown in the sidebar. */
  preview: string
  /** Relative time label shown in the sidebar. */
  updated: string
  /** Topic chips shown in the context panel. */
  topics: string[]
  /** Base text used for the simulated assistant reply. */
  replyHint: string
}

/* -------------------------------------------------------------------------- */
/*                                 mock data                                   */
/* -------------------------------------------------------------------------- */

const CONVERSATIONS: Conversation[] = [
  {
    id: "acessibilidade",
    title: "Acessibilidade do mockup",
    persona: "Aria",
    model: "GPT-4o",
    role: "Especialista em design",
    seed: "aria-design",
    preview: "E sobre a navegação por teclado?",
    updated: "14:33",
    topics: ["WCAG", "Contraste", "Teclado"],
    replyHint:
      "A navegação por teclado está quase lá. Garanta um foco visível com `:focus-visible`, uma ordem de tabulação lógica e um skip-link no topo. Quer que eu liste os pontos exatos pra ajustar?",
  },
  {
    id: "refatorar-hook",
    title: "Refatorar hook de estado",
    persona: "Dev",
    model: "Claude 3.5 Sonnet",
    role: "Engenheiro de código",
    seed: "dev-code",
    preview: "Os re-renders caíram de 9 para 2.",
    updated: "10:41",
    topics: ["React", "useReducer", "Performance"],
    replyHint:
      "Migrei o estado pra um `useReducer` tipado e memoizei o dispatch com `useCallback`. Os re-renders caíram de 9 para 2 por interação. Posso extrair os tipos do reducer pra um arquivo separado se quiser.",
  },
  {
    id: "conteudo-q3",
    title: "Plano de conteúdo Q3",
    persona: "Mara",
    model: "GPT-4o mini",
    role: "Estrategista de conteúdo",
    seed: "mara-content",
    preview: "Montei o calendário das 6 primeiras semanas.",
    updated: "Ontem",
    topics: ["SEO", "Calendário", "Blog"],
    replyHint:
      "Montei um calendário editorial com 2 posts por semana, cobrindo os clusters de SEO que você priorizou. Cada pauta já vem com palavra-chave alvo e ângulo. Quer que eu detalhe a primeira semana?",
  },
  {
    id: "analise-churn",
    title: "Análise de churn",
    persona: "Vega",
    model: "GPT-4o",
    role: "Analista de dados",
    seed: "vega-data",
    preview: "A coorte de março liderou com 41%.",
    updated: "Ter",
    topics: ["SQL", "Coorte", "Retenção"],
    replyHint:
      "Cruzei os eventos do trimestre por coorte mensal: a de março liderou com 41% de retenção em D30, 9 pontos acima da média. Posso plotar a curva completa ou exportar o CSV bruto.",
  },
  {
    id: "roteiro-onboarding",
    title: "Roteiro de onboarding",
    persona: "Sol",
    model: "Claude 3.5 Haiku",
    role: "Designer de produto",
    seed: "sol-product",
    preview: "Reduzi o fluxo para 3 passos.",
    updated: "Seg",
    topics: ["Ativação", "UX", "Fluxo"],
    replyHint:
      "Enxuguei o onboarding de 5 para 3 passos, deixando a coleta de dados opcional pro fim. A previsão é subir a taxa de ativação sem aumentar o atrito inicial. Quer ver o passo a passo proposto?",
  },
]

const INITIAL_HISTORIES: Record<string, Msg[]> = {
  acessibilidade: [
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
      text: "Claro! O contraste do texto secundário está abaixo de 4.5:1. Sugiro um tom mais escuro e adicionar `aria-label` nos botões só com ícone.",
    },
    {
      id: 3,
      from: "user",
      text: "Perfeito. E sobre a navegação por teclado?",
      time: "Hoje 14:33",
    },
  ],
  "refatorar-hook": [
    {
      id: 1,
      from: "user",
      text: "Refatora esse hook pra usar useReducer e evitar re-renders desnecessários.",
      time: "Hoje 10:38",
    },
    {
      id: 2,
      from: "assistant",
      text: "Boa ideia. Vou mapear as dependências do estado e mover as transições pra um reducer puro — assim o React reusa a mesma referência de dispatch.",
    },
    {
      id: 3,
      from: "user",
      text: "Mostra como ficou o reducer no final.",
      time: "Hoje 10:40",
    },
  ],
  "conteudo-q3": [
    {
      id: 1,
      from: "assistant",
      text: "Levantei as 12 palavras-chave com melhor relação volume/dificuldade pro nosso nicho neste trimestre.",
    },
    {
      id: 2,
      from: "user",
      text: "Ótimo. Organiza isso num calendário de publicação.",
      time: "Ontem 16:20",
    },
  ],
  "analise-churn": [
    {
      id: 1,
      from: "user",
      text: "Qual foi a coorte com maior retenção no último trimestre?",
      time: "Ter 17:22",
    },
    {
      id: 2,
      from: "assistant",
      text: "Já filtrei os eventos e calculei a retenção D30 por coorte mensal. Quer o ranking completo ou só o destaque?",
    },
  ],
  "roteiro-onboarding": [
    {
      id: 1,
      from: "user",
      text: "Nosso onboarding tem 5 telas e a galera abandona no meio. Como simplificar?",
      time: "Seg 09:05",
    },
    {
      id: 2,
      from: "assistant",
      text: "O abandono concentra na coleta de dados. Dá pra adiar isso e mostrar valor antes — assim o usuário chega engajado no cadastro.",
    },
  ],
}

/** Steps shown in the reasoning block while a reply is being generated. */
type ThinkingStepSpec = {
  icon: IconName
  label: string
  description?: string
  sources?: { label: string; color: BadgeColor }[]
  details?: { summary: string; items: string[] }
}

const THINKING_STEPS: ThinkingStepSpec[] = [
  {
    icon: "search",
    label: "Entendendo o pedido",
    description: "Quebrando a pergunta em partes acionáveis.",
  },
  {
    icon: "globe",
    label: "Reunindo o contexto",
    sources: [
      { label: "histórico", color: "blue" },
      { label: "anexos", color: "green" },
    ],
  },
  {
    icon: "check",
    label: "Redigindo a resposta",
    details: {
      summary: "Ver raciocínio",
      items: [
        "Priorizou clareza e próximos passos.",
        "Conferiu a consistência com a conversa.",
      ],
    },
  },
]

const REPLY_DELAY_MS = 1500
const NEW_CHAT_REPLY =
  "Boa! Já tenho o suficiente pra começar. Me conta um pouco mais do objetivo e eu organizo os próximos passos."

const SUGGESTIONS = [
  "Resuma esta conversa em tópicos",
  "Liste os próximos passos",
  "Reescreva de forma mais simples",
]

function avatarUrl(seed: string, size = 64) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}

/* -------------------------------------------------------------------------- */
/*                              sub-componentes                                */
/* -------------------------------------------------------------------------- */

function PersonaAvatar({
  conv,
  size = 36,
}: {
  conv: Conversation
  size?: number
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <img
        src={avatarUrl(conv.seed)}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-1 ring-border"
      />
      <span
        className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
        aria-hidden="true"
      />
    </span>
  )
}

function ConversationRow({
  conv,
  active,
  onSelect,
}: {
  conv: Conversation
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-conversation-id={conv.id}
      data-active={active ? "true" : undefined}
      aria-current={active ? "true" : undefined}
      aria-label={`Abrir conversa: ${conv.title}`}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-border bg-accent"
          : "border-transparent hover:bg-accent/60"
      )}
    >
      <PersonaAvatar conv={conv} size={36} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {conv.title}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {conv.updated}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
          {conv.preview}
        </span>
      </span>
    </button>
  )
}

function SidebarContent({
  conversations,
  selectedId,
  query,
  onQueryChange,
  onSelect,
  onNewChat,
}: {
  conversations: Conversation[]
  selectedId: string
  query: string
  onQueryChange: (value: string) => void
  onSelect: (id: string) => void
  onNewChat: () => void
}) {
  const normalized = query.trim().toLowerCase()
  const filtered = normalized
    ? conversations.filter((c) =>
        [c.title, c.preview, c.persona, ...c.topics]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
    : conversations

  return (
    <div className="flex h-full flex-col">
      {/* Brand + new chat */}
      <div className="flex h-[3.75rem] shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-semibold">Assistente IA</span>
        </div>
        <TooltipFluid content="Nova conversa">
          <ButtonFluid
            variant="ghost"
            size="icon-sm"
            aria-label="Nova conversa"
            onClick={onNewChat}
          >
            <Plus size={16} />
          </ButtonFluid>
        </TooltipFluid>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar conversas…"
            aria-label="Buscar conversas"
            className="h-9 pl-8"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {filtered.length > 0 ? (
          filtered.map((c) => (
            <ConversationRow
              key={c.id}
              conv={c}
              active={c.id === selectedId}
              onSelect={() => onSelect(c.id)}
            />
          ))
        ) : (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
            Nenhuma conversa encontrada.
          </p>
        )}
      </div>

      {/* New chat button (full width) */}
      <div className="shrink-0 border-t border-border p-3">
        <ButtonFluid
          variant="secondary"
          size="sm"
          leadingIcon={Plus}
          className="w-full justify-center"
          onClick={onNewChat}
        >
          Nova conversa
        </ButtonFluid>
      </div>
    </div>
  )
}

function ContextContent({
  conv,
  attachment,
  attachmentCount,
  onExport,
  onShare,
  onClear,
}: {
  conv: Conversation
  attachment: File | null
  attachmentCount: number
  onExport: () => void
  onShare: () => void
  onClear: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[3.75rem] shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="text-sm font-semibold">Detalhes</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        {/* Assistant / model */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            <PersonaAvatar conv={conv} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {conv.persona}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {conv.role}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgeFluid variant="solid" size="sm" color="blue">
              <Cpu className="size-3" />
              {conv.model}
            </BadgeFluid>
            <BadgeFluid variant="solid" size="sm" color="green">
              <Zap className="size-3" />
              Resposta rápida
            </BadgeFluid>
          </div>
        </section>

        {/* Topics */}
        <section className="flex flex-col gap-2">
          <h3 className="px-0.5 text-xs font-medium text-muted-foreground">
            Tópicos da conversa
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {conv.topics.map((topic) => (
              <BadgeFluid key={topic} variant="solid" size="sm" color="gray">
                {topic}
              </BadgeFluid>
            ))}
          </div>
        </section>

        {/* Attachments */}
        <section className="flex flex-col gap-2">
          <h3 className="px-0.5 text-xs font-medium text-muted-foreground">
            Anexos ({attachmentCount})
          </h3>
          {attachmentCount > 0 && attachment ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(attachmentCount, 3) }).map(
                (_, i) => (
                  <FileThumbnailFluid key={i} file={attachment} size={56} />
                )
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[13px] text-muted-foreground">
              Nenhum anexo nesta conversa.
            </p>
          )}
        </section>

        {/* Actions */}
        <section className="mt-auto flex flex-col gap-2">
          <h3 className="px-0.5 text-xs font-medium text-muted-foreground">
            Ações
          </h3>
          <ButtonFluid
            variant="tertiary"
            size="sm"
            leadingIcon={Download}
            className="w-full justify-start"
            onClick={onExport}
          >
            Exportar conversa
          </ButtonFluid>
          <ButtonFluid
            variant="tertiary"
            size="sm"
            leadingIcon={Share2}
            className="w-full justify-start"
            onClick={onShare}
          >
            Compartilhar
          </ButtonFluid>
          <ButtonFluid
            variant="tertiary"
            size="sm"
            leadingIcon={Trash2}
            className="w-full justify-start"
            onClick={onClear}
          >
            Limpar conversa
          </ButtonFluid>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-emerald-500" />
            Conversa privada — nada sai desta demonstração.
          </div>
        </section>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  ChatApp                                    */
/* -------------------------------------------------------------------------- */

export function ChatApp() {
  const attachment = useGeneratedImageFile()

  const [conversations, setConversations] =
    useState<Conversation[]>(CONVERSATIONS)
  const [selectedId, setSelectedId] = useState<string>(CONVERSATIONS[0].id)
  const [histories, setHistories] =
    useState<Record<string, Msg[]>>(INITIAL_HISTORIES)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [value, setValue] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [query, setQuery] = useState("")

  // Mobile drawers (kept inside the card via absolute positioning).
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const newChatCount = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selected =
    conversations.find((c) => c.id === selectedId) ?? conversations[0]
  const messages = histories[selectedId] ?? []
  const isThinkingHere = pendingId === selectedId
  const attachmentCount = messages.filter((m) => m.withFile).length

  // Clears any pending timer when unmounting.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Auto-scroll the thread to the bottom whenever the visible history changes
  // or the reasoning block appears. Scoped to the local scroll container — no
  // window-scroll dependency (the screen mounts without a guaranteed page scroll).
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [selectedId, messages.length, isThinkingHere])

  function selectConversation(id: string) {
    setSelectedId(id)
    setValue("")
    setFiles([])
    setSidebarOpen(false)
  }

  function handleSend(text: string, sentFiles: File[]) {
    const trimmed = text.trim()
    if (!trimmed && sentFiles.length === 0) return
    const targetId = selectedId

    setHistories((prev) => {
      const thread = prev[targetId] ?? []
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
      return { ...prev, [targetId]: [...thread, msg] }
    })
    setValue("")
    setFiles([])
    setPendingId(targetId)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, preview: trimmed || "Anexo enviado", updated: "Agora" }
            : c
        )
      )
      setHistories((prev) => {
        const thread = prev[targetId] ?? []
        const nextId = thread.length
          ? Math.max(...thread.map((m) => m.id)) + 1
          : 1
        const conv = CONVERSATIONS.find((c) => c.id === targetId)
        const reply: Msg = {
          id: nextId,
          from: "assistant",
          text: conv ? conv.replyHint : NEW_CHAT_REPLY,
        }
        return { ...prev, [targetId]: [...thread, reply] }
      })
      setPendingId(null)
      timerRef.current = null
    }, REPLY_DELAY_MS)
  }

  function newChat() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    newChatCount.current += 1
    const id = `nova-${newChatCount.current}`
    const conv: Conversation = {
      id,
      title: `Nova conversa ${newChatCount.current}`,
      persona: "Assistente",
      model: "GPT-4o",
      role: "Assistente geral",
      seed: `nova-${newChatCount.current}-${Date.now()}`,
      preview: "Comece a escrever…",
      updated: "Agora",
      topics: ["Geral"],
      replyHint: NEW_CHAT_REPLY,
    }
    setConversations((prev) => [conv, ...prev])
    setHistories((prev) => ({ ...prev, [id]: [] }))
    setPendingId(null)
    setSelectedId(id)
    setValue("")
    setFiles([])
    setSidebarOpen(false)
  }

  function clearConversation() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setHistories((prev) => ({ ...prev, [selectedId]: [] }))
    setPendingId(null)
  }

  const messagesEmpty = messages.length === 0 && !isThinkingHere

  return (
    <div className="relative mx-auto flex h-[78vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      {/* ── Sidebar (static, md+) ──────────────────────────────────────── */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border md:flex">
        <SidebarContent
          conversations={conversations}
          selectedId={selectedId}
          query={query}
          onQueryChange={setQuery}
          onSelect={selectConversation}
          onNewChat={newChat}
        />
      </aside>

      {/* ── Thread central ─────────────────────────────────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[3.75rem] shrink-0 items-center justify-between gap-3 border-b border-border px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <ButtonFluid
              variant="ghost"
              size="icon-sm"
              aria-label="Abrir conversas"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeft size={16} />
            </ButtonFluid>
            <PersonaAvatar conv={selected} size={36} />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">
                {selected.title}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {selected.persona} · {selected.model}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipFluid content="Trocar tema">
              <span className="inline-flex">
                <ThemeToggleEffect variant="circle" />
              </span>
            </TooltipFluid>
            <ThemeSwitcher />
            <ButtonFluid
              variant="ghost"
              size="icon-sm"
              aria-label="Detalhes da conversa"
              className="lg:hidden"
              onClick={() => setContextOpen(true)}
            >
              <PanelRight size={16} />
            </ButtonFluid>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-5 sm:px-4"
        >
          {messagesEmpty ? (
            <div className="m-auto flex max-w-sm flex-col items-center gap-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Como posso ajudar?
                </p>
                <p className="text-[13px] text-muted-foreground">
                  Escreva uma mensagem ou comece por uma sugestão.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <ButtonFluid
                    key={s}
                    variant="secondary"
                    size="sm"
                    onClick={() => setValue(s)}
                  >
                    {s}
                  </ButtonFluid>
                ))}
              </div>
            </div>
          ) : (
            <>
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

              {isThinkingHere && (
                <div className="flex w-full max-w-[85%] flex-col gap-2 self-start">
                  <ThinkingStepsFluid defaultOpen>
                    <ThinkingStepsHeaderFluid>
                      Pensando
                    </ThinkingStepsHeaderFluid>
                    <ThinkingStepsContentFluid>
                      {THINKING_STEPS.map((step, i) => {
                        const isLast = i === THINKING_STEPS.length - 1
                        return (
                          <ThinkingStepFluid
                            key={step.label}
                            index={i}
                            icon={step.icon}
                            label={step.label}
                            description={step.description}
                            status={isLast ? "active" : "complete"}
                            isLast={isLast}
                          >
                            {step.sources ? (
                              <ThinkingStepSourcesFluid>
                                {step.sources.map((s) => (
                                  <ThinkingStepSourceFluid
                                    key={s.label}
                                    color={s.color}
                                  >
                                    {s.label}
                                  </ThinkingStepSourceFluid>
                                ))}
                              </ThinkingStepSourcesFluid>
                            ) : null}
                            {step.details ? (
                              <ThinkingStepDetailsFluid
                                summary={step.details.summary}
                                details={step.details.items}
                              />
                            ) : null}
                          </ThinkingStepFluid>
                        )
                      })}
                    </ThinkingStepsContentFluid>
                  </ThinkingStepsFluid>
                  <div className="flex items-center gap-2 pl-1 text-[13px] text-muted-foreground">
                    <ThinkingIndicatorFluid />
                    <span>Gerando resposta…</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-border px-3 py-3 sm:px-4">
          <InputMessageFluid
            value={value}
            onValueChange={setValue}
            files={files}
            onFilesChange={setFiles}
            placeholder={`Escreva para ${selected.persona}…`}
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

      {/* ── Painel de contexto (static, lg+) ───────────────────────────── */}
      <aside className="hidden w-80 shrink-0 flex-col border-l border-border lg:flex">
        <ContextContent
          conv={selected}
          attachment={attachment}
          attachmentCount={attachmentCount}
          onExport={() => undefined}
          onShare={() => undefined}
          onClear={clearConversation}
        />
      </aside>

      {/* ── Drawer da sidebar (mobile, dentro do card) ─────────────────── */}
      {sidebarOpen && (
        <div className="absolute inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="Fechar conversas"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-end px-2 pt-2">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Fechar"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={16} />
              </ButtonFluid>
            </div>
            <div className="min-h-0 flex-1">
              <SidebarContent
                conversations={conversations}
                selectedId={selectedId}
                query={query}
                onQueryChange={setQuery}
                onSelect={selectConversation}
                onNewChat={newChat}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer do contexto (mobile/tablet, dentro do card) ─────────── */}
      {contextOpen && (
        <div className="absolute inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Fechar detalhes"
            className="absolute inset-0 bg-black/40"
            onClick={() => setContextOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col border-l border-border bg-card shadow-xl">
            <div className="flex items-center justify-start px-2 pt-2">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Fechar"
                onClick={() => setContextOpen(false)}
              >
                <X size={16} />
              </ButtonFluid>
            </div>
            <div className="min-h-0 flex-1">
              <ContextContent
                conv={selected}
                attachment={attachment}
                attachmentCount={attachmentCount}
                onExport={() => undefined}
                onShare={() => undefined}
                onClear={clearConversation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
