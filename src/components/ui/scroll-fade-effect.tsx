import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { scrollFadeEffectVariants } from "@/components/ui/scroll-fade-effect-variants"

// ─── Tipos públicos ────────────────────────────────────────────────

export type ScrollFadeEffectOrientation = "vertical" | "horizontal"

export type ScrollFadeEffectProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof scrollFadeEffectVariants> & {
    /** Conteúdo renderizado dentro do container scrollável. */
    children: React.ReactNode

    /**
     * Direção do scroll.
     * @default "vertical"
     */
    orientation?: ScrollFadeEffectOrientation

    /**
     * Altura do gradiente de fade em pixels.
     * @default 32
     */
    fadeHeight?: number

    /**
     * Cor de fundo usada no gradiente de fade.
     * Se não informada, usa `var(--background)` do tema shadcn.
     */
    fadeColor?: string
  }

// ─── Componente ────────────────────────────────────────────────────

function ScrollFadeEffect({
  children,
  orientation = "vertical",
  fadeHeight = 32,
  fadeColor,
  variant,
  className,
  ...hostProps
}: ScrollFadeEffectProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const topSentinelRef = React.useRef<HTMLDivElement>(null)
  const bottomSentinelRef = React.useRef<HTMLDivElement>(null)
  const leftSentinelRef = React.useRef<HTMLDivElement>(null)
  const rightSentinelRef = React.useRef<HTMLDivElement>(null)

  const [showStart, setShowStart] = React.useState(false)
  const [showEnd, setShowEnd] = React.useState(false)

  const color = fadeColor ?? "var(--background)"

  // IntersectionObserver para detectar se sentinelas estão visíveis
  React.useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const isVertical = orientation === "vertical"
    const startSentinel = isVertical ? topSentinelRef.current : leftSentinelRef.current
    const endSentinel = isVertical ? bottomSentinelRef.current : rightSentinelRef.current

    if (!startSentinel || !endSentinel) return

    const observerOptions: IntersectionObserverInit = {
      root: container,
      threshold: 0,
    }

    const startObserver = new IntersectionObserver(([entry]) => {
      setShowStart(!entry.isIntersecting)
    }, observerOptions)

    const endObserver = new IntersectionObserver(([entry]) => {
      setShowEnd(!entry.isIntersecting)
    }, observerOptions)

    startObserver.observe(startSentinel)
    endObserver.observe(endSentinel)

    return () => {
      startObserver.disconnect()
      endObserver.disconnect()
    }
  }, [orientation])

  // Checagem inicial: se o conteúdo não transborda, fades ficam ocultos
  React.useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const checkOverflow = () => {
      if (orientation === "vertical") {
        const hasOverflow = container.scrollHeight > container.clientHeight
        if (!hasOverflow) {
          setShowStart(false)
          setShowEnd(false)
        } else {
          // Re-check sentinels after content change
          setShowStart(container.scrollTop > 0)
          setShowEnd(
            container.scrollTop + container.clientHeight < container.scrollHeight
          )
        }
      } else {
        const hasOverflow = container.scrollWidth > container.clientWidth
        if (!hasOverflow) {
          setShowStart(false)
          setShowEnd(false)
        } else {
          setShowStart(container.scrollLeft > 0)
          setShowEnd(
            container.scrollLeft + container.clientWidth < container.scrollWidth
          )
        }
      }
    }

    checkOverflow()

    const ro = new ResizeObserver(checkOverflow)
    ro.observe(container)
    return () => ro.disconnect()
  }, [orientation])

  const isVertical = orientation === "vertical"

  // CSS mask: aplica gradiente para criar o fade
  const maskStyle = React.useMemo<React.CSSProperties>(() => {
    const fh = `${fadeHeight}px`
    if (isVertical) {
      return {
        maskImage: `linear-gradient(to bottom, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
      }
    }
    return {
      maskImage: `linear-gradient(to right, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
      WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
    }
  }, [fadeHeight, isVertical])

  // Overlay gradients (fallback + decorative glow on top of mask)
  const startOverlayStyle = isVertical
    ? {
        background: `linear-gradient(to bottom, ${color}, transparent)`,
        top: 0,
        left: 0,
        right: 0,
        height: `${fadeHeight}px`,
      }
    : {
        background: `linear-gradient(to right, ${color}, transparent)`,
        top: 0,
        left: 0,
        bottom: 0,
        width: `${fadeHeight}px`,
      }

  const endOverlayStyle = isVertical
    ? {
        background: `linear-gradient(to top, ${color}, transparent)`,
        bottom: 0,
        left: 0,
        right: 0,
        height: `${fadeHeight}px`,
      }
    : {
        background: `linear-gradient(to left, ${color}, transparent)`,
        top: 0,
        right: 0,
        bottom: 0,
        width: `${fadeHeight}px`,
      }

  return (
    <div
      data-slot="scroll-fade-effect"
      data-orientation={orientation}
      className={cn(
        scrollFadeEffectVariants({ variant, className })
      )}
      {...hostProps}
    >
      {/* Scrollable container with CSS mask */}
      <div
        ref={scrollRef}
        className={cn(
          "relative",
          isVertical ? "overflow-y-auto" : "overflow-x-auto",
          "h-full w-full"
        )}
        style={maskStyle}
      >
        {/* Start sentinel (top/left) */}
        <div
          ref={topSentinelRef}
          className={isVertical ? "sticky top-0 h-0" : "hidden"}
          aria-hidden="true"
        />
        <div
          ref={leftSentinelRef}
          className={!isVertical ? "sticky left-0 w-0" : "hidden"}
          aria-hidden="true"
        />

        {children}

        {/* End sentinel (bottom/right) */}
        <div
          ref={bottomSentinelRef}
          className={isVertical ? "sticky bottom-0 h-0" : "hidden"}
          aria-hidden="true"
        />
        <div
          ref={rightSentinelRef}
          className={!isVertical ? "sticky right-0 w-0" : "hidden"}
          aria-hidden="true"
        />
      </div>

      {/* Overlay fade at start (top/left) */}
      <div
        className="pointer-events-none absolute z-10 transition-opacity duration-200"
        style={{
          ...startOverlayStyle,
          opacity: showStart ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Overlay fade at end (bottom/right) */}
      <div
        className="pointer-events-none absolute z-10 transition-opacity duration-200"
        style={{
          ...endOverlayStyle,
          opacity: showEnd ? 1 : 0,
        }}
        aria-hidden="true"
      />
    </div>
  )
}

export { ScrollFadeEffect }
