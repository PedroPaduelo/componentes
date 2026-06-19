/**
 * Composição "AI Dashboard Builder" (ai-dashboard-builder).
 *
 * Plataforma de dashboards comandada por chat de IA em layout de 4 painéis:
 *  - Painel esquerdo 1 (rail de dashboards, w-60): lista de dashboards com
 *    seleção, criação, exclusão e rename inline (DashboardRail).
 *  - Painel esquerdo 2 (chat, w-80): thread com ChatMessageFluid + blocos
 *    ThinkingStepsFluid + composer InputMessageFluid.
 *  - Painel central (canvas, flex-1): DashboardFilterBar no topo + grid de
 *    ChartWidgets (KpiCard, BarChart, LineChart, DonutChart) montados por IA.
 *  - Painel direito (inspector, w-72): ChartTemplateGallery +
 *    QueryHistoryList + estado do agente (modelo, passos, tempo).
 *
 * Cada dashboard tem seu próprio estado (widgets, histórico, mensagens e
 * filtros). Trocar de dashboard troca o conteúdo dos 3 painéis de conteúdo.
 *
 * Interatividade real: o user envia um prompt → aparecem thinking steps →
 * depois de um setTimeout um novo ChartWidget é adicionado ao dashboard ativo
 * e a mensagem do assistente aparece no chat. Mock data determinístico (sem
 * aleatoriedade). Mobile: rail/chat/inspector viram overlay (absolute dentro
 * do card).
 */
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Activity,
  BarChart3,
  Brain,
  Cpu,
  Database,
  DollarSign,
  LayoutDashboard,
  LineChart as LineChartIcon,
  PanelLeft,
  PanelRight,
  Pencil,
  PieChart,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { ButtonFluid } from "@/components/ui/button-fluid"
import { BadgeFluid } from "@/components/ui/badge-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import { InputMessageFluid } from "@/components/ui/input-message-fluid"
import { ThinkingIndicatorFluid } from "@/components/ui/thinking-indicator-fluid"
import {
  ChatMessageFluid,
  ThinkingStepsFluid,
  ThinkingStepsHeaderFluid,
  ThinkingStepsContentFluid,
  ThinkingStepFluid,
  ThinkingStepSourcesFluid,
  ThinkingStepSourceFluid,
  ChartWidget,
  KpiCard,
  BarChart,
  LineChart,
  DonutChart,
  DashboardFilterBar,
  ChartTemplateGallery,
  QueryHistoryList,
} from "@/components/ui/index"
import type {
  BarChartDatum,
  LineSeries,
  DonutSegment,
} from "@/components/ui/index"
import type { IconName } from "@/lib/icon-context"
import type { BadgeColor } from "@/components/ui/badge-fluid-variants"
import type { QueryHistoryItem } from "@/components/ui/query-history-list"
import type { ChartTemplate } from "@/components/ui/chart-template-gallery"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   types                                     */
/* -------------------------------------------------------------------------- */

type Role = "user" | "assistant"

interface ChatMsg {
  id: number
  from: Role
  text: string
  time?: string
}

type WidgetKind = "kpi" | "bar" | "line" | "donut"

interface CanvasWidget {
  id: string
  kind: WidgetKind
  title: string
  chartType?: string
  query?: string
  durationMs?: number
  // KPI
  kpiLabel?: string
  kpiValue?: number
  kpiPrefix?: string
  kpiSuffix?: string
  kpiDelta?: number
  // Bar / Line / Donut data
  barSeries?: BarChartDatum[]
  barAccent?: string
  lineSeries?: LineSeries[]
  lineXLabels?: string[]
  donutSegments?: DonutSegment[]
}

interface ThinkingStepSpec {
  icon: IconName
  label: string
  description?: string
  sources?: { label: string; color: BadgeColor }[]
  details?: { summary: string; items: string[] }
}

interface FilterState {
  dateFrom?: Date
  dateTo?: Date
  dataSource: string
  chips: { id: string; label: string }[]
}

interface Dashboard {
  id: string
  name: string
  icon: LucideIcon
  widgets: CanvasWidget[]
  history: QueryHistoryItem[]
  messages: ChatMsg[]
  filters: FilterState
}

/* -------------------------------------------------------------------------- */
/*                                mock data                                    */
/* -------------------------------------------------------------------------- */

const SUGGESTIONS = [
  "Mostre o MRR dos últimos 30 dias",
  "Crie um gráfico de vendas por mês",
  "Adicione um donut de distribuição",
]

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    id: 1,
    from: "assistant",
    text: "Olá! Sou seu agente de dashboards. Descreva o que você quer visualizar e eu construo o gráfico pra você.",
    time: "09:40",
  },
  {
    id: 2,
    from: "user",
    text: "Quero ver o MRR atual, vendas por mês e a tendência de receita.",
    time: "09:41",
  },
  {
    id: 3,
    from: "assistant",
    text: "Perfeito! Gerei 3 widgets para você: KPI de MRR, gráfico de barras de vendas mensais e linha de tendência. Quer adicionar mais algum indicador?",
    time: "09:41",
  },
]

const INITIAL_WIDGETS: CanvasWidget[] = [
  {
    id: "w-mrr",
    kind: "kpi",
    title: "MRR",
    kpiLabel: "MRR",
    kpiValue: 84520,
    kpiPrefix: "$",
    kpiDelta: 12.5,
  },
  {
    id: "w-bar",
    kind: "bar",
    title: "Vendas por mês",
    chartType: "bar",
    query: "SELECT date_trunc('month', created_at) AS month, COUNT(*) AS total FROM orders GROUP BY 1 ORDER BY 1 DESC LIMIT 6",
    durationMs: 42,
    barSeries: [
      { label: "Jan", value: 320 },
      { label: "Fev", value: 410 },
      { label: "Mar", value: 380 },
      { label: "Abr", value: 520 },
      { label: "Mai", value: 470 },
      { label: "Jun", value: 610 },
    ],
    barAccent: "bg-primary",
  },
  {
    id: "w-line",
    kind: "line",
    title: "Tendência de receita",
    chartType: "line",
    query: "SELECT date_trunc('day', created_at) AS day, SUM(amount) AS revenue FROM orders GROUP BY 1 ORDER BY 1 DESC LIMIT 30",
    durationMs: 58,
    lineSeries: [
      {
        label: "Receita",
        data: [120, 135, 128, 142, 155, 148, 162, 175, 168, 182],
        className: "stroke-primary",
      },
      {
        label: "Meta",
        data: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190],
        className: "stroke-emerald-500",
      },
    ],
    lineXLabels: ["01", "04", "07", "10", "13", "16", "19", "22", "25", "28"],
  },
  {
    id: "w-donut",
    kind: "donut",
    title: "Distribuição de planos",
    chartType: "donut",
    query: "SELECT plan, COUNT(*) AS total FROM subscriptions GROUP BY plan",
    durationMs: 31,
    donutSegments: [
      { label: "Pro", value: 45, className: "stroke-primary" },
      { label: "Starter", value: 30, className: "stroke-emerald-500" },
      { label: "Enterprise", value: 15, className: "stroke-blue-500" },
      { label: "Free", value: 10, className: "stroke-muted-foreground" },
    ],
  },
]

const THINKING_STEPS: ThinkingStepSpec[] = [
  {
    icon: "search",
    label: "Analisando pedido",
    description: "Identificando a métrica e o período solicitados.",
  },
  {
    icon: "globe",
    label: "Escolhendo template",
    sources: [
      { label: "templates", color: "blue" },
      { label: "datasource", color: "green" },
    ],
  },
  {
    icon: "check",
    label: "Escrevendo query SQL",
    description: "Gerando a consulta otimizada para o warehouse.",
    details: {
      summary: "Ver query",
      items: [
        "SELECT date_trunc('day', created_at) AS day,",
        "COUNT(*) AS total FROM orders GROUP BY 1",
        "ORDER BY 1 DESC LIMIT 30",
      ],
    },
  },
  {
    icon: "check",
    label: "Executando query",
    description: "Warehouse respondeu em 42ms.",
  },
  {
    icon: "check",
    label: "Renderizando gráfico",
    description: "Montando o widget no canvas.",
  },
]

const TEMPLATES: ChartTemplate[] = [
  {
    id: "kpi",
    name: "KPI Card",
    icon: TrendingUp,
    description: "Métrica única com delta",
  },
  {
    id: "bar",
    name: "Bar Chart",
    icon: BarChart3,
    description: "Comparação entre categorias",
  },
  {
    id: "line",
    name: "Line Chart",
    icon: LineChartIcon,
    description: "Tendência ao longo do tempo",
  },
  {
    id: "donut",
    name: "Donut Chart",
    icon: PieChart,
    description: "Distribuição proporcional",
  },
]

const INITIAL_HISTORY: QueryHistoryItem[] = [
  {
    id: "q1",
    sql: "SELECT date_trunc('month', created_at) AS month, COUNT(*) AS total FROM orders GROUP BY 1 ORDER BY 1 DESC LIMIT 6",
    durationMs: 42,
    timeLabel: "há 5 min",
  },
  {
    id: "q2",
    sql: "SELECT date_trunc('day', created_at) AS day, SUM(amount) AS revenue FROM orders GROUP BY 1 ORDER BY 1 DESC LIMIT 30",
    durationMs: 58,
    timeLabel: "há 8 min",
  },
  {
    id: "q3",
    sql: "SELECT plan, COUNT(*) AS total FROM subscriptions GROUP BY plan",
    durationMs: 31,
    timeLabel: "há 12 min",
  },
]

/** Pool de widgets que o agente "cria" em resposta a prompts. Determinístico. */
const WIDGET_POOL: CanvasWidget[] = [
  {
    id: "gen-churn",
    kind: "donut",
    title: "Taxa de churn",
    chartType: "donut",
    query: "SELECT status, COUNT(*) AS total FROM subscriptions GROUP BY status",
    durationMs: 27,
    donutSegments: [
      { label: "Ativos", value: 78, className: "stroke-emerald-500" },
      { label: "Churn", value: 22, className: "stroke-rose-500" },
    ],
  },
  {
    id: "gen-mrr-line",
    kind: "line",
    title: "MRR — 30 dias",
    chartType: "line",
    query: "SELECT date_trunc('day', created_at) AS day, SUM(amount) AS mrr FROM invoices WHERE status='paid' GROUP BY 1 ORDER BY 1 DESC LIMIT 30",
    durationMs: 35,
    lineSeries: [
      {
        label: "MRR",
        data: [210, 225, 218, 240, 255, 248, 270, 285, 278, 302, 315, 308, 330, 345],
        className: "stroke-primary",
      },
    ],
    lineXLabels: ["01", "03", "05", "07", "09", "11", "13", "15", "17", "19", "21", "23", "25", "27"],
  },
  {
    id: "gen-active-kpi",
    kind: "kpi",
    title: "Usuários ativos",
    kpiLabel: "DAU",
    kpiValue: 12480,
    kpiSuffix: "",
    kpiDelta: 8.3,
  },
  {
    id: "gen-bar-region",
    kind: "bar",
    title: "Vendas por região",
    chartType: "bar",
    query: "SELECT region, SUM(total) AS revenue FROM orders GROUP BY region ORDER BY revenue DESC",
    durationMs: 39,
    barSeries: [
      { label: "Norte", value: 480 },
      { label: "Sul", value: 350 },
      { label: "Leste", value: 290 },
      { label: "Oeste", value: 420 },
      { label: "Centro", value: 180 },
    ],
    barAccent: "bg-blue-500",
  },
]

/** Lookup do pool por id, para o seed reaproveitar widgets sem recriá-los. */
const POOL_BY_ID: Record<string, CanvasWidget> = Object.fromEntries(
  WIDGET_POOL.map((w) => [w.id, w]),
)

const DATA_SOURCES = [
  { label: "Warehouse — produção", value: "prod" },
  { label: "Staging", value: "staging" },
  { label: "Sandbox", value: "sandbox" },
]

const REPLY_DELAY_MS = 2200
const STEP_INTERVAL_MS = 400

const ASSISTANT_REPLIES = [
  "Pronto! Adicionei o widget ao canvas. Quer ajustar o período ou adicionar um filtro?",
  "Criei o gráfico com base na sua solicitação. A query rodou em menos de 50ms.",
  "Widget adicionado! Posso gerar uma versão comparativa se quiser.",
  "Aqui está! O gráfico mostra os últimos 30 dias. Quer mudar para o trimestre?",
]

/** Data com offset de N dias a partir de hoje (determinístico via offset). */
function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

/* -------------------------------------------------------------------------- */
/*                          seed de dashboards (multi)                         */
/* -------------------------------------------------------------------------- */

const DASHBOARDS: Dashboard[] = [
  {
    id: "d1",
    name: "Visão geral",
    icon: LayoutDashboard,
    widgets: INITIAL_WIDGETS,
    history: INITIAL_HISTORY,
    messages: INITIAL_MESSAGES,
    filters: {
      dataSource: "prod",
      chips: [{ id: "f-30d", label: "Últimos 30 dias" }],
      dateFrom: daysAgo(30),
      dateTo: daysAgo(0),
    },
  },
  {
    id: "d2",
    name: "Receita & MRR",
    icon: DollarSign,
    widgets: [
      { ...POOL_BY_ID["gen-mrr-line"], id: "d2-mrr-line" },
      { ...POOL_BY_ID["gen-churn"], id: "d2-churn" },
      {
        id: "d2-arr",
        kind: "kpi",
        title: "ARR",
        kpiLabel: "ARR",
        kpiValue: 1014240,
        kpiPrefix: "$",
        kpiDelta: 9.2,
      },
    ],
    history: [
      {
        id: "d2-q1",
        sql: POOL_BY_ID["gen-mrr-line"].query ?? "SELECT 1",
        durationMs: 35,
        timeLabel: "há 3 min",
      },
      {
        id: "d2-q2",
        sql: POOL_BY_ID["gen-churn"].query ?? "SELECT 1",
        durationMs: 27,
        timeLabel: "há 9 min",
      },
    ],
    messages: [
      {
        id: 1,
        from: "assistant",
        text: "Dashboard de receita pronto. Pergunte o que quiser.",
        time: "09:30",
      },
    ],
    filters: {
      dataSource: "prod",
      chips: [{ id: "f-mrr", label: "Plano: Pro" }],
    },
  },
  {
    id: "d3",
    name: "Produto & Uso",
    icon: Activity,
    widgets: [
      { ...POOL_BY_ID["gen-active-kpi"], id: "d3-dau" },
      { ...POOL_BY_ID["gen-bar-region"], id: "d3-bar-region" },
      {
        id: "d3-retention",
        kind: "line",
        title: "Retenção por coorte",
        chartType: "line",
        query:
          "SELECT cohort_day, retained::float / NULLIF(total, 0) AS retention FROM cohort_retention ORDER BY cohort_day LIMIT 8",
        durationMs: 44,
        lineSeries: [
          {
            label: "Retenção",
            data: [100, 92, 85, 80, 76, 73, 70, 68],
            className: "stroke-primary",
          },
        ],
        lineXLabels: ["D0", "D1", "D3", "D7", "D14", "D30", "D60", "D90"],
      },
    ],
    history: [
      {
        id: "d3-q1",
        sql:
          POOL_BY_ID["gen-active-kpi"].query ??
          "SELECT COUNT(DISTINCT user_id) AS dau FROM events WHERE day = current_date",
        durationMs: 33,
        timeLabel: "há 6 min",
      },
      {
        id: "d3-q2",
        sql: POOL_BY_ID["gen-bar-region"].query ?? "SELECT 1",
        durationMs: 39,
        timeLabel: "há 15 min",
      },
    ],
    messages: [
      {
        id: 1,
        from: "assistant",
        text: "Métricas de produto carregadas. O que você quer explorar?",
        time: "09:20",
      },
    ],
    filters: {
      dataSource: "staging",
      chips: [],
    },
  },
]

/* -------------------------------------------------------------------------- */
/*                           sub-componentes do canvas                         */
/* -------------------------------------------------------------------------- */

function WidgetContent({ w }: { w: CanvasWidget }) {
  switch (w.kind) {
    case "kpi":
      return (
        <KpiCard
          label={w.kpiLabel ?? w.title}
          value={w.kpiValue ?? 0}
          prefix={w.kpiPrefix}
          suffix={w.kpiSuffix}
          delta={w.kpiDelta}
          icon={Sparkles}
        />
      )
    case "bar":
      return (
        <BarChart
          series={w.barSeries ?? []}
          accent={w.barAccent ?? "bg-primary"}
        />
      )
    case "line":
      return (
        <LineChart
          series={w.lineSeries ?? []}
          xLabels={w.lineXLabels}
          height="h-36"
        />
      )
    case "donut": {
      const segs = w.donutSegments ?? []
      const total = segs.reduce((a, s) => a + s.value, 0) || 1
      return (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative">
            <DonutChart segments={segs} size={120} thickness={18} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-foreground">
                {total}
              </span>
              <span className="text-[10px] text-muted-foreground">total</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {segs.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block h-2.5 w-2.5 rounded-full",
                    s.className.replace("stroke-", "bg-"),
                  )}
                />
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-xs font-medium tabular-nums text-foreground">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    default:
      return null
  }
}

function CanvasWidgetCard({ w }: { w: CanvasWidget }) {
  if (w.kind === "kpi") {
    return <WidgetContent w={w} />
  }
  return (
    <ChartWidget
      title={w.title}
      chartType={w.chartType}
      query={w.query}
      durationMs={w.durationMs}
      actions={
        <ButtonFluid
          variant="ghost"
          size="icon-sm"
          aria-label="Atualizar widget"
        >
          <RefreshCw className="size-3.5" />
        </ButtonFluid>
      }
    >
      <WidgetContent w={w} />
    </ChartWidget>
  )
}

function CanvasGrid({ widgets }: { widgets: CanvasWidget[] }) {
  if (widgets.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Canvas vazio
          </p>
          <p className="text-[13px] text-muted-foreground">
            Peça algo no chat e eu construo o gráfico pra você.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
      {widgets.map((w) => (
        <CanvasWidgetCard key={w.id} w={w} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                           rail de dashboards (esq.)                          */
/* -------------------------------------------------------------------------- */

function DashboardRail({
  dashboards,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  editingId,
  editName,
  onEditNameChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
}: {
  dashboards: Dashboard[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  editingId: string | null
  editName: string
  onEditNameChange: (v: string) => void
  onStartRename: (id: string) => void
  onCommitRename: () => void
  onCancelRename: () => void
}) {
  const canDelete = dashboards.length > 1

  const commit = (id: string) => {
    const trimmed = editName.trim()
    if (trimmed) onRename(id, trimmed)
    onCommitRename()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[3.25rem] shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="text-sm font-semibold">Dashboards</span>
        <TooltipFluid content="Novo dashboard">
          <ButtonFluid
            variant="ghost"
            size="icon-sm"
            aria-label="Novo dashboard"
            className="ml-auto"
            onClick={onNew}
          >
            <Plus size={16} />
          </ButtonFluid>
        </TooltipFluid>
      </div>

      {/* Lista */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {dashboards.map((d) => {
          const Icon = d.icon
          const isActive = d.id === activeId
          const isEditing = d.id === editingId
          return (
            <div
              key={d.id}
              role="button"
              tabIndex={0}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(d.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelect(d.id)
                }
              }}
              className={cn(
                "group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <input
                    autoFocus
                    value={editName}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onEditNameChange(e.target.value)}
                    onBlur={() => commit(d.id)}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === "Enter") {
                        e.preventDefault()
                        commit(d.id)
                      } else if (e.key === "Escape") {
                        e.preventDefault()
                        onCancelRename()
                      }
                    }}
                    className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-[13px] font-medium text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                ) : (
                  <>
                    <p
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        onStartRename(d.id)
                      }}
                      className="truncate text-[13px] font-medium leading-tight text-foreground"
                    >
                      {d.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {d.widgets.length} widgets
                    </p>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <ButtonFluid
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Renomear ${d.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartRename(d.id)
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </ButtonFluid>
                  {canDelete && (
                    <ButtonFluid
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Excluir ${d.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(d.id)
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </ButtonFluid>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               painel de chat                                */
/* -------------------------------------------------------------------------- */

function ChatPanel({
  messages,
  isThinking,
  currentStep,
  value,
  onValueChange,
  onSend,
  scrollRef,
}: {
  messages: ChatMsg[]
  isThinking: boolean
  currentStep: number
  value: string
  onValueChange: (v: string) => void
  onSend: (text: string) => void
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[3.25rem] shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-3.5" />
        </span>
        <span className="text-sm font-semibold">AI Dashboard Builder</span>
        <BadgeFluid variant="solid" size="sm" color="green" className="ml-auto">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Online
        </BadgeFluid>
      </div>

      {/* Thread */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
      >
        {messages.map((m) => (
          <ChatMessageFluid
            key={m.id}
            from={m.from}
            time={m.time}
          >
            {m.text}
          </ChatMessageFluid>
        ))}

        {isThinking && (
          <div className="flex w-full max-w-[90%] flex-col gap-2 self-start">
            <ThinkingStepsFluid defaultOpen>
              <ThinkingStepsHeaderFluid>
                Construindo dashboard
              </ThinkingStepsHeaderFluid>
              <ThinkingStepsContentFluid>
                {THINKING_STEPS.map((step, i) => {
                  const isLast = i === THINKING_STEPS.length - 1
                  const status =
                    i < currentStep ? "complete" : i === currentStep ? "active" : "pending"
                  return (
                    <ThinkingStepFluid
                      key={step.label}
                      index={i}
                      icon={step.icon}
                      label={step.label}
                      description={step.description}
                      status={status as "complete" | "active" | "pending"}
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
                    </ThinkingStepFluid>
                  )
                })}
              </ThinkingStepsContentFluid>
            </ThinkingStepsFluid>
            <div className="flex items-center gap-2 pl-1 text-[13px] text-muted-foreground">
              <ThinkingIndicatorFluid />
              <span>Gerando gráfico…</span>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border p-3">
        <InputMessageFluid
          value={value}
          onValueChange={onValueChange}
          placeholder="Descreva o gráfico que você quer…"
          onSend={(text) => onSend(text)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onValueChange(s)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              painel inspector                               */
/* -------------------------------------------------------------------------- */

function InspectorPanel({
  selectedTemplate,
  onSelectTemplate,
  queryHistory,
  stepCount,
  elapsedMs,
}: {
  selectedTemplate?: string
  onSelectTemplate: (id: string) => void
  queryHistory: QueryHistoryItem[]
  stepCount: number
  elapsedMs: number
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[3.25rem] shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="text-sm font-semibold">Inspector</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        {/* Agent state */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Brain className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Agente de dashboards
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Auto-piloto ativo
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgeFluid variant="solid" size="sm" color="blue">
              <Cpu className="size-3" />
              GPT-4o
            </BadgeFluid>
            <BadgeFluid variant="solid" size="sm" color="gray">
              {stepCount} passos
            </BadgeFluid>
            <BadgeFluid variant="solid" size="sm" color="green">
              {elapsedMs}ms
            </BadgeFluid>
          </div>
        </section>

        {/* Template gallery */}
        <section className="flex flex-col gap-2">
          <h3 className="px-0.5 text-xs font-medium text-muted-foreground">
            Templates
          </h3>
          <ChartTemplateGallery
            templates={TEMPLATES}
            selected={selectedTemplate}
            onSelect={onSelectTemplate}
          />
        </section>

        {/* Query history */}
        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 px-0.5 text-xs font-medium text-muted-foreground">
            <Database className="size-3" />
            Queries executadas
          </h3>
          {queryHistory.length > 0 ? (
            <QueryHistoryList items={queryHistory} />
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[13px] text-muted-foreground">
              Nenhuma query executada ainda.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            AiDashboardBuilder                               */
/* -------------------------------------------------------------------------- */

export function AiDashboardBuilder() {
  const [dashboards, setDashboards] = useState<Dashboard[]>(DASHBOARDS)
  const [activeId, setActiveId] = useState(DASHBOARDS[0].id)
  const [value, setValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(
    undefined,
  )
  const [elapsedMs] = useState(42)
  const [chatOpen, setChatOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [dashListOpen, setDashListOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const genRef = useRef(0)
  const newCountRef = useRef(0)
  const widgetPoolIdx = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const active = dashboards.find((d) => d.id === activeId) ?? dashboards[0]

  const updateActive = useCallback(
    (fn: (d: Dashboard) => Dashboard) =>
      setDashboards((prev) => prev.map((d) => (d.id === activeId ? fn(d) : d))),
    [activeId],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (stepTimerRef.current) clearInterval(stepTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [active.messages.length, isThinking])

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isThinking) return

      genRef.current += 1
      const seq = genRef.current

      const userMsg: ChatMsg = {
        id: 1000 + seq,
        from: "user",
        text: trimmed,
        time: "Agora",
      }
      updateActive((d) => ({ ...d, messages: [...d.messages, userMsg] }))
      setValue("")
      setIsThinking(true)
      setCurrentStep(0)

      // Simulate thinking steps progression
      let step = 0
      stepTimerRef.current = setInterval(() => {
        step += 1
        if (step >= THINKING_STEPS.length) {
          if (stepTimerRef.current) {
            clearInterval(stepTimerRef.current)
            stepTimerRef.current = null
          }
          return
        }
        setCurrentStep(step)
      }, STEP_INTERVAL_MS)

      // After delay: add widget + query history + assistant reply (no active)
      timerRef.current = setTimeout(() => {
        // Pick next widget from pool (deterministic, cycling)
        const poolWidget =
          WIDGET_POOL[widgetPoolIdx.current % WIDGET_POOL.length]
        widgetPoolIdx.current += 1

        const newWidget: CanvasWidget = {
          ...poolWidget,
          id: `gen-${seq}`,
        }
        const newHistoryItem: QueryHistoryItem = {
          id: `q-${seq}`,
          sql: newWidget.query ?? "SELECT 1",
          durationMs: newWidget.durationMs ?? 30,
          timeLabel: "agora",
        }
        const replyIdx = (widgetPoolIdx.current - 1) % ASSISTANT_REPLIES.length
        const assistantMsg: ChatMsg = {
          id: 5000 + seq,
          from: "assistant",
          text: ASSISTANT_REPLIES[replyIdx],
          time: "Agora",
        }

        updateActive((d) => ({
          ...d,
          widgets: [...d.widgets, newWidget],
          history: [newHistoryItem, ...d.history],
          messages: [...d.messages, assistantMsg],
        }))

        setIsThinking(false)
        setCurrentStep(0)
        timerRef.current = null
      }, REPLY_DELAY_MS)
    },
    [isThinking, updateActive],
  )

  const switchDashboard = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const newDashboard = useCallback(() => {
    newCountRef.current += 1
    const id = `dash-${newCountRef.current}`
    const fresh: Dashboard = {
      id,
      name: "Novo dashboard",
      icon: LayoutDashboard,
      widgets: [],
      history: [],
      messages: [
        {
          id: 1,
          from: "assistant",
          text: "Dashboard novo. Peça um gráfico.",
          time: "Agora",
        },
      ],
      filters: { dataSource: "prod", chips: [] },
    }
    setDashboards((prev) => [...prev, fresh])
    setActiveId(id)
  }, [])

  const deleteDashboard = useCallback(
    (id: string) => {
      if (dashboards.length <= 1) return
      const remaining = dashboards.filter((d) => d.id !== id)
      setDashboards(remaining)
      if (activeId === id) setActiveId(remaining[0].id)
      if (editingId === id) setEditingId(null)
    },
    [dashboards, activeId, editingId],
  )

  const startRename = useCallback(
    (id: string) => {
      const d = dashboards.find((x) => x.id === id)
      setEditingId(id)
      setEditName(d?.name ?? "")
    },
    [dashboards],
  )

  const renameDashboard = useCallback((id: string, name: string) => {
    setDashboards((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)))
  }, [])

  const commitRename = useCallback(() => setEditingId(null), [])
  const cancelRename = useCallback(() => setEditingId(null), [])

  const stepCount = active.history.length

  const railProps = {
    dashboards,
    activeId,
    onSelect: switchDashboard,
    onNew: newDashboard,
    onDelete: deleteDashboard,
    onRename: renameDashboard,
    editingId,
    editName,
    onEditNameChange: setEditName,
    onStartRename: startRename,
    onCommitRename: commitRename,
    onCancelRename: cancelRename,
  }

  return (
    <div
      data-conversation-id="ai-dashboard-builder"
      className="relative mx-auto flex h-[78vh] w-full max-w-7xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
    >
      {/* ── Painel esquerdo 1: rail de dashboards (xl+) ─────────────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border xl:flex">
        <DashboardRail {...railProps} />
      </aside>

      {/* ── Painel esquerdo 2: chat (md+) ───────────────────────────── */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-border md:flex">
        <ChatPanel
          messages={active.messages}
          isThinking={isThinking}
          currentStep={currentStep}
          value={value}
          onValueChange={setValue}
          onSend={handleSend}
          scrollRef={scrollRef}
        />
      </aside>

      {/* ── Painel central: canvas ──────────────────────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Canvas header */}
        <header className="flex h-[3.25rem] shrink-0 items-center justify-between gap-3 border-b border-border px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <ButtonFluid
              variant="ghost"
              size="icon-sm"
              aria-label="Abrir dashboards"
              className="xl:hidden"
              onClick={() => setDashListOpen(true)}
            >
              <LayoutDashboard size={16} />
            </ButtonFluid>
            <ButtonFluid
              variant="ghost"
              size="icon-sm"
              aria-label="Abrir chat"
              className="md:hidden"
              onClick={() => setChatOpen(true)}
            >
              <PanelLeft size={16} />
            </ButtonFluid>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">
                {active.name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {active.widgets.length} widgets · {active.history.length} queries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipFluid content="Adicionar widget">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Adicionar widget"
                onClick={() => handleSend("Adicione um novo indicador")}
              >
                <Plus size={16} />
              </ButtonFluid>
            </TooltipFluid>
            <ButtonFluid
              variant="ghost"
              size="icon-sm"
              aria-label="Abrir inspector"
              className="lg:hidden"
              onClick={() => setInspectorOpen(true)}
            >
              <PanelRight size={16} />
            </ButtonFluid>
          </div>
        </header>

        {/* Filter bar */}
        <div className="shrink-0 p-3">
          <DashboardFilterBar
            dateFrom={active.filters.dateFrom}
            dateTo={active.filters.dateTo}
            dataSource={active.filters.dataSource}
            dataSourceOptions={DATA_SOURCES}
            activeFilters={active.filters.chips.map((c) => ({
              label: c.label,
              onRemove: () => undefined,
            }))}
          />
        </div>

        {/* Canvas grid */}
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <CanvasGrid widgets={active.widgets} />
        </div>
      </section>

      {/* ── Painel direito: inspector (lg+) ─────────────────────────── */}
      <aside className="hidden w-72 shrink-0 flex-col border-l border-border lg:flex">
        <InspectorPanel
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          queryHistory={active.history}
          stepCount={stepCount}
          elapsedMs={elapsedMs}
        />
      </aside>

      {/* ── Drawer de dashboards (mobile/tablet, dentro do card) ────── */}
      {dashListOpen && (
        <div className="absolute inset-0 z-30 xl:hidden">
          <button
            type="button"
            aria-label="Fechar dashboards"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDashListOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-end px-2 pt-2">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Fechar"
                onClick={() => setDashListOpen(false)}
              >
                <X size={16} />
              </ButtonFluid>
            </div>
            <div className="min-h-0 flex-1">
              <DashboardRail
                {...railProps}
                onSelect={(id) => {
                  switchDashboard(id)
                  setDashListOpen(false)
                }}
                onNew={() => {
                  newDashboard()
                  setDashListOpen(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer do chat (mobile, dentro do card) ─────────────────── */}
      {chatOpen && (
        <div className="absolute inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="Fechar chat"
            className="absolute inset-0 bg-black/40"
            onClick={() => setChatOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-end px-2 pt-2">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Fechar"
                onClick={() => setChatOpen(false)}
              >
                <X size={16} />
              </ButtonFluid>
            </div>
            <div className="min-h-0 flex-1">
              <ChatPanel
                messages={active.messages}
                isThinking={isThinking}
                currentStep={currentStep}
                value={value}
                onValueChange={setValue}
                onSend={(text) => {
                  handleSend(text)
                  setChatOpen(false)
                }}
                scrollRef={scrollRef}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer do inspector (mobile/tablet, dentro do card) ─────── */}
      {inspectorOpen && (
        <div className="absolute inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Fechar inspector"
            className="absolute inset-0 bg-black/40"
            onClick={() => setInspectorOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col border-l border-border bg-card shadow-xl">
            <div className="flex items-center justify-start px-2 pt-2">
              <ButtonFluid
                variant="ghost"
                size="icon-sm"
                aria-label="Fechar"
                onClick={() => setInspectorOpen(false)}
              >
                <X size={16} />
              </ButtonFluid>
            </div>
            <div className="min-h-0 flex-1">
              <InspectorPanel
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                queryHistory={active.history}
                stepCount={stepCount}
                elapsedMs={elapsedMs}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
