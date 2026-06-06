import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import type { PointerHighlightProps } from "./pointer-highlight-types"

/**
 * PointerHighlight — Aceternity UI.
 *
 * Envolve `children` com um retângulo animado cuja borda se expande
 * (`width/height: 0 → dimensions`) e cujo cursor SVG aparece no canto
 * inferior-direito (`x/y: dimensions + 4`). As dimensões são medidas com
 * `ResizeObserver` para que o efeito acompanhe mudanças de tamanho do
 * `children`. Cores são fixas (brand do efeito):
 *   - Borda: `border-neutral-800` no light, `border-neutral-200` no dark
 *   - Pointer: `text-blue-500`
 *
 * Inspirado no `pointer-highlight` original da Aceternity UI. O briefing
 * inicial do pai descreveu como "spotlight que segue o cursor" — isso é
 * descrição genérica; o SOURCE oficial é borda retangular + pointer fixo.
 */
function PointerHighlight({
  children,
  rectangleClassName,
  pointerClassName,
  containerClassName,
  ...hostProps
}: PointerHighlightProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const { width, height } = el.getBoundingClientRect()
    setDimensions({ width, height })

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        setDimensions({ width: w, height: h })
      }
    })
    resizeObserver.observe(el)

    return () => {
      resizeObserver.unobserve(el)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      data-slot="pointer-highlight"
      className={cn("relative w-fit", containerClassName)}
      {...hostProps}
    >
      {children}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 0.95, originX: 0, originY: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className={cn(
              "absolute inset-0 border border-neutral-800 dark:border-neutral-200",
              rectangleClassName
            )}
            initial={{ width: 0, height: 0 }}
            whileInView={{ width: dimensions.width, height: dimensions.height }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute"
            initial={{ opacity: 0 }}
            whileInView={{
              opacity: 1,
              x: dimensions.width + 4,
              y: dimensions.height + 4,
            }}
            style={{ rotate: -90 }}
            transition={{
              opacity: { duration: 0.1, ease: "easeInOut" },
              duration: 1,
              ease: "easeInOut",
            }}
          >
            <Pointer
              className={cn("h-5 w-5 text-blue-500", pointerClassName)}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

/** Cursor SVG inline (não exportado; só uso interno). */
function Pointer(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
    </svg>
  )
}

export { PointerHighlight }
