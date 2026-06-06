/**
 * Composição "Landing / Hero".
 *
 * Landing page coesa montada apenas com componentes do registry da vitrine:
 * - Hero: WavyBackground (canvas animado) + heading + subheading + CTAs Button.
 * - Trusted by: faixa com LogoSlider (marquee infinito de logos).
 * - Features: grid com HoverEffect (card-hover-effect).
 * - Footer: primitivos + tokens shadcn (light/dark).
 */

import {
  Apple,
  ArrowRight,
  Chrome,
  Figma,
  Github,
  Slack,
  Sparkles,
  Twitch,
  Twitter,
  Youtube,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { GlowCard, GlowCardGrid } from "@/components/ui"
import { LogoSlider } from "@/components/ui/logo-slider"
import { WavyBackground } from "@/components/ui/wavy-background"

const features = [
  {
    title: "Componentes prontos",
    description:
      "Dezenas de componentes shadcn e adaptações de bibliotecas externas, todos com a mesma API e tema reativo.",
    link: "/components#prontos",
  },
  {
    title: "Dark / Light nativo",
    description:
      "Tudo responde ao tema da vitrine via tokens shadcn — sem cores quebradas ou ajustes manuais.",
    link: "/components#dark",
  },
  {
    title: "Copiar & colar",
    description:
      "Cada componente traz código pronto na aba Código, com botão de copiar em um clique.",
    link: "/components#copia",
  },
  {
    title: "Composições reais",
    description:
      "Telas completas montadas só com peças do registry — provando que os blocos encaixam de verdade.",
    link: "/compositions",
  },
  {
    title: "TypeScript estrito",
    description:
      "Build e lint sem dívida técnica: zero any, zero ts-ignore, tipos completos em toda a base.",
    link: "/components#tipado",
  },
  {
    title: "Animações suaves",
    description:
      "Backgrounds em canvas, marquees infinitos e efeitos de hover construídos com motion e CSS moderno.",
    link: "/components#animado",
  },
]

const glowReasons = [
  {
    title: "Velocidade real",
    description: "Do protótipo à produção em horas, não semanas.",
    icon: "https://picsum.photos/seed/glow-speed/160/160",
  },
  {
    title: "Acessível por padrão",
    description: "Foco, teclado e ARIA já cuidados em cada peça.",
    icon: "https://picsum.photos/seed/glow-a11y/160/160",
  },
  {
    title: "Sem bloqueio de fornecedor",
    description: "Código seu, no seu repo, sem caixa-preta.",
    icon: "https://picsum.photos/seed/glow-open/160/160",
  },
]

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ----------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative min-h-[80vh] w-full overflow-hidden">
        <WavyBackground
          containerClassName="min-h-[80vh]"
          colors={["#6366f1", "#8b5cf6", "#ec4899", "#0ea5e9", "#22d3ee"]}
          waveWidth={60}
          waveOpacity={0.5}
          backgroundFill="#0a0a0a"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Vitrine de componentes React
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Construa interfaces lindas em minutos
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/80 sm:text-lg">
              Uma coleção de componentes shadcn e efeitos modernos, com API
              unificada, tema dark/light e código pronto para copiar.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/components">
                  Explorar componentes
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <a href="/compositions">Ver composições</a>
              </Button>
            </div>
          </div>
        </WavyBackground>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Trusted by                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b bg-background py-14">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Usado por times de produto em todo lugar
          </p>
          <LogoSlider
            pauseOnHover
            logos={[
              <Apple className="h-8 w-8" />,
              <Github className="h-8 w-8" />,
              <Chrome className="h-8 w-8" />,
              <Figma className="h-8 w-8" />,
              <Slack className="h-8 w-8" />,
              <Twitch className="h-8 w-8" />,
              <Twitter className="h-8 w-8" />,
              <Youtube className="h-8 w-8" />,
            ]}
          />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Features                                                          */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tudo que você precisa para começar
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Componentes consistentes, documentados e prontos para produção —
              passe o mouse para ver o destaque deslizar.
            </p>
          </div>
          <div className="mt-10">
            <HoverEffect items={features} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Por que escolher (GlowCardGrid)                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Por que escolher a Vitrine
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Passe o mouse sobre os cards para ver o brilho seguir o cursor.
            </p>
          </div>
          <div className="mt-10">
            <GlowCardGrid columns={3}>
              {glowReasons.map((reason) => (
                <GlowCard
                  key={reason.title}
                  icon={reason.icon}
                  iconAlt={reason.title}
                >
                  <div className="px-6 text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      {reason.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </GlowCard>
              ))}
            </GlowCardGrid>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5" />
              <span className="text-lg font-semibold">Vitrine</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Showcase open-source de componentes React baseados em shadcn/ui.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <a
              href="/components"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Componentes
            </a>
            <a
              href="/compositions"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Composições
            </a>
            <a
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Início
            </a>
          </nav>
        </div>
        <div className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Vitrine. Construído com React, Vite e
              Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
