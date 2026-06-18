import { Folder, Star } from "lucide-react"

import { CollapsibleSection } from "@/components/ui/collapsible-section"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Seções colapsáveis (não-controladas)",
  description:
    "Cada seção mantém seu próprio estado (via `defaultOpen`). Header com ícone, título e um slot `action` à direita (aqui, um badge de contagem).",
  code: `import { Folder, Star } from "lucide-react"

import { CollapsibleSection } from "@/components/ui/collapsible-section"

export function Demo() {
  return (
    <div className="w-64 rounded-lg border border-border">
      <CollapsibleSection
        title="Pastas"
        icon={<Folder className="size-3.5" />}
        action={<span className="rounded bg-muted px-1 text-[10px]">3</span>}
      >
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          <li>src</li>
          <li>public</li>
          <li>tests</li>
        </ul>
      </CollapsibleSection>
      <CollapsibleSection
        title="Favoritos"
        icon={<Star className="size-3.5" />}
        defaultOpen={false}
      >
        <p className="text-sm text-muted-foreground">Nenhum favorito</p>
      </CollapsibleSection>
    </div>
  )
}`,
  render: (
    <div className="w-64 rounded-lg border border-border">
      <CollapsibleSection
        title="Pastas"
        icon={<Folder className="size-3.5" />}
        action={<span className="rounded bg-muted px-1 text-[10px]">3</span>}
      >
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          <li>src</li>
          <li>public</li>
          <li>tests</li>
        </ul>
      </CollapsibleSection>
      <CollapsibleSection
        title="Favoritos"
        icon={<Star className="size-3.5" />}
        defaultOpen={false}
      >
        <p className="text-sm text-muted-foreground">Nenhum favorito</p>
      </CollapsibleSection>
    </div>
  ),
}

const controlledExample: Example = {
  title: "Controlada (open + onOpenChange)",
  description:
    "Passe `open` e `onOpenChange` para controlar o estado externamente — útil para abrir/fechar todas as seções de uma vez.",
  code: `import { useState } from "react"

import { CollapsibleSection } from "@/components/ui/collapsible-section"

export function Demo() {
  const [open, setOpen] = useState(true)
  return (
    <CollapsibleSection title="Detalhes" open={open} onOpenChange={setOpen}>
      <p className="text-sm text-muted-foreground">Conteúdo controlado.</p>
    </CollapsibleSection>
  )
}`,
  render: (
    <div className="w-64 rounded-lg border border-border">
      <CollapsibleSection
        title="Detalhes"
        open
        onOpenChange={() => undefined}
        action={<span className="rounded bg-muted px-1 text-[10px]">aberto</span>}
      >
        <p className="text-sm text-muted-foreground">
          Conteúdo controlado por estado externo.
        </p>
      </CollapsibleSection>
    </div>
  ),
}

export const examplesCollapsibleSection: Record<string, Example[]> = {
  "collapsible-section": [basicExample, controlledExample],
}
