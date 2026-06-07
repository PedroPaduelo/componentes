import * as React from "react"

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

export function ResizableNavbarFullDemo() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  return (
    <div className="relative h-[28rem] w-full overflow-y-auto rounded-xl border border-border bg-background">
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
              <a
                key={item.link}
                href={item.link}
                onClick={() => setIsMobileOpen(false)}
                className="text-neutral-600 dark:text-neutral-300"
              >
                {item.name}
              </a>
            ))}
            <NavbarButton variant="primary" href="#signup" className="w-full">
              Começar
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </ResizableNavbar>

      <div className="px-6 pt-32 pb-12">
        <h2 className="mb-3 text-2xl font-bold">Role para encolher a navbar</h2>
        <p className="text-muted-foreground">
          Ao rolar para baixo, a barra de navegação encolhe, ganha blur e sombra.
        </p>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i} className="text-muted-foreground">
              Conteúdo de demonstração para gerar rolagem suficiente. Parágrafo{" "}
              {i + 1}.
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ResizableNavbarSimpleDemo() {
  return (
    <div className="relative h-[24rem] w-full overflow-y-auto rounded-xl border border-border bg-background">
      <ResizableNavbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={NAV_ITEMS} />
          <NavbarButton variant="gradient" href="#cta">
            Assinar
          </NavbarButton>
        </NavBody>
      </ResizableNavbar>

      <div className="px-6 pt-32 pb-12">
        <h2 className="mb-3 text-2xl font-bold">Navbar com botão gradiente</h2>
        <div className="mt-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <p key={i} className="text-muted-foreground">
              Role para ver a animação de redimensionamento. Linha {i + 1}.
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
