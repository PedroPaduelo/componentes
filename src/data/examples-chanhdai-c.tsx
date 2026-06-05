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

/* -------------------------------------------------------------------------- */
/*                                toc-minimap                                  */
/* -------------------------------------------------------------------------- */

const tocItems: TOCItem[] = [
  { id: "intro", label: "Introdução" },
  { id: "setup", label: "Instalação", level: 2 },
  { id: "api", label: "API" },
  { id: "exemplos", label: "Exemplos", level: 2 },
]

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
  "theme-toggle-effect": [themeToggleEffectExample],
  "toc-minimap": [tocMinimapVerticalExample, tocMinimapHorizontalExample],
  "copy-button": [copyButtonBasicExample, copyButtonLabelExample],
  "consent-manager": [consentManagerExample],
}
