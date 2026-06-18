import { Suspense, useState } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { RouteFallback } from "@/components/layout/RouteFallback"
import {
  CommandPalette,
  CommandPaletteTrigger,
} from "@/components/layout/CommandPalette"

export function Layout() {
  // Estado da command palette levantado aqui: o gatilho no Header (searchSlot)
  // e o atalho global ⌘K compartilham a MESMA instância de Dialog, renderizada
  // uma única vez no shell.
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header
        searchSlot={<CommandPaletteTrigger onClick={() => setSearchOpen(true)} />}
      />
      <main className="flex-1">
        {/* Suspense do shell: páginas lazy carregam aqui mantendo header/footer. */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
