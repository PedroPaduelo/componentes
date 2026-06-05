import * as React from "react"

import { cn } from "@/lib/utils"

import type {
  BackgroundRippleEffectProps,
  CellStyle,
  DivGridProps,
  RippleCell,
} from "@/components/ui/background-ripple-effect-types"

/**
 * Background Ripple Effect (Aceternity UI).
 *
 * Grade de células quadradas. Ao clicar numa célula, um ripple (onda de
 * opacidade) se propaga pelas vizinhas com delay proporcional à distância.
 * API padronizada shadcn: named export, `data-slot`, `cn()`, cores via tokens
 * (`var(--border)`) que reagem ao tema light/dark.
 */
function BackgroundRippleEffect({
  rows = 8,
  cols = 27,
  cellSize = 56,
  className,
}: BackgroundRippleEffectProps) {
  const [clickedCell, setClickedCell] = React.useState<RippleCell | null>(null)
  const [rippleKey, setRippleKey] = React.useState(0)

  return (
    <div
      data-slot="background-ripple-effect"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      <div className="relative h-auto w-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className="opacity-60"
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--border)"
          fillColor="transparent"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col })
            setRippleKey((k) => k + 1)
          }}
          interactive
        />
      </div>
    </div>
  )
}

function DivGrid({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = "var(--border)",
  fillColor = "transparent",
  clickedCell = null,
  onCellClick,
  interactive = true,
}: DivGridProps) {
  const cells = React.useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols]
  )

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  }

  return (
    <div className={cn("relative z-[3]", className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols)
        const colIdx = idx % cols
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0
        const delay = clickedCell ? Math.max(0, distance * 55) : 0
        const duration = 200 + distance * 80

        const rippleVars: CellStyle = clickedCell
          ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
            }
          : {}

        const cellStyle: CellStyle = {
          backgroundColor: fillColor,
          borderColor,
          ...rippleVars,
        }

        return (
          <div
            key={idx}
            className={cn(
              "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80",
              clickedCell && "animate-cell-ripple [animation-fill-mode:none]",
              !interactive && "pointer-events-none"
            )}
            style={cellStyle}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        )
      })}
    </div>
  )
}

export { BackgroundRippleEffect, DivGrid }
