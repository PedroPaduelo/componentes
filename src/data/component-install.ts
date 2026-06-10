/**
 * Derivação de "instalação" de um componente da vitrine — dados puros (sem UI).
 *
 * A forma CANÔNICA de instalar um componente é via a CLI do shadcn, que aponta
 * para o registry estático servido por esta vitrine em `/r/<slug>.json`:
 *
 *     npx shadcn@latest add <BASE_URL>/r/<slug>.json
 *
 * Esse comando baixa os arquivos do componente + dependências externas + CSS,
 * então NÃO precisamos mais listar dependências manualmente (a heurística antiga
 * de `depCommand` cobria a dep real de só 2 dos 200+ componentes — factualmente
 * errada pro resto, por isso foi removida).
 *
 * Secundariamente, ainda derivamos o caminho de import (`@/components/ui/<arquivo>`)
 * e o nome do export nomeado no barrel — úteis para quem só quer ver como
 * consumir o componente no código. Princípio: NÃO inventar API. O nome do
 * export é derivado por heurística (PascalCase do slug) com um mapa de OVERRIDES
 * explícito para os casos em que o barrel diverge da heurística. Quando o export
 * é meramente heurístico (não confirmado por override), o campo `exportConfirmed`
 * fica `false` para a UI poder sinalizar isso honestamente.
 */

/**
 * Base URL pública do registry shadcn desta vitrine. O comando de instalação
 * aponta para `${REGISTRY_BASE_URL}/r/<slug>.json`.
 */
export const REGISTRY_BASE_URL =
  "https://componentes-fe-cmq0d9kr.cloud.serendiped.com"

/**
 * Comando CANÔNICO de instalação de um componente via CLI do shadcn.
 * Baixa os arquivos + dependências + CSS do registry estático da vitrine.
 *
 * Ex.: `getRegistryAddCommand("button")` →
 *   "npx shadcn@latest add https://.../r/button.json"
 */
export function getRegistryAddCommand(slug: string): string {
  return `npx shadcn@latest add ${REGISTRY_BASE_URL}/r/${slug}.json`
}

/** Resultado da derivação de instalação de um componente. */
export interface ComponentInstall {
  /** Caminho de import sem extensão, ex.: "@/components/ui/button". */
  importPath: string
  /** Nome do export nomeado, ex.: "Button". */
  exportName: string
  /**
   * `true` quando o export veio de um mapa explícito (confiável); `false`
   * quando é apenas a heurística PascalCase (a UI pode mostrar uma ressalva).
   */
  exportConfirmed: boolean
}

/**
 * Overrides de NOME DE ARQUIVO quando o slug não bate com o nome do .tsx.
 * (a maioria bate; só listar exceções).
 */
const FILE_OVERRIDES: Record<string, string> = {
  "3d-card-effect": "3d-card",
}

/**
 * Overrides de NOME DE EXPORT confirmados via barrel `@/components/ui/index.ts`.
 * Listar somente quando a heurística PascalCase do slug NÃO produz o export
 * real (ex.: slug "tree" → export "Tree" bate; slug "dropdown-menu" →
 * "DropdownMenu" bate; mas slug "3d-card-effect" → heurística falharia).
 *
 * Para componentes com export composto (ex.: vários subcomponentes), aponta-se
 * o export "raiz" mais representativo.
 */
const EXPORT_OVERRIDES: Record<string, string> = {
  // arquivo 3d-card, export raiz CardContainer
  "3d-card-effect": "CardContainer",
  // famílias/exports cujo PascalCase do slug não corresponde ao barrel:
  "dropdown-menu": "DropdownMenu",
  "code-block-command": "CodeBlockCommand",
  "work-experience-component": "WorkExperienceComponent",
  "chevrons-up-down-icon": "ChevronsUpDownIcon",
  "consent-manager": "ConsentManager",
  "copy-button": "CopyButton",
  "dot-grid-spotlight": "DotGridSpotlight",
  "elastic-slider": "ElasticSlider",
  "fluid-gradient-text": "FluidGradientText",
  "github-contributions": "GitHubContributions",
  "glow-card-grid": "GlowCardGrid",
  "icon-swap": "IconSwap",
  "middle-truncation": "MiddleTruncation",
  "mobius-loop-icon": "MobiusLoopIcon",
  "react-wheel-picker": "ReactWheelPicker",
  "scroll-fade-effect": "ScrollFadeEffect",
  "shimmering-text": "ShimmeringText",
  "slide-to-unlock": "SlideToUnlock",
  "theme-switcher": "ThemeSwitcher",
  "theme-toggle-effect": "ThemeToggleEffect",
  "toc-minimap": "TOCMinimap",
  // Fluid (sufixo -fluid → ...Fluid)
  "button-fluid": "ButtonFluid",
  "badge-fluid": "BadgeFluid",
  "slider-fluid": "SliderFluid",
  "switch-fluid": "SwitchFluid",
  "tooltip-fluid": "TooltipFluid",
  "table-fluid": "TableFluid",
  "file-thumbnail-fluid": "FileThumbnailFluid",
  "thinking-indicator-fluid": "ThinkingIndicatorFluid",
  "input-group-fluid": "InputGroupFluid",
  "input-copy-fluid": "InputCopyFluid",
  "tabs-subtle-fluid": "TabsSubtleFluid",
  "dropdown-fluid": "DropdownFluid",
  "accordion-fluid": "AccordionFluid",
  "radio-group-fluid": "RadioGroupFluid",
  "checkbox-group-fluid": "CheckboxGroupFluid",
  "select-fluid": "SelectFluid",
  "tabs-fluid": "TabsFluid",
  "dialog-fluid": "DialogFluid",
  "chat-message-fluid": "ChatMessageFluid",
  "thinking-steps-fluid": "ThinkingStepsFluid",
  "color-picker-fluid": "ColorPickerFluid",
  "ask-user-questions-fluid": "AskUserQuestionsFluid",
  "input-message-fluid": "InputMessageFluid",
  // VengenceUI
  "cyber-glitch-text": "CyberGlitchText",
  "animated-button": "AnimatedButton",
  "flip-fade-text": "FlipFadeText",
  "flip-text": "FlipText",
  "perspective-grid": "PerspectiveGrid",
  "glass-dock": "GlassDock",
  "creepy-button": "CreepyButton",
  "light-lines": "LightLines",
  "animated-number": "AnimatedNumber",
  "logo-slider": "LogoSlider",
  // Aceternity
  "expandable-cards": "ExpandableCards",
  "card-stack": "CardStack",
  "background-lines": "BackgroundLines",
  "background-beams-with-collision": "BackgroundBeamsWithCollision",
  "images-badge": "ImagesBadge",
  "parallax-hero-images": "ParallaxHeroImages",
  "background-ripple-effect": "BackgroundRippleEffect",
  "dotted-glow-background": "DottedGlowBackground",
  "background-boxes": "Boxes",
  "wavy-background": "WavyBackground",
  "background-beams": "BackgroundBeams",
  "svg-mask-effect": "MaskContainer",
  "card-hover-effect": "HoverEffect",
  "container-scroll-animation": "ContainerScroll",
  "hero-parallax": "HeroParallax",
  "sparkles": "SparklesCore",
  // React Flow (@xyflow/react) — wrapper tematizado da vitrine
  "react-flow": "ReactFlowDiagram",
}

/** Converte um slug kebab-case em PascalCase (heurística de export). */
function pascalCase(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("")
}

/**
 * Deriva os dados de instalação de um componente a partir do seu slug.
 * Defensivo: usa overrides explícitos quando existem, heurística caso contrário.
 */
export function getComponentInstall(slug: string): ComponentInstall {
  const file = FILE_OVERRIDES[slug] ?? slug
  const override = EXPORT_OVERRIDES[slug]
  const exportName = override ?? pascalCase(slug)
  return {
    importPath: `@/components/ui/${file}`,
    exportName,
    exportConfirmed: override !== undefined,
  }
}
