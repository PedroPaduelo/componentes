import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardPanel } from "@/components/ui/dashboard-panel"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Painel com ação no header",
  description:
    "Título, descrição e um slot de ação (Badge) à direita; conteúdo livre em children.",
  code: `import { Badge } from "@/components/ui/badge"
import { DashboardPanel } from "@/components/ui/dashboard-panel"

export function Demo() {
  return (
    <DashboardPanel
      title="Receita por mês"
      description="Evolução do MRR ao longo do ano."
      action={<Badge variant="outline">2025</Badge>}
    >
      <div className="grid h-32 place-items-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
        Conteúdo do painel
      </div>
    </DashboardPanel>
  )
}`,
  render: (
    <div className="w-full max-w-xl">
      <DashboardPanel
        title="Receita por mês"
        description="Evolução do MRR ao longo do ano."
        action={<Badge variant="outline">2025</Badge>}
      >
        <div className="grid h-32 place-items-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
          Conteúdo do painel
        </div>
      </DashboardPanel>
    </div>
  ),
}

const minimalExample: Example = {
  title: "Apenas título + botão",
  description: "Sem descrição, com um botão como ação no header.",
  code: `import { Button } from "@/components/ui/button"
import { DashboardPanel } from "@/components/ui/dashboard-panel"

export function Demo() {
  return (
    <DashboardPanel title="Membros" action={<Button size="sm">Convidar</Button>}>
      <p className="text-sm text-muted-foreground">4 pessoas com acesso.</p>
    </DashboardPanel>
  )
}`,
  render: (
    <div className="w-full max-w-xl">
      <DashboardPanel title="Membros" action={<Button size="sm">Convidar</Button>}>
        <p className="text-sm text-muted-foreground">4 pessoas com acesso.</p>
      </DashboardPanel>
    </div>
  ),
}

export const examplesDashboardPanel: Record<string, Example[]> = {
  "dashboard-panel": [basicExample, minimalExample],
}
