import * as React from "react"
import { Home, User, MessageSquare } from "lucide-react"

import { FloatingNav, type FloatingNavItem } from "@/components/ui/floating-navbar"

const DEFAULT_ITEMS: FloatingNavItem[] = [
  { name: "Início", link: "#inicio", icon: <Home className="size-4" /> },
  { name: "Sobre", link: "#sobre", icon: <User className="size-4" /> },
  { name: "Contato", link: "#contato", icon: <MessageSquare className="size-4" /> },
]

export type FloatingNavbarDemoProps = {
  navItems?: FloatingNavItem[]
  ctaLabel?: React.ReactNode | null
}

/**
 * Demo isolado: cria uma área scrollável própria e pluga a FloatingNav nela via
 * `scrollContainer`. A navbar aparece ao rolar para cima (depois de 5% de scroll).
 */
function FloatingNavbarDemo({
  navItems = DEFAULT_ITEMS,
  ctaLabel = "Entrar",
}: FloatingNavbarDemoProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      className="relative h-[26rem] w-full overflow-y-auto rounded-xl border border-border bg-muted/30"
    >
      <FloatingNav navItems={navItems} ctaLabel={ctaLabel} scrollContainer={scrollRef} />

      <div className="space-y-4 p-6">
        <p className="text-sm font-medium text-foreground">
          Role para baixo e depois para cima — a navbar flutuante aparece.
        </p>
        {Array.from({ length: 14 }).map((_, i) => (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            Parágrafo {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </div>
  )
}

export { FloatingNavbarDemo }
