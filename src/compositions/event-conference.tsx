/**
 * Composição "Landing de Conferência / Evento Tech".
 *
 * Landing de um evento de tecnologia montada apenas com componentes do
 * registry da vitrine:
 * - StickyBanner: anúncio fixo de early-bird no topo.
 * - Hero: Vortex (canvas animado, dark fixo só nesta seção) + ColourfulText
 *   com o nome do evento + data/local + COUNTDOWN ao vivo (AnimatedNumber)
 *   + CTA "Garantir ingresso".
 * - Palestrantes: AnimatedTooltip (avatares com tooltip).
 * - Depoimentos: AnimatedTestimonials (autoplay).
 * - Agenda: Timeline (linha do tempo com progresso).
 * - Patrocinadores: LogoSlider (marquee infinito).
 * - Ingressos: cards de planos (Básico/Pro/VIP) com tokens shadcn.
 * - Footer.
 *
 * Tema: o corpo respeita light/dark via tokens shadcn; o hero usa fundo
 * escuro fixo porque o efeito de partículas do Vortex é uma assinatura
 * visual que só funciona sobre fundo escuro.
 */

import * as React from "react"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Github,
  Linkedin,
  MapPin,
  Mic,
  Ticket,
  Twitter,
  Youtube,
} from "lucide-react"

import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { Button } from "@/components/ui/button"
import { ColourfulText } from "@/components/ui/colourful-text"
import { LogoSlider } from "@/components/ui/logo-slider"
import { StickyBanner } from "@/components/ui/sticky-banner"
import { Timeline } from "@/components/ui/timeline"
import { Vortex } from "@/components/ui/vortex"
import type { AnimatedTooltipItem } from "@/components/ui/animated-tooltip-types"
import type { Testimonial } from "@/components/ui/animated-testimonials-types"
import type { TimelineEntry } from "@/components/ui/timeline-types"

/* -------------------------------------------------------------------------- */
/*                                  Dados                                      */
/* -------------------------------------------------------------------------- */

/** Data-alvo do evento (fixa, no futuro) para alimentar o countdown. */
const EVENT_DATE = new Date("2026-11-12T09:00:00")

const speakers: AnimatedTooltipItem[] = [
  {
    id: 1,
    name: "Ana Ribeiro",
    designation: "Staff Engineer · Vercel",
    image: "https://picsum.photos/seed/conf-ana/200/200",
  },
  {
    id: 2,
    name: "Bruno Tavares",
    designation: "DevRel · Stripe",
    image: "https://picsum.photos/seed/conf-bruno/200/200",
  },
  {
    id: 3,
    name: "Carla Nunes",
    designation: "Head of Design · Figma",
    image: "https://picsum.photos/seed/conf-carla/200/200",
  },
  {
    id: 4,
    name: "Diego Lima",
    designation: "Principal · AWS",
    image: "https://picsum.photos/seed/conf-diego/200/200",
  },
  {
    id: 5,
    name: "Elisa Souza",
    designation: "CTO · Linear",
    image: "https://picsum.photos/seed/conf-elisa/200/200",
  },
  {
    id: 6,
    name: "Felipe Castro",
    designation: "OSS Maintainer · React",
    image: "https://picsum.photos/seed/conf-felipe/200/200",
  },
]

const testimonials: Testimonial[] = [
  {
    quote:
      "A edição passada mudou a forma como nosso time pensa arquitetura de front-end. Saí com ideias que viraram produto em semanas.",
    name: "Mariana Alves",
    designation: "Eng. Líder · Nubank",
    src: "https://picsum.photos/seed/conf-depo-1/500/500",
  },
  {
    quote:
      "Networking de altíssimo nível. Conversei com gente que só via em conferência internacional, tudo num só lugar.",
    name: "Rafael Monteiro",
    designation: "Founder · Devhouse",
    src: "https://picsum.photos/seed/conf-depo-2/500/500",
  },
  {
    quote:
      "Conteúdo denso sem ser cansativo. As trilhas práticas valeram cada minuto — os hands-on foram o ponto alto.",
    name: "Júlia Prado",
    designation: "Staff Designer · iFood",
    src: "https://picsum.photos/seed/conf-depo-3/500/500",
  },
]

const agenda: TimelineEntry[] = [
  {
    title: "Dia 1 — Fundamentos",
    content: (
      <div>
        <p className="mb-4 text-sm font-normal text-muted-foreground md:text-base">
          Abertura, keynote de tendências e trilhas sobre arquitetura moderna de
          front-end, performance e design systems em escala.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-4 text-sm text-muted-foreground md:text-base">
          <li>09h00 — Credenciamento &amp; café</li>
          <li>10h00 — Keynote: o futuro da web</li>
          <li>14h00 — Trilha React: do hook ao servidor</li>
          <li>17h00 — Painel: carreira em engenharia</li>
        </ul>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://picsum.photos/seed/conf-day1a/600/360"
            alt="Palco principal do dia 1"
            className="h-24 w-full rounded-lg object-cover shadow md:h-44"
            draggable={false}
          />
          <img
            src="https://picsum.photos/seed/conf-day1b/600/360"
            alt="Plateia do dia 1"
            className="h-24 w-full rounded-lg object-cover shadow md:h-44"
            draggable={false}
          />
        </div>
      </div>
    ),
  },
  {
    title: "Dia 2 — Mão na massa",
    content: (
      <div>
        <p className="mb-4 text-sm font-normal text-muted-foreground md:text-base">
          Workshops práticos em paralelo: IA aplicada a produtos, acessibilidade
          de verdade e infraestrutura para times pequenos.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-4 text-sm text-muted-foreground md:text-base">
          <li>09h30 — Workshop: copilotos com LLMs</li>
          <li>13h00 — Workshop: a11y na prática</li>
          <li>16h00 — Code review ao vivo</li>
        </ul>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://picsum.photos/seed/conf-day2a/600/360"
            alt="Workshop do dia 2"
            className="h-24 w-full rounded-lg object-cover shadow md:h-44"
            draggable={false}
          />
          <img
            src="https://picsum.photos/seed/conf-day2b/600/360"
            alt="Mentoria do dia 2"
            className="h-24 w-full rounded-lg object-cover shadow md:h-44"
            draggable={false}
          />
        </div>
      </div>
    ),
  },
  {
    title: "Dia 3 — Comunidade",
    content: (
      <div>
        <p className="mb-4 text-sm font-normal text-muted-foreground md:text-base">
          Lightning talks da comunidade, hackathon relâmpago e a festa de
          encerramento com os patrocinadores.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-4 text-sm text-muted-foreground md:text-base">
          <li>10h00 — Lightning talks</li>
          <li>14h00 — Hackathon relâmpago</li>
          <li>20h00 — Festa de encerramento</li>
        </ul>
        <img
          src="https://picsum.photos/seed/conf-day3/1200/360"
          alt="Encerramento do evento"
          className="h-24 w-full rounded-lg object-cover shadow md:h-44"
          draggable={false}
        />
      </div>
    ),
  },
]

type TicketPlan = {
  name: string
  price: string
  tagline: string
  perks: string[]
  featured: boolean
  cta: string
}

const ticketPlans: TicketPlan[] = [
  {
    name: "Básico",
    price: "R$ 290",
    tagline: "Acesso às palestras dos 3 dias.",
    perks: [
      "Todas as keynotes e trilhas",
      "Certificado digital",
      "Acesso às gravações por 30 dias",
    ],
    featured: false,
    cta: "Quero o Básico",
  },
  {
    name: "Pro",
    price: "R$ 590",
    tagline: "Palestras + workshops práticos.",
    perks: [
      "Tudo do Básico",
      "Todos os workshops hands-on",
      "Kit do participante",
      "Almoço incluso nos 3 dias",
    ],
    featured: true,
    cta: "Garantir Pro",
  },
  {
    name: "VIP",
    price: "R$ 1.190",
    tagline: "Experiência completa + networking.",
    perks: [
      "Tudo do Pro",
      "Lounge exclusivo e front row",
      "Jantar com os palestrantes",
      "Mentoria 1:1 de 30 min",
    ],
    featured: false,
    cta: "Ser VIP",
  },
]

/* -------------------------------------------------------------------------- */
/*                                 Countdown                                   */
/* -------------------------------------------------------------------------- */

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function computeTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex min-w-[3.5rem] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-3xl font-bold tabular-nums text-white backdrop-blur-sm sm:min-w-[4.5rem] sm:px-4 sm:py-3 sm:text-4xl">
        <AnimatedNumber value={value} />
      </div>
      <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-widest text-white/60 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

function Countdown() {
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(() =>
    computeTimeLeft(EVENT_DATE),
  )

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft(computeTimeLeft(EVENT_DATE))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex items-end gap-2 sm:gap-4">
      <CountdownUnit value={timeLeft.days} label="Dias" />
      <span className="pb-7 text-2xl font-bold text-white/40 sm:text-3xl">:</span>
      <CountdownUnit value={timeLeft.hours} label="Horas" />
      <span className="pb-7 text-2xl font-bold text-white/40 sm:text-3xl">:</span>
      <CountdownUnit value={timeLeft.minutes} label="Min" />
      <span className="pb-7 text-2xl font-bold text-white/40 sm:text-3xl">:</span>
      <CountdownUnit value={timeLeft.seconds} label="Seg" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Composição                                   */
/* -------------------------------------------------------------------------- */

export function EventConference() {
  const eventDateLabel = "12 a 14 de Novembro, 2026"

  return (
    <div className="flex flex-col">
      {/* ----------------------------------------------------------------- */}
      {/* Sticky banner — early bird                                        */}
      {/* ----------------------------------------------------------------- */}
      <StickyBanner className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-500">
        <p className="mx-0 max-w-[90%] text-center text-sm font-medium text-white drop-shadow">
          🎟️ Early-bird aberto — 40% OFF em todos os ingressos até 31 de agosto.{" "}
          <span className="font-semibold underline underline-offset-2">
            Garanta o seu
          </span>
        </p>
      </StickyBanner>

      {/* ----------------------------------------------------------------- */}
      {/* Hero — Vortex (dark fixo) + ColourfulText + countdown             */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative w-full overflow-hidden bg-black">
        <Vortex
          backgroundColor="#000000"
          baseHue={250}
          particleCount={520}
          rangeY={120}
          containerClassName="min-h-[100vh]"
          className="flex min-h-[100vh] w-full flex-col items-center justify-center px-6 py-24 text-center"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
            <Mic className="h-4 w-4" />
            A maior conferência de tecnologia do país
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            <ColourfulText text="DevConf" /> 2026
          </h1>

          <p className="mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
            Três dias de keynotes, workshops práticos e networking com quem
            constrói o futuro da web. Junte-se a 4.000+ pessoas apaixonadas por
            código.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 text-white/80 sm:flex-row sm:gap-6">
            <span className="inline-flex items-center gap-2 text-sm sm:text-base">
              <CalendarDays className="h-4 w-4" />
              {eventDateLabel}
            </span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="inline-flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4" />
              Expo Center · São Paulo, BR
            </span>
          </div>

          <div className="mt-10">
            <Countdown />
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-white/90"
            >
              <a href="#ingressos">
                <Ticket className="h-4 w-4" />
                Garantir ingresso
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white backdrop-blur hover:bg-white/10 hover:text-white"
            >
              <a href="#agenda">Ver agenda</a>
            </Button>
          </div>
        </Vortex>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Palestrantes — AnimatedTooltip                                    */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Quem sobe ao palco
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Mais de 40 palestrantes de empresas que definem o estado da arte —
              passe o mouse pelos avatares.
            </p>
          </div>
          <div className="mt-12 flex w-full items-center justify-center">
            <AnimatedTooltip items={speakers} />
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            ...e dezenas de outros nomes da comunidade de tecnologia.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Depoimentos — AnimatedTestimonials                                */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-muted/20 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              O que dizem quem já foi
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Histórias reais de edições anteriores.
            </p>
          </div>
          <AnimatedTestimonials testimonials={testimonials} autoplay />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Agenda — Timeline                                                 */}
      {/* ----------------------------------------------------------------- */}
      <section id="agenda" className="border-t bg-background">
        <Timeline
          data={agenda}
          heading="Agenda dos 3 dias"
          description="Role a página para acompanhar a programação completa — a barra à esquerda cresce com o progresso."
        />
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Patrocinadores — LogoSlider                                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Patrocinado pelas marcas que movem a indústria
          </p>
          <LogoSlider
            pauseOnHover
            logos={[
              <Github className="h-8 w-8" />,
              <Twitter className="h-8 w-8" />,
              <Youtube className="h-8 w-8" />,
              <Linkedin className="h-8 w-8" />,
              <Mic className="h-8 w-8" />,
              <Ticket className="h-8 w-8" />,
              <CalendarDays className="h-8 w-8" />,
              <MapPin className="h-8 w-8" />,
            ]}
          />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Ingressos — planos                                                */}
      {/* ----------------------------------------------------------------- */}
      <section id="ingressos" className="border-t bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Garanta seu ingresso
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Preços de early-bird por tempo limitado. Quanto antes, mais barato.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {ticketPlans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.featured
                    ? "relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-lg ring-1 ring-primary/20"
                    : "relative flex flex-col rounded-2xl border border-border bg-card p-8"
                }
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Mais popular
                  </span>
                ) : null}

                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/ passe</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-8 w-full"
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Empresas com 5+ pessoas têm condições especiais — fale com a
            organização.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Mic className="h-5 w-5" />
              <span className="text-lg font-semibold">DevConf 2026</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              A conferência feita por e para a comunidade de tecnologia. Três
              dias para aprender, conectar e se inspirar.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <a
              href="#agenda"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Agenda
            </a>
            <a
              href="#ingressos"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Ingressos
            </a>
            <a
              href="/compositions"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Composições
            </a>
          </nav>
        </div>
        <div className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} DevConf. Construído com React, Vite e
              Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
