/**
 * Composição "Product Showcase".
 *
 * Tela de showcase de produto com:
 * - StickyBanner com CTA de novo produto
 * - Hero com MacbookScroll revelando o produto
 * - Features em LayoutGrid bento
 * - Team com AnimatedTooltip
 * - CTA Section
 * - Footer
 */

import { ArrowRight, Sparkles, Zap, Shield, BarChart3, Globe, Layers } from "lucide-react"

import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid } from "@/components/ui/layout-grid"
import { MacbookScroll } from "@/components/ui/macbook-scroll"
import { StickyBanner } from "@/components/ui/sticky-banner"
import { useTheme } from "@/components/theme/use-theme"

const teamMembers = [
  { id: 1, name: "Ana Silva", designation: "CEO & Founder", image: "https://picsum.photos/seed/team-ana/100/100" },
  { id: 2, name: "Carlos Mendes", designation: "CTO", image: "https://picsum.photos/seed/team-carlos/100/100" },
  { id: 3, name: "Beatriz Costa", designation: "Head of Design", image: "https://picsum.photos/seed/team-beatriz/100/100" },
  { id: 4, name: "Diego Ferreira", designation: "Lead Engineer", image: "https://picsum.photos/seed-team-diego/100/100" },
  { id: 5, name: "Elena Rodrigues", designation: "Product Manager", image: "https://picsum.photos/seed-team-elena/100/100" },
]

const featureCards = [
  {
    id: 1,
    content: (<div><p className="text-lg font-bold text-white">Performance</p><p className="text-sm text-neutral-200">Velocidade extrema com otimização automática.</p></div>),
    className: "md:col-span-2",
    thumbnail: "https://picsum.photos/seed/feature-perf/800/600",
  },
  {
    id: 2,
    content: (<div><p className="text-lg font-bold text-white">Segurança</p><p className="text-sm text-neutral-200">Criptografia de ponta a ponta por padrão.</p></div>),
    className: "col-span-1",
    thumbnail: "https://picsum.photos/seed/feature-security/400/600",
  },
  {
    id: 3,
    content: (<div><p className="text-lg font-bold text-white">Escalável</p><p className="text-sm text-neutral-200">Cresce com você de 10 a 10 milhões de usuários.</p></div>),
    className: "col-span-1",
    thumbnail: "https://picsum.photos/seed/feature-scale/400/600",
  },
  {
    id: 4,
    content: (<div><p className="text-lg font-bold text-white">Analytics</p><p className="text-sm text-neutral-200">Dashboards em tempo real com insights acionáveis.</p></div>),
    className: "col-span-1",
    thumbnail: "https://picsum.photos/seed/feature-analytics/400/600",
  },
  {
    id: 5,
    content: (<div><p className="text-lg font-bold text-white">Global</p><p className="text-sm text-neutral-200">CDN em 40+ regiões para latência mínima.</p></div>),
    className: "col-span-1",
    thumbnail: "https://picsum.photos/seed/feature-global/400/600",
  },
  {
    id: 6,
    content: (<div><p className="text-lg font-bold text-white">Integrações</p><p className="text-sm text-neutral-200">Conecte com mais de 200 ferramentas populares.</p></div>),
    className: "md:col-span-2",
    thumbnail: "https://picsum.photos/seed/feature-integrations/800/600",
  },
]

const featuresList = [
  { icon: <Zap className="h-8 w-8 text-indigo-500" />, title: "Ultra Rápido", description: "Build time reduzido em 90% com cache inteligente e compilação incremental." },
  { icon: <Shield className="h-8 w-8 text-emerald-500" />, title: "Segurança Total", description: "Proteção contra XSS, CSRF e injeção de código com camadas de defesa automáticas." },
  { icon: <BarChart3 className="h-8 w-8 text-sky-500" />, title: "Métricas em Tempo Real", description: "Acompanhe performance, erros e uso com dashboards que atualizam ao vivo." },
  { icon: <Globe className="h-8 w-8 text-violet-500" />, title: "Edge Ready", description: "Deploy global em segundos com edge functions e CDN distribuído em 40+ regiões." },
  { icon: <Layers className="h-8 w-8 text-amber-500" />, title: "Modular", description: "Importe apenas o que usar. Tree-shaking automático mantém o bundle enxuto." },
]

export function ProductShowcase() {
  const { resolvedTheme } = useTheme()

  return (
    <div data-theme={resolvedTheme} className="flex flex-col bg-background text-foreground">
      {/* 1. StickyBanner */}
      <StickyBanner className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" hideOnScroll>
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Sparkles className="h-4 w-4" />
          <span>Novo produto lançado — Experimente grátis por 14 dias</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </StickyBanner>

      {/* 2. Hero — MacbookScroll */}
      <section className="relative w-full overflow-hidden border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Product Showcase
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Build{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                Faster
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg">
              A plataforma completa para equipes que querem entregar produtos
              incríveis em tempo recorde. Sem complexidade, sem surpresas.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-border">
                Ver documentação
              </Button>
            </div>
          </div>
        </div>
        <div className="relative h-[300vh] w-full">
          <div className="sticky top-0 flex h-screen items-start justify-center overflow-hidden pt-10">
            <MacbookScroll
              src="https://picsum.photos/seed/product-showcase-hero/1200/800"
              title=""
              showGradient
            />
          </div>
        </div>
      </section>

      {/* 3. Features — LayoutGrid bento */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tudo em um só lugar</h2>
            <p className="mt-4 text-base text-muted-foreground">
              Seis features poderosas, cada uma expandível. Clique para explorar.
            </p>
          </div>
          <div className="mt-12 h-[40rem]">
            <LayoutGrid cards={featureCards} />
          </div>
        </div>
      </section>

      {/* 4. Features list — Card grid */}
      <section className="border-b border-border bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Por que escolher nossa plataforma</h2>
            <p className="mt-4 text-base text-muted-foreground">
              Cada detalhe pensado para sua equipe entregar mais, com menos esforço.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuresList.map((feature) => (
              <Card key={feature.title} className="border-border bg-card">
                <CardHeader>
                  <div className="mb-3">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Team — AnimatedTooltip */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nossa equipe</h2>
            <p className="mt-4 text-base text-muted-foreground">
              As pessoas por trás do produto. Passe o mouse sobre os avatares.
            </p>
          </div>
          <div className="mt-12 flex justify-center">
            <AnimatedTooltip items={teamMembers} />
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pronto para construir algo incrível?
          </h2>
          <p className="mt-4 text-base text-white/80">
            Junte-se a milhares de equipes que já estão entregando produtos
            melhores e mais rápido.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90">
              Começar gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              Falar com vendas
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span className="text-lg font-semibold">Product Showcase</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Plataforma completa para equipes que querem entregar produtos
              incríveis em tempo recorde.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <a href="/components" className="text-muted-foreground transition-colors hover:text-foreground">Componentes</a>
            <a href="/compositions" className="text-muted-foreground transition-colors hover:text-foreground">Composições</a>
            <a href="/" className="text-muted-foreground transition-colors hover:text-foreground">Início</a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Documentação</a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Preços</a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Blog</a>
          </nav>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Product Showcase. Construído com React, Vite e Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
