/**
 * Composição "SaaS Landing 2.0" — Nimbus.
 *
 * Landing page SaaS de alto padrão, montada inteiramente com componentes do
 * registry da vitrine. Mostra o potencial do catálogo numa página real de
 * conversão: banner sticky, navbar que encolhe no scroll, hero com facho de
 * luz (Spotlight) + texto animado (FlipWords) + prova social (AnimatedTooltip),
 * faixa de logos (LogoSlider), showcase de produto dirigido por scroll
 * (ContainerScroll), métricas que contam na entrada (AnimatedNumber), seção de
 * features com skeletons animados, grid bento com borda luminosa (GlowingEffect),
 * depoimentos (AnimatedTestimonials), pricing elevado, FAQ (Accordion) e um CTA
 * final em efeito lâmpada (LampContainer). Conteúdo em PT-BR.
 */

import * as React from "react"
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe2,
  Lock,
  Plug,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { Button } from "@/components/ui/button"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import {
  FeaturesSectionWithSkeletons,
  SkeletonBars,
  SkeletonImageGrid,
  SkeletonRipple,
  type FeatureItem,
} from "@/components/ui/features-section-with-skeletons"
import { FlipWords } from "@/components/ui/flip-words"
import { GlowingEffect } from "@/components/ui/glowing-effect"
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
import { StickyBanner } from "@/components/ui/sticky-banner"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Recursos", link: "#features" },
  { name: "Produto", link: "#product" },
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
/*  Navbar                                                            */
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
            Começar grátis
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
/*  Hero (dark fixo, Spotlight)                                        */
/* ------------------------------------------------------------------ */

const HERO_AVATARS = [
  {
    id: 1,
    name: "Marina Alves",
    designation: "Head of Growth",
    image: "https://picsum.photos/seed/nimbus-a/200/200",
  },
  {
    id: 2,
    name: "Rafael Lima",
    designation: "CTO @ Lumen",
    image: "https://picsum.photos/seed/nimbus-b/200/200",
  },
  {
    id: 3,
    name: "Sofia Becker",
    designation: "Product Lead",
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
    designation: "VP Eng",
    image: "https://picsum.photos/seed/nimbus-e/200/200",
  },
]

function SaasHero() {
  return (
    <section
      id="top"
      className="relative -mt-20 flex min-h-[44rem] w-full items-center justify-center overflow-hidden bg-neutral-950 pt-32 pb-20 antialiased"
    >
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#818cf8" />
      <div
        className="pointer-events-none absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]" aria-hidden />

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
          Automatize fluxos, analise dados em tempo real e cresça a receita — tudo
          numa única plataforma, sem complexidade de enterprise e sem código.
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
/*  Logos                                                             */
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
/*  Product showcase (ContainerScroll)                                */
/* ------------------------------------------------------------------ */

function SaasProductShowcase() {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <section id="product" className="bg-background">
      <div className="mx-auto max-w-2xl px-6 pt-20 text-center">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase">
          Visão única
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Todo o seu negócio em um só painel
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Métricas, automações e times — role para ver o painel ganhar vida.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="h-[560px] w-full overflow-y-auto"
      >
        <div className="flex min-h-[170vh] flex-col">
          <ContainerScroll
            scrollRef={scrollRef}
            titleComponent={
              <h3 className="text-2xl font-semibold text-foreground">
                Painéis que vendem por você
                <br />
                <span className="mt-1 block text-3xl leading-none font-bold md:text-[4.5rem]">
                  Dashboard Nimbus
                </span>
              </h3>
            }
          >
            <img
              src="https://picsum.photos/seed/nimbus-dashboard/1400/820"
              alt="Painel Nimbus"
              className="mx-auto h-full w-full rounded-2xl object-cover object-left-top"
              draggable={false}
            />
          </ContainerScroll>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Métricas (count-up)                                               */
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
    <section className="border-y border-border bg-muted/20 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 px-6 lg:grid-cols-4">
        {STATS.map((stat) => (
          <CountUpStat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Features (skeletons animados)                                     */
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
/*  Bento (diferenciais com GlowingEffect)                            */
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
/*  Depoimentos                                                       */
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
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Pricing (GlowingEffect no plano popular)                          */
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
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                               */
/* ------------------------------------------------------------------ */

const FAQ = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não. O plano Starter é gratuito para sempre e você pode testar o Pro por 14 dias sem informar cartão.",
  },
  {
    q: "Consigo migrar meus dados de outra ferramenta?",
    a: "Sim. Temos importadores nativos e um time de onboarding que faz a migração com você, sem downtime.",
  },
  {
    q: "Como funciona a segurança dos dados?",
    a: "Somos SOC 2 Type II, com SSO, RBAC e criptografia ponta a ponta. Seus dados nunca são compartilhados.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Claro. Sem fidelidade e sem multa — cancele com um clique e mantenha o acesso até o fim do ciclo pago.",
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
/*  CTA final (LampContainer)                                          */
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
            Junte-se a mais de 12.000 times que já crescem com a Nimbus. Comece
            grátis em menos de 2 minutos.
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
/*  Footer                                                            */
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
    links: ["Privacidade", "Termos", "Segurança", "Cookies"],
  },
]

function SaasFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
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
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nimbus. Construído com React, Vite &
            Tailwind CSS.
          </p>
          <p className="text-xs text-muted-foreground">
            Feito com componentes da vitrine ✦
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/*  Composition export                                                */
/* ------------------------------------------------------------------ */

export function SaasLanding2() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      <StickyBanner className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Black Friday: 50% off no plano Pro nos 3 primeiros meses
          <ArrowRight className="h-4 w-4" />
        </span>
      </StickyBanner>

      <SaasNavbar />
      <SaasHero />
      <SaasLogos />
      <SaasProductShowcase />
      <SaasStats />
      <SaasFeatures />
      <SaasBento />
      <SaasTestimonials />
      <SaasPricing />
      <SaasFaq />
      <SaasCta />
      <SaasFooter />
    </div>
  )
}
