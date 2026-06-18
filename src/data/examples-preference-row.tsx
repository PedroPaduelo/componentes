import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PreferenceRow } from "@/components/ui/preference-row"
import { Switch } from "@/components/ui/switch"

import type { Example } from "./examples"

const listExample: Example = {
  title: "Lista de preferências",
  description:
    "Várias linhas separadas por divisória, cada uma com título, descrição e um Switch à direita.",
  code: `import { PreferenceRow } from "@/components/ui/preference-row"
import { Switch } from "@/components/ui/switch"

export function Demo() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col divide-y divide-border">
        <PreferenceRow
          label="Notificações por e-mail"
          description="Receba alertas de atividade importante."
        >
          <Switch defaultChecked />
        </PreferenceRow>
        <PreferenceRow
          label="Relatório semanal"
          description="Um resumo dos KPIs toda segunda-feira."
        >
          <Switch />
        </PreferenceRow>
        <PreferenceRow
          label="Autenticação em dois fatores"
          description="Camada extra de segurança no login."
        >
          <Switch defaultChecked />
        </PreferenceRow>
      </div>
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col divide-y divide-border">
        <PreferenceRow
          label="Notificações por e-mail"
          description="Receba alertas de atividade importante."
        >
          <Switch defaultChecked />
        </PreferenceRow>
        <PreferenceRow
          label="Relatório semanal"
          description="Um resumo dos KPIs toda segunda-feira."
        >
          <Switch />
        </PreferenceRow>
        <PreferenceRow
          label="Autenticação em dois fatores"
          description="Camada extra de segurança no login."
        >
          <Switch defaultChecked />
        </PreferenceRow>
      </div>
    </div>
  ),
}

const controlPropExample: Example = {
  title: "Controle via prop e sem descrição",
  description:
    "O controle pode vir pela prop `control` (alternativa a children); a descrição é opcional.",
  code: `import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PreferenceRow } from "@/components/ui/preference-row"

export function Demo() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col divide-y divide-border">
        <PreferenceRow
          label="Plano atual"
          description="Sua assinatura ativa."
          control={<Badge variant="secondary">Pro anual</Badge>}
        />
        <PreferenceRow label="Exportar dados" control={<Button size="sm">Exportar</Button>} />
      </div>
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col divide-y divide-border">
        <PreferenceRow
          label="Plano atual"
          description="Sua assinatura ativa."
          control={<Badge variant="secondary">Pro anual</Badge>}
        />
        <PreferenceRow
          label="Exportar dados"
          control={<Button size="sm">Exportar</Button>}
        />
      </div>
    </div>
  ),
}

export const examplesPreferenceRow: Record<string, Example[]> = {
  "preference-row": [listExample, controlPropExample],
}
