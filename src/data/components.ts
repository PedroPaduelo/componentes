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
  /**
   * Dica de uso curada (opcional). Quando presente, substitui o texto
   * derivado de description/tags na seção "Dica de uso" da página doc.
   * Aditivo: não afeta o catálogo nem `families.ts`.
   */
  usage?: string
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
    usage:
      "Use a variante `default` para a ação principal de uma tela e reserve `outline`/`ghost` para ações secundárias. Em diálogos de confirmação destrutiva, use `destructive`. Evite mais de um botão primário no mesmo agrupamento para não competir pela atenção.",
  },
  {
    slug: "dropdown-menu",
    name: "Dropdown Menu",
    category: "Actions",
    description:
      "Menu suspenso acionado por um gatilho, com itens, separadores e submenus.",
    tags: ["menu", "dropdown", "ações", "contexto", "opções"],
    usage:
      "Ideal para agrupar ações secundárias atrás de um único gatilho (ex.: menu \"…\" de uma linha de tabela). Agrupe itens relacionados com separadores e evite listas muito longas — acima de ~7 itens, considere um comando/busca. Não use para navegação primária do app.",
  },
  {
    slug: "context-menu",
    name: "Context Menu",
    category: "Actions",
    description:
      "Menu de contexto acionado pelo clique direito do mouse, com itens, separadores, checkboxes, radio groups e submenus.",
    tags: ["menu", "contexto", "clique direito", "ações", "popup"],
    usage:
      "Use para ações contextuais que dependem do elemento clicado (ex.: menu de arquivo/pasta, opções de texto selecionado). O trigger define a área de ativação — o menu abre na posição do cursor. Evite usar como navegação primária.",
  },
  {
    slug: "card",
    name: "Card",
    category: "Layout",
    description:
      "Contêiner com cabeçalho, conteúdo e rodapé para agrupar informação relacionada.",
    tags: ["cartão", "container", "layout", "painel", "superfície"],
    usage:
      "Use para agrupar informação relacionada em uma superfície elevada (resumo, métrica, item de lista rica). Mantenha um único assunto por card e use `CardHeader`/`CardContent`/`CardFooter` para hierarquia clara. Evite aninhar cards dentro de cards.",
  },
  {
    slug: "dialog",
    name: "Dialog",
    category: "Layout",
    description:
      "Janela modal sobreposta ao conteúdo para fluxos focados e confirmações.",
    tags: ["modal", "diálogo", "overlay", "popup", "janela"],
    usage:
      "Use para fluxos focados que exigem uma decisão imediata (confirmar, editar um item curto). Sempre forneça um título acessível via `DialogTitle` e uma forma clara de fechar. Para formulários longos ou navegação lateral, prefira `Sheet`; para mensagens não-bloqueantes, prefira um toast.",
  },
  {
    slug: "sheet",
    name: "Sheet",
    category: "Layout",
    description:
      "Painel deslizante a partir da borda da tela para navegação ou formulários.",
    tags: ["drawer", "painel", "lateral", "deslizante", "overlay"],
    usage:
      "Bom para navegação em telas estreitas e para formulários/filtros que precisam de mais espaço vertical que um diálogo. Escolha o `side` conforme o contexto (esquerda para navegação, direita para detalhes/edição). Garanta um `SheetTitle` para acessibilidade.",
  },
  {
    slug: "drawer",
    name: "Drawer",
    category: "Layout",
    description:
      "Drawer que abre a partir da base da tela com handle visual, baseado em vaul. Ideal para ações contextuais em mobile.",
    tags: ["drawer", "vaul", "modal", "bottom-sheet", "mobile", "shadcn"],
  },
  {
    slug: "tabs",
    name: "Tabs",
    category: "Layout",
    description:
      "Abas para alternar entre seções de conteúdo dentro de um mesmo contexto.",
    tags: ["abas", "navegação", "seções", "tabs", "alternar"],
    usage:
      "Use para alternar entre seções equivalentes de um mesmo contexto sem trocar de página. Mantenha rótulos curtos e um número pequeno de abas; se o conteúdo for sequencial ou independente, prefira páginas ou um accordion. A aba ativa deve refletir o estado atual de forma óbvia.",
  },
  {
    slug: "input",
    name: "Input",
    category: "Forms",
    description:
      "Campo de texto para entrada de dados em formulários, com estados de foco e erro.",
    tags: ["campo", "texto", "formulário", "entrada", "input"],
    usage:
      "Sempre associe um `<label>` ao campo (não confie só no placeholder). Use o `type` correto (`email`, `password`, `number`) para teclado e validação nativos, e comunique erros com texto descritivo além da cor. Mantenha a largura proporcional ao conteúdo esperado.",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "Forms",
    description:
      "Caixa de seleção para opções booleanas, com estados marcado e indeterminado.",
    tags: ["caixa", "seleção", "formulário", "booleano", "marcar"],
    usage:
      "Use para opções independentes que podem ser marcadas em conjunto (múltipla escolha). Para escolha única e mutuamente exclusiva, prefira radio buttons; para ligar/desligar um estado com efeito imediato, prefira um switch. Sempre rotule o checkbox e torne o rótulo clicável.",
  },
  {
    slug: "badge",
    name: "Badge",
    category: "Feedback",
    description:
      "Etiqueta compacta para destacar status, contagens ou rótulos contextuais.",
    tags: ["etiqueta", "status", "rótulo", "tag", "destaque"],
    usage:
      "Use para rótulos curtos de status, contagem ou categoria — não para ações (badge não é botão). Padronize as cores por significado (ex.: sucesso, atenção, erro) e mantenha o texto em poucas palavras. Não comunique estado apenas por cor; inclua texto legível.",
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
    usage:
      "Ideal para representar hierarquias de arquivos/diretórios com expandir-recolher, busca e navegação por teclado. Forneça uma altura definida ao contêiner (o componente virtualiza a lista) e use a busca quando a árvore tiver muitos nós. Para listas planas, prefira uma lista simples.",
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

  // Lote shadcn
  {
    slug: "accordion",
    name: "Accordion",
    category: "Layout",
    description:
      "Grupo de itens expansíveis com animação de abertura/fechamento. Baseado em @radix-ui/react-accordion.",
    tags: ["accordion", "acordeão", "expansível", "collapse", "shadcn"],
  },
  {
    slug: "alert",
    name: "Alert",
    category: "Feedback",
    description:
      "Mensagem de destaque para informar, avisar ou comunicar erros. Variantes default e destrutiva.",
    tags: ["alert", "aviso", "mensagem", "erro", "destaque", "shadcn"],
  },
  {
    slug: "alert-dialog",
    name: "Alert Dialog",
    category: "Feedback",
    description:
      "Diálogo modal de confirmação para ações destrutivas. Baseado em @radix-ui/react-alert-dialog.",
    tags: ["alert", "dialog", "modal", "confirmação", "destrutivo", "shadcn"],
  },
  {
    slug: "aspect-ratio",
    name: "Aspect Ratio",
    category: "Layout",
    description:
      "Container que mantém proporção fixa (16:9, 4:3, 1:1, etc.) para imagens e mídia. Baseado em @radix-ui/react-aspect-ratio.",
    tags: ["aspect", "ratio", "proporção", "imagem", "container", "shadcn"],
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "Feedback",
    description:
      "Imagem de perfil com fallback automático (iniciais). Baseado em @radix-ui/react-avatar.",
    tags: ["avatar", "perfil", "imagem", "fallback", "usuário", "shadcn"],
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    category: "Layout",
    description:
      "Trilha de navegação hierárquica com links, separadores e suporte a ellipsis com dropdown.",
    tags: ["breadcrumb", "navegação", "trilha", "hierarquia", "caminho", "shadcn"],
  },
  {
    slug: "sonner",
    name: "Sonner",
    category: "Feedback",
    description:
      "Toast/notificação elegante e minimalista com suporte a ações, promises e posicionamento configurável. Baseada em sonner.",
    tags: ["toast", "notificação", "feedback", "sonner", "mensagem", "shadcn"],
  },
  {
    slug: "separator",
    name: "Separator",
    category: "Layout",
    description:
      "Divisor visual horizontal ou vertical para separar conteúdo. Baseado em @radix-ui/react-separator.",
    tags: ["separator", "divisor", "linha", "separador", "shadcn"],
  },

  // Lote chanhdai
  {
    slug: "resizable",
    name: "Resizable",
    category: "Layout",
    description:
      "Painéis redimensionáveis via arraste, com suporte a direção horizontal e vertical, múltiplos painéis e handle visual. Baseado em react-resizable-panels.",
    tags: ["resizable", "painéis", "redimensionar", "drag", "layout", "shadcn"],
  },
  {
    slug: "calendar",
    name: "Calendar",
    category: "Forms",
    description:
      "Componente de calendário com seleção de data única, múltipla ou intervalo. Baseado em react-day-picker.",
    tags: ["calendar", "calendário", "data", "date", "seleção", "shadcn"],
  },
  {
    slug: "date-picker",
    name: "Date Picker",
    category: "Forms",
    description:
      "Seletor de data com popover e calendário integrado. Exibe a data formatada e abre o calendário ao clicar.",
    tags: ["date-picker", "data", "calendário", "seleção", "popover", "shadcn"],
  },
  {
    slug: "switch",
    name: "Switch",
    category: "Forms",
    description:
      "Controle de alternância ligar/desligar para configurações e preferências. Baseado em @radix-ui/react-switch.",
    tags: ["switch", "toggle", "alternar", "formulário", "controle", "shadcn"],
  },
  {
    slug: "form",
    name: "Form",
    category: "Forms",
    description:
      "Formulário com integração react-hook-form e zod, composável com FormField, FormItem, FormLabel, FormControl, FormDescription e FormMessage. Baseado em @radix-ui/react-slot e @radix-ui/react-label.",
    tags: ["form", "formulário", "validação", "zod", "react-hook-form", "shadcn"],
  },
  {
    slug: "navigation-menu",
    name: "Navigation Menu",
    category: "Actions",
    description:
      "Menu de navegação horizontal com dropdowns de conteúdo rico, viewport animado e indicador de posição. Baseado em @radix-ui/react-navigation-menu.",
    tags: ["navigation", "menu", "navbar", "dropdown", "radix", "shadcn"],
  },
  {
    slug: "popover",
    name: "Popover",
    category: "Actions",
    description:
      "Painel flutuante ancorado a um gatilho, com alinhamento configurável. Baseado em @radix-ui/react-popover.",
    tags: ["popover", "tooltip", "overlay", "radix", "shadcn"],
  },
  {
    slug: "toast",
    name: "Toast",
    category: "Feedback",
    description:
      "Notificação temporária e não-bloqueante para confirmar ações, exibir alertas ou comunicar estados do sistema. Baseado em @radix-ui/react-toast.",
    tags: ["toast", "notificação", "feedback", "alerta", "mensagem", "shadcn"],
  },
  {
    slug: "slider",
    name: "Slider",
    category: "Forms",
    description:
      "Controle deslizante para selecionar um valor ou intervalo. Suporta um ou múltiplos thumbs, steps e estado desabilitado. Baseado em @radix-ui/react-slider.",
    tags: ["slider", "range", "intervalo", "controle", "formulário", "shadcn"],
  },
  {
    slug: "radio-group",
    name: "Radio Group",
    category: "Forms",
    description:
      "Grupo de opções mutuamente exclusivas com navegação por teclado. Baseado em @radix-ui/react-radio-group.",
    tags: ["radio", "seleção", "formulário", "radix", "shadcn"],
  },
  {
    slug: "scroll-area",
    name: "Scroll Area",
    category: "Layout",
    description:
      "Área de rolagem customizada com scrollbar estilizado. Baseado em @radix-ui/react-scroll-area.",
    tags: ["scroll", "area", "rolagem", "scrollbar", "shadcn"],
  },
  {
    slug: "collapsible",
    name: "Collapsible",
    category: "Layout",
    description:
      "Contêiner expansível/recolhível com animação de abertura/fechamento. Baseado em @radix-ui/react-collapsible.",
    tags: ["collapsible", "expansível", "collapse", "toggle", "shadcn"],
  },
  {
    slug: "toggle",
    name: "Toggle",
    category: "Actions",
    description:
      "Botão de alternância com estados ligado/desligado, variantes de estilo e tamanho. Baseado em @radix-ui/react-toggle.",
    tags: ["toggle", "alternar", "switch", "botão", "estado", "shadcn"],
  },
  {
    slug: "command",
    name: "Command",
    category: "Actions",
    description:
      "Palette de comandos estilo Spotlight/Alfred com busca, agrupamento, atalhos de teclado e suporte a dialog. Baseado em cmdk.",
    tags: ["command", "palette", "busca", "spotlight", "atalho", "shadcn"],
  },
  {
    slug: "menubar",
    name: "Menubar",
    category: "Actions",
    description:
      "Barra de menu horizontal com menus dropdown, submenus, checkboxes, radio groups e atalhos de teclado. Baseado em @radix-ui/react-menubar.",
    tags: ["menubar", "menu", "barra", "dropdown", "submenu", "atalho", "shadcn"],
  },
  {
    slug: "data-table",
    name: "Data Table",
    category: "Layout",
    description:
      "Tabela de dados avançada com ordenação, paginação e busca global. Baseada em @tanstack/react-table.",
    tags: ["table", "tabela", "dados", "paginação", "ordenação", "filtro", "shadcn"],
  },
  {
    slug: "textarea",
    name: "Textarea",
    category: "Forms",
    description:
      "Campo de texto multiline para entrada de conteúdo longo como descrições, mensagens e comentários.",
    tags: ["textarea", "campo", "texto", "formulário", "multiline", "shadcn"],
  },
  {
    slug: "select",
    name: "Select",
    category: "Forms",
    description:
      "Seletor de opções com trigger, conteúdo em portal, grupos, separadores e suporte a scroll. Baseado em @radix-ui/react-select.",
    tags: ["select", "seletor", "dropdown", "opções", "formulário", "shadcn"],
  },
  {
    slug: "progress",
    name: "Progress",
    category: "Feedback",
    description:
      "Barra de progresso para indicar conclusão de uma tarefa ou etapa. Baseado em @radix-ui/react-progress.",
    tags: ["progress", "barra", "progresso", "indicador", "loading", "shadcn"],
  },
  {
    slug: "table",
    name: "Table",
    category: "Layout",
    description:
      "Semantic HTML table with header, body, footer, rows, cells, and caption — styled with Tailwind and adaptive to light/dark.",
    tags: ["table", "tabela", "dados", "linhas", "colunas", "shadcn"],
  },
  {
    slug: "pagination",
    name: "Pagination",
    category: "Layout",
    description:
      "Controles de paginação com links de página, navegação anterior/próxima e ellipsis para intervalos ocultos.",
    tags: ["pagination", "paginação", "páginas", "navegação", "shadcn"],
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    category: "Feedback",
    description:
      "Placeholder animado com pulse para indicar carregamento de conteúdo. Classes utilitárias customizáveis.",
    tags: ["skeleton", "loading", "placeholder", "pulse", "shadcn"],
  },
  {
    slug: "input-otp",
    name: "Input OTP",
    category: "Forms",
    description:
      "Campo de entrada de código OTP (One-Time Password) com slots visuais, separador e suporte a teclado. Baseado em input-otp.",
    tags: ["otp", "código", "verificação", "2fa", "formulário", "shadcn"],
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
  {
    slug: "carousel",
    name: "Carousel",
    category: "Layout",
    description:
      "Carrossel de conteúdo com scroll horizontal, controles anterior/próximo e suporte a teclado. Baseado em embla-carousel-react.",
    tags: ["carousel", "slider", "carrossel", "swipe", "shadcn"],
  },

  // Lote VengenceUI
  {
    slug: "animated-number",
    name: "Animated Number",
    category: "Feedback",
    description:
      "Número slot-machine (dígitos rolando 0–9) + placar com feedback de cor (verde sobe, vermelho desce) e bounce.",
    tags: ["number", "counter", "animation", "score", "slot-machine", "vengenceui"],
  },
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
    slug: "flip-fade-text",
    name: "Flip Fade Text",
    category: "Feedback",
    description:
      "Texto 3D flip animado por letra, ciclando por palavras com stagger configurável. Ideal para loading states e hero sections.",
    tags: ["flip", "3d", "animação", "texto", "efeito", "loading", "hero", "vengenceui"],
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
  {
    slug: "light-lines",
    name: "Light Lines",
    category: "Feedback",
    description:
      "Background animado de \"light trails\" em linhas verticais: SVG com 17 luzes que sobem/descem em loop infinito via requestAnimationFrame, sobre linhas estáticas e gradiente configurável.",
    tags: ["background", "animation", "svg", "hero", "lights", "vengenceui"],
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
    slug: "hover-card",
    name: "Hover Card",
    category: "Feedback",
    description:
      "Card flutuante com conteúdo rico que aparece ao passar o mouse sobre um gatilho. Baseado em @radix-ui/react-hover-card.",
    tags: ["hover", "card", "preview", "popover", "tooltip", "shadcn"],
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
  {
    slug: "logo-slider",
    name: "Logo Slider",
    category: "Layout",
    description:
      "Marquee infinito de logos (CSS puro) com loop sem emenda e blur progressivo nas bordas; configurável por direção, velocidade e pause-on-hover.",
    tags: ["marquee", "logos", "slider", "infinite", "blur", "vengenceui"],
  },
  // Lote Aceternity
  {
    slug: "sidebar",
    name: "Sidebar",
    category: "Layout",
    description:
      "Barra lateral que recolhe para 60px e expande para 300px ao passar o mouse (motion/react), com rótulos que aparecem/desaparecem suavemente. No mobile vira um drawer em tela cheia. Suporta estado controlado e modo sempre-expandido (animate=false).",
    tags: [
      "sidebar",
      "navegação",
      "menu",
      "drawer",
      "collapse",
      "responsivo",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "team-section-with-scales",
    name: "Team Section with Scales",
    category: "Layout",
    description:
      "Seção de equipe com cabeçalho (eyebrow + título + descrição) e grade responsiva de cards de membros sobre o pattern decorativo Scales (linhas via CSS, reativo ao tema). Cada card traz avatar, nome, cargo, bio e links sociais opcionais, com realce no hover (motion/react).",
    tags: [
      "team",
      "equipe",
      "section",
      "scales",
      "grid",
      "cards",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "stateful-button",
    name: "Stateful Button",
    category: "Actions",
    description:
      "Botão com feedback de estado: ao clicar dispara um spinner de loading (motion/react) enquanto o handler assíncrono resolve e exibe um check de sucesso ao concluir. Animações de layout suaves e cor/tamanho customizáveis via className.",
    tags: [
      "button",
      "stateful",
      "loading",
      "success",
      "spinner",
      "async",
      "aceternity",
      "actions",
    ],
  },
  {
    slug: "images-slider",
    name: "Images Slider",
    category: "Layout",
    description:
      "Slider de imagens em tela cheia com autoplay (5s), navegação por teclado (← →) e transição 3D (escala + rotateX + saída deslizante para cima/baixo). Suporta overlay escuro e conteúdo sobreposto centralizado via children.",
    tags: [
      "slider",
      "carousel",
      "imagens",
      "hero",
      "autoplay",
      "motion",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "floating-dock",
    name: "Floating Dock",
    category: "Actions",
    description:
      "Dock de navegação estilo macOS com magnificação dos ícones conforme a proximidade do cursor (motion useTransform + useSpring). Responsivo: barra horizontal no desktop (md+) e botão flutuante expansível no mobile, com tooltip por item.",
    tags: [
      "dock",
      "navbar",
      "macos",
      "magnify",
      "hover",
      "navigation",
      "aceternity",
      "actions",
    ],
  },
  {
    slug: "floating-navbar",
    name: "Floating Navbar",
    category: "Actions",
    description:
      "Navbar pill flutuante (rounded-full) que aparece ao rolar para cima e some ao rolar para baixo. Animação de entrada/saída via motion (translateY + opacity) controlada por useScroll/useMotionValueEvent. Itens com ícone (mobile) ou rótulo (desktop) + botão de CTA opcional. Aceita scrollContainer próprio.",
    tags: [
      "navbar",
      "floating",
      "scroll",
      "pill",
      "sticky",
      "motion",
      "aceternity",
      "actions",
    ],
  },
  {
    slug: "following-pointer",
    name: "Following Pointer",
    category: "Feedback",
    description:
      "Substitui o cursor nativo por um ponteiro animado (motion/react) que segue o mouse dentro da área, com um badge configurável (título/avatar) ao lado. Ótimo para destacar cards de blog ou conteúdo interativo.",
    tags: [
      "pointer",
      "cursor",
      "follow",
      "mouse",
      "hover",
      "motion",
      "aceternity",
      "feedback",
    ],
  },
  {
    slug: "resizable-navbar",
    name: "Resizable Navbar",
    category: "Actions",
    description:
      "Barra de navegação que encolhe ao rolar a página (motion/react + useScroll): ganha blur, sombra e reduz a largura. Inclui variante desktop e menu mobile colapsável com toggle animado.",
    tags: [
      "navbar",
      "navigation",
      "resizable",
      "scroll",
      "sticky",
      "mobile",
      "menu",
      "aceternity",
    ],
  },
  {
    slug: "features-section-with-skeletons",
    name: "Features Section with Skeletons",
    category: "Layout",
    description:
      "Seção de features em grade bento responsiva (lg:grid-cols-6) com cards que exibem skeletons animados (motion/react) como preview — grade de imagens com hover, barras de analytics e anel pulsante. Cabeçalho e features configuráveis via props.",
    tags: [
      "features",
      "bento",
      "grid",
      "skeleton",
      "seção",
      "landing",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "encrypted-text",
    name: "Encrypted Text",
    category: "Feedback",
    description:
      "Texto que entra como ruído aleatório e é descriptografado caractere a caractere quando aparece no viewport. Charset, velocidade de revelação e de flip configuráveis, com classes separadas para os estados embaralhado e revelado.",
    tags: ["encrypted", "decrypt", "scramble", "text", "reveal", "terminal", "hacker", "motion"],
  },
  {
    slug: "container-cover",
    name: "Container Cover",
    category: "Feedback",
    description:
      "Destaque animado para texto inline: ao passar o mouse, o fundo escurece, partículas (sparkles) percorrem a área, beams horizontais varrem o bloco e o texto treme e encolhe levemente. Ideal para realçar palavras em headlines.",
    tags: [
      "cover",
      "highlight",
      "text",
      "sparkles",
      "beam",
      "hover",
      "aceternity",
      "feedback",
    ],
  },
  {
    slug: "navbar-menu",
    name: "Navbar Menu",
    category: "Layout",
    description:
      "Navbar pill (rounded-full) com menu hover-dropdown fullscreen-blur. Hover num item (MenuItem) abre card dropdown com backdrop-blur-sm rounded-2xl border shadow-xl. Itens internos: ProductItem (img + título + descrição) e HoveredLink (link simples).",
    tags: [
      "navbar",
      "menu",
      "dropdown",
      "hover",
      "blur",
      "pill",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "compare",
    name: "Compare",
    category: "Layout",
    description:
      "Slider de comparação de 2 imagens com handle arrastável. Suporta modo hover (segue o mouse) e drag (arrastar explícito), com animação de autoplay opcional. Usa clip-path para recorte e requestAnimationFrame para movimento suave.",
    tags: [
      "compare",
      "slider",
      "before-after",
      "drag",
      "hover",
      "image",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "focus-cards",
    name: "Focus Cards",
    category: "Layout",
    description:
      "Grid de cards de imagem com efeito de foco reverso: ao passar o mouse sobre um card, os demais ganham blur leve e scale reduzido, destacando o item hovered. Cada card exibe uma imagem com overlay escuro e título em gradiente claro. Sem dependências externas — transições CSS puras com transition-all.",
    tags: [
      "cards",
      "grid",
      "focus",
      "hover",
      "blur",
      "image",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "3d-globe",
    name: "3D Globe",
    category: "Feedback",
    description:
      "Globo terrestre 3D que rotaciona automaticamente, reimplementado com a lib leve cobe (~5kb) sobre WebGL — sem texturas ou imagens remotas. Os pontos do mapa e os markers são desenhados por shader. Cores dark fixas (globo escuro + markers ciano) são a assinatura visual do efeito (estilo Aceternity), então não seguem o tema shadcn. Faz cleanup do contexto WebGL (globe.destroy() + cancelAnimationFrame) ao desmontar.",
    tags: ["3d", "globe", "webgl", "cobe", "map", "aceternity", "feedback"],
  },
  {
    slug: "github-globe",
    name: "GitHub Globe",
    category: "Feedback",
    description:
      "Globo 3D interativo estilo GitHub (Aceternity UI) renderizado com three + three-globe sobre WebGL: continentes em hex-polígonos, arcos animados (com dash + gap) entre pares de coordenadas, anéis pulsantes nos pontos de origem e rotação automática via OrbitControls. Cores dark hardcoded (fundo preto, globo azul-marinho, atmosfera) — brand do efeito, não segue tema shadcn. Faz cleanup completo do contexto WebGL (dispose de geometrias/materiais/renderer, cancelAnimationFrame) ao desmontar.",
    tags: [
      "globe",
      "3d",
      "three",
      "webgl",
      "arcs",
      "map",
      "aceternity",
      "feedback",
    ],
    usage:
      "Use `GitHubGlobe` em hero sections ou seções de 'alcance global'. Sem props, renderiza um conjunto demonstrativo de arcos entre cidades. Passe `arcs` (array de `{ order, startLat, startLng, endLat, endLng, arcColor }`) para definir suas próprias rotas e `globeConfig` para ajustar paleta (globeColor, emissive, atmosphereColor), rotação (autoRotate, autoRotateSpeed) e timing dos arcos/anéis. O wrapper impõe `h-[28rem]` e fundo preto — ajuste a altura via `className`. É pesado (three.js + WebGL); use uma instância por viewport.",
  },
  {
    slug: "google-gemini-effect",
    name: "Google Gemini Effect",
    category: "Feedback",
    description:
      "Cinco curvas SVG onduladas e coloridas (rosa, laranja, azul-claro, azul e azul-forte) que se desenham progressivamente via pathLength conforme o scroll, com cópias borradas (Gaussian blur) por baixo formando um glow. Os MotionValue do pathLength vêm de useScroll + useTransform na área scrollável, inspirado na animação de aterrissagem do Google Gemini.",
    tags: [
      "gemini",
      "google",
      "scroll",
      "svg",
      "path",
      "motion",
      "effect",
      "aceternity",
    ],
  },
  {
    slug: "pixelated-canvas",
    name: "Pixelated Canvas",
    category: "Feedback",
    description:
      "Renderiza uma imagem como uma malha de pixels (quadrados ou círculos) sobre canvas 2D, com amostragem por célula, dropout em regiões de baixo contraste, tint, grayscale e object-fit. No modo interativo, os pixels se distorcem ao redor do cursor (repel/attract/swirl) com jitter e fade suave ao sair, tudo via requestAnimationFrame com limpeza de listeners e rAF.",
    tags: [
      "pixelated",
      "canvas",
      "image",
      "interactive",
      "distortion",
      "aceternity",
    ],
  },
  {
    slug: "timeline",
    name: "Timeline",
    category: "Layout",
    description:
      "Linha do tempo vertical da Aceternity UI com uma barra de progresso que cresce (gradiente roxo→azul) conforme a rolagem, dirigida por motion useScroll. Cada entrada tem um marco com título (data) e conteúdo arbitrário; sticky labels no desktop. Cabeçalho e descrição configuráveis.",
    tags: ["timeline", "scroll", "progress", "changelog", "layout", "aceternity"],
  },
  {
    slug: "terminal",
    name: "Terminal",
    category: "Feedback",
    description:
      "Mock de terminal/console da Aceternity UI que datilografa comandos linha a linha com cursor piscante, syntax highlight de bash (comandos, flags, strings, paths) e saídas opcionais por comando. Anima ao entrar na viewport; velocidade, usuário e atrasos configuráveis.",
    tags: ["terminal", "console", "typewriter", "cli", "bash", "aceternity"],
  },
  {
    slug: "parallax-hero-images-2",
    name: "Parallax Hero Images 2",
    category: "Layout",
    description:
      "Variante 2 (scroll-driven) do parallax hero da Aceternity UI: imagens distribuídas em 3 colunas que deslizam verticalmente conforme a rolagem avança (laterais sobem, meio desce, com leve zoom-out), criando profundidade. Aceita uma área scrollável própria via scrollRef para hero sections com conteúdo sobreposto.",
    tags: ["hero", "parallax", "scroll", "images", "layout", "aceternity"],
  },
  {
    slug: "tracing-beam",
    name: "Tracing Beam",
    category: "Layout",
    description:
      "Feixe luminoso da Aceternity UI que acompanha a rolagem ao lado do conteúdo: um caminho SVG preenchido por um gradiente (ciano → violeta) cujo progresso evolui com o scroll, dirigido por motion (useScroll + useSpring). Ideal para artigos longos e landing pages narrativas; envolve qualquer conteúdo e mede sua altura automaticamente.",
    tags: ["tracing", "beam", "scroll", "gradient", "layout", "aceternity"],
  },
  {
    slug: "parallax-scroll",
    name: "Parallax Scroll",
    category: "Layout",
    description:
      "Galeria de imagens da Aceternity UI em 3 colunas que se movem em velocidades e direções diferentes conforme o scroll da própria área (altura fixa, overflow-y-auto): as laterais sobem e a do meio desce, criando profundidade. Usa useScroll/useTransform da motion.",
    tags: ["parallax", "scroll", "gallery", "images", "grid", "aceternity"],
  },
  {
    slug: "noise-background",
    name: "Noise Background",
    category: "Feedback",
    description:
      "Fundo da Aceternity UI com camadas de gradiente radial que flutuam aleatoriamente em loop, sobrepostas por uma textura de ruído sutil (mix-blend overlay) e uma faixa de luz no topo. Cores, intensidade do ruído e velocidade configuráveis; envolve qualquer conteúdo.",
    tags: ["noise", "background", "gradient", "grain", "texture", "aceternity"],
  },
  {
    slug: "hero-section-with-mousemove",
    name: "Hero Section with Mousemove",
    category: "Layout",
    description:
      "Hero imersivo da Aceternity UI com elementos flutuantes que reagem ao movimento do mouse: cada cartão se desloca em parallax proporcional à sua profundidade (depth), sobre um fundo escuro com grade e brilho radial. Título, descrição e itens são configuráveis.",
    tags: ["hero", "mousemove", "parallax", "interactive", "layout", "aceternity"],
  },
  {
    slug: "background-gradient",
    name: "Background Gradient",
    category: "Feedback",
    description:
      "Borda em gradiente radial multicolor (verde/violeta/amarelo/azul) animada em loop suave que intensifica o brilho no hover, ideal para destacar cards e botões. Reimplementado padronizado shadcn com motion/react.",
    tags: [
      "background",
      "gradient",
      "border",
      "card",
      "hover",
      "aceternity",
    ],
    usage:
      "Envolva qualquer conteúdo em <BackgroundGradient className=\"rounded-[22px] bg-white p-4\"> para ganhar a borda em gradiente animado.",
  },
  {
    slug: "glowing-effect",
    name: "Glowing Effect",
    category: "Feedback",
    description:
      "Borda luminosa que segue o cursor: gradiente cônico rotacionado em torno do card via máscara, atualizado por pointermove e interpolado com easing do motion.",
    tags: [
      "glow",
      "border",
      "cursor",
      "conic-gradient",
      "mask",
      "aceternity",
      "feedback",
    ],
    usage:
      "Posicione <GlowingEffect> dentro de um card (precisa de relative + rounded-[inherit] para a máscara acompanhar o formato) e ative-o passando disabled={false} para o ponteiro ser rastreado.",
  },
  {
    slug: "hero-highlight",
    name: "Hero Highlight",
    category: "Layout",
    description:
      "Seção hero com fundo de pontos que revela um realce indigo seguindo o cursor (radial mask) e texto destacado com fundo gradiente animado.",
    tags: [
      "hero",
      "highlight",
      "spotlight",
      "mask",
      "mouse",
      "gradient",
      "aceternity",
    ],
    usage:
      "Envolva o conteúdo do hero em <HeroHighlight> e use <HeroHighlightText> para destacar trechos do título com o gradiente animado.",
  },
  {
    slug: "shooting-stars-and-stars-background",
    name: "Shooting Stars and Stars Background",
    category: "Feedback",
    description:
      "Céu noturno da Aceternity UI em duas camadas: StarsBackground desenha estrelas estáticas cintilando em <canvas> (densidade e velocidade de twinkle configuráveis) e ShootingStars dispara estrelas cadentes em <svg> que atravessam a tela em ângulos aleatórios, com gradiente de cauda configurável. Animado via requestAnimationFrame com cleanup. Fundo escuro fixo (brand do efeito).",
    tags: [
      "background",
      "stars",
      "shooting",
      "canvas",
      "svg",
      "hero",
      "aceternity",
    ],
  },
  {
    slug: "typewriter-effect",
    name: "Typewriter Effect",
    category: "Feedback",
    description:
      "Efeito de datilografia da Aceternity UI em duas variantes: TypewriterEffect revela cada caractere com stagger de 0.1s quando entra na viewport; TypewriterEffectSmooth (máquina de escrever) anima a largura do container de 0% até fit-content em 2s. Cursor (token --primary do shadcn) pisca em loop infinito em ambas. Ideal para títulos de hero, slogans e CTAs animados.",
    tags: [
      "typewriter",
      "datilografia",
      "texto",
      "animação",
      "cursor",
      "hero",
      "aceternity",
    ],
    usage:
      "Use <TypewriterEffect words={[{text:'Crie'}, {text:'experiências', className:'text-primary'}]}/> para títulos animados ou <TypewriterEffectSmooth> para frases de impacto com largura animada.",
  },
  {
    slug: "grid-and-dot-backgrounds",
    name: "Grid and Dot Backgrounds",
    category: "Layout",
    description:
      "Fundos decorativos da Aceternity UI em CSS puro: malha de linhas (grid / grid-small) ou pontos (dot) desenhados via background-image (linear/radial-gradient) com máscara radial que esmaece nas bordas. Wrapper relative com altura própria e conteúdo sobreposto; cores derivam dos tokens shadcn, adaptando a light/dark.",
    tags: ["background", "grid", "dot", "pattern", "hero", "aceternity"],
  },
  {
    slug: "meteors",
    name: "Meteors",
    category: "Feedback",
    description:
      "Efeito de fundo da Aceternity UI: uma chuva de meteoros diagonais que cruzam a tela em loop, cada um com atraso e duração aleatórios. Fica atrás do conteúdo (card/hero) para dar movimento sutil. Quantidade configurável via prop number.",
    tags: ["meteors", "background", "animation", "stars", "hero", "aceternity"],
  },
  {
    slug: "spotlight",
    name: "Spotlight",
    category: "Feedback",
    description:
      "Efeito de holofote da Aceternity UI: um SVG com elipse desfocada que simula um facho de luz vindo de um canto, com fade-in suave (animate-spotlight). Posicionado de forma absoluta dentro de um container relative de fundo escuro, atrás do conteúdo. Cor configurável via prop fill.",
    tags: ["spotlight", "light", "glow", "hero", "background", "aceternity"],
  },
  {
    slug: "spotlight-new",
    name: "Spotlight New",
    category: "Feedback",
    description:
      "Versão nova do spotlight da Aceternity UI: dois feixes de luz (radial-gradient) que balançam em loop suave sobre um fundo escuro, ideal para destacar um hero. Cores, amplitude e velocidade configuráveis.",
    tags: ["spotlight", "light", "beam", "hero", "background", "aceternity"],
  },
  {
    slug: "expandable-cards",
    name: "Expandable Cards",
    category: "Layout",
    description:
      "Lista de cards da Aceternity UI que expandem para um modal centralizado fullscreen via shared layout (layoutId/motion). Overlay com blur, fecha com Escape ou clique fora, e trava o scroll do body enquanto aberto.",
    tags: ["card", "expand", "modal", "layout", "animation", "aceternity"],
  },
  {
    slug: "3d-card-effect",
    name: "3D Card Effect",
    category: "Layout",
    description:
      "Card que inclina seguindo o cursor com elementos internos flutuando em profundidades distintas (perspectiva 3D real).",
    tags: ["card", "3d", "perspective", "hover", "tilt", "aceternity"],
  },
  {
    slug: "card-stack",
    name: "Card Stack",
    category: "Layout",
    description:
      "Pilha de cards de testimonials da Aceternity UI que rotaciona automaticamente: a cada ~5s o card do topo vai pro fundo. Empilhamento com offset vertical e escala decrescente por profundidade, animado com motion. Inclui o helper Highlight pra destacar trechos em emerald.",
    tags: ["card", "stack", "testimonials", "carousel", "animation", "aceternity"],
  },
  {
    slug: "background-lines",
    name: "Background Lines",
    category: "Feedback",
    description:
      "Efeito de fundo da Aceternity UI: SVG com múltiplos paths curvos coloridos que animam em padrão de onda (wave) em loop, atrás do conteúdo. Inspirado no height.app; fundo transparente que adapta ao tema.",
    tags: ["background", "lines", "svg", "wave", "hero", "aceternity"],
  },
  {
    slug: "svg-mask-effect",
    name: "SVG Mask Effect",
    category: "Feedback",
    description:
      "Efeito de revelação da Aceternity UI: o texto base fica escondido por uma camada; ao mover o mouse, uma máscara circular segue o cursor e revela o conteúdo por baixo, crescendo no hover. Funciona em light e dark.",
    tags: ["mask", "reveal", "hover", "cursor", "effect", "aceternity"],
  },
  {
    slug: "background-beams-with-collision",
    name: "Background Beams With Collision",
    category: "Feedback",
    description:
      "Efeito de fundo da Aceternity UI: feixes verticais coloridos caem do topo e explodem em partículas ao colidir com a base. Detecção de colisão via getBoundingClientRect; fundo adapta ao tema.",
    tags: ["background", "beams", "collision", "explosion", "hero", "aceternity"],
  },
  {
    slug: "background-ripple-effect",
    name: "Background Ripple Effect",
    category: "Feedback",
    description:
      "Grade de células quadradas da Aceternity UI: ao clicar numa célula, um ripple (onda de opacidade) se propaga pelas vizinhas com delay proporcional à distância. Cores reativas ao tema.",
    tags: ["background", "ripple", "grid", "interactive", "click", "aceternity"],
  },
  {
    slug: "images-badge",
    name: "Images Badge",
    category: "Feedback",
    description:
      "Badge da Aceternity UI com ícone de pasta + texto; no hover, até 3 imagens saem da pasta num leque animado (fan-out via translate/spread/rotation) usando motion.",
    tags: ["badge", "images", "hover", "fan", "gallery", "aceternity"],
  },
  {
    slug: "parallax-hero-images",
    name: "Parallax Hero Images",
    category: "Layout",
    description:
      "Hero com imagens em profundidades distintas que transladam em parallax ao mover o mouse; entrada com fade-in + blur. Variante default vs edge-focus muda o mapa de profundidade.",
    tags: ["parallax", "hero", "images", "mouse", "depth", "aceternity"],
  },
  {
    slug: "scales",
    name: "Scales",
    category: "Layout",
    description:
      "Background decorativo da Aceternity UI: pattern de linhas repetidas via CSS puro, com orientação (horizontal/vertical/diagonal), densidade e cor configuráveis. ScalesContainer posiciona o pattern atrás do conteúdo.",
    tags: ["background", "pattern", "lines", "diagonal", "decorative", "aceternity"],
  },
  {
    slug: "sparkles",
    name: "Sparkles",
    category: "Feedback",
    description:
      "Campo de partículas brancas cintilantes (twinkle + leve drift) em canvas puro, reimplementado a partir do SparklesCore da Aceternity UI. Ideal como background de hero ou efeito standalone.",
    tags: ["sparkles", "particles", "background", "hero", "canvas", "aceternity"],
  },
  {
    slug: "dotted-glow-background",
    name: "Dotted Glow Background",
    category: "Feedback",
    description:
      "Fundo em canvas da Aceternity UI: grade de pontos que pulsam (alpha animado) com efeito glow, via requestAnimationFrame. Cores reativas ao tema (light/dark) por CSS variables, alta densidade (devicePixelRatio) e ResizeObserver.",
    tags: ["background", "dots", "glow", "animation", "canvas", "aceternity"],
  },
  {
    slug: "background-boxes",
    name: "Background Boxes",
    category: "Feedback",
    description:
      "Grid de células da Aceternity UI sobre fundo escuro; ao passar o mouse, cada célula acende com uma cor de highlight aleatória. Container com perspectiva isométrica (skew/translate/scale) e ícones \"+\" esparsos, via motion.",
    tags: ["background", "boxes", "grid", "hover", "highlight", "aceternity"],
  },
  {
    slug: "wavy-background",
    name: "Wavy Background",
    category: "Feedback",
    description:
      "Ondas coloridas suaves animadas em canvas atrás de um conteúdo (hero escuro), com movimento orgânico gerado por simplex noise 3D reimplementado inline (zero dependência externa).",
    tags: ["background", "waves", "canvas", "hero", "animation", "aceternity"],
  },
  {
    slug: "background-beams",
    name: "Background Beams",
    category: "Feedback",
    description:
      "Feixes de luz (\"beams\") da Aceternity UI que seguem dezenas de paths SVG curvos animados via linearGradients em movimento (x1/y1/x2/y2 percorrendo o caminho), sobre fundo escuro. Ideal como background de hero.",
    tags: ["background", "beams", "svg", "hero", "animation", "aceternity"],
  },
  {
    slug: "vortex",
    name: "Vortex",
    category: "Feedback",
    description:
      "Fundo de partículas em redemoinho (swirl) animado em canvas via simplex noise 3D, com glow aditivo e CTA sobreposto. Cor, contagem de partículas, amplitude e velocidade configuráveis; fundo escuro fixo (brand do efeito).",
    tags: ["background", "vortex", "particles", "swirl", "canvas", "aceternity"],
  },
  {
    slug: "tooltip-card",
    name: "Tooltip Card",
    category: "Feedback",
    description:
      "Tooltip da Aceternity UI que aparece no hover e SEGUE o cursor (motion/react com AnimatePresence + spring). O conteúdo pode ser texto simples ou um card React rico (avatar, nome, bio); posição calculada a partir do mouse com clamp nas bordas do viewport.",
    tags: ["tooltip", "card", "hover", "cursor", "follow", "aceternity"],
  },
  {
    slug: "card-hover-effect",
    name: "Card Hover Effect",
    category: "Layout",
    description:
      "Grid de cards da Aceternity UI onde, ao passar o mouse, um fundo destacado desliza suavemente entre os cards via motion (AnimatePresence + layoutId compartilhado). Funciona em light e dark.",
    tags: ["card", "hover", "grid", "slide", "layout", "aceternity"],
  },
  {
    slug: "container-scroll-animation",
    name: "Container Scroll Animation",
    category: "Layout",
    description:
      "Efeito de scroll 3D da Aceternity UI: conforme o usuário rola, um card/mockup rotaciona (rotateX), escala e o título translada para cima. Dirigido por useScroll/useTransform (motion/react); detecção de mobile ajusta a escala. Funciona em light e dark.",
    tags: ["scroll", "animation", "3d", "hero", "parallax", "aceternity"],
  },
  {
    slug: "hero-parallax",
    name: "Hero Parallax",
    category: "Layout",
    description:
      "Hero da Aceternity UI: header (título + descrição) sobre 3 fileiras de 5 thumbnails de produtos que transladam horizontalmente em direções opostas conforme o scroll, com o conjunto rotacionando (rotateX/rotateZ), transladando e esmaecendo — suavizado por springs (useScroll/useTransform/useSpring de motion/react).",
    tags: ["hero", "parallax", "scroll", "products", "grid", "aceternity"],
  },
  {
    slug: "text-hover-effect",
    name: "Text Hover Effect",
    category: "Feedback",
    description:
      "SVG com texto em stroke que, ao passar o mouse, ganha um realce gradiente multicolor (amarelo/vermelho/azul/ciano/violeta) revelado por uma máscara radial seguindo o cursor, com stroke inicial animado via strokeDasharray. Reimplementado padronizado shadcn com motion/react, palette de gradiente configurável e variantes de densidade.",
    tags: [
      "text",
      "hover",
      "svg",
      "mask",
      "gradient",
      "cursor",
      "aceternity",
    ],
    usage:
      "Passe o texto desejado em <TextHoverEffect text=\"Hover me\" /> dentro de um wrapper com largura definida; ajuste density (compact/default/relaxed) para a altura do container e duration para suavizar o seguimento do cursor.",
  },
  {
    slug: "lamp-effect",
    name: "Lamp Effect",
    category: "Feedback",
    description:
      "Efeito \"lâmpada\" da Aceternity UI: dois cones de luz cônicos (conic-gradient) com blur que crescem ao entrar na viewport, acompanhados de uma linha brilhante horizontal, projetando luz ciano sobre um fundo escuro (slate-950) para revelar um título abaixo. Animado por whileInView de motion/react.",
    tags: ["lamp", "light", "glow", "hero", "conic", "aceternity"],
  },
  {
    slug: "text-generate-effect",
    name: "Text Generate Effect",
    category: "Feedback",
    description:
      "Texto da Aceternity UI em que cada palavra entra com fade + blur desfocado (10px) com stagger de 0.2s. Tema via token semântico text-foreground; aceita frase, flag de blur e duração customizada. Animado na montagem via useAnimate (motion/react).",
    tags: ["text", "gerar", "blur", "stagger", "animação", "aceternity"],
  },
  {
    slug: "flip-words",
    name: "Flip Words",
    category: "Feedback",
    description:
      "Ciclador de palavras da Aceternity UI: AnimatePresence com troca animada por letra (entrada com stagger blur→nítido, saída dramática com scale, blur e deslocamento). Tema segue token semântico text-foreground; aceita lista de palavras e duração customizável.",
    tags: ["flip", "words", "texto", "animação", "letra", "aceternity"],
    usage:
      "Use <FlipWords words={['rápido','bonito','moderno']} /> inline em qualquer cabeçalho ou frase para dar vida ao copy.",
  },
  {
    slug: "layout-text-flip",
    name: "Layout Text Flip",
    category: "Feedback",
    description:
      "Título fixo + palavra que rotaciona com flip vertical (y -40 → 0 → +50) e blur de entrada/saída (Aceternity UI). O layoutId do título permite transição suave entre seções; a palavra rotativa usa popLayout para preservar posição. A pill rotativa usa tokens semânticos shadcn (bg-card + ring-border), aceitando duration customizável e children opcional (ex.: separador).",
    tags: ["flip", "layout", "texto", "animação", "hero", "aceternity"],
  },
  {
    slug: "aurora-background",
    name: "Aurora Background",
    category: "Feedback",
    description:
      "Fundo animado da Aceternity UI com gradiente aurora (repeating-linear-gradient em tons azul/índigo/violeta) que desliza horizontalmente em loop infinito (keyframe aurora 60s). Inclui mask radial opcional, variação automática para dark mode e blend difference para contraste orgânico do conteúdo. Cores do efeito são fixas (assinatura visual).",
    tags: [
      "aurora",
      "background",
      "gradient",
      "animado",
      "feedback",
      "aceternity",
    ],
  },
  {
    slug: "text-reveal-card",
    name: "Text Reveal Card",
    category: "Feedback",
    description:
      "Card Aceternity UI: arraste o mouse sobre o card e um texto escondido é revelado progressivamente da esquerda pra direita via clip-path animado por motion, com estrelinhas piscando ao fundo. Background escuro fixo (brand do efeito).",
    tags: ["text", "reveal", "card", "mask", "mouse", "stars", "aceternity"],
    usage:
      "Passe text e revealText em <TextRevealCard> e use <TextRevealCardTitle>/<TextRevealCardDescription> como children para título/descrição do topo.",
  },
  {
    slug: "glowing-stars-effect",
    name: "Glowing Stars Effect",
    category: "Feedback",
    description:
      "Card da Aceternity UI com uma malha de estrelinhas (108 pontos em 18 colunas) que brilham aleatoriamente a cada 3s e acendem todas no hover, com glows azuis (motion/react). Inclui subcomponentes GlowingStarsTitle e GlowingStarsDescription para o conteúdo do card.",
    tags: ["card", "stars", "glow", "animation", "aceternity"],
  },
  {
    slug: "container-text-flip",
    name: "Container Text Flip",
    category: "Feedback",
    description:
      "Container animado da Aceternity UI que muda de largura suavemente para acomodar a palavra atual e cicla por uma lista de palavras com stagger de blur por letra (10px → nítido). Tema segue tokens semânticos shadcn (text-foreground, bg-muted, border). Aceita lista de palavras, intervalo entre trocas e duração da animação.",
    tags: [
      "container",
      "text",
      "flip",
      "palavras",
      "animação",
      "blur",
      "stagger",
      "aceternity",
    ],
    usage:
      "Use <ContainerTextFlip words={['rápido','bonito','moderno']} /> inline em qualquer cabeçalho ou hero para dar vida ao copy com troca animada de palavras.",
  },
  {
    slug: "squiggly-text",
    name: "Squiggly Text",
    category: "Feedback",
    description:
      "Texto da Aceternity UI que 'treme' ciclicamente entre filtros SVG (feTurbulence + feDisplacementMap) com seeds diferentes, criando efeito de vibração/ondulação configurável (steps, stepDuration, scale, baseFrequency, numOctaves). Animação por useTime + useTransform de motion/react; o filtro aplica em qualquer texto inline ou em bloco (as='span'|'div').",
    tags: ["squiggly", "wobble", "text", "svg", "filter", "aceternity"],
  },
  {
    slug: "wobble-card",
    name: "Wobble Card",
    category: "Layout",
    description:
      "Card que balança e translada com o mouse via motion (tilt 3D + scale do conteúdo + noise overlay).",
    tags: ["card", "tilt", "parallax", "motion", "aceternity", "feedback"],
  },
  {
    slug: "evervault-card",
    name: "Evervault Card",
    category: "Layout",
    description:
      "Card da Aceternity UI que revela uma chuva de caracteres aleatórios sob um mask radial que segue o cursor: ao passar o mouse, um gradient verde→azul com efeito de mix-blend-overlay exibe uma string alfanumérica gerada dinamicamente, mantendo no centro um badge circular desfocado com o texto da prop `text`. Ideal para hero, CTAs criptografados e destaque visual. Reimplementado padronizado shadcn com motion/react.",
    tags: [
      "evervault",
      "card",
      "mask",
      "radial",
      "random",
      "characters",
      "encryption",
      "encrypt",
      "aceternity",
    ],
    usage:
      "Envolva o card em um wrapper com altura fixa (ex.: h-[400px]) — sem altura o aspect-square interno colapsa para 0×0.",
  },
  {
    slug: "glare-card",
    name: "Glare Card",
    category: "Layout",
    description:
      "Card Aceternity com brilho/glare 3D seguindo o mouse: rotaciona (rotateX/rotateY) conforme o cursor e revela um gradiente rainbow/foil/diagonal sobre fundo escuro. Efeito brand fixo (precedente: text-reveal-card, vortex).",
    tags: ["glare", "card", "3d", "shine", "rainbow", "aceternity"],
  },
  {
    slug: "3d-pin",
    name: "3D Pin",
    category: "Layout",
    description:
      "Card da Aceternity UI que inclina em 3D (rotateX + scale) no hover, acompanhado de um PinPerspective (linhas cyan e bolhas concêntricas em loop) que sobe do card. Ideal para destacar um CTA ou um item em destaque numa grid.",
    tags: [
      "3d",
      "pin",
      "hover",
      "card",
      "perspective",
      "aceternity",
      "layout",
    ],
    usage:
      "Envolva o conteúdo do card em <PinContainer title=\"acme.com\" href=\"https://acme.com\"> dentro de um wrapper com altura explícita (h-[40rem]) e largura w-full; o PinPerspective aparece automaticamente no hover.",
  },
  {
    slug: "background-gradient-animation",
    name: "Background Gradient Animation",
    category: "Feedback",
    description:
      "Fundo da Aceternity UI com blobs de gradiente radial que se movem continuamente (CSS keyframes) e se misturam via mix-blend-mode + filtro goo (feGaussianBlur/feColorMatrix). Um blob extra segue o cursor quando interactive. Cores, tamanho e blend configuráveis.",
    tags: ["background", "gradient", "blobs", "animation", "interactive", "aceternity"],
  },
  {
    slug: "draggable-card",
    name: "Draggable Card",
    category: "Layout",
    description:
      "Card arrastável da Aceternity UI com física de mola (spring) e rotação 3D seguindo o cursor. Ao soltar, o gesto de arrastar é animado com spring e bounce proporcional à velocidade.",
    tags: [
      "drag",
      "draggable",
      "physics",
      "spring",
      "3d",
      "rotate",
      "card",
      "aceternity",
      "layout",
    ],
    usage:
      "Use para destacar CTAs ou cards especiais onde você quer dar uma camada de interação tátil. O card precisa de um wrapper com altura definida (ex.: h-[400px]) para a área de arrastar ficar visível.",
  },
  {
    slug: "colourful-text",
    name: "Colourful Text",
    category: "Feedback",
    description:
      "Componente Aceternity UI: cada caractere do texto anima com cor (10 tons do espectro RGB reembaralhados a cada 5s), y, scale, filter blur e opacity em loop, dando efeito de 'onda' colorida. Cores são fixas (brand do efeito, alinhado com glitch/cyber). Ideal para hero headlines e CTAs que precisam de destaque animado sem competir com o restante do copy.",
    tags: [
      "colourful",
      "text",
      "cores",
      "espectro",
      "animado",
      "hero",
      "shuffle",
      "aceternity",
    ],
  },
  {
    slug: "direction-aware-hover",
    name: "Direction Aware Hover",
    category: "Layout",
    description:
      "Card da Aceternity UI que detecta a borda de entrada do mouse via atan2 e desloca imagem + texto pela direção oposta: entrar por baixo → imagem sobe; entrar por cima → imagem desce. O overlay escuro e o texto surgem suavemente no hover. Ideal para grids de perfis, testemunhos ou vitrines visuais que precisam de microinteração direcional.",
    tags: [
      "image",
      "hover",
      "direction",
      "card",
      "aceternity",
      "layout",
    ],
    usage:
      "Use <DirectionAwareHover imageUrl=\"...\"> com qualquer conteúdo React como children (ex.: nome + handle) — o card reage à direção da qual o mouse entrou.",
  },
  {
    slug: "comet-card",
    name: "Comet Card",
    category: "Layout",
    description:
      "Card 3D da Aceternity UI que segue o cursor com tilt (rotateX/Y), parallax (translateX/Y) e um glare radial que se move com o mouse. Profundidade de rotação e translação configuráveis via props; aceita qualquer conteúdo como children dentro de um card visual com overflow-hidden.",
    tags: [
      "card",
      "3d",
      "tilt",
      "glare",
      "mouse-tracking",
      "motion",
      "aceternity",
    ],
    usage:
      "Envolva o conteúdo visual do card (imagem + textos) em <CometCard className='h-full w-full'> dentro de um wrapper com altura (ex.: h-[420px] w-[300px]) para a área 3D ter onde operar.",
  },
  {
    slug: "3d-marquee",
    name: "3D Marquee",
    category: "Layout",
    description:
      "Grid 4 colunas em perspectiva 3D (rotateX 55°, rotateZ -45°) onde cada coluna rola verticalmente em loop infinito reverso, com durações alternadas (10s nas pares, 15s nas ímpares). Cada imagem ganha um leve translateY no hover. Inclui overlays decorativos de linhas horizontais/verticais com mask gradient nas bordas. Imagens mínimas: 16 (4 por coluna) — ideal 24 (6 por coluna).",
    tags: ["3d", "marquee", "grid", "gallery", "infinite", "aceternity"],
    usage:
      "Passe ao menos 16 URLs de imagem em <ThreeDMarquee images={...}> dentro de um wrapper com altura controlada (h-[600px] recomendado) — o grid é dimensionado para preencher 600px de altura com margem para o efeito 3D.",
  },
  {
    slug: "animated-testimonials",
    name: "Animated Testimonials",
    category: "Feedback",
    description:
      "Carrossel de depoimentos da Aceternity UI com AnimatePresence (motion v12): imagem rotaciona 3D aleatoriamente e entra com scale + z-index, nome/cargo/citação trocam com stagger de blur por palavra. Suporta autoplay (5s) e lista arbitrária de testemunhos via prop `testimonials`.",
    tags: [
      "testimonials",
      "depoimentos",
      "carrossel",
      "carousel",
      "quotes",
      "citacoes",
      "animated",
      "animatepresence",
      "motion",
      "aceternity",
    ],
    usage:
      "Passe uma lista de `{ quote, name, designation, src }` em <AnimatedTestimonials testimonials={...} />; use `autoplay` para o carrossel avançar a cada 5s. O componente cuida de z-index, scale e rotação 3D por testemunho — basta fornecer o array.",
  },
  {
    slug: "code-block",
    name: "Code Block",
    category: "Feedback",
    description:
      "Bloco de código da Aceternity UI com syntax highlight manual leve (regex para keywords, strings, números, comentários e identificadores), números de linha, linhas destacáveis, abas com indicator animado (motion v12) e botão de copiar inline com feedback visual (ícone Check + cor emerald por 2s). Suporta múltiplas linguagens (ts/tsx, js/jsx, py, bash, json, css) via prop `language` ou por aba. Fundo slate-900 com borda slate-800 (brand dark, alinhado com glare-card/text-reveal-card).",
    tags: [
      "code",
      "syntax",
      "highlight",
      "block",
      "snippet",
      "tabs",
      "copy",
      "line-numbers",
      "aceternity",
    ],
    usage:
      "Passe `code` (string) OU `tabs` (array) — nunca ambos. Use `filename` (com `code`) ou apenas `tabs` (filename é omitido no modo com abas). `highlightLines` é por aba quando há tabs, ou da raiz no modo simples.",
  },
  {
    slug: "dither-shader",
    name: "Dither Shader",
    category: "Feedback",
    description:
      "Aplica dithering (Bayer / halftone / noise / crosshatch) sobre uma imagem renderizada num <canvas>, com modos de cor original / grayscale / duotone / custom. Usa Canvas 2D puro (sem WebGL/three.js) e suporta animação contínua no modo noise. Imagem via prop `src` (CORS-friendly, ex.: picsum.photos).",
    tags: [
      "dither",
      "dithering",
      "shader",
      "bayer",
      "halftone",
      "noise",
      "duotone",
      "grayscale",
      "pixel-art",
      "retro",
      "aceternity",
      "feedback",
    ],
    usage:
      "Envolva o <DitherShader> num wrapper com altura+largura explícitas (ex.: relative h-[420px] w-full rounded-xl overflow-hidden) — o componente preenche 100% do container via absolute inset-0. Use `gridSize` 3-5 para pixel art, 6-10 para efeito mais fino. Picsum ou outros hosts CORS-friendly funcionam com crossOrigin='anonymous'.",
  },
  {
    slug: "file-upload",
    name: "File Upload",
    category: "Forms",
    description: "...",
    tags: ["file", "upload", "drag", "drop", "aceternity"],
  },
  {
    slug: "animated-modal",
    name: "Animated Modal",
    category: "Feedback",
    description:
      "Modal da Aceternity UI com animação de entrada cinematográfica (scale + rotateX + translateY), overlay com backdrop-blur, click-outside e body scroll-lock enquanto aberto. Composto por 5 peças (Provider, Trigger, Body, Content, Footer) que se combinam via Context.",
    tags: [
      "modal",
      "animated",
      "dialog",
      "overlay",
      "backdrop",
      "motion",
      "aceternity",
      "feedback",
    ],
    usage:
      "Envolva o gatilho + o Body num <AnimatedModalProvider>. Use <AnimatedModalTrigger> como botão que abre, e dentro do <AnimatedModalBody> posicione <AnimatedModalContent> (texto) e <AnimatedModalFooter> (botões). O fechamento é por click-outside, X ou setOpen(false) via useAnimatedModal().",
  },
  {
    slug: "gooey-input",
    name: "Gooey Input",
    category: "Forms",
    description:
      "Search input com efeito gooey da Aceternity UI: filtro SVG (feGaussianBlur + feColorMatrix com alpha boost 20 -10) que faz o ícone circular 'derreter' e se fundir com a barra de search expandida. O ícone da lupa compartilha um layoutId entre o botão e o bubble destacado, criando uma transição orgânica via motion/react. Ao desfocar com campo vazio, o controle volta ao estado colapsado.",
    tags: ["search", "input", "gooey", "animation", "aceternity"],
  },
  {
    slug: "hover-border-gradient",
    name: "Hover Border Gradient",
    category: "Actions",
    description:
      "Botão (ou wrapper polimórfico via `as`) com borda que ganha gradiente radial animado ao passar o mouse. Em repouso a direção do gradiente rotaciona ciclicamente (TOP→LEFT→BOTTOM→RIGHT) a cada `duration`s; no hover a borda preenche com o highlight azul (#3275F8). Cores são fixas (brand do efeito) — não segue tema shadcn.",
    tags: [
      "button",
      "gradient",
      "border",
      "hover",
      "animated",
      "aceternity",
      "action",
      "cta",
    ],
    usage:
      "Use como botão padrão (`as='button'`, default) ou polimórfico (`as='a'`, etc.) — propague `href` e outros atributos HTML via spread. `containerClassName` estiliza a casca (a borda em si), `className` estiliza o miolo (fundo + texto). Cores são fixas; se precisar de tema, sobrescreva `bg-black`/`text-white`/`bg-black/20` nas classes extras.",
  },
  {
    slug: "loader",
    name: "Loader",
    category: "Feedback",
    description:
      "Coleção de cinco loaders animados da Aceternity UI: três pontos saltitantes em onda, três pontos deslizando horizontalmente, raio SVG com pathLength 0→1 e fill animado, texto com skew/scale glitch e camadas RGB (verde+violeta) atrás, e caracteres pulsando com text-shadow. Cores são fixas (assinatura visual do efeito) e não seguem o tema shadcn.",
    tags: [
      "loader",
      "spinner",
      "loading",
      "animation",
      "feedback",
      "aceternity",
    ],
    usage:
      "Use `<Loader variant='one' />` (default) para três pontos saltitantes; `variant='two'` para pontos deslizando; `variant='three'` para o raio SVG; `variant='four' text='Carregando' />` para o glitch de texto; `variant='five' text='Aguarde...' />` para caracteres pulsantes. O wrapper centraliza o conteúdo e impõe altura mínima; passe `className` para customizar (ex.: cor de texto no dark).",
  },
  {
    slug: "moving-border",
    name: "Moving Border",
    category: "Actions",
    description:
      "Botão (ou wrapper polimórfico via `as`) com borda que se move continuamente ao longo do perímetro, implementada com um `<rect>` SVG invisível percorrido por um gradiente radial via `getPointAtLength` + `useAnimationFrame` (motion v12). Duração configurável em ms, raio da borda customizável e gradiente da 'bola' substituível. Cores são fixas (slate-900 + cyan, brand do efeito) — não segue tema shadcn.",
    tags: [
      "button",
      "border",
      "moving",
      "animated",
      "gradient",
      "perimeter",
      "aceternity",
      "action",
      "cta",
    ],
    usage:
      "Use `MovingBorderButton` como botão pronto (slate-900 + cyan) ou `MovingBorder` puro dentro de qualquer wrapper com altura/largura (`relative h-* w-* overflow-hidden`) para fazer a borda viajante percorrer contornos customizados. `containerClassName` estiliza a casca externa, `borderClassName` estiliza a bola gradiente (substitua o `bg-[radial-gradient(...)]` para trocar a cor), `className` estiliza o miolo (fundo + texto). O polimorfismo via `as` propaga href e atributos HTML via spread.",
  },
  {
    slug: "magnetic-button",
    name: "Magnetic Button",
    category: "Actions",
    description:
      "Wrapper que atrai o conteúdo em direção ao cursor com spring (useMotionValue + useSpring). Quando o mouse se aproxima, o filho é deslocado proporcionalmente em direção ao ponteiro; ao sair, retorna ao centro com física de mola. A borda azul aparece no hover como feedback visual. Útil para CTAs e botões interativos.",
    tags: ["button", "magnetic", "hover", "spring", "aceternity"],
    usage:
      "Envolva qualquer elemento (tipicamente um <button>) com <MagneticButton> e o filho será magneticamente atraído pelo cursor. Use `strength` (0..1) para controlar a força do deslocamento e `maxDistance` (px) para limitar a área de influência. Mantenha o `children` com tamanho próprio (o wrapper não força dimensões).",
  },
  {
    slug: "notch",
    name: "Notch",
    category: "Layout",
    description:
      "Barra/notch fixa no topo ou base do viewport (estilo iOS Dynamic Island) com grupos de triggers que abrem um popover de opções animado via motion/react. Cores dark hardcoded (bg-neutral-950/95, text-neutral-100/300/400) — brand do efeito, não segue tema shadcn.",
    tags: [
      "notch",
      "bar",
      "dock",
      "menu",
      "popover",
      "dynamic-island",
      "aceternity",
      "layout",
    ],
    usage:
      "Use `Notch` para grupos de filtros/ordenação/controles sempre visíveis em uma ilha flutuante. Suporta múltiplos grupos (separados por dividers tracejados) com estado controlled/uncontrolled. `closeOnSelect` (default true) fecha o popover após selecionar. `accentColor` customiza o highlight do item ativo. Cores são fixas — se precisar de tema claro, sobrescreva `className`.",
  },
  {
    slug: "sticky-scroll-reveal",
    name: "Sticky Scroll Reveal",
    category: "Layout",
    description:
      "Container scrollável vertical com seções de texto à esquerda e um card sticky à direita que troca conteúdo e gradiente de fundo conforme a seção ativa muda. O progresso do scroll interno é medido por `useScroll({ container })` (motion v12) e mapeado em breakpoints normalizados (i/N) para decidir qual card está em foco. Cores são hardcoded (slate-900/black + gradientes cyan/pink/orange) — brand do efeito, não segue tema shadcn.",
    tags: [
      "scroll",
      "sticky",
      "reveal",
      "scroll-driven",
      "container",
      "aceternity",
      "layout",
    ],
    usage:
      "Passe `content` como um array de `{ title, description, content? }` (3-5 itens rendem bem). O wrapper impõe `h-[30rem] overflow-y-auto` e a borda sticky `top-10`; ajuste via `className` se precisar de outra altura. O card sticky à direita é `hidden lg:block` por default — passe `contentClassName` para customizar (cor de fundo, borda, etc.) ou desabilite o responsivo via wrapper externo.",
  },
  {
    slug: "world-map",
    name: "World Map",
    category: "Feedback",
    description:
      "Mapa-múndi pontilhado da Aceternity UI (SVG gerado em runtime pela lib dotted-map) com arcos curvos que se desenham progressivamente (pathLength animado por motion) entre pares de coordenadas, e pontos pulsantes (animate SVG) nas pontas. Útil para ilustrar conexões/rotas globais. Cor das linhas configurável e fundo adaptativo ao tema (branco no claro, preto no escuro).",
    tags: ["world", "map", "globe", "connections", "svg", "aceternity"],
  },
  {
    slug: "keyboard",
    name: "Keyboard",
    category: "Feedback",
    description:
      "Teclado virtual estilo Apple com teclas que afundam ao clicar ou ao pressionar a tecla física correspondente. Suporte a layout QWERTZ/ANSI e preview animado da última tecla pressionada.",
    tags: ["keyboard", "teclado", "virtual", "apple", "aceternity"],
  },
  {
    slug: "placeholders-and-vanish-input",
    name: "Placeholders and Vanish Input",
    category: "Forms",
    description:
      "Campo de texto com placeholders animados que desaparecem ao focar, e botão de submit com loading animado. Efeito de 'vanish' no texto ao enviar.",
    tags: ["input", "placeholder", "vanish", "animation", "aceternity"],
  },
  {
    slug: "webcam-pixel-grid",
    name: "Webcam Pixel Grid",
    category: "Feedback",
    description:
      "Grid de pixels que captura frames da webcam e renderiza em tempo real como uma matriz de cores. Fallback elegante quando webcam não está disponível.",
    tags: ["webcam", "pixel", "grid", "camera", "realtime", "aceternity"],
  },
  {
    slug: "apple-cards-carousel",
    name: "Apple Cards Carousel",
    category: "Layout",
    description:
      "Carrossel horizontal estilo Apple com cards que expandem em modal via layoutId (motion/react). Navegação por setas, scroll e botão X. Fecha com Escape ou clique fora.",
    tags: ["carousel", "cards", "apple", "modal", "layout", "motion", "gallery", "image"],
  },
  {
    slug: "ascii-art",
    name: "ASCII Art",
    category: "Feedback",
    description:
      "Renderizador de imagem como ASCII art em canvas com animação (fade/typewriter/matrix). Suporta múltiplos charsets (standard, blocks, braille, dense, etc.), cores customizadas, ASCII colorido e efeito matrix com caracteres katakana.",
    tags: [
      "ascii",
      "art",
      "canvas",
      "render",
      "image",
      "typewriter",
      "matrix",
      "charset",
      "aceternity",
    ],
    usage:
      "Envolva o <AsciiArt> num wrapper com altura+largura explícitas (ex.: relative h-[400px] w-full rounded-xl overflow-hidden) — o componente preenche 100% do container via absolute inset-0. Use `resolution` 60-100 para detalhe, `charset` para o estilo de caracteres, e `animationStyle` para fade/typewriter/matrix. Imagens CORS-friendly (ex.: picsum.photos) funcionam com crossOrigin='anonymous'.",
  },
  {
    slug: "canvas-reveal-effect",
    name: "Canvas Reveal Effect",
    category: "Feedback",
    description:
      "Efeito de revelação com dot matrix WebGL usando shader customizada via @react-three/fiber + three. Animação surge do centro para as bordas com opacidade progressiva.",
    tags: ["canvas", "webgl", "shader", "dot-matrix", "reveal", "three", "animation", "aceternity"],
  },
  {
    slug: "card-spotlight",
    name: "Card Spotlight",
    category: "Feedback",
    description:
      "Card com spotlight radial que segue o cursor (CSS custom props --mouse-x/--mouse-y) e grid de dots animado via CanvasRevealEffect no hover. Cores dark fixas (brand do efeito).",
    tags: ["card", "spotlight", "radial", "cursor", "dots", "canvas", "webgl", "aceternity"],
  },
  {
    slug: "canvas-text",
    name: "Canvas Text",
    category: "Feedback",
    description:
      "Texto renderizado em canvas com animação e efeitos visuais.",
    tags: ["canvas", "text", "animation", "aceternity"],
  },
  {
    slug: "animated-tooltip",
    name: "Animated Tooltip",
    category: "Feedback",
    description:
      "Fileira de avatares com tooltip animado que segue o cursor — useSpring + useTransform + AnimatePresence. O tooltip inclina e translada conforme a posição do mouse sobre o avatar. Cores dark hardcoded (fundo preto + gradientes emerald/sky) são a assinatura visual do efeito, não seguem tema shadcn.",
    tags: ["tooltip", "avatar", "spring", "animation", "hover", "aceternity", "feedback"],
  },
  {
    slug: "text-flipping-board",
    name: "Text Flipping Board",
    category: "Feedback",
    description:
      "Split-flap board estilo aeroporto: cada caractere gira pra revelar a letra, com delay em cascata por linha e coluna.",
    tags: ["text", "split-flap", "board", "flip", "animation", "airport", "aceternity"],
  },
  {
    slug: "sticky-banner",
    name: "Sticky Banner",
    category: "Layout",
    description:
      "Banner fixo no topo (sticky) que oculta/mostra conforme a posição de scroll, com botão de fechar interno. Wrapper bg-transparent — cor fica nos children.",
    tags: ["sticky", "banner", "scroll", "hide", "top", "aceternity", "layout"],
  },
  {
    slug: "multi-step-loader",
    name: "Multi Step Loader",
    category: "Feedback",
    description:
      "Loader fullscreen com overlay blur, lista de etapas com índice ativo controlado por state, ícone Check progressivo (vazio → preenchido → lime), e AnimatePresence para entrada/saída. Cada etapa avança automaticamente com duração configurável e loop opcional.",
    tags: [
      "loader",
      "multi-step",
      "overlay",
      "progress",
      "animation",
      "aceternity",
      "feedback",
    ],
  },
  {
    slug: "link-preview",
    name: "Link Preview",
    category: "Feedback",
    description:
      "Hover-card que mostra um screenshot da URL apontada por um link, com leve parallax no eixo X seguindo o cursor. Usa @radix-ui/react-hover-card + qss.",
    tags: [
      "link",
      "preview",
      "hover",
      "screenshot",
      "parallax",
      "aceternity",
      "feedback",
    ],
  },
  {
    slug: "layout-grid",
    name: "Layout Grid",
    category: "Layout",
    description:
      "Grid bento responsivo (1 col mobile, 3 col desktop) com cards clicáveis que expandem em overlay centralizado usando layoutId compartilhado do motion. Cards com thumbnail e conteúdo JSX customizável.",
    tags: [
      "grid",
      "bento",
      "layout",
      "cards",
      "expand",
      "overlay",
      "motion",
      "aceternity",
      "layout",
    ],
  },
  {
    slug: "macbook-scroll",
    name: "Macbook Scroll",
    category: "Layout",
    description:
      "Mock de MacBook Pro com tampa que abre ao rolar a página. useScroll mede o progresso e useTransform aplica scaleX/scaleY/translate/rotate no lid + parallax no título. Imagem reveal dentro da tela.",
    tags: [
      "macbook",
      "scroll",
      "reveal",
      "mockup",
      "laptop",
      "animation",
      "motion",
      "aceternity",
    ],
  },
  {
    slug: "bento-grid",
    name: "Bento Grid",
    category: "Layout",
    description:
      "Grid bento responsivo (1 coluna no mobile, 3 colunas no desktop) com cards de tamanhos variados. Cada item aceita header, título, descrição e ícone, com micro-interação de deslize no hover.",
    tags: [
      "bento",
      "grid",
      "layout",
      "cards",
      "responsive",
      "showcase",
      "aceternity",
    ],
  },
  {
    slug: "infinite-moving-cards",
    name: "Infinite Moving Cards",
    category: "Layout",
    description:
      "Carrossel de cards em loop infinito. Os itens são duplicados em runtime e uma animação CSS faz a esteira correr sem emendas, com direção (left/right), velocidade (fast/normal/slow) e pausa no hover. Máscara lateral suaviza as bordas.",
    tags: [
      "infinite",
      "carousel",
      "carrossel",
      "scroll",
      "marquee",
      "testimonials",
      "loop",
      "aceternity",
    ],
  },
  {
    slug: "lens",
    name: "Lens",
    category: "Feedback",
    description:
      "Lente de aumento que segue o cursor sobre uma imagem ou card, ampliando a região sob ela com máscara radial. Suporta posição fixa (estática) e estado de hover controlado externamente.",
    tags: [
      "lens",
      "zoom",
      "magnifier",
      "hover",
      "image",
      "feedback",
      "aceternity",
    ],
  },
  // Lote Observabilidade
  {
    slug: "error-tracker-feed",
    name: "Error Tracker Feed",
    category: "Feedback",
    description:
      "Feed de erros/exception events estilo Sentry: lista de issues com tipo, mensagem, count, ambiente (prod/staging/dev), status (new/resolved/ignored/suppressed), usuários afetados e mini-sparkline de tendência. Filtros funcionais (ambiente, status, busca por tipo) e agrupamento configurável por tipo, serviço ou usuário.",
    tags: [
      "error",
      "erro",
      "exception",
      "sentry",
      "observability",
      "incident",
      "log",
      "feed",
      "feedback",
    ],
    usage:
      "Use como bloco principal da tela de 'Issues' de um painel de observabilidade. Recebe uma lista de ErrorEventItem (formato Sentry-like) e cuida de filtragem (ambiente/status/busca), agrupamento (type/service/user) e render. Cada item pode disparar onErrorClick para abrir um drawer com o stack trace completo. Cores de ambiente são fixas (prod=rose, staging=amber, dev=sky) — alinhadas com o padrão visual do Pulse (Observability Center).",
  },
  // Lote React Flow
  {
    slug: "react-flow",
    name: "React Flow",
    category: "Layout",
    description:
      "Suite de diagramas baseada em @xyflow/react, tematizada com tokens shadcn (light/dark reativo). Inclui custom nodes no estilo Card, edges animadas/direcionais, Controls, MiniMap e Background pontilhado. Pronta para flowcharts, organogramas, pipelines e canvas drag-and-drop.",
    usage:
      "Use ReactFlowDiagram para renderizar grafos interativos. Controle nós/arestas com useNodesState/useEdgesState e conecte handles via onConnect + addEdge. Passe reactFlowNodeTypes para nós estilizados shadcn.",
    tags: [
      "react-flow",
      "xyflow",
      "diagram",
      "flowchart",
      "org-chart",
      "node-editor",
      "graph",
      "drag-and-drop",
      "layout",
    ],
  },

  // Lote Observabilidade
  {
    slug: "request-flow-inspector",
    name: "Request Flow Inspector",
    category: "Feedback",
    description:
      "Inspetor detalhado de UMA request HTTP no estilo DevTools Network / Datadog APM: método, URL, status com cor semântica, waterfall de timing (DNS/TCP/TLS/Server/Transfer), request/response headers, body com syntax highlight de JSON, cookies com badges secure/httpOnly, IDs de trace e card lateral com IP, geo (bandeira/ASN/user-agent) e ambiente.",
    usage:
      "Passe um objeto InspectedRequest com todos os campos do ciclo (timing, headers, cookies, geo, trace). Use em painéis de APM, dashboards de erro, debugging de latência e timelines de incidentes. Cores do status seguem faixa HTTP (2xx emerald, 3xx sky, 4xx amber, 5xx rose).",
    tags: [
      "request",
      "http",
      "network",
      "devtools",
      "apm",
      "performance",
      "timing",
      "waterfall",
      "trace",
      "observability",
      "debug",
    ],
  },
  {
    slug: "fleet-server-grid",
    name: "Fleet Server Grid",
    category: "Feedback",
    description:
      "Grid responsivo de tiles compactos para visualizar uma frota de servidores de uma vez. Cada tile mostra nome, host, status dot (verde/âmbar/vermelho), 3 mini-barras (CPU/MEM/DISK com cor reativa ao percentual), sparkline determinística de CPU (12 pontos), uptime formatado, função e região. Suporta busca em tempo real (nome/host/função/região), sort por status/nome/CPU/memória, e agrupamento por status/função/região. Click no tile abre um modal de detalhe (Dialog do shadcn) com tabela de discos e top processos — ou render prop customizável via renderDetail.",
    tags: [
      "fleet",
      "server",
      "grid",
      "monitoring",
      "status",
      "cpu",
      "memory",
      "sparkline",
      "infra",
      "observability",
    ],
  },
  {
    slug: "server-overview-card",
    name: "Server Overview Card",
    category: "Feedback",
    description:
      "Card denso de overview de UM servidor/container (estilo New Relic / Datadog Host Summary): status, uptime, host, gauges radiais de CPU + memória (270°), lista de discos com throughput, rede + conexões, top 5 processos e último incidente. Cores semânticas por status e sparklines opcionais. Determinístico, sem dependências novas.",
    tags: [
      "server",
      "overview",
      "host",
      "infra",
      "observabilidade",
      "metricas",
      "cpu",
      "memoria",
      "disco",
      "rede",
      "processos",
      "sre",
      "monitoramento",
      "gauge",
      "sparkline",
    ],
  },
  {
    slug: "container-resource-panel",
    name: "Container Resource Panel",
    category: "Feedback",
    description:
      "Painel read-only dos recursos de um container Docker: status (running/exited/restarting/paused/dead/created), health, CPU/MEM com limites e barras, network rx/tx, block I/O read/write, restart count com cor, portas publicadas, env vars (com masked) e mounts. Inspirado em Portainer / Docker Desktop.",
    usage:
      "Passe um ContainerMetrics e o painel renderiza header, mini-cards, barras, portas, env (com botão ver mais) e mounts. Cores reagem a data-status (emerald/sky/amber/rose/gray) e o restart count colore 0=emerald, 1-3=amber, >3=rose. Sem dependências novas, sem PRNG.",
    tags: [
      "container",
      "docker",
      "resources",
      "metrics",
      "cpu",
      "memory",
      "ports",
      "env",
      "mounts",
      "observability",
      "portainer",
    ],
  },
  {
    slug: "db-schema-explorer",
    name: "DB Schema Explorer",
    category: "Feedback",
    description:
      "Explorador de schema de banco no estilo DBeaver/Navicat: árvore lateral (banco → schemas → tabelas) com busca em tempo real, painel de detalhe com 4 abas (Columns / Indexes / Foreign keys / DDL) e referência FK clicável que pula para a tabela alvo.",
    tags: [
      "database",
      "schema",
      "postgres",
      "mysql",
      "sqlserver",
      "oracle",
      "sqlite",
      "tree",
      "ddl",
      "foreign-key",
      "observability",
    ],
    usage:
      "Passe `database: DatabaseSchema` com id, name, engine, host:port, version, sizeMB, tables e schemas (cada um com tables, columns, primaryKey, indexes, foreignKeys, rowCount?, sizeMB?). Suporta busca por nome de tabela/coluna/referência e toggle 'Só com FK'. Clique em uma referência FK na aba 'Foreign keys' para saltar para a tabela alvo. Use as abas Columns/Indexes/FKs/DDL para inspecionar.",
  },
  {
    slug: "slow-query-list",
    name: "Slow Query List",
    category: "Feedback",
    description:
      "Listagem de queries SQL lentas com diagnóstico: tempo, query SQL com syntax highlight, plano do EXPLAIN em árvore, locks ativos e sugestões automáticas (índice faltante, rewrite, vacuum, stats, lock). Filtros por threshold, severidade e banco; agrupamento por tabela/database/user.",
    usage:
      "Use para dashboards de observabilidade de banco (estilo pgAdmin, DataDog DBM, pganalyze). Filtro threshold esmaece queries abaixo do limite; chips de severidade (warning/critical) e banco permitem drill-down. Sugestões com DDL têm botão de copiar para clipboard.",
    tags: [
      "slow-query",
      "sql",
      "database",
      "observability",
      "explain",
      "performance",
      "monitoring",
      "db",
    ],
  },
  {
    slug: "user-activity-stream",
    name: "User Activity Stream",
    category: "Feedback",
    description:
      "Feed de atividades de usuários em tempo real (estilo Hotjar/FullStory/Mixpanel Live). Cada item é uma ação observada (login, page_view, form_submit, error, abuse_flag etc.) com avatar, timestamp relativo, geo e IP. Suporta filtros (ação, usuário, período), agrupamento por usuário/ação/página e auto-scroll com botão 'pular para o mais recente' quando o usuário rola pra cima.",
    tags: [
      "activity",
      "stream",
      "live",
      "tempo real",
      "feed",
      "usuário",
      "log",
      "observabilidade",
      "analytics",
      "eventos",
      "hotjar",
      "fullstory",
      "mixpanel",
    ],
  },
  {
    slug: "db-overview-grid",
    name: "Db Overview Grid",
    category: "Feedback",
    description:
      "Visão geral em grid de uma frota de bancos de dados (Postgres, MySQL, SQL Server, Oracle, SQLite). " +
      "Cada tile mostra env, engine, host:port, status, conexões, tamanho, cache hit, QPS, slow queries, TPS, replication lag, top 3 tabelas e último backup. " +
      "Inclui busca, ordenação e Dialog de detalhe via render prop (integra com `db-schema-explorer`).",
    tags: [
      "database",
      "banco",
      "postgresql",
      "mysql",
      "sqlserver",
      "oracle",
      "sqlite",
      "fleet",
      "infra",
      "observabilidade",
      "feedback",
      "grid",
    ],
  },
  {
    slug: "incident-timeline",
    name: "Incident Timeline",
    category: "Feedback",
    description:
      "Timeline vertical de eventos de um incidente (detect → page → escalate → mitigate → resolve, etc.) com sticky header de status/severidade, nós circulares coloridos por severidade, chips por tipo de evento, timestamps relativo e absoluto, autor opcional e modo live que re-renderiza tempos a cada 30s. Inspirado no ObservabilityCenter, reutilizável para qualquer fluxo de incident response.",
    tags: [
      "timeline",
      "incidente",
      "incident",
      "observabilidade",
      "observability",
      "eventos",
      "events",
      "sre",
      "alert",
      "pager",
      "postmortem",
      "feedback",
    ],
    usage:
      "Use em painéis de incident response, status pages e postmortem. Passe `events` ordenados cronologicamente, `status` para o badge do header (ongoing/mitigated/resolved) e `severity` para a cor global. Ative `live` para re-renderizar tempos relativos a cada 30s em incidentes em andamento. `onEventClick` recebe o evento clicado para abrir detalhes, side-panel ou navegar para a página do alerta.",
  },
  {
    slug: "bar-chart",
    name: "Bar Chart",
    category: "Feedback",
    description:
      "Gráfico de barras verticais minimalista feito só com divs: altura proporcional ao maior valor da série e cor de preenchimento configurável via `accent`. Sem dependências, ideal para mini-gráficos de receita/uso em dashboards.",
    tags: [
      "grafico",
      "chart",
      "barras",
      "bar",
      "vertical",
      "dashboard",
      "metricas",
      "dados",
      "analytics",
      "feedback",
    ],
    usage:
      "Passe `series` como lista de `{ label, value }`; o maior valor vira o topo (100%) e os demais são normalizados. Use `accent` (classe Tailwind, ex.: \"bg-emerald-500\") para trocar a cor das barras. Bom para painéis de receita por mês, visitantes por dia, etc.",
  },
  {
    slug: "h-bar-chart",
    name: "Horizontal Bar Chart",
    category: "Feedback",
    description:
      "Gráfico de barras horizontais minimalista feito só com divs: rótulo à esquerda, trilha preenchida proporcional ao maior valor e valor à direita. Sem dependências, ideal para rankings e comparações (ex.: canais de aquisição) em dashboards.",
    tags: [
      "grafico",
      "chart",
      "barras",
      "bar",
      "horizontal",
      "ranking",
      "dashboard",
      "metricas",
      "dados",
      "analytics",
      "feedback",
    ],
    usage:
      "Passe `series` como lista de `{ label, value }`; o maior valor vira a barra cheia (100%) e os demais são normalizados. Use quando precisar comparar poucas categorias com rótulos longos — as barras horizontais acomodam o texto melhor que o Bar Chart vertical.",
  },
  {
    slug: "donut-chart",
    name: "Donut Chart",
    category: "Feedback",
    description:
      "Donut/anel genérico em SVG montado a partir de arcos: trilha de fundo + um arco por segmento, com comprimento proporcional ao total e cor por classe Tailwind. Vão central livre para um rótulo absoluto. Sem dependências, ideal para distribuições (mix de planos, share) em dashboards.",
    tags: [
      "grafico",
      "chart",
      "donut",
      "rosca",
      "pizza",
      "svg",
      "distribuicao",
      "dashboard",
      "metricas",
      "analytics",
      "feedback",
    ],
    usage:
      "Passe `segments` como lista de `{ label, value, className }`, onde `className` é a cor do arco (ex.: \"stroke-primary\"). Ajuste `size`/`thickness` para o diâmetro e a espessura do anel. Sobreponha um rótulo central com um elemento posicionado de forma absoluta sobre um wrapper relativo do mesmo tamanho.",
  },
  {
    slug: "kpi-card",
    name: "KPI Card",
    category: "Feedback",
    description:
      "Cartão de métrica para dashboards: rótulo, valor numérico animado (AnimatedNumber) com prefixo/sufixo opcionais, ícone e um badge de variação (`delta`) colorido por tendência (verde/vermelho). API genérica, pronta para reuso em qualquer painel de KPIs.",
    tags: [
      "kpi",
      "metrica",
      "card",
      "cartao",
      "indicador",
      "stat",
      "delta",
      "tendencia",
      "dashboard",
      "analytics",
      "feedback",
    ],
    usage:
      "Passe `label`, `value` e, opcionalmente, `prefix`/`suffix` (ex.: \"$\" e \".3%\"), `icon` e `delta` (variação em %). A cor do badge é derivada do sinal de `delta`, mas pode ser forçada com `trend` (\"up\"/\"down\"). Use `hint` para trocar o texto auxiliar (default: \"vs. período anterior\"). Combine vários em um grid para o topo do dashboard.",
  },
  {
    slug: "sparkline",
    name: "Sparkline",
    category: "Feedback",
    description:
      "Mini-gráfico de linha em SVG (polyline + área translúcida) feito sem dependências. A escala vertical é normalizada ao min/max da série; cores da linha e da área são classes Tailwind. Ideal para tendências compactas dentro de cards e KPIs.",
    tags: [
      "sparkline",
      "grafico",
      "chart",
      "linha",
      "line",
      "tendencia",
      "trend",
      "svg",
      "dashboard",
      "analytics",
      "feedback",
    ],
    usage:
      "Passe `data` como `number[]`; o desenho normaliza ao menor/maior valor. Troque `stroke` e `fill` (classes Tailwind, ex.: \"stroke-emerald-500\" / \"fill-emerald-500/10\") para mudar as cores e `strokeWidth` para a espessura. O tamanho renderizado vem do className (default ocupa a largura total, altura `h-14`); `width`/`height` ajustam só o viewBox.",
  },
  {
    slug: "dashboard-panel",
    name: "Dashboard Panel",
    category: "Layout",
    description:
      "Card-shell de painel para dashboards: borda/sombra padrão e um header com título, descrição opcional e um slot de ação à direita; o conteúdo vai em children. Inclui um ponto de extensão `glow` reservado para uma futura variante com brilho.",
    tags: [
      "panel",
      "painel",
      "card",
      "container",
      "shell",
      "dashboard",
      "section",
      "header",
      "layout",
    ],
    usage:
      "Passe `title` e, opcionalmente, `description` e `action` (um Badge, Button ou Select renderizado no canto direito do header). O conteúdo do painel vai como children. Use para padronizar os blocos de um dashboard (gráficos, tabelas, listas). A prop `glow` é reservada para a futura variante com brilho e hoje apenas marca o elemento (`data-glow`).",
  },
  {
    slug: "detail-stat-cell",
    name: "Detail Stat Cell",
    category: "Feedback",
    description:
      "Célula de rótulo + valor para grades de detalhe: rótulo discreto no topo (com ícone opcional) e o valor/conteúdo logo abaixo, dentro de um bloco com borda suave. Pensada para resumos em duas colunas (cartão/diálogo de cliente, fatura, recurso).",
    tags: [
      "detalhe",
      "detail",
      "stat",
      "celula",
      "campo",
      "label",
      "valor",
      "resumo",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `label` e, opcionalmente, `icon`; o valor vai como children. Combine várias células em um grid (ex.: `grid grid-cols-2 gap-4`) para montar o resumo de uma entidade. Os children aceitam qualquer conteúdo — texto, Badge, status com bolinha, ID em fonte mono, etc.",
  },
  {
    slug: "preference-row",
    name: "Preference Row",
    category: "Forms",
    description:
      "Linha de preferência/toggle para telas de configurações: título (label) e descrição opcional à esquerda, com um slot para o controle (Switch, Select, Button…) à direita. Pensada para listas separadas por divisória; sem estado próprio (o controle vive fora).",
    tags: [
      "preferencia",
      "preference",
      "toggle",
      "settings",
      "configuracoes",
      "switch",
      "linha",
      "row",
      "label",
      "forms",
    ],
    usage:
      "Passe `label` e, opcionalmente, `description`; o controle vai como children ou pela prop `control` (quando ambos existem, `control` tem prioridade). Empilhe várias linhas num container com `divide-y divide-border` para o visual de painel de preferências. O estado do controle (ex.: um Switch controlado) fica por sua conta, fora do componente.",
  },
  {
    slug: "activity-feed",
    name: "Activity Feed",
    category: "Feedback",
    description:
      "Feed de eventos recentes com avatar, frase \"{ator} {ação} {alvo}\" e timestamp relativo. Itens separados por divisória dentro de um container rolável de altura limitada — ideal para o card \"Atividade recente\" de um dashboard. Sem estado próprio; os dados vêm por props.",
    tags: [
      "atividade",
      "activity",
      "feed",
      "eventos",
      "timeline",
      "avatar",
      "timestamp",
      "dashboard",
      "audit",
      "feedback",
    ],
    usage:
      "Passe `items` como lista de `{ id, name, action, target?, time, avatar?, fallback? }`. Sem `avatar`, o item mostra apenas o fallback (default: 2 primeiras letras do nome). `target` é opcional. Ajuste a altura do scroll sobrescrevendo o className do container (default `max-h-[280px] overflow-y-auto`).",
  },
  {
    slug: "leaderboard-list",
    name: "Leaderboard List",
    category: "Feedback",
    description:
      "Ranking de itens com posição, avatar, nome + barra de progresso, badge opcional e valor formatado alinhado à direita. Ideal para \"Top clientes por MRR\", \"Top produtos\" e afins. O valor vem já formatado e o progresso (0..100) já calculado — sem suposição de moeda ou escala.",
    tags: [
      "ranking",
      "leaderboard",
      "top",
      "lista",
      "progresso",
      "progress",
      "avatar",
      "mrr",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `items` como lista de `{ id, name, value, progress, rank?, avatar?, fallback?, badge? }`. `value` é uma string já formatada (ex.: \"$1,200\"); `progress` é 0..100 (largura da barra). `rank` é opcional (default: índice + 1) e `badge` é um slot livre, normalmente um `<Badge>`.",
  },
  {
    slug: "invoice-table",
    name: "Invoice Table",
    category: "Layout",
    description:
      "Tabela compacta de itens de uma fatura (item, quantidade, valor) com header discreto; cada linha mostra o valor calculado como `qty × unit`. Opcionalmente renderiza uma linha de total no rodapé. Valores formatados por `formatValue` (default \"$\" + en-US), sem assumir moeda.",
    tags: [
      "fatura",
      "invoice",
      "tabela",
      "table",
      "cobranca",
      "billing",
      "itens",
      "total",
      "dashboard",
      "layout",
    ],
    usage:
      "Passe `items` como lista de `{ label, qty, unit }`; o valor de cada linha é `qty * unit`. Use `total` para exibir a linha de total no `<tfoot>`. Troque `formatValue` para mudar a moeda/escala e `labels` para renomear as colunas (item/qty/value/total).",
  },
  {
    slug: "dashboard-sidebar-nav",
    name: "Dashboard Sidebar Nav",
    category: "Layout",
    description:
      "Barra lateral de navegação para layouts de dashboard/app: marca/brand no topo, lista de itens com ícone e destaque do item ativo, e um rodapé opcional fixado embaixo (ex.: card de upgrade). Navegação 100% controlada por props — sem estado próprio.",
    tags: [
      "sidebar",
      "navegacao",
      "navigation",
      "nav",
      "aside",
      "menu-lateral",
      "dashboard",
      "app-shell",
      "layout",
      "shared",
    ],
    usage:
      "Passe `items` como lista de `{ id, label, icon? }`, mais `activeId` (item destacado) e `onSelect(id)` para reagir aos cliques — o estado de navegação fica fora do componente. Use `brand` (envolto num cabeçalho padrão) ou `header` (conteúdo cru) no topo e `footer` para o conteúdo de baixo (ex.: card de upgrade). Acrescente `hidden md:flex` ao className para esconder a sidebar no mobile.",
  },
  {
    slug: "dashboard-user-menu",
    name: "Dashboard User Menu",
    category: "Actions",
    description:
      "Gatilho de avatar + dropdown do usuário para a topbar: avatar (com chevron opcional) que abre um menu com cabeçalho de identidade (nome + e-mail) e uma lista de ações vindas por props, com suporte a item destrutivo e separadores.",
    tags: [
      "user-menu",
      "menu-usuario",
      "avatar",
      "dropdown",
      "account",
      "conta",
      "topbar",
      "perfil",
      "dashboard",
      "actions",
    ],
    usage:
      "Passe `name` e, opcionalmente, `email`/`avatar`/`fallback`. As ações vão em `items` como `{ id, label, icon?, destructive?, separatorBefore? }` e disparam `onSelect(id)`. Use `separatorBefore` para isolar um item (ex.: 'Sair') e `destructive` para destacá-lo. `children` injeta conteúdo extra ao fim do menu; `align`/`showChevron` ajustam o gatilho.",
  },
  {
    slug: "donut-breakdown",
    name: "Donut Breakdown",
    category: "Feedback",
    description:
      "Bloco de distribuição: combina um DonutChart (anel proporcional) com uma legenda (bolinha de cor + rótulo + valor) e um rótulo central opcional (ex.: total). Ideal para 'Distribuição de planos', 'Mix de receita por categoria' e afins. Reusa o DonutChart internamente.",
    tags: [
      "donut",
      "breakdown",
      "distribuicao",
      "distribution",
      "pie",
      "legenda",
      "legend",
      "chart",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `segments` como `{ label, value, className?, dotClassName? }` — `className` é a cor do arco (ex.: 'stroke-primary') e `dotClassName` a da bolinha da legenda (default: derivada do `className`). Use `centerLabel`/`centerSublabel` para o miolo do anel, `title` para um título acima e `orientation` ('horizontal' = legenda à direita, 'vertical' = abaixo). `size` controla o diâmetro.",
  },
  {
    slug: "stat-tile",
    name: "Stat Tile",
    category: "Feedback",
    description:
      "Mini-card de estatística para dashboards: ícone opcional + rótulo, valor numérico animado (via AnimatedNumber) com prefixo/sufixo, e um badge de variação (delta) opcional colorido por tendência. Versão compacta do KpiCard, para grades densas de métricas.",
    tags: [
      "stat",
      "estatistica",
      "metric",
      "metrica",
      "tile",
      "mini-card",
      "kpi",
      "dashboard",
      "feedback",
      "shared",
    ],
    usage:
      "Passe `label` e `value` (animado). Use `prefix`/`suffix` para moeda ou unidades (ex.: ' dias'), `icon` para o ícone antes do rótulo e, opcionalmente, `delta` (badge de variação: verde >= 0, vermelho < 0) com `trend` para forçar a direção e `hint` para um texto auxiliar.",
  },
  {
    slug: "dashboard-topbar",
    name: "Dashboard Topbar",
    category: "Layout",
    description:
      "Barra superior (header) para layouts de dashboard/app: botão de menu opcional (mobile), título com adorno opcional ao lado (ex.: badge de status), slot de busca (ou campo padrão via onSearch) e as ações à direita. Sem estado de UI hardcoded — tudo vem por props.",
    tags: [
      "topbar",
      "header",
      "appbar",
      "barra-superior",
      "navbar",
      "toolbar",
      "dashboard",
      "app-shell",
      "layout",
      "shared",
    ],
    usage:
      "Passe `title` e, opcionalmente, `titleAdornment` (ex.: um badge ao lado). Para a busca, use o slot `search` (tem prioridade) ou `onSearch` (renderiza um campo padrão com `searchPlaceholder`). As ações à direita vão em `actions` (ou `children`). Use `onMenu` para exibir o botão de menu no mobile.",
  },
  {
    slug: "upgrade-card",
    name: "Upgrade Card",
    category: "Feedback",
    description:
      "Card promocional de upgrade de plano: título, descrição opcional e um CTA (botão via onClick ou link via href), com ícone opcional. Ideal para o rodapé de uma sidebar de dashboard ('Plano Pro / Fazer upgrade'), mas genérico para qualquer call-to-action.",
    tags: [
      "upgrade",
      "plano",
      "plan",
      "cta",
      "call-to-action",
      "billing",
      "pricing",
      "sidebar",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `title` e, opcionalmente, `description`. O CTA vai em `cta` como `{ label, onClick? }` (botão) ou `{ label, href }` (link `<a>`, tem prioridade sobre onClick). Use `icon` para um ícone antes do título.",
  },
  {
    slug: "radial-gauge",
    name: "Radial Gauge",
    category: "Feedback",
    description:
      "Medidor radial de arco SVG (270°) com trilha de fundo, arco de valor com glow e miolo de valor/unidade/rótulo (ou children custom). A cor do arco é fixa (`color`) ou derivada por faixa de valor (`thresholds`). Ideal para SLO, saturação (CPU/memória/disco) e disponibilidade.",
    tags: [
      "gauge",
      "medidor",
      "radial",
      "arc",
      "arco",
      "slo",
      "saturation",
      "dashboard",
      "feedback",
      "shared",
    ],
    usage:
      "Passe `value` (normalizado em `[min, max]`, default 0–100). Use `color` para uma cor fixa do arco ou `thresholds` (`{ upTo, color }[]`) para colorir por faixa. `size`/`thickness` controlam o diâmetro/espessura; `label`/`unit` preenchem o miolo padrão, ou passe `children` para um miolo custom.",
  },
  {
    slug: "signal-card",
    name: "Signal Card",
    category: "Feedback",
    description:
      "Cartão de 'golden signal' para observabilidade: ícone + rótulo, valor (com unidade), indicador de variação (trend com seta colorida por polaridade) e uma mini-sparkline. Reusa o componente Sparkline por baixo. A cor de acento vem de `tone` ou é derivada de `status`.",
    tags: [
      "signal",
      "golden-signal",
      "sinal",
      "metric",
      "metrica",
      "sparkline",
      "observability",
      "dashboard",
      "feedback",
      "shared",
    ],
    usage:
      "Passe `label`, `value` (string já formatada) e `data` (série da sparkline). Use `unit` para a unidade ao lado do valor, `icon` antes do rótulo e `trend` (fração assinada, ex.: 0.04 = +4%) com `trendPolarity` ('up-good' | 'up-bad') para o indicador de variação. A cor de acento vem de `tone` ('sky' | 'amber' | 'rose'…) ou, na ausência dele, de `status` ('healthy' | 'degraded' | 'critical').",
  },
  {
    slug: "ecg-strip",
    name: "ECG Strip",
    category: "Feedback",
    description:
      "Faixa de 'batimento' (eletrocardiograma) animada em SVG, varrendo horizontalmente via requestAnimationFrame com glow na cor do traço (loop sem costura). Velocidade, amplitude e cor são controláveis, e a animação pode ser congelada — o rAF é sempre cancelado no unmount. Dá um pulso 'vivo' a headers de observabilidade.",
    tags: [
      "ecg",
      "heartbeat",
      "batimento",
      "pulse",
      "pulso",
      "waveform",
      "animation",
      "observability",
      "dashboard",
      "feedback",
    ],
    usage:
      "Coloque dentro de um container com altura definida (o <svg> ocupa 100%). Use `color` (CSS) para o traço/glow, `speed` (multiplicador de velocidade) e `amplitude` (pico R) para o ritmo, e `paused` para congelar. `height` controla apenas o viewBox.",
  },
  {
    slug: "service-mesh",
    name: "Service Mesh",
    category: "Feedback",
    description:
      "Malha viva de serviços: grafo de nós ligados por arestas curvas com PACOTES de tráfego trafegando ao vivo (SVG + requestAnimationFrame, cauda de cometa) coloridos por severidade do trecho, distribuídos pelo peso de cada nó. Nós em alarme/selecionados ganham glow e radar pings. Autocontido (PRNG, geometria e animações CSS escopadas inclusos); o rAF é sempre cancelado no unmount.",
    tags: [
      "service-mesh",
      "mesh",
      "malha",
      "topology",
      "topologia",
      "graph",
      "grafo",
      "network",
      "packets",
      "observability",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `nodes` (`{ id, label, x, y, status?, weight?, meta? }[]`) e `edges` (`{ from, to, bow? }[]`); `weight` (ex.: rps) pondera a quantidade de pacotes por aresta. Use `width`/`height` para o viewBox (o sistema de coordenadas dos `x`/`y`), `selectedId` + `onSelect` para seleção, `pingIds` para destacar nós (ex.: incidente), `paused`/`speed`/`particleCount` para o tráfego, e `statusColors`/`packetColors`/`statusLabels` para customizar cores/rótulos.",
  },
  {
    slug: "log-stream",
    name: "Log Stream",
    category: "Feedback",
    description:
      "Stream de logs estilo terminal, com fonte monoespaçada e linhas densas (horário, nível colorido, serviço, método + path, código de status tingido por faixa HTTP, duração e mensagem). No topo, chips de filtro por nível com contagem — controlados (via `levels` + `onToggleLevel`) ou internos (estado próprio, tudo ligado por padrão).",
    tags: [
      "log-stream",
      "logs",
      "log",
      "stream",
      "terminal",
      "console",
      "filter",
      "filtro",
      "observability",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `entries` (`{ level, message?, code?, method?, path?, service?, ms?, time? }[]`). Para filtros controlados, passe `levels` (mapa nível→ativo) + `onToggleLevel`; omitindo `levels`, o componente mantém o próprio estado. Use `levelOrder`/`levelStyles` para customizar os níveis, `showFilters={false}` para esconder a barra, e `scrollClassName`/`className` para a altura/área rolável.",
  },
  {
    slug: "trace-waterfall",
    name: "Trace Waterfall",
    category: "Feedback",
    description:
      "Cascata (waterfall) de spans de um trace distribuído: cada span é uma barra posicionada/dimensionada por início/duração sobre uma escala total, indentada por profundidade e tingida pelo status (verde/âmbar/vermelho, com glow) — um heatmap de latência p95 por span. Mensagem opcional de 'serviço folha' quando há ≤1 span.",
    tags: [
      "trace-waterfall",
      "trace",
      "waterfall",
      "cascata",
      "spans",
      "span",
      "latency",
      "latencia",
      "heatmap",
      "observability",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `spans` (`{ label, start, duration, service?, status?, depth?, valueLabel? }[]`); `start`/`duration` são frações de `total` (a escala; se omitido, é inferido do maior `start + duration`). Use `valueLabel` para o número à direita (default = duração formatada via `formatValue`), `statusColors` para as cores das barras, `minWidthPct` para a largura mínima visível e `leafLabel` para a mensagem de serviço folha.",
  },
  {
    slug: "collapsible-section",
    name: "Collapsible Section",
    category: "Layout",
    description:
      "Seção colapsável com header clicável (chevron + ícone + título + slot de ação) e conteúdo que aparece/some. Funciona controlada (open + onOpenChange) ou não-controlada (defaultOpen). O slot de ação fica fora do botão de toggle, permitindo ações interativas próprias (ex.: um '+'). Ideal para sidebars e acordeões de seções.",
    tags: [
      "collapsible",
      "colapsavel",
      "section",
      "secao",
      "accordion",
      "acordeao",
      "sidebar",
      "disclosure",
      "layout",
      "shared",
    ],
    usage:
      "Passe `title` e, opcionalmente, `icon` e `action` (slot à direita do header, ex.: um badge de contagem). Controle o estado com `open` + `onOpenChange` ou deixe não-controlado com `defaultOpen` (default aberto). Use `headerClassName`/`contentClassName` para ajustar o estilo do header/conteúdo.",
  },
  {
    slug: "database-tab-bar",
    name: "Database Tab Bar",
    category: "Actions",
    description:
      "Barra de abas estilo VS Code para 'documentos' abertos (bancos, arquivos, queries). Cada aba tem rótulo, ícone opcional, um slot de meta (ex.: badge de engine) e, quando 'suja' (dirty), mostra um ponto que vira o 'X' de fechar no hover. Um botão '+' opcional dispara onNew. 100% controlada por props.",
    tags: [
      "tabs",
      "abas",
      "tab-bar",
      "vscode",
      "editor",
      "database",
      "banco",
      "navigation",
      "actions",
      "dashboard",
    ],
    usage:
      "Passe `tabs` (`{ id, label, icon?, dirty?, meta? }[]`), `activeId` e `onSelect`. Use `onClose` para exibir o 'X' de fechar em cada aba (abas `dirty` mostram um ponto que vira 'X' no hover) e `onNew` para o botão '+' ao fim (com `newLabel` para o rótulo acessível).",
  },
  {
    slug: "connection-list",
    name: "Connection List",
    category: "Feedback",
    description:
      "Lista de conexões/instâncias (bancos, servidores) para uma sidebar: cada item tem um indicador de status (ponto), nome e um slot de meta à direita; o item ativo recebe destaque. Sem estado próprio — tudo vem por props.",
    tags: [
      "connection",
      "conexao",
      "list",
      "lista",
      "sidebar",
      "database",
      "server",
      "status",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `items` (`{ id, name, meta?, status? }[]`), `activeId` e `onSelect`. O ponto de status é colorido por `status` (online/offline/warning) ou, na ausência dele, por ativo (verde) vs. inativo (cinza). `meta` é um slot livre à direita (ex.: '4sch').",
  },
  {
    slug: "favorites-list",
    name: "Favorites List",
    category: "Feedback",
    description:
      "Lista de itens favoritados (estrela) para uma sidebar: cada item mostra uma estrela preenchida e um rótulo (mono por padrão). Opcionalmente, um botão de remover (StarOff) aparece no hover. Mostra um estado vazio quando não há itens.",
    tags: [
      "favorites",
      "favoritos",
      "star",
      "estrela",
      "bookmark",
      "list",
      "lista",
      "sidebar",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `items` (`{ id, label }[]`) e `onSelect`. Use `onRemove` para exibir um botão de remover (StarOff) no hover de cada item e `emptyLabel` para customizar o estado vazio (default: 'Nenhum favorito').",
  },
  {
    slug: "query-history-list",
    name: "Query History List",
    category: "Feedback",
    description:
      "Histórico de queries (SQL) recentes para uma sidebar: cada item é um cartão com o SQL colapsado em uma linha (truncado) e uma linha de meta com duração e horário relativo. Controlada por props.",
    tags: [
      "query",
      "sql",
      "history",
      "historico",
      "list",
      "lista",
      "sidebar",
      "database",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `items` (`{ id, sql, durationMs?, timeLabel? }[]`) e `onSelect` (recebe o item clicado). `sql` é colapsado em uma linha e truncado por `maxLength` (default 60); `timeLabel` é o horário já formatado (ex.: 'há 7 min').",
  },
  {
    slug: "table-info-panel",
    name: "Table Info Panel",
    category: "Feedback",
    description:
      "Painel de inspeção de uma tabela de banco: cabeçalho com schema.tabela + descrição, dois StatTiles (linhas e tamanho) e listas roláveis de colunas, índices e foreign keys, com estado vazio e botão de favoritar. Reusa StatTile, ScrollArea e Button do acervo; as FKs viram clicáveis quando onNavigateFk é passado.",
    tags: [
      "table",
      "tabela",
      "info",
      "schema",
      "columns",
      "colunas",
      "index",
      "foreign-key",
      "database",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `table` (`{ name, columns, indexes, foreignKeys, rowCount?, sizeMB?, description? }`) e, opcionalmente, `schemaName` (prefixo). `null`/`undefined` mostra o estado vazio (customize via `emptyHint`). Use `onNavigateFk` para tornar as FKs clicáveis e `isFavorite` + `onToggleFavorite` para o botão de favoritar.",
  },
  {
    slug: "workbench-status-bar",
    name: "Workbench Status Bar",
    category: "Feedback",
    description:
      "Barra de status (rodapé) estilo IDE: uma faixa fina, densa e rolável horizontalmente, com slots de itens à esquerda e à direita (o grupo da direita é empurrado com ml-auto). Só a casca visual — o conteúdo dos segmentos vem por props.",
    tags: [
      "status-bar",
      "statusbar",
      "footer",
      "rodape",
      "ide",
      "workbench",
      "vscode",
      "dashboard",
      "feedback",
      "shared",
    ],
    usage:
      "Passe `left` e `right` com o conteúdo já montado (spans com ícones/pontos de status). O grupo `right` é alinhado à direita automaticamente. Aceita className/props padrão de um <footer> para ajustes finos.",
  },
  {
    slug: "user-list-item",
    name: "User List Item",
    category: "Feedback",
    description:
      "Linha de usuário para listas de pessoas em dashboards: avatar (com fallback de iniciais) + nome e e-mail à esquerda; à direita um slot para status/badge e/ou ações. Reusa Avatar e Badge do acervo; sem estado próprio. A casca (borda/padding) fica por conta do consumidor via className.",
    tags: [
      "user",
      "usuario",
      "list",
      "lista",
      "avatar",
      "pessoa",
      "row",
      "linha",
      "membro",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `name` e, opcionalmente, `email`, `avatar` (URL), `fallback` (iniciais) e `meta` (linha auxiliar). À direita, use `status` (renderiza um Badge interno) ou `badge` (elemento pronto, tem prioridade) e/ou `actions`/children. Adicione `border`/`padding` por className para o visual de caixa, ou empilhe em `divide-y` para o visual de lista.",
  },
  {
    slug: "metric-glow-card",
    name: "Metric Glow Card",
    category: "Feedback",
    description:
      "Conteúdo de métrica centrado para dashboards de destaque: rótulo em maiúsculas, valor em string livre (ex.: \"R$ 124.500\", \"4m 32s\") e uma variação colorida por tendência (verde/vermelho). É só o conteúdo, pensado para morar dentro de uma casca com brilho (ex.: o GlowCard do glow-card-grid).",
    tags: [
      "metrica",
      "metric",
      "kpi",
      "glow",
      "brilho",
      "card",
      "valor",
      "delta",
      "destaque",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `title`, `value` (string já formatada) e, opcionalmente, `change` + `positive` (verde quando true, vermelho quando false). Diferente do KpiCard (que tem chrome de card, valor numérico animado e badge em pílula), aqui o valor é string e o layout é centrado, sem chrome — coloque-o dentro de uma casca como o GlowCard (registryDependency na composição) para o efeito de brilho.",
  },
  {
    slug: "latency-heatmap",
    name: "Latency Heatmap",
    category: "Feedback",
    description:
      "Grade (heatmap) de latência/intensidade em CSS grid: matriz coluna-maior em que cada célula recebe uma cor via escala configurável, com eixos opcionais (lento/rápido à esquerda, janela/agora abaixo). Totalmente desacoplado de simulação — só recebe a matriz e renderiza.",
    tags: [
      "heatmap",
      "mapa-calor",
      "grade",
      "grid",
      "latencia",
      "latency",
      "matriz",
      "observability",
      "dashboard",
      "feedback",
    ],
    usage:
      "Passe `columns` como `number[][]` (coluna-maior: cada coluna é um array de valores por linha, 0..1) e, opcionalmente, `rows`. Troque a paleta com `colorScale` (recebe o valor e devolve cor CSS; default teal→âmbar→rosa) e ajuste os eixos com `rowLabels`/`colLabels` (ou `false` para esconder). Bom para a janela rolante de p95 por tick em centros de observabilidade.",
  },
  {
    slug: "line-chart",
    name: "Line Chart",
    category: "Feedback",
    description:
      "Gráfico de linha em SVG puro com eixos, grid tracejado, preenchimento de área translúcida e legenda. Suporta múltiplas séries temporais sobrepostas com normalização automática de escala (min/max global). Sem dependências externas — apenas SVG + classes Tailwind.",
    tags: [
      "chart",
      "grafico",
      "linha",
      "line",
      "svg",
      "series",
      "timeseries",
      "dashboard",
      "analytics",
      "feedback",
    ],
  },
  {
    slug: "chart-widget",
    name: "Chart Widget",
    category: "Feedback",
    description:
      "Casca de widget para gráficos com header (título + badge de tipo + ações), body (com estado loading via Skeleton) e footer opcional (query + duração). Envolve qualquer visualização num container consistente — passe o gráfico como children.",
    tags: [
      "widget",
      "card",
      "chart",
      "grafico",
      "container",
      "dashboard",
      "analytics",
      "feedback",
    ],
  },
  {
    slug: "dashboard-filter-bar",
    name: "Dashboard Filter Bar",
    category: "Feedback",
    description:
      "Barra de filtros para dashboards com date range pickers (de/até), seletor de fonte de dados (Select) e chips de filtros ativos removíveis (Badge com botão X). Layout flex-wrap que se adapta à largura disponível.",
    tags: [
      "filter",
      "filtro",
      "bar",
      "date-range",
      "select",
      "chips",
      "dashboard",
      "analytics",
      "feedback",
    ],
  },
  {
    slug: "chart-template-gallery",
    name: "Chart Template Gallery",
    category: "Feedback",
    description:
      "Galeria de templates de gráficos selecionáveis em grid 2 colunas. Cada template tem ícone, nome, descrição e preview opcional. Suporta seleção única com estado visual (borda destacada, aria-pressed). Navegação por teclado (Enter/Space).",
    tags: [
      "gallery",
      "galeria",
      "template",
      "chart",
      "grafico",
      "grid",
      "selectable",
      "dashboard",
      "analytics",
      "feedback",
    ],
  },
]

/** Busca um componente pelo slug (usado na Task 3 — página de detalhe). */
export function getComponentBySlug(slug: string): ComponentMeta | undefined {
  return components.find((c) => c.slug === slug)
}