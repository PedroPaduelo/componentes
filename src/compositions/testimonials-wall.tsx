/**
 * Composição "Testimonials Wall" — vitrine focada.
 *
 * Um mural de depoimentos enxuto e elegante: o WALL (mosaico de cards) é a
 * estrela. Mostra o potencial dos componentes com hierarquia clara, sem
 * sobrecarga de seções. Construída só com componentes do registry + lucide.
 *
 * Seções:
 *  - Hero (Badge + título com Highlight + prova social compacta).
 *  - Depoimento em destaque (Card grande).
 *  - Mural de depoimentos (masonry de Cards com Avatar + estrelas + quote).
 *  - CTA final.
 *
 * Dados auxiliares (tipos, arrays) ficam em `testimonials-wall-data.ts` para
 * satisfazer o lint `react-refresh/only-export-components`.
 */

import { Quote, Sparkles, Star } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  Highlight,
} from "@/components/ui"

import {
  TESTIMONIALS,
  type Testimonial,
} from "@/compositions/testimonials-wall-data"

/* -------------------------------------------------------------------------- */
/*                                Helpers                                      */
/* -------------------------------------------------------------------------- */

const STAR_VALUES: ReadonlyArray<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5]

function avatarUrl(seed: string): string {
  return `https://picsum.photos/seed/${seed}/64/64`
}

function avatarUrlBig(seed: string): string {
  return `https://picsum.photos/seed/${seed}/160/160`
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** Renderiza 5 estrelas com preenchimento fracionário. */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Avaliação ${rating.toFixed(1)} de 5`}
    >
      {STAR_VALUES.map((star) => {
        const fill = Math.max(0, Math.min(1, rating - (star - 1)))
        return (
          <span
            key={star}
            className="relative inline-flex"
            style={{ width: size, height: size }}
          >
            <Star
              className="absolute inset-0 text-muted-foreground/30"
              style={{ width: size, height: size }}
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-amber-500"
                style={{ width: size, height: size, fill: "currentColor" }}
                aria-hidden="true"
              />
            </span>
          </span>
        )
      })}
    </div>
  )
}

/** Card de depoimento usado no mural (masonry). */
function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className="mb-5 break-inside-avoid">
      <CardContent className="flex flex-col gap-4 p-5">
        <Stars rating={t.rating} />
        <p className="text-sm leading-relaxed text-pretty text-foreground">
          “{t.quote}”
        </p>
        <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-4">
          <Avatar className="size-9">
            <AvatarImage src={avatarUrl(t.avatarSeed)} alt={t.name} />
            <AvatarFallback>{initialsOf(t.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {t.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {t.role} · {t.company}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Componente raiz                                */
/* -------------------------------------------------------------------------- */

export function TestimonialsWall() {
  const featured = TESTIMONIALS.find((t) => t.featured) ?? TESTIMONIALS[0]
  if (!featured) {
    throw new Error("testimonials-wall: TESTIMONIALS vazio")
  }
  const wall = TESTIMONIALS.filter((t) => t.id !== featured.id)
  const avatarsPreview = TESTIMONIALS.slice(0, 5)

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      {/* Fundo: gradiente estático e sutil no topo (sem animação) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-muted/40 to-transparent"
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        {/* ===================== HERO ===================== */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Mural da comunidade
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Amado por times que <Highlight>constroem rápido</Highlight>
          </h1>
          <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
            Veja o que +23 mil profissionais dizem sobre montar interfaces com a
            nossa vitrine de componentes.
          </p>

          {/* Prova social compacta: cluster de avatares + rating */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {avatarsPreview.map((t) => (
                <Avatar
                  key={t.id}
                  className="size-9 border-2 border-background"
                >
                  <AvatarImage src={avatarUrl(t.avatarSeed)} alt={t.name} />
                  <AvatarFallback>{initialsOf(t.name)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="flex flex-col items-start">
              <Stars rating={5} />
              <span className="text-xs text-muted-foreground">
                4,9 de 5 · +2.000 avaliações
              </span>
            </div>
          </div>
        </header>

        {/* ===================== DESTAQUE ===================== */}
        <Card className="mx-auto mt-16 max-w-3xl border-primary/20 shadow-lg ring-1 ring-primary/10">
          <CardContent className="flex flex-col gap-5 p-8">
            <Quote className="size-7 text-primary/40" aria-hidden="true" />
            <p className="text-lg leading-relaxed text-balance text-foreground sm:text-xl">
              “{featured.quote}”
            </p>
            <div className="flex items-center gap-3 border-t border-border/60 pt-5">
              <Avatar className="size-12">
                <AvatarImage
                  src={avatarUrlBig(featured.avatarSeed)}
                  alt={featured.name}
                />
                <AvatarFallback>{initialsOf(featured.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {featured.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {featured.role} · {featured.company} · {featured.city}
                </span>
              </div>
              <div className="ml-auto">
                <Stars rating={featured.rating} size={16} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===================== MURAL (masonry) ===================== */}
        <div className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {wall.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

        {/* ===================== CTA ===================== */}
        <div className="mt-20">
          <div className="overflow-hidden rounded-2xl border bg-muted/30 px-6 py-14 text-center">
            <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
              Pronto para construir algo que vale a pena mostrar?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Entre para a comunidade e compartilhe sua história — ou apenas
              descubra o que a galera está construindo.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg">Quero entrar</Button>
              <Button size="lg" variant="outline">
                Conhecer a comunidade
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
