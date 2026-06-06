import type { HTMLAttributes, ReactNode } from "react"

/**
 * PointerHighlight — tipagem pública.
 *
 * Componente Aceternity UI: envolve `children` com uma borda retangular
 * que se expande em `whileInView` (1s easeInOut) e desenha um Pointer
 * SVG (cursor azul) no canto inferior-direito do retângulo. Cores são
 * fixas (border `neutral-800`/`neutral-200`, pointer `text-blue-500`) —
 * brand do efeito, NÃO segue tokens semânticos do tema shadcn.
 */
export type PointerHighlightProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Conteúdo envolvido pela borda animada (tipicamente um título ou bloco curto). */
  children: ReactNode
  /** Classes extras aplicadas ao retângulo da borda (o `motion.div` interno). */
  rectangleClassName?: string
  /** Classes extras aplicadas ao Pointer SVG (cor, tamanho). */
  pointerClassName?: string
  /** Classes extras aplicadas ao container externo (wrapper `relative w-fit`). */
  containerClassName?: string
}
