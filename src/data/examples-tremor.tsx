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
  CategoryBarTremor,
  ComboChartTremor,
  DonutChartTremor,
  LineChartTremor,
  ScatterChartTremor,
  SparkChartTremor,
} from "@/components/ui"

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
}