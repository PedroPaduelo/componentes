/**
 * Seções do VoaCRM — conteúdo completo das 7 abas de navegação (Contatos,
 * Pipeline, Campanhas, Templates, Automação, Relatórios, Configurações).
 *
 * Cada seção tem estado real (useState) e é interativa de verdade — não
 * são telas placeholder. Compartilham os mesmos componentes do barrel
 * (`@/components/ui`) e o styling já estabelecido pela seção "Conversas".
 */
import * as React from "react"
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Edit3,
  Filter,
  Globe,
  Hash,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  PiggyBank,
  Plane,
  Plus,
  Rocket,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Variable,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react"

import {
  Card,
  Button,
  BadgeFluid,
  Input,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  SwitchFluid,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Toaster,
} from "@/components/ui"
import type { BadgeColor } from "@/components/ui"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                  modelo                                    */
/* -------------------------------------------------------------------------- */

export type SectionId =
  | "conversas"
  | "contatos"
  | "pipeline"
  | "campanhas"
  | "templates"
  | "automacao"
  | "relatorios"
  | "configuracoes"

export type ContactTag = "reserva" | "pagamento" | "suporte" | "vip" | "lead"
export type PipelineStage =
  | "novo-lead"
  | "em-negociacao"
  | "cotacao-enviada"
  | "aguardando-pagamento"
  | "fechado"
export type ChannelKind = "email" | "whatsapp" | "sms"

interface ContactRow {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  tag: ContactTag
  channel: "WhatsApp" | "Instagram" | "Facebook"
  origin: "Orgânico" | "Instagram Ads" | "Indicação" | "Google Ads" | "Walk-in"
  totalSpent: number
  lastTrip: string | null
  initials: string
  avatarClass: string
}

interface PipelineDeal {
  id: string
  contactId: string
  title: string
  destination: string
  pax: number
  value: number
  stage: PipelineStage
  ownerInitials: string
  ownerClass: string
  expectedClose: string
}

interface Campaign {
  id: string
  name: string
  channel: ChannelKind
  status: "ativa" | "pausada" | "agendada" | "finalizada"
  audience: number
  reach: number
  sent: number
  conversions: number
  revenue: number
  budget: number
  startDate: string
  endDate: string
  ctr: number
}

interface MessageTemplate {
  id: string
  category: "Reserva" | "Pós-venda" | "Suporte" | "Promo" | "Confirmação" | "Pagamento"
  title: string
  body: string
  language: "pt-BR" | "en" | "es"
  status: "aprovado" | "pendente" | "rejeitado"
  variables: string[]
  channel: "WhatsApp" | "SMS"
  uses: number
  lastUsed: string | null
}

interface AutomationFlow {
  id: string
  name: string
  trigger: string
  active: boolean
  enrolled: number
  converted: number
  steps: { kind: "action" | "condition" | "wait"; label: string }[]
}

interface TeamMember {
  id: string
  name: string
  role: "Agente" | "Supervisor" | "Admin"
  status: "online" | "ausente" | "offline"
  conversations: number
  rating: number
  initials: string
  avatarClass: string
}

const TAG_META: Record<ContactTag, { label: string; color: BadgeColor }> = {
  reserva: { label: "Reserva", color: "blue" },
  pagamento: { label: "Pagamento", color: "amber" },
  suporte: { label: "Suporte", color: "violet" },
  vip: { label: "VIP", color: "green" },
  lead: { label: "Lead", color: "gray" },
}

const STAGE_META: Record<PipelineStage, { label: string; accent: string }> = {
  "novo-lead": { label: "Novo lead", accent: "bg-slate-500" },
  "em-negociacao": { label: "Em negociação", accent: "bg-blue-500" },
  "cotacao-enviada": { label: "Cotação enviada", accent: "bg-violet-500" },
  "aguardando-pagamento": { label: "Aguardando pgto.", accent: "bg-amber-500" },
  fechado: { label: "Fechado", accent: "bg-emerald-500" },
}
const STAGE_ORDER: PipelineStage[] = [
  "novo-lead",
  "em-negociacao",
  "cotacao-enviada",
  "aguardando-pagamento",
  "fechado",
]

const CHANNEL_META: Record<ChannelKind, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  email: { label: "E-mail", icon: Mail, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  sms: { label: "SMS", icon: Phone, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
const BRL_CENT = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })
const COMPACT = new Intl.NumberFormat("pt-BR", { notation: "compact" })

/* -------------------------------------------------------------------------- */
/*                                  seed                                      */
/* -------------------------------------------------------------------------- */

const CONTACTS: ContactRow[] = [
  { id: "marina", name: "Marina Albuquerque", email: "marina.alb@example.com", phone: "+55 48 99812-4421", city: "Florianópolis", state: "SC", tag: "vip", channel: "WhatsApp", origin: "Indicação", totalSpent: 47800, lastTrip: "Lisboa · Jun/26", initials: "MA", avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  { id: "renato", name: "Renato Pacheco", email: "renato.p@example.com", phone: "+55 41 99745-1102", city: "Curitiba", state: "PR", tag: "reserva", channel: "WhatsApp", origin: "Orgânico", totalSpent: 18250, lastTrip: "Cancún · Mar/26", initials: "RP", avatarClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  { id: "beatriz", name: "Beatriz Lemos", email: "bia.lemos@example.com", phone: "+55 31 98230-0921", city: "Belo Horizonte", state: "MG", tag: "pagamento", channel: "WhatsApp", origin: "Instagram Ads", totalSpent: 9640, lastTrip: "Fernando de Noronha · Fev/26", initials: "BL", avatarClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  { id: "tiago", name: "Tiago Vasconcelos", email: "tiago.vc@example.com", phone: "+55 81 98911-7740", city: "Recife", state: "PE", tag: "lead", channel: "Instagram", origin: "Instagram Ads", totalSpent: 0, lastTrip: null, initials: "TV", avatarClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  { id: "camila", name: "Camila Rocha", email: "camila.r@example.com", phone: "+55 51 99872-2244", city: "Porto Alegre", state: "RS", tag: "reserva", channel: "Instagram", origin: "Instagram Ads", totalSpent: 0, lastTrip: null, initials: "CR", avatarClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400" },
  { id: "pedro", name: "Pedro Henrique Sales", email: "pedro.hs@example.com", phone: "+55 11 98123-9090", city: "São Paulo", state: "SP", tag: "suporte", channel: "WhatsApp", origin: "Google Ads", totalSpent: 2300, lastTrip: "Maragogi · Nov/25", initials: "PS", avatarClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  { id: "gustavo", name: "Gustavo Bertelli", email: "gustavo.b@example.com", phone: "+55 19 98765-3322", city: "Campinas", state: "SP", tag: "vip", channel: "WhatsApp", origin: "Indicação", totalSpent: 62100, lastTrip: "Tóquio · Mai/26", initials: "GB", avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  { id: "livia", name: "Lívia Mendonça", email: "livia.m@example.com", phone: "+55 71 98890-2211", city: "Salvador", state: "BA", tag: "lead", channel: "WhatsApp", origin: "Orgânico", totalSpent: 0, lastTrip: null, initials: "LM", avatarClass: "bg-teal-500/15 text-teal-700 dark:text-teal-400" },
  { id: "rafael", name: "Rafael Quintela", email: "rafael.q@example.com", phone: "+55 11 99002-1133", city: "São Paulo", state: "SP", tag: "vip", channel: "WhatsApp", origin: "Indicação", totalSpent: 38450, lastTrip: "Mendoza · Abr/26", initials: "RQ", avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  { id: "juliana", name: "Juliana Ferraz", email: "juliana.f@example.com", phone: "+55 11 99331-2266", city: "Ribeirão Preto", state: "SP", tag: "reserva", channel: "WhatsApp", origin: "Google Ads", totalSpent: 11200, lastTrip: "Caldas Novas · Mar/26", initials: "JF", avatarClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  { id: "marcelo", name: "Marcelo Tuma", email: "marcelo.t@example.com", phone: "+55 92 98554-7788", city: "Manaus", state: "AM", tag: "pagamento", channel: "WhatsApp", origin: "Orgânico", totalSpent: 6890, lastTrip: "Salvador · Jan/26", initials: "MT", avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  { id: "natalia", name: "Natália Bernardes", email: "natalia.b@example.com", phone: "+55 61 99220-9988", city: "Brasília", state: "DF", tag: "lead", channel: "Facebook", origin: "Orgânico", totalSpent: 0, lastTrip: null, initials: "NB", avatarClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
]

const DEALS: PipelineDeal[] = [
  { id: "d1", contactId: "tiago", title: "Pacote Maceió · All inclusive", destination: "Maceió, BR", pax: 2, value: 5400, stage: "novo-lead", ownerInitials: "AL", ownerClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400", expectedClose: "20/07" },
  { id: "d2", contactId: "camila", title: "Bariloche · Inverno 2026", destination: "Bariloche, AR", pax: 2, value: 8200, stage: "novo-lead", ownerInitials: "BS", ownerClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400", expectedClose: "10/07" },
  { id: "d3", contactId: "livia", title: "Lua de mel · Maldivas", destination: "Malé, MV", pax: 2, value: 32600, stage: "novo-lead", ownerInitials: "DN", ownerClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400", expectedClose: "15/09" },
  { id: "d4", contactId: "pedro", title: "Europa 12 dias · SP outbound", destination: "Roma, IT", pax: 4, value: 14800, stage: "em-negociacao", ownerInitials: "CR", ownerClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", expectedClose: "25/08" },
  { id: "d5", contactId: "natalia", title: "Chapada dos Veadeiros · Final de semana", destination: "Alto Paraíso, BR", pax: 3, value: 3200, stage: "em-negociacao", ownerInitials: "AL", ownerClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400", expectedClose: "05/07" },
  { id: "d6", contactId: "beatriz", title: "Patagônia · Trekking", destination: "El Calafate, AR", pax: 2, value: 14800, stage: "cotacao-enviada", ownerInitials: "DN", ownerClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400", expectedClose: "30/06" },
  { id: "d7", contactId: "juliana", title: "Caldas Novas · Resort 4★", destination: "Caldas Novas, BR", pax: 4, value: 7800, stage: "cotacao-enviada", ownerInitials: "BS", ownerClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400", expectedClose: "12/07" },
  { id: "d8", contactId: "marcelo", title: "Réveillon Manaus · Resort", destination: "Manaus, BR", pax: 2, value: 5900, stage: "aguardando-pagamento", ownerInitials: "CR", ownerClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", expectedClose: "28/06" },
  { id: "d9", contactId: "renato", title: "Cancún · Resort 5★", destination: "Cancún, MX", pax: 4, value: 22600, stage: "fechado", ownerInitials: "BS", ownerClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400", expectedClose: "—" },
  { id: "d10", contactId: "marina", title: "Lisboa · Réveillon 2026", destination: "Lisboa, PT", pax: 2, value: 18900, stage: "fechado", ownerInitials: "CR", ownerClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", expectedClose: "—" },
  { id: "d11", contactId: "gustavo", title: "Tóquio + Kyoto · 12 dias", destination: "Tóquio, JP", pax: 3, value: 41200, stage: "fechado", ownerInitials: "AL", ownerClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400", expectedClose: "—" },
  { id: "d12", contactId: "rafael", title: "Mendoza · Vinícolas premium", destination: "Mendoza, AR", pax: 2, value: 14600, stage: "fechado", ownerInitials: "DN", ownerClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400", expectedClose: "—" },
]

const CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Réveillon na Europa 2026", channel: "whatsapp", status: "ativa", audience: 18420, reach: 12480, sent: 12103, conversions: 187, revenue: 894300, budget: 4500, startDate: "01/06/2026", endDate: "30/09/2026", ctr: 12.4 },
  { id: "c2", name: "Pacote All Inclusive BR", channel: "whatsapp", status: "ativa", audience: 9120, reach: 6230, sent: 5990, conversions: 92, revenue: 478400, budget: 1800, startDate: "15/05/2026", endDate: "15/08/2026", ctr: 9.8 },
  { id: "c3", name: "Inverno Argentina 2026", channel: "email", status: "pausada", audience: 42100, reach: 38120, sent: 38120, conversions: 54, revenue: 189200, budget: 6200, startDate: "01/04/2026", endDate: "30/09/2026", ctr: 4.2 },
  { id: "c4", name: "Lua de mel · Destaque", channel: "whatsapp", status: "ativa", audience: 4280, reach: 3210, sent: 3190, conversions: 41, revenue: 218900, budget: 900, startDate: "20/05/2026", endDate: "20/08/2026", ctr: 14.6 },
  { id: "c5", name: "Black Friday · Passagens", channel: "email", status: "agendada", audience: 38000, reach: 0, sent: 0, conversions: 0, revenue: 0, budget: 3200, startDate: "10/11/2026", endDate: "30/11/2026", ctr: 0 },
  { id: "c6", name: "Carnaval · Nordeste", channel: "sms", status: "finalizada", audience: 14820, reach: 14012, sent: 14012, conversions: 68, revenue: 312400, budget: 1200, startDate: "15/01/2026", endDate: "28/02/2026", ctr: 6.1 },
]

const TEMPLATES: MessageTemplate[] = [
  {
    id: "t1", category: "Reserva", title: "Boas-vindas novo cliente",
    body: "Olá {{nome}}! 👋 Sou {{agente}} da Aurora Viagens. Vi que você se interessou por {{destino}}. Posso te mandar uma proposta personalizada?",
    language: "pt-BR", status: "aprovado",
    variables: ["nome", "agente", "destino"],
    channel: "WhatsApp", uses: 234, lastUsed: "Há 2 horas",
  },
  {
    id: "t2", category: "Reserva", title: "Cotação enviada",
    body: "{{nome}}, segue a proposta para {{destino}} (saída {{data}}, {{pax}} pessoas). Total: {{valor}}. Válido até {{validade}}. Posso ajudar em algo?",
    language: "pt-BR", status: "aprovado",
    variables: ["nome", "destino", "data", "pax", "valor", "validade"],
    channel: "WhatsApp", uses: 612, lastUsed: "Há 15 minutos",
  },
  {
    id: "t3", category: "Confirmação", title: "Reserva confirmada",
    body: "🎉 {{nome}}, sua reserva para {{destino}} está CONFIRMADA! Saída {{data}}, voucher enviado em anexo. Qualquer dúvida estou por aqui. Boa viagem! ✈️",
    language: "pt-BR", status: "aprovado",
    variables: ["nome", "destino", "data"],
    channel: "WhatsApp", uses: 489, lastUsed: "Hoje",
  },
  {
    id: "t4", category: "Pagamento", title: "Lembrete de pagamento",
    body: "{{nome}}, o boleto da sua reserva ({{valor}}) vence em {{dias}} dias. Link para pagar: {{link}}. Dúvidas? É só responder aqui.",
    language: "pt-BR", status: "aprovado",
    variables: ["nome", "valor", "dias", "link"],
    channel: "WhatsApp", uses: 178, lastUsed: "Há 4 horas",
  },
  {
    id: "t5", category: "Pós-venda", title: "Pós-viagem (feedback)",
    body: "Oi {{nome}}! Que bom ter você de volta. Como foi sua viagem para {{destino}}? Sua opinião é muito importante — pode avaliar aqui: {{link}}",
    language: "pt-BR", status: "aprovado",
    variables: ["nome", "destino", "link"],
    channel: "WhatsApp", uses: 312, lastUsed: "Ontem",
  },
  {
    id: "t6", category: "Suporte", title: "Reagendamento",
    body: "{{nome}}, vou te ajudar a reagendar. Me conta: 1) Qual a data ideal? 2) Mantém o mesmo destino ou quer trocar? Assim já puxo as opções certas.",
    language: "pt-BR", status: "aprovado",
    variables: ["nome"],
    channel: "WhatsApp", uses: 87, lastUsed: "Há 1 dia",
  },
  {
    id: "t7", category: "Promo", title: "Oferta relâmpago",
    body: "⚡ {{nome}}, oportunidade única: {{destino}} a partir de {{valor}} — só até {{validade}}. Posso reservar pra você agora?",
    language: "pt-BR", status: "pendente",
    variables: ["nome", "destino", "valor", "validade"],
    channel: "WhatsApp", uses: 0, lastUsed: null,
  },
  {
    id: "t8", category: "Suporte", title: "Reembolso solicitado",
    body: "{{nome}}, recebemos seu pedido de reembolso ({{valor}}). Análise em até {{prazo}} dias úteis. Protocolo: {{protocolo}}.",
    language: "pt-BR", status: "aprovado",
    variables: ["nome", "valor", "prazo", "protocolo"],
    channel: "WhatsApp", uses: 42, lastUsed: "Há 2 dias",
  },
  {
    id: "t9", category: "Confirmação", title: "Documentos pendentes",
    body: "{{nome}}, falta pouco! Para finalizar sua reserva de {{destino}}, envie: RG/Passaporte + comprovante de residência. Link seguro: {{link}}",
    language: "pt-BR", status: "aprovado",
    variables: ["nome", "destino", "link"],
    channel: "WhatsApp", uses: 156, lastUsed: "Há 3 horas",
  },
]

const FLOWS: AutomationFlow[] = [
  {
    id: "f1",
    name: "Boas-vindas Lead",
    trigger: "Quando alguém envia a primeira mensagem",
    active: true, enrolled: 1247, converted: 312,
    steps: [
      { kind: "action", label: "Enviar template 'Boas-vindas'" },
      { kind: "wait", label: "Aguardar 24h sem resposta" },
      { kind: "condition", label: "Respondeu?" },
      { kind: "action", label: "Tag 'lead-engajado'" },
    ],
  },
  {
    id: "f2",
    name: "Follow-up cotação",
    trigger: "Após envio de proposta",
    active: true, enrolled: 612, converted: 187,
    steps: [
      { kind: "wait", label: "Aguardar 3 dias" },
      { kind: "action", label: "Enviar template 'Lembrete cotação'" },
      { kind: "wait", label: "Aguardar 2 dias" },
      { kind: "action", label: "Notificar supervisor" },
    ],
  },
  {
    id: "f3",
    name: "Pós-viagem feedback",
    trigger: "Data de retorno da viagem",
    active: true, enrolled: 384, converted: 298,
    steps: [
      { kind: "wait", label: "Aguardar 1 dia após retorno" },
      { kind: "action", label: "Enviar template 'Pós-viagem'" },
    ],
  },
  {
    id: "f4",
    name: "Aniversariantes do mês",
    trigger: "Aniversário do cliente no mês corrente",
    active: false, enrolled: 0, converted: 0,
    steps: [
      { kind: "action", label: "Enviar cupom R$200" },
    ],
  },
  {
    id: "f5",
    name: "Recuperação de lead frio",
    trigger: "Lead sem interação por 30 dias",
    active: true, enrolled: 89, converted: 12,
    steps: [
      { kind: "action", label: "Enviar oferta personalizada" },
      { kind: "wait", label: "Aguardar 7 dias" },
      { kind: "action", label: "Tag 'lead-frio'" },
    ],
  },
]

const TEAM: TeamMember[] = [
  { id: "t1", name: "Ana Lima", role: "Supervisor", status: "online", conversations: 23, rating: 4.9, initials: "AL", avatarClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400" },
  { id: "t2", name: "Bruno Sá", role: "Agente", status: "online", conversations: 18, rating: 4.7, initials: "BS", avatarClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  { id: "t3", name: "Carla Reis", role: "Agente", status: "ausente", conversations: 12, rating: 4.8, initials: "CR", avatarClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  { id: "t4", name: "Diego Nunes", role: "Agente", status: "online", conversations: 21, rating: 4.6, initials: "DN", avatarClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  { id: "t5", name: "Erika Tanaka", role: "Admin", status: "offline", conversations: 0, rating: 5.0, initials: "ET", avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
]

/* -------------------------------------------------------------------------- */
/*                             helpers compartilhados                          */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-4">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  )
}

function MiniMetric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: "emerald" | "sky" | "violet" | "amber"
}) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  }
  return (
    <Card className="gap-0 p-3.5">
      <div className="flex items-center justify-between">
        <span className={cn("flex size-7 items-center justify-center rounded-md", tones[tone])}>
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

function PageSubheader({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3">
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                CONTATOS                                     */
/* -------------------------------------------------------------------------- */

type ContactFilter = "all" | ContactTag

export function ContatosSection() {
  const { resolvedTheme } = useTheme()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<ContactFilter>("all")
  const [originFilter, setOriginFilter] = React.useState<string>("all")
  const [contacts, setContacts] = React.useState<ContactRow[]>(CONTACTS)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = React.useState<"name" | "spent" | "lastTrip">("spent")
  const [newOpen, setNewOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = contacts.filter((c) => {
      if (filter !== "all" && c.tag !== filter) return false
      if (originFilter !== "all" && c.origin !== originFilter) return false
      if (q) {
        const hay = `${c.name} ${c.email} ${c.phone} ${c.city} ${c.state}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name)
      if (sortKey === "spent") return b.totalSpent - a.totalSpent
      return (b.lastTrip ?? "").localeCompare(a.lastTrip ?? "")
    })
    return list
  }, [contacts, query, filter, originFilter, sortKey])

  const counts = React.useMemo(() => {
    const c: Record<ContactFilter, number> = { all: contacts.length, lead: 0, prospect: 0, reserva: 0, pagamento: 0, suporte: 0, vip: 0 } as Record<ContactFilter, number>
    for (const cli of contacts) c[cli.tag] = (c[cli.tag] ?? 0) + 1
    return c
  }, [contacts])

  const origins = Array.from(new Set(contacts.map((c) => c.origin))).sort()

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function bulkTag(tag: ContactTag) {
    if (selected.size === 0) return
    setContacts((prev) =>
      prev.map((c) => (selected.has(c.id) ? { ...c, tag } : c))
    )
    setSelected(new Set())
  }

  function addContact(data: Omit<ContactRow, "id" | "initials" | "avatarClass" | "totalSpent" | "lastTrip">) {
    const id = `c${contacts.length + 1}-${Date.now()}`
    const initials = data.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    setContacts((prev) => [
      {
        ...data,
        id,
        initials,
        avatarClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
        totalSpent: 0,
        lastTrip: null,
      },
      ...prev,
    ])
    setNewOpen(false)
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      <SectionHeader
        title="Contatos"
        description={`${filtered.length} de ${contacts.length} contatos · ${selected.size} selecionados`}
        action={
          <>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1">
                <span className="text-xs text-muted-foreground">Marcar como:</span>
                {(Object.keys(TAG_META) as ContactTag[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => bulkTag(t)}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    {TAG_META[t].label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  aria-label="Limpar seleção"
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  limpar
                </button>
              </div>
            )}
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <UserPlus />
              Novo contato
            </Button>
          </>
        }
      />

      <PageSubheader>
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail, cidade…"
            className="pl-9"
            aria-label="Buscar contatos"
          />
        </div>

        <Select value={originFilter} onValueChange={setOriginFilter}>
          <SelectTrigger className="w-44" aria-label="Origem">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas origens</SelectItem>
            {origins.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(v) => setSortKey(v as typeof sortKey)}>
          <SelectTrigger className="w-44" aria-label="Ordenar por">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spent">Maior gasto</SelectItem>
            <SelectItem value="name">Nome (A-Z)</SelectItem>
            <SelectItem value="lastTrip">Última viagem</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-[11px] text-muted-foreground">
          Ordenado por {sortKey === "spent" ? "maior gasto" : sortKey === "name" ? "nome" : "última viagem"}
        </span>
      </PageSubheader>

      <div className="flex-1 overflow-auto px-6 pb-6">
        <Card className="gap-0 overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(filtered.map((c) => c.id)))
                      else setSelected(new Set())
                    }}
                    className="size-4 accent-primary"
                  />
                </th>
                <th className="px-4 py-2.5">Contato</th>
                <th className="px-4 py-2.5">Cidade</th>
                <th className="px-4 py-2.5">Origem</th>
                <th className="px-4 py-2.5">Canal</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Gasto total</th>
                <th className="px-4 py-2.5">Última viagem</th>
                <th className="w-10 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Nenhum contato neste filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const tag = TAG_META[c.tag]
                  const isSelected = selected.has(c.id)
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "border-b border-border/50 transition-colors last:border-b-0 hover:bg-accent/40",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Selecionar ${c.name}`}
                          checked={isSelected}
                          onChange={() => toggleSelect(c.id)}
                          className="size-4 accent-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex size-9 items-center justify-center rounded-full font-semibold", c.avatarClass)}>
                            {c.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{c.city}, {c.state}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.origin}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.channel}</td>
                      <td className="px-4 py-3">
                        <BadgeFluid color={tag.color} size="sm">{tag.label}</BadgeFluid>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                        {c.totalSpent > 0 ? BRL.format(c.totalSpent) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.lastTrip ?? "—"}</td>
                      <td className="px-3 py-3">
                        <Button variant="ghost" size="icon-xs" aria-label={`Mais ações de ${c.name}`}>
                          <MoreHorizontal />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["all", "lead", "reserva", "pagamento", "vip"] as ContactFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                filter === f ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent"
              )}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {f === "all" ? "Todos" : TAG_META[f].label}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{counts[f] ?? 0}</p>
            </button>
          ))}
        </div>
      </div>

      <NewContactDialog open={newOpen} onOpenChange={setNewOpen} onCreate={addContact} />
      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </section>
  )
}

function NewContactDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (c: Omit<ContactRow, "id" | "initials" | "avatarClass" | "totalSpent" | "lastTrip">) => void
}) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [city, setCity] = React.useState("")
  const [state, setState] = React.useState("SP")
  const [tag, setTag] = React.useState<ContactTag>("lead")
  const [channel, setChannel] = React.useState<"WhatsApp" | "Instagram" | "Facebook">("WhatsApp")

  function reset() {
    setName(""); setEmail(""); setPhone(""); setCity(""); setState("SP"); setTag("lead"); setChannel("WhatsApp")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      tag,
      channel,
      origin: "Orgânico",
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo contato</DialogTitle>
            <DialogDescription>Cadastro rápido. Você completa os detalhes depois.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="cc-name" className="text-sm font-medium text-foreground">Nome completo</label>
              <Input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Mariana Albuquerque" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label htmlFor="cc-city" className="text-sm font-medium text-foreground">Cidade</label>
                <Input id="cc-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Florianópolis" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cc-state" className="text-sm font-medium text-foreground">UF</label>
                <Input id="cc-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="cc-phone" className="text-sm font-medium text-foreground">Telefone (WhatsApp)</label>
              <Input id="cc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-9999" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="cc-email" className="text-sm font-medium text-foreground">E-mail</label>
              <Input id="cc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@email.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Canal</span>
                <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Tag</span>
                <Select value={tag} onValueChange={(v) => setTag(v as ContactTag)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TAG_META) as ContactTag[]).map((t) => (
                      <SelectItem key={t} value={t}>{TAG_META[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!name.trim()}>Cadastrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                PIPELINE                                     */
/* -------------------------------------------------------------------------- */

function PipelineCard({
  deal,
  onMove,
}: {
  deal: PipelineDeal
  onMove: (id: string, to: PipelineStage) => void
}) {
  const contact = CONTACTS.find((c) => c.id === deal.contactId)
  const moveTargets = STAGE_ORDER.filter((s) => s !== deal.stage)
  return (
    <Card className="group gap-0 rounded-lg border-border p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{deal.title}</p>
        <Select value={deal.stage} onValueChange={(v) => onMove(deal.id, v as PipelineStage)}>
          <SelectTrigger className="h-6 w-6 border-0 bg-transparent p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" aria-label="Mover deal">
            <ArrowRight className="size-3.5" />
          </SelectTrigger>
          <SelectContent>
            {moveTargets.map((s) => (
              <SelectItem key={s} value={s}>{STAGE_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Hash className="size-3" /> {deal.destination}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-base font-semibold tabular-nums text-foreground">{BRL.format(deal.value)}</span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="size-3" /> Fecha {deal.expectedClose}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("flex size-5 items-center justify-center rounded-full text-[9px] font-semibold", deal.ownerClass)}>
            {deal.ownerInitials}
          </div>
          <span className="text-[11px] text-muted-foreground">{contact?.name.split(" ")[0]}</span>
        </div>
        <BadgeFluid color="gray" size="sm" className="text-[10px]">{deal.pax} pax</BadgeFluid>
      </div>
    </Card>
  )
}

export function PipelineSection() {
  const [deals, setDeals] = React.useState<PipelineDeal[]>(DEALS)

  function moveDeal(id: string, to: PipelineStage) {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage: to } : d)))
  }

  const grouped = React.useMemo(() => {
    const m: Record<PipelineStage, PipelineDeal[]> = {
      "novo-lead": [], "em-negociacao": [], "cotacao-enviada": [], "aguardando-pagamento": [], "fechado": [],
    }
    for (const d of deals) m[d.stage].push(d)
    return m
  }, [deals])

  const totalsByStage = React.useMemo(() => {
    const t: Record<PipelineStage, number> = { "novo-lead": 0, "em-negociacao": 0, "cotacao-enviada": 0, "aguardando-pagamento": 0, "fechado": 0 }
    for (const d of deals) t[d.stage] += d.value
    return t
  }, [deals])

  const pipelineTotal = Object.values(totalsByStage).reduce((acc, v) => acc + v, 0)
  const weightedValue = totalsByStage["novo-lead"] * 0.1 + totalsByStage["em-negociacao"] * 0.3 + totalsByStage["cotacao-enviada"] * 0.5 + totalsByStage["aguardando-pagamento"] * 0.8

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      <SectionHeader
        title="Pipeline de vendas"
        description="Arraste cards entre colunas ou use o menu do card. Visão consolidada do funil."
        action={
          <>
            <Button size="sm" variant="outline"><Filter /> Filtros</Button>
            <Button size="sm"><Plus /> Novo deal</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 px-6 py-3 lg:grid-cols-4">
        <MiniMetric label="Pipeline aberto" value={BRL.format(pipelineTotal)} icon={PiggyBank} tone="emerald" />
        <MiniMetric label="Pipeline ponderado" value={BRL.format(weightedValue)} icon={Target} tone="sky" />
        <MiniMetric label="Taxa de conversão" value="27%" icon={TrendingUp} tone="violet" />
        <MiniMetric label="Ticket médio" value={BRL_CENT.format(weightedValue / Math.max(1, deals.length))} icon={BarChart3} tone="amber" />
      </div>

      <div className="flex flex-1 gap-3 overflow-x-auto px-6 pb-6">
        {STAGE_ORDER.map((stage) => {
          const items = grouped[stage]
          const meta = STAGE_META[stage]
          return (
            <div key={stage} className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/30">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", meta.accent)} aria-hidden />
                  <h3 className="text-sm font-semibold text-foreground">{meta.label}</h3>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length}</span>
                </div>
                <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{BRL.format(totalsByStage[stage])}</span>
              </div>
              <ScrollArea className="h-[480px] px-2.5 py-2.5">
                <div className="flex flex-col gap-2">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-10 text-center">
                      <Sparkles className="size-4 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground">Sem deals aqui</p>
                    </div>
                  ) : (
                    items.map((d) => <PipelineCard key={d.id} deal={d} onMove={moveDeal} />)
                  )}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                               CAMPANHAS                                     */
/* -------------------------------------------------------------------------- */

export function CampanhasSection() {
  const { resolvedTheme } = useTheme()
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(CAMPAIGNS)
  const [channelFilter, setChannelFilter] = React.useState<"all" | ChannelKind>("all")

  const filtered = React.useMemo(() => {
    return campaigns.filter((c) => channelFilter === "all" || c.channel === channelFilter)
  }, [campaigns, channelFilter])

  function toggleStatus(id: string) {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "ativa" ? "pausada" : c.status === "pausada" ? "ativa" : c.status } : c))
  }

  const totals = React.useMemo(() => {
    const t = { reach: 0, sent: 0, conversions: 0, revenue: 0, budget: 0 }
    for (const c of campaigns) {
      t.reach += c.reach
      t.sent += c.sent
      t.conversions += c.conversions
      t.revenue += c.revenue
      t.budget += c.budget
    }
    return t
  }, [campaigns])

  const statusMeta: Record<Campaign["status"], { label: string; color: BadgeColor }> = {
    ativa: { label: "Ativa", color: "green" },
    pausada: { label: "Pausada", color: "amber" },
    agendada: { label: "Agendada", color: "blue" },
    finalizada: { label: "Finalizada", color: "gray" },
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      <SectionHeader
        title="Campanhas"
        description={`${filtered.length} campanhas · ${totals.conversions} conversões · ${BRL.format(totals.revenue)} em receita`}
        action={
          <>
            <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as typeof channelFilter)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm"><Rocket /> Nova campanha</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 px-6 py-3 lg:grid-cols-5">
        <MiniMetric label="Alcance total" value={COMPACT.format(totals.reach)} icon={Users} tone="sky" />
        <MiniMetric label="Mensagens enviadas" value={COMPACT.format(totals.sent)} icon={Send} tone="violet" />
        <MiniMetric label="Conversões" value={COMPACT.format(totals.conversions)} icon={Target} tone="emerald" />
        <MiniMetric label="Receita gerada" value={BRL.format(totals.revenue)} icon={PiggyBank} tone="emerald" />
        <MiniMetric label="Investimento" value={BRL.format(totals.budget)} icon={CreditCard} tone="amber" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const channel = CHANNEL_META[c.channel]
          const ChannelIcon = channel.icon
          const sm = statusMeta[c.status]
          const isActive = c.status === "ativa"
          const roi = c.budget > 0 ? Math.round((c.revenue / c.budget) * 100) : 0
          return (
            <Card key={c.id} className="gap-0 p-5">
              <header className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-9 items-center justify-center rounded-lg", channel.color)}>
                    <ChannelIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{channel.label}</p>
                  </div>
                </div>
                <BadgeFluid color={sm.color} size="sm">{sm.label}</BadgeFluid>
              </header>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Field label="Período" value={`${c.startDate} – ${c.endDate}`} />
                <Field label="Público" value={COMPACT.format(c.audience)} />
                <Field label="Enviadas" value={COMPACT.format(c.sent)} />
                <Field label="Conversões" value={COMPACT.format(c.conversions)} />
                <Field label="CTR" value={`${c.ctr}%`} />
                <Field label="ROI" value={`${roi}%`} tone={roi > 200 ? "emerald" : roi > 100 ? "sky" : "amber"} />
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Receita</span>
                  <span className="text-base font-semibold tabular-nums text-foreground">{BRL.format(c.revenue)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">Orçamento: {BRL.format(c.budget)}</span>
                  {(isActive || c.status === "pausada") && (
                    <Button variant={isActive ? "ghost" : "outline"} size="sm" onClick={() => toggleStatus(c.id)}>
                      {isActive ? "Pausar" : "Retomar"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </section>
  )
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "emerald" | "sky" | "amber" }) {
  const toneClass = tone === "emerald" ? "text-emerald-600 dark:text-emerald-400"
    : tone === "sky" ? "text-sky-600 dark:text-sky-400"
    : tone === "amber" ? "text-amber-600 dark:text-amber-400"
    : "text-foreground"
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-medium tabular-nums", toneClass)}>{value}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                TEMPLATES                                    */
/* -------------------------------------------------------------------------- */

const TEMPLATE_CATEGORY_META: Record<MessageTemplate["category"], { color: BadgeColor }> = {
  Reserva: { color: "blue" },
  "Pós-venda": { color: "violet" },
  Suporte: { color: "amber" },
  Promo: { color: "green" },
  Confirmação: { color: "cyan" },
  Pagamento: { color: "amber" },
}

export function TemplatesSection() {
  const [templates, setTemplates] = React.useState<MessageTemplate[]>(TEMPLATES)
  const [category, setCategory] = React.useState<"all" | MessageTemplate["category"]>("all")
  const [selected, setSelected] = React.useState<MessageTemplate | null>(null)
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return templates.filter((t) => {
      if (category !== "all" && t.category !== category) return false
      if (q && !t.title.toLowerCase().includes(q) && !t.body.toLowerCase().includes(q)) return false
      return true
    })
  }, [templates, category, query])

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: templates.length }
    for (const t of templates) c[t.category] = (c[t.category] ?? 0) + 1
    return c
  }, [templates])

  const totalUses = templates.reduce((acc, t) => acc + t.uses, 0)
  const totalVars = templates.reduce((acc, t) => acc + t.variables.length, 0)

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      <SectionHeader
        title="Templates de mensagem"
        description={`${filtered.length} de ${templates.length} templates · ${totalUses} envios · ${totalVars} variáveis em uso`}
        action={
          <>
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar templates…" className="pl-9" />
            </div>
            <Button size="sm"><Plus /> Novo template</Button>
          </>
        }
      />

      <PageSubheader>
        <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)}>
          <TabsList>
            <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
            <TabsTrigger value="Reserva">Reserva ({counts.Reserva ?? 0})</TabsTrigger>
            <TabsTrigger value="Confirmação">Confirmação ({counts["Confirmação"] ?? 0})</TabsTrigger>
            <TabsTrigger value="Pagamento">Pagamento ({counts["Pagamento"] ?? 0})</TabsTrigger>
            <TabsTrigger value="Suporte">Suporte ({counts["Suporte"] ?? 0})</TabsTrigger>
            <TabsTrigger value="Pós-venda">Pós-venda ({counts["Pós-venda"] ?? 0})</TabsTrigger>
            <TabsTrigger value="Promo">Promo ({counts.Promo ?? 0})</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageSubheader>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => {
          const meta = TEMPLATE_CATEGORY_META[t.category]
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex w-full items-center justify-between">
                <BadgeFluid color={meta.color} size="sm">{t.category}</BadgeFluid>
                <BadgeFluid
                  color={t.status === "aprovado" ? "green" : t.status === "pendente" ? "amber" : "red"}
                  size="sm"
                >
                  {t.status === "aprovado" ? "Aprovado" : t.status === "pendente" ? "Pendente" : "Rejeitado"}
                </BadgeFluid>
              </div>
              <div className="w-full">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-border/50 pt-3">
                {t.variables.slice(0, 4).map((v) => (
                  <span key={v} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {`{{${v}}}`}
                  </span>
                ))}
                {t.variables.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{t.variables.length - 4}</span>
                )}
              </div>
              <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-3" /> {t.channel}
                </span>
                <span className="flex items-center gap-1 tabular-nums">
                  <Send className="size-3" /> {t.uses} envios · {t.lastUsed ?? "—"}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <TemplatePreviewDialog template={selected} onOpenChange={() => setSelected(null)} onToggleStatus={(id) => {
        setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "aprovado" ? "pendente" : "aprovado" } : t))
        if (selected?.id === id) setSelected({ ...selected, status: selected.status === "aprovado" ? "pendente" : "aprovado" })
      }} />
    </section>
  )
}

function TemplatePreviewDialog({
  template,
  onOpenChange,
  onToggleStatus,
}: {
  template: MessageTemplate | null
  onOpenChange: () => void
  onToggleStatus: (id: string) => void
}) {
  const isOpen = !!template
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {template && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BadgeFluid color={TEMPLATE_CATEGORY_META[template.category].color} size="sm">{template.category}</BadgeFluid>
                {template.title}
              </DialogTitle>
              <DialogDescription>
                Template {template.status === "aprovado" ? "aprovado pelo WhatsApp" : "aguardando aprovação"} · {template.language} · {template.channel}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Mensagem</p>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{template.body}</p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Variable className="size-3" /> Variáveis ({template.variables.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.variables.map((v) => (
                    <span key={v} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Usos</p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{template.uses}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Último uso</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground">{template.lastUsed ?? "Nunca"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                  <p className="mt-0.5">
                    <BadgeFluid color={template.status === "aprovado" ? "green" : "amber"} size="sm">
                      {template.status === "aprovado" ? "Aprovado" : "Pendente"}
                    </BadgeFluid>
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onOpenChange}>Fechar</Button>
              <Button variant="outline" onClick={() => onToggleStatus(template.id)}>
                {template.status === "aprovado" ? "Marcar pendente" : "Aprovar"}
              </Button>
              <Button>Enviar teste</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                AUTOMAÇÃO                                    */
/* -------------------------------------------------------------------------- */

const STEP_ICON: Record<AutomationFlow["steps"][0]["kind"], React.ComponentType<{ className?: string }>> = {
  action: Zap,
  condition: Workflow,
  wait: Clock,
}
const STEP_COLOR: Record<AutomationFlow["steps"][0]["kind"], string> = {
  action: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  condition: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  wait: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
}

export function AutomacaoSection() {
  const [flows, setFlows] = React.useState<AutomationFlow[]>(FLOWS)
  const [openFlow, setOpenFlow] = React.useState<AutomationFlow | null>(null)

  function toggleActive(id: string) {
    setFlows((prev) => prev.map((f) => f.id === id ? { ...f, active: !f.active } : f))
    if (openFlow?.id === id) setOpenFlow({ ...openFlow, active: !openFlow.active })
  }

  const totalEnrolled = flows.reduce((acc, f) => acc + f.enrolled, 0)
  const totalConverted = flows.reduce((acc, f) => acc + f.converted, 0)
  const activeCount = flows.filter((f) => f.active).length

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      <SectionHeader
        title="Automação"
        description={`${activeCount} fluxos ativos · ${totalEnrolled} contatos em fluxos · ${totalConverted} conversões automáticas`}
        action={<Button size="sm"><Plus /> Novo fluxo</Button>}
      />

      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {flows.map((f) => {
            const convRate = f.enrolled > 0 ? Math.round((f.converted / f.enrolled) * 100) : 0
            return (
              <Card key={f.id} className="gap-0 p-5">
                <header className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{f.name}</h3>
                      {f.active && <BadgeFluid color="green" size="sm">Ativo</BadgeFluid>}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{f.trigger}</p>
                  </div>
                  <SwitchFluid
                    label={f.name}
                    checked={f.active}
                    onToggle={() => toggleActive(f.id)}
                  />
                </header>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-md bg-muted/40 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Inscritos</p>
                    <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{f.enrolled}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Conversões</p>
                    <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{f.converted}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Taxa</p>
                    <p className="mt-0.5 text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{convRate}%</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Pipeline ({f.steps.length} passos)
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {f.steps.map((s, i) => {
                      const Icon = STEP_ICON[s.kind]
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", STEP_COLOR[s.kind])}>
                            <Icon className="size-3" />
                          </span>
                          <p className="text-xs text-foreground">{s.label}</p>
                          {i < f.steps.length - 1 && <ChevronRight className="size-3 text-muted-foreground/40" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground">Atualizado há 3 dias</span>
                  <Button variant="ghost" size="sm" onClick={() => setOpenFlow(f)}>
                    <Edit3 />
                    Ver detalhes
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Dialog open={!!openFlow} onOpenChange={() => setOpenFlow(null)}>
        <DialogContent className="sm:max-w-2xl">
          {openFlow && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="size-4 text-primary" />
                  {openFlow.name}
                </DialogTitle>
                <DialogDescription>
                  Gatilho: <strong>{openFlow.trigger}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md border border-border bg-card p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Inscritos</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{openFlow.enrolled}</p>
                  </div>
                  <div className="rounded-md border border-border bg-card p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Conversões</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{openFlow.converted}</p>
                  </div>
                  <div className="rounded-md border border-border bg-card p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Taxa</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {openFlow.enrolled > 0 ? Math.round((openFlow.converted / openFlow.enrolled) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-foreground">Pipeline do fluxo</p>
                  <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3">
                    {openFlow.steps.map((s, i) => {
                      const Icon = STEP_ICON[s.kind]
                      return (
                        <div key={i} className="flex items-center gap-2.5 rounded-md bg-card p-2.5">
                          <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", STEP_COLOR[s.kind])}>
                            <Icon className="size-3.5" />
                          </span>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Passo {i + 1} · {s.kind === "action" ? "Ação" : s.kind === "condition" ? "Condição" : "Espera"}
                            </p>
                            <p className="text-sm text-foreground">{s.label}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpenFlow(null)}>Fechar</Button>
                <Button variant="outline">Duplicar</Button>
                <Button>Editar fluxo</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                RELATÓRIOS                                   */
/* -------------------------------------------------------------------------- */

const AGENT_BARS = [
  { name: "Ana Lima", initials: "AL", value: 96, tone: "bg-rose-500", avatarClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400" },
  { name: "Bruno Sá", initials: "BS", value: 82, tone: "bg-blue-500", avatarClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  { name: "Carla Reis", initials: "CR", value: 78, tone: "bg-emerald-500", avatarClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  { name: "Diego Nunes", initials: "DN", value: 71, tone: "bg-violet-500", avatarClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  { name: "Erika Tanaka", initials: "ET", value: 64, tone: "bg-amber-500", avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
]

const FUNNEL = [
  { label: "Contatos alcançados", value: 12480, color: "bg-sky-500" },
  { label: "Engajaram", value: 6230, color: "bg-violet-500" },
  { label: "Solicitaram cotação", value: 1840, color: "bg-amber-500" },
  { label: "Cotação enviada", value: 1265, color: "bg-emerald-500" },
  { label: "Fecharam reserva", value: 312, color: "bg-pink-500" },
]

export function RelatoriosSection() {
  const [period, setPeriod] = React.useState<"7d" | "30d" | "90d" | "1y">("30d")

  const top = Math.max(...AGENT_BARS.map((a) => a.value))

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      <SectionHeader
        title="Relatórios"
        description="Visão consolidada da operação — atendimento, conversão, funil e equipe."
        action={
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList>
              <TabsTrigger value="7d">7 dias</TabsTrigger>
              <TabsTrigger value="30d">30 dias</TabsTrigger>
              <TabsTrigger value="90d">90 dias</TabsTrigger>
              <TabsTrigger value="1y">1 ano</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid grid-cols-2 gap-3 px-6 py-3 lg:grid-cols-4">
        <MiniMetric label="Msgs recebidas" value="3.847" icon={MessageSquare} tone="sky" />
        <MiniMetric label="TMA (tempo médio)" value="1:42" icon={Clock} tone="emerald" />
        <MiniMetric label="TMR (1ª resposta)" value="0:38" icon={Zap} tone="violet" />
        <MiniMetric label="CSAT" value="4.7 / 5.0" icon={Sparkles} tone="amber" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto px-6 pb-6 lg:grid-cols-2">
        {/* Desempenho por agente */}
        <Card className="gap-0 p-5">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Desempenho por agente</h3>
              <p className="text-xs text-muted-foreground">Conversas resolvidas (período)</p>
            </div>
            <BadgeFluid color="green" size="sm"><TrendingUp /> +18%</BadgeFluid>
          </header>
          <div className="flex flex-col gap-3">
            {AGENT_BARS.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <div className={cn("flex size-8 items-center justify-center rounded-full font-semibold", a.avatarClass)}>
                  {a.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{a.name}</span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{a.value}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", a.tone)} style={{ width: `${(a.value / top) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Funil de conversão */}
        <Card className="gap-0 p-5">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Funil de conversão</h3>
              <p className="text-xs text-muted-foreground">Da primeira mensagem à reserva fechada</p>
            </div>
            <BadgeFluid color="amber" size="sm"><Target /> 2.5% global</BadgeFluid>
          </header>
          <div className="flex flex-col gap-2.5">
            {FUNNEL.map((step, i) => {
              const pct = Math.round((step.value / FUNNEL[0].value) * 100)
              const prev = i > 0 ? FUNNEL[i - 1].value : step.value
              const dropRate = i > 0 ? Math.round(((prev - step.value) / prev) * 100) : 0
              return (
                <div key={step.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-foreground">{step.label}</span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="font-semibold text-foreground">{COMPACT.format(step.value)}</span>
                      <span className="text-muted-foreground">({pct}%)</span>
                      {dropRate > 0 && <span className="text-rose-600 dark:text-rose-400">−{dropRate}%</span>}
                    </span>
                  </div>
                  <div className="relative h-7 overflow-hidden rounded-md bg-muted">
                    <div
                      className={cn("absolute inset-y-0 left-0 rounded-md", step.color)}
                      style={{ width: `${pct}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Volume por dia da semana */}
        <Card className="gap-0 p-5">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Volume por dia da semana</h3>
              <p className="text-xs text-muted-foreground">Msgs recebidas nos últimos 30 dias</p>
            </div>
          </header>
          <div className="flex items-end justify-between gap-2">
            {[
              { d: "Seg", v: 184 }, { d: "Ter", v: 220 }, { d: "Qua", v: 256 },
              { d: "Qui", v: 312 }, { d: "Sex", v: 408 }, { d: "Sáb", v: 198 }, { d: "Dom", v: 142 },
            ].map((d) => {
              const max = 408
              return (
                <div key={d.d} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{d.v}</span>
                  <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
                    <div
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary to-violet-500"
                      style={{ height: `${(d.v / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">{d.d}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Tempo de resposta por canal */}
        <Card className="gap-0 p-5">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">TMR por canal</h3>
              <p className="text-xs text-muted-foreground">Tempo médio até a 1ª resposta</p>
            </div>
          </header>
          <div className="flex flex-col gap-3">
            {[
              { channel: "WhatsApp", value: 38, max: 120, icon: MessageSquare, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
              { channel: "Instagram", value: 92, max: 120, icon: ImageIcon, color: "bg-pink-500/10 text-pink-700 dark:text-pink-400" },
              { channel: "Facebook", value: 118, max: 120, icon: Globe, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
              { channel: "E-mail", value: 64, max: 120, icon: Mail, color: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
            ].map((row) => {
              const Icon = row.icon
              const min = row.max === 120 ? Math.floor(row.value / 60) : 0
              const sec = row.max === 120 ? row.value % 60 : row.value
              const label = row.max === 120 ? `${min}:${sec.toString().padStart(2, "0")}` : `${row.value}s`
              return (
                <div key={row.channel} className="flex items-center gap-3">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", row.color)}>
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{row.channel}</span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{label}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", row.color.replace("/10", ""))}
                        style={{ width: `${(row.value / row.max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                              CONFIGURAÇÕES                                  */
/* -------------------------------------------------------------------------- */

type SettingsTab = "equipe" | "horario" | "integracoes" | "faturamento" | "marca"

export function ConfiguracoesSection() {
  const [tab, setTab] = React.useState<SettingsTab>("equipe")
  const [team, setTeam] = React.useState<TeamMember[]>(TEAM)

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      <SectionHeader
        title="Configurações"
        description="Equipe, horários, integrações, faturamento e identidade visual."
      />

      <div className="flex min-h-0 flex-1">
        {/* Tabs verticais (sidebar interna) */}
        <aside className="w-56 shrink-0 border-r border-border bg-muted/20 px-3 py-4">
          <nav className="flex flex-col gap-0.5">
            {[
              { id: "equipe" as const, label: "Equipe", icon: Users },
              { id: "horario" as const, label: "Horário de atendimento", icon: Clock },
              { id: "integracoes" as const, label: "Integrações", icon: Webhook },
              { id: "faturamento" as const, label: "Faturamento", icon: CreditCard },
              { id: "marca" as const, label: "Identidade visual", icon: Sparkles },
            ].map((it) => {
              const Icon = it.icon
              const active = tab === it.id
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setTab(it.id)}
                  data-tab={it.id}
                  data-active={active ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{it.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 overflow-auto p-6">
          {tab === "equipe" && (
            <TeamTab team={team} setTeam={setTeam} />
          )}
          {tab === "horario" && <HorarioTab />}
          {tab === "integracoes" && <IntegracoesTab />}
          {tab === "faturamento" && <FaturamentoTab />}
          {tab === "marca" && <MarcaTab />}
        </div>
      </div>
    </section>
  )
}

function TeamTab({ team, setTeam }: { team: TeamMember[]; setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>> }) {
  const [inviteOpen, setInviteOpen] = React.useState(false)
  function toggleStatus(id: string) {
    setTeam((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status === "online" ? "offline" : "online" } : m))
  }
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Equipe</h3>
          <p className="text-xs text-muted-foreground">Gerencie agentes, supervisores e administradores.</p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}><UserPlus /> Convidar membro</Button>
      </header>

      <Card className="gap-0 overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Membro</th>
              <th className="px-4 py-2.5">Papel</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Conversas ativas</th>
              <th className="px-4 py-2.5 text-right">Avaliação</th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id} className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-accent/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("relative flex size-9 items-center justify-center rounded-full font-semibold", m.avatarClass)}>
                      {m.initials}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
                          m.status === "online" ? "bg-emerald-500" : m.status === "ausente" ? "bg-amber-500" : "bg-muted-foreground/40"
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[̀-ͯ]/g, "")}@aurora.tur.br</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <BadgeFluid color={m.role === "Admin" ? "violet" : m.role === "Supervisor" ? "blue" : "gray"} size="sm">{m.role}</BadgeFluid>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs capitalize text-muted-foreground">{m.status}</span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">{m.conversations}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Sparkles className="size-3 text-amber-500" />
                    <span className="text-sm font-semibold tabular-nums text-foreground">{m.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <Button variant="ghost" size="icon-xs" onClick={() => toggleStatus(m.id)} aria-label="Alternar status">
                    <CheckCircle2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar membro da equipe</DialogTitle>
            <DialogDescription>Enviaremos um e-mail de convite com link para configurar a senha.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="invite-email" className="text-sm font-medium text-foreground">E-mail</label>
              <Input id="invite-email" type="email" placeholder="novo.agente@aurora.tur.br" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="invite-role" className="text-sm font-medium text-foreground">Papel</label>
              <Select defaultValue="agente">
                <SelectTrigger id="invite-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agente">Agente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button onClick={() => setInviteOpen(false)}><Send /> Enviar convite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SwitchFluidRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <SwitchFluid label={label} checked={checked} onToggle={onToggle} />
    </div>
  )
}

function HorarioTab() {
  const [autoReply, setAutoReply] = React.useState(true)
  const days = [
    { d: "Segunda a sexta", enabled: true, start: "08:00", end: "20:00" },
    { d: "Sábado", enabled: true, start: "09:00", end: "14:00" },
    { d: "Domingo", enabled: false, start: "00:00", end: "00:00" },
  ]
  return (
    <div className="space-y-4">
      <header>
        <h3 className="text-sm font-semibold text-foreground">Horário de atendimento</h3>
        <p className="text-xs text-muted-foreground">Define quando o autoatendimento assume fora do expediente.</p>
      </header>

      <Card className="gap-0 p-4">
        <div className="flex flex-col gap-2.5">
          {days.map((row) => (
            <div key={row.d} className="flex items-center gap-4 border-b border-border/50 pb-2.5 last:border-b-0 last:pb-0">
              <SwitchFluid
                label={row.d}
                checked={row.enabled}
                onToggle={() => {/* noop para demo */}}
              />
              <div className="ml-auto flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">De</span>
                <span className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs">{row.start}</span>
                <span className="text-muted-foreground">até</span>
                <span className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs">{row.end}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="gap-0 p-4">
        <SwitchFluidRow
          label="Resposta automática fora do expediente"
          description="Quando o cliente mandar mensagem fora do horário, envia um aviso de retorno."
          checked={autoReply}
          onToggle={() => setAutoReply((v) => !v)}
        />
      </Card>
    </div>
  )
}

function IntegracoesTab() {
  const integrations = [
    { name: "WhatsApp Business", desc: "API Cloud oficial", connected: true, icon: MessageSquare, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { name: "Stripe", desc: "Pagamentos online", connected: true, icon: CreditCard, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { name: "RD Station", desc: "Marketing & leads", connected: false, icon: Rocket, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { name: "Google Calendar", desc: "Sincronizar saídas", connected: true, icon: CalendarDays, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    { name: "Zapier", desc: "Automações customizadas", connected: false, icon: Workflow, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    { name: "HubSpot", desc: "CRM de marketing", connected: false, icon: Target, tone: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  ]
  return (
    <div className="space-y-4">
      <header>
        <h3 className="text-sm font-semibold text-foreground">Integrações</h3>
        <p className="text-xs text-muted-foreground">Conecte ferramentas externas para ampliar a operação.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {integrations.map((i) => {
          const Icon = i.icon
          return (
            <Card key={i.name} className="gap-0 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-10 items-center justify-center rounded-lg", i.tone)}>
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{i.name}</p>
                    <p className="text-[11px] text-muted-foreground">{i.desc}</p>
                  </div>
                </div>
                {i.connected ? (
                  <BadgeFluid color="green" size="sm"><CheckCircle2 /> Conectado</BadgeFluid>
                ) : (
                  <Button variant="outline" size="sm">Conectar</Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function FaturamentoTab() {
  return (
    <div className="space-y-4">
      <header>
        <h3 className="text-sm font-semibold text-foreground">Faturamento</h3>
        <p className="text-xs text-muted-foreground">Plano atual e histórico de pagamentos.</p>
      </header>

      <Card className="gap-0 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <BadgeFluid color="violet" size="md">Plano Pro</BadgeFluid>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">R$ 689<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
            <p className="mt-0.5 text-xs text-muted-foreground">Próxima cobrança: 15/07/2026</p>
          </div>
          <Button variant="outline">Alterar plano</Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
          <div>
            <p className="text-muted-foreground">Mensagens incluídas</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">10.000 / mês</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contatos</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">Ilimitado</p>
          </div>
          <div>
            <p className="text-muted-foreground">Agentes</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">Até 10</p>
          </div>
        </div>
      </Card>

      <Card className="gap-0 p-0 overflow-hidden">
        <header className="border-b border-border px-4 py-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Histórico de cobranças</h4>
        </header>
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2">Forma</th>
              <th className="px-4 py-2 text-right">Valor</th>
              <th className="px-4 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: "15/06/2026", desc: "Plano Pro · Jun/26", method: "Cartão final 4242", value: 689, status: "Pago" },
              { date: "15/05/2026", desc: "Plano Pro · Mai/26", method: "Cartão final 4242", value: 689, status: "Pago" },
              { date: "15/04/2026", desc: "Plano Pro · Abr/26", method: "Cartão final 4242", value: 689, status: "Pago" },
              { date: "15/03/2026", desc: "Plano Pro · Mar/26", method: "Boleto", value: 689, status: "Pago" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-border/50 last:border-b-0">
                <td className="px-4 py-2.5 text-foreground">{row.date}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.desc}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.method}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">{BRL.format(row.value)}</td>
                <td className="px-4 py-2.5 text-right">
                  <BadgeFluid color="green" size="sm">{row.status}</BadgeFluid>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function MarcaTab() {
  const [darkMode, setDarkMode] = React.useState(false)
  return (
    <div className="space-y-4">
      <header>
        <h3 className="text-sm font-semibold text-foreground">Identidade visual</h3>
        <p className="text-xs text-muted-foreground">Personalize cores, logo e tema da marca.</p>
      </header>

      <Card className="gap-0 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Logo & cores</p>
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 text-white">
            <Plane className="size-7" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Aurora Viagens</p>
            <p className="text-xs text-muted-foreground">SVG · 64×64 · Atualizado há 3 meses</p>
          </div>
          <Button variant="outline" size="sm"><ImageIcon /> Trocar logo</Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
          {[
            { name: "Primária", value: "#0EA5E9", cls: "bg-sky-500" },
            { name: "Secundária", value: "#8B5CF6", cls: "bg-violet-500" },
            { name: "Sucesso", value: "#10B981", cls: "bg-emerald-500" },
            { name: "Atenção", value: "#F59E0B", cls: "bg-amber-500" },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-3 rounded-md border border-border p-2.5">
              <span className={cn("size-8 rounded-md", c.cls)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="gap-0 p-4">
        <SwitchFluidRow
          label="Tema escuro por padrão para clientes"
          description="A vitrine de atendimento segue o esquema dark mesmo em horário comercial."
          checked={darkMode}
          onToggle={() => setDarkMode((v) => !v)}
        />
      </Card>

      <Card className="gap-0 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Domínio personalizado</p>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background p-2.5">
          <Globe className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-sm text-foreground">atendimento.<strong>auroraviagens.com.br</strong></span>
          <BadgeFluid color="green" size="sm">Verificado</BadgeFluid>
          <Button variant="ghost" size="sm">Editar</Button>
        </div>
      </Card>
    </div>
  )
}