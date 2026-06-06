/**
 * Composição "Text Effects Showcase" — kitchen sink de efeitos animados de
 * texto, ícones e botões, montada apenas com componentes do registry da vitrine.
 *
 * Cobertura (10 componentes):
 * - Textos: CyberGlitchText, FlipText, FlipFadeText, ShimmeringText,
 *   FluidGradientText.
 * - Ícones: MobiusLoopIcon, ChevronsUpDownIcon, IconSwap.
 * - Botões: CreepyButton, AnimatedButton.
 *
 * Efeitos de "brand" (cyber-glitch tem cores fixas vermelho/azul) mantêm a cor
 * de assinatura; o restante usa tokens shadcn e responde a light/dark.
 */

import * as React from "react"
import { Bell, BellOff, Eye, EyeOff, Moon, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  AnimatedButton,
  ChevronsUpDownIcon,
  CreepyButton,
  CyberGlitchText,
  FlipFadeText,
  FlipText,
  FluidGradientText,
  IconSwap,
  MobiusLoopIcon,
  ShimmeringText,
} from "@/components/ui"

/* -------------------------------------------------------------------------- */
/*                          helpers locais (não exportados)                   */
/* -------------------------------------------------------------------------- */

/** Cartão de demo com label e área central para o efeito. */
function DemoCard({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={
        "group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-foreground/20 " +
        (className ?? "")
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      <div className="flex min-h-28 flex-1 items-center justify-center">
        {children}
      </div>
    </div>
  )
}

/** Toggle interativo reusando IconSwap (estado próprio). */
function IconSwapToggle({
  on,
  off,
  label,
}: {
  on: LucideIcon
  off: LucideIcon
  label: string
}) {
  const [active, setActive] = React.useState(true)
  return (
    <button
      type="button"
      onClick={() => setActive((v) => !v)}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <IconSwap
        aria-hidden
        iconOn={on}
        iconOff={off}
        active={active}
        iconClassName="size-5"
      />
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  showcase                                  */
/* -------------------------------------------------------------------------- */

export function TextEffectsShowcase() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      {/* Hero ---------------------------------------------------------------- */}
      <header className="flex flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <MobiusLoopIcon size={16} speed="normal" aria-hidden />
          Text Effects Showcase
        </span>

        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Efeitos animados em ação
        </h1>

        {/* FluidGradientText como peça-título grande */}
        <div className="h-24 w-full max-w-2xl text-foreground sm:h-32">
          <FluidGradientText text="vitrine" />
        </div>

        <p className="max-w-xl text-pretty text-base text-muted-foreground">
          Uma vitrine viva de animações de texto, ícones e botões — todas peças
          reais do registry, com tema light/dark nativo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <AnimatedButton>Explorar efeitos</AnimatedButton>
          <CreepyButton>Não clique</CreepyButton>
        </div>
      </header>

      {/* Seção: efeitos de texto -------------------------------------------- */}
      <section className="mt-14">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Efeitos de texto
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DemoCard label="Cyber Glitch" hint="brand">
            <CyberGlitchText
              text="DECRYPTING..."
              className="text-xl font-bold"
            />
          </DemoCard>

          <DemoCard label="Flip Text" hint="onda 3D">
            <FlipText
              className="text-3xl font-bold text-foreground"
              duration={2.4}
            >
              Flip Wave
            </FlipText>
          </DemoCard>

          <DemoCard label="Flip Fade Text" hint="ciclo">
            <FlipFadeText
              words={["LOADING", "SYNCING", "RENDERING", "READY"]}
              interval={2000}
              textClassName="text-3xl text-foreground"
            />
          </DemoCard>

          <DemoCard label="Shimmering Text" hint="loading">
            <ShimmeringText
              as="h2"
              className="text-2xl font-semibold"
              duration={2.5}
            >
              Carregando…
            </ShimmeringText>
          </DemoCard>

          <DemoCard
            label="Fluid Gradient"
            hint="hover"
            className="sm:col-span-2 lg:col-span-2"
          >
            <div className="h-20 w-full text-foreground">
              <FluidGradientText text="shadcn" />
            </div>
          </DemoCard>
        </div>
      </section>

      {/* Seção: ícones animados --------------------------------------------- */}
      <section className="mt-12">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Ícones animados
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DemoCard label="Möbius Loop" hint="velocidades">
            <div className="flex items-center gap-6 text-foreground">
              <MobiusLoopIcon size={36} speed="slow" />
              <MobiusLoopIcon size={36} speed="normal" />
              <MobiusLoopIcon size={36} speed="fast" />
            </div>
          </DemoCard>

          <DemoCard label="Chevrons Up/Down" hint="hover anima">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
              Selecione uma opção
              <ChevronsUpDownIcon aria-hidden />
            </span>
          </DemoCard>

          <DemoCard label="Icon Swap" hint="clique">
            <div className="flex items-center gap-3">
              <IconSwapToggle on={Sun} off={Moon} label="Alternar tema" />
              <IconSwapToggle on={Eye} off={EyeOff} label="Alternar visão" />
              <IconSwapToggle
                on={Bell}
                off={BellOff}
                label="Alternar notificações"
              />
            </div>
          </DemoCard>
        </div>
      </section>

      {/* Seção: botões interativos ------------------------------------------ */}
      <section className="mt-12">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Botões interativos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DemoCard label="Animated Button" hint="text reveal">
            <AnimatedButton>Get Started</AnimatedButton>
          </DemoCard>

          <DemoCard label="Creepy Button" hint="olhos seguem">
            <CreepyButton>Hover Me</CreepyButton>
          </DemoCard>
        </div>
      </section>
    </div>
  )
}
