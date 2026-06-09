/**
 * Backgrounds Showcase — galeria curada dos 11 fundos animados do registry.
 *
 * Redesign: em vez de uma pilha vertical de cartões idênticos, a página abre
 * com um HERO imersivo (Vortex como protagonista) e organiza os fundos restantes
 * em SEÇÕES temáticas (partículas, linhas & feixes, malhas & grids, interativos)
 * num layout bento com ritmo (peças full-width destacadas + grid de 2 colunas).
 *
 * Tema light/dark:
 * - Cada fundo vive dentro de um cartão com "chrome" tokenizado (header com
 *   `bg-card`/`text-foreground`/`border-border`) — o rótulo é SEMPRE legível nos
 *   dois temas, sem texto branco solto sobre fundo claro.
 * - Fundos intrinsecamente escuros (Sparkles, Boxes, Background Beams, Vortex)
 *   ficam numa "janela" deliberadamente escura (`tone="dark"`) com ring/glow
 *   sutil e um chip "always-on dark" (ícone de lua) — vira decisão de design
 *   intencional, não um quadrado preto quebrado.
 * - Fundos adaptáveis (Background Lines, Beams With Collision, Dot Grid,
 *   Ripple, Perspective Grid, SVG Mask) respondem ao tema com bom contraste; o
 *   Dot Grid e o Ripple recebem override local de `--muted-foreground`/`--border`
 *   no light para reforçar a visibilidade.
 */

import * as React from "react"
import { motion } from "motion/react"
import {
  Boxes as BoxesIcon,
  Grid2x2,
  Layers,
  Moon,
  MousePointerClick,
  Sparkles as SparklesIcon,
  Waves,
} from "lucide-react"

import {
  BackgroundBeams,
  BackgroundBeamsWithCollision,
  BackgroundLines,
  BackgroundRippleEffect,
  Boxes,
  DotGridSpotlight,
  LightLines,
  MaskContainer,
  PerspectiveGrid,
  SparklesCore,
  Vortex,
} from "@/components/ui"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme/use-theme"

/** Tom de preto unificado das janelas sempre-escuras (e do canvas do Vortex). */
const DARK_BG = "#0a0a0a"

/* -------------------------------------------------------------------------- */
/*                              cartão de fundo                               */
/* -------------------------------------------------------------------------- */

type Tone = "dark" | "adaptive" | "brand"

type BgCardProps = {
  index: number
  title: string
  subtitle: string
  /** Define a moldura da "janela" e o chip de tema. */
  tone: Tone
  /** Altura da janela do fundo. @default "h-[360px]" */
  heightClassName?: string
  /** Classe extra no `<article>` (ex.: `sm:col-span-2` para destaque). */
  className?: string
  /** Classe/estilo extra aplicado direto na janela do fundo. */
  windowClassName?: string
  windowStyle?: React.CSSProperties
  children: React.ReactNode
}

const TONE_META: Record<
  Tone,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  dark: { icon: Moon, label: "always-on dark" },
  adaptive: { icon: Layers, label: "adapta ao tema" },
  brand: { icon: SparklesIcon, label: "cor de marca" },
}

/**
 * Cartão padrão: header "chrome" tokenizado (sempre legível) + janela do fundo.
 * A janela de `tone="dark"` recebe fundo escuro fixo, ring interno e glow sutil
 * — assim os fundos que exigem escuro parecem intencionais no tema light.
 */
function BgCard({
  index,
  title,
  subtitle,
  tone,
  heightClassName = "h-[360px]",
  className,
  windowClassName,
  windowStyle,
  children,
}: BgCardProps) {
  const meta = TONE_META[tone]
  const ChipIcon = meta.icon
  const isDark = tone === "dark"

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {title}
            </h3>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <ChipIcon className="size-3.5" />
          <span className="hidden sm:inline">{meta.label}</span>
        </span>
      </header>

      <div
        className={cn(
          "relative mx-3 mb-3 overflow-hidden rounded-xl",
          isDark
            ? "border border-white/10 ring-1 ring-inset ring-white/5"
            : "border border-border bg-background",
          heightClassName,
          windowClassName,
        )}
        style={isDark ? { backgroundColor: DARK_BG, ...windowStyle } : windowStyle}
      >
        {children}
        {isDark && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 rounded-xl"
            style={{
              boxShadow: "inset 0 1px 24px rgba(255,255,255,0.04)",
            }}
          />
        )}
      </div>
    </article>
  )
}

/** Texto central sobreposto a um fundo. */
function CenterLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 text-center">
      <span
        className={cn(
          "text-2xl font-bold tracking-tight sm:text-4xl",
          className,
        )}
      >
        {children}
      </span>
    </div>
  )
}

/** Cabeçalho de seção com tokens (light/dark nativo). */
function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {eyebrow}
      </span>
      <h2 className="text-pretty text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  showcase                                  */
/* -------------------------------------------------------------------------- */

export function BackgroundsShowcase() {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === "light"

  // No light o ripple usa `var(--border)` (quase invisível) e o dot-grid usa
  // `var(--muted-foreground)`. Sobrescrevemos localmente para reforçar contraste
  // sem tocar nos componentes compartilhados.
  const lightContrastVars = isLight
    ? ({
        "--border": "oklch(0.74 0 0)",
        "--muted-foreground": "oklch(0.42 0 0)",
      } as React.CSSProperties)
    : undefined

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      {/* ================================================================== */}
      {/* HERO — Vortex como protagonista                                    */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-border shadow-xl ring-1 ring-inset ring-white/5">
        <div
          className="relative min-h-[68vh] w-full"
          style={{ backgroundColor: DARK_BG }}
        >
          <Vortex
            backgroundColor={DARK_BG}
            particleCount={650}
            baseHue={225}
            rangeY={140}
            className="flex h-full min-h-[68vh] w-full flex-col items-center justify-center px-6 py-16 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto flex max-w-3xl flex-col items-center"
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                <SparklesIcon className="size-3.5" />
                Galeria de fundos animados
              </span>

              <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Backgrounds que dão vida à interface
              </h1>

              <p className="mt-5 max-w-xl text-pretty text-base text-white/70 sm:text-lg">
                Onze fundos animados — partículas em canvas, feixes, malhas 3D e
                superfícies interativas — todos componentes reais do registry,
                com tema light/dark nativo.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#particulas"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.03]"
                >
                  Explorar fundos
                </a>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/70 backdrop-blur">
                  <Moon className="size-3.5" />
                  fundo: Vortex · always-on dark
                </span>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-center backdrop-blur">
                {[
                  { value: "11", label: "fundos animados" },
                  { value: "canvas + svg", label: "tecnologias" },
                  { value: "interativos", label: "seguem o cursor" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-black/20 px-5 py-4">
                    <dt className="text-lg font-bold text-white sm:text-xl">
                      {stat.value}
                    </dt>
                    <dd className="mt-0.5 text-[11px] uppercase tracking-wide text-white/55">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </Vortex>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Seção 1 — Partículas em canvas (sempre-escuras)                    */}
      {/* ================================================================== */}
      <section id="particulas" className="mt-16 scroll-mt-20">
        <SectionHeading
          icon={SparklesIcon}
          eyebrow="Canvas · partículas"
          title="Campos de partículas"
          description="Renderizados em <canvas> com requestAnimationFrame. Brilham sobre fundo escuro — apresentados numa janela deliberadamente dark."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <BgCard
            index={1}
            title="Sparkles Core"
            subtitle="Campo de partículas brancas com twinkle e drift."
            tone="dark"
            heightClassName="h-[400px]"
            className="sm:col-span-2"
          >
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.1}
              particleDensity={140}
              particleColor="#FFFFFF"
              className="absolute inset-0"
            />
            <CenterLabel className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Sparkles
            </CenterLabel>
          </BgCard>

          <BgCard
            index={2}
            title="Background Beams"
            subtitle="Feixes de gradiente animados subindo na diagonal."
            tone="dark"
            heightClassName="h-[360px]"
            className="sm:col-span-2"
          >
            <BackgroundBeams className="opacity-100" />
            <CenterLabel className="text-white">Background Beams</CenterLabel>
          </BgCard>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Seção 2 — Linhas & feixes (adaptáveis / marca)                     */}
      {/* ================================================================== */}
      <section className="mt-16">
        <SectionHeading
          icon={Waves}
          eyebrow="SVG · movimento"
          title="Linhas & feixes"
          description="Traços vetoriais que ondulam, caem e colidem. Adaptam-se ao tema (ou trazem cor de marca própria, como o Light Lines)."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <BgCard
            index={3}
            title="Background Lines"
            subtitle="Linhas onduladas coloridas animando em loop."
            tone="adaptive"
            heightClassName="h-[400px]"
            className="sm:col-span-2"
            windowClassName="bg-gradient-to-b from-background to-muted/40"
          >
            <BackgroundLines className="flex h-full w-full items-center justify-center">
              <span className="relative z-20 bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-2xl font-bold text-transparent sm:text-4xl dark:from-neutral-200 dark:to-neutral-500">
                Background Lines
              </span>
            </BackgroundLines>
          </BgCard>

          <BgCard
            index={4}
            title="Beams With Collision"
            subtitle="Feixes caem e explodem em partículas ao colidir."
            tone="adaptive"
            heightClassName="h-[380px]"
          >
            <BackgroundBeamsWithCollision className="!h-full min-h-0 rounded-xl md:!h-full">
              <span className="relative z-20 px-4 text-center text-xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                Exploding Beams
              </span>
            </BackgroundBeamsWithCollision>
          </BgCard>

          <BgCard
            index={5}
            title="Light Lines"
            subtitle="Luzes verticais animadas sobre gradiente azul."
            tone="brand"
            heightClassName="h-[380px]"
          >
            <LightLines>
              <div className="relative z-10 flex h-full items-center justify-center px-4">
                <span className="text-2xl font-bold text-white sm:text-4xl">
                  Light Lines
                </span>
              </div>
            </LightLines>
          </BgCard>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Seção 3 — Malhas & grids                                           */}
      {/* ================================================================== */}
      <section className="mt-16">
        <SectionHeading
          icon={Grid2x2}
          eyebrow="Profundidade · grids"
          title="Malhas & grids"
          description="Grades em perspectiva 3D, células que acendem no hover e pontos revelados por um holofote que segue o cursor."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <BgCard
            index={6}
            title="Perspective Grid"
            subtitle="Grid 3D com hover colorido e fade radial."
            tone="adaptive"
            heightClassName="h-[460px]"
            className="sm:col-span-2"
            windowClassName="bg-white dark:bg-black"
          >
            <PerspectiveGrid />
            <CenterLabel className="whitespace-pre-wrap bg-gradient-to-b from-black to-gray-400/70 bg-clip-text leading-none text-transparent sm:text-5xl dark:from-white dark:to-slate-600/40">
              Perspective Grid
            </CenterLabel>
          </BgCard>

          <BgCard
            index={7}
            title="Background Boxes"
            subtitle="Células que acendem em cores aleatórias no hover."
            tone="dark"
            heightClassName="h-[380px]"
            windowClassName="flex items-center justify-center"
          >
            <Boxes />
            <div
              className="pointer-events-none absolute inset-0 z-20 [mask-image:radial-gradient(transparent,white)]"
              style={{ backgroundColor: DARK_BG }}
            />
            <CenterLabel className="z-20 text-white">Boxes</CenterLabel>
          </BgCard>

          <BgCard
            index={8}
            title="Dot Grid Spotlight"
            subtitle="Pontos revelados por um holofote que segue o cursor."
            tone="adaptive"
            heightClassName="h-[380px]"
          >
            <DotGridSpotlight
              className="h-full w-full"
              style={lightContrastVars}
            >
              <div className="flex h-[380px] items-center justify-center px-4">
                <span className="text-2xl font-bold text-foreground sm:text-3xl">
                  Dot Grid Spotlight
                </span>
              </div>
            </DotGridSpotlight>
          </BgCard>

          <BgCard
            index={9}
            title="Background Ripple Effect"
            subtitle="Clique numa célula e o ripple se propaga pelas vizinhas."
            tone="adaptive"
            heightClassName="h-[360px]"
            className="sm:col-span-2"
          >
            <div className="absolute inset-0" style={lightContrastVars}>
              <BackgroundRippleEffect rows={7} cols={18} cellSize={40} />
            </div>
            <CenterLabel className="z-[4] text-foreground">
              Ripple Effect
            </CenterLabel>
          </BgCard>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Seção 4 — Interativos                                              */}
      {/* ================================================================== */}
      <section className="mt-16">
        <SectionHeading
          icon={MousePointerClick}
          eyebrow="Cursor · revelação"
          title="Superfícies interativas"
          description="Efeitos que reagem ao movimento do mouse — passe o cursor para revelar o conteúdo escondido sob a máscara."
        />

        <div className="grid gap-5">
          <BgCard
            index={10}
            title="SVG Mask Effect"
            subtitle="Máscara circular segue o cursor e revela o texto por baixo."
            tone="adaptive"
            heightClassName="h-[420px]"
          >
            <MaskContainer
              revealText={
                <p className="mx-auto max-w-3xl text-center text-xl font-bold text-foreground sm:text-2xl">
                  Passe o mouse para revelar a mensagem escondida sob a máscara.
                </p>
              }
              className="h-full w-full text-white dark:text-black"
            >
              Discover the power of{" "}
              <span className="text-blue-500">interactive masks</span> that
              follow your cursor across the canvas.
            </MaskContainer>
          </BgCard>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Rodapé com tokens                                                  */}
      {/* ================================================================== */}
      <footer className="mt-16 flex flex-col items-center gap-2 border-t border-border pt-8 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <BoxesIcon className="size-4" />
          11 fundos · 1 vitrine
        </span>
        <p className="max-w-md text-xs text-muted-foreground">
          Todos os fundos acima são componentes do registry, prontos para copiar
          e usar — com suporte nativo a light e dark.
        </p>
      </footer>
    </div>
  )
}
