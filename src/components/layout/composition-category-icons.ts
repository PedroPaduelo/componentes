/**
 * Ícone lucide por categoria de COMPOSIÇÃO para a sidebar de `/compositions`.
 *
 * Em `.ts` puro (sem JSX) de propósito: o lint (`react-refresh/only-export-components`)
 * proíbe um `.tsx` que exporta componentes também exportar consts não-componente.
 * Como `category` é string livre, exponho uma função com fallback em vez de um
 * `Record` fechado — assim uma categoria nova não quebra (recebe ícone genérico).
 */

import {
  AppWindow,
  Layers,
  Megaphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

/** Mapa das categorias conhecidas → ícone lucide. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Marketing: Megaphone,
  Aplicação: AppWindow,
  Showcase: Sparkles,
}

/** Resolve o ícone de uma categoria; usa um genérico para categorias novas. */
export function getCompositionCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Layers
}
