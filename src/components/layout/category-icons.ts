/**
 * Mapa de ÍCONE por categoria para a sidebar de documentação.
 *
 * Separado num arquivo `.ts` (sem JSX/componente) de propósito: o lint do
 * projeto (`react-refresh/only-export-components`) proíbe um `.tsx` que exporta
 * componentes também exportar consts não-componente. Este módulo só exporta um
 * mapa de referências de componentes lucide (não instancia JSX), então pode
 * conviver com os componentes do DocsSidebar sem violar a regra.
 */

import {
  LayoutGrid,
  MessageSquare,
  MousePointerClick,
  TextCursorInput,
  type LucideIcon,
} from "lucide-react"

import type { Category } from "@/data/components"

/** Ícone lucide associado a cada categoria canônica. */
export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Actions: MousePointerClick,
  Layout: LayoutGrid,
  Forms: TextCursorInput,
  Feedback: MessageSquare,
}
