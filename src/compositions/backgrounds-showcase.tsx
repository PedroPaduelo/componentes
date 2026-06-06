/**
 * Backgrounds Showcase — galeria vertical que reúne os 11 componentes de fundo
 * animado do registry, cada um contido numa seção própria (`relative` + altura
 * fixa + `overflow-hidden`) com um label/título sobreposto (`absolute z-10`).
 *
 * Os fundos são consumidos do barrel `@/components/ui`. Vários deles são
 * escuros por natureza (canvas/partículas/feixes), então essas seções fixam um
 * fundo escuro; o restante do enquadramento usa tokens shadcn (light/dark).
 */

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

type SectionProps = {
  index: number
  title: string
  subtitle: string
  /** Altura do container. @default "h-[400px]" */
  heightClassName?: string
  /** Classe extra do container (ex.: fundo escuro). */
  className?: string
  children: React.ReactNode
}

/**
 * Wrapper padrão de cada fundo: `relative` + altura + `overflow-hidden` para
 * conter o fundo `absolute inset-0`, com um cabeçalho numerado por cima (z-10).
 */
function ShowcaseSection({
  index,
  title,
  subtitle,
  heightClassName = "h-[400px]",
  className,
  children,
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden rounded-xl border",
        heightClassName,
        className,
      )}
    >
      {children}

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1">
        <span className="inline-flex w-fit items-center rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {String(index).padStart(2, "0")}
        </span>
        <h3 className="text-lg font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {title}
        </h3>
        <p className="max-w-xs text-xs text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {subtitle}
        </p>
      </div>
    </section>
  )
}

export function BackgroundsShowcase() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Backgrounds Showcase
        </h1>
        <p className="mt-2 text-muted-foreground">
          Onze fundos animados do registry, cada um contido em sua própria
          seção.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {/* 01 — Sparkles */}
        <ShowcaseSection
          index={1}
          title="Sparkles Core"
          subtitle="Campo de partículas brancas em canvas sobre fundo escuro."
          className="bg-black"
        >
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={120}
            particleColor="#FFFFFF"
            className="absolute inset-0"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white md:text-5xl">
              Sparkles
            </span>
          </div>
        </ShowcaseSection>

        {/* 02 — Vortex */}
        <ShowcaseSection
          index={2}
          title="Vortex"
          subtitle="Redemoinho de partículas animado em canvas."
        >
          <Vortex
            backgroundColor="#000000"
            className="flex h-full w-full items-center justify-center px-4"
          >
            <span className="text-3xl font-bold text-white md:text-5xl">
              Vortex
            </span>
          </Vortex>
        </ShowcaseSection>

        {/* 03 — Background Boxes */}
        <ShowcaseSection
          index={3}
          title="Background Boxes"
          subtitle="Grid de células que acendem em cores aleatórias no hover."
          className="flex items-center justify-center bg-slate-900"
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 h-full w-full bg-slate-900",
              "[mask-image:radial-gradient(transparent,white)]",
            )}
          />
          <Boxes />
          <span className="relative z-20 text-3xl font-bold text-white md:text-5xl">
            Boxes
          </span>
        </ShowcaseSection>

        {/* 04 — Background Lines */}
        <ShowcaseSection
          index={4}
          title="Background Lines"
          subtitle="Linhas onduladas coloridas animando em loop (adapta ao tema)."
        >
          <BackgroundLines className="flex h-full w-full items-center justify-center">
            <span className="relative z-20 bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-3xl font-bold text-transparent md:text-5xl dark:from-neutral-600 dark:to-white">
              Background Lines
            </span>
          </BackgroundLines>
        </ShowcaseSection>

        {/* 05 — Background Beams With Collision */}
        <ShowcaseSection
          index={5}
          title="Beams With Collision"
          subtitle="Feixes caem do topo e explodem em partículas ao colidir com a base."
        >
          <BackgroundBeamsWithCollision className="!h-full rounded-xl md:!h-full">
            <span className="relative z-20 px-4 text-center text-2xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
              Exploding Beams
            </span>
          </BackgroundBeamsWithCollision>
        </ShowcaseSection>

        {/* 06 — Dot Grid Spotlight */}
        <ShowcaseSection
          index={6}
          title="Dot Grid Spotlight"
          subtitle="Grade de pontos revelada por um holofote que segue o cursor."
        >
          <DotGridSpotlight className="h-full w-full bg-background">
            <div className="flex h-[400px] items-center justify-center">
              <span className="text-3xl font-bold md:text-5xl">
                Dot Grid Spotlight
              </span>
            </div>
          </DotGridSpotlight>
        </ShowcaseSection>

        {/* 07 — Light Lines */}
        <ShowcaseSection
          index={7}
          title="Light Lines"
          subtitle="Luzes verticais animadas sobre gradiente azul."
        >
          <LightLines>
            <div className="relative z-10 flex h-full items-center justify-center">
              <span className="text-3xl font-bold text-white md:text-5xl">
                Light Lines
              </span>
            </div>
          </LightLines>
        </ShowcaseSection>

        {/* 08 — Perspective Grid */}
        <ShowcaseSection
          index={8}
          title="Perspective Grid"
          subtitle="Grid 3D com hover colorido e fade radial."
          heightClassName="h-[500px]"
          className="flex items-center justify-center bg-background"
        >
          <PerspectiveGrid />
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <span className="whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-4xl font-semibold leading-none text-transparent md:text-6xl dark:from-white dark:to-slate-900/10">
              Perspective Grid
            </span>
          </div>
        </ShowcaseSection>

        {/* 09 — SVG Mask Effect */}
        <ShowcaseSection
          index={9}
          title="SVG Mask Effect"
          subtitle="Máscara circular segue o cursor e revela o texto por baixo."
          heightClassName="h-[420px]"
        >
          <MaskContainer
            revealText={
              <p className="mx-auto max-w-3xl text-center text-2xl font-bold">
                Passe o mouse para revelar a mensagem escondida sob a máscara.
              </p>
            }
            className="h-full w-full text-white dark:text-black"
          >
            Discover the power of{" "}
            <span className="text-blue-500">interactive masks</span> that follow
            your cursor across the canvas.
          </MaskContainer>
        </ShowcaseSection>

        {/* 10 — Background Ripple Effect */}
        <ShowcaseSection
          index={10}
          title="Background Ripple Effect"
          subtitle="Clique numa célula: o ripple se propaga pelas vizinhas."
        >
          <BackgroundRippleEffect rows={7} cols={16} cellSize={40} />
          <div className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center">
            <span className="text-3xl font-bold tracking-tight md:text-5xl">
              Ripple Effect
            </span>
          </div>
        </ShowcaseSection>

        {/* 11 — Background Beams */}
        <ShowcaseSection
          index={11}
          title="Background Beams"
          subtitle="Feixes de gradiente animados subindo na diagonal (Aceternity)."
          className="bg-neutral-950"
        >
          <BackgroundBeams className="opacity-100" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="relative z-20 text-3xl font-bold text-white md:text-5xl">
              Background Beams
            </span>
          </div>
        </ShowcaseSection>
      </div>
    </div>
  )
}
