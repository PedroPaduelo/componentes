/**
 * Composição "VoaCRM — CRM para Agência de Turismo".
 *
 * Tela completa de CRM voltada para o segmento de viagens, montada SÓ com
 * componentes do barrel `@/components/ui`. Estado real via `useState`:
 *
 *   • Sidebar fixa com 5 áreas (Painel, Clientes, Reservas, Pipeline, Campanhas).
 *     Cada troca de seção mostra uma sub-tela diferente no conteúdo principal,
 *     mantendo a navegação consistente.
 *
 *   • PAINEL (default): 4 KPI cards (Reservas no mês, Receita, Ticket médio,
 *     Taxa de ocupação) + gráfico de receita por destino (barras horizontais
 *     em SVG puro) + tabela "Próximas viagens" com passageiro, destino, data,
 *     status e valor.
 *
 *   • CLIENTES: tabela com avatar + nome + cidade/UF + status (Lead, Prospect,
 *     Cliente, VIP via BadgeFluid), gasto total e ações. Busca controlada +
 *     filtro por status via Tabs.
 *
 *   • RESERVAS: lista em cards agrupados por status (Confirmada · Pendente ·
 *     Cancelada), com passageiro, destino, datas, valor, e ações via
 *     DropdownMenu (Confirmar, Reagendar, Reembolsar, Detalhes).
 *
 *   • PIPELINE: quadro Kanban (estilo component-playground) com 5 estágios
 *     de negociação de pacotes (Novo lead → Em negociação → Cotação enviada
 *     → Aguardando pagamento → Fechado). Cards arrastáveis entre colunas,
 *     com toast confirmando a movimentação.
 *
 *   • CAMPANHAS: cards de campanhas ativas (E-mail, WhatsApp, Ads) com
 *     métricas (Alcance, Conversões, ROI), badge de status e switch de
 *     pausar/retomar.
 *
 * Componentes do catálogo usados (~14): Card, Button, ButtonFluid, BadgeFluid,
 * Input, Avatar/AvatarFallback, Separator, ScrollArea, Tabs/TabsList/TabsTrigger,
 * Select/SelectContent/SelectItem/SelectTrigger/SelectValue, Dialog/*,
 * DropdownMenu/*, RadioGroup/RadioGroupItem, Toaster (sonner).
 */
import * as React from "react"
import { toast } from "sonner"
import {
  Plane,
  Search,
  Bell,
  Users,
  MoreHorizontal,
  Plus,
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Wallet,
  TrendingUp,
  Star,
  Mail,
  MessageCircle,
  Megaphone,
  Pause,
  Play,
  Trash2,
  ArrowRight,
  Clock,
  LayoutGrid,
  Inbox,
  Sparkles,
} from "lucide-react"

import {
  Card,
  Button,
  BadgeFluid,
  Input,
  Avatar,
  AvatarFallback,
  Separator,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  RadioGroup,
  RadioGroupItem,
  Toaster,
} from "@/components/ui"
import type { BadgeColor } from "@/components/ui"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                          formatters / constantes                           */
/* -------------------------------------------------------------------------- */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})
const BRL_CENT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
})
const COMPACT = new Intl.NumberFormat("pt-BR", { notation: "compact" })

/* -------------------------------------------------------------------------- */
/*                                   modelo                                   */
/* -------------------------------------------------------------------------- */

type ClientStatus = "lead" | "prospect" | "cliente" | "vip"
type BookingStatus = "confirmada" | "pendente" | "cancelada"
type PipelineStage =
  | "novo-lead"
  | "em-negociacao"
  | "cotacao-enviada"
  | "aguardando-pagamento"
  | "fechado"

interface Client {
  id: string
  name: string
  email: string
  city: string
  state: string
  status: ClientStatus
  totalSpent: number
  initials: string
  /** classe literal Tailwind (sem interpolação) para o avatar */
  avatarClass: string
  lastTrip?: string
}

interface Booking {
  id: string
  clientId: string
  destination: string
  country: string
  startDate: string
  endDate: string
  pax: number
  amount: number
  status: BookingStatus
}

interface PipelineDeal {
  id: string
  clientId: string
  packageTitle: string
  destination: string
  value: number
  stage: PipelineStage
  ownerId: string
  expectedClose: string
}

interface Campaign {
  id: string
  name: string
  channel: "email" | "whatsapp" | "ads"
  status: "ativa" | "pausada"
  reach: number
  conversions: number
  roi: number
  budget: number
}

type SectionId = "painel" | "clientes" | "reservas" | "pipeline" | "campanhas"

/* -------------------------------------------------------------------------- */
/*                            meta tabelas (UI)                               */
/* -------------------------------------------------------------------------- */

const SECTION_META: Record<
  SectionId,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  painel: { label: "Painel", icon: LayoutDashboard },
  clientes: { label: "Clientes", icon: Users },
  reservas: { label: "Reservas", icon: CalendarDays },
  pipeline: { label: "Pipeline", icon: LayoutGrid },
  campanhas: { label: "Campanhas", icon: Megaphone },
}

const STATUS_META: Record<
  ClientStatus,
  { label: string; color: BadgeColor }
> = {
  lead: { label: "Lead", color: "gray" },
  prospect: { label: "Prospect", color: "blue" },
  cliente: { label: "Cliente", color: "green" },
  vip: { label: "VIP", color: "amber" },
}

const BOOKING_META: Record<
  BookingStatus,
  { label: string; color: BadgeColor }
> = {
  confirmada: { label: "Confirmada", color: "green" },
  pendente: { label: "Pendente", color: "amber" },
  cancelada: { label: "Cancelada", color: "red" },
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

const CHANNEL_META: Record<
  Campaign["channel"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  email: { label: "E-mail", icon: Mail },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  ads: { label: "Ads", icon: Megaphone },
}

/* -------------------------------------------------------------------------- */
/*                              seed data                                     */
/* -------------------------------------------------------------------------- */

const CLIENTS: Client[] = [
  {
    id: "marina",
    name: "Marina Albuquerque",
    email: "marina.alb@example.com",
    city: "Florianópolis",
    state: "SC",
    status: "vip",
    totalSpent: 47800,
    initials: "MA",
    avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    lastTrip: "Lisboa · Jun/26",
  },
  {
    id: "renato",
    name: "Renato Pacheco",
    email: "renato.p@example.com",
    city: "Curitiba",
    state: "PR",
    status: "cliente",
    totalSpent: 18250,
    initials: "RP",
    avatarClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    lastTrip: "Cancún · Mar/26",
  },
  {
    id: "beatriz",
    name: "Beatriz Lemos",
    email: "bia.lemos@example.com",
    city: "Belo Horizonte",
    state: "MG",
    status: "cliente",
    totalSpent: 9640,
    initials: "BL",
    avatarClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    lastTrip: "Fernando de Noronha · Fev/26",
  },
  {
    id: "tiago",
    name: "Tiago Vasconcelos",
    email: "tiago.vc@example.com",
    city: "Recife",
    state: "PE",
    status: "prospect",
    totalSpent: 0,
    initials: "TV",
    avatarClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  },
  {
    id: "camila",
    name: "Camila Rocha",
    email: "camila.r@example.com",
    city: "Porto Alegre",
    state: "RS",
    status: "prospect",
    totalSpent: 0,
    initials: "CR",
    avatarClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  },
  {
    id: "pedro",
    name: "Pedro Henrique Sales",
    email: "pedro.hs@example.com",
    city: "São Paulo",
    state: "SP",
    status: "lead",
    totalSpent: 0,
    initials: "PS",
    avatarClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
  {
    id: "livia",
    name: "Lívia Mendonça",
    email: "livia.m@example.com",
    city: "Salvador",
    state: "BA",
    status: "lead",
    totalSpent: 0,
    initials: "LM",
    avatarClass: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  },
  {
    id: "gustavo",
    name: "Gustavo Bertelli",
    email: "gustavo.b@example.com",
    city: "Campinas",
    state: "SP",
    status: "vip",
    totalSpent: 62100,
    initials: "GB",
    avatarClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    lastTrip: "Tóquio · Mai/26",
  },
]

const CLIENT_BY_ID: Record<string, Client> = Object.fromEntries(
  CLIENTS.map((c) => [c.id, c])
)

const BOOKINGS: Booking[] = [
  {
    id: "b1",
    clientId: "marina",
    destination: "Lisboa",
    country: "Portugal",
    startDate: "12/07/2026",
    endDate: "22/07/2026",
    pax: 2,
    amount: 18900,
    status: "confirmada",
  },
  {
    id: "b2",
    clientId: "renato",
    destination: "Cancún",
    country: "México",
    startDate: "03/08/2026",
    endDate: "12/08/2026",
    pax: 4,
    amount: 22600,
    status: "pendente",
  },
  {
    id: "b3",
    clientId: "beatriz",
    destination: "Patagônia",
    country: "Argentina",
    startDate: "20/09/2026",
    endDate: "30/09/2026",
    pax: 2,
    amount: 14800,
    status: "confirmada",
  },
  {
    id: "b4",
    clientId: "gustavo",
    destination: "Tóquio",
    country: "Japão",
    startDate: "05/10/2026",
    endDate: "18/10/2026",
    pax: 3,
    amount: 41200,
    status: "confirmada",
  },
  {
    id: "b5",
    clientId: "camila",
    destination: "Bariloche",
    country: "Argentina",
    startDate: "15/07/2026",
    endDate: "22/07/2026",
    pax: 2,
    amount: 8200,
    status: "pendente",
  },
  {
    id: "b6",
    clientId: "tiago",
    destination: "Maceió",
    country: "Brasil",
    startDate: "01/06/2026",
    endDate: "07/06/2026",
    pax: 2,
    amount: 4900,
    status: "cancelada",
  },
]

const DEALS: PipelineDeal[] = [
  {
    id: "d1",
    clientId: "tiago",
    packageTitle: "Pacote Maceió · All inclusive",
    destination: "Maceió, BR",
    value: 5400,
    stage: "novo-lead",
    ownerId: "ana",
    expectedClose: "20/07",
  },
  {
    id: "d2",
    clientId: "camila",
    packageTitle: "Bariloche · Inverno 2026",
    destination: "Bariloche, AR",
    value: 8200,
    stage: "novo-lead",
    ownerId: "bruno",
    expectedClose: "10/07",
  },
  {
    id: "d3",
    clientId: "pedro",
    packageTitle: "Europa 12 dias · SP outbound",
    destination: "Roma, IT",
    value: 14800,
    stage: "em-negociacao",
    ownerId: "carla",
    expectedClose: "25/08",
  },
  {
    id: "d4",
    clientId: "livia",
    packageTitle: "Lua de mel · Maldivas",
    destination: "Malé, MV",
    value: 32600,
    stage: "cotacao-enviada",
    ownerId: "diego",
    expectedClose: "15/09",
  },
  {
    id: "d5",
    clientId: "beatriz",
    packageTitle: "Patagônia · Trekking",
    destination: "El Calafate, AR",
    value: 14800,
    stage: "aguardando-pagamento",
    ownerId: "ana",
    expectedClose: "30/06",
  },
  {
    id: "d6",
    clientId: "renato",
    packageTitle: "Cancún · Resort 5★",
    destination: "Cancún, MX",
    value: 22600,
    stage: "fechado",
    ownerId: "bruno",
    expectedClose: "—",
  },
  {
    id: "d7",
    clientId: "marina",
    packageTitle: "Lisboa · Réveillon 2026",
    destination: "Lisboa, PT",
    value: 18900,
    stage: "fechado",
    ownerId: "carla",
    expectedClose: "—",
  },
]

const CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Réveillon na Europa",
    channel: "email",
    status: "ativa",
    reach: 12480,
    conversions: 187,
    roi: 312,
    budget: 4500,
  },
  {
    id: "c2",
    name: "Pacote All Inclusive BR",
    channel: "whatsapp",
    status: "ativa",
    reach: 6230,
    conversions: 92,
    roi: 248,
    budget: 1800,
  },
  {
    id: "c3",
    name: "Inverno Argentina",
    channel: "ads",
    status: "pausada",
    reach: 38120,
    conversions: 54,
    roi: 88,
    budget: 6200,
  },
  {
    id: "c4",
    name: "Lua de mel · Destaque",
    channel: "email",
    status: "ativa",
    reach: 3210,
    conversions: 41,
    roi: 425,
    budget: 900,
  },
]

const OWNERS = [
  { id: "ana", name: "Ana Lima", initials: "AL", avatarClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400" },
  { id: "bruno", name: "Bruno Sá", initials: "BS", avatarClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  { id: "carla", name: "Carla Reis", initials: "CR", avatarClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  { id: "diego", name: "Diego Nunes", initials: "DN", avatarClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
]
const OWNER_BY_ID = Object.fromEntries(OWNERS.map((o) => [o.id, o]))

/* -------------------------------------------------------------------------- */
/*                              subcomponentes                                 */
/* -------------------------------------------------------------------------- */

/** Avatar redondo com iniciais + cor determinística. */
function ClientAvatar({
  client,
  size = "md",
}: {
  client: Client
  size?: "sm" | "md"
}) {
  const dim = size === "sm" ? "size-7 text-[10px]" : "size-9 text-[11px]"
  return (
    <Avatar className={dim}>
      <AvatarFallback className={cn("font-semibold", client.avatarClass)}>
        {client.initials}
      </AvatarFallback>
    </Avatar>
  )
}

/** Diálogo "novo cliente" reaproveitado em qualquer seção. */
function NewClientDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (client: Omit<Client, "id">) => void
}) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [city, setCity] = React.useState("")
  const [state, setState] = React.useState("SP")
  const [status, setStatus] = React.useState<ClientStatus>("lead")

  function reset() {
    setName("")
    setEmail("")
    setCity("")
    setState("SP")
    setStatus("lead")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const initials = trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
    onCreate({
      name: trimmed,
      email: email.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      status,
      totalSpent: 0,
      initials,
      avatarClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
            <DialogDescription>
              Cadastro rápido — você completa os detalhes depois.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="crm-c-name" className="text-sm font-medium text-foreground">
                Nome completo
              </label>
              <Input
                id="crm-c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Mariana Albuquerque"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label htmlFor="crm-c-city" className="text-sm font-medium text-foreground">
                  Cidade
                </label>
                <Input
                  id="crm-c-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex.: Florianópolis"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="crm-c-state" className="text-sm font-medium text-foreground">
                  UF
                </label>
                <Input
                  id="crm-c-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="crm-c-email" className="text-sm font-medium text-foreground">
                E-mail
              </label>
              <Input
                id="crm-c-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@email.com"
              />
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Status inicial</span>
              <RadioGroup
                value={status}
                onValueChange={(v) => setStatus(v as ClientStatus)}
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {(Object.keys(STATUS_META) as ClientStatus[]).map((s) => (
                  <label
                    key={s}
                    htmlFor={`crm-status-${s}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent",
                      status === s && "border-primary bg-accent"
                    )}
                  >
                    <RadioGroupItem id={`crm-status-${s}`} value={s} />
                    <span>{STATUS_META[s].label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  PAINEL                                     */
/* -------------------------------------------------------------------------- */

const REVENUE_BY_DESTINATION: { dest: string; value: number }[] = [
  { dest: "Lisboa", value: 86400 },
  { dest: "Cancún", value: 72100 },
  { dest: "Tóquio", value: 65800 },
  { dest: "Patagônia", value: 41200 },
  { dest: "Bariloche", value: 38900 },
  { dest: "Maceió", value: 27400 },
  { dest: "Noronha", value: 22100 },
]

function RevenueByDestination() {
  const max = Math.max(...REVENUE_BY_DESTINATION.map((r) => r.value))
  return (
    <Card className="gap-0 p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Receita por destino (últimos 90 dias)
          </h3>
          <p className="text-xs text-muted-foreground">
            Top 7 destinos em receita bruta
          </p>
        </div>
        <Sparkles className="size-4 text-muted-foreground" />
      </header>
      <div className="flex flex-col gap-3">
        {REVENUE_BY_DESTINATION.map((row) => {
          const pct = (row.value / max) * 100
          return (
            <div key={row.dest} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-sm text-foreground">
                {row.dest}
              </span>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-sky-500 to-violet-500"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              </div>
              <span className="w-24 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
                {BRL.format(row.value)}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function PainelSection() {
  return (
    <div className="flex flex-col gap-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Reservas no mês"
          value="48"
          delta="+12% vs. mês anterior"
          icon={CalendarDays}
          accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          label="Receita"
          value={BRL.format(382400)}
          delta="+18% vs. mês anterior"
          icon={Wallet}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          label="Ticket médio"
          value={BRL.format(7970)}
          delta="+5% vs. mês anterior"
          icon={TrendingUp}
          accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <KpiCard
          label="Taxa de ocupação"
          value="84%"
          delta="+3 p.p. vs. mês anterior"
          icon={Star}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Receita por destino + próximas viagens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueByDestination />
        </div>
        <Card className="gap-0 p-5 lg:col-span-2">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Próximas viagens
              </h3>
              <p className="text-xs text-muted-foreground">
                Saídas confirmadas nos próximos 30 dias
              </p>
            </div>
            <Plane className="size-4 text-muted-foreground" />
          </header>
          <div className="flex flex-col gap-2.5">
            {BOOKINGS.filter((b) => b.status === "confirmada").map((b) => {
              const c = CLIENT_BY_ID[b.clientId]
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                >
                  <ClientAvatar client={c} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {b.destination}, {b.country} · {b.startDate}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {BRL.format(b.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  delta: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            {delta}
          </p>
        </div>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            accent
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 CLIENTES                                    */
/* -------------------------------------------------------------------------- */

type StatusFilter = "all" | ClientStatus

function ClientesSection({
  query,
}: {
  query: string
}) {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return CLIENTS.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (q) {
        const hay = `${c.name} ${c.email} ${c.city} ${c.state}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [query, statusFilter])

  const counts = React.useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: CLIENTS.length,
      lead: 0,
      prospect: 0,
      cliente: 0,
      vip: 0,
    }
    for (const cli of CLIENTS) c[cli.status] += 1
    return c
  }, [])

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <header className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Base de clientes
          </h3>
          <p className="text-xs text-muted-foreground">
            {filtered.length} de {CLIENTS.length} clientes
          </p>
        </div>
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
            <TabsTrigger value="lead">Leads ({counts.lead})</TabsTrigger>
            <TabsTrigger value="prospect">Prospects ({counts.prospect})</TabsTrigger>
            <TabsTrigger value="cliente">Clientes ({counts.cliente})</TabsTrigger>
            <TabsTrigger value="vip">VIP ({counts.vip})</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Cliente</th>
              <th className="px-4 py-2.5">Cidade / UF</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Gasto total</th>
              <th className="px-4 py-2.5">Última viagem</th>
              <th className="px-4 py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum cliente neste filtro.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const meta = STATUS_META[c.status]
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-accent/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ClientAvatar client={c} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {c.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {c.city}, {c.state}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeFluid color={meta.color} size="sm">
                        {meta.label}
                      </BadgeFluid>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                      {c.totalSpent > 0 ? BRL.format(c.totalSpent) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {c.lastTrip ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Ações de ${c.name}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>{c.name}</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Users className="text-muted-foreground" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CalendarDays className="text-muted-foreground" />
                            Nova reserva
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="text-muted-foreground" />
                            Enviar mensagem
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 RESERVAS                                    */
/* -------------------------------------------------------------------------- */

function ReservasSection() {
  const grouped = React.useMemo(() => {
    const m: Record<BookingStatus, Booking[]> = {
      confirmada: [],
      pendente: [],
      cancelada: [],
    }
    for (const b of BOOKINGS) m[b.status].push(b)
    return m
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {(Object.keys(grouped) as BookingStatus[]).map((status) => {
        const items = grouped[status]
        const meta = BOOKING_META[status]
        return (
          <section key={status} className="flex flex-col gap-3">
            <header className="flex items-center gap-2">
              <BadgeFluid color={meta.color} size="md">
                {meta.label}
              </BadgeFluid>
              <span className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "reserva" : "reservas"}
              </span>
            </header>
            {items.length === 0 ? (
              <Card className="gap-0 p-6 text-center text-sm text-muted-foreground">
                Nenhuma reserva {meta.label.toLowerCase()}.
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {items.map((b) => {
                  const c = CLIENT_BY_ID[b.clientId]
                  return (
                    <Card key={b.id} className="gap-0 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ClientAvatar client={c} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {c.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.destination}, {b.country}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Ações da reserva ${b.id}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Reserva {b.id.toUpperCase()}</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <ArrowRight className="text-muted-foreground" />
                              Ver detalhes
                            </DropdownMenuItem>
                            {status !== "confirmada" && (
                              <DropdownMenuItem>
                                <Clock className="text-muted-foreground" />
                                Reagendar
                              </DropdownMenuItem>
                            )}
                            {status === "pendente" && (
                              <DropdownMenuItem>
                                <Wallet className="text-muted-foreground" />
                                Confirmar pagamento
                              </DropdownMenuItem>
                            )}
                            {status !== "cancelada" && (
                              <DropdownMenuSeparator />
                            )}
                            {status !== "cancelada" && (
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 />
                                Reembolsar / cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Ida</p>
                          <p className="font-medium text-foreground">{b.startDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volta</p>
                          <p className="font-medium text-foreground">{b.endDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pax</p>
                          <p className="font-medium text-foreground">
                            {b.pax} {b.pax === 1 ? "pessoa" : "pessoas"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Total
                        </span>
                        <span className="text-base font-semibold tabular-nums text-foreground">
                          {BRL_CENT.format(b.amount)}
                        </span>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 PIPELINE                                    */
/* -------------------------------------------------------------------------- */

function PipelineCard({
  deal,
  isDragging,
  onDragStart,
  onDragEnd,
  onMove,
  onDelete,
}: {
  deal: PipelineDeal
  isDragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onMove: (id: string, to: PipelineStage) => void
  onDelete: (id: string) => void
}) {
  const client = CLIENT_BY_ID[deal.clientId]
  const owner = OWNER_BY_ID[deal.ownerId]
  const moveTargets = STAGE_ORDER.filter((s) => s !== deal.stage)

  return (
    <Card
      data-slot="pipeline-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", deal.id)
        onDragStart(deal.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab gap-0 rounded-lg border-border p-3 shadow-sm transition-all hover:border-foreground/20 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {deal.packageTitle}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="-mr-1 -mt-1 opacity-60 transition-opacity group-hover:opacity-100"
              aria-label={`Ações do deal ${deal.id}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mover para</DropdownMenuLabel>
            {moveTargets.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => onMove(deal.id, s)}
              >
                <ArrowRight className="text-muted-foreground" />
                {STAGE_META[s].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(deal.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3" />
        {deal.destination}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-base font-semibold tabular-nums text-foreground">
          {BRL.format(deal.value)}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          Fecha {deal.expectedClose}
        </span>
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClientAvatar client={client} size="sm" />
          <span className="text-xs text-foreground">{client.name.split(" ")[0]}</span>
        </div>
        <Avatar className="size-5">
          <AvatarFallback
            className={cn(
              "text-[9px] font-semibold",
              owner?.avatarClass
            )}
            title={owner?.name}
          >
            {owner?.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </Card>
  )
}

function PipelineSection() {
  const [deals, setDeals] = React.useState<PipelineDeal[]>(DEALS)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = React.useState<PipelineStage | null>(null)

  const dealsByStage = React.useMemo(() => {
    const m: Record<PipelineStage, PipelineDeal[]> = {
      "novo-lead": [],
      "em-negociacao": [],
      "cotacao-enviada": [],
      "aguardando-pagamento": [],
      "fechado": [],
    }
    for (const d of deals) m[d.stage].push(d)
    return m
  }, [deals])

  const totalsByStage = React.useMemo(() => {
    const t: Record<PipelineStage, number> = {
      "novo-lead": 0,
      "em-negociacao": 0,
      "cotacao-enviada": 0,
      "aguardando-pagamento": 0,
      "fechado": 0,
    }
    for (const d of deals) t[d.stage] += d.value
    return t
  }, [deals])

  const pipelineTotal = Object.values(totalsByStage).reduce((acc, v) => acc + v, 0)

  function moveDeal(id: string, to: PipelineStage) {
    const deal = deals.find((d) => d.id === id)
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, stage: to } : d))
    )
    if (deal && deal.stage !== to) {
      toast.success("Deal movido", {
        description: `"${deal.packageTitle}" → ${STAGE_META[to].label}.`,
      })
    }
  }

  function deleteDeal(id: string) {
    const deal = deals.find((d) => d.id === id)
    setDeals((prev) => prev.filter((d) => d.id !== id))
    if (deal) {
      toast("Deal excluído", {
        description: `"${deal.packageTitle}" foi removido do pipeline.`,
      })
    }
  }

  function handleDrop(to: PipelineStage, droppedId: string) {
    const id = droppedId || draggingId
    if (id) moveDeal(id, to)
    setDraggingId(null)
    setDragOverStage(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Pipeline aberto
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-foreground">
              {BRL.format(pipelineTotal)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {STAGE_ORDER.map((s) => (
              <BadgeFluid
                key={s}
                color="gray"
                size="sm"
                className="font-medium tabular-nums"
              >
                {STAGE_META[s].label} · {BRL.format(totalsByStage[s])}
              </BadgeFluid>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {STAGE_ORDER.map((stage) => {
          const stageDeals = dealsByStage[stage]
          const meta = STAGE_META[stage]
          const isOver = dragOverStage === stage
          return (
            <section
              key={stage}
              data-slot="pipeline-column"
              data-stage={stage}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
                if (dragOverStage !== stage) setDragOverStage(stage)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverStage((cur) => (cur === stage ? null : cur))
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(stage, e.dataTransfer.getData("text/plain"))
              }}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/40 transition-colors",
                isOver && "border-primary/60 bg-accent/50 ring-2 ring-primary/40"
              )}
            >
              <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("size-2.5 rounded-full", meta.accent)}
                    aria-hidden
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    {meta.label}
                  </h2>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                  {BRL.format(totalsByStage[stage])}
                </span>
              </div>

              <ScrollArea className="h-[440px] px-3">
                <div className="flex flex-col gap-2.5 pb-3">
                  {stageDeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-10 text-center">
                      <Inbox className="size-5 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground">
                        Arraste deals para cá
                      </p>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <PipelineCard
                        key={deal.id}
                        deal={deal}
                        isDragging={draggingId === deal.id}
                        onDragStart={setDraggingId}
                        onDragEnd={() => {
                          setDraggingId(null)
                          setDragOverStage(null)
                        }}
                        onMove={moveDeal}
                        onDelete={deleteDeal}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </section>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                CAMPANHAS                                    */
/* -------------------------------------------------------------------------- */

function CampanhasSection() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(CAMPAIGNS)

  function toggleStatus(id: string) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ativa" ? "pausada" : "ativa" }
          : c
      )
    )
    const c = campaigns.find((x) => x.id === id)
    if (c) {
      toast.success(
        c.status === "ativa" ? "Campanha pausada" : "Campanha reativada",
        { description: c.name }
      )
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((c) => {
        const channelMeta = CHANNEL_META[c.channel]
        const ChannelIcon = channelMeta.icon
        const isActive = c.status === "ativa"
        return (
          <Card key={c.id} className="gap-0 p-5">
            <header className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <ChannelIcon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {channelMeta.label}
                  </p>
                </div>
              </div>
              <BadgeFluid color={isActive ? "green" : "gray"} size="sm">
                {isActive ? "Ativa" : "Pausada"}
              </BadgeFluid>
            </header>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-3 text-xs">
              <Metric label="Alcance" value={COMPACT.format(c.reach)} />
              <Metric label="Conversões" value={COMPACT.format(c.conversions)} />
              <Metric label="ROI" value={`${c.roi}%`} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                Orçamento: {BRL.format(c.budget)}
              </span>
              <Button
                variant={isActive ? "ghost" : "outline"}
                size="sm"
                onClick={() => toggleStatus(c.id)}
              >
                {isActive ? (
                  <>
                    <Pause />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play />
                    Retomar
                  </>
                )}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSIÇÃO                                  */
/* -------------------------------------------------------------------------- */

export function VoaCrm() {
  const { resolvedTheme } = useTheme()
  const [section, setSection] = React.useState<SectionId>("painel")
  const [query, setQuery] = React.useState("")
  const [newClientOpen, setNewClientOpen] = React.useState(false)
  const [clients, setClients] = React.useState<Client[]>(CLIENTS)

  function createClient(data: Omit<Client, "id">) {
    const id = `c${clients.length + 1}-${Date.now()}`
    setClients((prev) => [{ ...data, id }, ...prev])
    toast.success("Cliente cadastrado", {
      description: `${data.name} adicionado(a) como ${STATUS_META[data.status].label}.`,
    })
  }

  const sectionTitle = SECTION_META[section].label
  const totalClients = clients.length
  const vipCount = clients.filter((c) => c.status === "vip").length

  return (
    <div
      data-slot="voa-crm"
      className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6"
    >
      {/* Topbar */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Plane className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              VoaCRM
            </h1>
            <p className="text-sm text-muted-foreground">
              {sectionTitle} · {totalClients} clientes ({vipCount} VIP)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                section === "clientes"
                  ? "Buscar clientes…"
                  : "Buscar no CRM…"
              }
              className="pl-9"
              aria-label="Buscar"
              disabled={section !== "clientes"}
            />
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Notificações">
            <Bell />
          </Button>
          <NewClientDialog
            open={newClientOpen}
            onOpenChange={setNewClientOpen}
            onCreate={createClient}
          />
          <Button size="sm" onClick={() => setNewClientOpen(true)}>
            <Plus />
            Novo cliente
          </Button>
        </div>
      </header>

      {/* Sidebar de navegação em abas horizontais (também vira sidebar em desktop via overflow-x) */}
      <nav className="-mx-1 flex items-center gap-1 overflow-x-auto px-1">
        {(Object.keys(SECTION_META) as SectionId[]).map((id) => {
          const meta = SECTION_META[id]
          const Icon = meta.icon
          const active = section === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              data-section={id}
              data-active={active ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {meta.label}
              {id === "clientes" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {totalClients}
                </span>
              )}
              {id === "reservas" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {BOOKINGS.length}
                </span>
              )}
              {id === "pipeline" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {DEALS.length}
                </span>
              )}
              {id === "campanhas" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {CAMPAIGNS.length}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <Separator />

      {/* Conteúdo */}
      <main className="min-h-[420px]">
        {section === "painel" && <PainelSection />}
        {section === "clientes" && (
          <ClientesSection query={query} />
        )}
        {section === "reservas" && <ReservasSection />}
        {section === "pipeline" && <PipelineSection />}
        {section === "campanhas" && <CampanhasSection />}
      </main>

      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </div>
  )
}