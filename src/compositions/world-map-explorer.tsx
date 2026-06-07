/**
 * Composição "World Map Explorer".
 *
 * Explorador mundial com mapa interativo, seções parallax, linha do tempo,
 * globo 3D de contribuições e chamada para ação — tudo montado com
 * componentes do registry da vitrine.
 */

import { ArrowRight, Globe, MapPin, Rocket, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GitHubGlobe } from "@/components/ui/github-globe"
import { ParallaxScroll } from "@/components/ui/parallax-scroll"
import { Timeline } from "@/components/ui/timeline"
import { WorldMap } from "@/components/ui/world-map"
import { useTheme } from "@/components/theme/use-theme"

/* ------------------------------------------------------------------ */
/*  Dados estáticos                                                   */
/* ------------------------------------------------------------------ */

const CONNECTIONS = [
  { start: { lat: 40.7128, lng: -74.006 }, end: { lat: 51.5074, lng: -0.1278 } },
  { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 35.6762, lng: 139.6503 } },
  { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: -23.5505, lng: -46.6333 } },
  { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: 1.3521, lng: 103.8198 } },
  { start: { lat: 1.3521, lng: 103.8198 }, end: { lat: -33.8688, lng: 151.2093 } },
  { start: { lat: -33.8688, lng: 151.2093 }, end: { lat: 40.7128, lng: -74.006 } },
  { start: { lat: 40.7128, lng: -74.006 }, end: { lat: 48.8566, lng: 2.3522 } },
  { start: { lat: 48.8566, lng: 2.3522 }, end: { lat: 52.52, lng: 13.405 } },
]

const PARALLAX_EXPLORE = [
  "https://picsum.photos/seed/wme-explore-1/600/400",
  "https://picsum.photos/seed/wme-explore-2/600/400",
  "https://picsum.photos/seed/wme-explore-3/600/400",
  "https://picsum.photos/seed/wme-explore-4/600/400",
  "https://picsum.photos/seed/wme-explore-5/600/400",
  "https://picsum.photos/seed/wme-explore-6/600/400",
  "https://picsum.photos/seed/wme-explore-7/600/400",
  "https://picsum.photos/seed/wme-explore-8/600/400",
  "https://picsum.photos/seed/wme-explore-9/600/400",
]

const PARALLAX_CONNECT = [
  "https://picsum.photos/seed/wme-connect-1/600/400",
  "https://picsum.photos/seed/wme-connect-2/600/400",
  "https://picsum.photos/seed/wme-connect-3/600/400",
  "https://picsum.photos/seed/wme-connect-4/600/400",
  "https://picsum.photos/seed/wme-connect-5/600/400",
  "https://picsum.photos/seed/wme-connect-6/600/400",
  "https://picsum.photos/seed/wme-connect-7/600/400",
  "https://picsum.photos/seed/wme-connect-8/600/400",
  "https://picsum.photos/seed/wme-connect-9/600/400",
]

const PARALLAX_GROW = [
  "https://picsum.photos/seed/wme-grow-1/600/400",
  "https://picsum.photos/seed/wme-grow-2/600/400",
  "https://picsum.photos/seed/wme-grow-3/600/400",
  "https://picsum.photos/seed/wme-grow-4/600/400",
  "https://picsum.photos/seed/wme-grow-5/600/400",
  "https://picsum.photos/seed/wme-grow-6/600/400",
  "https://picsum.photos/seed/wme-grow-7/600/400",
  "https://picsum.photos/seed/wme-grow-8/600/400",
  "https://picsum.photos/seed/wme-grow-9/600/400",
]

const TIMELINE_DATA = [
  {
    title: "2020",
    content: (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          Tudo começou com uma ideia: criar uma vitrine de componentes React
          que fosse bonita, acessível e fácil de usar.
        </p>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-foreground">
            Primeiro commit no repositório. O projeto nasceu com 3 componentes
            shadcn e um sonho grande.
          </p>
        </Card>
      </div>
    ),
  },
  {
    title: "2021",
    content: (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          A comunidade cresceu. Contribuidores de todo o mundo começaram a
          enviar componentes e sugestões.
        </p>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-foreground">
            50+ componentes integrados. Tema dark/light funcional. Documentação
            viva com exemplos interativos.
          </p>
        </Card>
      </div>
    ),
  },
  {
    title: "2022",
    content: (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          Parcerias com bibliotecas externas. Adaptadores para @pierre/trees,
          efeitos Aceternity e muito mais.
        </p>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-foreground">
            100+ componentes. Suporte a composições completas. Build zero-dívida
            com TypeScript estrito.
          </p>
        </Card>
      </div>
    ),
  },
  {
    title: "2023",
    content: (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          A vitrine se tornou referência. Times de produto passaram a usar os
          componentes em produção.
        </p>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-foreground">
            200+ componentes. Layout de documentação estilo shadcn docs. Validação
            visual automatizada com Playwright.
          </p>
        </Card>
      </div>
    ),
  },
  {
    title: "2024",
    content: (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          O futuro é global. Componentes que conectam pessoas, ideias e
          tecnologias em todo o planeta.
        </p>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-foreground">
            Mapas interativos, globos 3D e composições imersivas. A vitrine
            agora é um explorador mundial.
          </p>
        </Card>
      </div>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Componente                                                        */
/* ------------------------------------------------------------------ */

export function WorldMapExplorer() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex flex-col">
      {/* ----------------------------------------------------------- */}
      {/* Hero — WorldMap fullscreen com conexões animadas            */}
      {/* ----------------------------------------------------------- */}
      <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <WorldMap
            dots={CONNECTIONS}
            lineColor={isDark ? "#818cf8" : "#6366f1"}
            className="h-full w-full rounded-none border-0"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <Badge
            variant="outline"
            className="mb-6 border-border bg-background/60 backdrop-blur"
          >
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            Explorador Mundial
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Explore o mundo através de{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              componentes
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Uma jornada interativa por mapas, linhas do tempo e globos 3D —
            tudo construído com os blocos da nossa vitrine de componentes React.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <a href="#explore">
                Começar exploração
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border bg-background/60 backdrop-blur"
            >
              <a href="#timeline">Ver jornada</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Parallax Sections                                           */}
      {/* ----------------------------------------------------------- */}
      <section id="explore" className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <MapPin className="mr-1.5 h-3.5 w-3.5" />
              Parallax
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Explore o mundo
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Role para descobrir imagens em movimento com efeito parallax em 3
              colunas.
            </p>
          </div>
          <div className="mt-10">
            <ParallaxScroll images={PARALLAX_EXPLORE} />
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Conecte-se
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Conecte-se
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Componentes que unem pessoas e ideias através de fronteiras.
            </p>
          </div>
          <div className="mt-10">
            <ParallaxScroll images={PARALLAX_CONNECT} />
          </div>
        </div>
      </section>

      <section className="border-t bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-border">
              <Rocket className="mr-1.5 h-3.5 w-3.5" />
              Cresça
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Cresça
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              De componentes individuais a composições completas — escale sem
              limites.
            </p>
          </div>
          <div className="mt-10">
            <ParallaxScroll images={PARALLAX_GROW} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Timeline                                                     */}
      {/* ----------------------------------------------------------- */}
      <section id="timeline" className="border-t bg-background py-20">
        <Timeline
          data={TIMELINE_DATA}
          heading="Nossa jornada"
          description="De 2020 a 2024: os marcos que transformaram uma ideia em um explorador mundial de componentes."
        />
      </section>

      {/* ----------------------------------------------------------- */}
      {/* GitHub Globe                                                 */}
      {/* ----------------------------------------------------------- */}
      <section className="border-t bg-black py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-white/20 text-white"
            >
              <Globe className="mr-1.5 h-3.5 w-3.5" />
              Contribuições globais
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Contribuições ao redor do mundo
            </h2>
            <p className="mt-4 text-base text-white/60">
              Nosso globo 3D mostra arcos de contribuição conectando
              desenvolvedores em todos os continentes.
            </p>
          </div>
          <div className="mt-10">
            <GitHubGlobe />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* CTA                                                          */}
      {/* ----------------------------------------------------------- */}
      <section className="border-t bg-background py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pronto para explorar?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Navegue pelo catálogo de componentes, veja as composições ou mergulhe
            no código de cada peça.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <a href="/components">
                Ver componentes
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border"
            >
              <a href="/compositions">Ver composições</a>
            </Button>
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
              <Globe className="h-5 w-5" />
              <span className="text-lg font-semibold">World Map Explorer</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Composição de showcase montada com componentes da vitrine React.
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
