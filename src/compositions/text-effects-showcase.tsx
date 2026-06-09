/**
 * Composição "Text Effects Showcase" — reformulada como um **Playground /
 * Gerador de texto animado** interativo + uma seção de uso em contexto real.
 *
 * Bloco 1 (Playground): o usuário digita o próprio texto, escolhe um efeito
 * entre os componentes REAIS do registry da vitrine, ajusta os parâmetros que
 * aquele efeito suporta (param schema por efeito) e vê o resultado ao vivo num
 * palco grande. Um botão "Copiar código" gera o JSX coerente com os parâmetros
 * atuais.
 *
 * Bloco 2 ("Em contexto"): os efeitos aplicados com propósito — mini-hero,
 * badge beta, estado de carregamento, marca interativa e chamada para ação.
 *
 * Efeitos "brand" (cyber-glitch, colourful) mantêm a cor de assinatura; os
 * demais usam tokens shadcn e respondem a light/dark. Tamanho de fonte dinâmico
 * é aplicado via `style={{ fontSize }}` (CSS inline), nunca via classe Tailwind
 * interpolada.
 */

import * as React from "react"
import { Loader2, Sparkles, Type, Wand2 } from "lucide-react"

import {
  AnimatedButton,
  Badge,
  ColourfulText,
  ContainerTextFlip,
  CopyButton,
  CreepyButton,
  CyberGlitchText,
  EncryptedText,
  FlipText,
  FlipWords,
  FluidGradientText,
  Input,
  ShimmeringText,
  Slider,
  SquigglyText,
  Switch,
  TextGenerateEffect,
  TextHoverEffect,
} from "@/components/ui"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                              param schema                                  */
/* -------------------------------------------------------------------------- */

/** Chaves de parâmetro numérico que o playground controla. */
type NumberParamKey =
  | "fontSize"
  | "shimmerDuration"
  | "flipDuration"
  | "generateDuration"
  | "scrambleDuration"
  | "revealDelayMs"
  | "flipDelayMs"
  | "squiggleStepDuration"
  | "squiggleScale"
  | "hoverStrokeWidth"
  | "hoverDuration"
  | "containerInterval"

/** Chaves de parâmetro booleano. */
type BooleanParamKey = "generateFilter"

/** Estado global de parâmetros — um valor por chave, compartilhado. */
type PlaygroundParams = { [K in NumberParamKey]: number } & {
  [K in BooleanParamKey]: boolean
}

const DEFAULT_PARAMS: PlaygroundParams = {
  fontSize: 56,
  shimmerDuration: 2,
  flipDuration: 2.2,
  generateDuration: 0.6,
  scrambleDuration: 40,
  revealDelayMs: 60,
  flipDelayMs: 40,
  squiggleStepDuration: 80,
  squiggleScale: 7,
  hoverStrokeWidth: 0.3,
  hoverDuration: 0.4,
  containerInterval: 2000,
  generateFilter: true,
}

/** Controle de slider para um parâmetro numérico. */
type SliderControl = {
  kind: "slider"
  key: NumberParamKey
  label: string
  min: number
  max: number
  step: number
  unit?: string
}

/** Controle de switch para um parâmetro booleano. */
type SwitchControl = {
  kind: "switch"
  key: BooleanParamKey
  label: string
}

type Control = SliderControl | SwitchControl

const FONT_SIZE_CONTROL: SliderControl = {
  kind: "slider",
  key: "fontSize",
  label: "Tamanho",
  min: 16,
  max: 128,
  step: 1,
  unit: "px",
}

/** Definição de um efeito disponível no playground. */
type EffectDef = {
  id: string
  label: string
  /** Efeito com cor de assinatura fixa (não segue tokens do tema). */
  brand: boolean
  /** Dica curta de quando usar / como interagir. */
  hint: string
  controls: Control[]
  render: (text: string, p: PlaygroundParams) => React.ReactNode
  code: (text: string, p: PlaygroundParams) => string
}

/* -------------------------------------------------------------------------- */
/*                         helpers de geração de código                       */
/* -------------------------------------------------------------------------- */

/** Envolve o efeito num wrapper com `fontSize` (espelha o preview). */
function fontSizeWrapper(inner: string, fontSize: number): string {
  return `<div style={{ fontSize: ${fontSize} }}>\n${inner
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")}\n</div>`
}

/** Converte o texto em lista de palavras (vírgula = separador). */
function toWordList(text: string): string[] {
  const parts = text
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
  return parts.length > 0 ? parts : [text]
}

/* -------------------------------------------------------------------------- */
/*                              catálogo de efeitos                            */
/* -------------------------------------------------------------------------- */

const EFFECTS: EffectDef[] = [
  {
    id: "fluid-gradient-text",
    label: "Fluid Gradient",
    brand: false,
    hint: "Mova o cursor sobre o texto para deslocar o gradiente.",
    controls: [FONT_SIZE_CONTROL],
    render: (t, p) => (
      <div
        className="w-full max-w-xl text-foreground"
        style={{ height: Math.round(p.fontSize * 1.8) }}
      >
        <FluidGradientText text={t} />
      </div>
    ),
    code: (t, p) =>
      `<div className="text-foreground" style={{ height: ${Math.round(
        p.fontSize * 1.8,
      )} }}>\n  <FluidGradientText text="${t}" />\n</div>`,
  },
  {
    id: "shimmering-text",
    label: "Shimmering",
    brand: false,
    hint: "Brilho contínuo — ótimo para estados de carregamento.",
    controls: [
      FONT_SIZE_CONTROL,
      {
        kind: "slider",
        key: "shimmerDuration",
        label: "Duração",
        min: 0.5,
        max: 6,
        step: 0.1,
        unit: "s",
      },
    ],
    render: (t, p) => (
      <div className="text-foreground" style={{ fontSize: p.fontSize, lineHeight: 1.1 }}>
        <ShimmeringText className="font-semibold" duration={p.shimmerDuration}>
          {t}
        </ShimmeringText>
      </div>
    ),
    code: (t, p) =>
      fontSizeWrapper(
        `<ShimmeringText className="font-semibold" duration={${p.shimmerDuration}}>\n  ${t}\n</ShimmeringText>`,
        p.fontSize,
      ),
  },
  {
    id: "flip-text",
    label: "Flip Text",
    brand: false,
    hint: "Onda 3D contínua, caractere a caractere (CSS puro).",
    controls: [
      FONT_SIZE_CONTROL,
      {
        kind: "slider",
        key: "flipDuration",
        label: "Duração",
        min: 0.6,
        max: 5,
        step: 0.1,
        unit: "s",
      },
    ],
    render: (t, p) => (
      <div className="text-foreground" style={{ fontSize: p.fontSize, lineHeight: 1.1 }}>
        <FlipText className="font-bold" duration={p.flipDuration}>
          {t}
        </FlipText>
      </div>
    ),
    code: (t, p) =>
      fontSizeWrapper(
        `<FlipText className="font-bold" duration={${p.flipDuration}}>\n  ${t}\n</FlipText>`,
        p.fontSize,
      ),
  },
  {
    id: "encrypted-text",
    label: "Encrypted",
    brand: false,
    hint: "Revela o texto saindo de caracteres aleatórios.",
    controls: [
      FONT_SIZE_CONTROL,
      {
        kind: "slider",
        key: "revealDelayMs",
        label: "Revelar a cada",
        min: 20,
        max: 200,
        step: 5,
        unit: "ms",
      },
      {
        kind: "slider",
        key: "flipDelayMs",
        label: "Embaralhar a cada",
        min: 10,
        max: 160,
        step: 5,
        unit: "ms",
      },
    ],
    render: (t, p) => (
      <div className="text-foreground" style={{ fontSize: p.fontSize, lineHeight: 1.1 }}>
        <EncryptedText
          text={t}
          className="font-mono font-semibold"
          revealDelayMs={p.revealDelayMs}
          flipDelayMs={p.flipDelayMs}
        />
      </div>
    ),
    code: (t, p) =>
      fontSizeWrapper(
        `<EncryptedText\n  text="${t}"\n  className="font-mono font-semibold"\n  revealDelayMs={${p.revealDelayMs}}\n  flipDelayMs={${p.flipDelayMs}}\n/>`,
        p.fontSize,
      ),
  },
  {
    id: "text-generate-effect",
    label: "Text Generate",
    brand: false,
    hint: "Entra palavra a palavra com desfoque — estilo IA gerando.",
    controls: [
      {
        kind: "slider",
        key: "generateDuration",
        label: "Duração",
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: "s",
      },
      { kind: "switch", key: "generateFilter", label: "Desfoque na entrada" },
    ],
    render: (t, p) => (
      <TextGenerateEffect
        className="text-foreground"
        words={t}
        duration={p.generateDuration}
        filter={p.generateFilter}
      />
    ),
    code: (t, p) =>
      `<TextGenerateEffect\n  words="${t}"\n  duration={${p.generateDuration}}\n  filter={${p.generateFilter}}\n/>`,
  },
  {
    id: "colourful-text",
    label: "Colourful",
    brand: true,
    hint: "Letras coloridas que reembaralham a paleta a cada 5s.",
    controls: [FONT_SIZE_CONTROL],
    render: (t, p) => (
      <div className="font-bold" style={{ fontSize: p.fontSize, lineHeight: 1.1 }}>
        <ColourfulText text={t} />
      </div>
    ),
    code: (t, p) =>
      fontSizeWrapper(`<ColourfulText text="${t}" />`, p.fontSize),
  },
  {
    id: "squiggly-text",
    label: "Squiggly",
    brand: false,
    hint: "Distorção orgânica via filtro SVG de turbulência.",
    controls: [
      FONT_SIZE_CONTROL,
      {
        kind: "slider",
        key: "squiggleStepDuration",
        label: "Velocidade",
        min: 30,
        max: 200,
        step: 10,
        unit: "ms",
      },
      {
        kind: "slider",
        key: "squiggleScale",
        label: "Intensidade",
        min: 2,
        max: 16,
        step: 1,
      },
    ],
    render: (t, p) => (
      <div className="font-bold text-foreground" style={{ fontSize: p.fontSize, lineHeight: 1.1 }}>
        <SquigglyText
          stepDuration={p.squiggleStepDuration}
          scale={p.squiggleScale}
        >
          {t}
        </SquigglyText>
      </div>
    ),
    code: (t, p) =>
      fontSizeWrapper(
        `<SquigglyText stepDuration={${p.squiggleStepDuration}} scale={${p.squiggleScale}}>\n  ${t}\n</SquigglyText>`,
        p.fontSize,
      ),
  },
  {
    id: "text-hover-effect",
    label: "Hover Reveal",
    brand: false,
    hint: "Passe o mouse para revelar o gradiente sob o traçado.",
    controls: [
      {
        kind: "slider",
        key: "hoverStrokeWidth",
        label: "Espessura do traço",
        min: 0.1,
        max: 2,
        step: 0.1,
      },
      {
        kind: "slider",
        key: "hoverDuration",
        label: "Suavização",
        min: 0,
        max: 2,
        step: 0.1,
        unit: "s",
      },
    ],
    render: (t, p) => (
      <div className="w-full max-w-md">
        <TextHoverEffect
          text={t}
          strokeWidth={p.hoverStrokeWidth}
          duration={p.hoverDuration}
        />
      </div>
    ),
    code: (t, p) =>
      `<TextHoverEffect\n  text="${t}"\n  strokeWidth={${p.hoverStrokeWidth}}\n  duration={${p.hoverDuration}}\n/>`,
  },
  {
    id: "container-text-flip",
    label: "Container Flip",
    brand: false,
    hint: "Separe palavras por vírgula para ciclar entre elas.",
    controls: [
      {
        kind: "slider",
        key: "containerInterval",
        label: "Intervalo",
        min: 800,
        max: 5000,
        step: 100,
        unit: "ms",
      },
    ],
    render: (t, p) => (
      <ContainerTextFlip words={toWordList(t)} interval={p.containerInterval} />
    ),
    code: (t, p) => {
      const words = toWordList(t)
      const literal = `[${words.map((w) => `"${w}"`).join(", ")}]`
      return `<ContainerTextFlip\n  words={${literal}}\n  interval={${p.containerInterval}}\n/>`
    },
  },
  {
    id: "cyber-glitch-text",
    label: "Cyber Glitch",
    brand: true,
    hint: "Scramble ao montar; passe o mouse para reativar o glitch.",
    controls: [
      FONT_SIZE_CONTROL,
      {
        kind: "slider",
        key: "scrambleDuration",
        label: "Velocidade do scramble",
        min: 10,
        max: 120,
        step: 5,
        unit: "ms",
      },
    ],
    render: (t, p) => (
      <div className="font-bold text-foreground" style={{ fontSize: p.fontSize, lineHeight: 1.1 }}>
        <CyberGlitchText text={t} scrambleDuration={p.scrambleDuration} />
      </div>
    ),
    code: (t, p) =>
      fontSizeWrapper(
        `<CyberGlitchText text="${t}" scrambleDuration={${p.scrambleDuration}} />`,
        p.fontSize,
      ),
  },
]

/* -------------------------------------------------------------------------- */
/*                            subcomponentes locais                           */
/* -------------------------------------------------------------------------- */

/** Cartão de "uso em contexto" com label de caso de uso. */
function UseCaseCard({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  showcase                                  */
/* -------------------------------------------------------------------------- */

export function TextEffectsShowcase() {
  const [text, setText] = React.useState("vitrine")
  const [effectId, setEffectId] = React.useState<string>(EFFECTS[0].id)
  const [params, setParams] = React.useState<PlaygroundParams>(DEFAULT_PARAMS)

  const effect = EFFECTS.find((e) => e.id === effectId) ?? EFFECTS[0]
  const displayText = text.trim().length > 0 ? text : "vitrine"

  const setNumber = React.useCallback((key: NumberParamKey, value: number) => {
    setParams((prev) => {
      const next = { ...prev }
      next[key] = value
      return next
    })
  }, [])

  const setBool = React.useCallback((key: BooleanParamKey, value: boolean) => {
    setParams((prev) => {
      const next = { ...prev }
      next[key] = value
      return next
    })
  }, [])

  // Chave de remount: troca quando o efeito, o texto ou qualquer parâmetro
  // usado pelo efeito muda — força os efeitos que animam no mount a reiniciar.
  const previewKey = `${effect.id}|${displayText}|${effect.controls
    .map((c) => String(params[c.key]))
    .join("|")}`

  const generatedCode = effect.code(displayText, params)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      {/* Hero --------------------------------------------------------------- */}
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Wand2 className="size-4" aria-hidden />
          Gerador de texto animado
        </span>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Playground de efeitos de texto
        </h1>
        <p className="max-w-xl text-pretty text-base text-muted-foreground">
          Digite seu texto, escolha um efeito do registry, ajuste os parâmetros
          e copie o código pronto. Tudo com peças reais da vitrine e tema
          light/dark nativo.
        </p>
      </header>

      {/* Playground --------------------------------------------------------- */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Coluna de controles */}
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {/* Campo de texto */}
          <div className="space-y-2">
            <label
              htmlFor="playground-text"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <Type className="size-4 text-muted-foreground" aria-hidden />
              Seu texto
            </label>
            <Input
              id="playground-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite algo…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Seletor de efeito */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Efeito</span>
            <div className="flex flex-wrap gap-2">
              {EFFECTS.map((e) => {
                const active = e.id === effect.id
                return (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setEffectId(e.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    {e.label}
                    {e.brand ? (
                      <span
                        className={cn(
                          "rounded px-1 py-px text-[9px] uppercase leading-none",
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        brand
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Controles de parâmetro reativos */}
          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Parâmetros
              </span>
              <button
                type="button"
                onClick={() => setParams(DEFAULT_PARAMS)}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Restaurar padrões
              </button>
            </div>

            {effect.controls.map((control) =>
              control.kind === "slider" ? (
                <div key={control.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {control.label}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {params[control.key]}
                      {control.unit ?? ""}
                    </span>
                  </div>
                  <Slider
                    value={[params[control.key]]}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    onValueChange={(vals) => setNumber(control.key, vals[0])}
                  />
                </div>
              ) : (
                <label
                  key={control.key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {control.label}
                  </span>
                  <Switch
                    checked={params[control.key]}
                    onCheckedChange={(v) => setBool(control.key, v)}
                  />
                </label>
              ),
            )}

            <p className="text-xs text-muted-foreground">{effect.hint}</p>
          </div>
        </div>

        {/* Coluna de preview + código */}
        <div className="flex flex-col gap-4">
          {/* Palco */}
          <div
            className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-8"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in oklab, var(--muted-foreground) 16%, transparent) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            <span className="absolute left-4 top-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preview
            </span>
            <div
              key={previewKey}
              className="flex w-full items-center justify-center text-center"
            >
              {effect.render(displayText, params)}
            </div>
          </div>

          {/* Código gerado + copiar */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                jsx
              </span>
              <CopyButton value={generatedCode} label="Copiar código" />
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-6">
              <code className="font-mono text-foreground">{generatedCode}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Em contexto -------------------------------------------------------- */}
      <section className="mt-14">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Em contexto</h2>
          <p className="text-sm text-muted-foreground">
            Os mesmos efeitos aplicados com propósito — onde cada um brilha.
          </p>
        </div>

        {/* Mini-hero */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Hero de produto
          </span>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Construa sua <ColourfulText text="vitrine" /> em minutos
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-lg text-muted-foreground">
            Perfeito para
            <FlipWords
              words={["startups", "agências", "freelancers", "produtos SaaS"]}
              className="font-semibold text-foreground"
            />
          </div>
        </div>

        {/* Casos de uso */}
        <div className="grid gap-4 sm:grid-cols-2">
          <UseCaseCard label="Badge de status">
            <Badge
              variant="secondary"
              className="gap-2 px-3 py-1 font-mono text-sm"
            >
              <CyberGlitchText text="BETA" className="font-bold" />
            </Badge>
            <Badge
              variant="outline"
              className="gap-2 px-3 py-1 font-mono text-sm"
            >
              <CyberGlitchText text="NOVO" className="font-bold" />
            </Badge>
          </UseCaseCard>

          <UseCaseCard label="Estado de carregamento">
            <Loader2
              className="size-5 animate-spin text-muted-foreground"
              aria-hidden
            />
            <ShimmeringText className="text-lg font-medium" duration={2}>
              Carregando seu workspace…
            </ShimmeringText>
          </UseCaseCard>

          <UseCaseCard label="Marca interativa">
            <div className="w-full max-w-xs">
              <TextHoverEffect text="HOVER" />
            </div>
          </UseCaseCard>

          <UseCaseCard label="Chamada para ação">
            <AnimatedButton>Começar agora</AnimatedButton>
            <CreepyButton>Não clique</CreepyButton>
          </UseCaseCard>
        </div>
      </section>
    </div>
  )
}
