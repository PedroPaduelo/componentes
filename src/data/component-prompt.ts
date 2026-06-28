/**
 * Geração de PROMPT para IAs — markdown estruturado com tudo que a IA precisa
 * pra trabalhar com um componente da vitrine.
 *
 * O botão "Copiar prompt" no topo de cada página de componente consome
 * {@link buildComponentPrompt} para montar o markdown que vai pro clipboard.
 *
 * Decisões de design:
 *  - Função PURA (sem React, sem hooks) — recebe um `Family` já resolvido e
 *    devolve uma string. Isso permite testar/inspecionar o output sem montar UI.
 *  - Reutiliza `getComponentInstall` / `getRegistryAddCommand` de
 *    `component-install.ts` (uma única fonte da verdade pro install/import).
 *  - Reutiliza `buildUsageTip` aqui mesmo (extraído de FamilyDetail.tsx em
 *    2026-06-09) — não duplica a lógica de dica de uso entre as duas camadas.
 *  - O slug representativo (`family.representativeSlug`) dirige install/import;
 *    o "Exemplo de uso" usa o PRIMEIRO example da primeira variante (ordem
 *    de origem do registry, conforme `groupByFamily`).
 */

import {
  REGISTRY_BASE_URL,
  getComponentInstall,
  getRegistryAddCommand,
} from "@/data/component-install"
import { type ComponentMeta } from "@/data/components"
import { getExamplesBySlug, type Example } from "@/data/examples"
import {
  getOrigin,
  type ComponentOrigin,
  type Family,
} from "@/data/families"
import { GROUP_BY_ID, getGroup } from "@/data/groups"

/**
 * Gera um parágrafo curto de "quando usar / boas práticas".
 *
 * Prioriza o texto curado em `variant.usage` (registry). Quando ausente, cai
 * no fallback derivado de description + tags — que NÃO inventa API nem props,
 * só recombina os metadados existentes em uma frase orientativa.
 *
 * Mesma implementação da função original em `FamilyDetail.tsx`, extraída pra
 * cá em 2026-06-09 para reuso entre a UI e o builder de prompt.
 */
export function buildUsageTip(
  variant: ComponentMeta,
  origin: ComponentOrigin,
): string {
  if (variant.usage && variant.usage.trim().length > 0) {
    return variant.usage.trim()
  }
  const keywords = variant.tags
    .filter((t) => t !== "fluid" && t !== origin.toLowerCase())
    .slice(0, 3)
  const keywordPart =
    keywords.length > 0
      ? ` Boa escolha em contextos de ${keywords.join(", ")}.`
      : ""
  const originPart =
    origin === "shadcn"
      ? ""
      : ` Variante ${origin}, indicada quando você quer o acabamento visual dessa coleção.`
  return `${variant.description}${keywordPart}${originPart}`
}

/** URL canônica de uma página de componente, dado o slug. */
function componentUrl(slug: string): string {
  return `${REGISTRY_BASE_URL}/components/${slug}`
}

/** Bloco de código em markdown com a linguagem correta. */
function codeBlock(language: string, body: string): string {
  return "```" + language + "\n" + body + "\n```"
}

/** Resolve o primeiro `Example` da primeira variante da família. */
function firstExample(family: Family): Example | undefined {
  const first = family.variants[0]
  if (!first) return undefined
  const items = getExamplesBySlug(first.slug)
  return items?.[0]
}

/**
 * Constrói o markdown de "prompt pra IA" para uma família de componentes.
 *
 * Formato exato (ver briefing):
 *
 *   # Componente: <family.name>
 *   - Grupo: <group.label>
 *   - Origem: <origins.join(", ")>
 *   - URL: https://.../components/<base>
 *   - Slug: <base>
 *
 *   ## Descrição
 *   <representative.description>
 *
 *   ## Tags
 *   <tags.join(", ")>
 *
 *   ## Como instalar
 *   ```bash
 *   npx shadcn@latest add <REGISTRY_BASE_URL>/r/<slug>.json
 *   ```
 *
 *   ## Como importar
 *   ```tsx
 *   import { <install.exportName> } from "<install.importPath>"
 *   ```
 *
 *   ## Exemplo de uso (primeiro example — <variant.name>)
 *   ```tsx
 *   <exemplo.code do primeiro example, se existir>
 *   ```
 *
 *   ## Dica de uso
 *   <buildUsageTip(family.variants[0], origin)>
 *
 *   ## Variantes nesta família
 *   <lista bullet "- <name> (<slug>) — <origin>" para cada variant>
 *
 *   ## Mais
 *   - Página de instalação da vitrine: https://.../instalacao
 *   - Repositório: https://github.com/PedroPaduelo/componentes
 */
export function buildComponentPrompt(family: Family): string {
  const representative = family.variants[0]
  const install = getComponentInstall(family.representativeSlug)
  const origin = getOrigin(family.representativeSlug, representative.tags)
  const example = firstExample(family)

  const lines: string[] = []

  // Cabeçalho + metadados em bullet list
  lines.push(`# Componente: ${family.name}`)
  lines.push(`- Grupo: ${GROUP_BY_ID[getGroup(family.representativeSlug)].label}`)
  lines.push(`- Origem: ${family.origins.join(", ")}`)
  lines.push(`- URL: ${componentUrl(family.base)}`)
  lines.push(`- Slug: ${family.base}`)
  lines.push("")

  // Descrição (a do representativo)
  lines.push("## Descrição")
  lines.push(representative.description)
  lines.push("")

  // Tags
  lines.push("## Tags")
  lines.push(representative.tags.join(", "))
  lines.push("")

  // Como instalar (comando canônico do registry)
  lines.push("## Como instalar")
  lines.push(
    codeBlock("bash", getRegistryAddCommand(family.representativeSlug)),
  )
  lines.push("")

  // Como importar
  lines.push("## Como importar")
  lines.push(
    codeBlock(
      "tsx",
      `import { ${install.exportName} } from "${install.importPath}"`,
    ),
  )
  lines.push("")

  // Exemplo de uso (omitido se a família não tem examples)
  if (example) {
    lines.push(
      `## Exemplo de uso (primeiro example — ${representative.name})`,
    )
    lines.push(codeBlock("tsx", example.code))
    lines.push("")
  }

  // Dica de uso (reusa buildUsageTip)
  lines.push("## Dica de uso")
  lines.push(buildUsageTip(representative, origin))
  lines.push("")

  // Variantes (omitido se só uma)
  if (family.variants.length > 1) {
    lines.push("## Variantes nesta família")
    for (const variant of family.variants) {
      const variantOrigin = getOrigin(variant.slug, variant.tags)
      lines.push(`- ${variant.name} (${variant.slug}) — ${variantOrigin}`)
    }
    lines.push("")
  }

  // Mais
  lines.push("## Mais")
  lines.push(
    `- Página de instalação da vitrine: ${REGISTRY_BASE_URL}/instalacao`,
  )
  lines.push("- Repositório: https://github.com/PedroPaduelo/componentes")

  return lines.join("\n")
}
