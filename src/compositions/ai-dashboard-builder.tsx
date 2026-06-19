/**
 * Composição "AI Dashboard Builder" (ai-dashboard-builder).
 *
 * Plataforma de dashboards comandada por chat de IA em layout de 3 painéis:
 *  - Painel esquerdo (chat, w-80): thread com ChatMessageFluid + blocos
 *    ThinkingStepsFluid + composer InputMessageFluid.
 *  - Painel central (canvas, flex-1): DashboardFilterBar no topo + grid de
 *    ChartWidgets (KpiCard, BarChart, LineChart, DonutChart) montados por IA.
 *  - Painel direito (inspector, w-72): ChartTemplateGallery +
 *    QueryHistoryList + estado do agente (modelo, passos, tempo).
 *
 * Interatividade real: o user envia um prompt → aparecem thinking steps →
 * depois de um setTimeout um novo ChartWidget é adicionado ao canvas e a
 * mensagem do assistente aparece no chat. Mock data determinístico (sem
 * dados determinísticos). Mobile: chat/inspector viram overlay (absolute dentro do card).
 */
import { useCallback, useEffect, useRef, useState } from "react"
import {
  BarChart3,
  Brain,
  Cpu,
  Database,
  LineChart as LineChartIcon,
  PanelLeft,
  PanelRight,
  PieChart,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react"

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
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES)
  const [widgets, setWidgets] = useState<CanvasWidget[]>(INITIAL_WIDGETS)
  const [queryHistory, setQueryHistory] =
    useState<QueryHistoryItem[]>(INITIAL_HISTORY)
  const [value, setValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(
    undefined,
  )
  const [elapsedMs] = useState(42)
  const [chatOpen, setChatOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const msgCountRef = useRef(INITIAL_MESSAGES.length)
  const widgetPoolIdx = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (stepTimerRef.current) clearInterval(stepTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, isThinking])

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isThinking) return

      msgCountRef.current += 1
      const userMsg: ChatMsg = {
        id: msgCountRef.current,
        from: "user",
        text: trimmed,
        time: "Agora",
      }
      setMessages((prev) => [...prev, userMsg])
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

      // After delay: add widget + assistant reply
      timerRef.current = setTimeout(() => {
        // Pick next widget from pool (deterministic, cycling)
        const poolWidget =
          WIDGET_POOL[widgetPoolIdx.current % WIDGET_POOL.length]
        widgetPoolIdx.current += 1

        const newWidget: CanvasWidget = {
          ...poolWidget,
          id: `gen-${Date.now()}`,
        }
        setWidgets((prev) => [...prev, newWidget])

        // Add query to history
        const newHistoryItem: QueryHistoryItem = {
          id: `q-${Date.now()}`,
          sql: newWidget.query ?? "SELECT 1",
          durationMs: newWidget.durationMs ?? 30,
          timeLabel: "agora",
        }
        setQueryHistory((prev) => [newHistoryItem, ...prev])

        // Add assistant reply
        msgCountRef.current += 1
        const replyIdx = (widgetPoolIdx.current - 1) % ASSISTANT_REPLIES.length
        const assistantMsg: ChatMsg = {
          id: msgCountRef.current,
          from: "assistant",
          text: ASSISTANT_REPLIES[replyIdx],
          time: "Agora",
        }
        setMessages((prev) => [...prev, assistantMsg])

        setIsThinking(false)
        setCurrentStep(0)
        timerRef.current = null
      }, REPLY_DELAY_MS)
    },
    [isThinking],
  )

  const stepCount = queryHistory.length

  return (
    <div
      data-conversation-id="ai-dashboard-builder"
      className="relative mx-auto flex h-[78vh] w-full max-w-7xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
    >
      {/* ── Painel esquerdo: chat (md+) ─────────────────────────────── */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-border md:flex">
        <ChatPanel
          messages={messages}
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
              aria-label="Abrir chat"
              className="md:hidden"
              onClick={() => setChatOpen(true)}
            >
              <PanelLeft size={16} />
            </ButtonFluid>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">
                Dashboard — Visão geral
              </span>
              <span className="text-[11px] text-muted-foreground">
                {widgets.length} widgets · {queryHistory.length} queries
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
            dataSource="prod"
            dataSourceOptions={DATA_SOURCES}
            activeFilters={[
              { label: "Últimos 30 dias", onRemove: () => undefined },
            ]}
          />
        </div>

        {/* Canvas grid */}
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <CanvasGrid widgets={widgets} />
        </div>
      </section>

      {/* ── Painel direito: inspector (lg+) ─────────────────────────── */}
      <aside className="hidden w-72 shrink-0 flex-col border-l border-border lg:flex">
        <InspectorPanel
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          queryHistory={queryHistory}
          stepCount={stepCount}
          elapsedMs={elapsedMs}
        />
      </aside>

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
                messages={messages}
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
                queryHistory={queryHistory}
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
