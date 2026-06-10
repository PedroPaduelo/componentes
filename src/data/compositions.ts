export type Composition = {
  slug: string
  name: string
  description: string
  tags: string[]
  category?: string
  /**
   * Quando `true`, a página de detalhe usa um container mais largo
   * (telas densas tipo IDE). Ausente/false mantém a largura padrão.
   */
  wide?: boolean
}

/**
 * Registry de "composições" — telas inteiras montadas a partir dos
 * componentes da vitrine. Cada entrada vira um card na galeria
 * (/compositions) e uma página de preview (/compositions/:slug).
 */
export const compositions: Composition[] = [
  {
    slug: "landing-page",
    name: "Landing / Hero",
    description:
      "Página de entrada com hero, chamada para ação e seções de destaque montadas com componentes da vitrine.",
    tags: ["hero", "marketing", "cta"],
    category: "Marketing",
  },
  {
    slug: "saas-dashboard",
    name: "SaaS Dashboard",
    description:
      "Painel de aplicação com cabeçalho, navegação lateral, cartões de métricas e tabelas de dados.",
    tags: ["dashboard", "app", "métricas"],
    category: "Aplicação",
  },
  {
    slug: "saas-dashboard-pro",
    name: "Dashboard SaaS Completo",
    description:
      "App de gestão navegável: sidebar troca seções (Overview/Analytics/Customers/Settings), tabela de clientes filtrável e paginada com detalhe em overlay, e preferências com toggles funcionais.",
    tags: ["dashboard", "app", "interativo"],
    category: "Aplicação",
  },
  {
    slug: "pricing-page",
    name: "Pricing",
    description:
      "Tabela de planos com destaque para o plano recomendado, lista de benefícios e botões de conversão.",
    tags: ["pricing", "planos", "conversão"],
    category: "Marketing",
  },
  {
    slug: "testimonials-wall",
    name: "Testimonials Wall",
    description:
      "Mural de depoimentos em mosaico com avatares, citações e identidade de cada cliente.",
    tags: ["depoimentos", "social proof", "mural"],
    category: "Marketing",
  },
  {
    slug: "hero-gallery",
    name: "Hero Gallery",
    description:
      "Vitrine visual com galeria de imagens em destaque e efeitos de profundidade para portfólios e produtos.",
    tags: ["galeria", "showcase", "portfólio"],
    category: "Showcase",
  },
  {
    slug: "backgrounds-showcase",
    name: "Backgrounds Showcase",
    description:
      "Galeria de fundos animados — partículas, beams, grids e máscaras — cada seção com um efeito de background diferente.",
    tags: ["backgrounds", "animação", "galeria"],
    category: "Showcase",
  },
  {
    slug: "text-effects-showcase",
    name: "Text Effects Playground",
    description:
      "Gerador interativo de texto animado: digite seu texto, escolha um efeito (gradiente, shimmer, flip, glitch, encrypted e mais), ajuste os parâmetros ao vivo e copie o JSX pronto — com uma seção de uso em contexto real.",
    tags: ["texto", "efeitos", "playground", "gerador", "animação"],
    category: "Showcase",
  },
  {
    slug: "signup-form",
    name: "Onboarding Form",
    description:
      "Formulário de cadastro/onboarding em múltiplas seções, reunindo todos os campos e controles de entrada da vitrine.",
    tags: ["formulário", "onboarding", "inputs"],
    category: "Aplicação",
  },
  {
    slug: "chat-app",
    name: "Chat / IA",
    description:
      "Assistente de IA em 3 painéis: sidebar de conversas com busca e nova conversa, thread central com raciocínio e composer com anexo, e painel de contexto com modelo, tópicos e ações. Trocar de conversa muda o histórico e enviar dispara resposta simulada com scroll automático.",
    tags: ["chat", "ia", "assistente", "app", "interativo"],
    category: "Aplicação",
  },
  {
    slug: "chat-inbox-pro",
    name: "Chat / Inbox Completo",
    description:
      "Inbox de mensagens com lista de conversas (busca controlada, abas Todas/Não lidas/Favoritas, fixadas no topo, presença online/ausente, ticks, badge de não-lidas, favorito) e thread com header de presença e ações (Fixar, Marcar não lida, Silenciar, Limpar), separadores de data, agrupamento de mensagens consecutivas do mesmo autor, avatares no contato, auto-scroll e resposta simulada com indicador de digitação. Selecionar zera não-lidas e enviar adiciona a mensagem na thread certa. Inclui quick replies em chips, painel de detalhes do contato (com SwitchFluid) e responsividade 390px (lista vira drawer Sheet em viewport estreito).",
    tags: [
      "chat",
      "inbox",
      "mensagens",
      "busca",
      "abas",
      "presença",
      "app",
      "interativo",
    ],
    category: "Aplicação",
  },
  {
    slug: "component-playground",
    name: "Quadro Kanban",
    description:
      "Board de projeto interativo estilo Trello/Linear: colunas por status com contador, cards arrastáveis entre colunas (drag-and-drop nativo), criação de tarefa em diálogo, menu de ações por card e filtros por busca, prioridade e responsável.",
    tags: ["kanban", "board", "drag and drop", "tarefas", "interativo"],
    category: "Aplicação",
  },
  {
    slug: "ai-agents-platform",
    name: "Plataforma de Agentes de IA",
    description:
      "App de 3 painéis: sidebar de agentes, chat com painel de execução (steps + indicador) e painel de ferramentas com toggles e métricas animadas.",
    tags: ["agentes", "ia", "app"],
    category: "Aplicação",
  },
  {
    slug: "product-showcase",
    name: "Product Showcase",
    description: "Tela de showcase de produto com MacBook scroll, galeria bento e equipe animada.",
    tags: ["showcase", "produto", "macbook", "bento", "equipe"],
    category: "Showcase",
  },
  {
    slug: "world-map-explorer",
    name: "World Map Explorer",
    description: "Explorador mundial com mapa interativo, parallax, timeline e globo 3D.",
    tags: ["mapa", "parallax", "timeline", "globe", "mundo"],
    category: "Showcase",
  },
  {
    slug: "saas-landing-2",
    name: "SaaS Landing 2.0 — Nimbus",
    description:
      "Landing SaaS premium de 18 seções coesas: banner sticky com cupom, navbar com atalho ⌘K, hero com Spotlight/FlipWords/AnimatedTooltip, faixa de mídias (InfiniteMovingCards), logo slider, ThreeDMarquee com 20 screenshots, StickyScroll 'Como funciona', métricas com count-up + Terminal simulando deploy, features com skeletons, HoverEffect de vantagens, ExpandableCards com 3 personas (Startup/Scale-up/Enterprise), bento com GlowingEffect, CodeBlock multi-linguagem para devs, depoimentos autoplay com stats agregados, LogoSlider de integrações, pricing com comparativo, customer story em destaque, FAQ categorizado, CTA em LampContainer e footer com newsletter/selos/redes.",
    tags: ["saas", "landing", "hero", "spotlight", "pricing", "depoimentos", "bento", "métricas", "3d-marquee", "sticky-scroll", "expandable-cards", "code-block", "terminal", "use-cases", "customer-story", "integrações"],
    category: "Marketing",
  },
  {
    slug: "interactive-dashboard",
    name: "Interactive Dashboard",
    description: "Dashboard interativo com sticky scroll, loading states animados e teclado visual.",
    tags: ["dashboard", "sticky", "loader", "interativo"],
    category: "Aplicação",
  },
  {
    slug: "creative-portfolio",
    name: "Creative Portfolio",
    description: "Portfólio criativo com ASCII art, texto ondulado e cards com spotlight.",
    tags: ["portfolio", "ascii", "spotlight", "criativo"],
    category: "Showcase",
  },
  {
    slug: "component-playground-2",
    name: "Component Playground 2.0",
    description: "Playground interativo com hover direcional, cards arrastáveis, comparação e upload.",
    tags: ["playground", "hover", "drag", "compare", "upload"],
    category: "Showcase",
  },
  {
    slug: "ecommerce-storefront",
    name: "Loja / Storefront E-commerce",
    description:
      "Loja online navegável: navbar com carrinho contador, hero de coleção, filtros por categoria e ordenação, grid de produtos com desconto e carrinho lateral em Sheet com subtotal e ajuste de quantidade.",
    tags: ["e-commerce", "loja", "carrinho", "produtos", "interativo"],
    category: "Marketing",
  },
  {
    slug: "product-detail",
    name: "Página de Produto (PDP)",
    description:
      "Página de detalhe de produto de e-commerce: galeria com zoom (Lens) e thumbnails que trocam a imagem, seletores de cor/tamanho/quantidade reativos, comprar agora (StatefulButton), abas de descrição/especificações/avaliações e carrossel de produtos relacionados.",
    tags: ["e-commerce", "produto", "pdp", "loja", "carrinho"],
    category: "Aplicação",
  },
  {
    slug: "blog-article",
    name: "Blog / Artigo Editorial",
    description:
      "Artigo de leitura longa com capa, kicker animado, autor em hover card, TracingBeam dirigido pelo scroll, blockquote, bloco de código, imagem, lista e cards \"Leia também\".",
    tags: ["blog", "artigo", "editorial", "leitura", "tracing-beam"],
    category: "Marketing",
  },
  {
    slug: "docs-portal",
    name: "Portal de Documentação",
    description:
      "Doc de produto navegável: sidebar troca a página exibida, command palette (⌘K) busca e navega, e cada doc tem breadcrumb, abas de exemplos, comando de instalação, callouts, tabela de props, FAQ e índice 'nesta página'. Inclui um Mapa da Documentação interativo em React Flow (raiz → seções → páginas) que serve de terceira forma de navegar: clicar num nó abre a doc correspondente, com a página atual destacada.",
    tags: ["docs", "documentação", "command palette", "navegável", "react-flow", "mapa", "app"],
    category: "Aplicação",
  },
  {
    slug: "event-conference",
    name: "Landing de Conferência",
    description:
      "Landing de evento tech com hero em Vortex, nome em ColourfulText, countdown ao vivo, palestrantes em AnimatedTooltip, depoimentos, agenda em Timeline, patrocinadores e planos de ingresso.",
    tags: ["evento", "conferência", "countdown", "ingressos", "landing"],
    category: "Marketing",
  },
  {
    slug: "settings-profile",
    name: "Configurações & Perfil",
    description:
      "Tela de configurações de conta navegável: sidebar troca seções (Perfil/Conta/Notificações/Aparência/Segurança), upload de avatar, switches funcionais, tema reativo e botão salvar com loading e toast de confirmação.",
    tags: ["configurações", "perfil", "conta", "app"],
    category: "Aplicação",
  },
  {
    slug: "onboarding-wizard",
    name: "Onboarding Wizard",
    description:
      "Wizard de onboarding multi-step com estado real: stepper progressivo, dados pessoais, seleção de objetivos em cards, preferências com switches/radio, convite de equipe por e-mail e revisão final que dispara um loader animado.",
    tags: ["onboarding", "wizard", "multi-step", "stepper", "interativo"],
    category: "Aplicação",
  },
  {
    slug: "music-player",
    name: "Music Player",
    description:
      "Player de streaming de música tipo Spotify: biblioteca de playlists, lista de faixas reativa, capa com efeito glare e player fixo com play/pause, progresso e volume.",
    tags: ["música", "player", "streaming", "app"],
    category: "Aplicação",
  },
  {
    slug: "coming-soon",
    name: "Coming Soon / Waitlist",
    description:
      "Tela de lançamento 'em breve' full-bleed com fundo de estrelas animado, título colorido, countdown dd:hh:mm:ss, captura de e-mail para waitlist com confirmação e contador de prova social.",
    tags: ["coming soon", "waitlist", "countdown", "lançamento", "marketing"],
    category: "Marketing",
  },
  {
    slug: "travel-booking",
    name: "Reserva de Viagem",
    description:
      "Landing de viagens com busca interativa (destino, datas e hóspedes), destinos populares em FocusCards, mapa-múndi com rotas, depoimentos animados e faixa de benefícios.",
    tags: ["viagem", "booking", "busca", "mapa", "marketing"],
    category: "Marketing",
  },
  {
    slug: "ai-ide",
    name: "IDE com IA",
    description:
      "Ambiente de programação estilo VS Code (em layout largo) com imersão total e a IA como protagonista — todos os botões funcionam. Title bar com menus Arquivo/Editar/Ver como dropdowns de ações reais. Explorer com árvore mutável: abrir/fechar pastas, criar arquivo/pasta (input inline), renomear e excluir no hover. Activity bar troca o painel (Explorer/Search/Source Control/Run/Extensions/Preferências com SwitchFluid); Run dispara no terminal. Editor com tabs fecháveis, dot de não-salvo, caret por linha (Ln/Col) e ghost suggestion. Painel inferior Terminal/Problemas/Saída colapsável. Destaque: chat de IA com raciocínio EMBUTIDO na bolha do assistant — expandido durante o pensar (passos em streaming + indicador + contador de tempo) e auto-contraído ao terminar para “Pensei por Ns ›”, reabrível por clique; em seguida a resposta final aparece com efeito de digitação token-a-token e bloco de código aplicável que edita o editor e marca o arquivo como modificado. Modos Chat/Edit/Agent, dropdown de modelo, chips @arquivo, slash commands, command palette ⌘K, status bar reativa e responsivo (IA vira Sheet em telas estreitas).",
    tags: ["ide", "ia", "vscode", "editor", "copiloto", "raciocínio", "app", "interativo"],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "workflow-builder",
    name: "Workflow Builder",
    description:
      "Editor visual de automações no estilo n8n/Zapier construído sobre o React Flow (@xyflow/react). App de tela cheia com toolbar, paleta arrastável, canvas e inspetor: nós customizados tematizados (gatilho/ação/condição/saída) com ícones, Handles e estados; arraste da paleta cria nós (drag&drop → screenToFlowPosition), ligue Handles para conectar (edges animadas com seta), e edite título/subtítulo no inspetor. A toolbar adiciona nós, auto-organiza em camadas, ajusta à tela (fitView), alterna MiniMap/Grade e dispara a ▶ simulação, que percorre o grafo acendendo nós e destacando o caminho. Barra de status com contadores e export do grafo em JSON. MiniMap colorido por tipo, Background pontilhado e Controls; tema light/dark reativo via tokens shadcn.",
    tags: [
      "react-flow",
      "workflow",
      "automation",
      "node-editor",
      "diagram",
      "app",
      "interativo",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "ai-agent-flow",
    name: "AI Agent Pipeline",
    description:
      "Orquestrador visual de agentes de IA / LLMs no estilo Flowise/Dify, construído sobre o React Flow (@xyflow/react). App de tela cheia com toolbar, paleta arrastável, canvas e inspetor: 6 nós customizados tematizados (mensagem/system prompt/LLM/ferramenta/memória/resposta) com ícones, badges de modelo·temperatura·tokens e Handles. Arraste da paleta cria nós (drag&drop → screenToFlowPosition), ligue Handles para montar o fluxo de dados (edges animadas com seta), e edite no inspetor o título, o modelo (select), a temperatura (slider) e os tokens dos nós LLM. A toolbar adiciona nós, auto-organiza em camadas, ajusta à tela (fitView), alterna MiniMap/Grade e dispara a ▶ simulação, que percorre o grafo do input ao output acendendo nós, destacando o caminho e \"streamando\" a resposta token a token no nó de saída. Barra de status com contadores e export do grafo em JSON. MiniMap colorido por tipo, Background pontilhado e Controls; tema light/dark reativo via tokens shadcn.",
    tags: [
      "react-flow",
      "ai",
      "llm",
      "agents",
      "pipeline",
      "node-editor",
      "app",
      "interativo",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "db-schema-designer",
    name: "Database Schema Designer",
    description:
      "Editor visual de diagramas de banco de dados (ER) no estilo ChartDB / DBDraw / Hubql, construído sobre o React Flow (@xyflow/react). O diferencial: cada nó é uma TABELA com múltiplos Handles — um por coluna — e as relações ligam o handle de uma coluna FK ao handle da coluna PK de outra tabela (1—N). App de tela cheia com toolbar, lista de tabelas à esquerda, canvas e inspetor: o TableNode mostra header com nome + ícone e a lista de colunas com ícone PK (chave) / FK (link), nome e badge do tipo (uuid/int/varchar/timestamp/bool…). Arraste \"Nova tabela\" para o canvas (drag&drop → screenToFlowPosition), ligue os pontos das linhas para criar relações (edges smoothstep com seta e rótulo de cardinalidade), e no inspetor renomeie a tabela, adicione coluna (nome + tipo via select + flag PK), remova colunas ou exclua a tabela. A toolbar auto-organiza em grade, ajusta à tela (fitView), alterna MiniMap/Grade e gera o schema completo em \"Exportar SQL\" (CREATE TABLE com FOREIGN KEY num dialog com copiar). Barra de status com contagem de tabelas, colunas e relações. MiniMap, Background pontilhado e Controls; tema light/dark reativo via tokens shadcn.",
    tags: [
      "react-flow",
      "database",
      "er-diagram",
      "schema",
      "sql",
      "node-editor",
      "app",
      "interativo",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "mind-map",
    name: "Mind Map",
    description:
      "Mapa mental interativo no estilo Ameliorate / DoubleLoop / Miro, construído sobre o React Flow (@xyflow/react). O foco é a FLUIDEZ: cada nó é uma pílula arredondada tematizada e o realce varia por profundidade (a ideia central usa bg-primary; os ramos ganham um ponto de cor). DUPLO-CLIQUE num nó entra em edição inline (textarea autofocado — Enter/blur confirma, Escape cancela); o botão \"+\" cria um filho conectado já em edição e o \"×\" remove a sub-árvore. Tab cria filho do nó selecionado, DUPLO-CLIQUE no canvas vazio cria uma ideia solta e Delete/Backspace remove o ramo. Edges bezier suaves e não-direcionais. A toolbar enxuta adiciona ideias, auto-organiza em árvore determinística, ajusta à tela (fitView), alterna Grade/MiniMap e exporta o mapa como outline Markdown (o wow) ou JSON, num dialog com copiar. Inspetor leve à direita: renomear, escolher a cor do ramo e excluir. Background pontilhado, Controls e MiniMap colorido por ramo; tema light/dark reativo via tokens shadcn.",
    tags: [
      "react-flow",
      "mindmap",
      "brainstorm",
      "diagram",
      "tree",
      "app",
      "interativo",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "circuit-simulator",
    name: "Logic Circuit Simulator",
    description:
      "Simulador de circuitos lógicos digitais no estilo CircuLearn / Logic.ly, construído sobre o React Flow (@xyflow/react). O DIFERENCIAL: a lógica é computada de verdade e o sinal propaga AO VIVO pelo grafo — clicar numa entrada reacende portas, fios e lâmpadas instantaneamente. App de tela cheia com toolbar, paleta arrastável, canvas e painel: nós customizados tematizados — entradas (switch on/off clicável), portas AND/OR/NOT/XOR/NAND/NOR (1–2 inputs + output, símbolo e valor 0/1) e lâmpadas que acendem ao receber 1. Motor de avaliação iterativa com ponto-fixo (guarda de iterações para ciclos) propaga dos switches pelas portas até as saídas e energiza as edges (verde aceso = sinal 1). Arraste componentes da paleta (drag&drop → screenToFlowPosition), ligue Handles para criar fios, e use o painel direito para alternar entradas e ver o estado das lâmpadas. A toolbar adiciona componentes, auto-organiza em colunas (entradas | portas | lâmpadas), ajusta à tela (fitView), alterna MiniMap/Grade e gera a Tabela-verdade (o wow educacional: varia todas as entradas e tabula as saídas num dialog). Barra de status com contadores e lâmpadas acesas. MiniMap colorido por tipo, Background pontilhado e Controls; corpo dos nós em tokens shadcn com tema light/dark reativo.",
    tags: [
      "react-flow",
      "logic",
      "circuit",
      "simulation",
      "gates",
      "node-editor",
      "app",
      "interativo",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "image-pipeline",
    name: "Image Processing Pipeline",
    description:
      "Pipeline visual de processamento de imagem no estilo chaiNNer, construído sobre o React Flow (@xyflow/react). O DIFERENCIAL: cada nó renderiza num <canvas> a imagem JÁ processada por aquela etapa, encadeada da origem (picsum, CORS-friendly) até a saída — o preview ao vivo é o destaque. App de tela cheia com toolbar, paleta de operações arrastável, canvas e inspector: nós customizados tematizados — origem (carrega a imagem, troca a seed), operações (tons de cinza, inverter, brilho, contraste, desfoque, limiar e sépia — sliders ajustam o parâmetro) e saída (preview ampliado + baixar PNG). O motor avalia o grafo em ordem topológica a partir do source e aplica cada filtro sobre o ImageData do nó anterior em Canvas 2D puro (operações por pixel e blur via ctx.filter), recomputando quando a imagem carrega, um parâmetro muda ou a topologia muda (coalescido num requestAnimationFrame). Arraste operações da paleta (drag&drop → screenToFlowPosition), ligue Handles para encadear etapas e use o inspector para regular o efeito. A toolbar adiciona operações, auto-organiza em cadeia (esquerda→direita), ajusta à tela (fitView), alterna MiniMap/Grade e baixa o resultado final. Barra de status com contadores e dimensões. MiniMap colorido por tipo, Background pontilhado e Controls; corpo dos nós em tokens shadcn com tema light/dark reativo.",
    tags: [
      "react-flow",
      "image",
      "pipeline",
      "processing",
      "canvas",
      "chainner",
      "node-editor",
      "app",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "json-visualizer",
    name: "JSON Visualizer",
    description:
      "Visualizador de JSON como grafo de nós no estilo json-sea (altenull/json-sea), construído sobre o React Flow (@xyflow/react). O DIFERENCIAL: cole ou edite um JSON no editor à esquerda e o grafo é RECONSTRUÍDO ao vivo — entender a estrutura visualmente é o destaque. O parser percorre o JSON recursivamente: cada objeto vira um nó listando suas chaves (valores primitivos inline, coloridos por tipo — string, number, boolean, null) e cada chave cujo valor é objeto/array vira uma aresta com Handle próprio para o nó filho; cada array vira um nó com seus índices, ligando os itens aninhados. IDs estáveis derivados do caminho (ex.: $.user.address) e auto-layout em árvore esquerda→direita determinístico a partir da raiz, com fitView ao reconstruir. Editor com botões Visualizar e Formatar (valida o JSON e mostra erro na UI sem quebrar o grafo anterior) e Carregar exemplo (2 JSONs prontos). Canvas com Background pontilhado, Controls, MiniMap colorido por tipo, pan/zoom e edges smoothstep. Nós tematizados em tokens shadcn (bg-card/border-border) com tema light/dark reativo; no mobile o editor vira um painel no topo. Barra de status com contagem de nós, arestas e profundidade.",
    tags: [
      "react-flow",
      "json",
      "visualizer",
      "tree",
      "graph",
      "json-sea",
      "node-editor",
      "app",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "data-pipeline",
    name: "Data Pipeline",
    description:
      "Pipeline de transformação de dados no estilo Datablocks (editor.datablocks.pro), construído sobre o React Flow (@xyflow/react). O DIFERENCIAL: os dados fluem por blocos de transformação e o nó final renderiza uma TABELA + um MINI GRÁFICO DE BARRAS recalculado AO VIVO quando qualquer bloco muda (parâmetro, dataset ou topologia) — ver o gráfico atualizar conforme você edita é o destaque. App de tela cheia com toolbar, paleta de blocos arrastável, canvas e inspector: nós customizados tematizados — Dataset (escolhe entre 2 datasets embutidos, mostra nº de linhas/colunas), Filtrar (coluna + operador + valor), Agrupar & Agregar (agrupa por coluna e aplica soma/média/contagem/mín/máx), Ordenar (coluna asc/desc) e Gráfico (barras + tabela das primeiras linhas). O motor avalia o grafo em ordem topológica do source até o chart, encadeando o resultado de cada etapa com operações puras em JS; trata input vazio/coluna inexistente com aviso no nó. Pipeline inicial coeso (Dataset → Filtrar → Agrupar → Ordenar → Gráfico) já mostra um gráfico ao abrir. Arraste blocos da paleta (drag&drop → screenToFlowPosition), ligue Handles para encadear etapas e use o inspector (selects de coluna/operador/agregação, input de valor) para regular cada transformação. A toolbar adiciona blocos, auto-organiza em cadeia (esquerda→direita), ajusta à tela (fitView), alterna MiniMap/Grade e exporta o resultado final em CSV. Barra de status com contadores. MiniMap colorido por tipo, Background pontilhado e Controls; corpo dos nós em tokens shadcn com tema light/dark reativo; no mobile a paleta/inspector recolhem.",
    tags: [
      "react-flow",
      "data",
      "pipeline",
      "etl",
      "chart",
      "datablocks",
      "node-editor",
      "app",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "media-studio",
    name: "Generative Media Studio",
    description:
      "Estúdio de mídia generativa no estilo Bleu AI (buildbleu.com), construído sobre o React Flow (@xyflow/react). O pipeline vai de INPUTS (texto/imagem do usuário) → GENERATION (texto/imagem/vídeo/áudio) → LAYOUT (mosaico de saída). Diferenciais: a paleta à esquerda é AGRUPADA POR CATEGORIA (Inputs · Generation · Layout) com headers e itens arrastáveis (drag&drop → screenToFlowPosition); cada nó de geração mostra o THUMBNAIL do asset (picsum, CORS-friendly) — imagem, vídeo (com play), áudio (waveform) e texto (preview), com badge do modelo (Flux/Runway/Suno/gpt-4o…); e o botão ▶ Gerar dispara a SIMULAÇÃO, que percorre o grafo dos inputs ao output marcando cada nó como `generating` (skeleton pulsando) e depois `done` (o asset aparece), destacando as edges do caminho até o Output montar o mosaico final (timers em ref, limpos no unmount). Inspetor à direita edita prompt (textarea), modelo (select por categoria), seed e proporção, e exclui o nó. Toolbar adiciona nós (dropdown por categoria), auto-organiza em camadas, ajusta à tela (fitView) e alterna MiniMap/Grade. Barra de status com contadores. MiniMap colorido por categoria, Background pontilhado e Controls; nós em tokens shadcn com tema light/dark reativo; paleta/inspetor recolhem no mobile.",
    tags: [
      "react-flow",
      "ai",
      "media",
      "generative",
      "image",
      "video",
      "bleu",
      "node-editor",
      "app",
    ],
    category: "Aplicação",
    wide: true,
  },
  {
    slug: "observability-center",
    name: "Observability Command Center",
    description:
      "Centro de comando de observabilidade VIVO no estilo Grafana/Datadog — só que reinventado: em vez do grid de gráficos estáticos, o protagonista é um service mesh em que os PACOTES de request fluem em tempo real pelas conexões (SVG + requestAnimationFrame), coloridos por severidade (ciano = tráfego, âmbar = degradado, rosa = erro). Toda a tela é dirigida por um relógio simulado determinístico (PRNG seedado pelo tick, zero Math.random), com play/pause do live e seletor de janela (Live/5m/1h). Clicar num serviço do mesh inspeciona seus Golden Signals (latência p95, throughput, taxa de erro e saturação CPU/memória em sparklines que rolam), reconstrói o heatmap de latência e o distributed trace waterfall. Painel de SLO com gauge radial de disponibilidade e error budget, log stream ao vivo com filtro por nível (debug/info/warn/error) e contadores, e alertas/incidentes com ack. O botão \"Injetar incidente\" degrada o serviço selecionado e propaga a falha em cascata aos dependentes — acendendo o mesh de vermelho, disparando alertas e enchendo o log de erros. Casco em tokens shadcn com tema light/dark reativo; status bar com agregados globais.",
    tags: [
      "observability",
      "monitoring",
      "grafana",
      "datadog",
      "service-mesh",
      "métricas",
      "tempo-real",
      "slo",
      "logs",
      "tracing",
      "app",
      "interativo",
    ],
    category: "Aplicação",
    wide: true,
  },
]

export function getCompositionBySlug(slug: string): Composition | undefined {
  return compositions.find((c) => c.slug === slug)
}
