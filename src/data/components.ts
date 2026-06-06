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
    slug: "lamp-effect",
    name: "Lamp Effect",
    category: "Feedback",
    description:
      "Efeito \"lâmpada\" da Aceternity UI: dois cones de luz cônicos (conic-gradient) com blur que crescem ao entrar na viewport, acompanhados de uma linha brilhante horizontal, projetando luz ciano sobre um fundo escuro (slate-950) para revelar um título abaixo. Animado por whileInView de motion/react.",
    tags: ["lamp", "light", "glow", "hero", "conic", "aceternity"],
  },
]

/** Busca um componente pelo slug (usado na Task 3 — página de detalhe). */
export function getComponentBySlug(slug: string): ComponentMeta | undefined {
  return components.find((c) => c.slug === slug)
}
