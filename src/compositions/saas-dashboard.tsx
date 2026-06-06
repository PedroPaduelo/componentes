/**
 * Composição "SaaS Dashboard".
 *
 * Tela composta exclusivamente por componentes do registry da vitrine:
 *  - Button + Badge (topbar / sidebar / ações)
 *  - AnimatedNumber (KPIs animados nos cards de métrica)
 *  - GitHubContributions (heatmap de atividade)
 *  - TableFluid + TableFluidHeader/Body/Row/Head/Cell (tabela de dados)
 *  - Tabs + TabsList/TabsTrigger/TabsContent (alternância de visões)
 */
import * as React from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Activity,
  CreditCard,
  LayoutDashboard,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
} from "lucide-react"

import {
  Button,
  Badge,
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
  Tree,
  TOCMinimap,
} from "@/components/ui"
import type { ContributionDay } from "@/components/ui/github-contributions"

/* -------------------------------------------------------------------------- */
/*                                   dados                                     */
/* -------------------------------------------------------------------------- */

type Kpi = {
  label: string
  value: number
  prefix?: string
  suffix?: string
  delta: number
  icon: React.ComponentType<{ className?: string }>
}

const KPIS: Kpi[] = [
  {
    label: "Receita mensal",
    value: 48290,
    prefix: "$",
    delta: 12.4,
    icon: DollarSign,
  },
  {
    label: "Usuários ativos",
    value: 12840,
    delta: 8.1,
    icon: Users,
  },
  {
    label: "Taxa de conversão",
    value: 4,
    suffix: ".7%",
    delta: 1.9,
    icon: Activity,
  },
  {
    label: "Assinaturas",
    value: 1320,
    delta: -2.3,
    icon: CreditCard,
  },
]

type CustomerRow = {
  id: string
  name: string
  email: string
  plan: "Free" | "Pro" | "Enterprise"
  status: "Ativo" | "Pendente" | "Cancelado"
  mrr: number
  seed: string
}

const CUSTOMERS: CustomerRow[] = [
  {
    id: "INV-1042",
    name: "Aurora Vale",
    email: "aurora@northwind.io",
    plan: "Enterprise",
    status: "Ativo",
    mrr: 1200,
    seed: "aurora",
  },
  {
    id: "INV-1043",
    name: "Caleb Monroe",
    email: "caleb@monroe.dev",
    plan: "Pro",
    status: "Ativo",
    mrr: 290,
    seed: "caleb",
  },
  {
    id: "INV-1044",
    name: "Dahlia Reyes",
    email: "dahlia@reyes.studio",
    plan: "Pro",
    status: "Pendente",
    mrr: 290,
    seed: "dahlia",
  },
  {
    id: "INV-1045",
    name: "Elias Brandt",
    email: "elias@brandt.co",
    plan: "Free",
    status: "Cancelado",
    mrr: 0,
    seed: "elias",
  },
  {
    id: "INV-1046",
    name: "Mira Sandoval",
    email: "mira@sandoval.app",
    plan: "Enterprise",
    status: "Ativo",
    mrr: 1500,
    seed: "mira",
  },
]

type ChannelRow = {
  channel: string
  visitors: number
  signups: number
  rate: string
}

const CHANNELS: ChannelRow[] = [
  { channel: "Busca orgânica", visitors: 18420, signups: 842, rate: "4.6%" },
  { channel: "Indicação", visitors: 9210, signups: 612, rate: "6.6%" },
  { channel: "Social", visitors: 7640, signups: 318, rate: "4.2%" },
  { channel: "E-mail", visitors: 4120, signups: 286, rate: "6.9%" },
  { channel: "Direto", visitors: 3380, signups: 121, rate: "3.6%" },
]

/* Heatmap de atividade — gerado de forma determinística (sem aleatoriedade). */
function buildContributions(weeks: number): ContributionDay[] {
  const days: ContributionDay[] = []
  const total = weeks * 7
  const start = new Date("2025-01-06T00:00:00")
  for (let i = 0; i < total; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const iso = date.toISOString().slice(0, 10)
    // padrão suave: ondas semanais + tendência crescente, fins de semana mais fracos
    const dow = date.getDay()
    const weekend = dow === 0 || dow === 6
    const base = Math.round(
      (Math.sin(i / 5) + 1) * 4 + (i / total) * 6 + (weekend ? -2 : 1)
    )
    days.push({ date: iso, count: Math.max(0, base) })
  }
  return days
}

const CONTRIBUTIONS = buildContributions(30)

const NAV = [
  { label: "Visão geral", icon: LayoutDashboard, active: true },
  { label: "Análises", icon: BarChart3, active: false },
  { label: "Clientes", icon: Users, active: false },
  { label: "Configurações", icon: Settings, active: false },
]

/* Árvore de arquivos do projeto exibida na sidebar. */
const PROJECT_FILES = [
  "src/app/layout.tsx",
  "src/app/dashboard/page.tsx",
  "src/app/dashboard/settings.tsx",
  "src/components/kpi-card.tsx",
  "src/components/data-table.tsx",
  "src/lib/api.ts",
  "src/lib/utils.ts",
  "package.json",
]

/* Índice de navegação das seções do dashboard. */
const TOC_ITEMS = [
  { id: "section-kpis", label: "KPIs" },
  { id: "section-activity", label: "Atividade" },
  { id: "section-breakdown", label: "Detalhamento" },
]

/* -------------------------------------------------------------------------- */
/*                              sub-componentes                                */
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
          {positive ? (
            <ArrowUpRight className="size-3" />
          ) : (
            <ArrowDownRight className="size-3" />
          )}
          {Math.abs(kpi.delta)}%
        </span>
        <span className="text-muted-foreground">vs. mês anterior</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 composição                                  */
/* -------------------------------------------------------------------------- */

export function SaasDashboard() {
  return (
    <div className="flex min-h-[40vh] w-full overflow-hidden rounded-xl border border-border bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border bg-card/40 p-4 lg:flex">
        <div className="mb-4 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </span>
          <span className="text-sm font-semibold">Nimbus</span>
        </div>
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              className="justify-start gap-2"
            >
              <Icon className="size-4" />
              {item.label}
            </Button>
          )
        })}
        <div className="mt-auto rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium">Plano Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            7 dias restantes no teste.
          </p>
          <Button size="sm" className="mt-3 w-full">
            Fazer upgrade
          </Button>
        </div>

        {/* Árvore de arquivos do projeto */}
        <div className="mt-4">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Arquivos do projeto
          </p>
          <Tree
            data={PROJECT_FILES}
            initialExpansion="open"
            density="compact"
            style={
              { "--trees-height": "220px" } as React.CSSProperties &
                Record<`--${string}`, string>
            }
          />
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold">Visão geral</h1>
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
              Novo relatório
            </Button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-col gap-6 p-4 sm:p-6">
          {/* Índice de navegação das seções */}
          <TOCMinimap
            items={TOC_ITEMS}
            orientation="horizontal"
            showProgress={false}
            className="flex-wrap rounded-lg border border-border bg-card/40 px-3 py-2"
          />

          {/* KPIs */}
          <section
            id="section-kpis"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {KPIS.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </section>

          {/* Heatmap de atividade */}
          <section
            id="section-activity"
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Atividade da equipe</h2>
                <p className="text-xs text-muted-foreground">
                  Eventos de produto nas últimas 30 semanas.
                </p>
              </div>
              <Badge variant="outline">Heatmap</Badge>
            </div>
            <GitHubContributions
              data={CONTRIBUTIONS}
              weeks={30}
              colorScale="green"
            />
          </section>

          {/* Tabelas com abas */}
          <section
            id="section-breakdown"
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <Tabs defaultValue="customers">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Detalhamento</h2>
                  <p className="text-xs text-muted-foreground">
                    Alterne entre clientes e canais de aquisição.
                  </p>
                </div>
                <TabsList>
                  <TabsTrigger value="customers">Clientes</TabsTrigger>
                  <TabsTrigger value="channels">Canais</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="customers" className="mt-4">
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
                    {CUSTOMERS.map((row, i) => (
                      <TableFluidRow key={row.id} index={i}>
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
                          <Badge variant={planVariant(row.plan)}>
                            {row.plan}
                          </Badge>
                        </TableFluidCell>
                        <TableFluidCell>
                          <Badge variant={statusVariant(row.status)}>
                            {row.status}
                          </Badge>
                        </TableFluidCell>
                        <TableFluidCell className="text-right font-medium text-foreground">
                          ${row.mrr.toLocaleString()}
                        </TableFluidCell>
                      </TableFluidRow>
                    ))}
                  </TableFluidBody>
                </TableFluid>
              </TabsContent>

              <TabsContent value="channels" className="mt-4">
                <TableFluid>
                  <TableFluidHeader>
                    <TableFluidRow>
                      <TableFluidHead>Canal</TableFluidHead>
                      <TableFluidHead className="text-right">
                        Visitantes
                      </TableFluidHead>
                      <TableFluidHead className="text-right">
                        Cadastros
                      </TableFluidHead>
                      <TableFluidHead className="text-right">
                        Conversão
                      </TableFluidHead>
                    </TableFluidRow>
                  </TableFluidHeader>
                  <TableFluidBody>
                    {CHANNELS.map((row, i) => (
                      <TableFluidRow key={row.channel} index={i}>
                        <TableFluidCell className="font-medium text-foreground">
                          {row.channel}
                        </TableFluidCell>
                        <TableFluidCell className="text-right">
                          {row.visitors.toLocaleString()}
                        </TableFluidCell>
                        <TableFluidCell className="text-right">
                          {row.signups.toLocaleString()}
                        </TableFluidCell>
                        <TableFluidCell className="text-right font-medium text-foreground">
                          {row.rate}
                        </TableFluidCell>
                      </TableFluidRow>
                    ))}
                  </TableFluidBody>
                </TableFluid>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  )
}
