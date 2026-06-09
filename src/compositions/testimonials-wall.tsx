/**
 * Composição "Testimonials Wall" — mural interativo e denso de depoimentos.
 *
 * Construída apenas com componentes do registry da vitrine + lucide-react.
 * Conteúdo em pt-BR, dados determinísticos (sem `Math.random()`).
 *
 * Seções:
 *  - Hero/header com contadores AnimatedNumber por cargo + rating médio
 *  - Faixa de logos de empresas (LogoSlider)
 *  - Pilha rotativa de depoimentos (CardStack) + galeria (ImagesBadge)
 *  - Distribuição por cargo (barras horizontais)
 *  - Depoimento featured (Card grande, com estrelas, quote, autor)
 *  - Filtros por cargo (chips) + empresa (Select) + busca (Input) + ordenação (Select)
 *  - Mosaico denso de depoimentos (HoverEffect) com ≥12 cards filtráveis
 *  - Calculadora de ROI (2 Sliders + AnimatedNumber) sobre horas economizadas
 *  - CTA final (ScalesContainer) com headline + 2 botões
 *  - Trajetória de exemplo (WorkExperienceComponent) no rodapé
 *
 * Decisões técnicas:
 *  - Dados auxiliares (tipos, arrays, ordenação) ficam em
 *    `testimonials-wall-data.ts` (sem JSX) para satisfazer o lint
 *    `react-refresh/only-export-components`.
 *  - Dimensões dinâmicas (largura % das barras, fração de estrelas) vão via
 *    `style={{ ... }}` inline (Tailwind v4 não aceita classe interpolada de
 *    dimensão).
 *  - Cores de status (amber-500, emerald-500) são classes Tailwind literais.
 *  - O `.tsx` exporta apenas o componente `TestimonialsWall` (named).
 */

import { useMemo, useState } from "react"
import {
  Building2,
  Clock,
  Filter,
  MapPin,
  Quote,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react"

import {
  AnimatedNumber,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardStack,
  DottedGlowBackground,
  Highlight,
  HoverEffect,
  ImagesBadge,
  Input,
  LogoSlider,
  ScalesContainer,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  TooltipCard,
  WorkExperienceComponent,
} from "@/components/ui"
import { cn } from "@/lib/utils"

import {
  BRAND_LOGOS,
  COMPANIES,
  COMMUNITY_IMAGES,
  EXPERIENCES,
  ROLE_FILTERS,
  ROLE_TOTALS,
  SORT_OPTIONS,
  STACK_ITEMS_RAW,
  TESTIMONIALS,
  type SortOption,
  type Testimonial,
  type TestimonialRole,
} from "@/compositions/testimonials-wall-data"

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
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

/** Cabeçalho de seção padronizado. */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  )
}

/** Renderiza 5 estrelas com preenchimento fracionário. */
function Stars({
  rating,
  size = 14,
}: {
  rating: number
  size?: number
}) {
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

/** Conteúdo JSX para o CardStack: split em [body, Highlight(body), body]. */
function stackContentFor(item: (typeof STACK_ITEMS_RAW)[number]) {
  const [before, after] = item.body.split(item.highlight)
  return (
    <p>
      {before}
      <Highlight>{item.highlight}</Highlight>
      {after ?? ""}
    </p>
  )
}

/** Distribuição por cargo: contagem e fração, computadas a partir de TESTIMONIALS. */
function useRoleDistribution(): {
  byRole: { role: TestimonialRole; count: number; pct: number }[]
  total: number
} {
  return useMemo(() => {
    const total = TESTIMONIALS.length
    const counts: Record<TestimonialRole, number> = {
      Engenharia: 0,
      Design: 0,
      Produto: 0,
      Founder: 0,
    }
    for (const t of TESTIMONIALS) counts[t.role] += 1
    const byRole = (Object.keys(counts) as TestimonialRole[])
      .map((role) => ({
        role,
        count: counts[role],
        pct: total > 0 ? (counts[role] / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
    return { byRole, total }
  }, [])
}

/** Média de rating por cargo (1 casa decimal). */
function useAverageRatingByRole(): Record<TestimonialRole, number> {
  return useMemo(() => {
    const sums: Record<TestimonialRole, { sum: number; count: number }> = {
      Engenharia: { sum: 0, count: 0 },
      Design: { sum: 0, count: 0 },
      Produto: { sum: 0, count: 0 },
      Founder: { sum: 0, count: 0 },
    }
    for (const t of TESTIMONIALS) {
      sums[t.role].sum += t.rating
      sums[t.role].count += 1
    }
    return (Object.keys(sums) as TestimonialRole[]).reduce(
      (acc, role) => {
        const { sum, count } = sums[role]
        acc[role] = count > 0 ? sum / count : 0
        return acc
      },
      {} as Record<TestimonialRole, number>,
    )
  }, [])
}

/** Aplica filtro + busca + ordenação sobre TESTIMONIALS. */
function useFilteredTestimonials(
  role: "all" | TestimonialRole,
  company: "all" | string,
  query: string,
  sort: SortOption,
): Testimonial[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = TESTIMONIALS.filter((t) => {
      if (role !== "all" && t.role !== role) return false
      if (company !== "all" && t.company !== company) return false
      if (normalizedQuery.length > 0) {
        const haystack = `${t.name} ${t.handle} ${t.company} ${t.quote} ${t.city}`.toLowerCase()
        if (!haystack.includes(normalizedQuery)) return false
      }
      return true
    })
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "recent":
          return b.dateISO.localeCompare(a.dateISO)
        case "az":
          return a.name.localeCompare(b.name, "pt-BR")
        case "rating":
          return b.rating - a.rating || b.dateISO.localeCompare(a.dateISO)
        case "useful":
        default:
          return (
            b.rating - a.rating ||
            b.dateISO.localeCompare(a.dateISO) ||
            a.name.localeCompare(b.name, "pt-BR")
          )
      }
    })
    return sorted
  }, [role, company, query, sort])
}

/* -------------------------------------------------------------------------- */
/*                              Componente raiz                                */
/* -------------------------------------------------------------------------- */

export function TestimonialsWall() {
  /* -------- estado interativo (filtros, busca, calculadora) -------- */
  const [role, setRole] = useState<"all" | TestimonialRole>("all")
  const [company, setCompany] = useState<"all" | string>("all")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortOption>("useful")
  const [hoursPerWeek, setHoursPerWeek] = useState(6)
  const [hourValue, setHourValue] = useState(120)

  /* -------- dados derivados -------- */
  const featured = TESTIMONIALS.find((t) => t.featured) ?? TESTIMONIALS[0]
  if (!featured) {
    throw new Error("testimonials-wall: TESTIMONIALS vazio")
  }
  const distribution = useRoleDistribution()
  const avgByRole = useAverageRatingByRole()
  const filtered = useFilteredTestimonials(role, company, query, sort)
  const totalCount = TESTIMONIALS.length

  const calc = useMemo(() => {
    const hoursPerMonth = hoursPerWeek * 4
    const hoursPerYear = hoursPerMonth * 12
    const savingsPerYear = hoursPerYear * hourValue
    return { hoursPerMonth, hoursPerYear, savingsPerYear }
  }, [hoursPerWeek, hourValue])

  const brandLogoNodes = BRAND_LOGOS.map((logo) => (
    <span
      key={logo.name}
      className="text-lg font-semibold tracking-tight text-muted-foreground"
    >
      {logo.name}
    </span>
  ))

  const hasActiveFilter =
    role !== "all" || company !== "all" || query.trim().length > 0

  function clearFilters(): void {
    setRole("all")
    setCompany("all")
    setQuery("")
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      {/* Background sutil (atrás de toda a composição, não intercepta cliques) */}
      <DottedGlowBackground
        gap={20}
        radius={2}
        opacity={0.45}
        backgroundOpacity={0.15}
        colorLightVar="--color-neutral-500"
        colorDarkVar="--color-neutral-400"
        glowColorLightVar="--color-violet-500"
        glowColorDarkVar="--color-violet-400"
        className="pointer-events-none"
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ============================================================ */}
        {/* HERO + SOCIAL PROOF (contadores animados + rating médio)     */}
        {/* ============================================================ */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Mural da comunidade
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Amado por times que <Highlight>constroem rápido</Highlight>
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Veja o que{" "}
            <span className="font-semibold text-foreground">
              +23 mil profissionais
            </span>{" "}
            dizem sobre montar interfaces com a nossa vitrine de componentes.
          </p>
        </header>

        {/* Contadores animados + rating médio por cargo */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(ROLE_TOTALS) as TestimonialRole[]).map((r) => {
            const total = ROLE_TOTALS[r]
            const avg = avgByRole[r]
            return (
              <div
                key={r}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/60 p-5 text-center backdrop-blur-sm"
              >
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {r}
                </span>
                <span className="inline-flex items-baseline gap-1 text-3xl font-bold text-foreground">
                  +
                  <AnimatedNumber value={Math.round(total / 100) / 10} />
                  <span className="text-base font-semibold text-muted-foreground">
                    k
                  </span>
                </span>
                <Stars rating={avg} />
                <span className="text-xs text-muted-foreground">
                  {avg.toFixed(1)} de média entre{" "}
                  {total.toLocaleString("pt-BR")} profissionais
                </span>
              </div>
            )
          })}
        </div>

        {/* ============================================================ */}
        {/* FAIXA DE LOGOS (prova social institucional)                  */}
        {/* ============================================================ */}
        <div className="mt-14">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Times de todos os tamanhos confiam no catálogo
          </p>
          <div className="mt-5">
            <LogoSlider logos={brandLogoNodes} speed={32} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* TOPO: pilha rotativa + galeria + destaque do autor           */}
        {/* ============================================================ */}
        <div className="mt-14 flex flex-col items-center justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex h-72 w-full items-center justify-center lg:w-auto lg:flex-1">
            <CardStack
              items={STACK_ITEMS_RAW.map((item) => ({
                id: item.id,
                name: item.name,
                designation: item.designation,
                content: stackContentFor(item),
              }))}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-6 lg:w-auto lg:flex-1">
            <div className="flex items-center justify-center">
              <div className="flex -space-x-3">
                {TESTIMONIALS.slice(0, 5).map((t) => (
                  <TooltipCard
                    key={t.id}
                    content={
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage
                            src={avatarUrl(t.avatarSeed)}
                            alt={t.name}
                          />
                          <AvatarFallback>{initialsOf(t.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-popover-foreground">
                            {t.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t.role} · {t.company}
                          </span>
                        </div>
                      </div>
                    }
                  >
                    <Avatar className="size-12 cursor-pointer border-2 border-background ring-1 ring-border transition-transform hover:z-10 hover:-translate-y-1">
                      <AvatarImage
                        src={avatarUrl(t.avatarSeed)}
                        alt={t.name}
                      />
                      <AvatarFallback>{initialsOf(t.name)}</AvatarFallback>
                    </Avatar>
                  </TooltipCard>
                ))}
              </div>
            </div>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Junte-se a{" "}
              <span className="font-medium text-foreground">
                centenas de times
              </span>{" "}
              que já compartilharam suas histórias na nossa comunidade.
            </p>

            <ImagesBadge
              text="Comunidade"
              images={COMMUNITY_IMAGES}
              folderSize={{ width: 44, height: 33 }}
              teaserImageSize={{ width: 36, height: 26 }}
              hoverImageSize={{ width: 120, height: 92 }}
              hoverTranslateY={-100}
              hoverSpread={44}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* DISTRIBUIÇÃO POR CARGO (barras horizontais empilhadas)      */}
        {/* ============================================================ */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="Quem fala"
            title="Distribuição por cargo"
            subtitle="Quem mais aparece no mural, com a média de avaliação por cargo."
          />
          <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
            <div className="flex flex-col gap-4">
              {distribution.byRole.map((row) => {
                const avg = avgByRole[row.role]
                return (
                  <div key={row.role} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {row.role}
                      </span>
                      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Stars rating={avg} size={12} />
                        <span>
                          {row.count} de {distribution.total} ·{" "}
                          {row.pct.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Base: {totalCount} depoimentos curados em pt-BR · Conteúdo
              determinístico, sem `Math.random`.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FEATURED — depoimento em destaque (card grande)              */}
        {/* ============================================================ */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="Em destaque"
            title="O depoimento da semana"
            subtitle={`Indicado pela curadoria por ${featured.rating}/5 estrelas e impacto na comunidade.`}
          />
          <Card className="mx-auto mt-8 max-w-4xl border-primary/30 bg-gradient-to-br from-card to-card/60 shadow-lg ring-1 ring-primary/20 backdrop-blur-sm">
            <CardContent className="grid gap-6 py-8 md:grid-cols-[auto_1fr] md:items-start">
              <div className="flex flex-col items-center gap-3 md:items-start">
                <Avatar className="size-20 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                  <AvatarImage
                    src={avatarUrlBig(featured.avatarSeed)}
                    alt={featured.name}
                  />
                  <AvatarFallback className="text-lg">
                    {initialsOf(featured.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-1 md:items-start">
                  <Stars rating={featured.rating} size={16} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(featured.dateISO).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Quote
                  className="size-6 text-primary/50"
                  aria-hidden="true"
                />
                <p className="text-lg leading-relaxed text-foreground sm:text-xl">
                  “{featured.quote}”
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-4 text-sm">
                  <span className="font-semibold text-foreground">
                    {featured.name}
                  </span>
                  <span className="text-muted-foreground">{featured.role}</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Building2 className="size-3.5" aria-hidden="true" />
                    {featured.company}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {featured.city}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* FILTROS + BUSCA + ORDENAÇÃO + GRID DENSO                     */}
        {/* ============================================================ */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Explore"
            title="Mais histórias da comunidade"
            subtitle="Filtre por cargo, empresa ou busque por um trecho. Tudo ao vivo."
          />

          <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-4">
            {/* Chips de cargo */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                <Filter className="size-3.5" aria-hidden="true" />
                Cargo
              </span>
              {ROLE_FILTERS.map((f) => {
                const active = role === f.value
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setRole(f.value)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card/60 text-foreground hover:border-primary/40 hover:bg-card",
                    )}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>

            {/* Linha com busca + select de empresa + select de ordenação */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome, empresa ou trecho do depoimento…"
                  aria-label="Buscar depoimento"
                  className="pl-9 pr-9"
                />
                {query.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <XCircle className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <Select value={company} onValueChange={(v) => setCompany(v)}>
                <SelectTrigger className="min-w-[180px]">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {COMPANIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortOption)}
              >
                <SelectTrigger className="min-w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resumo + botão de limpar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Exibindo{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>{" "}
                de {totalCount} depoimentos
                {hasActiveFilter ? " (filtro ativo)" : ""}
              </span>
              {hasActiveFilter ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1.5"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Limpar filtros
                </Button>
              ) : null}
            </div>
          </div>

          {/* Mosaico denso (HoverEffect) */}
          <div className="mt-6">
            {filtered.length === 0 ? (
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-12 text-center">
                <Search
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  Nenhum depoimento combina com os filtros atuais.
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <HoverEffect
                items={filtered.map((t) => ({
                  title: t.name,
                  description: `“${t.quote}” — ${t.role}, ${t.company}`,
                  link: `https://example.com/${t.id}`,
                }))}
              />
            )}
          </div>

          {/* Painel "top do filtro" — sempre mostra o topo do set atual */}
          {filtered.length > 0 ? (
            <div className="mx-auto mt-6 max-w-5xl rounded-xl border border-border/60 bg-card/40 px-5 py-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Top do filtro:</span>{" "}
              {filtered[0]?.name} · {filtered[0]?.company} · ★{" "}
              {filtered[0]?.rating.toFixed(1)}
            </div>
          ) : null}
        </div>

        {/* ============================================================ */}
        {/* CALCULADORA DE ROI DA COMUNIDADE                            */}
        {/* ============================================================ */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="ROI real"
            title="Quanto você economiza por mês?"
            subtitle="Estime o retorno da sua hora usando a vitrine. Base: +12.400 depoimentos verificáveis."
          />
          <Card className="mx-auto mt-8 max-w-4xl bg-card/80 backdrop-blur-sm">
            <CardContent className="grid gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Clock className="size-4 text-primary" aria-hidden="true" />
                      Horas economizadas por semana
                    </span>
                    <span className="font-semibold text-foreground">
                      {hoursPerWeek}h
                    </span>
                  </div>
                  <Slider
                    value={[hoursPerWeek]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(v) => setHoursPerWeek(v[0] ?? 1)}
                    aria-label="Horas economizadas por semana"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1h</span>
                    <span>20h</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <TrendingUp
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Valor da sua hora
                    </span>
                    <span className="font-semibold text-foreground">
                      R$ {hourValue}
                    </span>
                  </div>
                  <Slider
                    value={[hourValue]}
                    min={30}
                    max={400}
                    step={10}
                    onValueChange={(v) => setHourValue(v[0] ?? 30)}
                    aria-label="Valor da sua hora em reais"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ 30</span>
                    <span>R$ 400</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Baseado em +12.400 depoimentos verificáveis da comunidade
                  brasileira.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/40 p-6 text-center">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Economia estimada
                </span>
                <div className="inline-flex items-baseline justify-center gap-1 text-4xl font-bold text-foreground">
                  <span className="text-xl">R$</span>
                  <AnimatedNumber value={Math.round(calc.savingsPerYear / 1000)} />
                  <span className="text-xl">k</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  por ano (estimativa)
                </span>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Por mês</p>
                    <p className="mt-1 inline-flex items-baseline gap-0.5 text-base font-semibold text-foreground">
                      <AnimatedNumber value={calc.hoursPerMonth} />
                      <span className="text-xs font-normal text-muted-foreground">
                        h
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Por ano</p>
                    <p className="mt-1 inline-flex items-baseline gap-0.5 text-base font-semibold text-foreground">
                      <AnimatedNumber value={calc.hoursPerYear} />
                      <span className="text-xs font-normal text-muted-foreground">
                        h
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* CTA FINAL — ScalesContainer envolvendo Card com 2 botões    */}
        {/* ============================================================ */}
        <div className="mt-20">
          <ScalesContainer
            orientation="diagonal"
            size={14}
            containerClassName="overflow-hidden rounded-2xl border border-border/60 bg-card/60"
          >
            <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
              <Badge variant="secondary" className="gap-1">
                <Users className="size-3.5" aria-hidden="true" />
                Visto por +50 mil devs todos os meses
              </Badge>
              <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Pronto para construir algo que vale a pena mostrar?
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Entre para a comunidade e compartilhe sua história — ou apenas
                descubra o que a galera está construindo.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg">Quero entrar</Button>
                <Button size="lg" variant="outline">
                  Conhecer a comunidade
                </Button>
              </div>
            </div>
          </ScalesContainer>
        </div>

        {/* ============================================================ */}
        {/* TRAJETÓRIA (preservado do original)                          */}
        {/* ============================================================ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <SectionHeading
            eyebrow="Trajetória"
            title="A jornada de quem usa a vitrine"
            subtitle="A experiência de um dos nossos usuários mais ativos ao longo dos anos."
          />
          <div className="mt-8">
            <WorkExperienceComponent
              experiences={EXPERIENCES}
              variant="timeline"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
