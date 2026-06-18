import { CreditCard, Activity, DollarSign, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DetailStatCell } from "@/components/ui/detail-stat-cell"

import type { Example } from "./examples"

const gridExample: Example = {
  title: "Resumo em duas colunas",
  description:
    "Grade de células de detalhe com ícone, rótulo e valores variados (Badge, status, texto).",
  code: `import { CreditCard, Activity, DollarSign, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DetailStatCell } from "@/components/ui/detail-stat-cell"

export function Demo() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <DetailStatCell icon={CreditCard} label="Plano">
        <Badge>Enterprise</Badge>
      </DetailStatCell>
      <DetailStatCell icon={Activity} label="Status">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          Ativo
        </span>
      </DetailStatCell>
      <DetailStatCell icon={DollarSign} label="MRR">
        <span className="font-medium text-foreground">$1,200</span>
      </DetailStatCell>
      <DetailStatCell icon={Users} label="País">
        <span className="text-foreground">Brasil</span>
      </DetailStatCell>
    </div>
  )
}`,
  render: (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <DetailStatCell icon={CreditCard} label="Plano">
        <Badge>Enterprise</Badge>
      </DetailStatCell>
      <DetailStatCell icon={Activity} label="Status">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          Ativo
        </span>
      </DetailStatCell>
      <DetailStatCell icon={DollarSign} label="MRR">
        <span className="font-medium text-foreground">$1,200</span>
      </DetailStatCell>
      <DetailStatCell icon={Users} label="País">
        <span className="text-foreground">Brasil</span>
      </DetailStatCell>
    </div>
  ),
}

const noIconExample: Example = {
  title: "Sem ícone",
  description: "Célula simples, apenas rótulo e valor em fonte mono.",
  code: `import { DetailStatCell } from "@/components/ui/detail-stat-cell"

export function Demo() {
  return (
    <div className="w-full max-w-[200px]">
      <DetailStatCell label="ID">
        <span className="font-mono text-xs text-foreground">CUS-1042</span>
      </DetailStatCell>
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-[200px]">
      <DetailStatCell label="ID">
        <span className="font-mono text-xs text-foreground">CUS-1042</span>
      </DetailStatCell>
    </div>
  ),
}

export const examplesDetailStatCell: Record<string, Example[]> = {
  "detail-stat-cell": [gridExample, noIconExample],
}
