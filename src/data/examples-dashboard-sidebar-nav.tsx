import { LayoutDashboard, BarChart3, Users, Settings, Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardSidebarNav } from "@/components/ui/dashboard-sidebar-nav"
import type { DashboardSidebarNavItem } from "@/components/ui/dashboard-sidebar-nav"

import type { Example } from "./examples"

const NAV: DashboardSidebarNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "settings", label: "Settings", icon: Settings },
]

const basicExample: Example = {
  title: "Navegação lateral controlada",
  description:
    "Sidebar com marca no topo, itens com ícone + estado ativo e um card de upgrade fixado no rodapé. O id ativo e a seleção vêm por props (`activeId`/`onSelect`).",
  code: `import * as React from "react"
import { LayoutDashboard, BarChart3, Users, Settings, Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardSidebarNav } from "@/components/ui/dashboard-sidebar-nav"
import type { DashboardSidebarNavItem } from "@/components/ui/dashboard-sidebar-nav"

const NAV: DashboardSidebarNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Demo() {
  const [active, setActive] = React.useState("overview")
  return (
    <div className="h-[460px] overflow-hidden rounded-xl border border-border">
      <DashboardSidebarNav
        className="h-full"
        items={NAV}
        activeId={active}
        onSelect={setActive}
        brand={
          <>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="size-4" />
            </span>
            <span className="text-sm font-semibold">Nimbus</span>
          </>
        }
        footer={
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium">Plano Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">7 dias restantes no teste.</p>
            <Button size="sm" className="mt-3 w-full">Fazer upgrade</Button>
          </div>
        }
      />
    </div>
  )
}`,
  render: (
    <div className="h-[460px] overflow-hidden rounded-xl border border-border">
      <DashboardSidebarNav
        className="h-full"
        items={NAV}
        activeId="overview"
        brand={
          <>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="size-4" />
            </span>
            <span className="text-sm font-semibold">Nimbus</span>
          </>
        }
        footer={
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium">Plano Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              7 dias restantes no teste.
            </p>
            <Button size="sm" className="mt-3 w-full">
              Fazer upgrade
            </Button>
          </div>
        }
      />
    </div>
  ),
}

const minimalExample: Example = {
  title: "Apenas itens (sem brand/footer)",
  description:
    "Sem `brand`/`footer` e sem ícones, a sidebar fica reduzida só à lista de navegação.",
  code: `import { DashboardSidebarNav } from "@/components/ui/dashboard-sidebar-nav"

export function Demo() {
  return (
    <DashboardSidebarNav
      activeId="reports"
      items={[
        { id: "home", label: "Início" },
        { id: "reports", label: "Relatórios" },
        { id: "team", label: "Equipe" },
        { id: "settings", label: "Ajustes" },
      ]}
    />
  )
}`,
  render: (
    <DashboardSidebarNav
      className="rounded-xl border border-border"
      activeId="reports"
      items={[
        { id: "home", label: "Início" },
        { id: "reports", label: "Relatórios" },
        { id: "team", label: "Equipe" },
        { id: "settings", label: "Ajustes" },
      ]}
    />
  ),
}

export const examplesDashboardSidebarNav: Record<string, Example[]> = {
  "dashboard-sidebar-nav": [basicExample, minimalExample],
}
