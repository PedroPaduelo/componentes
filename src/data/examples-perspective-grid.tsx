import { PerspectiveGrid } from "@/components/ui/perspective-grid"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                          perspective-grid                                  */
/* -------------------------------------------------------------------------- */

const perspectiveGridBasic: Example = {
  title: "Básico",
  description:
    "Grid 3D padrão com 40×40 tiles, overlay radial de fade e hover colorido (vermelho, cyan, verde, amarelo).",
  code: `<div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background">
  <PerspectiveGrid />
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
    <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
      Perspective Grid
    </span>
  </div>
</div>`,
  render: (
    <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background">
      <PerspectiveGrid />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
          Perspective Grid
        </span>
      </div>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI perspective-grid batch.
 * Keyed by component slug; consumed by the showcase.
 */
export const perspectiveGridExamples: Record<string, Example[]> = {
  "perspective-grid": [perspectiveGridBasic],
}
