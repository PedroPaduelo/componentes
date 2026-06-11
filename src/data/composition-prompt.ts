/**
 * Geração de PROMPT e comando de instalação para COMPOSIÇÕES (blocos).
 *
 * Cada composição da vitrine é instalável como um "bloco" no formato registry
 * do shadcn: um único `npx shadcn@latest add <BASE>/r/<slug>.json` baixa a tela
 * inteira + todos os componentes da vitrine que ela usa (registryDependencies).
 *
 * Este módulo (puro, sem React) expõe:
 *  - `getCompositionAddCommand(slug)` — comando de instalação do bloco;
 *  - `getCompositionExportName(slug)` — nome do export PascalCase da tela;
 *  - `buildCompositionPrompt(composition)` — markdown que direciona uma IA a
 *    USAR A SKILL `vitrine-ui-compositions` e instalar/renderizar o bloco.
 *
 * O JSON do bloco é gerado por `_meta/scripts/lote/build-compositions-registry.mjs`
 * e servido em `public/r/<slug>.json`.
 */

import { REGISTRY_BASE_URL } from "@/data/component-install"
import { COMPOSITIONS_SKILL } from "@/data/ai-skills"
import { type Composition } from "@/data/compositions"

/** Comando canônico de instalação do bloco da composição. */
export function getCompositionAddCommand(slug: string): string {
  return `npx shadcn@latest add ${REGISTRY_BASE_URL}/r/${slug}.json`
}

/** Converte um slug kebab-case em PascalCase (nome do export da tela). */
export function getCompositionExportName(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("")
}

/** Bloco de código markdown com a linguagem informada. */
function codeBlock(language: string, body: string): string {
  return "```" + language + "\n" + body + "\n```"
}

/**
 * Monta o prompt (markdown) do botão "Copiar prompt para IA" de cada
 * composição. O foco é DIRECIONAR a IA a usar a skill correta e instalar o
 * bloco — não montar a tela do zero.
 */
export function buildCompositionPrompt(composition: Composition): string {
  const { slug, name, description } = composition
  const exportName = getCompositionExportName(slug)
  const addCommand = getCompositionAddCommand(slug)
  const category = composition.category ?? "Aplicação"

  const lines: string[] = []

  lines.push(`# Tarefa: instalar a composição "${name}" da Vitrine UI`)
  lines.push("")
  lines.push(
    `Use a skill **${COMPOSITIONS_SKILL.slug}** da Vitrine UI (instruções em ${COMPOSITIONS_SKILL.url}) para instalar esta TELA pronta como um bloco e adaptá-la ao pedido — NÃO recrie a tela do zero.`,
  )
  lines.push("")

  lines.push("## O que é este bloco")
  lines.push(description)
  lines.push("")
  lines.push(`- Slug do bloco: \`${slug}\``)
  lines.push(`- Categoria: ${category}`)
  lines.push(`- Preview: ${REGISTRY_BASE_URL}/compositions/${slug}`)
  lines.push("")

  lines.push("## Passos")
  lines.push(
    "1. Pré-requisito (uma vez por projeto): `npx shadcn@latest init` (Tailwind v4 + shadcn).",
  )
  lines.push(
    "2. Instale o bloco inteiro — baixa a tela e instala automaticamente todos os componentes da vitrine que ela usa:",
  )
  lines.push(codeBlock("bash", addCommand))
  lines.push("3. Renderize a tela:")
  lines.push(
    codeBlock(
      "tsx",
      `import { ${exportName} } from "@/compositions/${slug}"\n\nexport default function Page() {\n  return <${exportName} />\n}`,
    ),
  )
  lines.push(
    "4. Personalize textos, dados e seções conforme o pedido — é TSX comum usando `@/components/ui/*` e tokens shadcn (light/dark já tratados).",
  )
  lines.push("")

  lines.push("## Regras")
  lines.push("- Parta SEMPRE deste bloco; não reescreva a tela do zero.")
  lines.push(
    "- O alias `@/` precisa estar no `tsconfig.json` da raiz (`@/* → ./src/*`).",
  )
  lines.push(
    `- Catálogo completo para IA: ${REGISTRY_BASE_URL}/llms.txt — Skill: ${COMPOSITIONS_SKILL.url}`,
  )

  return lines.join("\n")
}
