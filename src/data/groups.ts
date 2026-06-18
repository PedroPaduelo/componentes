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
 * - NÃO altera `families.ts` (derivação de família/origem continua intacta) nem
 *   `CATEGORIES` (as 4 categorias canônicas seguem como estão). Os helpers de
 *   grupo (O2.3) apenas CONSOMEM `groupByFamily`/`components` (read-only) para
 *   derivar contagens e famílias por grupo — sem duplicar nem modificar dado.
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

import { components } from "@/data/components"
import { groupByFamily, type Family } from "@/data/families"

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
/* Mapa slug → grupo (O2.2 — clusterização)                                    */
/* -------------------------------------------------------------------------- */

/**
 * Grupo de fallback para slugs SEM entrada explícita em `SLUG_GROUP_MAP`.
 *
 * Hoje o mapa cobre os 214 slugs de `components.ts`, então o fallback só atua
 * para itens NOVOS ainda não classificados. Aponta para `feedback-status`
 * (a antiga categoria \"lixão\" Feedback) por ser o destino historicamente
 * neutro até a curadoria mover o item para o grupo certo.
 */
export const DEFAULT_GROUP: GroupId = "feedback-status"

/**
 * Mapa de derivação `slug do componente → grupo`.
 *
 * COBERTURA: mapeia TODOS os 214 slugs de `components.ts`, cada um para 1 dos
 * 9 `GroupId`. A vinculação fica AQUI (e não em `ComponentMeta`) para manter a
 * camada de grupos aditiva e desacoplada do registry e dos parsers `_meta`.
 * Slugs futuros sem entrada caem em `DEFAULT_GROUP`.
 *
 * Curadoria por DOMÍNIO (não pela `category` canônica): a dor #1 era a dispersão
 * de \"inputs\" em 5 páginas, \"botões\" em 7 e o \"lixão\" Feedback (efeitos de
 * texto, backgrounds, chat/IA, dashboards e globos misturados). Aqui cada slug
 * vai para o grupo do seu domínio real. Organizado por grupo, alfabético dentro
 * de cada bloco.
 */
export const SLUG_GROUP_MAP: Record<string, GroupId> = {
  // — Forms & Inputs: campos, seleção e captura de dados —
  calendar: "forms-inputs",
  checkbox: "forms-inputs",
  "checkbox-group-fluid": "forms-inputs",
  "color-picker-fluid": "forms-inputs",
  "consent-manager": "forms-inputs",
  "date-picker": "forms-inputs",
  "elastic-slider": "forms-inputs",
  "file-thumbnail-fluid": "forms-inputs",
  "file-upload": "forms-inputs",
  form: "forms-inputs",
  "gooey-input": "forms-inputs",
  input: "forms-inputs",
  "input-copy-fluid": "forms-inputs",
  "input-group-fluid": "forms-inputs",
  "input-otp": "forms-inputs",
  keyboard: "forms-inputs",
  "middle-truncation": "forms-inputs",
  "placeholders-and-vanish-input": "forms-inputs",
  "radio-group": "forms-inputs",
  "radio-group-fluid": "forms-inputs",
  "react-wheel-picker": "forms-inputs",
  select: "forms-inputs",
  "select-fluid": "forms-inputs",
  "slide-to-unlock": "forms-inputs",
  slider: "forms-inputs",
  "slider-fluid": "forms-inputs",
  switch: "forms-inputs",
  "switch-fluid": "forms-inputs",
  textarea: "forms-inputs",

  // — Actions & Navegação: gatilhos de ação, menus, abas, navbars —
  "animated-button": "actions-navigation",
  breadcrumb: "actions-navigation",
  button: "actions-navigation",
  "button-fluid": "actions-navigation",
  "chevrons-up-down-icon": "actions-navigation",
  command: "actions-navigation",
  "context-menu": "actions-navigation",
  "copy-button": "actions-navigation",
  "creepy-button": "actions-navigation",
  "dropdown-fluid": "actions-navigation",
  "dropdown-menu": "actions-navigation",
  "floating-dock": "actions-navigation",
  "floating-navbar": "actions-navigation",
  "glass-dock": "actions-navigation",
  "hover-border-gradient": "actions-navigation",
  "icon-swap": "actions-navigation",
  "magnetic-button": "actions-navigation",
  menubar: "actions-navigation",
  "moving-border": "actions-navigation",
  "navbar-menu": "actions-navigation",
  "navigation-menu": "actions-navigation",
  notch: "actions-navigation",
  pagination: "actions-navigation",
  popover: "actions-navigation",
  "resizable-navbar": "actions-navigation",
  sidebar: "actions-navigation",
  "stateful-button": "actions-navigation",
  tabs: "actions-navigation",
  "tabs-fluid": "actions-navigation",
  "tabs-subtle-fluid": "actions-navigation",
  "theme-switcher": "actions-navigation",
  "theme-toggle-effect": "actions-navigation",
  "toc-minimap": "actions-navigation",
  toggle: "actions-navigation",

  // — Layout & Containers: cards, grids, carrosséis, modais, drawers —
  "3d-card-effect": "layout-containers",
  "3d-pin": "layout-containers",
  accordion: "layout-containers",
  "accordion-fluid": "layout-containers",
  "alert-dialog": "layout-containers",
  "animated-modal": "layout-containers",
  "animated-testimonials": "layout-containers",
  "apple-cards-carousel": "layout-containers",
  "aspect-ratio": "layout-containers",
  "bento-grid": "layout-containers",
  card: "layout-containers",
  "card-hover-effect": "layout-containers",
  "card-spotlight": "layout-containers",
  "card-stack": "layout-containers",
  carousel: "layout-containers",
  collapsible: "layout-containers",
  "comet-card": "layout-containers",
  compare: "layout-containers",
  dialog: "layout-containers",
  "dialog-fluid": "layout-containers",
  "direction-aware-hover": "layout-containers",
  "draggable-card": "layout-containers",
  drawer: "layout-containers",
  "evervault-card": "layout-containers",
  "expandable-cards": "layout-containers",
  "features-section-with-skeletons": "layout-containers",
  "focus-cards": "layout-containers",
  "glare-card": "layout-containers",
  "glow-card-grid": "layout-containers",
  "glowing-stars-effect": "layout-containers",
  "images-slider": "layout-containers",
  "infinite-moving-cards": "layout-containers",
  "layout-grid": "layout-containers",
  "logo-slider": "layout-containers",
  resizable: "layout-containers",
  "scroll-area": "layout-containers",
  "scroll-fade-effect": "layout-containers",
  separator: "layout-containers",
  sheet: "layout-containers",
  "sticky-scroll-reveal": "layout-containers",
  "team-section-with-scales": "layout-containers",
  tree: "layout-containers",
  "wobble-card": "layout-containers",
  "work-experience-component": "layout-containers",

  // — Feedback & Status: badges, alertas, toasts, progress, tooltips —
  alert: "feedback-status",
  "animated-number": "feedback-status",
  "animated-tooltip": "feedback-status",
  avatar: "feedback-status",
  badge: "feedback-status",
  "badge-fluid": "feedback-status",
  "hover-card": "feedback-status",
  "images-badge": "feedback-status",
  "link-preview": "feedback-status",
  loader: "feedback-status",
  "mobius-loop-icon": "feedback-status",
  "multi-step-loader": "feedback-status",
  progress: "feedback-status",
  skeleton: "feedback-status",
  sonner: "feedback-status",
  "sticky-banner": "feedback-status",
  toast: "feedback-status",
  "tooltip-card": "feedback-status",
  "tooltip-fluid": "feedback-status",

  // — Chat & IA: mensagens, raciocínio, prompts, perguntas ao usuário —
  "ask-user-questions-fluid": "chat-ai",
  "chat-message-fluid": "chat-ai",
  "input-message-fluid": "chat-ai",
  "thinking-indicator-fluid": "chat-ai",
  "thinking-steps-fluid": "chat-ai",

  // — Dashboards & Dev: tabelas, overview, timelines, feeds, terminais —
  "code-block": "dashboards-dev",
  "code-block-command": "dashboards-dev",
  "container-resource-panel": "dashboards-dev",
  "data-table": "dashboards-dev",
  "db-overview-grid": "dashboards-dev",
  "db-schema-explorer": "dashboards-dev",
  "error-tracker-feed": "dashboards-dev",
  "fleet-server-grid": "dashboards-dev",
  "github-contributions": "dashboards-dev",
  "incident-timeline": "dashboards-dev",
  "react-flow": "dashboards-dev",
  "request-flow-inspector": "dashboards-dev",
  "server-overview-card": "dashboards-dev",
  "slow-query-list": "dashboards-dev",
  table: "dashboards-dev",
  "table-fluid": "dashboards-dev",
  terminal: "dashboards-dev",
  timeline: "dashboards-dev",
  "user-activity-stream": "dashboards-dev",

  // — Efeitos de Texto: flip, typewriter, gradiente, brilho, reveal —
  "canvas-text": "text-effects",
  "colourful-text": "text-effects",
  "container-cover": "text-effects",
  "container-text-flip": "text-effects",
  "cyber-glitch-text": "text-effects",
  "encrypted-text": "text-effects",
  "flip-fade-text": "text-effects",
  "flip-text": "text-effects",
  "flip-words": "text-effects",
  "fluid-gradient-text": "text-effects",
  "layout-text-flip": "text-effects",
  "shimmering-text": "text-effects",
  "squiggly-text": "text-effects",
  "text-flipping-board": "text-effects",
  "text-generate-effect": "text-effects",
  "text-hover-effect": "text-effects",
  "text-reveal-card": "text-effects",
  "typewriter-effect": "text-effects",

  // — Backgrounds & FX: beams, auroras, partículas, spotlights, shaders —
  "3d-marquee": "backgrounds-fx",
  "ascii-art": "backgrounds-fx",
  "aurora-background": "backgrounds-fx",
  "background-beams": "backgrounds-fx",
  "background-beams-with-collision": "backgrounds-fx",
  "background-boxes": "backgrounds-fx",
  "background-gradient": "backgrounds-fx",
  "background-gradient-animation": "backgrounds-fx",
  "background-lines": "backgrounds-fx",
  "background-ripple-effect": "backgrounds-fx",
  "canvas-reveal-effect": "backgrounds-fx",
  "container-scroll-animation": "backgrounds-fx",
  "dither-shader": "backgrounds-fx",
  "dot-grid-spotlight": "backgrounds-fx",
  "dotted-glow-background": "backgrounds-fx",
  "following-pointer": "backgrounds-fx",
  "glowing-effect": "backgrounds-fx",
  "google-gemini-effect": "backgrounds-fx",
  "grid-and-dot-backgrounds": "backgrounds-fx",
  "hero-highlight": "backgrounds-fx",
  "hero-parallax": "backgrounds-fx",
  "hero-section-with-mousemove": "backgrounds-fx",
  "lamp-effect": "backgrounds-fx",
  lens: "backgrounds-fx",
  "light-lines": "backgrounds-fx",
  "macbook-scroll": "backgrounds-fx",
  meteors: "backgrounds-fx",
  "noise-background": "backgrounds-fx",
  "parallax-hero-images": "backgrounds-fx",
  "parallax-hero-images-2": "backgrounds-fx",
  "parallax-scroll": "backgrounds-fx",
  "perspective-grid": "backgrounds-fx",
  "pixelated-canvas": "backgrounds-fx",
  scales: "backgrounds-fx",
  "shooting-stars-and-stars-background": "backgrounds-fx",
  sparkles: "backgrounds-fx",
  spotlight: "backgrounds-fx",
  "spotlight-new": "backgrounds-fx",
  "svg-mask-effect": "backgrounds-fx",
  "tracing-beam": "backgrounds-fx",
  vortex: "backgrounds-fx",
  "wavy-background": "backgrounds-fx",
  "webcam-pixel-grid": "backgrounds-fx",

  // — Globos & Mapas: globos interativos (cobe/three) e mapas-múndi —
  "3d-globe": "globes-maps",
  "github-globe": "globes-maps",
  "world-map": "globes-maps",
}

/* -------------------------------------------------------------------------- */
/* Helpers de derivação de grupo (O2.3)                                        */
/* -------------------------------------------------------------------------- */

/**
 * Resolve o GRUPO de um slug.
 *
 * Consulta {@link SLUG_GROUP_MAP} (O(1)) e cai em {@link DEFAULT_GROUP} para
 * slugs ainda não classificados (itens novos do registry). É a porta de entrada
 * única para qualquer UI/consumidor que precise saber a que grupo um componente
 * pertence — ninguém deve ler `SLUG_GROUP_MAP` direto.
 */
export function getGroup(slug: string): GroupId {
  return SLUG_GROUP_MAP[slug] ?? DEFAULT_GROUP
}

/** Um {@link Group} anotado com as contagens derivadas do registry. */
export interface GroupWithCount extends Group {
  /** Nº de componentes (slugs do registry) pertencentes ao grupo. */
  componentCount: number
  /** Nº de famílias (variantes agrupadas via `groupByFamily`) no grupo. */
  familyCount: number
}

/**
 * Lista os 9 grupos JÁ ORDENADOS por `order` (primitivos → aplicações → visual),
 * cada um anotado com a contagem de componentes e de famílias do registry.
 *
 * Usado pela navegação/sidebar para renderizar as seções com seus totais sem
 * reimplementar a contagem. Deriva tudo de `components` + {@link getGroup}.
 */
export function listGroups(): GroupWithCount[] {
  return [...GROUPS]
    .sort((a, b) => a.order - b.order)
    .map((group) => {
      const items = components.filter((c) => getGroup(c.slug) === group.id)
      return {
        ...group,
        componentCount: items.length,
        familyCount: groupByFamily(items).length,
      }
    })
}

/**
 * Retorna os componentes de um grupo já agrupados em FAMÍLIAS.
 *
 * Filtra o registry por {@link getGroup} `=== groupId` e delega a clusterização
 * por família ao `groupByFamily` de `families.ts` (read-only) — então as
 * famílias saem ordenadas alfabeticamente por base, consistentes com o resto da
 * vitrine. Grupo sem itens → array vazio.
 */
export function getGroupItems(groupId: GroupId): Family[] {
  const items = components.filter((c) => getGroup(c.slug) === groupId)
  return groupByFamily(items)
}
