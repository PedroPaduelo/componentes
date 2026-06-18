import { Bell, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardTopbar } from "@/components/ui/dashboard-topbar"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Topbar com título, busca e ações",
  description:
    "Título à esquerda (com um badge de status via `titleAdornment`), um slot de `search` e as `actions` à direita. Sem estado interno — tudo vem por props.",
  code: `import { Bell, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardTopbar } from "@/components/ui/dashboard-topbar"

export function Demo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <DashboardTopbar
        title="Visão geral"
        titleAdornment={
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Tempo real
          </Badge>
        }
        search={
          <Button variant="outline" size="sm" className="hidden gap-2 sm:inline-flex">
            <Search className="size-4" />
            Buscar
          </Button>
        }
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Notificações">
              <Bell className="size-4" />
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Novo relatório
            </Button>
          </>
        }
      />
    </div>
  )
}`,
  render: (
    <div className="w-full overflow-hidden rounded-xl border border-border">
      <DashboardTopbar
        title="Visão geral"
        titleAdornment={
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Tempo real
          </Badge>
        }
        search={
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
          >
            <Search className="size-4" />
            Buscar
          </Button>
        }
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Notificações">
              <Bell className="size-4" />
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Novo relatório
            </Button>
          </>
        }
      />
    </div>
  ),
}

const withSearchInputExample: Example = {
  title: "Campo de busca padrão + botão de menu",
  description:
    "Quando `onSearch` é passado (sem `search`), a topbar renderiza um campo de busca padrão. `onMenu` exibe o botão de menu (visível só no mobile).",
  code: `import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardTopbar } from "@/components/ui/dashboard-topbar"

export function Demo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <DashboardTopbar
        title="Clientes"
        onMenu={() => {}}
        onSearch={(v) => console.log(v)}
        searchPlaceholder="Buscar cliente…"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Adicionar
          </Button>
        }
      />
    </div>
  )
}`,
  render: (
    <div className="w-full overflow-hidden rounded-xl border border-border">
      <DashboardTopbar
        title="Clientes"
        onMenu={() => {}}
        onSearch={() => {}}
        searchPlaceholder="Buscar cliente…"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Adicionar
          </Button>
        }
      />
    </div>
  ),
}

export const examplesDashboardTopbar: Record<string, Example[]> = {
  "dashboard-topbar": [basicExample, withSearchInputExample],
}
