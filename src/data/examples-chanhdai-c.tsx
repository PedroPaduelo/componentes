/**
 * Examples do lote chanhdai — grupo C.
 *
 * Cobre 5 slugs: theme-switcher, theme-toggle-effect, toc-minimap,
 * copy-button, consent-manager.
 *
 * Cada Example tem `code` (string JSX exibida/copiada) espelhando o
 * `render` (ReactNode do preview). Snippets curtos e legíveis.
 */

import * as React from "react"
import type { Example } from "@/data/examples"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { ThemeToggleEffect } from "@/components/ui/theme-toggle-effect"
import { TOCMinimap, type TOCItem } from "@/components/ui/toc-minimap"
import { CopyButton } from "@/components/ui/copy-button"
import { ConsentDemoTrigger } from "@/data/examples-consent"

/* -------------------------------------------------------------------------- */
/*                              theme-switcher                                 */
/* -------------------------------------------------------------------------- */

const themeSwitcherNode: React.ReactNode = (
  <div className="flex justify-center">
    <ThemeSwitcher />
  </div>
)

const themeSwitcherBasicExample: Example = {
  title: "Básico",
  description: "Dropdown Light / Dark / System reusando o tema da vitrine.",
  code: `<ThemeSwitcher />`,
  render: themeSwitcherNode,
}

/* -------------------------------------------------------------------------- */
/*                            theme-toggle-effect                             */
/* -------------------------------------------------------------------------- */

const themeToggleEffectExample: Example = {
  title: "Com e sem efeito",
  description:
    "Botão que alterna claro/escuro. Com View Transition (à esquerda) ou troca instantânea (à direita).",
  code: `<ThemeToggleEffect />
<ThemeToggleEffect withEffect={false} />`,
  render: (
    <div className="flex items-center gap-4">
      <ThemeToggleEffect />
      <ThemeToggleEffect withEffect={false} />
    </div>
  ),
}

const themeToggleEffectVariantsExample: Example = {
  title: "Variantes de animação",
  description:
    "7 variantes de animação (circle, circle-blur, circle-blur-top-left, triangle, triangle-blur, polygon, polygon-gradient) + sem efeito.",
  code: `<ThemeToggleEffect variant="circle" />
<ThemeToggleEffect variant="circle-blur" />
<ThemeToggleEffect variant="circle-blur-top-left" />
<ThemeToggleEffect variant="triangle" />
<ThemeToggleEffect variant="triangle-blur" />
<ThemeToggleEffect variant="polygon" />
<ThemeToggleEffect variant="polygon-gradient" />
<ThemeToggleEffect withEffect={false} />`,
  render: (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect variant="circle" />
        <span className="text-xs text-muted-foreground">circle</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect variant="circle-blur" />
        <span className="text-xs text-muted-foreground">circle-blur</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect variant="circle-blur-top-left" />
        <span className="text-xs text-muted-foreground">circle-blur-tl</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect variant="triangle" />
        <span className="text-xs text-muted-foreground">triangle</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect variant="triangle-blur" />
        <span className="text-xs text-muted-foreground">triangle-blur</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect variant="polygon" />
        <span className="text-xs text-muted-foreground">polygon</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect variant="polygon-gradient" />
        <span className="text-xs text-muted-foreground">polygon-grad</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggleEffect withEffect={false} />
        <span className="text-xs text-muted-foreground">sem efeito</span>
      </div>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                toc-minimap                                  */
/* -------------------------------------------------------------------------- */

const tocItems: TOCItem[] = [
  { id: "intro", label: "Introdução" },
  { id: "setup", label: "Instalação", level: 2 },
  { id: "api", label: "API" },
  { id: "exemplos", label: "Exemplos", level: 2 },
]

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

const tocMinimapShowcaseExample: Example = {
  title: "Showcase com scroll-tracking",
  description:
    "Use dentro de uma página com seções: o item ativo muda conforme a seção visível e a barra de progresso reflete a posição de scroll.",
  code: `const items = [
  { id: "intro",    label: "Introdução" },
  { id: "setup",    label: "Instalação", level: 2 },
  { id: "api",      label: "API" },
  { id: "exemplos", label: "Exemplos",   level: 2 },
]

// Renderize o TOC junto das seções que ele rastreia:
<div className="space-y-8">
  <TOCMinimap items={items} orientation="vertical" />
  <section id="intro">…</section>
  <section id="setup">…</section>
  <section id="api">…</section>
  <section id="exemplos">…</section>
</div>`,
  render: (
    <div className="w-full space-y-6">
      <div className="flex justify-center">
        <TOCMinimap items={tocItems} orientation="vertical" />
      </div>
      {(
        [
          { id: "intro", title: "Introdução" },
          { id: "setup", title: "Instalação" },
          { id: "api", title: "API" },
          { id: "exemplos", title: "Exemplos" },
        ] as const
      ).map(({ id, title }) => (
        <section
          key={id}
          id={id}
          data-toc-section
          className="space-y-3 border-b border-dashed border-border pb-6 last:border-b-0"
        >
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
              {lorem}
            </p>
          ))}
        </section>
      ))}
    </div>
  ),
}

const tocMinimapVerticalExample: Example = {
  title: "Vertical",
  description:
    "Minimapa vertical de sumário com indentação por nível. (Barra de progresso desativada no preview.)",
  code: `const items = [
  { id: "intro", label: "Introdução" },
  { id: "setup", label: "Instalação", level: 2 },
  { id: "api", label: "API" },
  { id: "exemplos", label: "Exemplos", level: 2 },
]

<TOCMinimap items={items} orientation="vertical" showProgress={false} />`,
  render: (
    <div className="flex justify-center">
      <TOCMinimap items={tocItems} orientation="vertical" showProgress={false} />
    </div>
  ),
}

const tocMinimapHorizontalExample: Example = {
  title: "Horizontal",
  description: "Mesmo sumário em orientação horizontal.",
  code: `<TOCMinimap items={items} orientation="horizontal" showProgress={false} />`,
  render: (
    <div className="flex justify-center">
      <TOCMinimap
        items={tocItems}
        orientation="horizontal"
        showProgress={false}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                copy-button                                  */
/* -------------------------------------------------------------------------- */

const copyButtonBasicExample: Example = {
  title: "Básico",
  description: "Copia um valor para a área de transferência com feedback visual.",
  code: `<CopyButton value="npm install lucide-react" />`,
  render: (
    <div className="flex items-center gap-3">
      <CopyButton value="npm install lucide-react" />
    </div>
  ),
}

const copyButtonLabelExample: Example = {
  title: "Com rótulo e variante",
  description: "Label customizado e variante secondary.",
  code: `<CopyButton value="texto" label="Copiar código" variant="secondary" />`,
  render: (
    <div className="flex items-center gap-3">
      <CopyButton value="texto" label="Copiar código" variant="secondary" />
    </div>
  ),
}

const copyButtonIconOnlyExample: Example = {
  title: "Ícone-only (ghost)",
  description:
    "Variante ghost com size icon-xs (28×28, ícone-only) — paridade com o site de referência.",
  code: `<CopyButton variant="ghost" size="icon-xs" value="npm install lucide-react" />`,
  render: (
    <div className="flex items-center gap-3">
      <CopyButton
        variant="ghost"
        size="icon-xs"
        value="npm install lucide-react"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                              consent-manager                                */
/* -------------------------------------------------------------------------- */

const consentManagerExample: Example = {
  title: "Gerenciador de consentimento",
  description:
    "Dialog de preferências de cookies. No app real, envolva a aplicação com <ConsentManager>.",
  code: `<ConsentManager position="bottom-right">
  <App />
</ConsentManager>`,
  render: (
    <div className="flex justify-center">
      <ConsentDemoTrigger />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  mapa                                       */
/* -------------------------------------------------------------------------- */

export const examplesChanhdaiC: Record<string, Example[]> = {
  "theme-switcher": [themeSwitcherBasicExample],
  "theme-toggle-effect": [
    themeToggleEffectExample,
    themeToggleEffectVariantsExample,
  ],
  "toc-minimap": [
    tocMinimapShowcaseExample,
    tocMinimapVerticalExample,
    tocMinimapHorizontalExample,
  ],
  "copy-button": [
    copyButtonIconOnlyExample,
    copyButtonBasicExample,
    copyButtonLabelExample,
  ],
  "consent-manager": [consentManagerExample],
}
