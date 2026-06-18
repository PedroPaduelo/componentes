import { DollarSign, Users, TrendingDown } from "lucide-react"

import { KpiCard } from "@/components/ui/kpi-card"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "KPI com ícone e variação",
  description:
    "Valor animado com prefixo monetário, ícone no canto e badge de variação positiva (verde).",
  code: `import { DollarSign } from "lucide-react"
import { KpiCard } from "@/components/ui/kpi-card"

export function Demo() {
  return (
    <div className="w-full max-w-xs">
      <KpiCard label="MRR" value={48290} prefix="$" delta={12.4} icon={DollarSign} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xs">
      <KpiCard label="MRR" value={48290} prefix="$" delta={12.4} icon={DollarSign} />
    </div>
  ),
}

const negativeExample: Example = {
  title: "Variação negativa e sufixo",
  description:
    "Churn com sufixo no valor e `delta` negativo — o badge fica vermelho automaticamente.",
  code: `import { TrendingDown } from "lucide-react"
import { KpiCard } from "@/components/ui/kpi-card"

export function Demo() {
  return (
    <div className="w-full max-w-xs">
      <KpiCard label="Churn" value={2} suffix=".3%" delta={-0.6} icon={TrendingDown} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xs">
      <KpiCard label="Churn" value={2} suffix=".3%" delta={-0.6} icon={TrendingDown} />
    </div>
  ),
}

const gridExample: Example = {
  title: "Grade de KPIs",
  description:
    "Vários cartões em grid para o topo de um dashboard. `hint` customizado no último.",
  code: `import { DollarSign, Users } from "lucide-react"
import { KpiCard } from "@/components/ui/kpi-card"

export function Demo() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      <KpiCard label="MRR" value={48290} prefix="$" delta={12.4} icon={DollarSign} />
      <KpiCard
        label="Clientes ativos"
        value={1284}
        delta={8.1}
        icon={Users}
        hint="últimos 30 dias"
      />
    </div>
  )
}`,
  render: (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      <KpiCard label="MRR" value={48290} prefix="$" delta={12.4} icon={DollarSign} />
      <KpiCard
        label="Clientes ativos"
        value={1284}
        delta={8.1}
        icon={Users}
        hint="últimos 30 dias"
      />
    </div>
  ),
}

export const examplesKpiCard: Record<string, Example[]> = {
  "kpi-card": [basicExample, negativeExample, gridExample],
}
