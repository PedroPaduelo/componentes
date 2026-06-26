/**
 * Composição "VoaCRM — CRM com WhatsApp Business".
 *
 * Tela profissional de CRM para agência de turismo com FOCO NO ATENDIMENTO
 * VIA WHATSAPP BUSINESS. Layout em 3 colunas estilo WhatsApp Web Profissional:
 *
 *   1) SIDEBAR FIXA (esquerda, ~64px collapsed / 260px expanded) com:
 *      - Logo + nome do workspace.
 *      - Card de CONEXÃO WHATSAPP BUSINESS (bolinha de status + nome do
 *        número conectado + botão "Gerenciar") — sempre visível.
 *      - Nav vertical: Conversas, Contatos, Pipeline, Campanhas,
 *        Templates, Automação, Relatórios, Configurações.
 *      - Perfil do agente logado no rodapé.
 *
 *   2) LISTA DE CONVERSAS (central, ~360px) estilo WhatsApp Web:
 *      - Header "Conversas" + busca + filtros em pílulas (Todas / Não
 *        lidas / Aguardando / Finalizadas) + botão "Nova conversa".
 *      - Cada item: avatar, nome, presença (online/ausente), snippet da
 *        última mensagem com ticks, hora, badge de não-lidas, etiqueta
 *        de tag (Reserva, Pagamento, Suporte, VIP) e indicador de fixada.
 *
 *   3) THREAD DO CHAT (principal):
 *      - Header com avatar do contato, nome, telefone, status de
 *        conexão, indicador "digitando…" e ações (ligar, video, info).
 *      - Mensagens agrupadas por dia (Hoje / Ontem / data) com bubbles
 *        estilo WhatsApp (cliente à esquerda cinza, agente à direita
 *        verde), status ticks (enviada/entregue/lida), respostas
 *        rápidas e anexos.
 *      - Composer com anexos, emojis, gravação de áudio (mock),
 *        quick replies e envio.
 *
 * Seção "Conexão WhatsApp" abre um painel detalhado com QR Code
 * mockado (SVG gerado), status do pareamento, número conectado,
 * métricas (mensagens hoje / conversas abertas / tempo médio de
 * resposta) e ações (Reconectar, Desconectar, Testar conexão).
 *
 * Pipeline e Contatos ficam como visões rápidas acessíveis pela nav
 * lateral — foco continua sendo o chat.
 *
 * Componentes do catálogo usados (~18): Card, Button, ButtonFluid,
 * BadgeFluid, Input, Avatar/AvatarFallback, Separator, ScrollArea,
 * Tabs/TabsList/TabsTrigger, Select/*, Dialog/*, DropdownMenu/*,
 * Popover/PopoverTrigger/PopoverContent, SwitchFluid, TooltipFluid,
 * Sheet/SheetContent/SheetHeader/SheetTitle, Toaster (sonner).
 */
import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  MessageSquare,
  Users,
  Briefcase,
  Megaphone,
  FileText,
  Workflow,
  BarChart3,
  Settings,
  Search,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Mic,
  Pin,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File as FileIcon,
  MapPin,
  CalendarDays,
  CreditCard,
  Star,
  Plane,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Power,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Clock,
} from "lucide-react"

import {
  Card,
  Button,
  ButtonFluid,
  BadgeFluid,
  Input,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  SwitchFluid,
  TooltipFluid,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Toaster,
} from "@/components/ui"
import type { BadgeColor } from "@/components/ui"
import { useTheme } from "@/components/theme/use-theme"
import { springs } from "@/lib/springs"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                               formatters                                   */
/* -------------------------------------------------------------------------- */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

/* -------------------------------------------------------------------------- */
/*                                  modelo                                    */
/* -------------------------------------------------------------------------- */

type Presence = "online" | "typing" | "away" | "offline"
type Ticks = "sent" | "delivered" | "read"
type DayKey = "hoje" | "ontem" | "anterior"
type MessageKind = "text" | "image" | "audio" | "document" | "location"
type ChannelKind = "whatsapp" | "instagram" | "facebook"
type ConnStatus = "connected" | "connecting" | "disconnected"

interface NavItem {
  id: NavId
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

type NavId =
  | "conversas"
  | "contatos"
  | "pipeline"
  | "campanhas"
  | "templates"
  | "automacao"
  | "relatorios"
  | "configuracoes"

interface Contact {
  id: string
  name: string
  phone: string
  avatarSeed: string
  avatarClass: string
  presence: Presence
  channel: ChannelKind
  tag: "reserva" | "pagamento" | "suporte" | "vip" | "lead"
  pinned: boolean
  unread: number
  /** cidade/UF opcional pra header do chat */
  location?: string
  /** se é cliente com gasto ou potencial */
  customerValue?: number
}

interface Message {
  id: string
  from: "me" | "them"
  kind: MessageKind
  text?: string
  /** para anexos — só metadado (mockado) */
  meta?: {
    title?: string
    duration?: string
    address?: string
    fileSize?: string
  }
  time: string
  ticks?: Ticks
  /** chave de dia pra agrupar */
  day: DayKey
}

interface QuickReply {
  emoji: string
  text: string
}

const TAG_META: Record<
  Contact["tag"],
  { label: string; color: BadgeColor }
> = {
  reserva: { label: "Reserva", color: "blue" },
  pagamento: { label: "Pagamento", color: "amber" },
  suporte: { label: "Suporte", color: "violet" },
  vip: { label: "VIP", color: "green" },
  lead: { label: "Lead", color: "gray" },
}

const PRESENCE_META: Record<Presence, { color: string; label: string }> = {
  online: { color: "bg-emerald-500", label: "Online" },
  typing: { color: "bg-sky-500", label: "Digitando…" },
  away: { color: "bg-amber-500", label: "Ausente" },
  offline: { color: "bg-muted-foreground/40", label: "Visto por último hoje" },
}

const CHANNEL_META: Record<ChannelKind, { label: string; emoji: string; color: string }> = {
  whatsapp: { label: "WhatsApp", emoji: "💬", color: "text-emerald-600 dark:text-emerald-400" },
  instagram: { label: "Instagram", emoji: "📸", color: "text-pink-600 dark:text-pink-400" },
  facebook: { label: "Facebook", emoji: "📘", color: "text-blue-600 dark:text-blue-400" },
}

const NAV_ITEMS: NavItem[] = [
  { id: "conversas", label: "Conversas", icon: MessageSquare },
  { id: "contatos", label: "Contatos", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: Briefcase },
  { id: "campanhas", label: "Campanhas", icon: Megaphone },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "automacao", label: "Automação", icon: Workflow },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "configuracoes", label: "Configurações", icon: Settings },
]

/* -------------------------------------------------------------------------- */
/*                                seed data                                    */
/* -------------------------------------------------------------------------- */

const CONTACTS: Contact[] = [
  {
    id: "marina",
    name: "Marina Albuquerque",
    phone: "+55 48 99812-4421",
    avatarSeed: "marina-alb",
    avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    presence: "online",
    channel: "whatsapp",
    tag: "vip",
    pinned: true,
    unread: 3,
    location: "Florianópolis, SC",
    customerValue: 47800,
  },
  {
    id: "renato",
    name: "Renato Pacheco",
    phone: "+55 41 99745-1102",
    avatarSeed: "renato-pach",
    avatarClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    presence: "typing",
    channel: "whatsapp",
    tag: "reserva",
    pinned: true,
    unread: 0,
    location: "Curitiba, PR",
    customerValue: 18250,
  },
  {
    id: "beatriz",
    name: "Beatriz Lemos",
    phone: "+55 31 98230-0921",
    avatarSeed: "beatriz-lem",
    avatarClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    presence: "online",
    channel: "whatsapp",
    tag: "pagamento",
    pinned: false,
    unread: 1,
    location: "Belo Horizonte, MG",
    customerValue: 9640,
  },
  {
    id: "tiago",
    name: "Tiago Vasconcelos",
    phone: "+55 81 98911-7740",
    avatarSeed: "tiago-vasc",
    avatarClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
    presence: "away",
    channel: "whatsapp",
    tag: "lead",
    pinned: false,
    unread: 0,
    location: "Recife, PE",
  },
  {
    id: "camila",
    name: "Camila Rocha",
    phone: "+55 51 99872-2244",
    avatarSeed: "camila-roch",
    avatarClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    presence: "online",
    channel: "instagram",
    tag: "reserva",
    pinned: false,
    unread: 2,
    location: "Porto Alegre, RS",
  },
  {
    id: "pedro",
    name: "Pedro Henrique Sales",
    phone: "+55 11 98123-9090",
    avatarSeed: "pedro-sales",
    avatarClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
    presence: "offline",
    channel: "whatsapp",
    tag: "suporte",
    pinned: false,
    unread: 0,
    location: "São Paulo, SP",
  },
  {
    id: "gustavo",
    name: "Gustavo Bertelli",
    phone: "+55 19 98765-3322",
    avatarSeed: "gustavo-bert",
    avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    presence: "online",
    channel: "whatsapp",
    tag: "vip",
    pinned: false,
    unread: 5,
    location: "Campinas, SP",
    customerValue: 62100,
  },
  {
    id: "livia",
    name: "Lívia Mendonça",
    phone: "+55 71 98890-2211",
    avatarSeed: "livia-mend",
    avatarClass: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    presence: "offline",
    channel: "whatsapp",
    tag: "lead",
    pinned: false,
    unread: 0,
    location: "Salvador, BA",
  },
]

/** Mapa de threads por contato. */
const THREADS: Record<string, Message[]> = {
  marina: [
    { id: "m1", from: "them", kind: "text", text: "Oi! Tudo bem? 😊", time: "09:12", day: "hoje" },
    { id: "m2", from: "me", kind: "text", text: "Oi, Marina! Tudo ótimo, e você? Em que posso ajudar?", time: "09:13", ticks: "read", day: "hoje" },
    { id: "m3", from: "them", kind: "text", text: "Estou pensando em fechar aquela viagem pra Lisboa que a gente vinha conversando. Lembra?", time: "09:14", day: "hoje" },
    { id: "m4", from: "me", kind: "text", text: "Lembro sim! Pacote Réveillon 2026 — Lisboa e Porto, 10 dias, hotel 4★ no centro. Posso te mandar a proposta atualizada?", time: "09:14", ticks: "read", day: "hoje" },
    { id: "m5", from: "them", kind: "text", text: "Pode mandar! E tem como incluir o city tour em Sintra?", time: "09:15", day: "hoje" },
    { id: "m6", from: "me", kind: "text", text: "Consigo encaixar sim. Vou montar e já te envio em alguns minutos 👍", time: "09:16", ticks: "read", day: "hoje" },
    { id: "m7", from: "them", kind: "document", meta: { title: "Voo_TAP_LIS_12dez.pdf", fileSize: "248 KB" }, time: "14:02", day: "hoje" },
    { id: "m8", from: "them", kind: "text", text: "Ana, segue em anexo o PDF do voo que você pediu ontem ✈️", time: "14:02", day: "hoje" },
    { id: "m9", from: "me", kind: "text", text: "Recebi, obrigada! Vou validar os horários e te chamo aqui.", time: "14:05", ticks: "read", day: "hoje" },
    { id: "m10", from: "them", kind: "text", text: "Perfeito! Aguardo 🙌", time: "14:08", day: "hoje" },
    { id: "m11", from: "them", kind: "text", text: "Oi, Ana! Passando pra saber se já conseguiu validar o voo. A viagem tá ficando pra daqui 2 meses e preciso travar as datas com o hotel.", time: "10:42", day: "hoje" },
    { id: "m12", from: "them", kind: "text", text: "Outra coisa: você consegue incluir traslado do aeroporto?", time: "10:43", day: "hoje" },
  ],
  renato: [
    { id: "r1", from: "them", kind: "text", text: "Bom dia, Bruno! Tudo certo com o pacote Cancún?", time: "08:30", day: "hoje" },
    { id: "r2", from: "me", kind: "text", text: "Bom dia, Renato! Tá tudo certo sim. Vou te mandar o link de pagamento agora.", time: "08:32", ticks: "read", day: "hoje" },
    { id: "r3", from: "me", kind: "document", meta: { title: "Cartao_Reserva_Cancun.pdf", fileSize: "124 KB" }, time: "08:33", ticks: "read", day: "hoje" },
    { id: "r4", from: "them", kind: "text", text: "Show!", time: "08:45", day: "hoje" },
    { id: "r5", from: "me", kind: "text", text: "Renato, só passando pra confirmar — conseguiu gerar o boleto?", time: "13:50", ticks: "read", day: "hoje" },
  ],
  beatriz: [
    { id: "b1", from: "them", kind: "text", text: "Oi! O pagamento do trecho da Patagônia não caiu ainda 😕", time: "11:05", day: "hoje" },
    { id: "b2", from: "me", kind: "text", text: "Oi, Beatriz! Deixa eu verificar com o financeiro. Te respondo em alguns minutos.", time: "11:06", ticks: "read", day: "hoje" },
  ],
  tiago: [
    { id: "t1", from: "them", kind: "text", text: "Boa tarde, vim pelo anúncio do Instagram. Quero fechar um pacote pra Maceió em julho.", time: "Ontem 16:22", day: "ontem" },
    { id: "t2", from: "me", kind: "text", text: "Boa tarde, Tiago! Que bom te ver por aqui. Pra qual período exatamente?", time: "Ontem 16:35", ticks: "read", day: "ontem" },
    { id: "t3", from: "them", kind: "text", text: "Entre 10 e 20 de julho, dois adultos, all inclusive.", time: "Ontem 17:01", day: "ontem" },
    { id: "t4", from: "me", kind: "text", text: "Vou montar duas opções e te mando amanhã cedo!", time: "Ontem 17:10", ticks: "read", day: "ontem" },
  ],
  camila: [
    { id: "c1", from: "them", kind: "text", text: "Oi! Vocês têm pacote pra Bariloche no inverno?", time: "09:00", day: "hoje" },
    { id: "c2", from: "me", kind: "text", text: "Temos sim! Você já tem data e aéreo?", time: "09:02", ticks: "read", day: "hoje" },
    { id: "c3", from: "them", kind: "text", text: "Tenho o aéreo pela Gol saindo de POA. Quero 7 noites.", time: "09:08", day: "hoje" },
  ],
  pedro: [
    { id: "p1", from: "them", kind: "text", text: "Não consigo acessar minha conta no site. Pode ajudar?", time: "Terça 14:22", day: "anterior" },
    { id: "p2", from: "me", kind: "text", text: "Claro, Pedro! Já te envio o link de redefinição de senha.", time: "Terça 14:25", ticks: "read", day: "anterior" },
  ],
  gustavo: [
    { id: "g1", from: "them", kind: "text", text: "Bom dia. Gostaria de cotar uma viagem para Tóquio em outubro. 3 pessoas.", time: "07:12", day: "hoje" },
    { id: "g2", from: "me", kind: "text", text: "Bom dia, Gustavo! Tóquio em outubro é uma escolha excelente 🍁 Já te mando opções.", time: "07:14", ticks: "read", day: "hoje" },
    { id: "g3", from: "them", kind: "text", text: "Perfeito, manda!", time: "07:16", day: "hoje" },
    { id: "g4", from: "them", kind: "text", text: "Vocês têm algum roteiro pronto ou monto do zero?", time: "07:30", day: "hoje" },
    { id: "g5", from: "them", kind: "text", text: "Outra coisa: pode incluir Kyoto?", time: "07:31", day: "hoje" },
  ],
  livia: [
    { id: "l1", from: "them", kind: "text", text: "Vi o post de vocês sobre lua de mel. Como faço pra cotar?", time: "Seg 10:14", day: "anterior" },
  ],
}

/** Resposta automática por contato — pra dar vida ao chat. */
const AUTO_REPLY: Record<string, string> = {
  marina: "Combinado, Marina! Deixa só eu finalizar a proposta com o city tour de Sintra incluído e já te mando aqui. 💛",
  renato: "Boa pergunta, Renato! Deixa eu puxar o status aqui e te retorno em 5 minutos.",
  beatriz: "Já verifiquei, Beatriz — o boleto foi compensado hoje cedo. O extrato mostra liquidação às 09:42. Tudo certo! 🎉",
  tiago: "Perfeito, Tiago! Tenho duas opções bem legais — vou montar e te mando amanhã às 9h, tá bom?",
  camila: "Show! Com aéreo da Gol de POA e 7 noites, consigo fechar um pacote bem completo. Te mando em alguns minutos!",
  pedro: "Já te enviei o link de redefinição, Pedro! Qualquer problema me chama aqui.",
  gustavo: "Tenho sim, Gustavo! Tenho um roteiro Tokyo + Kyoto de 12 dias que ficou incrível no último grupo. Te mando! 🇯🇵",
  livia: "Oi, Lívia! Que bom que gostou do post 😊 Me conta um pouquinho sobre a viagem dos sonhos de vocês que eu monto uma proposta personalizada!",
}

const QUICK_REPLIES_BY_TAG: Record<Contact["tag"], QuickReply[]> = {
  reserva: [
    { emoji: "✈️", text: "Vou montar uma proposta e te mando aqui" },
    { emoji: "📅", text: "Para qual data você está pensando?" },
    { emoji: "👥", text: "Quantas pessoas vão viajar?" },
    { emoji: "💰", text: "Já tem orçamento em mente?" },
  ],
  pagamento: [
    { emoji: "💳", text: "Vou verificar o pagamento e te retorno" },
    { emoji: "📄", text: "Posso te mandar o boleto atualizado?" },
    { emoji: "✅", text: "Pagamento confirmado!" },
    { emoji: "🔁", text: "Vou emitir um novo link de pagamento" },
  ],
  suporte: [
    { emoji: "🤝", text: "Claro, vou te ajudar agora" },
    { emoji: "🔗", text: "Te envio o link de redefinição" },
    { emoji: "📞", text: "Posso te ligar agora para entender melhor?" },
  ],
  vip: [
    { emoji: "💎", text: "Vou priorizar seu atendimento agora" },
    { emoji: "🌟", text: "Tenho uma condição especial pra você" },
    { emoji: "📋", text: "Vou montar uma experiência personalizada" },
  ],
  lead: [
    { emoji: "👋", text: "Oi! Tudo bem? Em que posso ajudar?" },
    { emoji: "🌍", text: "Para onde você está pensando em viajar?" },
    { emoji: "📅", text: "Tem alguma data em mente?" },
  ],
}

/* -------------------------------------------------------------------------- */
/*                              helper widgets                                 */
/* -------------------------------------------------------------------------- */

function avatarUrl(seed: string, size = 80) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}

// (ContactAvatar foi removido — usamos ContactAvatarImage com picsum em todos os pontos)

function ContactAvatarImage({
  contact,
  size = 40,
}: {
  contact: Contact
  size?: number
}) {
  return (
    <img
      src={avatarUrl(contact.avatarSeed, size)}
      alt={contact.name}
      width={size}
      height={size}
      loading="lazy"
      className={cn(
        "rounded-full object-cover",
        size <= 40 ? "size-10" : size <= 48 ? "size-12" : "size-14"
      )}
    />
  )
}

function TicksIcon({
  state,
  className,
}: {
  state: Ticks
  className?: string
}) {
  if (state === "read") {
    return (
      <CheckCheck
        size={13}
        strokeWidth={2.2}
        className={cn(className, "text-sky-500")}
        aria-label="Lida"
      />
    )
  }
  if (state === "delivered") {
    return (
      <CheckCheck
        size={13}
        strokeWidth={2}
        className={className}
        aria-label="Entregue"
      />
    )
  }
  return (
    <Check size={13} strokeWidth={2} className={className} aria-label="Enviada" />
  )
}

function PresenceDot({ presence }: { presence: Presence }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-card",
        PRESENCE_META[presence].color
      )}
    />
  )
}

function ChatBubble({ message }: { message: Message }) {
  const isMe = message.from === "me"
  if (message.kind === "image") {
    return (
      <div
        className={cn(
          "flex w-full",
          isMe ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[75%] overflow-hidden rounded-2xl shadow-sm",
            isMe
              ? "rounded-br-md bg-emerald-100 dark:bg-emerald-900/30"
              : "rounded-bl-md bg-muted"
          )}
        >
          <div className="flex items-center gap-2 bg-gradient-to-br from-sky-400 to-violet-500 px-4 py-8 text-white">
            <ImageIcon className="size-5" />
            <span className="text-sm font-medium">Imagem enviada</span>
          </div>
          <div
            className={cn(
              "flex items-center justify-end gap-1 px-2.5 py-1",
              isMe ? "text-emerald-900 dark:text-emerald-200" : "text-muted-foreground"
            )}
          >
            <span className="text-[11px]">{message.time}</span>
            {isMe && message.ticks && (
              <TicksIcon state={message.ticks} className="text-emerald-700 dark:text-emerald-300" />
            )}
          </div>
        </div>
      </div>
    )
  }
  if (message.kind === "audio") {
    return (
      <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "flex max-w-[75%] items-center gap-3 rounded-2xl px-3 py-2 shadow-sm",
            isMe
              ? "rounded-br-md bg-emerald-100 dark:bg-emerald-900/30"
              : "rounded-bl-md bg-muted"
          )}
        >
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
            aria-label="Tocar áudio"
          >
            <Mic className="size-4" />
          </button>
          <div className="flex flex-1 items-center gap-0.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                style={{ height: `${20 + Math.sin(i * 1.3) * 16}px` }}
                className={cn(
                  "w-0.5 rounded-full",
                  isMe
                    ? "bg-emerald-700/60 dark:bg-emerald-300/60"
                    : "bg-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {message.meta?.duration ?? "0:42"}
          </span>
        </div>
      </div>
    )
  }
  if (message.kind === "document") {
    return (
      <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "flex max-w-[75%] items-center gap-3 rounded-2xl px-3 py-2.5 shadow-sm",
            isMe
              ? "rounded-br-md bg-emerald-100 dark:bg-emerald-900/30"
              : "rounded-bl-md bg-muted"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <FileIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {message.meta?.title ?? "Documento.pdf"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {message.meta?.fileSize ?? "124 KB"} · PDF
            </p>
          </div>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 text-[11px]",
              isMe ? "text-emerald-900 dark:text-emerald-200" : "text-muted-foreground"
            )}
          >
            {message.time}
            {isMe && message.ticks && (
              <TicksIcon state={message.ticks} className="text-emerald-700 dark:text-emerald-300" />
            )}
          </span>
        </div>
      </div>
    )
  }
  if (message.kind === "location") {
    return (
      <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "overflow-hidden rounded-2xl shadow-sm",
            isMe
              ? "rounded-br-md bg-emerald-100 dark:bg-emerald-900/30"
              : "rounded-bl-md bg-muted"
          )}
        >
          <div className="flex h-32 w-72 items-center justify-center bg-gradient-to-br from-emerald-400 via-sky-400 to-blue-500">
            <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-lg">
              <MapPin className="size-6 text-rose-500" />
            </div>
          </div>
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">
              {message.meta?.address ?? "Localização compartilhada"}
            </p>
          </div>
        </div>
      </div>
    )
  }
  // text
  return (
    <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 shadow-sm",
          isMe
            ? "rounded-br-md bg-emerald-100 dark:bg-emerald-900/30"
            : "rounded-bl-md bg-muted"
        )}
      >
        <p
          className={cn(
            "whitespace-pre-wrap text-sm leading-relaxed",
            isMe ? "text-foreground" : "text-foreground"
          )}
        >
          {message.text}
        </p>
        <div
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1",
            isMe ? "text-emerald-900/70 dark:text-emerald-200/70" : "text-muted-foreground"
          )}
        >
          <span className="text-[11px]">{message.time}</span>
          {isMe && message.ticks && (
            <TicksIcon
              state={message.ticks}
              className={cn(
                message.ticks === "read"
                  ? "text-sky-500"
                  : "text-emerald-700/70 dark:text-emerald-300/70"
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function DaySeparator({ day }: { day: DayKey }) {
  const label =
    day === "hoje" ? "Hoje" : day === "ontem" ? "Ontem" : "Data anterior"
  return (
    <div className="my-2 flex items-center justify-center gap-3">
      <span className="h-px flex-1 bg-border/60" />
      <span className="rounded-full border border-border/60 bg-card/80 px-3 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur">
        {label}
      </span>
      <span className="h-px flex-1 bg-border/60" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            sidebar de navegação                             */
/* -------------------------------------------------------------------------- */

function AppSidebar({
  active,
  onSelect,
  collapsed,
  onToggleCollapsed,
  connStatus,
  connNumber,
  onOpenWhatsapp,
}: {
  active: NavId
  onSelect: (id: NavId) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  connStatus: ConnStatus
  connNumber: string
  onOpenWhatsapp: () => void
}) {
  const statusMeta = {
    connected: {
      label: "Conectado",
      color: "bg-emerald-500",
      icon: Wifi,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    connecting: {
      label: "Conectando…",
      color: "bg-amber-500",
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400",
    },
    disconnected: {
      label: "Desconectado",
      color: "bg-muted-foreground/40",
      icon: WifiOff,
      tone: "text-muted-foreground",
    },
  }[connStatus]

  return (
    <aside
      data-slot="crm-sidebar"
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-card text-card-foreground transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo + workspace */}
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border px-3 py-3.5",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plane className="size-4" />
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              VoaCRM
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Aurora Viagens · Pro
            </p>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleCollapsed}
            aria-label="Recolher sidebar"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Card de conexão WhatsApp */}
      <div className="border-b border-border p-3">
        {collapsed ? (
          <TooltipFluid content={`WhatsApp · ${statusMeta.label}`} side="right">
            <button
              type="button"
              onClick={onOpenWhatsapp}
              aria-label="Gerenciar conexão WhatsApp"
              className="relative mx-auto flex size-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent"
            >
              <QrCode className={cn("size-4", statusMeta.tone)} />
              <span
                aria-hidden
                className={cn(
                  "absolute right-1.5 top-1.5 size-2 rounded-full ring-2 ring-card",
                  statusMeta.color
                )}
              />
            </button>
          </TooltipFluid>
        ) : (
          <button
            type="button"
            onClick={onOpenWhatsapp}
            data-slot="whatsapp-conn-card"
            className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <QrCode className="size-4" />
              <span
                aria-hidden
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background",
                  statusMeta.color
                )}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                WhatsApp Business
              </p>
              <p className={cn("truncate text-[11px]", statusMeta.tone)}>
                {statusMeta.label} · {connNumber}
              </p>
            </div>
            <statusMeta.icon className={cn("size-3.5 shrink-0", statusMeta.tone)} />
          </button>
        )}
      </div>

      {/* Nav vertical */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-0.5 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            const content = (
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                data-section={item.id}
                data-active={isActive ? "true" : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
            return collapsed ? (
              <TooltipFluid
                key={item.id}
                content={item.label}
                side="right"
              >
                {content}
              </TooltipFluid>
            ) : (
              <React.Fragment key={item.id}>{content}</React.Fragment>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Perfil do agente */}
      {!collapsed ? (
        <div className="shrink-0 border-t border-border p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent"
          >
            <ContactAvatarImage contact={{ ...CONTACTS[0], id: "agent", avatarSeed: "agent-ana", avatarClass: "" }} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Ana Lima
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Agente sênior · Online
              </p>
            </div>
            <Settings className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="shrink-0 border-t border-border p-2">
          <TooltipFluid content="Ana Lima · Online" side="right">
            <button
              type="button"
              aria-label="Perfil"
              className="mx-auto block rounded-full"
            >
              <ContactAvatarImage
                contact={{
                  ...CONTACTS[0],
                  id: "agent",
                  avatarSeed: "agent-ana",
                  avatarClass: "",
                }}
                size={36}
              />
            </button>
          </TooltipFluid>
        </div>
      )}

      {/* Toggle collapsed */}
      {collapsed && (
        <div className="shrink-0 border-t border-border p-2">
          <TooltipFluid content="Expandir sidebar" side="right">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapsed}
              aria-label="Expandir sidebar"
              className="mx-auto block"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </TooltipFluid>
        </div>
      )}
    </aside>
  )
}

/* -------------------------------------------------------------------------- */
/*                             lista de conversas                              */
/* -------------------------------------------------------------------------- */

type FilterTab = "todas" | "nao-lidas" | "aguardando" | "finalizadas"

function ConversationList({
  contacts,
  selectedId,
  query,
  onQueryChange,
  tab,
  onTabChange,
  onSelect,
}: {
  contacts: Contact[]
  selectedId: string
  query: string
  onQueryChange: (v: string) => void
  tab: FilterTab
  onTabChange: (t: FilterTab) => void
  onSelect: (id: string) => void
}) {
  const visible = filterConversations(contacts, tab, query)
  const lastMessageByContact = useLastMessageByContact()
  const counts = {
    todas: contacts.length,
    "nao-lidas": contacts.filter((c) => c.unread > 0).length,
    aguardando: contacts.filter((c) =>
      ["reserva", "pagamento"].includes(c.tag)
    ).length,
    finalizadas: contacts.filter((c) => c.tag === "vip").length,
  }

  return (
    <section
      data-slot="crm-conversations"
      className="flex h-full w-[360px] shrink-0 flex-col border-r border-border bg-background"
    >
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">
            Conversas
          </h2>
          <TooltipFluid content="Nova conversa">
            <Button variant="ghost" size="icon-sm" aria-label="Nova conversa">
              <Plus className="size-4" />
            </Button>
          </TooltipFluid>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar conversas ou contatos…"
            className="pl-9"
            aria-label="Buscar conversas"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as FilterTab)}
          className="mt-3"
        >
          <TabsList className="w-full">
            <TabsTrigger value="todas" className="flex-1">
              Todas ({counts.todas})
            </TabsTrigger>
            <TabsTrigger value="nao-lidas" className="flex-1">
              Não lidas ({counts["nao-lidas"]})
            </TabsTrigger>
            <TabsTrigger value="aguardando" className="flex-1">
              Aguardando ({counts.aguardando})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <EmptyListState
            hasQuery={query.trim().length > 0}
            tab={tab}
            onClearQuery={() => onQueryChange("")}
            onClearTab={() => onTabChange("todas")}
          />
        ) : (
          <div className="flex flex-col">
            {visible.map((c) => {
              const last = lastMessageByContact[c.id]
              const isActive = c.id === selectedId
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  data-contact-id={c.id}
                  data-active={isActive ? "true" : undefined}
                  className={cn(
                    "flex items-start gap-3 border-b border-border/40 px-3 py-3 text-left transition-colors",
                    isActive
                      ? "bg-accent"
                      : "hover:bg-accent/60"
                  )}
                >
                  <span className="relative shrink-0">
                    <ContactAvatarImage contact={c} size={44} />
                    <PresenceDot presence={c.presence} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        {c.pinned && (
                          <Pin
                            size={11}
                            strokeWidth={2.4}
                            className="shrink-0 text-muted-foreground"
                            aria-label="Fixada"
                          />
                        )}
                        <span
                          className={cn(
                            "truncate text-sm",
                            c.unread > 0
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/90"
                          )}
                        >
                          {c.name}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[11px] tabular-nums",
                          c.unread > 0
                            ? "font-semibold text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {last?.time ?? ""}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1 truncate text-[13px] text-muted-foreground">
                        {last?.previewPrefix}
                        <span className="truncate">{last?.text ?? ""}</span>
                      </span>
                      {c.unread > 0 ? (
                        <BadgeFluid
                          color="green"
                          size="sm"
                          className="shrink-0 justify-center tabular-nums"
                        >
                          {c.unread}
                        </BadgeFluid>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <BadgeFluid
                        color={TAG_META[c.tag].color}
                        size="sm"
                        className="text-[10px]"
                      >
                        {TAG_META[c.tag].label}
                      </BadgeFluid>
                      {c.channel !== "whatsapp" && (
                        <span className="text-[10px] text-muted-foreground">
                          via {CHANNEL_META[c.channel].label}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyListState({
  hasQuery,
  tab,
  onClearQuery,
  onClearTab,
}: {
  hasQuery: boolean
  tab: FilterTab
  onClearQuery: () => void
  onClearTab: () => void
}) {
  const title = hasQuery
    ? "Nenhum resultado"
    : tab === "nao-lidas"
    ? "Tudo em dia ✨"
    : tab === "aguardando"
    ? "Nenhuma reserva aguardando"
    : "Sem conversas finalizadas"
  const body = hasQuery
    ? "Nada combina com a busca. Tente outro termo."
    : tab === "nao-lidas"
    ? "Você não tem mensagens não lidas no momento."
    : tab === "aguardando"
    ? "Quando alguém iniciar uma reserva ou pagamento, aparece aqui."
    : "Marque uma conversa como VIP para acompanhar aqui."
  return (
    <div className="m-auto flex max-w-xs flex-col items-center gap-3 px-4 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Search className="size-4" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[12.5px] leading-snug text-muted-foreground">
          {body}
        </p>
      </div>
      {(hasQuery || tab !== "todas") && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {hasQuery && (
            <ButtonFluid variant="secondary" size="sm" onClick={onClearQuery}>
              Limpar busca
            </ButtonFluid>
          )}
          {tab !== "todas" && (
            <ButtonFluid variant="tertiary" size="sm" onClick={onClearTab}>
              Ver todas
            </ButtonFluid>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              thread do chat                                 */
/* -------------------------------------------------------------------------- */

function ChatThread({
  contact,
  thread,
  isTyping,
  onSend,
  onOpenWhatsapp,
}: {
  contact: Contact
  thread: Message[]
  isTyping: boolean
  onSend: (text: string) => void
  onOpenWhatsapp: () => void
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [value, setValue] = React.useState("")
  const presence = isTyping ? "typing" : contact.presence
  const presenceInfo = PRESENCE_META[presence]
  const quickReplies = QUICK_REPLIES_BY_TAG[contact.tag]
  const lastSeenLine = presenceInfo.label

  // agrupa mensagens por dia pra inserir separadores
  const groups = groupMessagesByDay(thread)

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread.length, isTyping])

  function send() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <section
      data-slot="crm-thread"
      className="flex h-full min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_top,_var(--muted)_1px,_transparent_1px)] [background-size:18px_18px]"
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/80 px-5 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative shrink-0">
            <ContactAvatarImage contact={contact} size={44} />
            <PresenceDot presence={presence} />
          </span>
          <div className="flex min-w-0 flex-col leading-tight">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">
                {contact.name}
              </span>
              <BadgeFluid
                color={TAG_META[contact.tag].color}
                size="sm"
                className="shrink-0"
              >
                {TAG_META[contact.tag].label}
              </BadgeFluid>
            </div>
            <span
              className={cn(
                "flex items-center gap-1.5 text-[11px]",
                presence === "typing"
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-muted-foreground"
              )}
              aria-live="polite"
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  presenceInfo.color,
                  presence === "typing" && "animate-pulse"
                )}
              />
              {lastSeenLine}
              <span className="text-muted-foreground/60">·</span>
              <span className="text-muted-foreground">{contact.phone}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipFluid content="Ligar">
            <Button variant="ghost" size="icon-sm" aria-label="Ligar">
              <Phone className="size-4" />
            </Button>
          </TooltipFluid>
          <TooltipFluid content="Vídeo">
            <Button variant="ghost" size="icon-sm" aria-label="Vídeo">
              <Video className="size-4" />
            </Button>
          </TooltipFluid>
          <TooltipFluid content="Conexão WhatsApp">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Gerenciar conexão"
              onClick={onOpenWhatsapp}
            >
              <QrCode className="size-4" />
            </Button>
          </TooltipFluid>
          <TooltipFluid content="Mais ações">
            <Button variant="ghost" size="icon-sm" aria-label="Mais ações">
              <MoreVertical className="size-4" />
            </Button>
          </TooltipFluid>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        data-slot="crm-thread-messages"
        className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-5 py-4"
      >
        {groups.map((group) => (
          <React.Fragment key={group.day}>
            <DaySeparator day={group.day} />
            {group.messages.map((m, idx) => {
              const prev = group.messages[idx - 1]
              const next = group.messages[idx + 1]
              const showAvatar =
                m.from === "them" && (!next || next.from !== "them")
              const compactTop =
                !!prev && prev.from === m.from && prev.kind === "text"
              const compactBottom =
                !!next && next.from === m.from && next.kind === "text"
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.from === "me" ? "justify-end" : "justify-start",
                    compactTop && m.from === "them" && "mt-0.5"
                  )}
                >
                  {m.from === "them" && showAvatar && (
                    <ContactAvatarImage contact={contact} size={28} />
                  )}
                  {m.from === "them" && !showAvatar && (
                    <span className="w-7 shrink-0" aria-hidden />
                  )}
                  <div className={cn("max-w-[75%]", compactBottom && "pb-0.5")}>
                    <ChatBubble message={m} />
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}

        {/* Indicador de digitação */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing"
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={springs.fast}
              className="flex items-end gap-2"
            >
              <ContactAvatarImage contact={contact} size={28} />
              <div className="rounded-2xl rounded-bl-md bg-muted px-3 py-2.5 shadow-sm">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      aria-hidden
                      className="size-1.5 rounded-full bg-muted-foreground/70"
                      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: i * 0.18,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick replies */}
      <div className="shrink-0 border-t border-border bg-card/70 px-5 py-2 backdrop-blur">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
            Respostas rápidas:
          </span>
          {quickReplies.map((qr) => (
            <button
              key={qr.text}
              type="button"
              onClick={() => onSend(qr.text)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[12px] text-foreground transition-colors hover:bg-accent"
            >
              <span>{qr.emoji}</span>
              <span>{qr.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-card px-5 py-3">
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <TooltipFluid content="Anexar arquivo">
              <Button variant="ghost" size="icon-sm" aria-label="Anexar">
                <Paperclip className="size-4" />
              </Button>
            </TooltipFluid>
            <TooltipFluid content="Emoji">
              <Button variant="ghost" size="icon-sm" aria-label="Emoji">
                <Smile className="size-4" />
              </Button>
            </TooltipFluid>
          </div>
          <div className="flex flex-1 items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={`Mensagem para ${contact.name.split(" ")[0]}…`}
              aria-label="Mensagem"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex shrink-0 items-center gap-1">
              <TooltipFluid content="Áudio">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Áudio"
                  type="button"
                >
                  <Mic className="size-4" />
                </Button>
              </TooltipFluid>
              <Button
                size="icon-sm"
                onClick={send}
                disabled={!value.trim()}
                aria-label="Enviar"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Enter para enviar · Shift+Enter para quebrar linha
        </p>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                          painel de conexão whatsapp                         */
/* -------------------------------------------------------------------------- */

function QrCodeMock({ size = 220 }: { size?: number }) {
  // Gera um "QR" mockado visualmente — não é um QR real, é um padrão
  // determinístico de células pra parecer um QR Code do WhatsApp Web.
  const cells = 25
  const cellSize = size / cells
  // hash determinístico a partir de "voa-crm-aurora-2026" pra sempre igual
  const seedStr = "voa-crm-aurora-2026"
  const squares: React.ReactElement[] = []
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      // cantos com "finders" 7x7
      const corner =
        (x < 7 && y < 7) ||
        (x >= cells - 7 && y < 7) ||
        (x < 7 && y >= cells - 7)
      const inFinder =
        corner &&
        ((x === 0 || x === 6 || x === cells - 7 || x === cells - 1) ||
          (y === 0 || y === 6 || y === cells - 7 || y === cells - 1) ||
          (x >= 2 && x <= 4 && y < 7) ||
          (x < 7 && y >= 2 && y <= 4) ||
          (x >= cells - 5 && x <= cells - 3 && y < 7) ||
          (x >= cells - 7 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= cells - 5 && y <= cells - 3) ||
          (x < 7 && y >= cells - 5 && y <= cells - 3))
      if (inFinder) {
        squares.push(
          <rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="currentColor"
          />
        )
        continue
      }
      // padrão pseudo-aleatório determinístico
      const idx = (x * 31 + y * 17 + seedStr.length * 7) % 97
      const fill = (idx * 13 + x * 5 + y * 3 + seedStr.charCodeAt(0)) % 7 < 3
      if (fill && !corner) {
        squares.push(
          <rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="currentColor"
          />
        )
      }
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="QR Code para pareamento do WhatsApp"
      className="text-foreground"
    >
      <rect width={size} height={size} fill="white" />
      {squares}
    </svg>
  )
}

function WhatsAppConnectionPanel({
  open,
  onOpenChange,
  status,
  number,
  businessName,
  onConnect,
  onDisconnect,
  onReconnect,
  onTest,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  status: ConnStatus
  number: string
  businessName: string
  onConnect: () => void
  onDisconnect: () => void
  onReconnect: () => void
  onTest: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[480px] gap-0 overflow-y-auto border-l border-border bg-card p-0 sm:max-w-[520px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Conexão WhatsApp Business</SheetTitle>
        </SheetHeader>

        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <QrCode className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                WhatsApp Business
              </h2>
              <p className="text-xs text-muted-foreground">
                Conexão oficial via API Cloud
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="flex flex-col gap-5 p-5">
          {/* Status card */}
          <Card className="gap-0 border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "size-3 rounded-full ring-2 ring-emerald-100 dark:ring-emerald-950",
                    status === "connected"
                      ? "bg-emerald-500"
                      : status === "connecting"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-muted-foreground/40"
                  )}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {status === "connected"
                      ? "Conectado e operacional"
                      : status === "connecting"
                      ? "Aguardando pareamento…"
                      : "Desconectado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {businessName} · {number}
                  </p>
                </div>
              </div>
              {status === "connected" && (
                <BadgeFluid color="green" size="sm">
                  <ShieldCheck />
                  Verificado
                </BadgeFluid>
              )}
            </div>
          </Card>

          {/* QR Code (quando desconectado / conectando) */}
          {status !== "connected" && (
            <Card className="flex flex-col items-center gap-4 gap-0 p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Escaneie o QR Code com seu WhatsApp Business
              </p>
              <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
                <QrCodeMock size={220} />
              </div>
              <ol className="flex w-full max-w-sm flex-col gap-2 text-left text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    1
                  </span>
                  Abra o WhatsApp Business no celular
                </li>
                <li className="flex gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    2
                  </span>
                  Vá em Configurações → Aparelhos conectados
                </li>
                <li className="flex gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    3
                  </span>
                  Toque em "Conectar um aparelho" e aponte para esta tela
                </li>
              </ol>
            </Card>
          )}

          {/* Métricas da conexão */}
          <div className="grid grid-cols-3 gap-3">
            <Metric
              label="Msgs hoje"
              value="184"
              tone="emerald"
              icon={MessageSquare}
            />
            <Metric
              label="Conversas abertas"
              value="27"
              tone="sky"
              icon={MessageSquare}
            />
            <Metric
              label="TMR"
              value="2:14"
              tone="violet"
              icon={Clock}
            />
          </div>

          {/* Detalhes da conexão */}
          <Card className="gap-0 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Detalhes da conexão
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <DetailRow label="Número" value={number} />
              <DetailRow label="Nome comercial" value={businessName} />
              <DetailRow
                label="API"
                value="WhatsApp Cloud API v18.0"
              />
              <DetailRow
                label="Webhooks"
                value="3 endpoints ativos"
              />
              <DetailRow
                label="Última sincronização"
                value="há 12 segundos"
              />
            </div>
          </Card>

          {/* Configurações */}
          <Card className="gap-0 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Configurações
            </p>
            <div className="flex flex-col gap-3">
              <SwitchRow
                label="Respostas automáticas"
                description="Responde fora do horário com mensagem padrão"
                defaultChecked
              />
              <SwitchRow
                label="Saudação automática"
                description="Envia mensagem de boas-vindas no primeiro contato"
                defaultChecked
              />
              <SwitchRow
                label="Confirmação de leitura"
                description="Envia tique azul duplo para os clientes"
                defaultChecked={false}
              />
            </div>
          </Card>

          {/* Ações */}
          <div className="flex flex-col gap-2">
            {status === "connected" ? (
              <>
                <Button variant="outline" onClick={onTest}>
                  <Sparkles />
                  Testar conexão
                </Button>
                <Button variant="outline" onClick={onReconnect}>
                  <RefreshCw />
                  Reconectar
                </Button>
                <Button
                  variant="ghost"
                  onClick={onDisconnect}
                  className="text-destructive hover:text-destructive"
                >
                  <Power />
                  Desconectar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onConnect}>
                  <Wifi />
                  {status === "connecting"
                    ? "Aguardando pareamento…"
                    : "Conectar agora"}
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Metric({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string
  value: string
  tone: "emerald" | "sky" | "violet"
  icon: React.ComponentType<{ className?: string }>
}) {
  const toneClass = {
    emerald:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    violet:
      "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  }[tone]
  return (
    <Card className="gap-0 p-3">
      <div className="flex items-center justify-between">
        <span className={cn("flex size-7 items-center justify-center rounded-md", toneClass)}>
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}

function SwitchRow({
  label,
  description,
  defaultChecked,
}: {
  label: string
  description: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = React.useState(!!defaultChecked)
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <SwitchFluid
        label={label}
        checked={checked}
        onToggle={() => setChecked((v) => !v)}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                          painel do contato (direita)                        */
/* -------------------------------------------------------------------------- */

function ContactDetailsPane({
  contact,
  open,
  onOpenChange,
}: {
  contact: Contact
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const tag = TAG_META[contact.tag]
  const channel = CHANNEL_META[contact.channel]
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[380px] gap-0 border-l border-border bg-card p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes do contato</SheetTitle>
        </SheetHeader>

        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Detalhes do contato
          </h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar detalhes"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="flex flex-col items-center gap-2 border-b border-border px-6 py-5 text-center">
          <ContactAvatarImage contact={contact} size={96} />
          <p className="truncate text-base font-semibold text-foreground">
            {contact.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{contact.phone}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <BadgeFluid color={tag.color} size="sm">
              {tag.label}
            </BadgeFluid>
            <BadgeFluid color="gray" size="sm">
              <span className={channel.color}>{channel.emoji}</span>{" "}
              {channel.label}
            </BadgeFluid>
          </div>
          {contact.location && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3" />
              {contact.location}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 text-sm">
          <DetailRow label="E-mail" value={`${contact.id}@aurora.tur.br`} />
          <DetailRow label="Telefone" value={contact.phone} />
          <DetailRow
            label="Última interação"
            value={`há ${contact.unread > 0 ? "poucos" : "alguns"} minutos`}
          />
          <DetailRow
            label="Total em reservas"
            value={
              contact.customerValue
                ? BRL.format(contact.customerValue)
                : "—"
            }
          />
        </div>

        <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Ações rápidas
          </p>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <CalendarDays className="size-4 text-muted-foreground" />
            Criar reserva
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <CreditCard className="size-4 text-muted-foreground" />
            Gerar link de pagamento
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <Star className="size-4 text-muted-foreground" />
            Marcar como VIP
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <Briefcase className="size-4 text-muted-foreground" />
            Mover no pipeline
          </button>
        </div>

        <div className="px-4 py-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Última reserva
          </p>
          {contact.customerValue ? (
            <Card className="gap-0 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    Lisboa · Réveillon 2026
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Saída 12/12 · 10 dias · 2 pax
                  </p>
                </div>
                <BadgeFluid color="green" size="sm">
                  Confirmada
                </BadgeFluid>
              </div>
            </Card>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nenhuma reserva ainda — este contato é lead.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* -------------------------------------------------------------------------- */
/*                              helpers puros                                 */
/* -------------------------------------------------------------------------- */

function filterConversations(
  list: Contact[],
  tab: FilterTab,
  query: string
): Contact[] {
  const q = query.trim().toLowerCase()
  return list
    .filter((c) => {
      if (tab === "nao-lidas" && c.unread === 0) return false
      if (tab === "aguardando" && !["reserva", "pagamento"].includes(c.tag))
        return false
      if (tab === "finalizadas" && c.tag !== "vip") return false
      if (q) {
        const hay = `${c.name} ${c.phone} ${c.location ?? ""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return 0
    })
}

/**
 * Hook leve que devolve o "snippet" da última mensagem por contato —
 * usado pela lista. Mantido fora do render para não rebuildar a cada
 * tick do typing indicator.
 */
function useLastMessageByContact() {
  return React.useMemo(() => {
    const map: Record<
      string,
      { text: string; time: string; previewPrefix?: React.ReactNode }
    > = {}
    for (const c of CONTACTS) {
      const thread = THREADS[c.id] ?? []
      const last = thread[thread.length - 1]
      if (!last) {
        map[c.id] = { text: "Sem mensagens ainda", time: "" }
        continue
      }
      const prefix =
        last.kind === "image" ? (
          <ImageIcon className="size-3 shrink-0" />
        ) : last.kind === "audio" ? (
          <Mic className="size-3 shrink-0" />
        ) : last.kind === "document" ? (
          <FileIcon className="size-3 shrink-0" />
        ) : last.kind === "location" ? (
          <MapPin className="size-3 shrink-0" />
        ) : null
      map[c.id] = { text: last.text ?? "(anexo)", time: last.time, previewPrefix: prefix }
    }
    return map
  }, [])
}

function groupMessagesByDay(
  messages: Message[]
): { day: DayKey; messages: Message[] }[] {
  const out: { day: DayKey; messages: Message[] }[] = []
  for (const m of messages) {
    const last = out[out.length - 1]
    if (!last || last.day !== m.day) {
      out.push({ day: m.day, messages: [m] })
    } else {
      last.messages.push(m)
    }
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSIÇÃO                                   */
/* -------------------------------------------------------------------------- */

export function VoaCrm() {
  const { resolvedTheme } = useTheme()
  const [nav, setNav] = React.useState<NavId>("conversas")
  const [contacts, setContacts] = React.useState<Contact[]>(CONTACTS)
  const [selectedId, setSelectedId] = React.useState<string>("marina")
  const [query, setQuery] = React.useState("")
  const [tab, setTab] = React.useState<FilterTab>("todas")
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [connPanelOpen, setConnPanelOpen] = React.useState(false)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [connStatus, setConnStatus] = React.useState<ConnStatus>("connected")
  const [connNumber] = React.useState("+55 11 4040-2525")
  const [connName] = React.useState("Aurora Viagens")
  const [typingContact, setTypingContact] = React.useState<string | null>(null)
  const typingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = React.useRef(1000)

  const selected = contacts.find((c) => c.id === selectedId) ?? contacts[0]
  const thread = THREADS[selected.id] ?? []

  React.useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [])

  function selectContact(id: string) {
    setSelectedId(id)
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    idRef.current += 1
    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    const newMsg: Message = {
      id: `m-${idRef.current}`,
      from: "me",
      kind: "text",
      text: trimmed,
      time,
      ticks: "sent",
      day: "hoje",
    }
    THREADS[selected.id] = [...(THREADS[selected.id] ?? []), newMsg]
    // força re-render
    setContacts((prev) => [...prev])

    // ciclo de ticks: enviada → entregue → lida
    setTimeout(() => {
      const t = THREADS[selected.id]
      const idx = t.findIndex((m) => m.id === newMsg.id)
      if (idx >= 0) t[idx] = { ...t[idx], ticks: "delivered" }
      setContacts((prev) => [...prev])
    }, 500)
    setTimeout(() => {
      const t = THREADS[selected.id]
      const idx = t.findIndex((m) => m.id === newMsg.id)
      if (idx >= 0) t[idx] = { ...t[idx], ticks: "read" }
      setContacts((prev) => [...prev])
    }, 1500)

    // resposta automática após um pequeno delay
    if (typingTimer.current) clearTimeout(typingTimer.current)
    setTypingContact(selected.id)
    typingTimer.current = setTimeout(() => {
      const reply = AUTO_REPLY[selected.id] ?? "Beleza, anotado!"
      idRef.current += 1
      const replyMsg: Message = {
        id: `m-${idRef.current}`,
        from: "them",
        kind: "text",
        text: reply,
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        day: "hoje",
      }
      THREADS[selected.id] = [...(THREADS[selected.id] ?? []), replyMsg]
      setTypingContact(null)
      setContacts((prev) => [...prev])
    }, 1600)
  }

  function handleConnect() {
    setConnStatus("connecting")
    toast.info("Aguardando pareamento…", {
      description: "Escaneie o QR Code com seu WhatsApp Business.",
    })
    setTimeout(() => {
      setConnStatus("connected")
      toast.success("WhatsApp Business conectado!", {
        description: `${connName} · ${connNumber}`,
      })
    }, 2200)
  }

  function handleDisconnect() {
    setConnStatus("disconnected")
    toast("Conexão encerrada", {
      description: "As mensagens recebidas ficarão em fila.",
    })
  }

  function handleReconnect() {
    setConnStatus("connecting")
    setTimeout(() => {
      setConnStatus("connected")
      toast.success("Reconectado", {
        description: "Mensagens sincronizadas.",
      })
    }, 1800)
  }

  function handleTest() {
    toast.success("Conexão OK", {
      description: "Mensagem de teste enviada e recebida em 312ms.",
    })
  }

  const totalUnread = contacts.reduce((acc, c) => acc + c.unread, 0)

  return (
    <div
      data-slot="voa-crm"
      className="flex h-[78vh] w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <AppSidebar
        active={nav}
        onSelect={(id) => {
          setNav(id)
          if (id === "conexão" as NavId) setConnPanelOpen(true)
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
        connStatus={connStatus}
        connNumber={connNumber}
        onOpenWhatsapp={() => setConnPanelOpen(true)}
      />

      {nav === "conversas" ? (
        <>
          <ConversationList
            contacts={contacts}
            selectedId={selected.id}
            query={query}
            onQueryChange={setQuery}
            tab={tab}
            onTabChange={setTab}
            onSelect={selectContact}
          />
          <ChatThread
            contact={selected}
            thread={thread}
            isTyping={typingContact === selected.id}
            onSend={sendMessage}
            onOpenWhatsapp={() => setConnPanelOpen(true)}
          />
        </>
      ) : (
        <GenericSection
          nav={nav}
          totalUnread={totalUnread}
        />
      )}

      {/* Painel de conexão WhatsApp (Sheet lateral direita) */}
      <WhatsAppConnectionPanel
        open={connPanelOpen}
        onOpenChange={setConnPanelOpen}
        status={connStatus}
        number={connNumber}
        businessName={connName}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onReconnect={handleReconnect}
        onTest={handleTest}
      />

      {/* Detalhes do contato (Sheet lateral direita) */}
      <ContactDetailsPane
        contact={selected}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                       placeholder de outras seções                          */
/* -------------------------------------------------------------------------- */

function GenericSection({
  nav,
  totalUnread,
}: {
  nav: NavId
  totalUnread: number
}) {
  const titles: Record<NavId, string> = {
    conversas: "Conversas",
    contatos: "Contatos",
    pipeline: "Pipeline de vendas",
    campanhas: "Campanhas",
    templates: "Templates de mensagem",
    automacao: "Automação",
    relatorios: "Relatórios",
    configuracoes: "Configurações",
  }
  const descriptions: Record<NavId, string> = {
    conversas:
      "Atendimento multicanal com WhatsApp Business no centro da operação.",
    contatos:
      "Base unificada de clientes e leads, segmentada por tag e valor.",
    pipeline:
      "Funil de vendas com estágios de reserva, pagamento e pós-venda.",
    campanhas:
      "Disparos em massa via WhatsApp, e-mail e SMS com ROI mensurável.",
    templates:
      "Mensagens-modelo aprovadas pelo WhatsApp para envio rápido.",
    automacao:
      "Fluxos automatizados para follow-up, lembretes e nutrição de leads.",
    relatorios:
      "Métricas de atendimento, conversão e performance do time.",
    configuracoes:
      "Preferências da conta, integrações e gestão de equipe.",
  }
  return (
    <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 bg-background p-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="size-6" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {titles[nav]}
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {descriptions[nav]}
        </p>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Esta seção é uma vitrine do painel lateral — volte para
        <strong className="px-1 font-medium text-foreground">
          Conversas
        </strong>
        pra ver o atendimento WhatsApp em ação.
      </p>
      <BadgeFluid color="gray" size="sm" className="tabular-nums">
        {totalUnread} mensagens não lidas no inbox
      </BadgeFluid>
    </section>
  )
}