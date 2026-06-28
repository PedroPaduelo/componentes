/**
 * build-ai-assets.mjs — gera o índice legível por IA da vitrine.
 *
 * Saída: `public/llms.txt` — um índice markdown (padrão llms.txt) com TODOS os
 * componentes e composições, cada um com nome, categoria, descrição curta e o
 * comando de instalação via registry. Serve para uma IA (Claude, Cursor, etc.)
 * descobrir o que existe e como instalar, fazendo um único fetch da URL pública.
 *
 * As "skills" (public/skills/*.md) são CONTEÚDO autoral (instruções de processo)
 * e NÃO são geradas aqui — elas apontam para este llms.txt.
 *
 * Fonte da verdade: src/data/components.ts + src/data/compositions.ts (parse por
 * regex, mesma abordagem do build-registry.mjs).
 */

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../../..")
const SRC = resolve(ROOT, "src")
const HOMEPAGE = "https://ui-list-ui-componets-cmqcdlm7.cloud.serendiped.com"
const read = (p) => readFileSync(p, "utf8")

function unescapeStr(s) {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, " ")
}

/** Coleta os campos string concatenados de um campo do tipo `field:` num chunk. */
function fieldText(chunk, field, stopFields) {
  const stop = stopFields.join("|")
  const re = new RegExp(`${field}:\\s*([\\s\\S]*?)\\n\\s*(?:${stop}):`)
  const m = chunk.match(re)
  if (!m) return ""
  const segs = m[1].match(/"((?:[^"\\]|\\.)*)"/g) || []
  return segs.map((s) => unescapeStr(s.slice(1, -1))).join("")
}

function parseEntries(file) {
  const txt = read(resolve(SRC, file))
  const slugRe = /slug:\s*"([^"]+)"/g
  const matches = []
  let m
  while ((m = slugRe.exec(txt))) matches.push({ slug: m[1], at: m.index })
  const out = []
  for (let i = 0; i < matches.length; i++) {
    const { slug, at } = matches[i]
    const end = i + 1 < matches.length ? matches[i + 1].at : txt.length
    const chunk = txt.slice(at, end)
    const nameM = chunk.match(/name:\s*"((?:[^"\\]|\\.)*)"/)
    const name = nameM ? unescapeStr(nameM[1]) : slug
    const description = fieldText(chunk, "description", ["tags", "usage", "wide"])
    out.push({ slug, name, description: description || name })
  }
  return out
}

/**
 * Parseia o `SLUG_GROUP_MAP` e os `GROUPS` de `groups.ts` via regex.
 *
 * Retorna `{ slugGroup: Record<slug, groupId>, groupLabel: Record<groupId, label> }`.
 * NÃO importa o módulo TypeScript — lê o source como texto, mesma abordagem do
 * `parseEntries`. O mapa vive separado do registry (`components.ts`), então o
 * parser `fieldText` não é afetado.
 */
function parseGroups() {
  const txt = read(resolve(SRC, "data/groups.ts"))

  // Group labels: extrai { id: "...", label: "..." } de cada entry em GROUPS[]
  const groupLabel = {}
  const entryRe = /id:\s*"([^"]+)"[^}]*?label:\s*"([^"]+)"/g
  let em
  while ((em = entryRe.exec(txt))) {
    groupLabel[em[1]] = em[2]
  }

  // Slug → groupId: extrai pares do body do `export const SLUG_GROUP_MAP = { ... }`
  const slugGroup = {}
  const declRe = /export const SLUG_GROUP_MAP[^{]*\{/
  const dm = txt.match(declRe)
  if (dm) {
    const openBrace = dm.index + dm[0].length - 1
    let depth = 0
    let end = -1
    for (let i = openBrace; i < txt.length; i++) {
      if (txt[i] === "{") depth++
      if (txt[i] === "}") {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    const body = txt.slice(openBrace + 1, end)
    // Casa ambos os formatos de key: "slug": "group" e slug: "group"
    const pairRe = /(?:"([^"]+)"|([a-zA-Z0-9_-]+)):\s*"([^"]+)"/g
    let pm
    while ((pm = pairRe.exec(body))) {
      slugGroup[pm[1] || pm[2]] = pm[3]
    }
  }

  return { slugGroup, groupLabel }
}

const { slugGroup, groupLabel } = parseGroups()

const components = parseEntries("data/components.ts")
const compositions = parseEntries("data/compositions.ts")

const addCmd = (slug) => `npx shadcn@latest add ${HOMEPAGE}/r/${slug}.json`

const lines = []
lines.push("# Vitrine UI — Acervo de componentes React, feito para IA")
lines.push("")
lines.push(
  "> Catálogo de componentes React (shadcn/ui + coleções chanhdai, Fluid, Aceternity, VengenceUI, @pierre/trees) e de composições (telas inteiras). Tudo é INSTALÁVEL via CLI do shadcn a partir de um registry estático: um único comando baixa os arquivos, instala as dependências npm e injeta o CSS necessário. Indexado para IA com llms.txt, prompts prontos e skills de processo.",
)
lines.push("")
lines.push(`- Base do registry: ${HOMEPAGE}`)
lines.push(`- Catálogo (humano): ${HOMEPAGE}/components`)
lines.push(`- Composições: ${HOMEPAGE}/compositions`)
lines.push(`- Guia de instalação: ${HOMEPAGE}/instalacao`)
lines.push(`- Índice para IA (esta página): ${HOMEPAGE}/ai`)
lines.push(
  `- Skill (componentes): ${HOMEPAGE}/skills/vitrine-ui-components.md`,
)
lines.push(
  `- Skill (composições/blocos): ${HOMEPAGE}/skills/vitrine-ui-compositions.md`,
)
lines.push("")
lines.push("## Como instalar qualquer item")
lines.push("")
lines.push("```bash")
lines.push("# 1. Pré-requisito (uma vez por projeto): Tailwind v4 + shadcn")
lines.push("npx shadcn@latest init")
lines.push("# 2. Instalar um componente OU uma composição pelo slug")
lines.push(`npx shadcn@latest add ${HOMEPAGE}/r/<slug>.json`)
lines.push("```")
lines.push("")
lines.push(
  "Depois, importe de `@/components/ui/<arquivo>` (componentes) ou renderize a tela em `@/compositions/<slug>` (composições). As dependências de componentes de uma composição são instaladas automaticamente (registryDependencies).",
)
lines.push("")

lines.push(`## Componentes (${components.length})`)
lines.push("")
lines.push(
  "Componentes organizados por **grupo** (clusterização por domínio). Use o grupo para descobrir componentes relacionados.",
)
lines.push("")

// Agrupar componentes por grupo (ordem dos GROUPS, depois sem grupo)
const groupOrder = Object.keys(groupLabel)
const byGroup = {}
const noGroup = []
for (const c of components) {
  const gid = slugGroup[c.slug]
  if (gid) {
    if (!byGroup[gid]) byGroup[gid] = []
    byGroup[gid].push(c)
  } else {
    noGroup.push(c)
  }
}

for (const gid of groupOrder) {
  const items = byGroup[gid]
  if (!items || items.length === 0) continue
  lines.push(`### ${groupLabel[gid]} (${items.length})`)
  lines.push("")
  for (const c of items) {
    lines.push(`- **${c.name}** (\`${c.slug}\`). ${c.description}`)
    lines.push(`  - instalar: \`${addCmd(c.slug)}\``)
  }
  lines.push("")
}
if (noGroup.length > 0) {
  lines.push(`### Outros (${noGroup.length})`)
  lines.push("")
  for (const c of noGroup) {
    lines.push(`- **${c.name}** (\`${c.slug}\`). ${c.description}`)
    lines.push(`  - instalar: \`${addCmd(c.slug)}\``)
  }
  lines.push("")
}

lines.push(`## Composições / blocos (${compositions.length})`)
lines.push("")
lines.push(
  "Cada composição é uma TELA completa instalável como um bloco único; o comando puxa a tela + todos os componentes da vitrine que ela usa.",
)
lines.push("")
for (const c of compositions) {
  lines.push(`- **${c.name}** (\`${c.slug}\`). ${c.description}`)
  lines.push(`  - instalar bloco: \`${addCmd(c.slug)}\``)
}
lines.push("")

const out = lines.join("\n") + "\n"
writeFileSync(resolve(ROOT, "public/llms.txt"), out)

console.log("════════════════════════════════════════════════════════")
console.log(" public/llms.txt gerado")
console.log("────────────────────────────────────────────────────────")
console.log(` componentes : ${components.length}`)
console.log(` composições : ${compositions.length}`)
console.log(` bytes       : ${out.length}`)
console.log("════════════════════════════════════════════════════════")
