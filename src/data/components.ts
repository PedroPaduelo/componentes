/**
 * Registry — fonte da verdade do catálogo da vitrine.
 *
 * O `slug` é o contrato com a página de detalhe (`/components/:slug`):
 * deve ser estável e URL-safe (ex.: "button", "dropdown-menu").
 *
 * O tipo `ComponentMeta` é propositalmente extensível: a página de
 * detalhe pode acrescentar campos (ex.: exemplos de uso, código,
 * dependências) sem quebrar o catálogo.
 */

/** As quatro categorias da vitrine. */
export const CATEGORIES = ["Actions", "Layout", "Forms", "Feedback"] as const

export type Category = (typeof CATEGORIES)[number]

/** Metadados de um componente exibido na vitrine. */
export interface ComponentMeta {
  /** Identificador estável e URL-safe. Contrato com /components/:slug. */
  slug: string
  /** Nome de exibição. */
  name: string
  /** Categoria (restrita às 4 categorias da vitrine). */
  category: Category
  /** Descrição curta exibida no card. */
  description: string
  /** Palavras-chave para busca (além do nome). */
  tags: string[]
}

/**
 * Lista de componentes da vitrine. Cada item gera um card no catálogo
 * e (na Task 3) uma página de detalhe em /components/:slug.
 */
export const components: ComponentMeta[] = [
  {
    slug: "button",
    name: "Button",
    category: "Actions",
    description:
      "Botão acionável com variantes de estilo e tamanho para disparar ações.",
    tags: ["botão", "ação", "cta", "clique", "variantes"],
  },
  {
    slug: "dropdown-menu",
    name: "Dropdown Menu",
    category: "Actions",
    description:
      "Menu suspenso acionado por um gatilho, com itens, separadores e submenus.",
    tags: ["menu", "dropdown", "ações", "contexto", "opções"],
  },
  {
    slug: "card",
    name: "Card",
    category: "Layout",
    description:
      "Contêiner com cabeçalho, conteúdo e rodapé para agrupar informação relacionada.",
    tags: ["cartão", "container", "layout", "painel", "superfície"],
  },
  {
    slug: "dialog",
    name: "Dialog",
    category: "Layout",
    description:
      "Janela modal sobreposta ao conteúdo para fluxos focados e confirmações.",
    tags: ["modal", "diálogo", "overlay", "popup", "janela"],
  },
  {
    slug: "sheet",
    name: "Sheet",
    category: "Layout",
    description:
      "Painel deslizante a partir da borda da tela para navegação ou formulários.",
    tags: ["drawer", "painel", "lateral", "deslizante", "overlay"],
  },
  {
    slug: "tabs",
    name: "Tabs",
    category: "Layout",
    description:
      "Abas para alternar entre seções de conteúdo dentro de um mesmo contexto.",
    tags: ["abas", "navegação", "seções", "tabs", "alternar"],
  },
  {
    slug: "input",
    name: "Input",
    category: "Forms",
    description:
      "Campo de texto para entrada de dados em formulários, com estados de foco e erro.",
    tags: ["campo", "texto", "formulário", "entrada", "input"],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "Forms",
    description:
      "Caixa de seleção para opções booleanas, com estados marcado e indeterminado.",
    tags: ["caixa", "seleção", "formulário", "booleano", "marcar"],
  },
  {
    slug: "badge",
    name: "Badge",
    category: "Feedback",
    description:
      "Etiqueta compacta para destacar status, contagens ou rótulos contextuais.",
    tags: ["etiqueta", "status", "rótulo", "tag", "destaque"],
  },
  {
    slug: "tree",
    name: "Tree",
    category: "Layout",
    description:
      "Árvore de arquivos interativa com busca, drag & drop e navegação por teclado. Baseada em @pierre/trees.",
    tags: [
      "árvore",
      "arquivos",
      "navegação",
      "diretório",
      "file tree",
      "explorer",
    ],
  },
  {
    slug: "work-experience-component",
    name: "Work Experience",
    category: "Layout",
    description:
      "Card/timeline de experiência profissional com empresa, cargo, período, descrição e tecnologias.",
    tags: [
      "experiência",
      "currículo",
      "timeline",
      "carreira",
      "portfólio",
      "work",
    ],
  },
  {
    slug: "chevrons-up-down-icon",
    name: "Chevrons Up Down Icon",
    category: "Actions",
    description:
      "Ícone animado de dois chevrons que rotacionam suavemente — indicador visual de dropdown/select.",
    tags: ["ícone", "chevron", "dropdown", "seletor"],
  },
  {
    slug: "code-block-command",
    name: "Code Block Command",
    category: "Feedback",
    description:
      "Comando shell com tokens coloridos (comando, args, flags) e botão de copiar.",
    tags: ["código", "comando", "cli", "terminal", "copy"],
  },
  {
    slug: "dot-grid-spotlight",
    name: "Dot Grid Spotlight",
    category: "Feedback",
    description:
      "Background de grade de pontos com spotlight que segue o cursor do mouse.",
    tags: ["dots", "grid", "spotlight", "background", "efeito"],
  },
  {
    slug: "fluid-gradient-text",
    name: "Fluid Gradient Text",
    category: "Layout",
    description:
      "Texto com gradiente animado (mesh gradient) que flui continuamente.",
    tags: ["texto", "gradiente", "animado", "efeito"],
  },
  {
    slug: "glow-card-grid",
    name: "Glow Card Grid",
    category: "Layout",
    description:
      "Grid de cards com efeito glow — icon/background borrado que segue o cursor e borda com backdrop-blur.",
    tags: ["glow", "cards", "grid", "bento", "pointer", "efeito"],
  },
  {
    slug: "icon-swap",
    name: "Icon Swap",
    category: "Actions",
    description:
      "Componente que troca entre dois ícones com crossfade (Sun↔Moon, Eye↔EyeOff, etc.).",
    tags: ["ícone", "swap", "crossfade", "tema"],
  },
  {
    slug: "react-wheel-picker",
    name: "React Wheel Picker",
    category: "Forms",
    description:
      "Picker estilo iOS com 3 colunas (data picker) que rola como uma roda. Wrapper sobre react-wheel-picker.",
    tags: ["picker", "wheel", "data", "iOS", "rolagem"],
  },
  {
    slug: "shimmering-text",
    name: "Shimmering Text",
    category: "Feedback",
    description:
      "Texto com efeito shimmer (brilho da esquerda pra direita, estilo skeleton/loading).",
    tags: ["shimmer", "skeleton", "loading", "texto", "efeito"],
  },
  {
    slug: "theme-toggle-effect",
    name: "Theme Toggle Effect",
    category: "Actions",
    description:
      "Toggle de tema com animação de view transition (círculo expandindo do botão até a tela inteira).",
    tags: ["tema", "view-transition", "animação", "efeito"],
  },
  {
    slug: "mobius-loop-icon",
    name: "Mobius Loop Icon",
    category: "Actions",
    description:
      "Ícone animado de loop infinito (mobius strip) com gradiente fluindo.",
    tags: ["ícone", "loop", "mobius", "animado"],
  },
  {
    slug: "scroll-fade-effect",
    name: "Scroll Fade Effect",
    category: "Layout",
    description:
      "Container com fade nas bordas superior/inferior quando há conteúdo scrollável além do viewport (estilo iOS).",
    tags: ["scroll", "fade", "mask", "container", "efeito"],
  },
  {
    slug: "slide-to-unlock",
    name: "Slide to Unlock",
    category: "Forms",
    description:
      "Controle estilo iOS: arrastar thumb da esquerda pra direita pra confirmar ação.",
    tags: ["slide", "unlock", "touch", "gesture", "confirmação"],
  },
  {
    slug: "theme-switcher",
    name: "Theme Switcher",
    category: "Actions",
    description:
      "Seletor de tema elaborado com opções light/dark/system (e talvez accent color).",
    tags: ["tema", "switcher", "light", "dark", "system"],
  },
]

/** Busca um componente pelo slug (usado na Task 3 — página de detalhe). */
export function getComponentBySlug(slug: string): ComponentMeta | undefined {
  return components.find((c) => c.slug === slug)
}
