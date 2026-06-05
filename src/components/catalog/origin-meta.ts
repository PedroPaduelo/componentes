import type { ComponentOrigin } from "@/data/families"

/**
 * Metadados visuais e textuais por origem de componente.
 *
 * Em arquivo separado do `OriginBadge.tsx` para satisfazer a regra
 * `react-refresh/only-export-components` (um .tsx só pode exportar componentes).
 */

/**
 * Classes de cor por origem (literais completos — Tailwind v4 NÃO detecta
 * classes interpoladas, então cada origem mapeia para strings literais).
 *
 * Cores: shadcn=neutral, Fluid=azul, chanhdai=violeta, @pierre/trees=verde.
 */
export const ORIGIN_CLASSES: Record<ComponentOrigin, string> = {
  shadcn: "border-border bg-muted text-muted-foreground",
  Fluid: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  chanhdai:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "@pierre/trees":
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

/** Curta descrição da origem, usada no header de seção da página de família. */
export const ORIGIN_DESCRIPTIONS: Record<ComponentOrigin, string> = {
  shadcn: "Componente base shadcn/ui (Radix + Tailwind).",
  Fluid: "Variante da biblioteca Fluid Functionalism, com animações fluidas.",
  chanhdai: "Componente da coleção chanhdai.com.",
  "@pierre/trees": "Adaptador da biblioteca @pierre/trees.",
}
