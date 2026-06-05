import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  tocMinimapVariants,
  tocMinimapItemVariants,
  tocMinimapIndicatorVariants,
  tocMinimapProgressVariants,
} from "@/components/ui/toc-minimap-variants"

// ─── Types ──────────────────────────────────────────────────────────

export type TOCItem = {
  /** Section id (used as hash anchor, e.g. "features" for #features). */
  id: string
  /** Display label. */
  label: string
  /** Nesting depth 1–3 (visual indentation in vertical mode). */
  level?: 1 | 2 | 3
}

export type TOCMinimapProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof tocMinimapVariants> & {
    /** Ordered list of TOC entries. */
    items: TOCItem[]
    /** Show a scroll progress bar (default true). */
    showProgress?: boolean
  }

// ─── Component ──────────────────────────────────────────────────────

function TOCMinimap({
  items,
  className,
  orientation = "vertical",
  showProgress = true,
  ...hostProps
}: TOCMinimapProps) {
  const [activeId, setActiveId] = React.useState<string>("")
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [hovered, setHovered] = React.useState(false)

  // IntersectionObserver: detect which section is currently visible.
  React.useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top of the viewport (the one
        // dominating the reading area). When the page is above the first
        // section or below the last, the previous activeId remains.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          const topEntry = visible[0]
          if (topEntry && topEntry.target.id) {
            setActiveId(topEntry.target.id)
          }
        }
      },
      {
        // A section is "active" when any part of it is on screen. Combined
        // with sorting by top, the topmost visible section wins, and the
        // first section is always active at scroll=0.
        rootMargin: "0px",
        threshold: 0,
      }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  // Scroll progress: 0–100 % based on document scroll position.
  React.useEffect(() => {
    if (!showProgress) return

    function updateProgress() {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
      setScrollProgress(progress)
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)
    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [showProgress])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      // Update URL hash without jumping.
      window.history.pushState(null, "", `#${id}`)
    }
  }

  if (items.length === 0) return null

  return (
    <div
      data-slot="toc-minimap"
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex flex-row items-center gap-1",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...hostProps}
    >
      {/* Scroll progress bar */}
      {showProgress && (
        <div
          data-slot="toc-minimap-progress"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso de scroll da página"
          className={cn(
            "toc-minimap-progress",
            tocMinimapProgressVariants({ orientation }),
            orientation === "vertical" ? "fixed left-0 top-0" : "fixed top-0 left-0"
          )}
        >
          <div
            className="bg-foreground/60 rounded-full transition-[width,height] duration-150"
            style={
              orientation === "vertical"
                ? { width: "100%", height: `${scrollProgress}%` }
                : { height: "100%", width: `${scrollProgress}%` }
            }
          />
        </div>
      )}

      {/* TOC items */}
      <nav
        className={cn(
          tocMinimapVariants({ orientation }),
          orientation === "vertical" ? "w-full" : "flex flex-row items-center"
        )}
        aria-label="Table of contents"
      >
        {items.map((item) => {
          const isActive = activeId === item.id
          const depth = item.level ?? 1

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              data-active={isActive ? "true" : undefined}
              data-slot="toc-minimap-item"
              className={cn(
                tocMinimapItemVariants({ active: isActive, orientation }),
                orientation === "vertical" &&
                  depth > 1 &&
                  `pl-${depth === 2 ? 4 : 6}`
              )}
              aria-current={isActive ? "location" : undefined}
            >
              {/* Active indicator dot / bar */}
              {isActive && (
                <span
                  className={cn(
                    tocMinimapIndicatorVariants({ orientation })
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Label — show on hover in minimap mode, always in expanded */}
              <span
                className={cn(
                  "truncate",
                  orientation === "vertical"
                    ? hovered || isActive
                      ? "opacity-100"
                      : "opacity-0 w-0"
                    : undefined,
                  "transition-opacity duration-200"
                )}
              >
                {item.label}
              </span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}

export { TOCMinimap }
