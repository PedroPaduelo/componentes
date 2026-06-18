import { Sparkles } from "lucide-react"

import { UpgradeCard } from "@/components/ui/upgrade-card"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Card de upgrade na sidebar",
  description:
    "Título, descrição e um CTA em botão (`onClick`). Pensado para o rodapé de uma sidebar de dashboard.",
  code: `import { UpgradeCard } from "@/components/ui/upgrade-card"

export function Demo() {
  return (
    <div className="w-56">
      <UpgradeCard
        title="Plano Pro"
        description="7 dias restantes no teste."
        cta={{ label: "Fazer upgrade", onClick: () => {} }}
      />
    </div>
  )
}`,
  render: (
    <div className="w-56">
      <UpgradeCard
        title="Plano Pro"
        description="7 dias restantes no teste."
        cta={{ label: "Fazer upgrade", onClick: () => {} }}
      />
    </div>
  ),
}

const withIconExample: Example = {
  title: "Com ícone e CTA em link",
  description:
    "Passe `icon` para um ícone antes do título e `cta.href` para renderizar o CTA como link (`<a>`) em vez de botão.",
  code: `import { Sparkles } from "lucide-react"

import { UpgradeCard } from "@/components/ui/upgrade-card"

export function Demo() {
  return (
    <div className="w-64">
      <UpgradeCard
        icon={Sparkles}
        title="Desbloqueie o Enterprise"
        description="SSO, auditoria e suporte prioritário."
        cta={{ label: "Ver planos", href: "#planos" }}
      />
    </div>
  )
}`,
  render: (
    <div className="w-64">
      <UpgradeCard
        icon={Sparkles}
        title="Desbloqueie o Enterprise"
        description="SSO, auditoria e suporte prioritário."
        cta={{ label: "Ver planos", href: "#planos" }}
      />
    </div>
  ),
}

export const examplesUpgradeCard: Record<string, Example[]> = {
  "upgrade-card": [basicExample, withIconExample],
}
