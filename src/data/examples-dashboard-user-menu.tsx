import { User, Settings, Receipt, LogOut } from "lucide-react"

import { DashboardUserMenu } from "@/components/ui/dashboard-user-menu"
import type { DashboardUserMenuItem } from "@/components/ui/dashboard-user-menu"

import type { Example } from "./examples"

const ITEMS: DashboardUserMenuItem[] = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "billing", label: "Cobrança", icon: Receipt },
  {
    id: "logout",
    label: "Sair",
    icon: LogOut,
    destructive: true,
    separatorBefore: true,
  },
]

const basicExample: Example = {
  title: "Menu do usuário na topbar",
  description:
    "Avatar + chevron que abre um menu com identidade (nome/e-mail) e ações. As ações vêm por `items` e disparam `onSelect(id)`; a última é destrutiva e isolada por um separador.",
  code: `import { User, Settings, Receipt, LogOut } from "lucide-react"

import { DashboardUserMenu } from "@/components/ui/dashboard-user-menu"
import type { DashboardUserMenuItem } from "@/components/ui/dashboard-user-menu"

const items: DashboardUserMenuItem[] = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "billing", label: "Cobrança", icon: Receipt },
  { id: "logout", label: "Sair", icon: LogOut, destructive: true, separatorBefore: true },
]

export function Demo() {
  return (
    <div className="flex w-full justify-end rounded-xl border border-border bg-card p-4">
      <DashboardUserMenu
        name="Aurora Vale"
        email="aurora@nimbus.io"
        avatar="https://picsum.photos/seed/aurora.vale/64/64"
        fallback="AV"
        items={items}
        onSelect={(id) => console.log("ação:", id)}
      />
    </div>
  )
}`,
  render: (
    <div className="flex w-full justify-end rounded-xl border border-border bg-card p-4">
      <DashboardUserMenu
        name="Aurora Vale"
        email="aurora@nimbus.io"
        avatar="https://picsum.photos/seed/aurora.vale/64/64"
        fallback="AV"
        items={ITEMS}
        onSelect={() => {}}
      />
    </div>
  ),
}

const noAvatarExample: Example = {
  title: "Sem avatar e sem chevron",
  description:
    "Sem `avatar`, mostra só o fallback (iniciais). `email` e `showChevron` são opcionais.",
  code: `import { User, LogOut } from "lucide-react"

import { DashboardUserMenu } from "@/components/ui/dashboard-user-menu"

export function Demo() {
  return (
    <div className="flex w-full justify-end rounded-xl border border-border bg-card p-4">
      <DashboardUserMenu
        name="Theo Bauer"
        fallback="TB"
        showChevron={false}
        items={[
          { id: "profile", label: "Perfil", icon: User },
          { id: "logout", label: "Sair", icon: LogOut, destructive: true, separatorBefore: true },
        ]}
        onSelect={(id) => console.log(id)}
      />
    </div>
  )
}`,
  render: (
    <div className="flex w-full justify-end rounded-xl border border-border bg-card p-4">
      <DashboardUserMenu
        name="Theo Bauer"
        fallback="TB"
        showChevron={false}
        items={[
          { id: "profile", label: "Perfil", icon: User },
          {
            id: "logout",
            label: "Sair",
            icon: LogOut,
            destructive: true,
            separatorBefore: true,
          },
        ]}
        onSelect={() => {}}
      />
    </div>
  ),
}

export const examplesDashboardUserMenu: Record<string, Example[]> = {
  "dashboard-user-menu": [basicExample, noAvatarExample],
}
