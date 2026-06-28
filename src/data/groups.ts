/**
 * Camada de dados de GRUPOS (clusterização) — dados puros, sem UI.
 *
 * Objetivo (UX Vitrine): o catálogo tem centenas de slugs, o que fragmenta a
 * navegação. Este módulo introduz a unidade conceitual de PÁGINA — o "grupo" —
 * que clusteriza componentes afins por INTENÇÃO de uso, para humano e para IA
 * (vibe-coding) acharem o componente certo rápido.
 *
 * --- ADITIVO E DESACOPLADO (decisão de design) ---
 * - NÃO altera `families.ts` (derivação de família/origem continua intacta) nem
 *   `CATEGORIES` (as 4 categorias canônicas seguem como metadado/badge). Os
 *   helpers de grupo apenas CONSOMEM `groupByFamily`/`components` (read-only).
 * - NÃO adiciona nenhum campo em `ComponentMeta` → os parsers regex dos scripts
 *   de `_meta` (build-ai-assets / build-registry) NÃO são afetados.
 * - O vínculo slug → grupo vive em `SLUG_GROUP_MAP` (mapa de derivação externo),
 *   mantendo o registry (`components.ts`) como única fonte da verdade dos itens.
 *
 * A taxonomia (16 grupos, agrupados em 3 domínios macro) separa primitivos de
 * UI, blocos de aplicação/dados e efeitos visuais. Cada grupo é a unidade de
 * página/seção da navegação. A cobertura (todo slug tem grupo explícito) é
 * garantida no CI por `_meta/scripts/lote/validate-groups.mjs`.
 */

import {
  BarChart3,
  Bot,
  IdCard,
  LayoutGrid,
  LineChart,
  ListTree,
  MessageSquare,
  MousePointerClick,
  Pilcrow,
  Pointer,
  Presentation,
  SquareStack,
  Terminal,
  TextCursorInput,
  Wallpaper,
  Wand2,
  type LucideIcon,
} from "lucide-react"

import { components } from "@/data/components"
import { groupByFamily, type Family } from "@/data/families"

/* -------------------------------------------------------------------------- */
/* Domínios macro (ordenam os grupos)                                          */
/* -------------------------------------------------------------------------- */

/**
 * Domínios macro: agrupam os grupos em três blocos de navegação. Servem para
 * ORDENAR os grupos (primitivos → aplicações → visual) e ancoram seções de
 * nível superior na sidebar/overview.
 */
export const DOMAIN_IDS = ["primitivos", "aplicacoes", "visual"] as const

/** União dos ids de domínio (literal `as const`). */
export type DomainId = (typeof DOMAIN_IDS)[number]

/* -------------------------------------------------------------------------- */
/* Grupos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Ids canônicos dos 16 grupos da vitrine (união literal `as const`).
 *
 * São URL-safe (kebab-case) porque viram o contrato da rota de grupo
 * (ex.: `/components/grupo/forms-inputs`). Estáveis — não renomear sem migração.
 * (Os ids de grupos pré-existentes foram mantidos mesmo após renomear os
 * RÓTULOS, para não quebrar deep-links já publicados.)
 */
export const GROUP_IDS = [
  // primitivos de UI
  "forms-inputs",
  "actions-navigation",
  "layout-containers",
  "typography-base",
  "typography-effects",
  "cards",
  "tables-data",
  "feedback-status",
  "data-display",
  // aplicações & dados
  "chat-ai",
  "dashboards-charts",
  "dashboards-data",
  "dev",
  // visual & efeitos
  "backgrounds-fx",
  "hero-sections",
  "scroll-pointer-fx",
  "card-effects",
] as const

/** União dos ids de grupo (literal `as const`). */
export type GroupId = (typeof GROUP_IDS)[number]

/** Definição de um grupo (cluster de componentes afins). */
export interface Group {
  /** Identificador estável e URL-safe. Contrato com a rota de grupo. */
  id: GroupId
  /** Nome de exibição. */
  label: string
  /** Domínio macro ao qual o grupo pertence (define o bloco de ordenação). */
  domain: DomainId
  /** Descrição curta (orientada a INTENÇÃO de uso) no topo da página/seção. */
  description: string
  /** Ordem global (1..16) — já arranjada por domínio (contígua por bloco). */
  order: number
  /** Ícone lucide associado ao grupo (opcional). */
  icon?: LucideIcon
}

/**
 * Os 16 grupos da taxonomia, JÁ ORDENADOS por domínio:
 * primitivos (1–8) → aplicações (9–12) → visual (13–16).
 *
 * As descrições lideram pela INTENÇÃO ("use para…") para ajudar tanto a busca
 * humana quanto o matching de IA durante vibe-coding.
 */
export const GROUPS: Group[] = [
  // — Domínio: primitivos de UI —
  {
    id: "forms-inputs",
    label: "Forms & Inputs",
    domain: "primitivos",
    description:
      "Use para capturar dados do usuário: inputs, textarea, OTP, selects, sliders, switches, checkboxes, date pickers e formulários completos.",
    order: 1,
    icon: TextCursorInput,
  },
  {
    id: "actions-navigation",
    label: "Actions & Navegação",
    domain: "primitivos",
    description:
      "Use para disparar ações e mover o usuário pela interface: botões e gatilhos, menus, abas, breadcrumbs, paginação e barras de navegação.",
    order: 2,
    icon: MousePointerClick,
  },
  {
    id: "layout-containers",
    label: "Layout & Containers",
    domain: "primitivos",
    description:
      "Use para estruturar a tela: grids, carrosséis, modais, drawers, painéis redimensionáveis, accordions, banners e separadores.",
    order: 3,
    icon: LayoutGrid,
  },
  {
    id: "typography-base",
    label: "Tipografia",
    domain: "primitivos",
    description:
      "Use para texto base estilo shadcn: títulos h1–h4, parágrafo, lead, blockquote, lista, código inline, large/small/muted. Para texto animado, veja “Efeitos de Texto”.",
    order: 4,
    icon: Pilcrow,
  },
  {
    id: "typography-effects",
    label: "Efeitos de Texto",
    domain: "primitivos",
    description:
      "Use para animar texto: flip, typewriter, geração progressiva, gradiente, brilho, glitch, criptografia e revelações. Para tipografia base, veja “Tipografia”.",
    order: 5,
    icon: Pilcrow,
  },
  {
    id: "cards",
    label: "Cards",
    domain: "primitivos",
    description:
      "Use para agrupar conteúdo e métricas em blocos: card base, KPI/stat cards, tiles de métrica e cards de resumo (servidor, sinal, upgrade). Cards com efeitos decorativos ficam em “Cards Decorativos”.",
    order: 6,
    icon: SquareStack,
  },
  {
    id: "tables-data",
    label: "Listas & Tabelas",
    domain: "primitivos",
    description:
      "Use para exibir coleções de itens em linhas: tabelas, data tables, listas (atividade, favoritos, leaderboard, usuários) e blocos de item.",
    order: 7,
    icon: ListTree,
  },
  {
    id: "feedback-status",
    label: "Feedback & Status",
    domain: "primitivos",
    description:
      "Use para comunicar estado e progresso: alertas, callouts, toasts, barras e círculos de progresso, trackers, skeletons e loaders.",
    order: 8,
    icon: MessageSquare,
  },
  {
    id: "data-display",
    label: "Badges & Indicadores",
    domain: "primitivos",
    description:
      "Use para rotular, identificar e dar contexto pontual: avatares, badges, tooltips, hover-cards, previews de link, empty states, kbd e números animados.",
    order: 9,
    icon: IdCard,
  },

  // — Domínio: aplicações & dados —
  {
    id: "chat-ai",
    label: "Chat & IA",
    domain: "aplicacoes",
    description:
      "Use para construir interfaces de conversa e IA: mensagens, indicadores de raciocínio, prompts e fluxos de pergunta ao usuário.",
    order: 10,
    icon: Bot,
  },
  {
    id: "dashboards-charts",
    label: "Gráficos",
    domain: "aplicacoes",
    description:
      "Use para visualizar dados quantitativos: gráficos de área, barra, linha, pizza/donut, dispersão, sparkline, combo, medidores e bar lists.",
    order: 11,
    icon: LineChart,
  },
  {
    id: "dashboards-data",
    label: "Dashboards & Observability",
    domain: "aplicacoes",
    description:
      "Use para montar telas de dashboard e observability: feeds, timelines, trace/latency, logs, server/DB grids, status bars e widgets de painel.",
    order: 12,
    icon: BarChart3,
  },
  {
    id: "dev",
    label: "Dev & Código",
    domain: "aplicacoes",
    description:
      "Use para conteúdo de desenvolvedor: blocos de código com highlight, comandos de instalação, terminais, gráfico de contribuições, globos 3D e mapa-múndi.",
    order: 13,
    icon: Terminal,
  },

  // — Domínio: visual & efeitos —
  {
    id: "backgrounds-fx",
    label: "Backgrounds",
    domain: "visual",
    description:
      "Use como fundo imersivo de uma seção: beams, auroras, grids e pontos, partículas (meteoros, estrelas, sparkles), spotlights, gradientes animados e shaders.",
    order: 14,
    icon: Wallpaper,
  },
  {
    id: "hero-sections",
    label: "Hero Sections",
    domain: "visual",
    description:
      "Use como abertura de página de alto impacto: heros com parallax, lamp, highlight, efeito ao mover o mouse e cenas conduzidas por scroll (macbook, gemini).",
    order: 15,
    icon: Presentation,
  },
  {
    id: "scroll-pointer-fx",
    label: "Scroll & Interação",
    domain: "visual",
    description:
      "Use para reações a scroll e ponteiro: revelações no scroll, tracing beam, parallax de galeria, lens/zoom, glow e máscaras que seguem o cursor.",
    order: 16,
    icon: Pointer,
  },
  {
    id: "card-effects",
    label: "Cards Decorativos",
    domain: "visual",
    description:
      "Use quando o card é o destaque visual: efeitos 3D, glare, spotlight, comet, wobble, hover direcional, pin e pilhas/grids animadas. Para cards funcionais, veja “Cards”.",
    order: 17,
    icon: Wand2,
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
/* Mapa slug → grupo (clusterização)                                           */
/* -------------------------------------------------------------------------- */

/**
 * Grupo de fallback para slugs SEM entrada explícita em `SLUG_GROUP_MAP`.
 *
 * NÃO se deve confiar nele: o validador de cobertura
 * (`_meta/scripts/lote/validate-groups.mjs`, rodado no CI) FALHA se algum slug
 * do registry não tiver grupo explícito. O default existe só como rede de
 * segurança em runtime para um slug recém-adicionado antes do mapeamento.
 */
export const DEFAULT_GROUP: GroupId = "feedback-status"

/**
 * Mapa de derivação `slug do componente → grupo`.
 *
 * COBERTURA: mapeia os slugs de `components.ts`, cada um para 1 dos `GroupId`.
 * A vinculação fica AQUI (e não em `ComponentMeta`) para manter a camada de
 * grupos aditiva e desacoplada do registry e dos parsers `_meta`. Organizado
 * por grupo, alfabético dentro de cada bloco.
 */
export const SLUG_GROUP_MAP: Record<string, GroupId> = {
  // — Forms & Inputs: captura de dados —
  label: "forms-inputs",
  field: "forms-inputs",
  "input-group": "forms-inputs",
  calendar: "forms-inputs",
  "calendar-tremor": "forms-inputs",
  checkbox: "forms-inputs",
  "checkbox-group-fluid": "forms-inputs",
  "color-picker-fluid": "forms-inputs",
  "consent-manager": "forms-inputs",
  "date-picker": "forms-inputs",
  "date-range-picker-tremor": "forms-inputs",
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
  "label-tremor": "forms-inputs",
  "middle-truncation": "forms-inputs",
  "placeholders-and-vanish-input": "forms-inputs",
  "preference-row": "forms-inputs",
  "radio-group": "forms-inputs",
  "radio-group-fluid": "forms-inputs",
  "radio-card-group-tremor": "forms-inputs",
  "react-wheel-picker": "forms-inputs",
  select: "forms-inputs",
  "select-fluid": "forms-inputs",
  "select-native-tremor": "forms-inputs",
  "slide-to-unlock": "forms-inputs",
  slider: "forms-inputs",
  "slider-fluid": "forms-inputs",
  switch: "forms-inputs",
  "switch-fluid": "forms-inputs",
  textarea: "forms-inputs",
  "toggle-tremor": "forms-inputs",

  // — Actions & Navegação: gatilhos de ação, menus, abas, navbars —
  "toggle-group": "actions-navigation",
  "animated-button": "actions-navigation",
  breadcrumb: "actions-navigation",
  button: "actions-navigation",
  "button-fluid": "actions-navigation",
  "button-group": "actions-navigation",
  "chevrons-up-down-icon": "actions-navigation",
  command: "actions-navigation",
  "context-menu": "actions-navigation",
  "copy-button": "actions-navigation",
  "creepy-button": "actions-navigation",
  "dashboard-user-menu": "actions-navigation",
  "database-tab-bar": "actions-navigation",
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
  "tab-navigation-tremor": "actions-navigation",
  tabs: "actions-navigation",
  "tabs-fluid": "actions-navigation",
  "tabs-subtle-fluid": "actions-navigation",
  "theme-switcher": "actions-navigation",
  "theme-toggle-effect": "actions-navigation",
  "toc-minimap": "actions-navigation",
  toggle: "actions-navigation",

  // — Layout & Containers: grids, carrosséis, modais, drawers, accordions, banners —
  accordion: "layout-containers",
  "accordion-fluid": "layout-containers",
  "alert-dialog": "layout-containers",
  "animated-modal": "layout-containers",
  "animated-testimonials": "layout-containers",
  "apple-cards-carousel": "layout-containers",
  "aspect-ratio": "layout-containers",
  "bento-grid": "layout-containers",
  carousel: "layout-containers",
  collapsible: "layout-containers",
  "collapsible-section": "layout-containers",
  compare: "layout-containers",
  "dashboard-panel": "layout-containers",
  "dashboard-sidebar-nav": "layout-containers",
  "dashboard-topbar": "layout-containers",
  dialog: "layout-containers",
  "dialog-fluid": "layout-containers",
  "divider-tremor": "layout-containers",
  drawer: "layout-containers",
  "expandable-cards": "layout-containers",
  "features-section-with-skeletons": "layout-containers",
  "images-slider": "layout-containers",
  "infinite-moving-cards": "layout-containers",
  "layout-grid": "layout-containers",
  "logo-slider": "layout-containers",
  resizable: "layout-containers",
  "scroll-area": "layout-containers",
  "scroll-fade-effect": "layout-containers",
  separator: "layout-containers",
  sheet: "layout-containers",
  "sticky-banner": "layout-containers",
  "sticky-scroll-reveal": "layout-containers",
  "team-section-with-scales": "layout-containers",
  tree: "layout-containers",
  "work-experience-component": "layout-containers",

  // — Tipografia: texto base (shadcn) —
  typography: "typography-base",

  // — Efeitos de Texto: animações de texto —
  "canvas-text": "typography-effects",
  "colourful-text": "typography-effects",
  "container-cover": "typography-effects",
  "container-text-flip": "typography-effects",
  "cyber-glitch-text": "typography-effects",
  "encrypted-text": "typography-effects",
  "flip-fade-text": "typography-effects",
  "flip-text": "typography-effects",
  "flip-words": "typography-effects",
  "fluid-gradient-text": "typography-effects",
  "layout-text-flip": "typography-effects",
  "shimmering-text": "typography-effects",
  "squiggly-text": "typography-effects",
  "text-flipping-board": "typography-effects",
  "text-generate-effect": "typography-effects",
  "text-hover-effect": "typography-effects",
  "text-reveal-card": "typography-effects",
  "typewriter-effect": "typography-effects",

  // — Cards: conteúdo e métrica (funcionais) —
  card: "cards",
  "card-tremor": "cards",
  "detail-stat-cell": "cards",
  "kpi-card": "cards",
  "metric-glow-card": "cards",
  "server-overview-card": "cards",
  "signal-card": "cards",
  "stat-tile": "cards",
  "table-info-panel": "cards",
  "upgrade-card": "cards",

  // — Listas & Tabelas: tabelas e listas —
  "activity-feed": "tables-data",
  "connection-list": "tables-data",
  "data-table": "tables-data",
  "favorites-list": "tables-data",
  "invoice-table": "tables-data",
  item: "tables-data",
  "leaderboard-list": "tables-data",
  "query-history-list": "tables-data",
  table: "tables-data",
  "table-fluid": "tables-data",
  "user-list-item": "tables-data",

  // — Dev & Código: code, comandos, terminais, contribuições, globos 3D e mapa —
  "3d-globe": "dev",
  "code-block": "dev",
  "code-block-command": "dev",
  "github-contributions": "dev",
  "github-globe": "dev",
  terminal: "dev",
  "world-map": "dev",

  // — Feedback & Status: alertas, toasts, progresso, loaders, skeletons —
  alert: "feedback-status",
  spinner: "feedback-status",
  "callout-tremor": "feedback-status",
  loader: "feedback-status",
  "mobius-loop-icon": "feedback-status",
  "multi-step-loader": "feedback-status",
  progress: "feedback-status",
  "progress-bar-tremor": "feedback-status",
  "progress-circle-tremor": "feedback-status",
  skeleton: "feedback-status",
  sonner: "feedback-status",
  toast: "feedback-status",
  "tracker-tremor": "feedback-status",

  // — Badges & Indicadores: avatares, badges, tooltips, previews, empty, kbd e números —
  kbd: "data-display",
  "animated-number": "data-display",
  "animated-tooltip": "data-display",
  avatar: "data-display",
  badge: "data-display",
  "badge-fluid": "data-display",
  empty: "data-display",
  "hover-card": "data-display",
  "images-badge": "data-display",
  "link-preview": "data-display",
  tooltip: "data-display",
  "tooltip-card": "data-display",
  "tooltip-fluid": "data-display",

  // — Chat & IA: mensagens, raciocínio, prompts, perguntas ao usuário —
  "ask-user-questions-fluid": "chat-ai",
  "chat-message-fluid": "chat-ai",
  "input-message-fluid": "chat-ai",
  "thinking-indicator-fluid": "chat-ai",
  "thinking-steps-fluid": "chat-ai",

  // — Gráficos: visualizações de dados quantitativos —
  "area-chart-tremor": "dashboards-charts",
  "bar-chart": "dashboards-charts",
  "bar-chart-tremor": "dashboards-charts",
  "bar-list-tremor": "dashboards-charts",
  "category-bar-tremor": "dashboards-charts",
  "combo-chart-tremor": "dashboards-charts",
  "donut-breakdown": "dashboards-charts",
  "donut-chart": "dashboards-charts",
  "donut-chart-tremor": "dashboards-charts",
  "h-bar-chart": "dashboards-charts",
  "line-chart": "dashboards-charts",
  "line-chart-tremor": "dashboards-charts",
  "radial-gauge": "dashboards-charts",
  "scatter-chart-tremor": "dashboards-charts",
  "spark-chart-tremor": "dashboards-charts",
  sparkline: "dashboards-charts",

  // — Dashboards & Observability: blocos de aplicação/observability —
  "chart-template-gallery": "dashboards-data",
  "chart-widget": "dashboards-data",
  "container-resource-panel": "dashboards-data",
  "dashboard-filter-bar": "dashboards-data",
  "db-overview-grid": "dashboards-data",
  "ecg-strip": "dashboards-data",
  "error-tracker-feed": "dashboards-data",
  "fleet-server-grid": "dashboards-data",
  "incident-timeline": "dashboards-data",
  "latency-heatmap": "dashboards-data",
  "log-stream": "dashboards-data",
  "react-flow": "dashboards-data",
  "request-flow-inspector": "dashboards-data",
  "service-mesh": "dashboards-data",
  timeline: "dashboards-data",
  "trace-waterfall": "dashboards-data",
  "user-activity-stream": "dashboards-data",
  "workbench-status-bar": "dashboards-data",

  // — Backgrounds: fundos imersivos, partículas, spotlights, shaders —
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
  "dither-shader": "backgrounds-fx",
  "dot-grid-spotlight": "backgrounds-fx",
  "dotted-glow-background": "backgrounds-fx",
  "grid-and-dot-backgrounds": "backgrounds-fx",
  "light-lines": "backgrounds-fx",
  meteors: "backgrounds-fx",
  "noise-background": "backgrounds-fx",
  "perspective-grid": "backgrounds-fx",
  "pixelated-canvas": "backgrounds-fx",
  scales: "backgrounds-fx",
  "shooting-stars-and-stars-background": "backgrounds-fx",
  sparkles: "backgrounds-fx",
  spotlight: "backgrounds-fx",
  "spotlight-new": "backgrounds-fx",
  vortex: "backgrounds-fx",
  "wavy-background": "backgrounds-fx",
  "webcam-pixel-grid": "backgrounds-fx",

  // — Hero Sections: aberturas de página de alto impacto —
  "google-gemini-effect": "hero-sections",
  "hero-highlight": "hero-sections",
  "hero-parallax": "hero-sections",
  "hero-section-with-mousemove": "hero-sections",
  "lamp-effect": "hero-sections",
  "macbook-scroll": "hero-sections",
  "parallax-hero-images": "hero-sections",
  "parallax-hero-images-2": "hero-sections",

  // — Scroll & Interação: reações a scroll e ponteiro —
  "container-scroll-animation": "scroll-pointer-fx",
  "following-pointer": "scroll-pointer-fx",
  "glowing-effect": "scroll-pointer-fx",
  lens: "scroll-pointer-fx",
  "parallax-scroll": "scroll-pointer-fx",
  "svg-mask-effect": "scroll-pointer-fx",
  "tracing-beam": "scroll-pointer-fx",

  // — Cards Decorativos: card como destaque visual (efeitos) —
  "3d-card-effect": "card-effects",
  "3d-pin": "card-effects",
  "card-hover-effect": "card-effects",
  "card-spotlight": "card-effects",
  "card-stack": "card-effects",
  "comet-card": "card-effects",
  "direction-aware-hover": "card-effects",
  "draggable-card": "card-effects",
  "evervault-card": "card-effects",
  "focus-cards": "card-effects",
  "glare-card": "card-effects",
  "glow-card-grid": "card-effects",
  "glowing-stars-effect": "card-effects",
  "wobble-card": "card-effects",
}

/* -------------------------------------------------------------------------- */
/* Helpers de derivação de grupo                                               */
/* -------------------------------------------------------------------------- */

/**
 * Resolve o GRUPO de um slug.
 *
 * Consulta {@link SLUG_GROUP_MAP} (O(1)) e cai em {@link DEFAULT_GROUP} para
 * slugs ainda não classificados (itens novos do registry — barrados no CI). É a
 * porta de entrada única para qualquer UI/consumidor que precise saber a que
 * grupo um componente pertence — ninguém deve ler `SLUG_GROUP_MAP` direto.
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
 * Lista os grupos JÁ ORDENADOS por `order` (primitivos → aplicações → visual),
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
