/**
 * Composição "Dashboard SaaS Completo" (saas-dashboard-pro).
 *
 * App de gestão NAVEGÁVEL montado exclusivamente com componentes do registry:
 *  - AnimatedNumber (KPIs animados)
 *  - GitHubContributions (heatmap de atividade — helper determinístico)
 *  - TableFluid + sub (tabela de clientes filtrável/paginada)
 *  - Tabs/TabsList/TabsTrigger/TabsContent (visões em Analytics)
 *  - Dialog/DialogContent/... (detalhe do cliente em overlay)
 *  - SwitchFluid / SelectFluid / Input (preferências em Settings)
 *  - Badge (status/plano) + Button (navegação/ações)
 *
 * Estado real via useState: a seção ativa troca o conteúdo central; a busca
 * filtra as linhas; a paginação alterna o conjunto; a linha abre o detalhe;
 * os toggles/abas alteram estado visível. Sem backend (tudo mockado).
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
} from "lucide-react"

import {
  Button,
  Badge,
  Input,
  AnimatedNumber,
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
} from "@/components/ui"
import type { ContributionDay } from "@/components/ui/github-contributions"

/* -------------------------------------------------------------------------- */
/*                                   tipos                                     */
/* -------------------------------------------------------------------------- */

type SectionId = "overview" | "analytics" | "customers" | "settings"

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

/* -------------------------------------------------------------------------- */
/*                                   dados                                     */
/* -------------------------------------------------------------------------- */

const OVERVIEW_KPIS: Kpi[] = [
  { label: "MRR", value: 48290, prefix: "$", delta: 12.4, icon: DollarSign },
  { label: "Clientes ativos", value: 1284, delta: 8.1, icon: Users },
  { label: "Churn", value: 2, suffix: ".3%", delta: -0.6, icon: TrendingDown },
  { label: "NPS", value: 72, delta: 4.0, icon: Gauge },
]

const ANALYTICS_KPIS: Kpi[] = [
  { label: "Visitantes", value: 42810, delta: 9.2, icon: Activity },
  { label: "Cadastros", value: 2179, delta: 5.4, icon: Users },
  { label: "Conversão", value: 5, suffix: ".1%", delta: 1.3, icon: Gauge },
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

const CHANNEL_SERIES = [
  { label: "Orgânico", value: 100 },
  { label: "Indicação", value: 62 },
  { label: "Social", value: 51 },
  { label: "E-mail", value: 38 },
  { label: "Direto", value: 27 },
]

/* Sparkline de retenção (percentuais decrescentes). */
const RETENTION_SPARK = [100, 94, 88, 83, 79, 76, 74, 72, 71, 70]

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
  { id: "settings", label: "Settings", icon: Settings },
]

const SECTION_TITLES: Record<SectionId, string> = {
  overview: "Overview",
  analytics: "Analytics",
  customers: "Customers",
  settings: "Settings",
}

const PAGE_SIZE = 8

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

/* -------------------------------------------------------------------------- */
/*                              sub-componentes                               */
/* -------------------------------------------------------------------------- */

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  const positive = kpi.delta >= 0
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{kpi.label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="flex items-baseline gap-1 text-3xl font-semibold tracking-tight text-foreground">
        {kpi.prefix ? <span>{kpi.prefix}</span> : null}
        <AnimatedNumber value={kpi.value} />
        {kpi.suffix ? (
          <span className="text-2xl text-muted-foreground">{kpi.suffix}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span
          className={
            positive
              ? "inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400"
              : "inline-flex items-center gap-0.5 rounded-md bg-rose-500/10 px-1.5 py-0.5 font-medium text-rose-600 dark:text-rose-400"
          }
        >
          {positive ? "+" : ""}
          {kpi.delta}%
        </span>
        <span className="text-muted-foreground">vs. mês anterior</span>
      </div>
    </div>
  )
}

/* Barras verticais em divs (largura/altura via style inline — nunca classe interpolada). */
function BarChart({
  series,
  accent = "bg-primary",
}: {
  series: { label: string; value: number }[]
  accent?: string
}) {
  const max = Math.max(...series.map((s) => s.value), 1)
  return (
    <div className="flex h-40 items-end gap-1.5">
      {series.map((s) => {
        const pct = (s.value / max) * 100
        return (
          <div
            key={s.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-md ${accent}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* Barras horizontais (canais) — largura via style inline. */
function HBarChart({ series }: { series: { label: string; value: number }[] }) {
  const max = Math.max(...series.map((s) => s.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {series.map((s) => {
        const pct = (s.value / max) * 100
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">
              {s.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-medium text-foreground">
              {s.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* Sparkline SVG (polyline) a partir de uma série de percentuais. */
function Sparkline({ points }: { points: number[] }) {
  const w = 240
  const h = 56
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = Math.max(max - min, 1)
  const step = points.length > 1 ? w / (points.length - 1) : w
  const coords = points.map((p, i) => {
    const x = i * step
    const y = h - ((p - min) / span) * (h - 8) - 4
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const linePoints = coords.join(" ")
  const areaPoints = `0,${h} ${linePoints} ${w},${h}`
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-14 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Tendência de retenção"
    >
      <polygon points={areaPoints} className="fill-primary/10" />
      <polyline
        points={linePoints}
        fill="none"
        className="stroke-primary"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  seções                                     */
/* -------------------------------------------------------------------------- */

function OverviewSection() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OVERVIEW_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel
            title="Receita por mês"
            description="Evolução do MRR ao longo do ano."
            action={<Badge variant="outline">2025</Badge>}
          >
            <BarChart series={REVENUE_SERIES} />
          </Panel>
        </div>
        <Panel
          title="Retenção"
          description="Coorte dos últimos 10 períodos."
        >
          <Sparkline points={RETENTION_SPARK} />
          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            <AnimatedNumber value={70} />
            <span className="text-base text-muted-foreground">%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            retenção no período mais recente
          </p>
        </Panel>
      </div>

      <Panel
        title="Atividade da equipe"
        description="Eventos de produto nas últimas 26 semanas."
        action={<Badge variant="outline">Heatmap</Badge>}
      >
        <GitHubContributions data={CONTRIBUTIONS} weeks={26} colorScale="green" />
      </Panel>
    </div>
  )
}

function AnalyticsSection() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ANALYTICS_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <Tabs defaultValue="revenue">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Desempenho
              </h2>
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
            <BarChart series={REVENUE_SERIES} />
          </TabsContent>

          <TabsContent value="channels" className="mt-5">
            <HBarChart series={CHANNEL_SERIES} />
          </TabsContent>

          <TabsContent value="retention" className="mt-5">
            <Sparkline points={RETENTION_SPARK} />
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {RETENTION_SPARK.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-muted/40 p-3 text-center"
                >
                  <p className="text-lg font-semibold text-foreground">{p}%</p>
                  <p className="text-[10px] text-muted-foreground">
                    Mês {i + 1}
                  </p>
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
              <DetailRow icon={CreditCard} label="Plano">
                <Badge variant={planVariant(customer.plan)}>
                  {customer.plan}
                </Badge>
              </DetailRow>
              <DetailRow icon={Activity} label="Status">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${statusDot(customer.status)}`}
                  />
                  {customer.status}
                </span>
              </DetailRow>
              <DetailRow icon={DollarSign} label="MRR">
                <span className="font-medium text-foreground">
                  ${customer.mrr.toLocaleString()}
                </span>
              </DetailRow>
              <DetailRow icon={Users} label="País">
                <span className="text-foreground">{customer.country}</span>
              </DetailRow>
              <DetailRow icon={Mail} label="ID">
                <span className="font-mono text-xs text-foreground">
                  {customer.id}
                </span>
              </DetailRow>
              <DetailRow icon={Activity} label="Cliente desde">
                <span className="text-foreground">{customer.since}</span>
              </DetailRow>
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

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  )
}

function CustomersSection() {
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(0)
  const [selected, setSelected] = React.useState<CustomerRow | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CUSTOMERS
    return CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.plan.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    )
  }, [query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  )

  function handleSearch(value: string) {
    setQuery(value)
    setPage(0)
  }

  function openCustomer(customer: CustomerRow) {
    setSelected(customer)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Clientes"
        description={`${filtered.length} de ${CUSTOMERS.length} clientes`}
        action={
          <div className="relative w-full max-w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar cliente…"
              aria-label="Buscar cliente"
              className="pl-8"
            />
          </div>
        }
      >
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
                    ${row.mrr.toLocaleString()}
                  </TableFluidCell>
                </TableFluidRow>
              ))}
              {pageRows.length === 0 ? (
                <TableFluidRow index={0}>
                  <TableFluidCell className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum cliente encontrado para “{query}”.
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
      </Panel>

      <CustomerDetail
        customer={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

function SettingsSection() {
  const [emailNotif, setEmailNotif] = React.useState(true)
  const [weeklyReport, setWeeklyReport] = React.useState(false)
  const [twoFactor, setTwoFactor] = React.useState(true)
  const [plan, setPlan] = React.useState("pro")
  const [workspace, setWorkspace] = React.useState("Nimbus Inc.")

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Panel
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
        </div>
      </Panel>

      <Panel
        title="Preferências"
        description="Notificações e segurança da conta."
      >
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
      </Panel>
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

/* -------------------------------------------------------------------------- */
/*                                 composição                                  */
/* -------------------------------------------------------------------------- */

export function SaasDashboardPro() {
  const [section, setSection] = React.useState<SectionId>("overview")

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
          <Button size="sm" className="mt-3 w-full">
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
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Novo
            </Button>
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
          {section === "settings" ? <SettingsSection /> : null}
        </div>
      </div>
    </div>
  )
}
