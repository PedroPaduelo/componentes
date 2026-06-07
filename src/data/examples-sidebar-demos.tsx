import * as React from "react"
import { LayoutDashboard, UserCog, Settings, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  type SidebarLinkItem,
} from "@/components/ui/sidebar"

const demoLinks: SidebarLinkItem[] = [
  {
    label: "Dashboard",
    href: "#",
    icon: (
      <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Perfil",
    href: "#",
    icon: (
      <UserCog className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Configurações",
    href: "#",
    icon: (
      <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Sair",
    href: "#",
    icon: (
      <LogOut className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
]

function BrandLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="truncate whitespace-pre text-sm font-medium text-neutral-700 dark:text-neutral-200">
      {children}
    </span>
  )
}

export function SidebarExpandOnHoverDemo() {
  return (
    <div className="flex h-[420px] w-full overflow-hidden rounded-lg border border-border bg-background">
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="flex items-center gap-2 py-2">
              <div className="h-6 w-6 shrink-0 rounded-md bg-neutral-800 dark:bg-neutral-200" />
              <BrandLabel>Acme Inc</BrandLabel>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {demoLinks.map((link) => (
                <SidebarLink key={link.label} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src="https://picsum.photos/seed/sidebar-avatar/64/64"
                    className="h-7 w-7 shrink-0 rounded-full"
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Passe o mouse sobre a barra lateral para expandir.
        </p>
      </div>
    </div>
  )
}

export function SidebarAlwaysOpenDemo() {
  return (
    <div className="flex h-[360px] w-full overflow-hidden rounded-lg border border-border bg-background">
      <Sidebar animate={false}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col gap-2">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Menu
            </p>
            {demoLinks.slice(0, 3).map((link) => (
              <SidebarLink key={link.label} link={link} />
            ))}
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Barra lateral sempre expandida (animate=false).
        </p>
      </div>
    </div>
  )
}
