/**
 * Mapas de ÍCONE/RÓTULO da navegação de docs por DOMÍNIO e por GRUPO.
 *
 * Separado num arquivo `.ts` (sem JSX/componente) de propósito: o lint do
 * projeto (`react-refresh/only-export-components`) proíbe um `.tsx` que exporta
 * componentes também exportar consts não-componente. Este módulo só exporta
 * mapas de referências de componentes lucide (não instancia JSX) + rótulos de
 * texto, então pode conviver com os componentes do DocsSidebar sem violar a
 * regra.
 *
 * ONDA 2 (clusterização): a sidebar passou a listar os 9 GRUPOS organizados
 * sob os 3 DOMÍNIOS macro (em vez das ~198 famílias). Os ícones de grupo aqui
 * ESPELHAM os de `groups.ts` (cujo campo `icon` é opcional) para garantir um
 * ícone não-nulo por grupo na navegação, sem acoplar a sidebar a esse opcional.
 */

import {
  AppWindow,
  BarChart3,
  Bot,
  Globe,
  LayoutGrid,
  LineChart,
  MessageSquare,
  MousePointerClick,
  Palette,
  Shapes,
  Sparkles,
  Table,
  TextCursorInput,
  Type,
  Wand2,
  type LucideIcon,
} from "lucide-react"

import type { DomainId, GroupId } from "@/data/groups"

/** Rótulo de exibição de cada domínio macro (cabeçalho colapsável da sidebar). */
export const DOMAIN_LABELS: Record<DomainId, string> = {
  primitivos: "Primitivos de UI",
  aplicacoes: "Aplicações & Dados",
  visual: "Visual & Efeitos",
}

/** Ícone lucide do cabeçalho de cada domínio macro. */
export const DOMAIN_ICONS: Record<DomainId, LucideIcon> = {
  primitivos: Shapes,
  aplicacoes: AppWindow,
  visual: Palette,
}

/** Ícone lucide associado a cada um dos 12 grupos (espelha `GROUPS` de groups.ts). */
export const GROUP_ICONS: Record<GroupId, LucideIcon> = {
  "forms-inputs": TextCursorInput,
  "actions-navigation": MousePointerClick,
  "layout-containers": LayoutGrid,
  "tables-data": Table,
  "feedback-status": MessageSquare,
  "chat-ai": Bot,
  "dashboards-charts": LineChart,
  "dashboards-data": BarChart3,
  "text-effects": Type,
  "card-effects": Wand2,
  "backgrounds-fx": Sparkles,
  "globes-maps": Globe,
}
