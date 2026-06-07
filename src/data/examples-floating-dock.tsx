import {
  Home,
  User,
  Settings,
  Mail,
  Github,
  Twitter,
} from "lucide-react"

import { FloatingDock } from "@/components/ui/floating-dock"
import type { Example } from "@/data/examples"

const dockItems = [
  { title: "Início", icon: <Home className="h-full w-full" />, href: "#" },
  { title: "Perfil", icon: <User className="h-full w-full" />, href: "#" },
  {
    title: "Configurações",
    icon: <Settings className="h-full w-full" />,
    href: "#",
  },
  { title: "Contato", icon: <Mail className="h-full w-full" />, href: "#" },
]

const socialItems = [
  { title: "GitHub", icon: <Github className="h-full w-full" />, href: "#" },
  { title: "Twitter", icon: <Twitter className="h-full w-full" />, href: "#" },
  { title: "E-mail", icon: <Mail className="h-full w-full" />, href: "#" },
]

export const examplesFloatingDock: Record<string, Example[]> = {
  "floating-dock": [
    {
      title: "Dock padrão",
      description:
        "Barra de navegação estilo macOS — passe o cursor sobre os ícones (md+) para ver a magnificação. No mobile, vira um botão flutuante que expande a lista.",
      code: `import {
  Home,
  User,
  Settings,
  Mail,
} from "lucide-react"
import { FloatingDock } from "@/components/ui/floating-dock"

const items = [
  { title: "Início", icon: <Home className="h-full w-full" />, href: "#" },
  { title: "Perfil", icon: <User className="h-full w-full" />, href: "#" },
  { title: "Configurações", icon: <Settings className="h-full w-full" />, href: "#" },
  { title: "Contato", icon: <Mail className="h-full w-full" />, href: "#" },
]

<FloatingDock items={items} />`,
      render: (
        <div className="flex min-h-[12rem] w-full items-center justify-center">
          <FloatingDock items={dockItems} />
        </div>
      ),
    },
    {
      title: "Dock social",
      description:
        "Mesmo componente com um conjunto reduzido de itens e classes extras via desktopClassName.",
      code: `import { Github, Twitter, Mail } from "lucide-react"
import { FloatingDock } from "@/components/ui/floating-dock"

const items = [
  { title: "GitHub", icon: <Github className="h-full w-full" />, href: "#" },
  { title: "Twitter", icon: <Twitter className="h-full w-full" />, href: "#" },
  { title: "E-mail", icon: <Mail className="h-full w-full" />, href: "#" },
]

<FloatingDock items={items} desktopClassName="bg-card" />`,
      render: (
        <div className="flex min-h-[12rem] w-full items-center justify-center">
          <FloatingDock items={socialItems} desktopClassName="bg-card" />
        </div>
      ),
    },
  ],
}
