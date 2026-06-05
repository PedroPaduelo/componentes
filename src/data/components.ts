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
      "Ícono animado de loop infinito (mobius strip) com morphing SVG entre círculos e infinito.",
    tags: [
      "ícone",
      "animação",
      "svg",
      "loading",
      "infinito",
      "mobius",
      "loop",
    ],
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
  {
    slug: "consent-manager",
    name: "Consent Manager",
    category: "Forms",
    description:
      "Gerenciador de consentimento de cookies com categorias, switches e persistência local.",
    tags: ["cookies", "consent", "lgpd", "gdpr", "privacidade", "preferências"],
  },
  {
    slug: "copy-button",
    name: "Copy Button",
    category: "Actions",
    description:
      "Botão de copiar para a área de transferência com feedback visual e fallback execCommand.",
    tags: ["copiar", "clipboard", "copy", "botão", "feedback"],
  },
  {
    slug: "elastic-slider",
    name: "Elastic Slider",
    category: "Forms",
    description:
      "Slider com efeito elástico (rubber-band) ao arrastar além dos limites, estilo iOS.",
    tags: ["slider", "elastic", "range", "arrastar", "iOS", "controle"],
  },
  {
    slug: "github-contributions",
    name: "GitHub Contributions",
    category: "Feedback",
    description:
      "Heatmap de contribuições estilo GitHub, com células por dia, tooltips e escalas de cor.",
    tags: ["github", "heatmap", "contribuições", "calendário", "atividade"],
  },
  {
    slug: "middle-truncation",
    name: "Middle Truncation",
    category: "Forms",
    description:
      "Trunca texto no meio preservando início e fim — ideal para hashes, paths e e-mails.",
    tags: ["texto", "truncar", "ellipsis", "hash", "path", "overflow"],
  },
  {
    slug: "toc-minimap",
    name: "TOC Minimap",
    category: "Layout",
    description:
      "Sumário/minimap de navegação com seção ativa via IntersectionObserver e barra de progresso.",
    tags: ["toc", "sumário", "navegação", "minimap", "scroll", "âncora"],
  },

  // Lote VengenceUI
  {
    slug: "cyber-glitch-text",
    name: "Cyber Glitch Text",
    category: "Feedback",
    description:
      "Bloco de texto estilizado com scramble (decodificação hacker) e chromatic aberration RGB no hover.",
    tags: ["glitch", "hacker", "scramble", "chromatic", "efeito"],
  },
  {
    slug: "animated-button",
    name: "Animated Button",
    category: "Actions",
    description:
      "Botão com borda brilhante animada e text reveal (mask gradient deslizante) — ideal para chamadas de ação (CTA).",
    tags: ["button", "animated", "shiny", "border", "reveal", "cta", "vengenceui"],
  },
  {
    slug: "flip-text",
    name: "Flip Text",
    category: "Feedback",
    description:
      "Texto com animação 3D flip caractere-por-caractere, usando rotateX + CSS variables e delays staggered (sine wave) para efeito de onda.",
    tags: ["flip", "3d", "animação", "texto", "efeito", "wave", "stagger"],
  },
  {
    slug: "perspective-grid",
    name: "Perspective Grid",
    category: "Feedback",
    description:
      "Grid 3D em perspectiva com tiles coloridos no hover — efeito de profundidade para hero/backgrounds.",
    tags: [
      "3d",
      "grid",
      "perspective",
      "hover",
      "vengenceui",
      "background",
      "tile",
    ],
  },
  {
    slug: "glass-dock",
    name: "Glass Dock",
    category: "Actions",
    description:
      "MacOS-inspired glassmorphic dock com scale magnification on hover.",
    tags: ["dock", "macos", "glassmorphism", "navigation", "hover", "magnify"],
  },
  {
    slug: "creepy-button",
    name: "Creepy Button",
    category: "Actions",
    description:
      "Botão interativo com olhos que seguem o cursor (pupil tracking), animação de piscar periódica e cover que rotaciona em hover.",
    tags: [
      "button",
      "interactive",
      "animation",
      "vengenceui",
      "creepy",
      "pupil-tracking",
      "hover",
    ],
  },

  // Lote Fluid (ONDA 2 lote A)
  {
    slug: "button-fluid",
    name: "Button (Fluid)",
    category: "Actions",
    description:
      "Botão animado da Fluid Functionalism com variantes, ícones, spinner de loading e transições fluidas no hover.",
    tags: ["fluid", "button", "botão", "ações", "loading", "ícone"],
  },
  {
    slug: "badge-fluid",
    name: "Badge (Fluid)",
    category: "Feedback",
    description:
      "Selo/etiqueta da Fluid Functionalism com variantes solid e dot, paleta de cores e três tamanhos.",
    tags: ["fluid", "badge", "selo", "etiqueta", "status", "tag"],
  },
  {
    slug: "slider-fluid",
    name: "Slider (Fluid)",
    category: "Forms",
    description:
      "Slider da Fluid Functionalism com thumb animado, faixa (range), step dots, tooltip de valor e edição inline.",
    tags: ["fluid", "slider", "range", "controle", "valor", "formulário"],
  },
  {
    slug: "switch-fluid",
    name: "Switch (Fluid)",
    category: "Forms",
    description:
      "Switch da Fluid Functionalism com thumb que estica no hover/press e suporte a arraste para alternar.",
    tags: ["fluid", "switch", "toggle", "alternar", "formulário", "controle"],
  },
  {
    slug: "tooltip-fluid",
    name: "Tooltip (Fluid)",
    category: "Feedback",
    description:
      "Tooltip da Fluid Functionalism com animação de entrada/saída via motion e posicionamento em quatro lados.",
    tags: ["fluid", "tooltip", "dica", "popover", "hover", "feedback"],
  },
  {
    slug: "table-fluid",
    name: "Table (Fluid)",
    category: "Layout",
    description:
      "Tabela da Fluid Functionalism com destaque de linha por proximidade do cursor e transições suaves.",
    tags: ["fluid", "table", "tabela", "dados", "linhas", "layout"],
  },

  // Lote Fluid (ONDA 2 lote B1)
  {
    slug: "file-thumbnail-fluid",
    name: "File Thumbnail (Fluid)",
    category: "Feedback",
    description:
      "Miniatura quadrada de arquivo da Fluid Functionalism: pré-visualiza imagens e a primeira página de PDFs (via pdfjs) com spinner enquanto carrega.",
    tags: ["fluid", "file", "arquivo", "thumbnail", "preview", "pdf", "imagem"],
  },
  {
    slug: "thinking-indicator-fluid",
    name: "Thinking Indicator (Fluid)",
    category: "Feedback",
    description:
      "Indicador de processamento da Fluid Functionalism com ícone morfando entre formas e texto com efeito shimmer que alterna palavras.",
    tags: ["fluid", "thinking", "loading", "indicador", "shimmer", "ia"],
  },
  {
    slug: "input-group-fluid",
    name: "Input Group (Fluid)",
    category: "Forms",
    description:
      "Grupo de campos de texto da Fluid Functionalism com destaque por proximidade do cursor, ícones, foco animado e mensagens de erro.",
    tags: ["fluid", "input", "campo", "formulário", "grupo", "erro"],
  },
  {
    slug: "input-copy-fluid",
    name: "Input Copy (Fluid)",
    category: "Forms",
    description:
      "Campo somente leitura da Fluid Functionalism para exibir e copiar um valor, com variantes ícone (tooltip) e botão e animação de check.",
    tags: ["fluid", "input", "copiar", "clipboard", "copy", "formulário"],
  },
  {
    slug: "tabs-subtle-fluid",
    name: "Tabs Subtle (Fluid)",
    category: "Layout",
    description:
      "Abas sutis da Fluid Functionalism com pílula selecionada animada, hover por proximidade, anel de foco e modo de rótulo só na ativa.",
    tags: ["fluid", "tabs", "abas", "navegação", "layout", "pílula"],
  },
  {
    slug: "dropdown-fluid",
    name: "Dropdown (Fluid)",
    category: "Actions",
    description:
      "Menu dropdown da Fluid Functionalism com itens (MenuItem) selecionáveis, destaque por proximidade, check animado e elevação de superfície.",
    tags: ["fluid", "dropdown", "menu", "ações", "popover", "seleção"],
  },
  {
    slug: "accordion-fluid",
    name: "Accordion (Fluid)",
    category: "Layout",
    description:
      "Accordion da Fluid Functionalism com expansão animada por mola, destaque por proximidade do cursor, anel de foco e modos single/multiple.",
    tags: ["fluid", "accordion", "acordeão", "expansível", "collapse", "layout"],
  },
  {
    slug: "radio-group-fluid",
    name: "Radio Group (Fluid)",
    category: "Forms",
    description:
      "Grupo de opções exclusivas da Fluid Functionalism com fundo selecionado animado, destaque por proximidade, navegação por teclado e ponto animado.",
    tags: ["fluid", "radio", "rádio", "seleção", "opções", "formulário"],
  },
  {
    slug: "checkbox-group-fluid",
    name: "Checkbox Group (Fluid)",
    category: "Forms",
    description:
      "Grupo de caixas de seleção da Fluid Functionalism com fundos contíguos que se fundem/separam (merge/split), check animado e destaque por proximidade.",
    tags: ["fluid", "checkbox", "seleção", "múltipla", "marcar", "formulário"],
  },
  {
    slug: "select-fluid",
    name: "Select (Fluid)",
    category: "Forms",
    description:
      "Select da Fluid Functionalism com popover em portal, destaque por proximidade, check animado, variantes bordered/borderless e suporte a ícones e erro.",
    tags: ["fluid", "select", "combobox", "dropdown", "seleção", "formulário"],
  },
  {
    slug: "tabs-fluid",
    name: "Tabs (Fluid)",
    category: "Layout",
    description:
      "Abas da Fluid Functionalism com indicador de pílula elevada animado, hover por proximidade no eixo horizontal, anel de foco e painéis controlados.",
    tags: ["fluid", "tabs", "abas", "navegação", "pílula", "layout"],
  },
  {
    slug: "dialog-fluid",
    name: "Dialog (Fluid)",
    category: "Layout",
    description:
      "Modal da Fluid Functionalism com overlay e conteúdo animados por mola, elevação de superfície empilhável, formas configuráveis e botão de fechar integrado.",
    tags: ["fluid", "dialog", "modal", "popup", "overlay", "layout"],
  },
  {
    slug: "chat-message-fluid",
    name: "Chat Message (Fluid)",
    category: "Feedback",
    description:
      "Bolha de mensagem de chat da Fluid Functionalism com entrada animada, alinhamento por remetente (usuário/assistente), anexos em miniatura e meta-linha revelada no hover.",
    tags: ["fluid", "chat", "mensagem", "conversa", "assistente", "feedback"],
  },
  {
    slug: "thinking-steps-fluid",
    name: "Thinking Steps (Fluid)",
    category: "Feedback",
    description:
      "Trilha de raciocínio da Fluid Functionalism: accordion com passos animados, status (ativo/concluído), detalhes aninhados, fontes em badges e imagens — para exibir o pensamento de uma IA.",
    tags: ["fluid", "thinking", "raciocínio", "ia", "passos", "feedback"],
  },
  {
    slug: "color-picker-fluid",
    name: "Color Picker (Fluid)",
    category: "Forms",
    description:
      "Seletor de cor da Fluid Functionalism com quadrado de saturação, sliders de matiz e alpha, conta-gotas, swatches e formatos hex/rgb/hsl/oklch — em painel inline ou popover.",
    tags: ["fluid", "color", "cor", "picker", "seletor", "formulário"],
  },
  {
    slug: "ask-user-questions-fluid",
    name: "Ask User Questions (Fluid)",
    category: "Forms",
    description:
      "Fluxo de perguntas da Fluid Functionalism: seleção única ou múltipla, campo 'Outro', mesclagem animada de seleções contíguas, navegação por teclado e Back/Skip/Continue.",
    tags: ["fluid", "perguntas", "questionário", "seleção", "formulário", "wizard"],
  },
  {
    slug: "input-message-fluid",
    name: "Input Message (Fluid)",
    category: "Forms",
    description:
      "Composer de mensagem da Fluid Functionalism: textarea auto-expansível, anexos via drag-and-drop e picker, preview de imagens/PDF, slots customizáveis e botão de envio.",
    tags: ["fluid", "input", "mensagem", "chat", "anexo", "formulário"],
  },
]

/** Busca um componente pelo slug (usado na Task 3 — página de detalhe). */
export function getComponentBySlug(slug: string): ComponentMeta | undefined {
  return components.find((c) => c.slug === slug)
}
