import * as React from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react"

import { cn } from "@/lib/utils"

export type FloatingNavItem = {
  name: string
  link: string
  icon?: React.ReactNode
}

export type FloatingNavProps = {
  navItems: FloatingNavItem[]
  /** Rótulo do botão de CTA à direita. Passe `null` para ocultar. */
  ctaLabel?: React.ReactNode | null
  /** Handler do clique no CTA. */
  onCtaClick?: () => void
  /**
   * Container scrollável que dispara a visibilidade da navbar. Quando omitido,
   * usa o scroll da janela (comportamento padrão do Aceternity). Útil para
   * vitrines onde o scroll acontece dentro de um wrapper próprio.
   */
  scrollContainer?: React.RefObject<HTMLElement | null>
  className?: string
}

function FloatingNav({
  navItems,
  ctaLabel = "Login",
  onCtaClick,
  scrollContainer,
  className,
}: FloatingNavProps) {
  const { scrollYProgress } = useScroll(
    scrollContainer ? { container: scrollContainer } : undefined
  )
  const [visible, setVisible] = React.useState(false)

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current !== "number") return

    const previous = scrollYProgress.getPrevious() ?? 0
    const direction = current - previous

    if (current < 0.05) {
      setVisible(false)
    } else {
      setVisible(direction < 0)
    }
  })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        data-slot="floating-navbar"
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-x-0 top-10 z-[5000] mx-auto flex max-w-fit items-center justify-center",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur-md">
          <div className="flex items-center gap-1">
            {navItems.map((navItem) => (
              <a
                key={navItem.link}
                href={navItem.link}
                className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {navItem.icon ? (
                  <>
                    <span className="block sm:hidden">{navItem.icon}</span>
                    <span className="hidden sm:block">{navItem.name}</span>
                  </>
                ) : (
                  <span>{navItem.name}</span>
                )}
              </a>
            ))}
          </div>

          {ctaLabel !== null ? (
            <>
              <div className="h-5 w-px bg-border" />
              <button
                type="button"
                onClick={onCtaClick}
                className="relative rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:opacity-90 hover:shadow-lg"
              >
                <span>{ctaLabel}</span>
              </button>
            </>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export { FloatingNav }
