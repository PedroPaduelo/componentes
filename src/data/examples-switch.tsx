import { Switch } from "@/components/ui/switch"
import type { Example } from "@/data/examples"

const switchBasicExample: Example = {
  title: "Básico",
  description: "Switch ligar/desligar com estado controlado.",
  code: `<div className="flex items-center gap-2">
  <Switch id="airplane-mode" />
  <label htmlFor="airplane-mode" className="text-sm">
    Modo avião
  </label>
</div>`,
  render: (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <label htmlFor="airplane-mode" className="text-sm">
        Modo avião
      </label>
    </div>
  ),
}

const switchWithLabelExample: Example = {
  title: "Com label e descrição",
  description: "Switch com texto de apoio para contexto adicional.",
  code: `<div className="flex items-center justify-between rounded-lg border border-border p-4">
  <div className="space-y-0.5">
    <label htmlFor="notifications" className="text-sm font-medium">
      Notificações
    </label>
    <p className="text-xs text-muted-foreground">
      Receba alertas sobre novas mensagens.
    </p>
  </div>
  <Switch id="notifications" defaultChecked />
</div>`,
  render: (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="space-y-0.5">
        <label htmlFor="notifications" className="text-sm font-medium">
          Notificações
        </label>
        <p className="text-xs text-muted-foreground">
          Receba alertas sobre novas mensagens.
        </p>
      </div>
      <Switch id="notifications" defaultChecked />
    </div>
  ),
}

const switchDisabledExample: Example = {
  title: "Desabilitado",
  description: "Switch em estado desabilitado.",
  code: `<div className="flex items-center gap-2">
  <Switch id="disabled-switch" disabled />
  <label htmlFor="disabled-switch" className="text-sm text-muted-foreground">
    Indisponível
  </label>
</div>`,
  render: (
    <div className="flex items-center gap-2">
      <Switch id="disabled-switch" disabled />
      <label
        htmlFor="disabled-switch"
        className="text-sm text-muted-foreground"
      >
        Indisponível
      </label>
    </div>
  ),
}

export const examplesSwitch: Record<string, Example[]> = {
  switch: [switchBasicExample, switchWithLabelExample, switchDisabledExample],
}
