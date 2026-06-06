import { useState } from "react"
import { Outlet } from "react-router-dom"
import { PanelLeft } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { DocsSidebar, DocsSidebarNav } from "@/components/layout/DocsSidebar"

/**
 * Layout de DOCUMENTAÇÃO (estilo shadcn docs): sidebar de navegação à esquerda
 * + conteúdo central (Outlet). Renderiza DENTRO do Layout existente (o Header
 * permanece fixo no topo). Em telas pequenas (< lg) a sidebar vira um drawer
 * (Sheet) acionado por um botão "Componentes".
 */
export function DocsLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      {/* Sidebar fixa (desktop ≥ lg) */}
      <DocsSidebar />

      {/* Coluna central */}
      <div className="min-w-0 flex-1">
        {/* Barra do drawer mobile (< lg) */}
        <div className="border-b border-border px-4 py-3 lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Abrir navegação de componentes"
            >
              <PanelLeft className="h-4 w-4" />
              Componentes
            </SheetTrigger>
            <SheetContent side="left" className="w-72 px-4 py-6">
              <SheetHeader className="p-0">
                <SheetTitle className="text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Componentes
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 min-h-0 flex-1">
                <DocsSidebarNav onNavigate={() => setDrawerOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/*
          A coluna central não impõe max-width/padding próprios: o conteúdo
          (FamilyDetail) controla seu próprio container legível. Evita
          double-wrap e mantém o conteúdo da página intacto nesta fase.
        */}
        <Outlet />
      </div>
    </div>
  )
}
