import { Zap, Flame, TrendingUp, CalendarDays } from "lucide-react"

import { StatTile } from "@/components/ui/stat-tile"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Grade de mini-estatísticas",
  description:
    "Tiles compactos com ícone, rótulo e valor animado (via AnimatedNumber). Use `prefix`/`suffix` para moeda ou unidades (ex.: \" dias\").",
  code: `import { Zap, Flame, TrendingUp, CalendarDays } from "lucide-react"

import { StatTile } from "@/components/ui/stat-tile"

export function Demo() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Eventos hoje" value={348} icon={Zap} />
      <StatTile label="Sequência ativa" value={14} suffix=" dias" icon={Flame} />
      <StatTile label="Pico semanal" value={1290} icon={TrendingUp} />
      <StatTile label="Total no período" value={18640} icon={CalendarDays} />
    </div>
  )
}`,
  render: (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Eventos hoje" value={348} icon={Zap} />
      <StatTile label="Sequência ativa" value={14} suffix=" dias" icon={Flame} />
      <StatTile label="Pico semanal" value={1290} icon={TrendingUp} />
      <StatTile label="Total no período" value={18640} icon={CalendarDays} />
    </div>
  ),
}

const withDeltaExample: Example = {
  title: "Com variação (delta) e dica",
  description:
    "Passe `delta` para um badge colorido por tendência (verde >= 0, vermelho < 0) e `hint` para um texto auxiliar. `prefix` exibe a moeda.",
  code: `import { TrendingUp } from "lucide-react"

import { StatTile } from "@/components/ui/stat-tile"

export function Demo() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile
        label="Receita do dia"
        value={4820}
        prefix="$"
        icon={TrendingUp}
        delta={6.2}
        hint="vs. ontem"
      />
      <StatTile
        label="Reembolsos"
        value={3}
        delta={-1.4}
        hint="vs. ontem"
      />
    </div>
  )
}`,
  render: (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      <StatTile
        label="Receita do dia"
        value={4820}
        prefix="$"
        icon={TrendingUp}
        delta={6.2}
        hint="vs. ontem"
      />
      <StatTile label="Reembolsos" value={3} delta={-1.4} hint="vs. ontem" />
    </div>
  ),
}

export const examplesStatTile: Record<string, Example[]> = {
  "stat-tile": [basicExample, withDeltaExample],
}
