/**
 * Examples Tremor — examples para os 9 charts do lote Tremor.
 *
 * Cada chart Tremor recebe ao menos 1 Example realista (dados em formato
 * long-format, valueFormatter em BRL/%, paleta da `AvailableChartColors`).
 * Alguns ganham um segundo Example para destacar variantes-chave (stacked,
 * bar vs line no combo, pie vs donut, click-to-filter no BarList, etc.).
 *
 * Segue o padrão dos outros `examples-*.tsx` — mesclado em `examples.tsx`
 * via spread do `examplesTremor`.
 */

import {
  AreaChartTremor,
  BarChartTremor,
  BarListTremor,
  CalloutTremor,
  CategoryBarTremor,
  ComboChartTremor,
  DateRangePickerTremor,
  DividerTremor,
  DonutChartTremor,
  LineChartTremor,
  ProgressBarTremor,
  ProgressCircleTremor,
  RadioCardGroupTremor,
  ScatterChartTremor,
  SparkChartTremor,
  TabNavigationTremor,
  TrackerTremor,
} from "@/components/ui"
import { CreditCard, Home, Info, Settings, Users, Wallet, Zap } from "lucide-react"

import type { Example } from "./examples"

/* -------------------------------------------------------------------------- */
/*                            area-chart-tremor                                */
/* -------------------------------------------------------------------------- */

const REVENUE_AREA = [
  { month: "Jan", receita: 8200, custos: 4100 },
  { month: "Fev", receita: 9100, custos: 4400 },
  { month: "Mar", receita: 10800, custos: 5200 },
  { month: "Abr", receita: 10200, custos: 4800 },
  { month: "Mai", receita: 12400, custos: 5800 },
  { month: "Jun", receita: 13900, custos: 6300 },
  { month: "Jul", receita: 14600, custos: 6700 },
  { month: "Ago", receita: 15200, custos: 6900 },
  { month: "Set", receita: 16100, custos: 7100 },
  { month: "Out", receita: 17400, custos: 7600 },
  { month: "Nov", receita: 18200, custos: 7900 },
  { month: "Dez", receita: 19800, custos: 8400 },
]

const areaBasicExample: Example = {
  title: "Receita × Custos",
  description:
    "Duas séries mensais com gradient fill, legenda interativa e tooltip em BRL.",
  code: `import { AreaChartTremor } from "@/components/ui/area-chart-tremor"

const data = [
  { month: "Jan", receita: 8200, custos: 4100 },
  { month: "Fev", receita: 9100, custos: 4400 },
  // ...
  { month: "Dez", receita: 19800, custos: 8400 },
]

export function Demo() {
  return (
    <AreaChartTremor
      data={data}
      index="month"
      categories={["receita", "custos"]}
      valueFormatter={(v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      fill="gradient"
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <AreaChartTremor
        data={REVENUE_AREA}
        index="month"
        categories={["receita", "custos"]}
        valueFormatter={(v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
        fill="gradient"
        className="h-72"
      />
    </div>
  ),
}

const areaStackedExample: Example = {
  title: "Stacked (composição do tráfego)",
  description:
    "Mesma API, `type=\"stacked\"` para empilhar origens de tráfego.",
  code: `import { AreaChartTremor } from "@/components/ui/area-chart-tremor"

export function Demo() {
  return (
    <AreaChartTremor
      data={[
        { dia: "Seg", organico: 120, pago: 80, social: 40 },
        { dia: "Ter", organico: 140, pago: 90, social: 50 },
        { dia: "Qua", organico: 160, pago: 95, social: 55 },
        { dia: "Qui", organico: 150, pago: 110, social: 60 },
        { dia: "Sex", organico: 180, pago: 120, social: 70 },
      ]}
      index="dia"
      categories={["organico", "pago", "social"]}
      type="stacked"
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <AreaChartTremor
        data={[
          { dia: "Seg", organico: 120, pago: 80, social: 40 },
          { dia: "Ter", organico: 140, pago: 90, social: 50 },
          { dia: "Qua", organico: 160, pago: 95, social: 55 },
          { dia: "Qui", organico: 150, pago: 110, social: 60 },
          { dia: "Sex", organico: 180, pago: 120, social: 70 },
        ]}
        index="dia"
        categories={["organico", "pago", "social"]}
        type="stacked"
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
        className="h-72"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            bar-chart-tremor                                 */
/* -------------------------------------------------------------------------- */

const ORDERS_BAR = [
  { weekday: "Seg", pedidos: 142 },
  { weekday: "Ter", pedidos: 168 },
  { weekday: "Qua", pedidos: 156 },
  { weekday: "Qui", pedidos: 184 },
  { weekday: "Sex", pedidos: 221 },
  { weekday: "Sáb", pedidos: 198 },
  { weekday: "Dom", pedidos: 132 },
]

const barBasicExample: Example = {
  title: "Pedidos por dia",
  description:
    "Barras Tremor com grid, tooltip e eixos Y configuráveis. `valueFormatter` aplicado em todas as marcações.",
  code: `import { BarChartTremor } from "@/components/ui/bar-chart-tremor"

export function Demo() {
  return (
    <BarChartTremor
      data={[
        { weekday: "Seg", pedidos: 142 },
        { weekday: "Ter", pedidos: 168 },
        { weekday: "Sex", pedidos: 221 },
        { weekday: "Sáb", pedidos: 198 },
      ]}
      index="weekday"
      categories={["pedidos"]}
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <BarChartTremor
        data={ORDERS_BAR}
        index="weekday"
        categories={["pedidos"]}
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
        className="h-72"
      />
    </div>
  ),
}

const barStackedExample: Example = {
  title: "Stacked por canal",
  description: "Composição de pedidos por canal (web, app, marketplace) na semana.",
  code: `import { BarChartTremor } from "@/components/ui/bar-chart-tremor"

export function Demo() {
  return (
    <BarChartTremor
      data={[
        { weekday: "Seg", web: 80, app: 42, mp: 20 },
        { weekday: "Ter", web: 95, app: 48, mp: 25 },
        { weekday: "Qua", web: 88, app: 45, mp: 23 },
        { weekday: "Qui", web: 102, app: 55, mp: 27 },
        { weekday: "Sex", web: 120, app: 68, mp: 33 },
      ]}
      index="weekday"
      categories={["web", "app", "mp"]}
      stack
      colors={["blue", "emerald", "amber"]}
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <BarChartTremor
        data={[
          { weekday: "Seg", web: 80, app: 42, mp: 20 },
          { weekday: "Ter", web: 95, app: 48, mp: 25 },
          { weekday: "Qua", web: 88, app: 45, mp: 23 },
          { weekday: "Qui", web: 102, app: 55, mp: 27 },
          { weekday: "Sex", web: 120, app: 68, mp: 33 },
        ]}
        index="weekday"
        categories={["web", "app", "mp"]}
        stack
        colors={["blue", "emerald", "amber"]}
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
        className="h-72"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            line-chart-tremor                                */
/* -------------------------------------------------------------------------- */

const TRAFFIC_LINE = [
  { hour: "00h", requests: 12 },
  { hour: "02h", requests: 8 },
  { hour: "04h", requests: 6 },
  { hour: "06h", requests: 14 },
  { hour: "08h", requests: 38 },
  { hour: "10h", requests: 62 },
  { hour: "12h", requests: 71 },
  { hour: "14h", requests: 68 },
  { hour: "16h", requests: 74 },
  { hour: "18h", requests: 59 },
  { hour: "20h", requests: 44 },
  { hour: "22h", requests: 28 },
]

const lineBasicExample: Example = {
  title: "Requisições por hora",
  description:
    "Linha Tremor com gradient stroke, legend interativa e curveType configurável.",
  code: `import { LineChartTremor } from "@/components/ui/line-chart-tremor"

export function Demo() {
  return (
    <LineChartTremor
      data={[
        { hour: "00h", requests: 12 },
        { hour: "06h", requests: 14 },
        { hour: "12h", requests: 71 },
        { hour: "18h", requests: 59 },
      ]}
      index="hour"
      categories={["requests"]}
      showGradient
      curveType="monotone"
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <LineChartTremor
        data={TRAFFIC_LINE}
        index="hour"
        categories={["requests"]}
        showGradient
        curveType="monotone"
        className="h-72"
      />
    </div>
  ),
}

const lineMultiExample: Example = {
  title: "Múltiplas séries",
  description: "API vs CDN — mesma escala, duas cores do pool Tremor.",
  code: `import { LineChartTremor } from "@/components/ui/line-chart-tremor"

export function Demo() {
  return (
    <LineChartTremor
      data={[
        { day: "Seg", api: 40, cdn: 20 },
        { day: "Ter", api: 35, cdn: 25 },
        { day: "Qua", api: 50, cdn: 30 },
        { day: "Qui", api: 45, cdn: 28 },
        { day: "Sex", api: 60, cdn: 35 },
      ]}
      index="day"
      categories={["api", "cdn"]}
      colors={["blue", "emerald"]}
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <LineChartTremor
        data={[
          { day: "Seg", api: 40, cdn: 20 },
          { day: "Ter", api: 35, cdn: 25 },
          { day: "Qua", api: 50, cdn: 30 },
          { day: "Qui", api: 45, cdn: 28 },
          { day: "Sex", api: 60, cdn: 35 },
        ]}
        index="day"
        categories={["api", "cdn"]}
        colors={["blue", "emerald"]}
        className="h-72"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            donut-chart-tremor                               */
/* -------------------------------------------------------------------------- */

const PLAN_DONUT = [
  { plan: "Free", clientes: 712 },
  { plan: "Pro", clientes: 384 },
  { plan: "Business", clientes: 128 },
  { plan: "Enterprise", clientes: 24 },
]

const donutBasicExample: Example = {
  title: "Distribuição de planos",
  description:
    "Donut com label central (soma formatada) e tooltip por categoria.",
  code: `import { DonutChartTremor } from "@/components/ui/donut-chart-tremor"

export function Demo() {
  return (
    <DonutChartTremor
      data={[
        { plan: "Free", clientes: 712 },
        { plan: "Pro", clientes: 384 },
        { plan: "Business", clientes: 128 },
        { plan: "Enterprise", clientes: 24 },
      ]}
      category="plan"
      value="clientes"
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      label="Clientes"
      className="h-56 w-56"
    />
  )
}`,
  render: (
    <DonutChartTremor
      data={PLAN_DONUT}
      category="plan"
      value="clientes"
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      label="Clientes"
      className="h-56 w-56"
    />
  ),
}

const donutPieExample: Example = {
  title: "Pie (variante cheia)",
  description: "Mesmo dado com `variant=\"pie\"` — fatias cheias, sem buraco central.",
  code: `import { DonutChartTremor } from "@/components/ui/donut-chart-tremor"

export function Demo() {
  return (
    <DonutChartTremor
      data={[
        { origem: "Orgânico", sessoes: 4120 },
        { origem: "Direto", sessoes: 2980 },
        { origem: "Referral", sessoes: 1640 },
      ]}
      category="origem"
      value="sessoes"
      variant="pie"
      showLabel={false}
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      className="h-56 w-56"
    />
  )
}`,
  render: (
    <DonutChartTremor
      data={[
        { origem: "Orgânico", sessoes: 4120 },
        { origem: "Direto", sessoes: 2980 },
        { origem: "Referral", sessoes: 1640 },
      ]}
      category="origem"
      value="sessoes"
      variant="pie"
      showLabel={false}
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      className="h-56 w-56"
    />
  ),
}

/* -------------------------------------------------------------------------- */
/*                            scatter-chart-tremor                             */
/* -------------------------------------------------------------------------- */

const SCATTER_SALES = [
  { loja: "Centro", x: 12, y: 480, size: 320, category: "Centro" },
  { loja: "Centro", x: 18, y: 520, size: 410, category: "Centro" },
  { loja: "Centro", x: 24, y: 460, size: 280, category: "Centro" },
  { loja: "Zona Sul", x: 9, y: 320, size: 220, category: "Zona Sul" },
  { loja: "Zona Sul", x: 15, y: 380, size: 260, category: "Zona Sul" },
  { loja: "Zona Sul", x: 22, y: 410, size: 310, category: "Zona Sul" },
  { loja: "Zona Norte", x: 28, y: 290, size: 240, category: "Zona Norte" },
  { loja: "Zona Norte", x: 35, y: 340, size: 290, category: "Zona Norte" },
  { loja: "Zona Norte", x: 42, y: 380, size: 360, category: "Zona Norte" },
  { loja: "Zona Oeste", x: 16, y: 610, size: 480, category: "Zona Oeste" },
  { loja: "Zona Oeste", x: 26, y: 680, size: 540, category: "Zona Oeste" },
  { loja: "Zona Oeste", x: 38, y: 720, size: 600, category: "Zona Oeste" },
]

const scatterBasicExample: Example = {
  title: "Tráfego × Conversão por loja",
  description:
    "Pontos Tremor com bolhas proporcionais ao `size` e cores por categoria (região).",
  code: `import { ScatterChartTremor } from "@/components/ui/scatter-chart-tremor"

export function Demo() {
  return (
    <ScatterChartTremor
      data={[
        { loja: "Centro", x: 12, y: 480, size: 320 },
        { loja: "Zona Sul", x: 22, y: 410, size: 310 },
        { loja: "Zona Norte", x: 42, y: 380, size: 360 },
      ]}
      category="loja"
      x="x"
      y="y"
      size="size"
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <ScatterChartTremor
        data={SCATTER_SALES}
        category="loja"
        x="x"
        y="y"
        size="size"
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
        className="h-72"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            combo-chart-tremor                               */
/* -------------------------------------------------------------------------- */

const REVENUE_COMBO = [
  { month: "Jan", receita: 8200, pedidos: 142 },
  { month: "Fev", receita: 9100, pedidos: 168 },
  { month: "Mar", receita: 10800, pedidos: 156 },
  { month: "Abr", receita: 10200, pedidos: 184 },
  { month: "Mai", receita: 12400, pedidos: 221 },
  { month: "Jun", receita: 13900, pedidos: 198 },
]

const comboBasicExample: Example = {
  title: "Receita (bar) + Pedidos (linha)",
  description:
    "ComboChart Tremor combinando duas séries em gráficos diferentes na mesma tela.",
  code: `import { ComboChartTremor } from "@/components/ui/combo-chart-tremor"

export function Demo() {
  return (
    <ComboChartTremor
      data={[
        { month: "Jan", receita: 8200, pedidos: 142 },
        { month: "Fev", receita: 9100, pedidos: 168 },
        { month: "Mar", receita: 10800, pedidos: 156 },
      ]}
      index="month"
      categories={[
        { name: "receita", type: "bar" },
        { name: "pedidos", type: "line" },
      ]}
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      className="h-72"
    />
  )
}`,
  render: (
    <div className="w-full">
      <ComboChartTremor
        data={REVENUE_COMBO}
        index="month"
        categories={[
          { name: "receita", type: "bar" },
          { name: "pedidos", type: "line" },
        ]}
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
        className="h-72"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            category-bar-tremor                              */
/* -------------------------------------------------------------------------- */

const CATEGORY_VALUES = [
  { name: "API", value: 820 },
  { name: "Workers", value: 540 },
  { name: "DB", value: 380 },
  { name: "Cache", value: 220 },
  { name: "Outros", value: 90 },
]

const categoryBarBasicExample: Example = {
  title: "Consumo por categoria",
  description:
    "Barra horizontal empilhada com labels cumulativos e marker de threshold.",
  code: `import { CategoryBarTremor } from "@/components/ui/category-bar-tremor"

export function Demo() {
  return (
    <CategoryBarTremor
      values={[
        { name: "API", value: 820 },
        { name: "Workers", value: 540 },
        { name: "DB", value: 380 },
        { name: "Cache", value: 220 },
      ]}
      marker={{ value: 1700, tooltip: "Limite do plano (1.700)" }}
      showLabels
    />
  )
}`,
  render: (
    <div className="w-full">
      <CategoryBarTremor
        values={CATEGORY_VALUES}
        marker={{ value: 1700, tooltip: "Limite do plano (1.700)" }}
        showLabels
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            bar-list-tremor                                  */
/* -------------------------------------------------------------------------- */

const TOP_SOURCES = [
  { key: "google", name: "Google", value: 4120, href: "#google" },
  { key: "direct", name: "Direto", value: 2980, href: "#direct" },
  { key: "twitter", name: "Twitter", value: 1640, href: "#twitter" },
  { key: "github", name: "GitHub", value: 980, href: "#github" },
  { key: "hn", name: "Hacker News", value: 720, href: "#hn" },
]

const barListBasicExample: Example = {
  title: "Top fontes de tráfego",
  description:
    "BarList Tremor com links por item e tooltip ao hover. Ordenação decrescente automática.",
  code: `import { BarListTremor } from "@/components/ui/bar-list-tremor"

export function Demo() {
  return (
    <BarListTremor
      data={[
        { key: "google", name: "Google", value: 4120, href: "#" },
        { key: "direct", name: "Direto", value: 2980, href: "#" },
        { key: "twitter", name: "Twitter", value: 1640, href: "#" },
      ]}
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
    />
  )
}`,
  render: (
    <div className="w-full">
      <BarListTremor
        data={TOP_SOURCES}
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
      />
    </div>
  ),
}

const barListClickableExample: Example = {
  title: "Clicável (filtro)",
  description:
    "Com `onValueChange`, cada linha vira um botão — útil para drill-down em dashboards.",
  code: `import { BarListTremor } from "@/components/ui/bar-list-tremor"

export function Demo() {
  return (
    <BarListTremor
      data={[
        { key: "1", name: "Erro 500", value: 18 },
        { key: "2", name: "Erro 401", value: 42 },
        { key: "3", name: "Timeout", value: 7 },
      ]}
      valueFormatter={(v) => v.toLocaleString("pt-BR")}
      onValueChange={(item) => console.log("filtrar por", item.name)}
      sortOrder="descending"
    />
  )
}`,
  render: (
    <div className="w-full">
      <BarListTremor
        data={[
          { key: "1", name: "Erro 500", value: 18 },
          { key: "2", name: "Erro 401", value: 42 },
          { key: "3", name: "Timeout", value: 7 },
        ]}
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
        onValueChange={(item) => {
          // demo: click handler
          void item
        }}
        sortOrder="descending"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            spark-chart-tremor                               */
/* -------------------------------------------------------------------------- */

const SPARK_SALES = [42, 48, 51, 47, 58, 62, 68, 71, 66, 74, 82, 88]

const sparkAreaExample: Example = {
  title: "Sparkline (área)",
  description:
    "SparkChart compacto — tipo `area` para KPIs no canto do card.",
  code: `import { SparkChartTremor } from "@/components/ui/spark-chart-tremor"

export function Demo() {
  return (
    <SparkChartTremor
      data={[42, 48, 51, 47, 58, 62, 68, 71, 66, 74, 82, 88]}
      type="area"
      colors={["emerald"]}
      className="h-12 w-32"
    />
  )
}`,
  render: (
    <div className="w-full">
      <SparkChartTremor
        data={SPARK_SALES}
        type="area"
        colors={["emerald"]}
        className="h-12 w-40"
      />
    </div>
  ),
}

const sparkBarExample: Example = {
  title: "Sparkline (bar)",
  description:
    "Mesmo dataset com `type=\"bar\"` — útil para volume discreto (pedidos/dia).",
  code: `import { SparkChartTremor } from "@/components/ui/spark-chart-tremor"

export function Demo() {
  return (
    <SparkChartTremor
      data={[42, 48, 51, 47, 58, 62, 68, 71, 66, 74, 82, 88]}
      type="bar"
      colors={["blue"]}
      className="h-12 w-40"
    />
  )
}`,
  render: (
    <div className="w-full">
      <SparkChartTremor
        data={SPARK_SALES}
        type="bar"
        colors={["blue"]}
        className="h-12 w-40"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            tracker-tremor                                 */
/* -------------------------------------------------------------------------- */

/**
 * 365 dias de "atividade" — um objeto por dia com `color` Tremor-like
 * (5 níveis de intensidade) e `tooltip` para o hover card.
 */
function generateYearTracker(): {
  key: string
  color: string
  tooltip: string
}[] {
  const levels = [
    "bg-gray-200 dark:bg-gray-700",
    "bg-emerald-200 dark:bg-emerald-900",
    "bg-emerald-400 dark:bg-emerald-700",
    "bg-emerald-500 dark:bg-emerald-500",
    "bg-emerald-700 dark:bg-emerald-300",
  ]
  // Padrão pseudo-aleatório determinístico (mesma seed ⇒ mesmo dataset).
  const blocks: { key: string; color: string; tooltip: string }[] = []
  let seed = 42
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const start = new Date("2025-01-01")
  for (let i = 0; i < 365; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const iso = date.toISOString().slice(0, 10)
    const level = Math.floor(rand() * 5)
    const count = [0, 1, 3, 6, 11][level]
    blocks.push({
      key: iso,
      color: levels[level],
      tooltip: `${count} contribuição${count === 1 ? "" : "s"} em ${iso}`,
    })
  }
  return blocks
}

const TRACKER_YEAR = generateYearTracker()

const trackerYearExample: Example = {
  title: "365 dias de atividade",
  description:
    "Faixa completa de um ano no estilo GitHub contributions. Hover em qualquer bloco revela data e contagem via HoverCard.",
  code: `import { TrackerTremor } from "@/components/ui/tracker-tremor"

const blocks = Array.from({ length: 365 }, (_, i) => ({
  key: \`2025-01-\${i}\`,
  color: i % 7 === 0 ? "bg-emerald-500" : "bg-gray-200",
  tooltip: \`\${i} contribuições\`,
}))

export function Demo() {
  return <TrackerTremor data={blocks} hoverEffect />
}`,
  render: (
    <div className="w-full">
      <TrackerTremor data={TRACKER_YEAR} hoverEffect />
    </div>
  ),
}

const trackerCompactExample: Example = {
  title: "Faixa curta (30 dias)",
  description:
    "Versão reduzida — útil para KPIs de uso recente dentro de um card.",
  code: `import { TrackerTremor } from "@/components/ui/tracker-tremor"

export function Demo() {
  return (
    <TrackerTremor
      data={[
        { key: "1", color: "bg-emerald-500", tooltip: "12 ações" },
        { key: "2", color: "bg-emerald-400", tooltip: "8 ações" },
        { key: "3", color: "bg-gray-200", tooltip: "0 ações" },
        { key: "4", color: "bg-emerald-700", tooltip: "21 ações" },
      ]}
    />
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <TrackerTremor
        data={[
          {
            key: "1",
            color: "bg-emerald-500 dark:bg-emerald-400",
            tooltip: "12 ações",
          },
          {
            key: "2",
            color: "bg-emerald-400 dark:bg-emerald-500",
            tooltip: "8 ações",
          },
          {
            key: "3",
            color: "bg-gray-200 dark:bg-gray-700",
            tooltip: "0 ações",
          },
          {
            key: "4",
            color: "bg-emerald-700 dark:bg-emerald-300",
            tooltip: "21 ações",
          },
        ]}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                          progress-bar-tremor                               */
/* -------------------------------------------------------------------------- */

const progressBarBasicExample: Example = {
  title: "Básico (75% success)",
  description:
    "Variante `success` em 75/100 com `label` à direita. `showAnimation` interpolado anima a largura.",
  code: `import { ProgressBarTremor } from "@/components/ui/progress-bar-tremor"

export function Demo() {
  return (
    <ProgressBarTremor
      value={75}
      max={100}
      variant="success"
      label="75%"
      showAnimation
    />
  )
}`,
  render: (
    <div className="w-full">
      <ProgressBarTremor
        value={75}
        max={100}
        variant="success"
        label="75%"
        showAnimation
      />
    </div>
  ),
}

const progressBarVariantsExample: Example = {
  title: "Todas as variants",
  description:
    "5 variants semânticas lado a lado — default, neutral, warning, error, success.",
  code: `import { ProgressBarTremor } from "@/components/ui/progress-bar-tremor"

export function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <ProgressBarTremor value={62} variant="default" label="62%" />
      <ProgressBarTremor value={40} variant="neutral" label="40%" />
      <ProgressBarTremor value={85} variant="warning" label="85%" />
      <ProgressBarTremor value={92} variant="error" label="92%" />
      <ProgressBarTremor value={48} variant="success" label="48%" />
    </div>
  )
}`,
  render: (
    <div className="flex w-full flex-col gap-3">
      <ProgressBarTremor value={62} variant="default" label="62%" />
      <ProgressBarTremor value={40} variant="neutral" label="40%" />
      <ProgressBarTremor value={85} variant="warning" label="85%" />
      <ProgressBarTremor value={92} variant="error" label="92%" />
      <ProgressBarTremor value={48} variant="success" label="48%" />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                          progress-circle-tremor                            */
/* -------------------------------------------------------------------------- */

const progressCircleBasicExample: Example = {
  title: "80% com label central",
  description:
    "Anel completo (360°) com texto `80%` centralizado via prop `children`.",
  code: `import { ProgressCircleTremor } from "@/components/ui/progress-circle-tremor"

export function Demo() {
  return (
    <ProgressCircleTremor value={80} max={100} radius={40}>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
        80%
      </span>
    </ProgressCircleTremor>
  )
}`,
  render: (
    <div className="flex items-center gap-4">
      <ProgressCircleTremor value={80} max={100} radius={40}>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          80%
        </span>
      </ProgressCircleTremor>
      <span className="text-sm text-muted-foreground">
        Conversão do funil
      </span>
    </div>
  ),
}

const progressCircleVariantsExample: Example = {
  title: "Comparativo de variants",
  description:
    "As 5 variants em 60% para comparar visualmente a paleta.",
  code: `import { ProgressCircleTremor } from "@/components/ui/progress-circle-tremor"

export function Demo() {
  return (
    <div className="flex items-center gap-6">
      <ProgressCircleTremor value={60} variant="default" radius={32} />
      <ProgressCircleTremor value={60} variant="neutral" radius={32} />
      <ProgressCircleTremor value={60} variant="warning" radius={32} />
      <ProgressCircleTremor value={60} variant="error" radius={32} />
      <ProgressCircleTremor value={60} variant="success" radius={32} />
    </div>
  )
}`,
  render: (
    <div className="flex flex-wrap items-center gap-6">
      <ProgressCircleTremor value={60} variant="default" radius={32} />
      <ProgressCircleTremor value={60} variant="neutral" radius={32} />
      <ProgressCircleTremor value={60} variant="warning" radius={32} />
      <ProgressCircleTremor value={60} variant="error" radius={32} />
      <ProgressCircleTremor value={60} variant="success" radius={32} />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             callout-tremor                                 */
/* -------------------------------------------------------------------------- */

const calloutInfoExample: Example = {
  title: "Info (default)",
  description:
    "Banner destacado azul com ícone `Info` do lucide — útil para dicas e avisos contextuais.",
  code: `import { CalloutTremor } from "@/components/ui/callout-tremor"
import { Info } from "lucide-react"

export function Demo() {
  return (
    <CalloutTremor
      title="Atualização disponível"
      icon={Info}
      variant="info"
    >
      A versão 2.4 traz suporte a filtros aninhados. Reinicie o servidor
      para aplicar.
    </CalloutTremor>
  )
}`,
  render: (
    <CalloutTremor
      title="Atualização disponível"
      icon={Info}
      variant="info"
    >
      A versão 2.4 traz suporte a filtros aninhados. Reinicie o servidor
      para aplicar.
    </CalloutTremor>
  ),
}

const calloutSuccessExample: Example = {
  title: "Success / Warning / Error",
  description:
    "Mesma API com as 3 variants semânticas principais — útil para feedback inline.",
  code: `import { CalloutTremor } from "@/components/ui/callout-tremor"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <CalloutTremor title="Deploy concluído" icon={CheckCircle2} variant="success">
        Build #482 publicado em produção.
      </CalloutTremor>
      <CalloutTremor title="Atenção" icon={AlertTriangle} variant="warning">
        3 clientes não foram migrados — verifique a lista.
      </CalloutTremor>
      <CalloutTremor title="Falha no job" icon={XCircle} variant="error">
        O worker parou às 14:02. Veja os logs.
      </CalloutTremor>
    </div>
  )
}`,
  render: (
    <div className="flex w-full flex-col gap-3">
      <CalloutTremor
        title="Deploy concluído"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5 size-5 shrink-0"
            aria-hidden
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
        variant="success"
      >
        Build #482 publicado em produção.
      </CalloutTremor>
      <CalloutTremor
        title="Atenção"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5 size-5 shrink-0"
            aria-hidden
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
        variant="warning"
      >
        3 clientes não foram migrados — verifique a lista.
      </CalloutTremor>
      <CalloutTremor
        title="Falha no job"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5 size-5 shrink-0"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        }
        variant="error"
      >
        O worker parou às 14:02. Veja os logs.
      </CalloutTremor>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            divider-tremor                                 */
/* -------------------------------------------------------------------------- */

const dividerBasicExample: Example = {
  title: "Linha simples (default)",
  description:
    "Divider horizontal minimalista da Tremor Raw: uma linha cinza clara de borda a borda. Ideal para separar seções em cards de dashboard.",
  code: `import { DividerTremor } from "@/components/ui/divider-tremor"

export function Demo() {
  return <DividerTremor />
}`,
  render: <DividerTremor />,
}

const dividerWithTextExample: Example = {
  title: "Com texto central",
  description:
    "Variante com label entre dois traços — útil para sinalizar mudança de contexto (ex.: 'OU', 'Ações', 'Metadados').",
  code: `import { DividerTremor } from "@/components/ui/divider-tremor"

export function Demo() {
  return (
    <div className="w-full">
      <p className="text-sm">Configurações principais</p>
      <DividerTremor className="my-3">OU</DividerTremor>
      <p className="text-sm">Configurações avançadas</p>
    </div>
  )
}`,
  render: (
    <div className="w-full">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Configurações principais
      </p>
      <DividerTremor className="my-3">OU</DividerTremor>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Configurações avançadas
      </p>
    </div>
  ),
}

const dividerVerticalExample: Example = {
  title: "Vertical (em flex row)",
  description:
    "Orientação vertical — renderiza um traço na altura do container, útil para separar itens lado a lado em um flex row.",
  code: `import { DividerTremor } from "@/components/ui/divider-tremor"

export function Demo() {
  return (
    <div className="flex h-12 items-center gap-3">
      <span className="text-sm">Item A</span>
      <DividerTremor orientation="vertical" />
      <span className="text-sm">Item B</span>
      <DividerTremor orientation="vertical" />
      <span className="text-sm">Item C</span>
    </div>
  )
}`,
  render: (
    <div className="flex h-12 items-center gap-3">
      <span className="text-sm text-gray-700 dark:text-gray-300">Item A</span>
      <DividerTremor orientation="vertical" />
      <span className="text-sm text-gray-700 dark:text-gray-300">Item B</span>
      <DividerTremor orientation="vertical" />
      <span className="text-sm text-gray-700 dark:text-gray-300">Item C</span>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                         tab-navigation-tremor                              */
/* -------------------------------------------------------------------------- */

const tabNavBasicExample: Example = {
  title: "Nav de abas (default)",
  description:
    "TabNavigationTremor com 3 abas em modo não-controlado (`defaultValue`). A aba ativa recebe sublinhado azul.",
  code: `import { TabNavigationTremor } from "@/components/ui/tab-navigation-tremor"

export function Demo() {
  return (
    <TabNavigationTremor
      defaultValue="overview"
      items={[
        { value: "overview", label: "Visão geral" },
        { value: "reports", label: "Relatórios" },
        { value: "alerts", label: "Alertas" },
      ]}
    />
  )
}`,
  render: (
    <div className="w-full">
      <TabNavigationTremor
        defaultValue="overview"
        items={[
          { value: "overview", label: "Visão geral" },
          { value: "reports", label: "Relatórios" },
          { value: "alerts", label: "Alertas" },
        ]}
      />
    </div>
  ),
}

const tabNavWithIconsExample: Example = {
  title: "Com ícones + controlado",
  description:
    "Modo controlado (`value` + `onValueChange`) e ícones opcionais à esquerda do label. Estado gerenciado externamente — ideal para integrar com URL/router.",
  code: `import { useState } from "react"
import { Home, Settings, Users } from "lucide-react"
import { TabNavigationTremor } from "@/components/ui/tab-navigation-tremor"

export function Demo() {
  const [tab, setTab] = useState("home")
  return (
    <TabNavigationTremor
      value={tab}
      onValueChange={setTab}
      items={[
        { value: "home", label: "Início", icon: Home },
        { value: "team", label: "Equipe", icon: Users },
        { value: "settings", label: "Ajustes", icon: Settings },
        { value: "billing", label: "Cobrança", disabled: true },
      ]}
    />
  )
}`,
  render: (
    <div className="w-full">
      <TabNavigationTremor
        defaultValue="home"
        onValueChange={(value) => {
          // demo: clique na aba — consumidor real integra com useState/router
          void value
        }}
        items={[
          { value: "home", label: "Início", icon: Home },
          { value: "team", label: "Equipe", icon: Users },
          { value: "settings", label: "Ajustes", icon: Settings },
          { value: "billing", label: "Cobrança", disabled: true },
        ]}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                          date-range-picker-tremor                           */
/* -------------------------------------------------------------------------- */

const dateRangeBasicExample: Example = {
  title: "Intervalo customizado",
  description:
    "DateRangePickerTremor com `value` controlado (intervalo de 7 dias). Calendário duplo (2 meses), texto formatado em pt-BR via date-fns e botão de limpar quando há valor. Callback ignorado (demo estática) — em uso real, plugue seu próprio state.",
  code: `import { useState } from "react"
import { DateRangePickerTremor } from "@/components/ui/date-range-picker-tremor"
import type { DateRangePickerTremorValue } from "@/components/ui/date-range-picker-tremor"

export function Demo() {
  const today = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  const [value, setValue] = useState<DateRangePickerTremorValue>({
    from: weekAgo,
    to: today,
  })
  return (
    <DateRangePickerTremor
      value={value}
      onValueChange={setValue}
      placeholder="Selecione um período"
    />
  )
}`,
  render: (() => {
    const today = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 6)
    return (
      <div className="w-full max-w-md">
        <DateRangePickerTremor
          value={{ from: weekAgo, to: today }}
          onValueChange={() => {
            /* demo estática — consumidor real pluga state */
          }}
          placeholder="Selecione um período"
        />
      </div>
    )
  })(),
}

const dateRangePresetsExample: Example = {
  title: "Com presets rápidos",
  description:
    "Lista de presets (Today / Last 7 days / Month to date) passada via prop `presets` — ao clicar, o intervalo é aplicado e o preset fica destacado no Select.",
  code: `import { DateRangePickerTremor } from "@/components/ui/date-range-picker-tremor"
import type { DateRangePickerTremorPreset } from "@/components/ui/date-range-picker-tremor"

const presets: DateRangePickerTremorPreset[] = [
  { label: "Today", from: () => new Date(), to: () => new Date() },
  {
    label: "Last 7 days",
    from: () => {
      const d = new Date()
      d.setDate(d.getDate() - 6)
      return d
    },
    to: () => new Date(),
  },
  {
    label: "Month to date",
    from: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: () => new Date(),
  },
]

export function Demo() {
  return (
    <DateRangePickerTremor
      presets={presets}
      placeholder="Selecione um período"
    />
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <DateRangePickerTremor
        presets={[
          { label: "Today", from: () => new Date(), to: () => new Date() },
          {
            label: "Last 7 days",
            from: () => {
              const d = new Date()
              d.setDate(d.getDate() - 6)
              return d
            },
            to: () => new Date(),
          },
          {
            label: "Month to date",
            from: () =>
              new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            to: () => new Date(),
          },
        ]}
        placeholder="Selecione um período"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                          radio-card-group-tremor                            */
/* -------------------------------------------------------------------------- */

const radioCardBasicExample: Example = {
  title: "Escolha de plano",
  description:
    "RadioCardGroupTremor com 3 planos (Free, Pro, Business). Cada card mostra ícone + label + descrição; o selecionado recebe borda e ring azuis.",
  code: `import { CreditCard, Wallet, Zap } from "lucide-react"
import { RadioCardGroupTremor } from "@/components/ui/radio-card-group-tremor"
import type { RadioCardGroupTremorItem } from "@/components/ui/radio-card-group-tremor"

const items: RadioCardGroupTremorItem[] = [
  { value: "free", label: "Free", description: "1 usuário, 100 requests/mês", icon: Wallet },
  { value: "pro", label: "Pro", description: "10 usuários, 10k requests/mês", icon: Zap },
  { value: "biz", label: "Business", description: "Ilimitado, SLA 99.9%", icon: CreditCard },
]

export function Demo() {
  return <RadioCardGroupTremor defaultValue="pro" items={items} />
}`,
  render: (
    <div className="w-full max-w-md">
      <RadioCardGroupTremor
        defaultValue="pro"
        items={[
          {
            value: "free",
            label: "Free",
            description: "1 usuário, 100 requests/mês",
            icon: Wallet,
          },
          {
            value: "pro",
            label: "Pro",
            description: "10 usuários, 10k requests/mês",
            icon: Zap,
          },
          {
            value: "biz",
            label: "Business",
            description: "Ilimitado, SLA 99.9%",
            icon: CreditCard,
          },
        ]}
      />
    </div>
  ),
}

const radioCardPaymentExample: Example = {
  title: "Método de pagamento",
  description:
    "Card de pagamento com item `disabled` (Pix indisponível para a conta). Demonstra como `disabled` esmaece o card e bloqueia cliques mantendo a estrutura visual.",
  code: `import { CreditCard, Wallet } from "lucide-react"
import { RadioCardGroupTremor } from "@/components/ui/radio-card-group-tremor"
import type { RadioCardGroupTremorItem } from "@/components/ui/radio-card-group-tremor"

const items: RadioCardGroupTremorItem[] = [
  { value: "card", label: "Cartão de crédito", description: "Visa, Master, Elo", icon: CreditCard },
  { value: "pix", label: "Pix", description: "Indisponível para esta conta", icon: Wallet, disabled: true },
]

export function Demo() {
  return <RadioCardGroupTremor defaultValue="card" items={items} />
}`,
  render: (
    <div className="w-full max-w-md">
      <RadioCardGroupTremor
        defaultValue="card"
        items={[
          {
            value: "card",
            label: "Cartão de crédito",
            description: "Visa, Master, Elo",
            icon: CreditCard,
          },
          {
            value: "pix",
            label: "Pix",
            description: "Indisponível para esta conta",
            icon: Wallet,
            disabled: true,
          },
        ]}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  mapa                                       */
/* -------------------------------------------------------------------------- */

export const examplesTremor: Record<string, Example[]> = {
  "area-chart-tremor": [areaBasicExample, areaStackedExample],
  "bar-chart-tremor": [barBasicExample, barStackedExample],
  "line-chart-tremor": [lineBasicExample, lineMultiExample],
  "donut-chart-tremor": [donutBasicExample, donutPieExample],
  "scatter-chart-tremor": [scatterBasicExample],
  "combo-chart-tremor": [comboBasicExample],
  "category-bar-tremor": [categoryBarBasicExample],
  "bar-list-tremor": [barListBasicExample, barListClickableExample],
  "spark-chart-tremor": [sparkAreaExample, sparkBarExample],
  "tracker-tremor": [trackerYearExample, trackerCompactExample],
  "progress-bar-tremor": [progressBarBasicExample, progressBarVariantsExample],
  "progress-circle-tremor": [
    progressCircleBasicExample,
    progressCircleVariantsExample,
  ],
  "callout-tremor": [calloutInfoExample, calloutSuccessExample],
  "divider-tremor": [dividerBasicExample, dividerWithTextExample, dividerVerticalExample],
  "tab-navigation-tremor": [tabNavBasicExample, tabNavWithIconsExample],
  "date-range-picker-tremor": [dateRangeBasicExample, dateRangePresetsExample],
  "radio-card-group-tremor": [radioCardBasicExample, radioCardPaymentExample],
}