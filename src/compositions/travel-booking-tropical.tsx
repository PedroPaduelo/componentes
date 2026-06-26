/**
 * Composição "Passagens Brasil & Mundo — Tropical".
 *
 * Versão alternativa da landing de passagens (irmã da `TravelBooking`),
 * com mais densidade visual mas mantendo uma paleta limpa (azul/cyan).
 *
 * Stack visual:
 *  - Hero com AuroraBackground (gradiente azul/violeta animado) + HeroHighlight
 *    (fundo pontilhado com máscara seguindo o mouse) + TextHoverEffect gigante
 *    "BRASIL".
 *  - FlipWords alternando preços + ContainerTextFlip alternando destinos.
 *  - Vortex dourado nos números.
 *  - ParallaxHeroImages2 dos destinos Nordestinos em 3 colunas scroll-driven.
 *  - WorldMap com rotas saindo do Brasil.
 *  - HoverEffect com pacotes internacionais.
 *  - BentoGrid + GlowingEffect.
 *  - CTA final com CardSpotlight + SparklesCore.
 */

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Globe2,
  Headphones,
  Hotel,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Wallet,
} from "lucide-react"

import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { Badge } from "@/components/ui/badge"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { ContainerTextFlip } from "@/components/ui/container-text-flip"
import { FlipWords } from "@/components/ui/flip-words"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { HeroHighlight, HeroHighlightText } from "@/components/ui/hero-highlight"
import { ParallaxHeroImages2 } from "@/components/ui/parallax-hero-images-2"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SparklesCore } from "@/components/ui/sparkles"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"
import { Vortex } from "@/components/ui/vortex"
import { WorldMap } from "@/components/ui/world-map"
import { useTheme } from "@/components/theme/use-theme"

/* ------------------------------------------------------------------ */
/*  Dados                                                              */
/* ------------------------------------------------------------------ */

type Destination = {
  id: string
  city: string
  state?: string
  country: string
  price: number
  src: string
  coords: { lat: number; lng: number }
}

const NORDESTE_DESTINATIONS: Destination[] = [
  {
    id: "maceio",
    city: "Maceió",
    state: "AL",
    country: "Brasil",
    price: 689,
    src: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -9.6498, lng: -35.7089 },
  },
  {
    id: "noronha",
    city: "Fernando de Noronha",
    state: "PE",
    country: "Brasil",
    price: 1450,
    src: "https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -3.8536, lng: -32.4283 },
  },
  {
    id: "jeri",
    city: "Jericoacoara",
    state: "CE",
    country: "Brasil",
    price: 920,
    src: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -2.7933, lng: -40.5142 },
  },
  {
    id: "porto-de-galinhas",
    city: "Porto de Galinhas",
    state: "PE",
    country: "Brasil",
    price: 780,
    src: "https://images.unsplash.com/photo-1564594985645-4427056e22e2?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -8.5058, lng: -35.0047 },
  },
  {
    id: "maragogi",
    city: "Maragogi",
    state: "AL",
    country: "Brasil",
    price: 850,
    src: "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -9.0124, lng: -35.2225 },
  },
  {
    id: "lencois",
    city: "Lençóis Maranhenses",
    state: "MA",
    country: "Brasil",
    price: 980,
    src: "https://images.unsplash.com/photo-1619546952812-520e98064a52?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -2.6436, lng: -42.7322 },
  },
  {
    id: "praia-antunes",
    city: "Praia dos Antunes",
    state: "AL",
    country: "Brasil",
    price: 940,
    src: "https://images.unsplash.com/photo-1593073206469-0e1d4d8a7c2c?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -9.0683, lng: -35.3175 },
  },
  {
    id: "chapada",
    city: "Chapada Diamantina",
    state: "BA",
    country: "Brasil",
    price: 870,
    src: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -12.6096, lng: -41.4846 },
  },
]

const WORLD_DESTINATIONS: Destination[] = [
  {
    id: "buenos-aires",
    city: "Buenos Aires",
    country: "Argentina",
    price: 1290,
    src: "https://images.unsplash.com/photo-1589909202802-8f4a6ce7036c?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -34.6037, lng: -58.3816 },
  },
  {
    id: "santiago",
    city: "Santiago",
    country: "Chile",
    price: 1780,
    src: "https://images.unsplash.com/photo-1525434280875-1a8b97a05b0a?auto=format&fit=crop&w=900&q=80",
    coords: { lat: -33.4489, lng: -70.6693 },
  },
  {
    id: "punta-cana",
    city: "Punta Cana",
    country: "Rep. Dominicana",
    price: 2890,
    src: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=900&q=80",
    coords: { lat: 18.5601, lng: -68.3725 },
  },
  {
    id: "cancun",
    city: "Cancún",
    country: "México",
    price: 3120,
    src: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=900&q=80",
    coords: { lat: 21.1619, lng: -86.8515 },
  },
  {
    id: "lisboa",
    city: "Lisboa",
    country: "Portugal",
    price: 3450,
    src: "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80",
    coords: { lat: 38.7223, lng: -9.1393 },
  },
  {
    id: "paris",
    city: "Paris",
    country: "França",
    price: 4890,
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
    coords: { lat: 48.8566, lng: 2.3522 },
  },
]

const ORIGIN = { lat: -23.5505, lng: -46.6333 }

const GUEST_OPTIONS = [
  { value: "1", label: "1 adulto" },
  { value: "2", label: "2 adultos" },
  { value: "3", label: "3 adultos" },
  { value: "4", label: "4 adultos" },
  { value: "5", label: "Família (5+)" },
]

const PACKAGE_CARDS = [
  {
    title: "Caribe All-Inclusive",
    description: "7 noites em Punta Cana com tudo incluso, aéreo e transfer",
    link: "#pacote-caribe",
  },
  {
    title: "Europa Clássica",
    description: "10 dias por Lisboa, Madri e Paris com guia em português",
    link: "#pacote-europa",
  },
  {
    title: "América do Sul",
    description: "5 noites em Buenos Aires + Mendoza, roteiro enoturismo",
    link: "#pacote-asul",
  },
  {
    title: "EUA West Coast",
    description: "12 dias por Los Angeles, Las Vegas e San Francisco",
    link: "#pacote-eua",
  },
]

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Reserva protegida",
    description:
      "Cancelamento grátis até 48h antes do embarque em qualquer destino.",
  },
  {
    icon: Wallet,
    title: "Melhor preço",
    description:
      "Garantimos a melhor tarifa para Nordeste e exterior — ou devolvemos a diferença.",
  },
  {
    icon: Headphones,
    title: "Suporte 24/7",
    description:
      "Atendimento humano de Recife, todos os dias, em qualquer fuso horário.",
  },
  {
    icon: Globe2,
    title: "1.200+ destinos",
    description:
      "Voos diretos e conexões para o Nordeste inteiro, Caribe, Europa e Américas.",
  },
]

const TESTIMONIALS = [
  {
    quote:
      "Reservei Noronha em 4 cliques. O resumo da busca deixou tudo claro — preço, voos, hospedagem e até o transfer.",
    name: "Mariana Alves",
    designation: "Viajou para Fernando de Noronha",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
  },
  {
    quote:
      "Jeri no feriado prolongado, voo rápido a partir de SP. O mapa com as rotas ajudou demais.",
    name: "Rafael Costa",
    designation: "Viajou para Jericoacoara",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  },
  {
    quote:
      "Pacote para Punta Cana com tudo incluso saiu 30% mais barato que em qualquer outro site.",
    name: "Júlia Mendes",
    designation: "Viajou para Punta Cana",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=500&q=80",
  },
]

const FLIP_DESTINOS = ["Maceió", "Jeri", "Noronha", "Maragogi"]

const PRICE_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export function TravelBookingTropical() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [tripType, setTripType] = React.useState<string>("passagem")
  const [destination, setDestination] = React.useState<string>("")
  const [guests, setGuests] = React.useState<string>("2")
  const [checkIn, setCheckIn] = React.useState<Date | undefined>()
  const [checkOut, setCheckOut] = React.useState<Date | undefined>()

  const allDestinations = React.useMemo(
    () => [...NORDESTE_DESTINATIONS, ...WORLD_DESTINATIONS],
    []
  )

  const selectedDestination = allDestinations.find((d) => d.id === destination)
  const guestLabel = GUEST_OPTIONS.find((g) => g.value === guests)?.label

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 0

  const mapRoutes = WORLD_DESTINATIONS.map((d) => ({
    start: ORIGIN,
    end: d.coords,
  }))

  const parallaxImages = NORDESTE_DESTINATIONS.slice(0, 8).map((d) => d.src)

  const tripLabel =
    tripType === "passagem"
      ? "Passagem"
      : tripType === "hospedagem"
        ? "Hospedagem"
        : "Pacote completo"

  return (
    <div className="flex flex-col bg-background">
      {/* ============================================================ */}
      {/* HERO — Aurora + HeroHighlight + TextHoverEffect             */}
      {/* ============================================================ */}
      <section className="relative isolate h-[52rem] w-full overflow-hidden">
        <AuroraBackground className="!h-[52rem] !min-h-0">
          <HeroHighlight
            containerClassName="!h-[52rem] !min-h-0"
            className="!h-[52rem]"
          >
            <div className="relative z-20 mx-auto flex h-[52rem] w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
              <Badge
                variant="outline"
                className="mb-6 border-white/25 bg-white/10 text-white backdrop-blur"
              >
                <Sun className="mr-1.5 h-3.5 w-3.5" />
                Voe agora para o Nordeste
              </Badge>

              <div className="relative h-32 w-full max-w-5xl md:h-40">
                <TextHoverEffect text="BRASIL" duration={4} className="!h-full" />
              </div>

              <h2 className="-mt-2 text-3xl font-bold tracking-tight text-neutral-700 sm:text-4xl md:text-5xl dark:text-neutral-200">
                <HeroHighlightText>Nordeste</HeroHighlightText> que você
                sempre sonhou
              </h2>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-base text-neutral-600 sm:text-lg dark:text-neutral-300">
                <span>Pacotes a partir de</span>
                <FlipWords
                  words={["R$ 689", "R$ 780", "R$ 850", "R$ 920", "R$ 1.450"]}
                  duration={2200}
                  className="!text-cyan-600 dark:!text-cyan-300"
                />
                <span>para</span>
                <ContainerTextFlip
                  words={FLIP_DESTINOS}
                  interval={2000}
                  animationDuration={600}
                  className="!min-w-[10ch]"
                  textClassName="!text-cyan-600 dark:!text-cyan-300"
                />
              </div>

              {/* Busca com Tabs shadcn (click garantido) */}
              <div className="mt-10 w-full max-w-3xl rounded-2xl border border-white/15 bg-background/85 p-4 text-left shadow-2xl backdrop-blur-md">
                <Tabs
                  value={tripType}
                  onValueChange={setTripType}
                  className="mb-3 w-fit"
                >
                  <TabsList className="bg-muted">
                    <TabsTrigger value="passagem" className="gap-1.5">
                      <Plane className="h-3.5 w-3.5" />
                      Passagem
                    </TabsTrigger>
                    <TabsTrigger value="hospedagem" className="gap-1.5">
                      <Hotel className="h-3.5 w-3.5" />
                      Hospedagem
                    </TabsTrigger>
                    <TabsTrigger value="pacote" className="gap-1.5">
                      <Compass className="h-3.5 w-3.5" />
                      Pacote completo
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Destino
                    </label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger aria-label="Escolher destino">
                        <SelectValue placeholder="Nordeste ou exterior" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Nordeste
                        </div>
                        {NORDESTE_DESTINATIONS.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.city}, {d.state}
                          </SelectItem>
                        ))}
                        <div className="mt-2 px-2 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Exterior
                        </div>
                        {WORLD_DESTINATIONS.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.city}, {d.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Datas
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-full justify-start text-left font-normal"
                        >
                          <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {checkIn && checkOut
                              ? `${format(checkIn, "dd MMM", { locale: ptBR })} – ${format(
                                  checkOut,
                                  "dd MMM",
                                  { locale: ptBR }
                                )}`
                              : "Ida e volta"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{ from: checkIn, to: checkOut }}
                          onSelect={(range) => {
                            setCheckIn(range?.from)
                            setCheckOut(range?.to)
                          }}
                          numberOfMonths={2}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      Passageiros
                    </label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger aria-label="Número de passageiros">
                        <SelectValue placeholder="Passageiros" />
                      </SelectTrigger>
                      <SelectContent>
                        {GUEST_OPTIONS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button size="lg" className="h-10 w-full md:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
                  {selectedDestination ? (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedDestination.city}
                      {selectedDestination.state &&
                        `, ${selectedDestination.state}`}{" "}
                      · {selectedDestination.country}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">
                      Selecione um destino para ver o resumo da busca.
                    </span>
                  )}
                  {checkIn && checkOut && (
                    <Badge variant="secondary" className="gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {format(checkIn, "dd/MM", { locale: ptBR })} –{" "}
                      {format(checkOut, "dd/MM", { locale: ptBR })}
                      {nights > 0 && ` · ${nights} noite${nights > 1 ? "s" : ""}`}
                    </Badge>
                  )}
                  {guestLabel && (
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {guestLabel}
                    </Badge>
                  )}
                  {selectedDestination && (
                    <span className="ml-auto text-sm font-medium text-foreground">
                      {tripLabel} a partir de{" "}
                      <strong className="text-base text-foreground">
                        {PRICE_FORMATTER.format(selectedDestination.price)}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </HeroHighlight>
        </AuroraBackground>
      </section>

      {/* ============================================================ */}
      {/* ESTATÍSTICAS com Vortex                                      */}
      {/* ============================================================ */}
      <section className="relative isolate h-[28rem] w-full overflow-hidden bg-zinc-950">
        <Vortex
          backgroundColor="transparent"
          rangeY={80}
          particleCount={420}
          baseHue={195}
          baseSpeed={0.2}
          rangeSpeed={1.2}
          baseRadius={1}
          rangeRadius={2}
          containerClassName="absolute inset-0"
          className="absolute inset-0"
        >
          <div className="relative z-20 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
            <Badge
              variant="outline"
              className="mb-5 border-white/20 bg-white/10 text-white backdrop-blur"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Em números
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A operadora que mais entende do Brasil
            </h2>
            <div className="mt-10 grid w-full grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: 1280, suffix: "+", label: "Voos diários" },
                { value: 96, suffix: "%", label: "Cidades cobertas" },
                { value: 49, suffix: "/5", label: "Nota média" },
                { value: 24, suffix: "/7", label: "Suporte humano" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold text-white sm:text-5xl">
                    <AnimatedNumber value={stat.value} />
                    <span className="text-cyan-300">{stat.suffix}</span>
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Vortex>
      </section>

      {/* ============================================================ */}
      {/* PARALLAX — destinos Nordeste                                 */}
      {/* ============================================================ */}
      <section className="relative isolate w-full bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Sun className="mr-1.5 h-3.5 w-3.5" />
              Roteiros selecionados
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Nordestes imperdíveis em camadas
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Role para ver o parallax — Jeri, Noronha, Maragogi e Maceió em
              camadas independentes, como um mapa emocional do Nordeste.
            </p>
          </div>
        </div>

        <div className="relative h-[150vh]">
          <div className="sticky top-12 mx-auto h-[40rem] w-full max-w-6xl overflow-hidden rounded-2xl border border-border px-6">
            <ParallaxHeroImages2 images={parallaxImages} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WORLDMAP — saindo do Brasil pro mundo                       */}
      {/* ============================================================ */}
      <section className="border-y bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Globe2 className="mr-1.5 h-3.5 w-3.5" />
              Conexões globais
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Saindo do Brasil para o mundo
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Voos diretos e conexões para Caribe, Europa, América do Sul e
              América do Norte — a partir de GRU.
            </p>
          </div>
          <div className="mt-10">
            <WorldMap
              dots={mapRoutes}
              lineColor={isDark ? "#22d3ee" : "#0891b2"}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PACOTES INTERNACIONAIS — HoverEffect                        */}
      {/* ============================================================ */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Plane className="mr-1.5 h-3.5 w-3.5" />
              Pacotes internacionais
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tudo pronto, é só fazer a mala
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Pacotes com aéreo, hospedagem, transfer e seguro — montados por
              especialistas em cada destino.
            </p>
          </div>
          <div className="mt-12">
            <HoverEffect items={PACKAGE_CARDS} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BENTO — Por que nós com GlowingEffect                       */}
      {/* ============================================================ */}
      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Diferenciais
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Mais que passagens, uma curadoria
            </h2>
          </div>
          <div className="mt-12">
            <BentoGrid className="max-w-5xl mx-auto">
              {BENEFITS.map((benefit, idx) => (
                <BentoGridItem
                  key={benefit.title}
                  title={benefit.title}
                  description={benefit.description}
                  header={
                    <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-sky-500/10">
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={2}
                      />
                      <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <benefit.icon className="h-6 w-6" />
                      </span>
                    </div>
                  }
                  icon={
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <benefit.icon className="h-4 w-4" />
                    </span>
                  }
                  className={
                    idx === 0
                      ? "md:col-span-2"
                      : idx === BENEFITS.length - 1
                        ? "md:col-span-2"
                        : "md:col-span-1"
                  }
                />
              ))}
            </BentoGrid>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DEPOIMENTOS                                                 */}
      {/* ============================================================ */}
      <section className="border-t bg-background py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Quem viajou recomenda
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Histórias de quem já embarcou
            </h2>
          </div>
          <AnimatedTestimonials testimonials={TESTIMONIALS} autoplay />
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA FINAL com CardSpotlight + Sparkles                      */}
      {/* ============================================================ */}
      <section className="border-t bg-background py-20">
        <div className="mx-auto max-w-4xl px-6">
          <CardSpotlight
            radius={400}
            color={
              isDark ? "rgba(34, 211, 238, 0.25)" : "rgba(8, 145, 178, 0.18)"
            }
            className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-sky-500/10 p-10 text-center sm:p-14"
          >
            <div className="pointer-events-none absolute inset-0">
              <SparklesCore
                id="travel-tropical-cta-sparkles"
                background="transparent"
                minSize={0.4}
                maxSize={1.2}
                speed={1}
                particleColor={isDark ? "#22d3ee" : "#0891b2"}
                particleDensity={60}
                className="h-full w-full"
              />
            </div>

            <div className="relative z-10">
              <Badge
                variant="outline"
                className="mb-5 border-border bg-background/50 backdrop-blur"
              >
                <Plane className="mr-1.5 h-3.5 w-3.5" />
                Pronto pra decolar?
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Sua próxima aventura{" "}
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 bg-clip-text text-transparent">
                  começa agora
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Cadastre seu e-mail e receba ofertas exclusivas para o Nordeste
                e o mundo — antes de todo mundo.
              </p>
              <form
                className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  type="email"
                  required
                  placeholder="seu-melhor@email.com"
                  className="flex h-11 w-full rounded-full border border-input bg-background px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="lg" className="h-11 rounded-full px-6">
                  Quero ofertas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                Cancelamento grátis em qualquer e-mail. Sem spam — prometemos.
              </p>
            </div>
          </CardSpotlight>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Plane className="h-5 w-5" />
              <span className="text-lg font-semibold">Voa Aí — Tropical</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Versão alternativa da composição de venda de passagens — com mais
              densidade visual e foco em turismo no Nordeste e no mundo.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <a
              href="/compositions"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Composições
            </a>
            <a
              href="/components"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Componentes
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
              © {new Date().getFullYear()} Voa Aí — Tropical. Composição demo
              construída com React, Vite, Tailwind CSS e componentes da Vitrine UI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}