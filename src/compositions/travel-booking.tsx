/**
 * Composição "Reserva de Viagem / Booking".
 *
 * Landing de viagens com busca interativa: hero com slideshow de destinos
 * e barra de busca sobreposta (destino, datas, hóspedes), grade de destinos
 * populares com FocusCards, mapa-múndi com rotas, depoimentos animados,
 * faixa de benefícios e footer — tudo montado com componentes da vitrine.
 */

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  Globe2,
  Headphones,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FocusCards } from "@/components/ui/focus-cards"
import { ImagesSlider } from "@/components/ui/images-slider"
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
import { WorldMap } from "@/components/ui/world-map"
import { useTheme } from "@/components/theme/use-theme"

/* ------------------------------------------------------------------ */
/*  Dados estáticos                                                    */
/* ------------------------------------------------------------------ */

const HERO_IMAGES = [
  "https://picsum.photos/seed/travel-hero-1/1920/1080",
  "https://picsum.photos/seed/travel-hero-2/1920/1080",
  "https://picsum.photos/seed/travel-hero-3/1920/1080",
  "https://picsum.photos/seed/travel-hero-4/1920/1080",
]

type Destination = {
  id: string
  city: string
  country: string
  price: number
  src: string
  coords: { lat: number; lng: number }
}

const DESTINATIONS: Destination[] = [
  {
    id: "paris",
    city: "Paris",
    country: "França",
    price: 4890,
    src: "https://picsum.photos/seed/travel-paris/600/800",
    coords: { lat: 48.8566, lng: 2.3522 },
  },
  {
    id: "toquio",
    city: "Tóquio",
    country: "Japão",
    price: 7320,
    src: "https://picsum.photos/seed/travel-tokyo/600/800",
    coords: { lat: 35.6762, lng: 139.6503 },
  },
  {
    id: "nova-york",
    city: "Nova York",
    country: "Estados Unidos",
    price: 3990,
    src: "https://picsum.photos/seed/travel-ny/600/800",
    coords: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: "lisboa",
    city: "Lisboa",
    country: "Portugal",
    price: 3450,
    src: "https://picsum.photos/seed/travel-lisbon/600/800",
    coords: { lat: 38.7223, lng: -9.1393 },
  },
  {
    id: "sydney",
    city: "Sydney",
    country: "Austrália",
    price: 8120,
    src: "https://picsum.photos/seed/travel-sydney/600/800",
    coords: { lat: -33.8688, lng: 151.2093 },
  },
  {
    id: "cidade-do-cabo",
    city: "Cidade do Cabo",
    country: "África do Sul",
    price: 5670,
    src: "https://picsum.photos/seed/travel-capetown/600/800",
    coords: { lat: -33.9249, lng: 18.4241 },
  },
]

/** Origem das rotas no mapa-múndi (São Paulo / GRU). */
const ORIGIN = { lat: -23.5505, lng: -46.6333 }

const GUEST_OPTIONS = [
  { value: "1", label: "1 hóspede" },
  { value: "2", label: "2 hóspedes" },
  { value: "3", label: "3 hóspedes" },
  { value: "4", label: "4 hóspedes" },
  { value: "5", label: "5+ hóspedes" },
]

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Reserva protegida",
    description: "Cancelamento grátis até 48h antes do embarque.",
  },
  {
    icon: Wallet,
    title: "Melhor preço",
    description: "Garantimos a melhor tarifa ou devolvemos a diferença.",
  },
  {
    icon: Headphones,
    title: "Suporte 24/7",
    description: "Atendimento humano em qualquer fuso, todos os dias.",
  },
  {
    icon: Globe2,
    title: "Cobertura global",
    description: "Mais de 1.200 destinos em todos os continentes.",
  },
]

const TESTIMONIALS = [
  {
    quote:
      "Reservei uma semana em Lisboa em poucos minutos. O resumo de busca deixou tudo claro antes de fechar — sem surpresas.",
    name: "Mariana Alves",
    designation: "Viajou para Lisboa",
    src: "https://picsum.photos/seed/travel-person-1/500/500",
  },
  {
    quote:
      "O suporte 24/7 resolveu uma mudança de voo às 3h da manhã. Atendimento impecável e tarifa mantida.",
    name: "Rafael Costa",
    designation: "Viajou para Tóquio",
    src: "https://picsum.photos/seed/travel-person-2/500/500",
  },
  {
    quote:
      "Mapa com as rotas ajudou a escolher a conexão ideal. A melhor experiência de reserva que já tive.",
    name: "Júlia Mendes",
    designation: "Viajou para Sydney",
    src: "https://picsum.photos/seed/travel-person-3/500/500",
  },
]

const PRICE_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export function TravelBooking() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [destination, setDestination] = React.useState<string>("")
  const [guests, setGuests] = React.useState<string>("2")
  const [checkIn, setCheckIn] = React.useState<Date | undefined>()
  const [checkOut, setCheckOut] = React.useState<Date | undefined>()

  const selectedDestination = DESTINATIONS.find((d) => d.id === destination)

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

  const focusCards = DESTINATIONS.map((d) => ({
    title: `${d.city}, ${d.country} · ${PRICE_FORMATTER.format(d.price)}`,
    src: d.src,
  }))

  const mapRoutes = DESTINATIONS.map((d) => ({
    start: ORIGIN,
    end: d.coords,
  }))

  return (
    <div className="flex flex-col bg-background">
      {/* ----------------------------------------------------------- */}
      {/* Hero — slideshow + barra de busca                           */}
      {/* ----------------------------------------------------------- */}
      <section className="relative h-[44rem] w-full overflow-hidden">
        <ImagesSlider images={HERO_IMAGES} overlayClassName="bg-black/55">
          <div className="z-50 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
            <Badge
              variant="outline"
              className="mb-6 border-white/30 bg-white/10 text-white backdrop-blur"
            >
              <Plane className="mr-1.5 h-3.5 w-3.5" />
              Sua próxima viagem começa aqui
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow sm:text-5xl md:text-6xl">
              Descubra o mundo no seu ritmo
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
              Compare destinos, escolha as melhores datas e reserve em minutos —
              com o melhor preço garantido.
            </p>

            {/* Barra de busca */}
            <div className="mt-10 w-full max-w-4xl rounded-2xl border border-white/15 bg-background/95 p-4 text-left shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
                {/* Destino */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Destino
                  </label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger aria-label="Escolher destino">
                      <SelectValue placeholder="Para onde vamos?" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESTINATIONS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.city}, {d.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Datas */}
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

                {/* Hóspedes */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Hóspedes
                  </label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger aria-label="Número de hóspedes">
                      <SelectValue placeholder="Hóspedes" />
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

                {/* Botão buscar */}
                <Button size="lg" className="h-10 w-full md:w-auto">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>

              {/* Resumo de busca reativo */}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
                {selectedDestination ? (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedDestination.city}, {selectedDestination.country}
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
                    A partir de{" "}
                    {PRICE_FORMATTER.format(selectedDestination.price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </ImagesSlider>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Destinos populares — FocusCards                             */}
      {/* ----------------------------------------------------------- */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Destinos populares
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Os lugares mais procurados
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Passe o mouse sobre cada destino para destacá-lo. Preços de ida e
              volta a partir de São Paulo.
            </p>
          </div>
          <div className="mt-12">
            <FocusCards cards={focusCards} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Mapa-múndi — rotas a partir de São Paulo                    */}
      {/* ----------------------------------------------------------- */}
      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Globe2 className="mr-1.5 h-3.5 w-3.5" />
              Conexões globais
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Voe de São Paulo para o mundo
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Rotas diretas e com conexão para os principais destinos de cada
              continente.
            </p>
          </div>
          <div className="mt-10">
            <WorldMap
              dots={mapRoutes}
              lineColor={isDark ? "#818cf8" : "#6366f1"}
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Depoimentos                                                  */}
      {/* ----------------------------------------------------------- */}
      <section className="border-t bg-background py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Quem viajou recomenda
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Histórias de quem já partiu
            </h2>
          </div>
          <AnimatedTestimonials testimonials={TESTIMONIALS} autoplay />
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Faixa de benefícios                                          */}
      {/* ----------------------------------------------------------- */}
      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col items-start gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <benefit.icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Footer                                                       */}
      {/* ----------------------------------------------------------- */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Plane className="h-5 w-5" />
              <span className="text-lg font-semibold">Voa Aí</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Composição de reserva de viagem montada com componentes da vitrine
              React.
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
              © {new Date().getFullYear()} Voa Aí. Construído com React, Vite e
              Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
