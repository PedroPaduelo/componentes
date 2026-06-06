import * as React from "react"
import { motion, type TargetAndTransition } from "motion/react"

import { cn } from "@/lib/utils"
import type { MaskContainerProps } from "@/components/ui/svg-mask-effect-types"

/**
 * SVG Mask Effect (Aceternity UI).
 *
 * Efeito de revelação por máscara em duas camadas:
 * - Camada de baixo (sem máscara): exibe `revealText`, sempre presente.
 * - Camada de cima (mascarada, `bg-black dark:bg-white`): contém `children` e é
 *   recortada por um `radial-gradient(circle, black, transparent)` cujo centro
 *   segue o cursor (via listener `mousemove` + `getBoundingClientRect`). Onde a
 *   máscara é opaca, a camada de cima cobre o `revealText`; fora dela fica
 *   transparente, deixando o `revealText` visível.
 *
 * Em repouso a máscara tem tamanho `size` (pequena); no hover cresce até
 * `revealSize`, revelando o `children`. Usa `radial-gradient` inline (sem asset
 * externo `/mask.svg`), tornando o componente portátil.
 *
 * Contraste/tema: em repouso o fundo do container segue `var(--background)` e o
 * `revealText` usa `text-foreground`, garantindo legibilidade no light E no dark
 * (antes o fundo era `white` fixo, deixando o `revealText` branco invisível no
 * dark). No hover o container escurece para `slate-900` e a camada mascarada
 * (`bg-black dark:bg-white`) revela o `children`, preservando o efeito.
 */
const asMotion = (
  vars: Record<string, string | number | string[] | number[]>,
): TargetAndTransition => vars as unknown as TargetAndTransition

function MaskContainer({
  children,
  revealText,
  size = 10,
  revealSize = 600,
  className,
}: MaskContainerProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [mousePosition, setMousePosition] = React.useState<{
    x: number | null
    y: number | null
  }>({ x: null, y: null })
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const updateMousePosition = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    node.addEventListener("mousemove", updateMousePosition)
    return () => {
      node.removeEventListener("mousemove", updateMousePosition)
    }
  }, [])

  const maskSize = isHovered ? revealSize : size
  const x = mousePosition.x ?? 0
  const y = mousePosition.y ?? 0

  const maskStyle = {
    maskImage: "radial-gradient(circle, black, transparent)",
    maskRepeat: "no-repeat",
    WebkitMaskImage: "radial-gradient(circle, black, transparent)",
    WebkitMaskRepeat: "no-repeat",
  } as React.CSSProperties

  return (
    <motion.div
      data-slot="svg-mask-effect"
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      animate={{
        backgroundColor: isHovered
          ? "var(--color-slate-900)"
          : "var(--background)",
      }}
      transition={{
        backgroundColor: { duration: 0.3 },
      }}
    >
      <motion.div
        className="absolute flex h-full w-full items-center justify-center bg-black text-6xl text-white dark:bg-white dark:text-black"
        style={maskStyle}
        animate={asMotion({
          maskPosition: `${x - maskSize / 2}px ${y - maskSize / 2}px`,
          maskSize: `${maskSize}px`,
          WebkitMaskPosition: `${x - maskSize / 2}px ${y - maskSize / 2}px`,
          WebkitMaskSize: `${maskSize}px`,
        })}
        transition={{
          maskSize: { duration: 0.3, ease: "easeInOut" },
          maskPosition: { duration: 0.15, ease: "linear" },
        }}
      >
        <div className="absolute inset-0 z-0 h-full w-full bg-black opacity-50 dark:bg-white" />
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative z-20 mx-auto max-w-4xl px-6 text-center text-2xl font-bold sm:text-4xl"
        >
          {children}
        </div>
      </motion.div>

      <div className="flex h-full w-full items-center justify-center px-6 text-center text-xl text-foreground sm:text-2xl">
        {revealText}
      </div>
    </motion.div>
  )
}

export { MaskContainer }
