import * as React from "react"

import { cn } from "@/lib/utils"
import type {
  GridAndDotBackgroundsProps,
  GridDotVariant,
} from "@/components/ui/grid-and-dot-backgrounds-types"

/**
 * Grid and Dot Backgrounds (Aceternity UI).
 *
 * Fundo decorativo em CSS puro: malha de linhas (grid / grid-small) ou de
 * pontos (dot), desenhado via `background-image` com `linear-gradient` /
 * `radial-gradient`. Uma máscara radial faz o padrão desvanecer em direção
 * às bordas (efeito "faded"), deixando o centro nítido para o conteúdo.
 *
 * É um wrapper `relative` com altura própria; o conteúdo (`children`) é
 * sobreposto numa camada `z-20` centralizada. As cores derivam dos tokens
 * shadcn (`--border` / `--muted-foreground`), então o padrão adapta a
 * light/dark automaticamente — ou podem ser sobrescritas via `lineColor`.
 */

type CSSVarStyle = React.CSSProperties & Record<`--${string}`, string>

const SIZE_BY_VARIANT: Record<GridDotVariant, number> = {
  grid: 40,
  "grid-small": 20,
  dot: 20,
}

function buildBackgroundImage(variant: GridDotVariant, color: string): string {
  if (variant === "dot") {
    return `radial-gradient(${color} 1px, transparent 1px)`
  }
  return [
    `linear-gradient(to right, ${color} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
  ].join(", ")
}

function GridAndDotBackgrounds({
  variant = "grid",
  size,
  lineColor = "var(--pattern-fg)",
  faded = true,
  className,
  containerClassName,
  children,
  style,
  ...props
}: GridAndDotBackgroundsProps) {
  const cellSize = size ?? SIZE_BY_VARIANT[variant]

  const patternStyle: CSSVarStyle = {
    "--pattern-fg": "color-mix(in oklab, var(--foreground) 18%, transparent)",
    backgroundImage: buildBackgroundImage(variant, lineColor),
    backgroundSize: `${cellSize}px ${cellSize}px`,
  }

  if (faded) {
    const mask = "radial-gradient(ellipse at center, transparent 10%, black)"
    patternStyle.maskImage = mask
    patternStyle.WebkitMaskImage = mask
  }

  return (
    <div
      data-slot="grid-and-dot-backgrounds"
      data-variant={variant}
      className={cn(
        "relative flex min-h-[24rem] w-full items-center justify-center overflow-hidden rounded-lg bg-background",
        containerClassName,
        className,
      )}
      style={style}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={patternStyle}
      />
      {children ? (
        <div className="relative z-20 flex flex-col items-center justify-center px-4 text-center">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export { GridAndDotBackgrounds }
