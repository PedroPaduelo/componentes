/**
 * Composição "Dashboard SaaS Completo" (saas-dashboard-pro).
 *
 * App de gestão NAVEGÁVEL montado exclusivamente com componentes do registry:
 *  - AnimatedNumber (KPIs animados)
 *  - GitHubContributions (heatmap de atividade — helper determinístico)
 *  - TableFluid + sub (tabelas de clientes e faturas filtráveis/paginadas)
 *  - Tabs/TabsList/TabsTrigger/TabsContent (visões em Analytics)
 *  - Dialog/DialogContent/... (detalhe do cliente, fatura e criação em overlay)
 *  - DropdownMenu* (menu do usuário) + Avatar (membros/feed/usuário)
 *  - SwitchFluid / SelectFluid / Input (preferências, filtros e período)
 *  - Badge (status/plano) + Button (navegação/ações) + Toaster (Sonner)
 *
 * Estado real via useState/useMemo: a seção ativa troca o conteúdo central;
 * a busca + filtros de plano/status reduzem as linhas; o seletor de período
 * troca os dados dos gráficos; as faturas abrem detalhe em overlay; o menu de
 * usuário e o diálogo "Novo" disparam toasts. Sem backend (tudo mockado).
 *
 * Distinta da composição estática `saas-dashboard` (esta NÃO a substitui).
 */
import * as React from "react"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  DollarSign,
  Activity,
  TrendingDown,
  Gauge,
  Search,
  Bell,
  Plus,
  Mail,
  CreditCard,
  Receipt,
  FileText,
  Download,
  LogOut,
  User,
  ChevronDown,
  Trash2,
  Sparkles,
  Wallet,
} from "lucide-react"

import {
  Button,
  Badge,
  Input,
  AnimatedNumber,
  BarChart,
  HBarChart,
  DonutChart,
  KpiCard,
  Sparkline,
  DashboardPanel,
  DetailStatCell,
  GitHubContributions,
  TableFluid,
  TableFluidHeader,
  TableFluidBody,
  TableFluidRow,
  TableFluidHead,
  TableFluidCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  SwitchFluid,
  SelectFluid,
  SelectTriggerFluid,
  SelectContentFluid,
  SelectItemFluid,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  Progress,
  Toaster,
} from "@/components/ui"
import { toast } from "sonner"
import { useTheme } from "@/components/theme/use-theme"
import type { ContributionDay } from "@/components/ui/github-contributions"

/* -------------------------------------------------------------------------- */
/*                                   tipos                                     */
/* -------------------------------------------------------------------------- */

type SectionId = "overview" | "analytics" | "customers" | "billing" | "settings"

type Period = "7d" | "30d" | "90d" | "12m"

type Kpi = {
  label: string
  value: number
  prefix?: string
  suffix?: string
  delta: number
  icon: React.ComponentType<{ className?: string }>
}

type CustomerRow = {
  id: string
  name: string
  email: string
  plan: "Free" | "Pro" | "Enterprise"
  status: "Ativo" | "Pendente" | "Cancelado"
  mrr: number
  seed: string
  country: string
  since: string
}

type Invoice = {
  id: string
  date: string
  amount: number
  status: "Pago" | "Pendente" | "Falhou"
  method: string
  plan: string
  items: { label: string; qty: number; unit: number }[]
}

type ActivityEvent = {
  id: string
  name: string
  seed: string
  action: string
  target: string
  time: string
}

type Member = {
  id: string
  name: string
  email: string
  seed: string
  role: "owner" | "admin" | "member"
}

/* -------------------------------------------------------------------------- */
/*                                   dados                                     */
/* -------------------------------------------------------------------------- */

const OVERVIEW_KPIS: Kpi[] = [
  { label: "MRR", value: 48290, prefix: "$", delta: 12.4, icon: DollarSign },
  { label: "Clientes ativos", value: 1284, delta: 8.1, icon: Users },
  { label: "Churn", value: 2, suffix: ".3%", delta: -0.6, icon: TrendingDown },
  { label: "NPS", value: 72, delta: 4.0, icon: Gauge },
]

/* Séries temporais para os mini-gráficos de barras (valores 0..100 relativos). */
const REVENUE_SERIES = [
  { label: "Jan", value: 52 },
  { label: "Fev", value: 47 },
  { label: "Mar", value: 61 },
  { label: "Abr", value: 58 },
  { label: "Mai", value: 73 },
  { label: "Jun", value: 69 },
  { label: "Jul", value: 84 },
  { label: "Ago", value: 78 },
  { label: "Set", value: 92 },
  { label: "Out", value: 88 },
  { label: "Nov", value: 96 },
  { label: "Dez", value: 100 },
]

/* Sparkline de retenção (percentuais decrescentes). */
const RETENTION_SPARK = [100, 94, 88, 83, 79, 76, 74, 72, 71, 70]

/* Dados de Analytics por período — o seletor troca o conjunto de verdade. */
type PeriodData = {
  visitors: number
  visitorsDelta: number
  signups: number
  signupsDelta: number
  convWhole: number
  convFrac: string
  convDelta: number
  revenue: { label: string; value: number }[]
  channels: { label: string; value: number }[]
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "12m", label: "Últimos 12 meses" },
]

const PERIOD_DATA: Record<Period, PeriodData> = {
  "7d": {
    visitors: 8420,
    visitorsDelta: 3.1,
    signups: 386,
    signupsDelta: 2.4,
    convWhole: 4,
    convFrac: ".6%",
    convDelta: 0.4,
    revenue: [
      { label: "Seg", value: 58 },
      { label: "Ter", value: 72 },
      { label: "Qua", value: 64 },
      { label: "Qui", value: 81 },
      { label: "Sex", value: 96 },
      { label: "Sáb", value: 44 },
      { label: "Dom", value: 38 },
    ],
    channels: [
      { label: "Orgânico", value: 100 },
      { label: "Indicação", value: 54 },
      { label: "Social", value: 61 },
      { label: "E-mail", value: 33 },
      { label: "Direto", value: 22 },
    ],
  },
  "30d": {
    visitors: 31240,
    visitorsDelta: 6.8,
    signups: 1542,
    signupsDelta: 4.9,
    convWhole: 4,
    convFrac: ".9%",
    convDelta: 0.8,
    revenue: [
      { label: "S1", value: 62 },
      { label: "S2", value: 71 },
      { label: "S3", value: 84 },
      { label: "S4", value: 93 },
    ],
    channels: [
      { label: "Orgânico", value: 100 },
      { label: "Indicação", value: 66 },
      { label: "Social", value: 49 },
      { label: "E-mail", value: 41 },
      { label: "Direto", value: 28 },
    ],
  },
  "90d": {
    visitors: 92810,
    visitorsDelta: 9.2,
    signups: 4179,
    signupsDelta: 7.1,
    convWhole: 5,
    convFrac: ".1%",
    convDelta: 1.3,
    revenue: [
      { label: "Mês 1", value: 70 },
      { label: "Mês 2", value: 83 },
      { label: "Mês 3", value: 100 },
    ],
    channels: [
      { label: "Orgânico", value: 100 },
      { label: "Indicação", value: 72 },
      { label: "Social", value: 58 },
      { label: "E-mail", value: 46 },
      { label: "Direto", value: 31 },
    ],
  },
  "12m": {
    visitors: 412800,
    visitorsDelta: 14.6,
    signups: 21790,
    signupsDelta: 11.4,
    convWhole: 5,
    convFrac: ".4%",
    convDelta: 2.1,
    revenue: REVENUE_SERIES,
    channels: [
      { label: "Orgânico", value: 100 },
      { label: "Indicação", value: 62 },
      { label: "Social", value: 51 },
      { label: "E-mail", value: 38 },
      { label: "Direto", value: 27 },
    ],
  },
}

const PLANS: CustomerRow["plan"][] = ["Free", "Pro", "Enterprise"]
const STATUSES: CustomerRow["status"][] = ["Ativo", "Pendente", "Cancelado"]
const PLAN_MRR: Record<CustomerRow["plan"], number> = {
  Free: 0,
  Pro: 290,
  Enterprise: 1200,
}

const FIRST_NAMES = [
  "Aurora",
  "Caleb",
  "Dahlia",
  "Elias",
  "Mira",
  "Noah",
  "Olivia",
  "Pedro",
  "Quinn",
  "Rafael",
  "Sofia",
  "Theo",
  "Úrsula",
  "Vitor",
  "Wren",
  "Ximena",
  "Yara",
  "Zane",
  "Bruno",
  "Clara",
]
const LAST_NAMES = [
  "Vale",
  "Monroe",
  "Reyes",
  "Brandt",
  "Sandoval",
  "Okafor",
  "Lindgren",
  "Almeida",
  "Tanaka",
  "Costa",
  "Iglesias",
  "Bauer",
  "Petrova",
  "Ramos",
  "Hale",
  "Duarte",
  "Nakamura",
  "Schmidt",
  "Ferreira",
  "Lima",
]
const COUNTRIES = [
  "Brasil",
  "Portugal",
  "EUA",
  "Alemanha",
  "Japão",
  "Espanha",
  "Canadá",
  "México",
]
const DOMAINS = ["northwind.io", "monroe.dev", "reyes.studio", "brandt.co", "acme.app"]

/* Gera ~20 clientes de forma determinística (sem aleatoriedade). */
function buildCustomers(count: number): CustomerRow[] {
  const rows: CustomerRow[] = []
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length]
    const plan = PLANS[i % PLANS.length]
    const status = STATUSES[(i * 3) % STATUSES.length]
    const mrr = status === "Cancelado" ? 0 : PLAN_MRR[plan]
    const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "")
    const domain = DOMAINS[i % DOMAINS.length]
    const monthIndex = (i % 12) + 1
    const month = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`
    rows.push({
      id: `CUS-${1042 + i}`,
      name: `${first} ${last}`,
      email: `${handle}@${domain}`,
      plan,
      status,
      mrr,
      seed: handle,
      country: COUNTRIES[(i * 5) % COUNTRIES.length],
      since: `2024-${month}`,
    })
  }
  return rows
}

const CUSTOMERS = buildCustomers(20)

/* Top clientes por MRR (ranqueado, determinístico). */
const TOP_CUSTOMERS = [...CUSTOMERS]
  .sort((a, b) => b.mrr - a.mrr || a.name.localeCompare(b.name))
  .slice(0, 5)

/* Distribuição de planos entre os clientes — para o donut do Overview. */
const PLAN_DISTRIBUTION = PLANS.map((plan) => ({
  label: plan,
  value: CUSTOMERS.filter((c) => c.plan === plan).length,
}))

/* Faturas determinísticas para a seção Billing. */
function buildInvoices(count: number): Invoice[] {
  const statuses: Invoice["status"][] = ["Pago", "Pago", "Pago", "Pendente", "Falhou"]
  const methods = ["Visa •••• 4242", "Mastercard •••• 5318", "Pix", "Boleto"]
  const plans = ["Pro mensal", "Pro anual", "Enterprise mensal"]
  const rows: Invoice[] = []
  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length]
    const plan = plans[i % plans.length]
    const base = 290 + (i % 4) * 120
    const seats = 3 + (i % 5)
    const month = ((11 - i + 12) % 12) + 1
    const mm = month < 10 ? `0${month}` : `${month}`
    rows.push({
      id: `INV-2025${mm}${(i + 1).toString().padStart(2, "0")}`,
      date: `2025-${mm}-0${(i % 8) + 1}`,
      amount: base + seats * 19,
      status,
      method: methods[i % methods.length],
      plan,
      items: [
        { label: plan, qty: 1, unit: base },
        { label: "Assentos adicionais", qty: seats, unit: 19 },
      ],
    })
  }
  return rows
}

const INVOICES = buildInvoices(9)

/* Feed de atividade recente (determinístico). */
const ACTIVITY: ActivityEvent[] = [
  { id: "a1", name: "Aurora Vale", seed: "aurora.vale", action: "fez upgrade para", target: "Enterprise", time: "há 4 min" },
  { id: "a2", name: "Noah Okafor", seed: "noah.okafor", action: "criou uma fatura", target: "INV-20251104", time: "há 22 min" },
  { id: "a3", name: "Sofia Iglesias", seed: "sofia.iglesias", action: "convidou", target: "2 membros", time: "há 1 h" },
  { id: "a4", name: "Pedro Almeida", seed: "pedro.almeida", action: "cancelou o plano", target: "Pro", time: "há 3 h" },
  { id: "a5", name: "Mira Sandoval", seed: "mira.sandoval", action: "renovou a assinatura", target: "anual", time: "há 5 h" },
  { id: "a6", name: "Theo Bauer", seed: "theo.bauer", action: "atualizou o método de pagamento", target: "Visa", time: "ontem" },
  { id: "a7", name: "Clara Lima", seed: "clara.lima", action: "atingiu o limite de", target: "API calls", time: "ontem" },
]

const INITIAL_MEMBERS: Member[] = [
  { id: "m1", name: "Aurora Vale", email: "aurora@nimbus.io", seed: "aurora.vale", role: "owner" },
  { id: "m2", name: "Noah Okafor", email: "noah@nimbus.io", seed: "noah.okafor", role: "admin" },
  { id: "m3", name: "Sofia Iglesias", email: "sofia@nimbus.io", seed: "sofia.iglesias", role: "member" },
  { id: "m4", name: "Theo Bauer", email: "theo@nimbus.io", seed: "theo.bauer", role: "member" },
]

/* Heatmap de atividade — determinístico (ondas + tendência + fim de semana). */
function buildContributions(weeks: number): ContributionDay[] {
  const days: ContributionDay[] = []
  const total = weeks * 7
  const start = new Date("2025-01-06T00:00:00")
  for (let i = 0; i < total; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const iso = date.toISOString().slice(0, 10)
    const dow = date.getDay()
    const weekend = dow === 0 || dow === 6
    const base = Math.round(
      (Math.sin(i / 5) + 1) * 4 + (i / total) * 6 + (weekend ? -2 : 1)
    )
    days.push({ date: iso, count: Math.max(0, base) })
  }
  return days
}

const CONTRIBUTIONS = buildContributions(26)

const NAV: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "settings", label: "Settings", icon: Settings },
]

const SECTION_TITLES: Record<SectionId, string> = {
  overview: "Overview",
  analytics: "Analytics",
  customers: "Customers",
  billing: "Billing",
  settings: "Settings",
}

const PAGE_SIZE = 8

const PLAN_SEGMENT_CLASS: Record<CustomerRow["plan"], string> = {
  Free: "stroke-muted-foreground/50",
  Pro: "stroke-primary",
  Enterprise: "stroke-emerald-500",
}

const PLAN_DOT_CLASS: Record<CustomerRow["plan"], string> = {
  Free: "bg-muted-foreground/50",
  Pro: "bg-primary",
  Enterprise: "bg-emerald-500",
}

/* -------------------------------------------------------------------------- */
/*                            helpers de variante                             */
/* -------------------------------------------------------------------------- */

function planVariant(plan: CustomerRow["plan"]) {
  if (plan === "Enterprise") return "default" as const
  if (plan === "Pro") return "secondary" as const
  return "outline" as const
}

function statusVariant(status: CustomerRow["status"]) {
  if (status === "Ativo") return "default" as const
  if (status === "Pendente") return "secondary" as const
  return "destructive" as const
}

function statusDot(status: CustomerRow["status"]) {
  if (status === "Ativo") return "bg-emerald-500"
  if (status === "Pendente") return "bg-amber-500"
  return "bg-rose-500"
}

function invoiceVariant(status: Invoice["status"]) {
  if (status === "Pago") return "default" as const
  if (status === "Pendente") return "secondary" as const
  return "destructive" as const
}

function invoiceDot(status: Invoice["status"]) {
  if (status === "Pago") return "bg-emerald-500"
  if (status === "Pendente") return "bg-amber-500"
  return "bg-rose-500"
}

const ROLE_LABEL: Record<Member["role"], string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
}

function money(value: number) {
  return `$${value.toLocaleString("en-US")}`
}

/* -------------------------------------------------------------------------- */
/*                                  seções                                     */
/* -------------------------------------------------------------------------- */

function OverviewSection() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OVERVIEW_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardPanel
            title="Receita por mês"
            description="Evolução do MRR ao longo do ano."
            action={<Badge variant="outline">2025</Badge>}
          >
            <BarChart series={REVENUE_SERIES} />
          </DashboardPanel>
        </div>
        <DashboardPanel title="Retenção" description="Coorte dos últimos 10 períodos.">
          <Sparkline data={RETENTION_SPARK} aria-label="Tendência de retenção" />
          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            <AnimatedNumber value={70} />
            <span className="text-base text-muted-foreground">%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            retenção no período mais recente
          </p>
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardPanel
            title="Atividade recente"
            description="Eventos da conta nas últimas horas."
            action={<Badge variant="outline">Ao vivo</Badge>}
          >
            <div className="max-h-[280px] overflow-y-auto pr-1">
              <ul className="flex flex-col">
                {ACTIVITY.map((ev, i) => (
                  <li
                    key={ev.id}
                    className={`flex items-center gap-3 py-3 ${
                      i === 0 ? "pt-0" : ""
                    } ${i === ACTIVITY.length - 1 ? "pb-0" : "border-b border-border"}`}
                  >
                    <Avatar className="size-9 border border-border">
                      <AvatarImage
                        src={`https://picsum.photos/seed/${ev.seed}/64/64`}
                        alt={ev.name}
                      />
                      <AvatarFallback>{ev.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        <span className="font-medium">{ev.name}</span>{" "}
                        <span className="text-muted-foreground">{ev.action}</span>{" "}
                        <span className="font-medium">{ev.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{ev.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </DashboardPanel>
        </div>

        <DashboardPanel
          title="Distribuição de planos"
          description="Mix da base de clientes."
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: 168, height: 168 }}>
              <DonutChart
                segments={PLAN_DISTRIBUTION.map((p) => ({
                  label: p.label,
                  value: p.value,
                  className: PLAN_SEGMENT_CLASS[p.label as CustomerRow["plan"]],
                }))}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-foreground">
                  {CUSTOMERS.length}
                </span>
                <span className="text-[11px] text-muted-foreground">clientes</span>
              </div>
            </div>
            <ul className="flex w-full flex-col gap-2">
              {PLAN_DISTRIBUTION.map((p) => (
                <li
                  key={p.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className={`size-2.5 rounded-full ${
                        PLAN_DOT_CLASS[p.label as CustomerRow["plan"]]
                      }`}
                    />
                    {p.label}
                  </span>
                  <span className="font-medium text-foreground">{p.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Top clientes por MRR"
        description="Maiores contas da base."
        action={<Badge variant="outline">Ranking</Badge>}
      >
        <ul className="flex flex-col">
          {TOP_CUSTOMERS.map((c, i) => {
            const max = TOP_CUSTOMERS[0].mrr || 1
            const pct = (c.mrr / max) * 100
            return (
              <li
                key={c.id}
                className={`flex items-center gap-3 py-3 ${i === 0 ? "pt-0" : ""} ${
                  i === TOP_CUSTOMERS.length - 1 ? "pb-0" : "border-b border-border"
                }`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <Avatar className="size-8 border border-border">
                  <AvatarImage
                    src={`https://picsum.photos/seed/${c.seed}/64/64`}
                    alt={c.name}
                  />
                  <AvatarFallback>{c.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.name}
                  </p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <Badge variant={planVariant(c.plan)}>{c.plan}</Badge>
                <span className="w-16 shrink-0 text-right text-sm font-semibold text-foreground">
                  {money(c.mrr)}
                </span>
              </li>
            )
          })}
        </ul>
      </DashboardPanel>

      <DashboardPanel
        title="Atividade da equipe"
        description="Eventos de produto nas últimas 26 semanas."
        action={<Badge variant="outline">Heatmap</Badge>}
      >
        <GitHubContributions data={CONTRIBUTIONS} weeks={26} colorScale="green" />
      </DashboardPanel>
    </div>
  )
}

function AnalyticsSection() {
  const [period, setPeriod] = React.useState<Period>("12m")
  const data = PERIOD_DATA[period]

  const kpis = React.useMemo<Kpi[]>(
    () => [
      {
        label: "Visitantes",
        value: data.visitors,
        delta: data.visitorsDelta,
        icon: Activity,
      },
      {
        label: "Cadastros",
        value: data.signups,
        delta: data.signupsDelta,
        icon: Users,
      },
      {
        label: "Conversão",
        value: data.convWhole,
        suffix: data.convFrac,
        delta: data.convDelta,
        icon: Gauge,
      },
    ],
    [data]
  )

  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? ""

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Dados de <span className="font-medium text-foreground">{periodLabel}</span>
        </p>
        <div className="w-full sm:w-56">
          <SelectFluid
            value={period}
            onValueChange={(v) => setPeriod(v as Period)}
          >
            <SelectTriggerFluid placeholder="Período…" />
            <SelectContentFluid>
              {PERIOD_OPTIONS.map((opt, i) => (
                <SelectItemFluid key={opt.value} index={i} value={opt.value}>
                  {opt.label}
                </SelectItemFluid>
              ))}
            </SelectContentFluid>
          </SelectFluid>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <Tabs defaultValue="revenue">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Desempenho</h2>
              <p className="text-xs text-muted-foreground">
                Alterne entre receita, canais e retenção.
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="revenue">Receita</TabsTrigger>
              <TabsTrigger value="channels">Canais</TabsTrigger>
              <TabsTrigger value="retention">Retenção</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="revenue" className="mt-5">
            <BarChart series={data.revenue} />
          </TabsContent>

          <TabsContent value="channels" className="mt-5">
            <HBarChart series={data.channels} />
          </TabsContent>

          <TabsContent value="retention" className="mt-5">
            <Sparkline data={RETENTION_SPARK} aria-label="Tendência de retenção" />
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {RETENTION_SPARK.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-muted/40 p-3 text-center"
                >
                  <p className="text-lg font-semibold text-foreground">{p}%</p>
                  <p className="text-[10px] text-muted-foreground">Mês {i + 1}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

function CustomerDetail({
  customer,
  open,
  onOpenChange,
}: {
  customer: CustomerRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {customer ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <img
                  src={`https://picsum.photos/seed/${customer.seed}/64/64`}
                  alt={customer.name}
                  className="size-10 rounded-full object-cover"
                  loading="lazy"
                />
                <span>{customer.name}</span>
              </DialogTitle>
              <DialogDescription>{customer.email}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <DetailStatCell icon={CreditCard} label="Plano">
                <Badge variant={planVariant(customer.plan)}>{customer.plan}</Badge>
              </DetailStatCell>
              <DetailStatCell icon={Activity} label="Status">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${statusDot(customer.status)}`}
                  />
                  {customer.status}
                </span>
              </DetailStatCell>
              <DetailStatCell icon={DollarSign} label="MRR">
                <span className="font-medium text-foreground">
                  {money(customer.mrr)}
                </span>
              </DetailStatCell>
              <DetailStatCell icon={Users} label="País">
                <span className="text-foreground">{customer.country}</span>
              </DetailStatCell>
              <DetailStatCell icon={Mail} label="ID">
                <span className="font-mono text-xs text-foreground">
                  {customer.id}
                </span>
              </DetailStatCell>
              <DetailStatCell icon={Activity} label="Cliente desde">
                <span className="text-foreground">{customer.since}</span>
              </DetailStatCell>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button size="sm">Ver fatura</Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function CustomersSection() {
  const [query, setQuery] = React.useState("")
  const [planFilter, setPlanFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(0)
  const [selected, setSelected] = React.useState<CustomerRow | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return CUSTOMERS.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.plan.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      const matchesPlan = planFilter === "all" || c.plan === planFilter
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesQuery && matchesPlan && matchesStatus
    })
  }, [query, planFilter, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  )

  const hasFilters =
    query.trim() !== "" || planFilter !== "all" || statusFilter !== "all"

  function resetPage() {
    setPage(0)
  }

  function openCustomer(customer: CustomerRow) {
    setSelected(customer)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <DashboardPanel
        title="Clientes"
        description={`${filtered.length} de ${CUSTOMERS.length} clientes`}
        action={
          <div className="relative w-full max-w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                resetPage()
              }}
              placeholder="Buscar cliente…"
              aria-label="Buscar cliente"
              className="pl-8"
            />
          </div>
        }
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-44">
            <SelectFluid
              value={planFilter}
              onValueChange={(v) => {
                setPlanFilter(v)
                resetPage()
              }}
            >
              <SelectTriggerFluid placeholder="Plano" />
              <SelectContentFluid>
                <SelectItemFluid index={0} value="all">
                  Todos os planos
                </SelectItemFluid>
                {PLANS.map((p, i) => (
                  <SelectItemFluid key={p} index={i + 1} value={p}>
                    {p}
                  </SelectItemFluid>
                ))}
              </SelectContentFluid>
            </SelectFluid>
          </div>
          <div className="w-full sm:w-44">
            <SelectFluid
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                resetPage()
              }}
            >
              <SelectTriggerFluid placeholder="Status" />
              <SelectContentFluid>
                <SelectItemFluid index={0} value="all">
                  Todos os status
                </SelectItemFluid>
                {STATUSES.map((s, i) => (
                  <SelectItemFluid key={s} index={i + 1} value={s}>
                    {s}
                  </SelectItemFluid>
                ))}
              </SelectContentFluid>
            </SelectFluid>
          </div>
          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              className="sm:ml-auto"
              onClick={() => {
                setQuery("")
                setPlanFilter("all")
                setStatusFilter("all")
                resetPage()
              }}
            >
              Limpar filtros
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground sm:ml-auto">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          <TableFluid>
            <TableFluidHeader>
              <TableFluidRow>
                <TableFluidHead>Cliente</TableFluidHead>
                <TableFluidHead className="hidden sm:table-cell">
                  Plano
                </TableFluidHead>
                <TableFluidHead>Status</TableFluidHead>
                <TableFluidHead className="text-right">MRR</TableFluidHead>
              </TableFluidRow>
            </TableFluidHeader>
            <TableFluidBody>
              {pageRows.map((row, i) => (
                <TableFluidRow
                  key={row.id}
                  index={i}
                  className="cursor-pointer"
                  onClick={() => openCustomer(row)}
                >
                  <TableFluidCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://picsum.photos/seed/${row.seed}/64/64`}
                        alt={row.name}
                        className="size-8 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {row.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.email}
                        </p>
                      </div>
                    </div>
                  </TableFluidCell>
                  <TableFluidCell className="hidden sm:table-cell">
                    <Badge variant={planVariant(row.plan)}>{row.plan}</Badge>
                  </TableFluidCell>
                  <TableFluidCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full ${statusDot(row.status)}`}
                      />
                      <Badge variant={statusVariant(row.status)}>
                        {row.status}
                      </Badge>
                    </span>
                  </TableFluidCell>
                  <TableFluidCell className="text-right font-medium text-foreground">
                    {money(row.mrr)}
                  </TableFluidCell>
                </TableFluidRow>
              ))}
              {pageRows.length === 0 ? (
                <TableFluidRow index={0}>
                  <TableFluidCell className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum cliente encontrado com os filtros atuais.
                  </TableFluidCell>
                </TableFluidRow>
              ) : null}
            </TableFluidBody>
          </TableFluid>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Página {safePage + 1} de {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </DashboardPanel>

      <CustomerDetail
        customer={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

function InvoiceDetail({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {invoice ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="font-mono text-sm">{invoice.id}</span>
              </DialogTitle>
              <DialogDescription>
                Emitida em {invoice.date} · {invoice.method}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <span
                  className={`size-2 rounded-full ${invoiceDot(invoice.status)}`}
                />
                <Badge variant={invoiceVariant(invoice.status)}>
                  {invoice.status}
                </Badge>
              </span>
              <span className="text-sm text-muted-foreground">{invoice.plan}</span>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Item</th>
                    <th className="px-3 py-2 text-center font-medium">Qtd.</th>
                    <th className="px-3 py-2 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.label} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{item.label}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">
                        {item.qty}
                      </td>
                      <td className="px-3 py-2 text-right text-foreground">
                        {money(item.qty * item.unit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">
                {money(invoice.amount)}
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  toast.success(`Fatura ${invoice.id} baixada`)
                  onOpenChange(false)
                }}
              >
                <Download className="size-4" />
                Baixar PDF
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function BillingSection() {
  const [selected, setSelected] = React.useState<Invoice | null>(null)
  const [open, setOpen] = React.useState(false)

  const paidTotal = INVOICES.filter((i) => i.status === "Pago").reduce(
    (acc, i) => acc + i.amount,
    0
  )
  const pendingTotal = INVOICES.filter((i) => i.status !== "Pago").reduce(
    (acc, i) => acc + i.amount,
    0
  )

  function openInvoice(invoice: Invoice) {
    setSelected(invoice)
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardPanel
          title="Plano atual"
          description="Assinatura e uso da conta."
          action={<Badge variant="secondary">Pro anual</Badge>}
        >
          <div className="flex items-baseline gap-1 text-3xl font-semibold tracking-tight text-foreground">
            <span>$</span>
            <AnimatedNumber value={290} />
            <span className="text-base text-muted-foreground">/mês</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Próxima cobrança em 2025-12-01
          </p>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Assentos</span>
              <span className="font-medium text-foreground">7 de 10</span>
            </div>
            <Progress value={70} />
          </div>
          <Button size="sm" className="mt-4 w-full gap-1.5">
            <Sparkles className="size-4" />
            Fazer upgrade
          </Button>
        </DashboardPanel>

        <DashboardPanel
          title="Método de pagamento"
          description="Cartão padrão da conta."
        >
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Visa •••• 4242</p>
              <p className="text-xs text-muted-foreground">Expira 09/2027</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full gap-1.5"
            onClick={() => toast("Editar método de pagamento")}
          >
            <Wallet className="size-4" />
            Atualizar cartão
          </Button>
        </DashboardPanel>

        <DashboardPanel title="Resumo" description="Totais do ciclo atual.">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <span className="text-sm text-muted-foreground">Pago</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {money(paidTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <span className="text-sm text-muted-foreground">Em aberto</span>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {money(pendingTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <span className="text-sm text-muted-foreground">Faturas</span>
              <span className="text-sm font-semibold text-foreground">
                {INVOICES.length}
              </span>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Histórico de faturas"
        description="Clique em uma fatura para ver os detalhes."
        action={<Badge variant="outline">2025</Badge>}
      >
        <div className="max-h-[420px] overflow-y-auto">
          <TableFluid>
            <TableFluidHeader>
              <TableFluidRow>
                <TableFluidHead>Fatura</TableFluidHead>
                <TableFluidHead className="hidden sm:table-cell">
                  Método
                </TableFluidHead>
                <TableFluidHead>Status</TableFluidHead>
                <TableFluidHead className="text-right">Valor</TableFluidHead>
                <TableFluidHead className="text-right">Ações</TableFluidHead>
              </TableFluidRow>
            </TableFluidHeader>
            <TableFluidBody>
              {INVOICES.map((inv, i) => (
                <TableFluidRow
                  key={inv.id}
                  index={i}
                  className="cursor-pointer"
                  onClick={() => openInvoice(inv)}
                >
                  <TableFluidCell>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-medium text-foreground">
                        {inv.id}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {inv.date} · {inv.plan}
                      </p>
                    </div>
                  </TableFluidCell>
                  <TableFluidCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {inv.method}
                  </TableFluidCell>
                  <TableFluidCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full ${invoiceDot(inv.status)}`}
                      />
                      <Badge variant={invoiceVariant(inv.status)}>
                        {inv.status}
                      </Badge>
                    </span>
                  </TableFluidCell>
                  <TableFluidCell className="text-right font-medium text-foreground">
                    {money(inv.amount)}
                  </TableFluidCell>
                  <TableFluidCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.success(`Fatura ${inv.id} baixada`)
                      }}
                    >
                      <Download className="size-4" />
                      <span className="hidden sm:inline">Baixar</span>
                    </Button>
                  </TableFluidCell>
                </TableFluidRow>
              ))}
            </TableFluidBody>
          </TableFluid>
        </div>
      </DashboardPanel>

      <InvoiceDetail invoice={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}

function SettingsSection() {
  const [emailNotif, setEmailNotif] = React.useState(true)
  const [weeklyReport, setWeeklyReport] = React.useState(false)
  const [twoFactor, setTwoFactor] = React.useState(true)
  const [plan, setPlan] = React.useState("pro")
  const [workspace, setWorkspace] = React.useState("Nimbus Inc.")
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS)

  function setRole(id: string, role: Member["role"]) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
  }

  function removeMember(id: string) {
    const target = members.find((m) => m.id === id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
    if (target) toast(`${target.name} removido da equipe`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardPanel
          title="Workspace"
          description="Informações básicas da sua organização."
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ws-name"
                className="text-[13px] font-medium text-foreground"
              >
                Nome do workspace
              </label>
              <Input
                id="ws-name"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="Sua empresa"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-foreground">
                Plano de cobrança
              </span>
              <SelectFluid value={plan} onValueChange={setPlan}>
                <SelectTriggerFluid placeholder="Escolha um plano…" />
                <SelectContentFluid>
                  <SelectItemFluid index={0} value="free">
                    Gratuito
                  </SelectItemFluid>
                  <SelectItemFluid index={1} value="pro">
                    Pro
                  </SelectItemFluid>
                  <SelectItemFluid index={2} value="enterprise">
                    Enterprise
                  </SelectItemFluid>
                </SelectContentFluid>
              </SelectFluid>
            </div>

            <Button
              size="sm"
              className="self-start"
              onClick={() => toast.success("Workspace salvo")}
            >
              Salvar alterações
            </Button>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Preferências" description="Notificações e segurança da conta.">
          <div className="flex flex-col divide-y divide-border">
            <PreferenceRow
              title="Notificações por e-mail"
              description="Receba alertas de atividade importante."
            >
              <SwitchFluid
                label={emailNotif ? "Ativado" : "Desativado"}
                checked={emailNotif}
                onToggle={() => setEmailNotif((v) => !v)}
              />
            </PreferenceRow>
            <PreferenceRow
              title="Relatório semanal"
              description="Um resumo dos KPIs toda segunda-feira."
            >
              <SwitchFluid
                label={weeklyReport ? "Ativado" : "Desativado"}
                checked={weeklyReport}
                onToggle={() => setWeeklyReport((v) => !v)}
              />
            </PreferenceRow>
            <PreferenceRow
              title="Autenticação em dois fatores"
              description="Camada extra de segurança no login."
            >
              <SwitchFluid
                label={twoFactor ? "Ativado" : "Desativado"}
                checked={twoFactor}
                onToggle={() => setTwoFactor((v) => !v)}
              />
            </PreferenceRow>
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Membros da equipe"
        description={`${members.length} ${members.length === 1 ? "pessoa" : "pessoas"} com acesso ao workspace.`}
        action={
          <Badge variant="outline" className="gap-1">
            <Users className="size-3.5" />
            {members.length}
          </Badge>
        }
      >
        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Nenhum membro na equipe. Convide alguém para começar.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Avatar className="size-9 border border-border">
                  <AvatarImage
                    src={`https://picsum.photos/seed/${m.seed}/64/64`}
                    alt={m.name}
                  />
                  <AvatarFallback>{m.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {m.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.email}
                  </p>
                </div>
                <div className="w-36 shrink-0">
                  {m.role === "owner" ? (
                    <Badge variant="secondary" className="w-full justify-center">
                      {ROLE_LABEL.owner}
                    </Badge>
                  ) : (
                    <SelectFluid
                      value={m.role}
                      onValueChange={(v) => setRole(m.id, v as Member["role"])}
                    >
                      <SelectTriggerFluid placeholder="Papel" />
                      <SelectContentFluid>
                        <SelectItemFluid index={0} value="admin">
                          {ROLE_LABEL.admin}
                        </SelectItemFluid>
                        <SelectItemFluid index={1} value="member">
                          {ROLE_LABEL.member}
                        </SelectItemFluid>
                      </SelectContentFluid>
                    </SelectFluid>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${m.name}`}
                  disabled={m.role === "owner"}
                  onClick={() => removeMember(m.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>
    </div>
  )
}

function PreferenceRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

/* Diálogo de criação acionado pelo botão "Novo" da topbar. */
function CreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState("")
  const [plan, setPlan] = React.useState("pro")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const label = name.trim() || "Novo cliente"
    toast.success(`${label} criado no plano ${plan === "pro" ? "Pro" : plan === "enterprise" ? "Enterprise" : "Gratuito"}`)
    setName("")
    setPlan("pro")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>
            Cadastre um cliente e escolha o plano inicial.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new-name"
              className="text-[13px] font-medium text-foreground"
            >
              Nome
            </label>
            <Input
              id="new-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Aurora Vale"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-foreground">Plano</span>
            <SelectFluid value={plan} onValueChange={setPlan}>
              <SelectTriggerFluid placeholder="Escolha um plano…" />
              <SelectContentFluid>
                <SelectItemFluid index={0} value="free">
                  Gratuito
                </SelectItemFluid>
                <SelectItemFluid index={1} value="pro">
                  Pro
                </SelectItemFluid>
                <SelectItemFluid index={2} value="enterprise">
                  Enterprise
                </SelectItemFluid>
              </SelectContentFluid>
            </SelectFluid>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 composição                                  */
/* -------------------------------------------------------------------------- */

export function SaasDashboardPro() {
  const [section, setSection] = React.useState<SectionId>("overview")
  const [createOpen, setCreateOpen] = React.useState(false)
  const { resolvedTheme } = useTheme()

  return (
    <div className="flex min-h-[70vh] w-full overflow-hidden rounded-xl border border-border bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border bg-card/40 p-4 md:flex">
        <div className="mb-4 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </span>
          <span className="text-sm font-semibold">Nimbus</span>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Navegação principal">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = item.id === section
            return (
              <Button
                key={item.id}
                variant={active ? "secondary" : "ghost"}
                className="justify-start gap-2"
                aria-current={active ? "page" : undefined}
                onClick={() => setSection(item.id)}
              >
                <Icon className="size-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>
        <div className="mt-auto rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium">Plano Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            7 dias restantes no teste.
          </p>
          <Button
            size="sm"
            className="mt-3 w-full"
            onClick={() => setSection("billing")}
          >
            Fazer upgrade
          </Button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold">{SECTION_TITLES[section]}</h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Tempo real
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 sm:inline-flex"
            >
              <Search className="size-4" />
              Buscar
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notificações">
              <Bell className="size-4" />
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Novo
            </Button>

            <Separator orientation="vertical" className="hidden h-6 sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Menu do usuário"
                >
                  <Avatar className="size-8 border border-border">
                    <AvatarImage
                      src="https://picsum.photos/seed/aurora.vale/64/64"
                      alt="Aurora Vale"
                    />
                    <AvatarFallback>AV</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium text-foreground">Aurora Vale</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    aurora@nimbus.io
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toast("Abrindo perfil")}>
                  <User className="size-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSection("settings")}>
                  <Settings className="size-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSection("billing")}>
                  <Receipt className="size-4" />
                  Cobrança
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => toast("Sessão encerrada")}
                >
                  <LogOut className="size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Navegação compacta (mobile) */}
        <div className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {NAV.map((item) => {
            const active = item.id === section
            return (
              <Button
                key={item.id}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                aria-current={active ? "page" : undefined}
                onClick={() => setSection(item.id)}
              >
                {item.label}
              </Button>
            )
          })}
        </div>

        {/* Body */}
        <div className="max-h-[78vh] flex-1 overflow-y-auto p-4 sm:p-6">
          {section === "overview" ? <OverviewSection /> : null}
          {section === "analytics" ? <AnalyticsSection /> : null}
          {section === "customers" ? <CustomersSection /> : null}
          {section === "billing" ? <BillingSection /> : null}
          {section === "settings" ? <SettingsSection /> : null}
        </div>
      </div>

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </div>
  )
}
