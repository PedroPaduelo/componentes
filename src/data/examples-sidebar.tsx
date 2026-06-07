import {
  SidebarExpandOnHoverDemo,
  SidebarAlwaysOpenDemo,
} from "./examples-sidebar-demos"
import type { Example } from "@/data/examples"

const expandOnHoverExample: Example = {
  title: "Expandir ao passar o mouse",
  description:
    "Barra lateral que recolhe para 60px e expande para 300px ao receber o cursor; no mobile vira um drawer.",
  code: `const links = [
  { label: "Dashboard", href: "#", icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
  { label: "Perfil", href: "#", icon: <UserCog className="h-5 w-5 shrink-0" /> },
  { label: "Configurações", href: "#", icon: <Settings className="h-5 w-5 shrink-0" /> },
  { label: "Sair", href: "#", icon: <LogOut className="h-5 w-5 shrink-0" /> },
]

<div className="flex h-[420px] w-full">
  <Sidebar>
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-1 flex-col gap-2">
        {links.map((link) => (
          <SidebarLink key={link.label} link={link} />
        ))}
      </div>
      <SidebarLink
        link={{
          label: "Manu Arora",
          href: "#",
          icon: <img src="/avatar.png" className="h-7 w-7 rounded-full" alt="Avatar" />,
        }}
      />
    </SidebarBody>
  </Sidebar>
  <main className="flex-1">Conteúdo</main>
</div>`,
  render: <SidebarExpandOnHoverDemo />,
}

const alwaysOpenExample: Example = {
  title: "Sempre expandida",
  description:
    "Com animate={false}, a barra lateral permanece sempre expandida em 300px.",
  code: `<div className="flex h-[360px] w-full">
  <Sidebar animate={false}>
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-1 flex-col gap-2">
        {links.map((link) => (
          <SidebarLink key={link.label} link={link} />
        ))}
      </div>
    </SidebarBody>
  </Sidebar>
  <main className="flex-1">Conteúdo</main>
</div>`,
  render: <SidebarAlwaysOpenDemo />,
}

export const examplesSidebar: Record<string, Example[]> = {
  sidebar: [expandOnHoverExample, alwaysOpenExample],
}
