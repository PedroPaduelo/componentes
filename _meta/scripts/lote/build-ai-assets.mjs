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
const HOMEPAGE = "https://componentes-fe-cmq0d9kr.cloud.serendiped.com"
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

function parseEntries(file, { hasCategory }) {
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
    const description = fieldText(chunk, "description", [
      "tags",
      "usage",
      "category",
      "wide",
    ])
    let category = ""
    if (hasCategory) {
      const cM = chunk.match(/category:\s*"([^"]+)"/)
      category = cM ? cM[1] : ""
    }
    out.push({ slug, name, category, description: description || name })
  }
  return out
}

const components = parseEntries("data/components.ts", { hasCategory: true })
const compositions = parseEntries("data/compositions.ts", { hasCategory: true })

const addCmd = (slug) => `npx shadcn@latest add ${HOMEPAGE}/r/${slug}.json`

const lines = []
lines.push("# Vitrine UI — Índice para IA (llms.txt)")
lines.push("")
lines.push(
  "> Catálogo de componentes React (shadcn/ui + coleções chanhdai, Fluid, Aceternity, VengenceUI, @pierre/trees) e de composições (telas inteiras). Tudo é INSTALÁVEL via CLI do shadcn a partir de um registry estático: um único comando baixa os arquivos, instala as dependências npm e injeta o CSS necessário.",
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
for (const c of components) {
  const cat = c.category ? ` — ${c.category}` : ""
  lines.push(`- **${c.name}** (\`${c.slug}\`)${cat}. ${c.description}`)
  lines.push(`  - instalar: \`${addCmd(c.slug)}\``)
}
lines.push("")

lines.push(`## Composições / blocos (${compositions.length})`)
lines.push("")
lines.push(
  "Cada composição é uma TELA completa instalável como um bloco único; o comando puxa a tela + todos os componentes da vitrine que ela usa.",
)
lines.push("")
for (const c of compositions) {
  const cat = c.category ? ` — ${c.category}` : ""
  lines.push(`- **${c.name}** (\`${c.slug}\`)${cat}. ${c.description}`)
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
