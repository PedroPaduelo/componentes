/**
 * Dados auxiliares da composição "Testimonials Wall" (apenas types e
 * constantes — sem JSX). Mantido em arquivo separado para satisfazer
 * `react-refresh/only-export-components` (o `.tsx` exporta só o componente).
 */

export type TestimonialRole =
  | "Engenharia"
  | "Design"
  | "Produto"
  | "Founder"

export type Testimonial = {
  id: string
  name: string
  handle: string
  role: TestimonialRole
  company: string
  city: string
  rating: 1 | 2 | 3 | 4 | 5
  /** ISO date determinística (sem `Math.random`). */
  dateISO: string
  quote: string
  /** seed estável pro picsum.photos do avatar. */
  avatarSeed: string
  featured?: boolean
}

/** Totais por cargo, exibidos no header. Determinísticos. */
export const ROLE_TOTALS: Record<TestimonialRole, number> = {
  Engenharia: 12400,
  Design: 8200,
  Produto: 4150,
  Founder: 3100,
}

/** Conjunto curado de 15 depoimentos. Conteúdo em pt-BR, sem `Math.random()`. */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "manu-arora",
    name: "Manu Arora",
    handle: "@mannupaaji",
    role: "Engenharia",
    company: "Nuveo",
    city: "São Paulo, BR",
    rating: 5,
    dateISO: "2024-12-15",
    quote:
      "Migramos o design system inteiro em uma sprint. A consistência entre light e dark foi o que mais me impressionou — economizamos um mês de QA visual.",
    avatarSeed: "wall-feat-manu",
    featured: true,
  },
  {
    id: "sofia-lima",
    name: "Sofia Lima",
    handle: "@sofialima",
    role: "Design",
    company: "Nuveo",
    city: "Lisboa, PT",
    rating: 5,
    dateISO: "2024-11-28",
    quote:
      "Handoff ficou trivial. Copiar, colar, entregar. Os tokens já respeitam o tema do produto e o `cn()` é uma delícia de usar.",
    avatarSeed: "wall-sofia",
  },
  {
    id: "aiko-tanaka",
    name: "Aiko Tanaka",
    handle: "@aikot",
    role: "Engenharia",
    company: "Cumulus",
    city: "Tóquio, JP",
    rating: 5,
    dateISO: "2024-11-14",
    quote:
      "As animações via motion/react são suaves e nunca atrapalham a acessibilidade. Virou padrão no nosso time: o que não vem daqui, a gente questiona.",
    avatarSeed: "wall-aiko",
  },
  {
    id: "diego-souza",
    name: "Diego Souza",
    handle: "@dsouza",
    role: "Founder",
    company: "Indie Labs",
    city: "Florianópolis, BR",
    rating: 5,
    dateISO: "2024-10-30",
    quote:
      "Como indie founder, isso me deu velocidade de uma equipe inteira. Lancei a landing em um fim de semana e o tráfego orgânico triplicou.",
    avatarSeed: "wall-diego",
  },
  {
    id: "marina-alves",
    name: "Marina Alves",
    handle: "@marina",
    role: "Produto",
    company: "Lumini",
    city: "Curitiba, BR",
    rating: 5,
    dateISO: "2024-10-18",
    quote:
      "Os componentes dialogam entre si sem conflito de estilo. Montar telas inteiras virou brincadeira — e o cliente percebe a qualidade do polish.",
    avatarSeed: "wall-marina",
  },
  {
    id: "rafael-santos",
    name: "Rafael Santos",
    handle: "@rafa",
    role: "Engenharia",
    company: "Cumulus",
    city: "Porto Alegre, BR",
    rating: 4,
    dateISO: "2024-09-22",
    quote:
      "Documentação clara, exemplos copiáveis, sem aquele ruído de lib mal mantida. A curva de aprendizado é praticamente zero.",
    avatarSeed: "wall-rafa",
  },
  {
    id: "julia-pereira",
    name: "Júlia Pereira",
    handle: "@jupereira",
    role: "Engenharia",
    company: "Lumini",
    city: "Belo Horizonte, BR",
    rating: 5,
    dateISO: "2024-09-10",
    quote:
      "Acessibilidade não foi afterthought — o catálogo inteiro respeita aria, foco visível e contraste. Auditamos 200+ telas sem abrir issue.",
    avatarSeed: "wall-julia",
  },
  {
    id: "diego-martins",
    name: "Diego Martins",
    handle: "@dmartins",
    role: "Founder",
    company: "Vértice",
    city: "Recife, BR",
    rating: 4,
    dateISO: "2024-08-25",
    quote:
      "Comecei no plano grátis pra testar e nunca mais saí da plataforma. Vale cada centavo do upgrade — meu produto subiu de qualidade visivelmente.",
    avatarSeed: "wall-dmartins",
  },
  {
    id: "beatriz-cardoso",
    name: "Beatriz Cardoso",
    handle: "@bea",
    role: "Design",
    company: "Praxis",
    city: "Madrid, ES",
    rating: 5,
    dateISO: "2024-08-08",
    quote:
      "Componentes que respeitam tokens semânticos me deixam trocar de tema sem refatorar nada. É o tipo de decisão arquitetural que devia ser padrão.",
    avatarSeed: "wall-bea",
  },
  {
    id: "carlos-mendes",
    name: "Carlos Mendes",
    handle: "@carlosm",
    role: "Produto",
    company: "Helio",
    city: "Rio de Janeiro, BR",
    rating: 4,
    dateISO: "2024-07-19",
    quote:
      "Consegui alinhar design e engenharia na mesma semana, sem aquela novela de pixel-perfect. O time finalmente fala a mesma língua.",
    avatarSeed: "wall-carlos",
  },
  {
    id: "ana-clara",
    name: "Ana Clara",
    handle: "@anaclara",
    role: "Engenharia",
    company: "Orbital",
    city: "Berlim, DE",
    rating: 5,
    dateISO: "2024-07-04",
    quote:
      "O registry shadcn-style simplificou nosso CI: atualizamos componentes com um único comando e o lint garante que nada quebrou.",
    avatarSeed: "wall-ana",
  },
  {
    id: "tiago-fonseca",
    name: "Tiago Fonseca",
    handle: "@tiagof",
    role: "Founder",
    company: "Quanta",
    city: "Lisboa, PT",
    rating: 5,
    dateISO: "2024-06-21",
    quote:
      "Em 30 dias, lancei um MVP que parecia produto de série B. Investidores notaram a qualidade e isso destravou nossa rodada seed.",
    avatarSeed: "wall-tiago",
  },
  {
    id: "leticia-nunes",
    name: "Letícia Nunes",
    handle: "@let",
    role: "Design",
    company: "Praxis",
    city: "São Paulo, BR",
    rating: 4,
    dateISO: "2024-06-05",
    quote:
      "A consistência de tipografia e espaçamento entre componentes economiza horas de revisão. Posso focar em decisões de produto, não de pixel.",
    avatarSeed: "wall-let",
  },
  {
    id: "pedro-almeida",
    name: "Pedro Almeida",
    handle: "@pedroa",
    role: "Produto",
    company: "Nuveo",
    city: "Porto, PT",
    rating: 5,
    dateISO: "2024-05-18",
    quote:
      "O `data-slot` consistente em todo o catálogo me deixou escrever testes E2E genéricos que atravessam todos os componentes. Pouca gente fala disso.",
    avatarSeed: "wall-pedro",
  },
  {
    id: "camila-rocha",
    name: "Camila Rocha",
    handle: "@camirocha",
    role: "Engenharia",
    company: "Lumini",
    city: "Salvador, BR",
    rating: 5,
    dateISO: "2024-05-02",
    quote:
      "O índice de bugs visuais no nosso repo caiu 70% após a migração. Antes era um inferno de variações sutis de borda; agora é tudo o mesmo token.",
    avatarSeed: "wall-camila",
  },
]

/** Ordenação aceita pelo seletor. */
export const SORT_OPTIONS = [
  { value: "recent", label: "Mais recente" },
  { value: "useful", label: "Mais útil" },
  { value: "az", label: "A → Z" },
  { value: "rating", label: "Por avaliação" },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]["value"]

/** Filtro de cargo aceito pelos chips. O "all" é a chave sentinela. */
export const ROLE_FILTERS: { value: "all" | TestimonialRole; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "Engenharia", label: "Engenheiros" },
  { value: "Design", label: "Designers" },
  { value: "Produto", label: "PMs" },
  { value: "Founder", label: "Founders" },
]

/** Lista única de empresas derivada dos depoimentos (ordenada, sem duplicata). */
export const COMPANIES: string[] = Array.from(
  new Set(TESTIMONIALS.map((t) => t.company))
).sort((a, b) => a.localeCompare(b, "pt-BR"))

/** Marcas para a faixa de LogoSlider. Texto estilizado (sem SVGs remotos). */
export const BRAND_LOGOS: { name: string }[] = [
  { name: "Nuveo" },
  { name: "Cumulus" },
  { name: "Lumini" },
  { name: "Vértice" },
  { name: "Orbital" },
  { name: "Praxis" },
  { name: "Helio" },
  { name: "Quanta" },
]

/** Pilha rotativa original (preservada para o topo da composição). */
export const STACK_AUTHOR = {
  name: "Manu Arora",
  handle: "@mannupaaji",
  role: "Senior Software Engineer",
  avatar: "https://picsum.photos/seed/avatar1/64/64",
}

export const STACK_ITEMS_RAW: {
  id: number
  name: string
  designation: string
  highlight: string
  body: string
}[] = [
  {
    id: 0,
    name: "Manu Arora",
    designation: "Senior Software Engineer · Nuveo",
    highlight: "Quero usar em todo projeto",
    body: "Estes componentes são incríveis, eu quero usar em cada novo projeto. A DX é um presente dos deuses — copiar, colar, entregar.",
  },
  {
    id: 1,
    name: "Sofia Lima",
    designation: "Product Designer · Nuveo",
    highlight: "Copiar, colar, entregar",
    body: "Handoff ficou trivial. Os tokens já respeitam o tema do produto e o `cn()` é uma delícia de usar.",
  },
  {
    id: 2,
    name: "Diego Souza",
    designation: "Founder · Indie Labs",
    highlight: "Velocidade de equipe inteira",
    body: "Como indie founder, isso me deu a velocidade de uma equipe inteira. Lancei a landing em um fim de semana.",
  },
]

/** Fotos para a galeria do ImagesBadge. */
export const COMMUNITY_IMAGES = [
  "https://picsum.photos/seed/wall-a/200/150",
  "https://picsum.photos/seed/wall-b/200/150",
  "https://picsum.photos/seed/wall-c/200/150",
]

/** Trajetória de exemplo para a timeline no rodapé. */
export const EXPERIENCES = [
  {
    company: "Nuveo",
    role: "Staff Frontend Engineer",
    period: "2023 — Presente",
    description:
      "Lidera o design system da empresa usando a vitrine como base de componentes.",
    technologies: ["React", "TypeScript", "Tailwind"],
    logo: "https://picsum.photos/seed/exp-northwind/64/64",
    stats: [
      { label: "Telas", value: "120+" },
      { label: "Adoção", value: "98%" },
    ],
  },
  {
    company: "Indie Labs",
    role: "Founder & Product Engineer",
    period: "2021 — 2023",
    description:
      "Lançou três produtos SaaS reaproveitando composições inteiras da vitrine.",
    technologies: ["Next.js", "Vite", "shadcn/ui"],
    logo: "https://picsum.photos/seed/exp-indie/64/64",
  },
  {
    company: "Mayhem Studio",
    role: "Frontend Developer",
    period: "2019 — 2021",
    description:
      "Construiu landing pages de alta conversão com os efeitos animados do catálogo.",
    technologies: ["React", "Framer Motion"],
    logo: "https://picsum.photos/seed/exp-mayhem/64/64",
  },
]
