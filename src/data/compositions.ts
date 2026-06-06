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
    slug: "component-playground",
    name: "Component Playground",
    description:
      "Bancada de primitivos e overlays — abas, accordion, diálogos, sheets, dropdowns e blocos de código.",
    tags: ["primitivos", "overlays", "playground"],
    category: "Aplicação",
  },
]

export function getCompositionBySlug(slug: string): Composition | undefined {
  return compositions.find((c) => c.slug === slug)
}
