import * as React from "react"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"

/**
 * PerspectiveGrid
 *
 * Grade 3D em perspectiva com `gridSize × gridSize` tiles. Cada tile ganha
 * uma cor de hover distribuída por padrão aritmético (vermelho / ciano /
 * verde / amarelo) — efeito visual de "profundidade" para hero / backgrounds.
 *
 * Customização: a área de fade radial (controlada por `fadeRadius`) cria a
 * sensação de profundidade; desabilite com `showOverlay={false}` para um
 * grid chapado.
 *
 * Implementação: 100% React + CSS (CSS variables e transforms 3D). As cores
 * de hover vivem em `src/index.css` (regras `.tile:nth-child(...)`) porque
 * o seletor de aritmética mod não é expressável em className arbitrário do
 * Tailwind v4 sem interpolação de string (gotcha documentado).
 *
 * Cores brand FIXAS (vermelho / ciano / verde / amarelo) seguem a decisão
 * do Lote VengenceUI: o efeito é a identidade visual, não usa tokens do
 * tema.
 */
export type PerspectiveGridProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Lado da grade em número de tiles. Default: 40 (40×40 = 1600 tiles). */
  gridSize?: number
  /** Se true (default), aplica overlay radial de fade sobre o grid. */
  showOverlay?: boolean
  /**
   * Raio (em %) do fade radial overlay — controla a "suavidade" das bordas.
   * Default: 80. Valores menores = fade mais agressivo (grid some perto da
   * borda); valores maiores = grid aparece mais.
   */
  fadeRadius?: number
}

function PerspectiveGrid({
  className,
  gridSize = 40,
  showOverlay = true,
  fadeRadius = 80,
  ...hostProps
}: PerspectiveGridProps) {
  const { resolvedTheme } = useTheme()

  // Garante render só no client (evita hydration mismatch com o cálculo dos
  // tiles). A render no SSR é mínima — só o container com perspective.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Array imutável de N tiles — useMemo recria só quando gridSize muda.
  const tiles = React.useMemo(
    () => Array.from({ length: gridSize * gridSize }),
    [gridSize],
  )

  return (
    <div
      data-slot="perspective-grid"
      data-theme={resolvedTheme}
      className={cn(
        "relative w-full h-full overflow-hidden bg-white dark:bg-black",
        "[--fade-stop:#ffffff] dark:[--fade-stop:#000000]",
        className,
      )}
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
      {...hostProps}
    >
      <div
        className="absolute w-[80rem] aspect-square grid origin-center"
        style={{
          left: "50%",
          top: "50%",
          transform:
            "translate(-50%, -50%) rotateX(30deg) rotateY(-5deg) rotateZ(20deg) scale(2)",
          transformStyle: "preserve-3d",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {mounted &&
          tiles.map((_, i) => (
            <div
              key={i}
              className="tile min-h-[1px] min-w-[1px] border border-gray-300 dark:border-gray-700 bg-transparent transition-colors duration-[1500ms] hover:duration-0"
            />
          ))}
      </div>
      {showOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle, transparent 25%, var(--fade-stop) ${fadeRadius}%)`,
          }}
        />
      )}
    </div>
  )
}

export { PerspectiveGrid }
