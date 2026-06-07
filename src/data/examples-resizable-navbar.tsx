import type { Example } from "@/data/examples"
import {
  ResizableNavbarFullDemo,
  ResizableNavbarSimpleDemo,
} from "@/data/resizable-navbar-demo"

const fullExample: Example = {
  title: "Navbar completa (desktop + mobile)",
  description:
    "Barra de navegação que encolhe ao rolar, com menu mobile colapsável.",
  code: `import * as React from "react"
import {
  ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar"

const NAV_ITEMS = [
  { name: "Recursos", link: "#features" },
  { name: "Preços", link: "#pricing" },
  { name: "Contato", link: "#contact" },
]

export function Example() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  return (
    <ResizableNavbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <div className="flex items-center gap-2">
          <NavbarButton variant="secondary" href="#login">
            Entrar
          </NavbarButton>
          <NavbarButton variant="primary" href="#signup">
            Começar
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileOpen}
            onClick={() => setIsMobileOpen((v) => !v)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
        >
          {NAV_ITEMS.map((item) => (
            <a key={item.link} href={item.link}>
              {item.name}
            </a>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  )
}`,
  render: <ResizableNavbarFullDemo />,
}

const simpleExample: Example = {
  title: "Variante simples com botão gradiente",
  description: "Apenas a barra desktop, com um botão de CTA gradiente.",
  code: `import {
  ResizableNavbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar"

const NAV_ITEMS = [
  { name: "Recursos", link: "#features" },
  { name: "Preços", link: "#pricing" },
  { name: "Contato", link: "#contact" },
]

export function Example() {
  return (
    <ResizableNavbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <NavbarButton variant="gradient" href="#cta">
          Assinar
        </NavbarButton>
      </NavBody>
    </ResizableNavbar>
  )
}`,
  render: <ResizableNavbarSimpleDemo />,
}

export const examplesResizableNavbar: Record<string, Example[]> = {
  "resizable-navbar": [fullExample, simpleExample],
}
