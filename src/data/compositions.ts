export type Composition = {
  slug: string
  name: string
  description: string
  tags: string[]
  category?: string
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
      "Doc de produto navegável: sidebar troca a página exibida, command palette (⌘K) busca e navega, e cada doc tem breadcrumb, abas de exemplos, comando de instalação, callouts, tabela de props, FAQ e índice 'nesta página'.",
    tags: ["docs", "documentação", "command palette", "navegável", "app"],
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
]

export function getCompositionBySlug(slug: string): Composition | undefined {
  return compositions.find((c) => c.slug === slug)
}
