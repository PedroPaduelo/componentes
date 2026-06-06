/**
 * Derivação de "instalação" de um componente da vitrine — dados puros (sem UI).
 *
 * A vitrine NÃO publica os componentes no npm: o consumo é por cópia do arquivo
 * fonte. Então "instalação" aqui significa:
 *  1. o caminho de import correto (`@/components/ui/<arquivo>`) e o nome do
 *     export nomeado no barrel, derivados de forma DEFENSIVA do slug;
 *  2. (quando houver) o comando para instalar a(s) dependência(s) externa(s)
 *     que o componente exige por baixo.
 *
 * Princípio: NÃO inventar API. O nome do export é derivado por heurística
 * (PascalCase do slug) com um mapa de OVERRIDES explícito para os casos em que
 * o barrel diverge da heurística. Quando o export é meramente heurístico (não
 * confirmado por override), o campo `exportConfirmed` fica `false` para a UI
 * poder sinalizar isso honestamente.
 */

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
  /**
   * Comando de instalação da dependência externa, quando o componente exige
   * uma. `null` quando o componente é self-contained (só copiar o arquivo).
   */
  depCommand: string | null
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
}

/**
 * Dependências externas necessárias por slug (comando npm). Conservador:
 * só listar quando o componente claramente exige uma lib de runtime instalada.
 * A maioria dos componentes é self-contained (só usa React + Tailwind +
 * helpers locais), então não tem dep externa.
 */
const DEP_COMMANDS: Record<string, string> = {
  tree: "npm install @pierre/trees",
  "react-wheel-picker": "npm install @ncdai/react-wheel-picker",
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
    depCommand: DEP_COMMANDS[slug] ?? null,
  }
}
