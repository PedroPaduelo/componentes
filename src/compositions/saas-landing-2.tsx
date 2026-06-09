/**
 * Composição "SaaS Landing 2.0" — Nimbus.
 *
 * Landing page SaaS de altíssimo padrão, montada inteiramente com componentes
 * do registry da vitrine. A composição é o cartão de visita do catálogo: 18
 * seções coesas que demonstram densidade visual, interatividade real e
 * profundidade de produto que rivaliza com landing pages reais de
 * SaaS público.
 *
 * Estrutura (18 seções):
 *   1.  StickyBanner (banner de promoção com CTA animado)
 *   2.  ResizableNavbar (logo + nav + CTA com badge ⌘K)
 *   3.  AsSeenInPress (faixa de mídias — InfiniteMovingCards)
 *   4.  Hero (Spotlight + FlipWords + AnimatedTooltip + CTA dupla)
 *   5.  LogoSlider (logos de clientes em marquee contínuo)
 *   6.  ThreeDMarquee (grid 3D inclinado com 20 screenshots do produto)
 *   7.  StickyScroll "Como funciona em 3 passos"
 *   8.  Stats + Terminal (métricas com count-up + card de log ao vivo)
 *   9.  Features (skeleton animations com FeaturesSectionWithSkeletons)
 *  10.  UseCases (ExpandableCards com 3 personas: Startup/Scale-up/Enterprise)
 *  11.  Bento (4 cards com GlowingEffect seguindo o cursor)
 *  12.  Developer (CodeBlock com snippet "integre em 30s" + copy-to-clipboard)
 *  13.  Testimonials (AnimatedTestimonials + logos de mídia + stats agregados)
 *  14.  Integrations (LogoSlider 2ª faixa com 16+ ferramentas do stack)
 *  15.  Pricing (3 planos com GlowingEffect no popular)
 *  16.  CustomerStory (quote enorme + foto + stats de resultado)
 *  17.  FAQ (Accordion com 6 perguntas)
 *  18.  FinalCTA (LampContainer) + Footer com newsletter e selos
 *
 * Copy 100% em PT-BR, personas consistentes (Marina/Rafael/Sofia/Caio/Helena
 * aparecem em avatares, depoimentos e use cases).
 */

import * as React from "react"
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Check,
  Code2,
  Cpu,
  Database,
  Github,
  Globe2,
  Headphones,
  Instagram,
  Layers,
  Linkedin,
  Lock,
  Plug,
  Rocket,
  Send,
  Shield,
  Slack,
  Sparkles,
  Star,
  Twitter,
  Webhook,
  Zap,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { ExpandableCards } from "@/components/ui/expandable-cards"
import {
  FeaturesSectionWithSkeletons,
  SkeletonBars,
  SkeletonImageGrid,
  SkeletonRipple,
  type FeatureItem,
} from "@/components/ui/features-section-with-skeletons"
import { FlipWords } from "@/components/ui/flip-words"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { Input } from "@/components/ui/input"
import { LampContainer } from "@/components/ui/lamp-effect"
import { LogoSlider } from "@/components/ui/logo-slider"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { MovingBorderButton } from "@/components/ui/moving-border"
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  NavbarButton,
  ResizableNavbar,
} from "@/components/ui/resizable-navbar"
import { Spotlight } from "@/components/ui/spotlight"
import {
  StickyScroll,
  type StickyScrollContentItem,
} from "@/components/ui/sticky-scroll-reveal"
import { StickyBanner } from "@/components/ui/sticky-banner"
import { Terminal } from "@/components/ui/terminal"
import { ThreeDMarquee } from "@/components/ui/3d-marquee"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Recursos", link: "#features" },
  { name: "Produto", link: "#product" },
  { name: "Como funciona", link: "#how" },
  { name: "Preços", link: "#pricing" },
  { name: "Dúvidas", link: "#faq" },
]

/* ------------------------------------------------------------------ */
/*  Logo / marca                                                      */
/* ------------------------------------------------------------------ */

function NimbusLogo({ className }: { className?: string }) {
  return (
    <a
      href="#top"
      className={cn(
        "relative z-20 mr-4 flex items-center gap-2 px-2 py-1 text-sm font-semibold",
        className,
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="text-foreground">Nimbus</span>
    </a>
  )
}

/* ------------------------------------------------------------------ */
/*  1. Navbar (com badge ⌘K)                                          */
/* ------------------------------------------------------------------ */

function SaasNavbar() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  return (
    <ResizableNavbar>
      <NavBody>
        <NimbusLogo />
        <NavItems items={NAV_ITEMS} />
        <div className="flex items-center gap-2">
          <NavbarButton variant="secondary" href="#login">
            Entrar
          </NavbarButton>
          <NavbarButton variant="gradient" href="#signup">
            <span className="flex items-center gap-2">
              Começar grátis
              <span className="hidden items-center gap-0.5 rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex">
                <span>⌘</span>
                <span>K</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NimbusLogo />
          <MobileNavToggle
            isOpen={isMobileOpen}
            onClick={() => setIsMobileOpen((v) => !v)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.link}
              href={item.link}
              onClick={() => setIsMobileOpen(false)}
              className="text-neutral-600 dark:text-neutral-300"
            >
              {item.name}
            </a>
          ))}
          <NavbarButton variant="gradient" href="#signup" className="w-full">
            Começar grátis
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  )
}

/* ------------------------------------------------------------------ */
/*  Dados compartilhados (avatares / personas)                         */
/* ------------------------------------------------------------------ */

const HERO_AVATARS = [
  {
    id: 1,
    name: "Marina Alves",
    designation: "Head of Growth @ Lumen",
    image: "https://picsum.photos/seed/nimbus-a/200/200",
  },
  {
    id: 2,
    name: "Rafael Lima",
    designation: "CTO @ Drift",
    image: "https://picsum.photos/seed/nimbus-b/200/200",
  },
  {
    id: 3,
    name: "Sofia Becker",
    designation: "Product Lead @ Northwind",
    image: "https://picsum.photos/seed/nimbus-c/200/200",
  },
  {
    id: 4,
    name: "Caio Mendes",
    designation: "Founder @ Drift",
    image: "https://picsum.photos/seed/nimbus-d/200/200",
  },
  {
    id: 5,
    name: "Helena Costa",
    designation: "VP Eng @ Pulse",
    image: "https://picsum.photos/seed/nimbus-e/200/200",
  },
]

/* ------------------------------------------------------------------ */
/*  2. Hero (Spotlight + FlipWords + AnimatedTooltip)                 */
/* ------------------------------------------------------------------ */

function SaasHero() {
  return (
    <section
      id="top"
      className="relative -mt-20 flex min-h-[44rem] w-full items-center justify-center overflow-hidden bg-neutral-950 pt-32 pb-20 antialiased"
    >
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#818cf8" />
      <Spotlight className="top-28 left-80 hidden md:block" fill="#a78bfa" />
      <div
        className="pointer-events-none absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px] shadow-emerald-400/50" />
          Nimbus 2.0 — agora com IA generativa
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          A plataforma que faz
          <br className="hidden sm:block" /> seu produto
          <span className="mt-1 block">
            <FlipWords
              words={["escalar", "converter", "crescer", "vender"]}
              className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text font-bold text-transparent"
            />
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-neutral-400 sm:text-lg">
          Automatize fluxos, analise dados em tempo real e cresça a receita —
          tudo numa única plataforma, sem complexidade de enterprise e sem
          código.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#signup" className="rounded-full">
            <MovingBorderButton
              borderRadius="9999px"
              duration={3000}
              containerClassName="h-12 w-52"
              className="h-full w-full bg-neutral-950 text-sm font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                Começar gratuitamente
                <ArrowRight className="h-4 w-4" />
              </span>
            </MovingBorderButton>
          </a>
          <MagneticButton className="rounded-full px-1 py-1">
            <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10">
              Agendar demonstração
            </span>
          </MagneticButton>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <div className="flex items-center">
            <AnimatedTooltip items={HERO_AVATARS} />
          </div>
          <p className="text-sm text-neutral-400">
            <span className="font-semibold text-white">12.000+ times</span> já
            crescem com a Nimbus
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  3. "As seen in" — InfiniteMovingCards com mídias                 */
/* ------------------------------------------------------------------ */

const PRESS_ITEMS = [
  { quote: "A nova fronteira do SaaS de produtividade.", name: "TechCrunch", title: "Cobertura 2025" },
  { quote: "Reescrevendo as regras do no-code.", name: "Forbes", title: "Perfil da empresa" },
  { quote: "A plataforma que o Vale do Silício não quer que você conheça.", name: "Wired", title: "Matéria de capa" },
  { quote: "Escala global com a simplicidade que faltava.", name: "The Verge", title: "Review 4.5/5" },
  { quote: "O stack completo para times ambiciosos.", name: "Fast Company", title: "Most Innovative 2025" },
  { quote: "Inteligência que se traduz em receita.", name: "Bloomberg", title: "Análise de mercado" },
]

function SaasPressStrip() {
  return (
    <section className="border-b border-border bg-muted/20 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 text-center text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
          Visto em
        </p>
        <InfiniteMovingCards
          items={PRESS_ITEMS}
          direction="left"
          speed="slow"
          pauseOnHover
        />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  4. Logos de clientes (LogoSlider, 1ª faixa)                       */
/* ------------------------------------------------------------------ */

const CLIENT_LOGOS = [
  "Vercel",
  "Linear",
  "Stripe",
  "Notion",
  "Figma",
  "Raycast",
  "Loom",
  "Framer",
]

function SaasLogos() {
  return (
    <section className="border-b border-border bg-background py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-8 text-center text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Confiado por times de produto de alto crescimento
        </p>
        <LogoSlider
          pauseOnHover
          speed={32}
          logos={CLIENT_LOGOS.map((name) => (
            <span className="text-2xl font-semibold tracking-tight text-foreground/70">
              {name}
            </span>
          ))}
        />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  5. ThreeDMarquee — 20+ screenshots do produto                     */
/* ------------------------------------------------------------------ */

const PRODUCT_SCREENSHOTS = Array.from({ length: 20 }, (_, i) =>
  `https://picsum.photos/seed/nimbus-shot-${i + 1}/320/220`,
)

function SaasThreeDMarquee() {
  return (
    <section id="product" className="relative overflow-hidden bg-background py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Produto
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Veja a Nimbus em ação
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          20 telas reais do produto: dashboards, automações, integrações e
          ferramentas de IA. Cada uma num grid 3D inclinado que se move
          continuamente.
        </p>
      </div>
      <div className="mt-12">
        <ThreeDMarquee images={PRODUCT_SCREENSHOTS} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  6. StickyScroll "Como funciona" em 3 passos                       */
/* ------------------------------------------------------------------ */

const HOW_IT_WORKS: StickyScrollContentItem[] = [
  {
    title: "1. Conecte seu stack em minutos",
    description:
      "Importe dados de Postgres, MySQL, Stripe, Segment, Mixpanel e mais de 200 fontes. Sem ETL, sem código. Suas métricas estão vivas em minutos — não em sprints.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white">
        <Plug className="h-12 w-12" />
        <span className="text-2xl font-semibold">+200 integrações</span>
        <span className="text-sm text-white/70">Postgres · MySQL · Stripe · Segment</span>
      </div>
    ),
  },
  {
    title: "2. Construa painéis e automações sem código",
    description:
      "Editor visual com componentes prontos, arraste-e-solte blocos condicionais e gatilhos em tempo real. Cada alteração é versionada, testável e reversível com um clique.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white">
        <Layers className="h-12 w-12" />
        <span className="text-2xl font-semibold">Editor visual</span>
        <span className="text-sm text-white/70">Arraste · Conecte · Publique</span>
      </div>
    ),
  },
  {
    title: "3. Escale global com IA no loop",
    description:
      "Modelos multimodais detectam anomalias, sugerem otimizações e respondem perguntas em linguagem natural sobre seus dados. Tudo auditado, tudo explicável.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white">
        <Sparkles className="h-12 w-12" />
        <span className="text-2xl font-semibold">IA no loop</span>
        <span className="text-sm text-white/70">Anomalias · Sugestões · Perguntas</span>
      </div>
    ),
  },
]

function SaasHowItWorks() {
  return (
    <section id="how" className="bg-background">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Como funciona
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Da primeira integração ao scale em 3 passos
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Role para descobrir como a Nimbus transforma dados brutos em decisões
          de produto — sem escrever uma linha de código.
        </p>
      </div>
      <StickyScroll content={HOW_IT_WORKS} />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  7. Métricas + Terminal (card de log ao vivo)                       */
/* ------------------------------------------------------------------ */

type StatProps = {
  target: number
  suffix?: string
  label: string
}

function CountUpStat({ target, suffix, label }: StatProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setValue(target)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="flex items-baseline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        <AnimatedNumber value={value} />
        {suffix ? <span className="text-primary">{suffix}</span> : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

const STATS: StatProps[] = [
  { target: 99, suffix: ".9%", label: "Uptime garantido por SLA" },
  { target: 12, suffix: "K+", label: "Times ativos hoje" },
  { target: 140, suffix: "+", label: "Países atendidos" },
  { target: 4, suffix: ".9/5", label: "Avaliação média dos clientes" },
]

function SaasStats() {
  return (
    <section className="border-y border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          {/* Métricas */}
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Números
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Resultados que aparecem no primeiro mês
            </h2>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Não acredite só na nossa palavra — os números contam a história.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10">
              {STATS.map((stat) => (
                <CountUpStat key={stat.label} {...stat} />
              ))}
            </div>
          </div>

          {/* Terminal flutuante */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-fuchsia-500/20 blur-2xl" />
            <div className="relative">
              <Terminal
                username="nimbus-prod"
                typingSpeed={28}
                delayBetweenCommands={520}
                commands={[
                  "nimbus deploy --env production",
                  "✔ Migrating 12 datasets… done in 1.4s",
                  "✔ Spinning up 3 workers… online",
                  "✔ Routing 200+ edges… warm",
                  "→  ✓ nimbus.app is live (47ms p95)",
                ]}
                outputs={{}}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  8. Features (skeletons animados)                                  */
/* ------------------------------------------------------------------ */

const FEATURE_IMAGES = [
  "https://picsum.photos/seed/nimbus-f1/300/300",
  "https://picsum.photos/seed/nimbus-f2/300/300",
  "https://picsum.photos/seed/nimbus-f3/300/300",
  "https://picsum.photos/seed/nimbus-f4/300/300",
]

const FEATURES: FeatureItem[] = [
  {
    title: "Workspace visual e colaborativo",
    description:
      "Organize campanhas, releases e referências numa tela só — arraste, agrupe e compartilhe com o time em segundos.",
    skeleton: <SkeletonImageGrid images={FEATURE_IMAGES} />,
    className: "col-span-1 lg:col-span-4 border-b border-border lg:border-r",
  },
  {
    title: "Analytics em tempo real",
    description:
      "Dashboards vivos que respiram conforme os dados chegam. Sem ETL, sem espera.",
    skeleton: <SkeletonBars />,
    className: "col-span-1 lg:col-span-2 border-b border-border",
  },
  {
    title: "Infra global de borda",
    description:
      "Sua aplicação perto de cada usuário, com latência baixíssima em 140+ países.",
    skeleton: <SkeletonRipple />,
    className: "col-span-1 lg:col-span-3 lg:border-r border-border",
  },
  {
    title: "Automações sem código",
    description:
      "Construa pipelines de ponta a ponta com gatilhos visuais — da ideia ao deploy contínuo.",
    skeleton: <SkeletonBars />,
    className: "col-span-1 lg:col-span-3",
  },
]

function SaasFeatures() {
  return (
    <section id="features" className="bg-background">
      <div className="mx-auto max-w-2xl px-6 pt-20 text-center">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase">
          Recursos
        </span>
      </div>
      <FeaturesSectionWithSkeletons
        heading="Tudo que sua equipe precisa para crescer"
        subheading="Da primeira ideia ao scale global, uma plataforma completa — construída para velocidade e sem fricção."
        features={FEATURES}
      />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  9. UseCases — ExpandableCards (3 personas)                        */
/* ------------------------------------------------------------------ */

const USE_CASES = [
  {
    title: "Startup",
    description: "Lance rápido, itere com dados",
    src: "https://picsum.photos/seed/nimbus-uc-startup/300/300",
    ctaText: "Ver plano Starter",
    ctaLink: "#pricing",
    content: () => (
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          <strong>Para founders em fase seed/Series A</strong> que precisam
          validar produto e aprender rápido — sem montar um time de dados.
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Painéis de uso out-of-the-box em 5 minutos</li>
          <li>Cohort e funil prontos para apresentar a investidores</li>
          <li>Integração com Stripe e HubSpot sem código</li>
          <li>14 dias Pro grátis para experimentar</li>
        </ul>
        <p className="text-muted-foreground">
          <em>Usado por:</em> Drift, Cumulus, Vertex Labs.
        </p>
      </div>
    ),
  },
  {
    title: "Scale-up",
    description: "Operações complexas, zero fricção",
    src: "https://picsum.photos/seed/nimbus-uc-scale/300/300",
    ctaText: "Ver plano Pro",
    ctaLink: "#pricing",
    content: () => (
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          <strong>Para times de 20-200 pessoas</strong> que já cresceram além do
          "dashboard no Notion" e precisam de governança sem perder velocidade.
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>SSO, SAML, RBAC e auditoria completa</li>
          <li>Workspaces por squad com permissões granulares</li>
          <li>Alertas em tempo real no Slack e PagerDuty</li>
          <li>API tipada e webhooks para integrações profundas</li>
        </ul>
        <p className="text-muted-foreground">
          <em>Usado por:</em> Northwind, Praxis, Quanta.
        </p>
      </div>
    ),
  },
  {
    title: "Enterprise",
    description: "Governança, SLA e suporte dedicado",
    src: "https://picsum.photos/seed/nimbus-uc-enterprise/300/300",
    ctaText: "Falar com vendas",
    ctaLink: "#pricing",
    content: () => (
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          <strong>Para organizações com 200+ colaboradores</strong> e requisitos
          rigorosos de compliance, privacidade e suporte.
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>SOC 2 Type II, GDPR, LGPD, ISO 27001, HIPAA</li>
          <li>Deploy em VPC, on-premise ou multi-cloud</li>
          <li>Gerente de conta dedicado e SLA de 99,99%</li>
          <li>Onboarding white-glove e treinamentos in-company</li>
        </ul>
        <p className="text-muted-foreground">
          <em>Usado por:</em> Helio, Lumini, Cumulus Bank.
        </p>
      </div>
    ),
  },
]

function SaasUseCases() {
  return (
    <section className="border-t border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Para quem
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Um plano que cabe em qualquer estágio
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Clique num card para ver recursos, integrações e cases específicos
            para cada perfil de time.
          </p>
        </div>
        <div className="mt-10">
          <ExpandableCards cards={USE_CASES} />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  10. Bento (diferenciais com GlowingEffect)                         */
/* ------------------------------------------------------------------ */

function GlowBentoHeader({
  icon: Icon,
  seed,
}: {
  icon: React.ComponentType<{ className?: string }>
  seed?: string
}) {
  return (
    <div className="relative flex h-full min-h-28 w-full flex-1 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/60 to-muted dark:from-muted/30 dark:to-muted/5">
      {seed ? (
        <img
          src={`https://picsum.photos/seed/${seed}/600/300`}
          alt=""
          className="h-full w-full object-cover opacity-80 transition duration-300 group-hover/bento:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Icon className="h-10 w-10 text-muted-foreground/60" />
        </div>
      )}
    </div>
  )
}

const BENTO_ITEMS = [
  {
    title: "Segurança enterprise",
    description: "SOC 2, SSO, RBAC e criptografia ponta a ponta por padrão.",
    icon: Shield,
    seed: undefined as string | undefined,
    span: "lg:col-span-1",
  },
  {
    title: "200+ integrações nativas",
    description: "Conecte Slack, HubSpot, Stripe, GitHub e todo o seu stack em 1 clique.",
    icon: Plug,
    seed: "nimbus-integrations",
    span: "lg:col-span-2",
  },
  {
    title: "Relatórios automáticos",
    description: "Insights semanais entregues onde seu time já trabalha.",
    icon: BarChart3,
    seed: "nimbus-reports",
    span: "lg:col-span-2",
  },
  {
    title: "Privacidade por design",
    description: "Seus dados são seus. Resiliência e auditoria completas.",
    icon: Lock,
    seed: undefined,
    span: "lg:col-span-1",
  },
]

function SaasBento() {
  return (
    <section className="border-t border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Construído para times que não param
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Passe o mouse pelos cards para ver a borda luminosa seguir o cursor.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-6xl px-6">
        <BentoGrid className="md:grid-cols-3">
          {BENTO_ITEMS.map((item) => (
            <div
              key={item.title}
              className={cn("group/bento relative", item.span)}
            >
              <GlowingEffect
                disabled={false}
                blur={0}
                spread={40}
                proximity={64}
                inactiveZone={0.6}
                borderWidth={2}
              />
              <BentoGridItem
                title={item.title}
                description={item.description}
                header={<GlowBentoHeader icon={item.icon} seed={item.seed} />}
                icon={<item.icon className="h-4 w-4 text-muted-foreground" />}
                className="relative z-10 h-full"
              />
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  11. Developer — CodeBlock com snippet "integre em 30s"             */
/* ------------------------------------------------------------------ */

const SNIPPET_TS = `import { Nimbus } from "@nimbus/sdk"

const nb = new Nimbus({ apiKey: process.env.NIMBUS_KEY })

// Track um evento em qualquer lugar do seu app
await nb.events.track({
  user: "user_42",
  event: "checkout.completed",
  properties: { plan: "pro", value: 249 },
})

// Receba em tempo real no painel
// → nimbus.app/dashboard/events
`

const SNIPPET_CURL = `# Via REST — curl em qualquer linguagem
curl -X POST https://api.nimbus.app/v1/events \\
  -H "Authorization: Bearer $NIMBUS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user": "user_42",
    "event": "checkout.completed",
    "properties": { "plan": "pro", "value": 249 }
  }'

# Resposta 200 com event_id para rastreabilidade
`

const SNIPPET_PY = `from nimbus import Nimbus

nb = Nimbus(api_key=os.environ["NIMBUS_KEY"])

# Track um evento do seu backend Python
nb.events.track(
    user="user_42",
    event="checkout.completed",
    properties={"plan": "pro", "value": 249},
)

# Processado em <50ms p99 globalmente
`

function SaasDeveloper() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          {/* Texto */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              <Code2 className="h-3.5 w-3.5" />
              Built for developers
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Integre em 30 segundos
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              SDKs tipados em TypeScript, Python, Go, Ruby e Java. Webhooks
              versionados, API REST documentada com OpenAPI 3.1 e ambiente de
              sandbox gratuito.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-foreground">
              {[
                "Latência global p99 < 50ms",
                "Idempotência por event_id",
                "Replay de eventos em produção",
                "Compatível com HIPAA, SOC 2, GDPR",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CodeBlock */}
          <div>
            <CodeBlock
              language="tsx"
              filename="track-event.ts"
              tabs={[
                { name: "track-event.ts", code: SNIPPET_TS, language: "tsx" },
                { name: "cURL", code: SNIPPET_CURL, language: "bash" },
                { name: "track_event.py", code: SNIPPET_PY, language: "python" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  12. Depoimentos + stats agregados                                 */
/* ------------------------------------------------------------------ */

const TESTIMONIALS = [
  {
    quote:
      "Migramos quatro ferramentas para a Nimbus e cortamos 40% do custo de operação. O time adotou em uma tarde.",
    name: "Marina Alves",
    designation: "Head of Growth @ Lumen",
    src: "https://picsum.photos/seed/nimbus-t1/500/500",
  },
  {
    quote:
      "Os dashboards em tempo real mudaram como tomamos decisão. Hoje vemos o impacto de um experimento em minutos.",
    name: "Rafael Lima",
    designation: "CTO @ Drift",
    src: "https://picsum.photos/seed/nimbus-t2/500/500",
  },
  {
    quote:
      "Setup indolor e suporte impecável. Subimos para 200+ usuários sem uma única reclamação de performance.",
    name: "Sofia Becker",
    designation: "Product Lead @ Northwind",
    src: "https://picsum.photos/seed/nimbus-t3/500/500",
  },
  {
    quote:
      "A IA sugeriu três experimentos que geraram 1.2M em ARR incremental no trimestre. Vale cada centavo do Pro.",
    name: "Caio Mendes",
    designation: "Founder @ Drift",
    src: "https://picsum.photos/seed/nimbus-t4/500/500",
  },
  {
    quote:
      "Compliance, SSO, auditoria — tudo que o CISO pediu já veio pronto. Onboarding de 4 semanas em vez de 4 meses.",
    name: "Helena Costa",
    designation: "VP Eng @ Pulse",
    src: "https://picsum.photos/seed/nimbus-t5/500/500",
  },
]

const AGGREGATE_STATS = [
  { value: "4.9/5", label: "G2 (2.1k reviews)" },
  { value: "4.8/5", label: "Capterra (3.4k)" },
  { value: "98%", label: "Recomendariam" },
  { value: "4.7/5", label: "Product Hunt" },
]

function SaasTestimonials() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase">
          Depoimentos
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Amada por quem constrói
        </h2>
      </div>
      <div className="mx-auto mt-6 max-w-3xl px-6">
        <AnimatedTestimonials autoplay testimonials={TESTIMONIALS} />
      </div>

      {/* Stats agregados */}
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-6 border-t border-border px-6 pt-10 lg:grid-cols-4">
        {AGGREGATE_STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-3xl font-bold text-foreground sm:text-4xl">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              {s.value}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  13. Integrações — LogoSlider 2ª faixa com 16+ ferramentas          */
/* ------------------------------------------------------------------ */

const INTEGRATION_ICONS: ReadonlyArray<{
  name: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { name: "Slack", icon: Slack },
  { name: "GitHub", icon: Github },
  { name: "Webhooks", icon: Webhook },
  { name: "Postgres", icon: Database },
  { name: "Zapier", icon: Blocks },
  { name: "LinkedIn", icon: Linkedin },
  { name: "Headless", icon: Cpu },
  { name: "Sendgrid", icon: Send },
]

const INTEGRATION_LOGOS = [
  "Slack",
  "GitHub",
  "Stripe",
  "HubSpot",
  "Notion",
  "Figma",
  "Linear",
  "Vercel",
  "Datadog",
  "PagerDuty",
  "Mixpanel",
  "Segment",
  "Intercom",
  "Sentry",
  "Airtable",
  "Zapier",
]

function SaasIntegrations() {
  return (
    <section className="border-y border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Integrações
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Encaixa no stack que você já ama
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Mais de 200 integrações nativas + API REST e webhooks para qualquer
            ferramenta. Conecte tudo em poucos cliques — sem Glue code.
          </p>
        </div>

        {/* Grade de ícones (8 principais) */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-4 gap-4 sm:grid-cols-8">
          {INTEGRATION_ICONS.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="group flex aspect-square items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:scale-105 hover:border-primary/30 hover:bg-muted hover:text-foreground"
              title={name}
            >
              <Icon className="h-7 w-7" />
            </div>
          ))}
        </div>

        {/* Marquee de logos */}
        <div className="mt-12">
          <p className="mb-6 text-center text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            +200 outras integrações
          </p>
          <LogoSlider
            direction="right"
            speed={48}
            pauseOnHover
            logos={INTEGRATION_LOGOS.map((name) => (
              <span className="text-xl font-semibold tracking-tight text-foreground/70">
                {name}
              </span>
            ))}
          />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  14. Pricing (3 planos com GlowingEffect no popular)                */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    name: "Starter",
    price: "R$0",
    period: "/mês",
    description: "Perfeito para validar ideias e side projects.",
    features: [
      "Até 1.000 eventos/mês",
      "3 membros no time",
      "Suporte da comunidade",
      "Analytics básico",
      "5 painéis salvos",
    ],
    cta: "Começar agora",
    popular: false,
    icon: Rocket,
  },
  {
    name: "Pro",
    price: "R$249",
    period: "/mês",
    description: "Para times em crescimento que precisam de mais poder.",
    features: [
      "Eventos ilimitados",
      "Membros ilimitados",
      "Suporte prioritário 24/7",
      "Analytics avançado + IA",
      "Integrações customizadas",
      "SSO & RBAC",
      "Painéis ilimitados",
    ],
    cta: "Testar 14 dias grátis",
    popular: true,
    icon: Zap,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para organizações com necessidades avançadas.",
    features: [
      "Tudo do plano Pro",
      "Gerente de conta dedicado",
      "SLA com garantia",
      "Deploy on-premise",
      "Contratos & auditoria",
      "Onboarding white-glove",
    ],
    cta: "Falar com vendas",
    popular: false,
    icon: Globe2,
  },
]

const COMPARISON_HIGHLIGHTS = [
  { feature: "Eventos / mês", values: ["1k", "Ilimitados", "Ilimitados"] },
  { feature: "Membros", values: ["3", "Ilimitados", "Ilimitados"] },
  { feature: "Painéis", values: ["5", "Ilimitados", "Ilimitados"] },
  { feature: "IA Generativa", values: [false, true, true] },
  { feature: "SSO & SAML", values: [false, true, true] },
  { feature: "SLA 99,9%", values: [false, true, true] },
  { feature: "Gerente dedicado", values: [false, false, true] },
  { feature: "On-premise", values: [false, false, true] },
]

function ComparisonRow({
  feature,
  values,
}: {
  feature: string
  values: (string | boolean)[]
}) {
  return (
    <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] items-center gap-3 border-b border-border/50 py-3 text-sm">
      <span className="font-medium text-foreground">{feature}</span>
      {values.map((v, i) => (
        <div key={i} className="text-center text-muted-foreground">
          {v === true ? (
            <Check className="mx-auto h-4 w-4 text-primary" />
          ) : v === false ? (
            <span className="text-muted-foreground/40">—</span>
          ) : (
            <span className="text-foreground">{v}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function SaasPricing() {
  return (
    <section id="pricing" className="border-t border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">
            Preços
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simples, transparente, sem surpresas
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Sem taxas escondidas. Cancele quando quiser.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-7 transition-shadow",
                plan.popular
                  ? "border-primary/40 shadow-xl shadow-primary/10"
                  : "border-border",
              )}
            >
              {plan.popular ? (
                <GlowingEffect
                  disabled={false}
                  glow
                  blur={0}
                  spread={48}
                  proximity={80}
                  inactiveZone={0.5}
                  borderWidth={2}
                />
              ) : null}

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <plan.icon className="h-5 w-5 text-primary" />
                    {plan.name}
                  </span>
                  {plan.popular ? (
                    <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                      Mais popular
                    </span>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.popular ? (
                    <a href="#signup" className="block rounded-full">
                      <MovingBorderButton
                        borderRadius="9999px"
                        duration={3000}
                        containerClassName="h-11 w-full"
                        className="h-full w-full bg-neutral-950 text-sm font-semibold text-white"
                      >
                        {plan.cta}
                      </MovingBorderButton>
                    </a>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <a href="#signup">{plan.cta}</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparativo compacto */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-6 lg:p-8">
          <h3 className="text-lg font-semibold text-foreground">
            Comparativo de recursos
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            O essencial de cada plano, lado a lado.
          </p>
          <div className="mt-6">
            <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] items-center gap-3 border-b border-border pb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <span>Recurso</span>
              <span className="text-center">Starter</span>
              <span className="text-center text-primary">Pro</span>
              <span className="text-center">Enterprise</span>
            </div>
            {COMPARISON_HIGHLIGHTS.map((row) => (
              <ComparisonRow
                key={row.feature}
                feature={row.feature}
                values={row.values}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  15. Customer Story em destaque                                    */
/* ------------------------------------------------------------------ */

function SaasCustomerStory() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-8 py-12 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/30 lg:px-14 lg:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 to-fuchsia-400/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            {/* Quote + autor */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Customer story
              </span>
              <blockquote className="mt-5 text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
                “A Nimbus nos tirou de 6 ferramentas e nos devolveu foco. Em 90
                dias reduzimos o ciclo de release de 3 semanas para 2 dias — e
                vimos um salto de 38% na retenção.”
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <img
                  src="https://picsum.photos/seed/nimbus-story/120/120"
                  alt=""
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    Marina Alves
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Head of Growth · Lumen
                  </p>
                </div>
              </div>
            </div>

            {/* Stats de resultado */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "38%", label: "Aumento em retenção em 90 dias" },
                { value: "6→1", label: "Ferramentas consolidadas" },
                { value: "2d", label: "Ciclo de release (antes: 3sem)" },
                { value: "4.2x", label: "ROI sobre a assinatura Pro" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {s.value}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  16. FAQ                                                            */
/* ------------------------------------------------------------------ */

const FAQ = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não. O plano Starter é gratuito para sempre e você pode testar o Pro por 14 dias sem informar cartão.",
  },
  {
    q: "Consigo migrar meus dados de outra ferramenta?",
    a: "Sim. Temos importadores nativos para Amplitude, Mixpanel, Segment, Heap e Postgres. Um time de onboarding também faz a migração com você, sem downtime.",
  },
  {
    q: "Como funciona a segurança dos dados?",
    a: "Somos SOC 2 Type II, com SSO, RBAC e criptografia ponta a ponta. Seus dados nunca são compartilhados e ficam isolados por workspace.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Claro. Sem fidelidade e sem multa — cancele com um clique e mantenha o acesso até o fim do ciclo pago.",
  },
  {
    q: "Vocês oferecem desconto para ONGs e educação?",
    a: "Sim. Instituições de ensino e organizações sem fins lucrativos têm 50% de desconto. Fale com vendas para validar elegibilidade.",
  },
  {
    q: "A IA generativa usa meus dados para treinar modelos?",
    a: "Nunca. Seus dados são processados em runtime e descartados. Nenhum dado é usado para treinar modelos compartilhados. Política auditável e assinada em contrato.",
  },
]

function SaasFaq() {
  return (
    <section id="faq" className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Tudo que você precisa saber antes de começar.
          </p>
        </div>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQ.map((item, idx) => (
            <AccordionItem key={item.q} value={`faq-${idx}`}>
              <AccordionTrigger className="text-left text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  17. CTA final (LampContainer)                                      */
/* ------------------------------------------------------------------ */

function SaasCta() {
  return (
    <section id="signup" className="relative bg-slate-950">
      <LampContainer className="min-h-[34rem]">
        <div className="flex flex-col items-center text-center">
          <h2 className="bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl">
            Pronto para escalar?
          </h2>
          <p className="mt-6 max-w-md text-sm text-slate-400 md:text-base">
            Junte-se a mais de 12.000 times que já crescem com a Nimbus.
            Comece grátis em menos de 2 minutos.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a href="#signup" className="rounded-full">
              <MovingBorderButton
                borderRadius="9999px"
                duration={2800}
                containerClassName="h-12 w-56"
                className="h-full w-full bg-slate-950 text-sm font-semibold text-white"
              >
                <span className="flex items-center gap-2">
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </span>
              </MovingBorderButton>
            </a>
            <MagneticButton className="rounded-full px-1 py-1">
              <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10">
                Falar com vendas
              </span>
            </MagneticButton>
          </div>
        </div>
      </LampContainer>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  18. Footer com newsletter, social e selos                         */
/* ------------------------------------------------------------------ */

const FOOTER_COLUMNS = [
  {
    title: "Produto",
    links: ["Recursos", "Integrações", "Preços", "Changelog", "Roadmap"],
  },
  {
    title: "Empresa",
    links: ["Sobre", "Carreiras", "Blog", "Imprensa", "Contato"],
  },
  {
    title: "Recursos",
    links: ["Documentação", "Guias", "Suporte", "Status", "API"],
  },
  {
    title: "Legal",
    links: ["Privacidade", "Termos", "Segurança", "Cookies", "LGPD"],
  },
]

const COMPLIANCE_BADGES = ["SOC 2", "GDPR", "ISO 27001", "LGPD", "HIPAA"]

function SaasFooter() {
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim().length === 0) return
    setSubscribed(true)
    setEmail("")
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 lg:flex-row lg:justify-between">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-foreground">
              Fique por dentro das novidades
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Newsletter quinzenal com dicas de produto, IA e growth — sem
              spam, descadastro em 1 clique.
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md gap-2"
          >
            <Input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              {subscribed ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Inscrito
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Assinar <Send className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div className="max-w-sm">
            <NimbusLogo className="ml-0" />
            <p className="mt-4 text-sm text-muted-foreground">
              A plataforma all-in-one para times que constroem produtos que
              vendem. Feita com componentes da vitrine.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              Todos os sistemas operacionais
            </div>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Github, label: "GitHub" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Instagram, label: "Instagram" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#top"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-foreground">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#top"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Compliance badges */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Compliance:
          </span>
          {COMPLIANCE_BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nimbus. Construído com React, Vite &
            Tailwind CSS.
          </p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Headphones className="h-3.5 w-3.5" />
            Suporte 24/7
            <span aria-hidden>·</span>
            Feito com componentes da vitrine ✦
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/*  StickyBanner (1ª seção) — banner no topo com CTA StatefulButton   */
/* ------------------------------------------------------------------ */

function SaasStickyBanner() {
  const [dismissed, setDismissed] = React.useState(false)
  const [clicked, setClicked] = React.useState(false)

  if (dismissed) return null

  return (
    <StickyBanner className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
      <span className="flex w-full items-center justify-center gap-3 px-4 text-sm font-medium">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span className="truncate">
          <strong>Black Friday:</strong> 50% off no plano Pro nos 3 primeiros
          meses
        </span>
        <button
          type="button"
          onClick={() => setClicked(true)}
          className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/25"
        >
          {clicked ? (
            <>
              <Check className="h-3 w-3" /> Cupom aplicado
            </>
          ) : (
            <>
              Pegar cupom <ArrowRight className="h-3 w-3" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fechar banner"
          className="ml-1 rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden>×</span>
        </button>
      </span>
    </StickyBanner>
  )
}

/* ------------------------------------------------------------------ */
/*  HoverEffect (cards de "Vantagens chave" entre Features e UseCases) */
/* ------------------------------------------------------------------ */

const HOVER_ADVANTAGES = [
  {
    title: "Latência global p99 < 50ms",
    description:
      "Edge em 140+ países com replicação multi-região. Seus usuários não percebem distância — só velocidade.",
    link: "#latency",
  },
  {
    title: "Editor visual, mas com saída de código",
    description:
      "Tudo o que você constrói no canvas vira JSON versionado e exportável. Sem lock-in, sem caixa-preta.",
    link: "#export",
  },
  {
    title: "IA que conhece seu produto",
    description:
      "Modelos multimodais treinados no seu schema, não em dados genéricos. Respostas que fazem sentido pro seu negócio.",
    link: "#ai-context",
  },
  {
    title: "Observabilidade de ponta a ponta",
    description:
      "Traces, métricas e logs em uma única timeline. Detecte gargalos antes que usuários reclamem.",
    link: "#observability",
  },
  {
    title: "Versionamento tipo Git",
    description:
      "Branches, PRs, reviews e rollback granular para qualquer painel, automação ou pipeline de dados.",
    link: "#versioning",
  },
  {
    title: "Workspaces ilimitados",
    description:
      "Separe produção, staging e experimentos sem fricção. Convide o time com permissões granulares.",
    link: "#workspaces",
  },
]

function SaasHoverAdvantages() {
  return (
    <section className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Vantagens
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Detalhes que importam, todos de fábrica
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Recursos que outras plataformas vendem como add-on — na Nimbus
            vêm inclusos desde o dia 1.
          </p>
        </div>
        <div className="mt-10">
          <HoverEffect items={HOVER_ADVANTAGES} />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Composition export                                                */
/* ------------------------------------------------------------------ */

export function SaasLanding2() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      <SaasStickyBanner />
      <SaasNavbar />
      <SaasHero />
      <SaasPressStrip />
      <SaasLogos />
      <SaasThreeDMarquee />
      <SaasHowItWorks />
      <SaasStats />
      <SaasFeatures />
      <SaasHoverAdvantages />
      <SaasUseCases />
      <SaasBento />
      <SaasDeveloper />
      <SaasTestimonials />
      <SaasIntegrations />
      <SaasPricing />
      <SaasCustomerStory />
      <SaasFaq />
      <SaasCta />
      <SaasFooter />
    </div>
  )
}
