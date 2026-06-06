import * as React from "react"

/**
 * Tipos do Evervault Card (Aceternity UI), reimplementado padronizado shadcn.
 *
 * Mantido em arquivo separado (.ts puro, sem JSX) para satisfazer o
 * react-refresh/only-export-components (o .tsx só exporta componentes).
 */

/**
 * Props do EvervaultCard.
 *
 * `text` é o rótulo exibido dentro do badge central (h-44 w-44 com blur).
 * O componente é projetado para preencher seu container pai — passe
 * `h-[400px]` (ou outra altura) no wrapper do example, caso contrário o
 * `aspect-square` interno colapsa para 0×0.
 */
export type EvervaultCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Texto central exibido dentro do badge circular. */
  text?: string
  /** Classes extras aplicadas no wrapper externo. */
  className?: string
}
