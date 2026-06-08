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
    name: "Text Effects Showcase",
    description:
      "Vitrine de efeitos animados de texto, ícones e botões: glitch, flip, shimmer, gradiente e mais.",
    tags: ["texto", "efeitos", "animação"],
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
      "Interface de chat com assistente: mensagens, indicador de raciocínio, anexos, composer e controles de tema.",
    tags: ["chat", "ia", "app"],
    category: "Aplicação",
  },
  {
    slug: "chat-inbox-pro",
    name: "Chat / Inbox Completo",
    description:
      "Inbox de mensagens com lista de conversas, thread por conversa e composer: trocar de conversa muda o histórico, selecionar zera não-lidas e enviar adiciona a mensagem na thread certa.",
    tags: ["chat", "inbox", "mensagens", "app"],
    category: "Aplicação",
  },
  {
    slug: "component-playground",
    name: "Component Playground",
    description:
      "Bancada de primitivos e overlays — abas, accordion, diálogos, sheets, dropdowns e blocos de código.",
    tags: ["primitivos", "overlays", "playground"],
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
    name: "SaaS Landing 2.0",
    description: "Landing page SaaS com navbar dropdown, banner sticky, botões magnéticos e bordas animadas.",
    tags: ["saas", "landing", "magnetic", "navbar", "banner"],
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
    slug: "event-conference",
    name: "Landing de Conferência",
    description:
      "Landing de evento tech com hero em Vortex, nome em ColourfulText, countdown ao vivo, palestrantes em AnimatedTooltip, depoimentos, agenda em Timeline, patrocinadores e planos de ingresso.",
    tags: ["evento", "conferência", "countdown", "ingressos", "landing"],
    category: "Marketing",
  },
]

export function getCompositionBySlug(slug: string): Composition | undefined {
  return compositions.find((c) => c.slug === slug)
}
