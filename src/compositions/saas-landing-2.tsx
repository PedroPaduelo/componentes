/**
 * Composição "SaaS Landing 2.0".
 *
 * Landing page SaaS com navbar dropdown, banner sticky, botões magnéticos
 * e bordas animadas — montada apenas com componentes do registry da vitrine.
 */

import * as React from "react"
import { ArrowRight, Check, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroHighlight, HeroHighlightText } from "@/components/ui/hero-highlight"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { MovingBorderButton } from "@/components/ui/moving-border"
import { MenuItem, NavbarMenu, HoveredLink } from "@/components/ui/navbar-menu"
import { StickyBanner } from "@/components/ui/sticky-banner"
import { useTheme } from "@/components/theme/use-theme"

/* ------------------------------------------------------------------ */
/*  Navbar                                                            */
/* ------------------------------------------------------------------ */

function SaasNavbar() {
  const [active, setActive] = React.useState<string | null>(null)

  return (
    <div className="flex items-center justify-center pt-6">
      <NavbarMenu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Features">
          <div className="grid grid-cols-2 gap-4 p-4 text-sm">
            <HoveredLink href="#features">Analytics</HoveredLink>
            <HoveredLink href="#features">Automations</HoveredLink>
            <HoveredLink href="#features">Integrations</HoveredLink>
            <HoveredLink href="#features">Security</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Pricing">
          <div className="flex flex-col space-y-2 p-4 text-sm">
            <HoveredLink href="#pricing">Starter</HoveredLink>
            <HoveredLink href="#pricing">Pro</HoveredLink>
            <HoveredLink href="#pricing">Enterprise</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="About">
          <div className="flex flex-col space-y-2 p-4 text-sm">
            <HoveredLink href="#about">Our Story</HoveredLink>
            <HoveredLink href="#about">Careers</HoveredLink>
            <HoveredLink href="#about">Blog</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Contact">
          <div className="flex flex-col space-y-2 p-4 text-sm">
            <HoveredLink href="#contact">Email Us</HoveredLink>
            <HoveredLink href="#contact">Live Chat</HoveredLink>
            <HoveredLink href="#contact">Schedule Demo</HoveredLink>
          </div>
        </MenuItem>
      </NavbarMenu>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

function SaasHero() {
  return (
    <HeroHighlight containerClassName="h-auto py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Badge variant="secondary" className="mb-6">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          Now in public beta
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <HeroHighlightText>Scale Your Business</HeroHighlightText>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          The all-in-one platform to automate workflows, analyze data, and grow
          your revenue — without the enterprise price tag.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MovingBorderButton
            borderRadius="9999px"
            containerClassName="h-12 w-44"
            className="h-full w-full bg-background text-foreground"
          >
            Start free trial
          </MovingBorderButton>
          <MagneticButton className="rounded-full px-8 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              Book a demo
              <ArrowRight className="h-4 w-4" />
            </span>
          </MagneticButton>
        </div>
      </div>
    </HeroHighlight>
  )
}

/* ------------------------------------------------------------------ */
/*  Features                                                          */
/* ------------------------------------------------------------------ */

const features = [
  {
    title: "Real-time Analytics",
    description:
      "Track every metric that matters with live dashboards and custom reports.",
    image: "https://picsum.photos/seed/saas-analytics/400/250",
  },
  {
    title: "Smart Automations",
    description:
      "Build powerful workflows in minutes — no code required.",
    image: "https://picsum.photos/seed/saas-auto/400/250",
  },
  {
    title: "Enterprise Security",
    description:
      "SOC 2 compliant, SSO, RBAC, and end-to-end encryption out of the box.",
    image: "https://picsum.photos/seed/saas-security/400/250",
  },
]

function SaasFeatures() {
  return (
    <section id="features" className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Three pillars that power thousands of high-growth teams.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="overflow-hidden">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <MovingBorderButton
                  borderRadius="9999px"
                  containerClassName="h-9 w-32"
                  className="h-full w-full bg-background text-foreground text-xs"
                >
                  Learn more
                </MovingBorderButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                           */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    description: "Perfect for side projects and experiments.",
    features: [
      "Up to 1,000 events/mo",
      "3 team members",
      "Community support",
      "Basic analytics",
    ],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "For growing teams that need more power.",
    features: [
      "Unlimited events",
      "Unlimited team members",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
      "SSO & RBAC",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with advanced needs.",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise deployment",
      "Custom contracts",
      "Audit logs",
    ],
    cta: "Contact sales",
  },
]

function SaasPricing() {
  return (
    <section id="pricing" className="bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            No hidden fees. No surprises. Cancel anytime.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.popular && (
                    <Badge variant="default">Most popular</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <MagneticButton className="w-full rounded-lg py-2.5">
                  <span className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                    {plan.cta}
                  </span>
                </MagneticButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA                                                               */
/* ------------------------------------------------------------------ */

function SaasCta() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to scale?
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Join 10,000+ teams already using our platform to grow faster.
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticButton className="rounded-full px-12 py-4">
            <span className="flex items-center gap-2 text-base font-semibold text-foreground">
              Get started for free
              <ArrowRight className="h-5 w-5" />
            </span>
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */

function SaasFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5" />
            <span className="text-lg font-semibold">SaaS Landing 2.0</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The modern platform for teams that move fast.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-4">
          <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#about" className="text-muted-foreground transition-colors hover:text-foreground">
            About
          </a>
          <a href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </a>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} SaaS Landing 2.0. Built with React, Vite & Tailwind CSS.
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
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* 1. StickyBanner */}
      <StickyBanner
        className={isDark
          ? "bg-indigo-600 text-white"
          : "bg-indigo-600 text-white"
        }
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Novo: Plano Pro com 50% off
          <ArrowRight className="h-4 w-4" />
        </span>
      </StickyBanner>

      {/* 2. Navbar */}
      <SaasNavbar />

      {/* 3. Hero */}
      <SaasHero />

      {/* 4. Features */}
      <SaasFeatures />

      {/* 5. Pricing */}
      <SaasPricing />

      {/* 6. CTA */}
      <SaasCta />

      {/* 7. Footer */}
      <SaasFooter />
    </div>
  )
}
