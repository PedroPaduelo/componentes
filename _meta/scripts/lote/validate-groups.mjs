/**
 * validate-groups.mjs — checagem de COBERTURA da clusterização por grupo.
 *
 * Garante o invariante da ONDA 2 (UX Vitrine v2): TODO slug registrado em
 * `src/data/components.ts` tem um grupo explícito em `SLUG_GROUP_MAP`
 * (`src/data/groups.ts`). Sem isso, um componente novo cairia silenciosamente
 * em `DEFAULT_GROUP` e sumiria da seção correta da navegação.
 *
 * Estratégia (igual aos demais scripts de `_meta`): parse por REGEX, sem
 * importar TS nem subir Vite. Roda com `node _meta/scripts/lote/validate-groups.mjs`.
 * É NÃO-INTERATIVO e TERMINA: sai 0 se a cobertura é total, 1 se houver órfãos.
 *
 *   slug órfão  = está em components.ts mas NÃO em SLUG_GROUP_MAP  → falha (exit 1)
 *   chave morta = está em SLUG_GROUP_MAP mas NÃO em components.ts  → aviso (não falha)
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../../..")
const read = (p) => readFileSync(resolve(ROOT, p), "utf8")

/** Ids canônicos dos 9 grupos (espelha GROUP_IDS de groups.ts). */
const GROUP_IDS = [
  "forms-inputs",
  "actions-navigation",
  "layout-containers",
  "feedback-status",
  "chat-ai",
  "dashboards-dev",
  "text-effects",
  "backgrounds-fx",
  "globes-maps",
]

/**
 * Extrai o CORPO `{ ... }` de uma declaração de objeto (ex.: SLUG_GROUP_MAP),
 * por contagem de chaves a partir da primeira `{` após o nome. Evita capturar
 * outras ocorrências de `id: "<group>"` (como o array GROUPS) no arquivo.
 */
function extractObjectBody(src, name) {
  // Ancora na DECLARAÇÃO (`const <name>`), não em menções em comentários.
  const declMatch = src.match(new RegExp(`const\\s+${name}\\b`))
  if (!declMatch || declMatch.index === undefined)
    throw new Error(`declaração "const ${name}" não encontrada`)
  const open = src.indexOf("{", declMatch.index)
  if (open === -1) throw new Error(`abertura de "${name}" não encontrada`)
  let depth = 0
  for (let i = open; i < src.length; i++) {
    const ch = src[i]
    if (ch === "{") depth++
    else if (ch === "}" && --depth === 0) return src.slice(open + 1, i)
  }
  throw new Error(`fechamento de "${name}" não encontrado`)
}

// 1. Slugs do registry (src/data/components.ts).
const componentsTxt = read("src/data/components.ts")
const slugs = []
{
  const re = /slug:\s*"([^"]+)"/g
  let m
  while ((m = re.exec(componentsTxt))) slugs.push(m[1])
}
const slugSet = new Set(slugs)

// 2. Chaves do SLUG_GROUP_MAP (src/data/groups.ts). Chave pode ser
//    identificador nu (`input:`) ou string entre aspas (`"input-otp":`).
const groupsTxt = read("src/data/groups.ts")
const mapBody = extractObjectBody(groupsTxt, "SLUG_GROUP_MAP")
const mapped = new Set()
{
  const groupAlt = GROUP_IDS.join("|")
  const re = new RegExp(
    `(?:"([a-z0-9][a-z0-9-]*)"|([a-z0-9][a-z0-9-]*))\\s*:\\s*"(?:${groupAlt})"`,
    "g",
  )
  let m
  while ((m = re.exec(mapBody))) mapped.add(m[1] ?? m[2])
}

// 3. Diferenças nas duas direções.
const orphans = slugs.filter((s) => !mapped.has(s)) // sem grupo → falha
const dead = [...mapped].filter((s) => !slugSet.has(s)) // chave morta → aviso

// 4. Relatório (não-interativo).
console.log("════════════════════════════════════════════════════════")
console.log(" validate-groups — cobertura de grupos")
console.log("────────────────────────────────────────────────────────")
console.log(` slugs em components.ts : ${slugs.length}`)
console.log(` chaves em SLUG_GROUP_MAP: ${mapped.size}`)
console.log(` cobertos               : ${slugs.length - orphans.length}/${slugs.length}`)
console.log(` órfãos (sem grupo)     : ${orphans.length}`)
console.log(` chaves mortas (aviso)  : ${dead.length}`)
console.log("════════════════════════════════════════════════════════")

if (dead.length > 0) {
  console.warn("⚠ chaves em SLUG_GROUP_MAP sem slug correspondente em components.ts:")
  for (const s of dead) console.warn(`  - ${s}`)
}

if (orphans.length > 0) {
  console.error("✖ slugs SEM grupo em SLUG_GROUP_MAP (adicione-os em src/data/groups.ts):")
  for (const s of orphans) console.error(`  - ${s}`)
  process.exit(1)
}

console.log("✓ cobertura total: todo slug de components.ts tem grupo.")
process.exit(0)
