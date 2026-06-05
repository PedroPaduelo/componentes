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
    slug: "middle-truncation",
    name: "Middle Truncation",
    category: "Forms",
    description:
      "Trunca texto no meio preservando início e fim, com tooltip no hover.",
    tags: [
      "truncar",
      "texto",
      "ellipsis",
      "meio",
      "tooltip",
      "string",
    ],
  },
]

/** Busca um componente pelo slug (usado na Task 3 — página de detalhe). */
export function getComponentBySlug(slug: string): ComponentMeta | undefined {
  return components.find((c) => c.slug === slug)
}
