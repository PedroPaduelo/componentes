/**
 * Camada de derivação de FAMÍLIA e ORIGEM — dados puros (sem UI).
 *
 * A vitrine tem um card por slug no catálogo. Para clusterizar componentes
 * por "família" (nome-base) — ex.: `button` + `button-fluid` viram a família
 * "Button" — e indicar de qual biblioteca cada variante vem, este módulo
 * expõe helpers puros e testáveis que NÃO duplicam nenhum dado no registry.
 *
 * Decisão de design: NÃO criar campo `family` em `ComponentMeta`. A família é
 * SEMPRE derivada do slug (remoção de sufixo `-fluid` + mapa de normalização
 * revisável). Assim o registry permanece a única fonte da verdade.
 *
 * Toda UI futura de agrupamento (catálogo / página de família) consome estes
 * helpers em vez de reimplementar a lógica.
 */

import { components, type ComponentMeta } from "@/data/components"

/** As quatro origens canônicas de componentes da vitrine. */
export type ComponentOrigin = "shadcn" | "Fluid" | "chanhdai" | "@pierre/trees"

/**
 * Conjunto de slugs cuja origem é a coleção do chanhdai.com.
 *
 * É hardcoded de propósito (em vez de inferido por tag) para não sofrer
 * regressão silenciosa caso um slug seja renomeado: a classificação é
 * explícita e auditável. REVISÁVEL — ao adicionar um componente do chanhdai,
 * inclua o slug aqui.
 *
 * São 20 slugs (a varredura do registry confirma: 9 shadcn + 1 @pierre/trees
 * + 20 chanhdai + 23 Fluid = 53).
 */
export const ORIGIN_OVERRIDES: ReadonlySet<string> = new Set<string>([
  "chevrons-up-down-icon",
  "code-block-command",
  "dot-grid-spotlight",
  "fluid-gradient-text",
  "glow-card-grid",
  "icon-swap",
  "react-wheel-picker",
  "shimmering-text",
  "theme-toggle-effect",
  "mobius-loop-icon",
  "scroll-fade-effect",
  "slide-to-unlock",
  "theme-switcher",
  "consent-manager",
  "copy-button",
  "elastic-slider",
  "github-contributions",
  "middle-truncation",
  "toc-minimap",
  "work-experience-component",
])

/**
 * Mapa de normalização EXPLÍCITO e REVISÁVEL: slug → base canônico da família.
 *
 * Aplicado por `getFamilyBase` DEPOIS da remoção do sufixo `-fluid`. Tanto o
 * slug original quanto o slug sem sufixo são consultados como chave (fallback),
 * então é possível registrar tanto a forma `-fluid` quanto a forma base.
 *
 * Casos cobertos (decisões fechadas com o usuário):
 *  - `dropdown-menu`      → `dropdown`  (shadcn nomeia "dropdown-menu")
 *  - `tabs-subtle-fluid`  → `tabs`      (variante sutil das abas Fluid)
 *  - `tabs-fluid`         → `tabs`
 *  - `input-group-fluid`  → `input`     (4 variações de input agrupam em "input")
 *  - `input-copy-fluid`   → `input`
 *  - `input-message-fluid`→ `input`
 *  - `checkbox-group-fluid`→ `checkbox` (sem "group" no base, p/ simetria)
 *  - `radio-group-fluid`  → `radio`     (idem; `radio-group` também mapeia)
 *  - `radio-group`        → `radio`
 *
 * A regra geral de remover `-fluid` cobre o resto (ex.: `button-fluid` → `button`).
 */
export const FAMILY_BASE_MAP: Record<string, string> = {
  "dropdown-menu": "dropdown",
  "tabs-subtle-fluid": "tabs",
  "tabs-fluid": "tabs",
  "tabs-subtle": "tabs",
  "input-group-fluid": "input",
  "input-copy-fluid": "input",
  "input-message-fluid": "input",
  "input-group": "input",
  "input-copy": "input",
  "input-message": "input",
  "checkbox-group-fluid": "checkbox",
  "checkbox-group": "checkbox",
  "radio-group-fluid": "radio",
  "radio-group": "radio",
}

/**
 * Família agrupada de componentes (uma ou mais variantes sob o mesmo base).
 */
export interface Family {
  /** Base canônico (ex.: "button", "input", "dropdown"). */
  base: string
  /** Nome legível da família (ex.: base "dropdown" → "Dropdown"). */
  name: string
  /** Variantes da família, ordenadas por origem (shadcn → Fluid → ...). */
  variants: ComponentMeta[]
  /** Origens distintas presentes na família (na ordem de prioridade). */
  origins: ComponentOrigin[]
  /** Slug representativo (primeira variante após ordenação) — para deep-link. */
  representativeSlug: string
}

/**
 * Deriva a ORIGEM de um componente a partir do seu slug (e tags opcionais).
 *
 * Prioridade:
 *  1. termina em `-fluid` OU tem a tag "fluid" → "Fluid";
 *  2. slug em {@link ORIGIN_OVERRIDES} → "chanhdai";
 *  3. slug === "tree" → "@pierre/trees";
 *  4. caso contrário → "shadcn".
 *
 * A tag "fluid" é usada como reforço (todos os slugs `-fluid` do registro a
 * possuem), mas a regra de sufixo basta para a derivação por slug puro.
 */
export function getOrigin(slug: string, tags?: readonly string[]): ComponentOrigin {
  if (slug.endsWith("-fluid") || (tags?.includes("fluid") ?? false)) return "Fluid"
  if (ORIGIN_OVERRIDES.has(slug)) return "chanhdai"
  if (slug === "tree") return "@pierre/trees"
  return "shadcn"
}

/**
 * Deriva o BASE canônico da família a partir do slug.
 *
 * Algoritmo:
 *  1. consulta {@link FAMILY_BASE_MAP} pelo slug original (cobre `dropdown-menu`,
 *     `radio-group`, etc. mesmo sem sufixo `-fluid`);
 *  2. remove o sufixo `-fluid`;
 *  3. consulta o mapa de novo pelo slug sem sufixo (fallback);
 *  4. retorna o slug sem sufixo como base padrão.
 */
export function getFamilyBase(slug: string): string {
  const mapped = FAMILY_BASE_MAP[slug]
  if (mapped) return mapped
  const withoutSuffix = slug.replace(/-fluid$/, "")
  return FAMILY_BASE_MAP[withoutSuffix] ?? withoutSuffix
}

/** Ordem de prioridade das origens (shadcn primeiro, depois Fluid, etc.). */
const ORIGIN_ORDER: readonly ComponentOrigin[] = [
  "shadcn",
  "Fluid",
  "chanhdai",
  "@pierre/trees",
]

/** Índice numérico da origem para ordenação estável. */
function originRank(origin: ComponentOrigin): number {
  const i = ORIGIN_ORDER.indexOf(origin)
  return i === -1 ? ORIGIN_ORDER.length : i
}

/**
 * Transforma um base canônico em nome legível.
 * Ex.: "dropdown" → "Dropdown"; "color-picker" → "Color Picker".
 */
function humanizeBase(base: string): string {
  return base
    .split("-")
    .map((part) => (part.length === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join(" ")
}

/**
 * Monta uma {@link Family} a partir de um base e suas variantes (já filtradas).
 * Ordena as variantes por origem (shadcn → Fluid → ...) de forma estável.
 */
function buildFamily(base: string, variants: ComponentMeta[]): Family {
  const sorted = [...variants].sort(
    (a, b) => originRank(getOrigin(a.slug, a.tags)) - originRank(getOrigin(b.slug, b.tags)),
  )
  const origins: ComponentOrigin[] = []
  for (const v of sorted) {
    const o = getOrigin(v.slug, v.tags)
    if (!origins.includes(o)) origins.push(o)
  }
  const first = sorted[0]
  return {
    base,
    name: humanizeBase(base),
    variants: sorted,
    origins,
    representativeSlug: first.slug,
  }
}

/**
 * Retorna a {@link Family} completa de um slug: todas as variantes irmãs
 * (mesmo base) agregadas e ordenadas. Lança erro se o slug não existir no
 * registry (uso pelos consumidores deve garantir slugs válidos).
 */
export function getFamily(slug: string): Family {
  const base = getFamilyBase(slug)
  const variants = components.filter((c) => getFamilyBase(c.slug) === base)
  if (variants.length === 0) {
    throw new Error(`getFamily: nenhuma variante encontrada para base "${base}" (slug "${slug}")`)
  }
  return buildFamily(base, variants)
}

/**
 * Agrupa uma lista de componentes por família.
 *
 * @param list - lista de componentes (default: registry completo).
 * @returns famílias ordenadas alfabeticamente por base (estável entre chamadas).
 */
export function groupByFamily(list: ComponentMeta[] = components): Family[] {
  const buckets = new Map<string, ComponentMeta[]>()
  for (const c of list) {
    const base = getFamilyBase(c.slug)
    const bucket = buckets.get(base)
    if (bucket) bucket.push(c)
    else buckets.set(base, [c])
  }
  return [...buckets.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((base) => buildFamily(base, buckets.get(base) ?? []))
}
