import * as React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GlowCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns in the grid. Default: 3. */
  columns?: number
  /** Gap between cards (Tailwind gap class suffix). Default: 4. */
  gap?: number
  /** Border radius of each card in px. Default: 16. */
  cardRadius?: number
  /** Icon blur amount in px. Default: 25. */
  iconBlur?: number
  /** Icon saturate multiplier. Default: 5. */
  iconSaturate?: number
  /** Icon brightness multiplier. Default: 1.3. */
  iconBrightness?: number
  /** Icon scale multiplier. Default: 4. */
  iconScale?: number
  /** Icon opacity (0-1). Default: 0.3. */
  iconOpacity?: number
  /** Border width in px. Default: 3. */
  borderWidth?: number
  /** Border blur amount in px. Default: 10. */
  borderBlur?: number
  /** Border saturate multiplier. Default: 4.2. */
  borderSaturate?: number
  /** Border brightness multiplier. Default: 2.5. */
  borderBrightness?: number
  /** Border contrast multiplier. Default: 2.5. */
  borderContrast?: number
  children?: React.ReactNode
}

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL of the icon/avatar image displayed as glow background. */
  icon?: string
  /** Alt text for the icon image. */
  iconAlt?: string
  children?: React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  GlowCardGrid                                                       */
/* ------------------------------------------------------------------ */

function GlowCardGrid({
  columns = 3,
  gap = 4,
  cardRadius = 16,
  iconBlur = 25,
  iconSaturate = 5,
  iconBrightness = 1.3,
  iconScale = 4,
  iconOpacity = 0.3,
  borderWidth = 3,
  borderBlur = 10,
  borderSaturate = 4.2,
  borderBrightness = 2.5,
  borderContrast = 2.5,
  className,
  children,
  ...props
}: GlowCardGridProps) {
  const gridRef = React.useRef<HTMLDivElement>(null)

  const gridColsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : columns === 3
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          : columns === 4
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const grid = gridRef.current
      if (!grid) return
      const rect = grid.getBoundingClientRect()
      // Range: -1 (left/top edge) to +1 (right/bottom edge), 0 = center.
      // Pairs with the translate-x/y-[calc(...*50cqi)] below; -10 stays as
      // the off-screen default so the glow hides until the first mouse-move.
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      grid.style.setProperty("--pointer-x", `${x}`)
      grid.style.setProperty("--pointer-y", `${y}`)
    },
    [],
  )

  const cssVars = {
    "--card-radius": `${cardRadius}px`,
    "--card-icon-blur": `${iconBlur}px`,
    "--card-icon-saturate": `${iconSaturate}`,
    "--card-icon-brightness": `${iconBrightness}`,
    "--card-icon-scale": `${iconScale}`,
    "--card-icon-opacity": `${iconOpacity}`,
    "--card-border-width": `${borderWidth}px`,
    "--card-border-blur": `${borderBlur}px`,
    "--card-border-saturate": `${borderSaturate}`,
    "--card-border-brightness": `${borderBrightness}`,
    "--card-border-contrast": `${borderContrast}`,
  } as React.CSSProperties

  return (
    <div
      ref={gridRef}
      data-slot="glow-card-grid"
      className={cn(`grid w-full gap-${gap}`, gridColsClass, className)}
      style={cssVars}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  GlowCard                                                           */
/* ------------------------------------------------------------------ */

function GlowCard({
  icon,
  iconAlt = "",
  className,
  children,
  ...props
}: GlowCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      // Range: -1 (left/top edge) to +1 (right/bottom edge), 0 = center.
      // Pairs with the translate-x/y-[calc(...*50cqi)] below; -10 stays as
      // the off-screen default so the glow hides until the first mouse-move.
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      card.style.setProperty("--pointer-x", `${x}`)
      card.style.setProperty("--pointer-y", `${y}`)
    },
    [],
  )

  return (
    <div
      ref={cardRef}
      data-slot="glow-card"
      className={cn(
        // @container-size turns the card into a container query scope so
        // cqi/cqh units in the translate resolve against the card's own
        // size (not the viewport). Without it the glow translate lands
        // thousands of px off-screen and the colored border is invisible.
        "@container-size group/glow-card relative h-52 w-full cursor-pointer overflow-hidden rounded-[var(--card-radius)]",
        "ring-1 ring-border transition-[translate,scale]",
        "select-none active:scale-[0.98]",
        className,
      )}
      style={
        {
          "--pointer-x": "-10",
          "--pointer-y": "-10",
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* Clip container */}
      <div className="flex size-full overflow-hidden rounded-[var(--card-radius)] [clip-path:inset(0_round_var(--card-radius))]">
        {/* Glow icon layer — follows pointer */}
        {icon && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              "translate-x-[calc(var(--pointer-x,-10)*50cqi)]",
              "translate-y-[calc(var(--pointer-y,-10)*50cqh)]",
              "translate-z-0",
              "scale-[var(--card-icon-scale)]",
              "blur-[var(--card-icon-blur)]",
              "brightness-[var(--card-icon-brightness)]",
              "saturate-[var(--card-icon-saturate)]",
              "opacity-[var(--card-icon-opacity)]",
              // On hover, intensify the neon so the colored border becomes obvious.
              "group-hover/glow-card:opacity-[calc(var(--card-icon-opacity)*1.8)]",
              "transition-opacity duration-300",
              "will-change-[transform,filter]",
            )}
          >
            <img className="size-20" src={icon} alt={iconAlt} />
          </div>
        )}

        {/* Content layer */}
        <div className="z-1 flex flex-1 flex-col items-center justify-center gap-4">
          {children}
        </div>
      </div>

      {/* Border glow — backdrop-blur + mask-composite trick */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 translate-z-0",
          "rounded-[var(--card-radius)]",
          "border-[length:var(--card-border-width)] border-solid border-transparent",
          "backdrop-blur-[var(--card-border-blur)]",
          "backdrop-brightness-[var(--card-border-brightness)]",
          "backdrop-contrast-[var(--card-border-contrast)]",
          "backdrop-saturate-[var(--card-border-saturate)]",
          "[clip-path:inset(0_round_var(--card-radius))]",
        )}
        style={{
          maskImage:
            "linear-gradient(#fff 0 100%), linear-gradient(#fff 0 100%)",
          maskOrigin: "border-box, padding-box",
          maskClip: "border-box, padding-box",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />
    </div>
  )
}

export { GlowCardGrid, GlowCard }
