import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

export interface DockItem {
  /** Texto exibido no tooltip e usado como chave de React. */
  title: string
  /** Ícone lucide-react a renderizar. */
  icon: LucideIcon
  /** Handler de clique. Se ausente e `href` for fornecido, navega via `window.location.href`. */
  onClick?: () => void
  /** URL para navegação. Usado apenas se `onClick` não for fornecido. */
  href?: string
}

export interface GlassDockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lista de itens exibidos no dock. */
  items: DockItem[]
  /** Classes extras aplicadas no container interno do dock. */
  dockClassName?: string
}

/** Tooltip horizontal offset = `index * 52 + 12` (cada item ocupa 40px + gap-4 = 56px, centralizado). */
const TOOLTIP_X_STEP = 52
const TOOLTIP_X_OFFSET = 12

/**
 * Dock macOS-inspired com glassmorphism e magnify on hover.
 * Adaptado do vengenceui glass-dock: removido gsap/MorphSVGPlugin (não usado na
 * vitrine), removido o state `isDark`/MutationObserver (código morto), e
 * trocado `framer-motion` por `motion/react` (motion@12 já instalado).
 */
const GlassDock = React.forwardRef<HTMLDivElement, GlassDockProps>(
  ({ items, className, dockClassName, ...props }, ref) => {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
    const [direction, setDirection] = React.useState(0)

    const handleMouseEnter = (index: number) => {
      if (hoveredIndex !== null && index !== hoveredIndex) {
        setDirection(index > hoveredIndex ? 1 : -1)
      }
      setHoveredIndex(index)
    }

    const getTooltipPosition = (index: number): number =>
      index * TOOLTIP_X_STEP + TOOLTIP_X_OFFSET

    const handleItemClick = (item: DockItem) => () => {
      if (item.onClick) {
        item.onClick()
      } else if (item.href) {
        window.location.href = item.href
      }
    }

    return (
      <div
        ref={ref}
        data-slot="glass-dock"
        className={cn("w-max", className)}
        {...props}
      >
        <div
          className={cn(
            "relative flex items-center justify-center gap-4 rounded-2xl px-6 py-4",
            "glass-border bg-white/80 dark:bg-black/80",
            "shadow-2xl backdrop-blur-xl",
            dockClassName
          )}
          onMouseLeave={() => {
            setHoveredIndex(null)
            setDirection(0)
          }}
        >
          <AnimatePresence>
            {hoveredIndex !== null && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: -60,
                  x: getTooltipPosition(hoveredIndex),
                }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="pointer-events-none absolute top-0 left-0 z-30"
              >
                <div
                  className={cn(
                    "flex min-w-[100px] items-center justify-center rounded-lg border px-5 py-2 shadow-md",
                    "border-neutral-700 bg-black text-white dark:border-neutral-300 dark:bg-white dark:text-black"
                  )}
                >
                  <div className="relative flex h-4 w-full items-center justify-center overflow-hidden">
                    <AnimatePresence mode="popLayout" custom={direction}>
                      <motion.span
                        key={items[hoveredIndex]?.title}
                        custom={direction}
                        initial={{
                          x: direction > 0 ? 35 : -35,
                          opacity: 0,
                          filter: "blur(6px)",
                        }}
                        animate={{
                          x: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          x: direction > 0 ? -35 : 35,
                          opacity: 0,
                          filter: "blur(6px)",
                        }}
                        transition={{
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className="whitespace-nowrap text-[13px] font-medium tracking-wide"
                      >
                        {items[hoveredIndex]?.title}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.map((item, index) => {
            const Icon = item.icon
            const isHovered = hoveredIndex === index
            const onClick = handleItemClick(item)

            return (
              <div
                key={item.title}
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={onClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onClick()
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={item.title}
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    y: isHovered ? -3 : 0,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <Icon
                    size={22}
                    strokeWidth={2}
                    className={cn(
                      "transition-colors duration-200",
                      isHovered
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-500 dark:text-neutral-400"
                    )}
                  />
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

GlassDock.displayName = "GlassDock"

export { GlassDock }
