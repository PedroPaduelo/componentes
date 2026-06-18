import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { RouteFallback } from "@/components/layout/RouteFallback"

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Suspense do shell: páginas lazy carregam aqui mantendo header/footer. */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
