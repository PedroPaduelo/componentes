import { Suspense, useState } from "react"
import { Outlet } from "react-router-dom"
import { PanelLeft } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  CompositionsSidebar,
  CompositionsSidebarNav,
} from "@/components/layout/CompositionsSidebar"
import { RouteFallback } from "@/components/layout/RouteFallback"

/**
 * Layout das COMPOSIÇÕES — espelha o `DocsLayout` de componentes: sidebar de
 * navegação encostada na borda esquerda (≥ lg) + conteúdo central que flui à
 * direita com a própria largura. Renderiza DENTRO do Layout existente (o Header
 * permanece fixo no topo). Em telas pequenas (< lg) a sidebar vira um drawer
 * (Sheet) acionado por um botão "Composições".
 *
 * A coluna central não impõe max-width própria: o conteúdo (Compositions /
 * CompositionDetail) controla seu container legível.
 */
export function CompositionsLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex w-full">
      {/* Sidebar encostada na borda esquerda (desktop ≥ lg) */}
      <CompositionsSidebar />

      {/* Coluna central — ocupa o resto da largura, à direita da sidebar */}
      <div className="min-w-0 flex-1">
        {/* Barra do drawer mobile (< lg) */}
        <div className="border-b border-border px-4 py-3 lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Abrir navegação de composições"
            >
              <PanelLeft className="h-4 w-4" />
              Composições
            </SheetTrigger>
            <SheetContent side="left" className="w-72 px-4 py-6">
              <SheetHeader className="p-0">
                <SheetTitle className="text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Composições
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 min-h-0 flex-1">
                <CompositionsSidebarNav
                  onNavigate={() => setDrawerOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
