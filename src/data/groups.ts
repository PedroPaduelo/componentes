/**
 * Camada de dados de GRUPOS (clusterização) — dados puros, sem UI.
 *
 * Objetivo (UX Vitrine v2 / ONDA 2): hoje o catálogo é ~1 página por slug
 * (214 componentes → ~198 famílias), o que fragmenta a navegação ("inputs" em
 * 5 páginas, "botões" em 7, ~25 backgrounds/FX, etc.). Este módulo introduz uma
 * unidade conceitual de PÁGINA — o "grupo" — que clusteriza componentes afins
 * por domínio (ex.: todos os inputs numa única seção "Forms & Inputs").
 *
 * --- ADITIVO E DESACOPLADO (decisão de design) ---
 * - NÃO importa nem altera `families.ts` (derivação de família/origem continua
 *   intacta) nem `CATEGORIES` (as 4 categorias canônicas seguem como estão).
 * - NÃO adiciona nenhum campo em `ComponentMeta` → os parsers regex dos scripts
 *   de `_meta` (build-ai-assets / build-registry) NÃO são afetados.
 * - O vínculo slug → grupo vive em `SLUG_GROUP_MAP` (mapa de derivação externo),
 *   mantendo o registry (`components.ts`) como única fonte da verdade dos itens.
 *
 * A taxonomia abaixo (9 grupos, agrupados em 3 domínios macro) vem do mapa de
 * arquitetura do explorer. Cada grupo é a futura unidade de página/seção.
 */

import {
  Bot,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  MousePointerClick,
  Sparkles,
  TextCursorInput,
  Type,
  type LucideIcon,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/* Domínios macro (ordenam os grupos)                                          */
/* -------------------------------------------------------------------------- */

/**
 * Domínios macro: agrupam os grupos em três blocos de navegação. Servem para
 * ORDENAR os grupos (primitivos → aplicações → visual) e podem ancorar seções
 * de nível superior na sidebar/command palette.
 */
export const DOMAIN_IDS = ["primitivos", "aplicacoes", "visual"] as const

/** União dos ids de domínio (literal `as const`). */
export type DomainId = (typeof DOMAIN_IDS)[number]

/* -------------------------------------------------------------------------- */
/* Grupos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Ids canônicos dos 9 grupos da vitrine (união literal `as const`).
 *
 * São URL-safe (kebab-case) porque viram o contrato da futura rota de grupo
 * (ex.: `/components/grupo/forms-inputs`). Estáveis — não renomear sem migração.
 */
export const GROUP_IDS = [
  "forms-inputs",
  "actions-navigation",
  "layout-containers",
  "feedback-status",
  "chat-ai",
  "dashboards-dev",
  "text-effects",
  "backgrounds-fx",
  "globes-maps",
] as const

/** União dos ids de grupo (literal `as const`). */
export type GroupId = (typeof GROUP_IDS)[number]

/** Definição de um grupo (cluster de componentes afins). */
export interface Group {
  /** Identificador estável e URL-safe. Contrato com a futura rota de grupo. */
  id: GroupId
  /** Nome de exibição. */
  label: string
  /** Domínio macro ao qual o grupo pertence (define o bloco de ordenação). */
  domain: DomainId
  /** Descrição curta exibida no topo da página/seção do grupo. */
  description: string
  /** Ordem global (1..9) — já arranjada por domínio (contígua por bloco). */
  order: number
  /** Ícone lucide associado ao grupo (opcional). */
  icon?: LucideIcon
}

/**
 * Os 9 grupos da taxonomia do explorer, JÁ ORDENADOS por domínio:
 * primitivos (1–4) → aplicações (5–6) → visual (7–9).
 */
export const GROUPS: Group[] = [
  // — Domínio: primitivos de UI —
  {
    id: "forms-inputs",
    label: "Forms & Inputs",
    domain: "primitivos",
    description:
      "Campos, seleção e captura de dados: inputs, textarea, OTP, selects, sliders, switches, checkboxes e formulários.",
    order: 1,
    icon: TextCursorInput,
  },
  {
    id: "actions-navigation",
    label: "Actions & Navegação",
    domain: "primitivos",
    description:
      "Botões e gatilhos de ação, além de menus, abas, breadcrumbs, paginação e barras de navegação.",
    order: 2,
    icon: MousePointerClick,
  },
  {
    id: "layout-containers",
    label: "Layout & Containers",
    domain: "primitivos",
    description:
      "Estrutura visual: cards, grids, carrosséis, modais, drawers, painéis redimensionáveis e separadores.",
    order: 3,
    icon: LayoutGrid,
  },
  {
    id: "feedback-status",
    label: "Feedback & Status",
    domain: "primitivos",
    description:
      "Comunicação de estado: badges, alertas, toasts, progress, skeletons, tooltips e indicadores de carregamento.",
    order: 4,
    icon: MessageSquare,
  },

  // — Domínio: aplicações & dados —
  {
    id: "chat-ai",
    label: "Chat & IA",
    domain: "aplicacoes",
    description:
      "Blocos de conversa e IA: mensagens, indicadores de raciocínio, prompts e fluxos de pergunta ao usuário.",
    order: 5,
    icon: Bot,
  },
  {
    id: "dashboards-dev",
    label: "Dashboards & Dev",
    domain: "aplicacoes",
    description:
      "Superfícies de dados e dev tools: tabelas, grids de overview, timelines, feeds, terminais e blocos de código.",
    order: 6,
    icon: LayoutDashboard,
  },

  // — Domínio: visual & efeitos —
  {
    id: "text-effects",
    label: "Efeitos de Texto",
    domain: "visual",
    description:
      "Tipografia animada: flip, typewriter, geração progressiva, gradientes, brilho e revelações de texto.",
    order: 7,
    icon: Type,
  },
  {
    id: "backgrounds-fx",
    label: "Backgrounds & FX",
    domain: "visual",
    description:
      "Fundos e efeitos imersivos: beams, auroras, grids, partículas, spotlights, meteoros e shaders.",
    order: 8,
    icon: Sparkles,
  },
  {
    id: "globes-maps",
    label: "Globos & Mapas",
    domain: "visual",
    description:
      "Visualizações geográficas e 3D: globos interativos (cobe/three) e mapas-múndi.",
    order: 9,
    icon: Globe,
  },
]

/** Índice por id para lookup O(1) (ex.: resolver o grupo da rota atual). */
export const GROUP_BY_ID: Record<GroupId, Group> = GROUPS.reduce(
  (acc, group) => {
    acc[group.id] = group
    return acc
  },
  {} as Record<GroupId, Group>,
)

/* -------------------------------------------------------------------------- */
/* Mapa slug → grupo (preenchido em O2.2)                                      */
/* -------------------------------------------------------------------------- */

/**
 * Mapa de derivação `slug do componente → grupo`.
 *
 * COBERTURA (a completar em O2.2): deve mapear TODOS os ~214 slugs de
 * `components.ts`. A vinculação fica AQUI (e não em `ComponentMeta`) para
 * manter a camada de grupos aditiva e desacoplada do registry e dos parsers
 * `_meta`. Slugs sem entrada serão tratados por um fallback na camada de O2.2
 * (ex.: deduzir o grupo a partir da `category`/tags ou cair num grupo padrão).
 *
 * Intencionalmente VAZIO nesta task (O2.1 entrega só tipos + taxonomia + ordem).
 */
export const SLUG_GROUP_MAP: Record<string, GroupId> = {}
