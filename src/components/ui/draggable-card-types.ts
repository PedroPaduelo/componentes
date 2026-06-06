import * as React from "react"

/**
 * Tipos do Draggable Card (Aceternity UI), reimplementado padronizado shadcn.
 *
 * Mantido em arquivo separado (.ts puro, sem JSX) para satisfazer o
 * react-refresh/only-export-components — o .tsx exporta apenas componentes.
 *
 * NOTA: omitimos os handlers de drag/animation do React.HTMLAttributes porque
 * conflitam com os do `motion.div` (motion usa callbacks com PanInfo em vez de
 * DragEventHandler). Quem precisar passar essas props via spread, usar as
 * variantes de `motion/react` diretamente.
 */

type DraggableCardBaseProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "children"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
>

export interface DraggableCardContainerProps extends DraggableCardBaseProps {
  /** Classes utilitárias aplicadas ao wrapper de perspectiva. */
  className?: string
  /** DraggableCardBody(s) que serão renderizados dentro do container. */
  children?: React.ReactNode
}

export interface DraggableCardBodyProps extends DraggableCardBaseProps {
  /** Classes utilitárias aplicadas ao motion.div do card. */
  className?: string
  /** Conteúdo do card (texto, ícones, etc.). */
  children?: React.ReactNode
}
