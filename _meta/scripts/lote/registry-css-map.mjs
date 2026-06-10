/**
 * Mapa CURADO slug → CSS co-localizado (extraído de src/index.css).
 *
 * Cada bloco declara:
 *  - slugs:      componentes que dependem do CSS (1+).
 *  - themeVars:  { "--token": "valor" } → vira cssVars.theme do item shadcn
 *                (faz o Tailwind v4 gerar a utility `animate-<x>` no consumer).
 *  - cssText:    CSS bruto (keyframes / @utility / seletores) → convertido para
 *                o objeto aninhado que o `css` do registry-item espera.
 *
 * Fonte da verdade: src/index.css. Se um bloco mudar lá, atualize aqui.
 * O gerador (build-registry.mjs) cruza estes slugs com os arquivos reais e
 * loga em REVISAR_CSS qualquer componente que use animação custom não coberta.
 */

/** Nomes de animação que JÁ têm definição no index.css (token ou @utility). */
export const DEFINED_ANIMATIONS = new Set([
  "meteor-effect",
  "infinite-scroll",
  "aurora",
  "cell-ripple",
  "shimmer",
  // @utility animate-first..fifth (background-gradient-animation)
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  // keyframes próprios embutidos abaixo (accordion / input-otp / spotlight)
  "accordion-up",
  "accordion-down",
  "caret-blink",
  "spotlight",
])

/** Animações nativas do Tailwind (não precisam de CSS no registry). */
export const BUILTIN_ANIMATIONS = new Set(["spin", "ping", "pulse", "bounce"])

/**
 * Animações REFERENCIADAS por componentes mas SEM definição no projeto
 * (dependem de tw-animate-css / tailwindcss-animate que NÃO está instalado,
 * ou simplesmente não foram definidas). Servem para o REVISAR_CSS.
 */
export const UNDEFINED_IN_SOURCE = new Set([
  // animate-in / animate-out vêm do plugin tw-animate-css (overlays Radix);
  // documentados na página de instalação, não embutidos no registry.
  "in",
  "out",
])

export const CSS_BLOCKS = [
  // ── Aceternity — Meteors ────────────────────────────────────────────
  {
    slugs: ["meteors"],
    themeVars: { "--animate-meteor-effect": "meteor-effect 5s linear infinite" },
    cssText: `
@keyframes meteor-effect {
  0% { transform: rotate(215deg) translateX(0); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
}`,
  },

  // ── Aceternity — Aurora Background ──────────────────────────────────
  {
    slugs: ["aurora-background"],
    themeVars: { "--animate-aurora": "aurora 60s linear infinite" },
    cssText: `
@keyframes aurora {
  from { background-position: 50% 50%, 50% 50%; }
  to { background-position: 350% 50%, 350% 50%; }
}`,
  },

  // ── Aceternity — Infinite Moving Cards ──────────────────────────────
  {
    slugs: ["infinite-moving-cards"],
    themeVars: {
      "--animate-infinite-scroll":
        "infinite-scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
    },
    cssText: `
@keyframes infinite-scroll {
  to { transform: translate(calc(-50% - 0.5rem)); }
}`,
  },

  // ── Aceternity — Background Ripple Effect ───────────────────────────
  {
    slugs: ["background-ripple-effect"],
    themeVars: {
      "--animate-cell-ripple":
        "cell-ripple var(--duration, 200ms) ease-out none 1 var(--delay, 0ms)",
    },
    cssText: `
@keyframes cell-ripple {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}`,
  },

  // ── Aceternity — Background Gradient Animation ──────────────────────
  {
    slugs: ["background-gradient-animation"],
    cssText: `
@keyframes bga-moveInCircle {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}
@keyframes bga-moveVertical {
  0% { transform: translateY(-50%); }
  50% { transform: translateY(50%); }
  100% { transform: translateY(-50%); }
}
@keyframes bga-moveHorizontal {
  0% { transform: translateX(-50%) translateY(-10%); }
  50% { transform: translateX(50%) translateY(10%); }
  100% { transform: translateX(-50%) translateY(-10%); }
}
@utility animate-first { animation: bga-moveVertical 30s ease infinite; }
@utility animate-second { animation: bga-moveInCircle 20s reverse infinite; }
@utility animate-third { animation: bga-moveInCircle 40s linear infinite; }
@utility animate-fourth { animation: bga-moveHorizontal 40s ease infinite; }
@utility animate-fifth { animation: bga-moveInCircle 20s ease infinite; }`,
  },

  // ── Shimmering Text ─────────────────────────────────────────────────
  {
    slugs: ["shimmering-text"],
    cssText: `
@keyframes shimmer {
  to { background-position: 200% center; }
}
.animate-shimmer {
  animation: shimmer 2s linear infinite;
}`,
  },

  // ── Button (Fluid) — loading spinner ────────────────────────────────
  {
    slugs: ["button-fluid"],
    cssText: `
@keyframes spinner-move {
  to { stroke-dashoffset: -100; }
}
@keyframes spinner-dash {
  0%, 100% { stroke-dasharray: 15 85; }
  50% { stroke-dasharray: 40 60; }
}`,
  },

  // ── Slide to Unlock — letter shimmer wave ───────────────────────────
  {
    slugs: ["slide-to-unlock"],
    cssText: `
@keyframes slide-to-unlock-letter {
  0%, 100% { color: var(--slide-to-unlock-letter-color, var(--muted-foreground)); }
  40% { color: color-mix(in oklab, var(--slide-to-unlock-letter-highlight, var(--foreground)) 60%, transparent); }
}
.slide-to-unlock-letter {
  animation: slide-to-unlock-letter 2.4s ease-in-out infinite;
  animation-delay: var(--slide-to-unlock-letter-delay, 0s);
  display: inline-block;
  white-space: pre;
}`,
  },

  // ── Theme Toggle Effect — view-transition gradient ──────────────────
  {
    slugs: ["theme-toggle-effect"],
    cssText: `
::view-transition-old(root) {
  mix-blend-mode: normal;
}
::view-transition-new(root) {
  background: linear-gradient(45deg, oklch(0.55 0.18 265), oklch(0.7 0.18 200));
  mix-blend-mode: normal;
}`,
  },

  // ── React Wheel Picker — cor dos items ──────────────────────────────
  {
    slugs: ["react-wheel-picker"],
    cssText: `
[data-slot="react-wheel-picker"] [data-slot="option-item"] {
  color: color-mix(in oklab, var(--foreground) 65%, transparent);
}`,
  },

  // ── Thinking Indicator/Steps (Fluid) — shimmer text ─────────────────
  {
    slugs: ["thinking-indicator-fluid", "thinking-steps-fluid"],
    cssText: `
@keyframes thinking-shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: 100% 0; }
}
.thinking-shimmer-text {
  color: transparent;
  background: linear-gradient(90deg, #a3a3a3 0%, #a3a3a3 35%, #525252 50%, #a3a3a3 65%, #a3a3a3 100%);
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  animation: thinking-shimmer 1.5s ease-in-out infinite;
}`,
  },

  // ── Flip Text — 3D flip por caractere ───────────────────────────────
  {
    slugs: ["flip-text"],
    cssText: `
.flip-char {
  color: inherit;
  -webkit-text-fill-color: transparent;
  height: 1.2em;
  line-height: 1.2em;
  vertical-align: middle;
  animation: flip var(--flip-duration, 2.2s) var(--flip-delay, 0s) var(--flip-iteration, infinite) ease;
}
.flip-char::before, .flip-char::after {
  color: inherit;
  -webkit-text-fill-color: currentColor;
  content: attr(data-char);
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  animation: fade var(--flip-duration, 2.2s) var(--flip-delay, 0s) var(--flip-iteration, infinite) ease;
}
.flip-char::after {
  transform: translate(-50%, -50%) translateZ(0.6em);
}
.flip-char::before {
  transform: translate(-50%, -50%) rotateX(-90deg) translateZ(0.6em);
  opacity: 0;
  --opacity: 1;
}
@keyframes flip {
  0%, 60% { transform: rotateX(0); }
  60%, 100% { transform: rotateX(-90deg); }
}
@keyframes fade {
  0%, 60% { opacity: 1; }
  60%, 100% { opacity: 0; }
}`,
  },

  // ── Tree (@pierre/trees overrides + altura) ─────────────────────────
  {
    slugs: ["tree"],
    cssText: `
[data-slot="tree"] {
  --trees-height: 420px;
  height: var(--trees-height);
  min-height: 12rem;
  display: flex;
  flex-direction: column;
}
[data-slot="tree"] > file-tree-container {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  width: 100%;
}
[data-slot="tree"][data-theme="light"] {
  --trees-fg-override: var(--foreground);
  --trees-fg-muted-override: var(--muted-foreground);
  --trees-bg-override: var(--background);
  --trees-bg-muted-override: var(--muted);
  --trees-accent-override: oklch(0.55 0.18 250);
  --trees-border-color-override: var(--border);
  --trees-focus-ring-color-override: var(--ring);
  --trees-search-fg-override: var(--foreground);
  --trees-search-bg-override: var(--muted);
  --trees-input-bg-override: var(--input);
  --trees-selected-fg-override: var(--accent-foreground);
  --trees-selected-bg-override: color-mix(in oklab, var(--accent) 35%, transparent);
  --trees-scrollbar-thumb-override: color-mix(in oklab, var(--muted-foreground) 25%, transparent);
}
[data-slot="tree"][data-theme="dark"] {
  --trees-fg-override: var(--foreground);
  --trees-fg-muted-override: var(--muted-foreground);
  --trees-bg-override: var(--background);
  --trees-bg-muted-override: var(--muted);
  --trees-accent-override: oklch(0.72 0.15 230);
  --trees-border-color-override: var(--border);
  --trees-focus-ring-color-override: var(--ring);
  --trees-search-fg-override: var(--foreground);
  --trees-search-bg-override: var(--muted);
  --trees-input-bg-override: var(--input);
  --trees-selected-fg-override: var(--accent-foreground);
  --trees-selected-bg-override: color-mix(in oklab, var(--accent) 35%, transparent);
  --trees-scrollbar-thumb-override: color-mix(in oklab, var(--muted-foreground) 25%, transparent);
}`,
  },

  // ── Perspective Grid (VengenceUI) — tiles ───────────────────────────
  {
    slugs: ["perspective-grid"],
    cssText: `
.tile {
  min-width: 1px;
  min-height: 1px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.2);
  background-color: transparent;
  box-sizing: border-box;
}
.dark .tile {
  border-color: rgba(255, 255, 255, 0.15);
}
.tile:nth-child(4n):hover { background-color: rgb(248 113 113); }
.tile:nth-child(4n + 1):hover { background-color: rgb(56 189 248); }
.tile:nth-child(4n + 2):hover { background-color: rgb(74 222 128); }
.tile:nth-child(4n + 3):hover { background-color: rgb(253 224 71); }
.tile:nth-child(7n):hover { background-color: rgb(56 189 248); }
.tile:nth-child(7n + 3):hover { background-color: rgb(74 222 128); }
.tile:nth-child(7n + 5):hover { background-color: rgb(253 224 71); }
.tile:nth-child(7n + 6):hover { background-color: rgb(248 113 113); }
.tile:nth-child(11n + 1):hover { background-color: rgb(248 113 113); }
.tile:nth-child(11n + 4):hover { background-color: rgb(56 189 248); }
.tile:nth-child(11n + 7):hover { background-color: rgb(74 222 128); }
.tile:nth-child(11n + 10):hover { background-color: rgb(253 224 71); }`,
  },

  // ── Glass Dock (VengenceUI) — glass border ──────────────────────────
  {
    slugs: ["glass-dock"],
    cssText: `
.glass-border {
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.dark .glass-border {
  border: 1px solid rgba(255, 255, 255, 0.2);
}`,
  },

  // ── Logo Slider (VengenceUI) — marquee ──────────────────────────────
  {
    slugs: ["logo-slider"],
    cssText: `
.logo-slider {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  overflow: hidden;
}
.logo-slider__container {
  display: flex;
  width: fit-content;
  align-items: center;
  overflow: visible;
  -webkit-mask-image: linear-gradient(to right, transparent, black 12.5%, black 87.5%, transparent);
  mask-image: linear-gradient(to right, transparent, black 12.5%, black 87.5%, transparent);
}
.logo-slider__item {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--logo-slider-gap, 64px);
  padding-inline: calc(var(--logo-slider-gap, 64px) / 2);
}
.logo-slider__blur {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: 12.5%;
  pointer-events: none;
}
.logo-slider__blur--left { left: 0; }
.logo-slider__blur--right { right: 0; }
.logo-slider__blur > div {
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.logo-slider__blur--left > div {
  -webkit-mask-image: linear-gradient(to right, black, transparent);
  mask-image: linear-gradient(to right, black, transparent);
}
.logo-slider__blur--right > div {
  -webkit-mask-image: linear-gradient(to left, black, transparent);
  mask-image: linear-gradient(to left, black, transparent);
}
@media (prefers-reduced-motion: no-preference) {
  .logo-slider__item {
    animation: logo-slider-slide var(--logo-slider-duration, 40s) linear infinite;
  }
  .logo-slider[data-direction="right"] .logo-slider__item {
    animation-direction: reverse;
  }
  .logo-slider[data-pause-on-hover="true"]:hover .logo-slider__item {
    animation-play-state: paused;
  }
}
@keyframes logo-slider-slide {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--logo-slider-gap, 64px))); }
}`,
  },

  // ── Tabs Subtle (Fluid) — scrollbar-hide ────────────────────────────
  {
    slugs: ["tabs-subtle-fluid"],
    cssText: `
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}`,
  },

  // ── Accordion (shadcn) — expand/collapse animado ────────────────────
  // Keyframes padrão shadcn. Não estavam no src/index.css da vitrine
  // (a animação dependia do tw-animate-css); aqui ficam EMBUTIDOS no item
  // p/ o consumer animar sem precisar de plugin extra.
  {
    slugs: ["accordion"],
    themeVars: {
      "--animate-accordion-down": "accordion-down 0.2s ease-out",
      "--animate-accordion-up": "accordion-up 0.2s ease-out",
    },
    cssText: `
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}`,
  },

  // ── Input OTP (shadcn) — cursor piscando ────────────────────────────
  {
    slugs: ["input-otp"],
    themeVars: {
      "--animate-caret-blink": "caret-blink 1.25s ease-out infinite",
    },
    cssText: `
@keyframes caret-blink {
  0%, 70%, 100% { opacity: 1; }
  20%, 50% { opacity: 0; }
}`,
  },

  // ── Spotlight (Aceternity) — fade-in do facho de luz ────────────────
  {
    slugs: ["spotlight"],
    themeVars: {
      "--animate-spotlight": "spotlight 2s ease 0.75s 1 forwards",
    },
    cssText: `
@keyframes spotlight {
  0% { opacity: 0; transform: translate(-72%, -62%) scale(0.5); }
  100% { opacity: 1; transform: translate(-50%, -40%) scale(1); }
}`,
  },

  // ── React Flow (@xyflow/react) — tema via tokens shadcn ─────────────
  // Sobrescreve as CSS variables --xy-* com tokens do tema (light/dark
  // reativo). Espelha o bloco [data-slot="react-flow"] de src/index.css.
  {
    slugs: ["react-flow"],
    cssText: `
[data-slot="react-flow"] {
  --xy-node-background-color: var(--card);
  --xy-node-color: var(--card-foreground);
  --xy-node-border: 1px solid var(--border);
  --xy-node-border-radius: var(--radius);
  --xy-node-boxshadow-hover: 0 1px 4px 1px color-mix(in oklab, var(--foreground) 10%, transparent);
  --xy-node-boxshadow-selected: 0 0 0 1px var(--ring);
  --xy-node-group-background-color: color-mix(in oklab, var(--muted) 40%, transparent);
  --xy-edge-stroke: var(--muted-foreground);
  --xy-edge-stroke-selected: var(--primary);
  --xy-edge-label-background-color: var(--card);
  --xy-edge-label-color: var(--card-foreground);
  --xy-connectionline-stroke: var(--primary);
  --xy-handle-background-color: var(--primary);
  --xy-handle-border-color: var(--background);
  --xy-controls-button-background-color: var(--card);
  --xy-controls-button-background-color-hover: var(--accent);
  --xy-controls-button-color: var(--card-foreground);
  --xy-controls-button-color-hover: var(--accent-foreground);
  --xy-controls-button-border-color: var(--border);
  --xy-controls-box-shadow: 0 0 2px 1px color-mix(in oklab, var(--foreground) 8%, transparent);
  --xy-minimap-background-color: var(--muted);
  --xy-minimap-mask-background-color: color-mix(in oklab, var(--background) 65%, transparent);
  --xy-minimap-node-background-color: var(--muted-foreground);
  --xy-background-pattern-dots-color: var(--border);
  --xy-background-pattern-lines-color: var(--border);
  --xy-background-pattern-cross-color: var(--border);
  --xy-selection-background-color: color-mix(in oklab, var(--primary) 10%, transparent);
  --xy-selection-border: 1px dotted color-mix(in oklab, var(--primary) 70%, transparent);
  --xy-attribution-background-color: color-mix(in oklab, var(--background) 50%, transparent);
}`,
  },
]
