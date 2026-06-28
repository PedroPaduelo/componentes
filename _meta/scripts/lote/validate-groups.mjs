/**
 * validate-groups.mjs — checagem de COBERTURA da clusterização por grupo.
 *
 * Garante o invariante da taxonomia: TODO slug registrado em
 * `src/data/components.ts` tem um grupo explícito em `SLUG_GROUP_MAP`
 * (`src/data/groups.ts`). Sem isso, um componente novo cairia silenciosamente
 * em `DEFAULT_GROUP` e sumiria da seção correta da navegação (e do `llms.txt`).
 *
 * Estratégia (igual aos demais scripts de `_meta`): parse por REGEX, sem
 * importar TS nem subir Vite. Roda com `node _meta/scripts/lote/validate-groups.mjs`.
 * É NÃO-INTERATIVO e TERMINA.
 *
 *   slug órfão   = está em components.ts mas NÃO em SLUG_GROUP_MAP  → falha (exit 1)
 *   grupo vazio  = GROUP_ID sem nenhum slug apontando pra ele       → falha (exit 1)
 *   chave morta  = está em SLUG_GROUP_MAP mas NÃO em components.ts   → aviso (não falha)
 *   grupo inválido = valor no map fora de GROUP_IDS                  → falha (exit 1)
 *
 * `GROUP_IDS` é derivado DINAMICAMENTE do próprio `groups.ts` (array `GROUP_IDS`),
 * então o validador acompanha qualquer mudança de taxonomia sem manutenção.
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../../..")
const read = (p) => readFileSync(resolve(ROOT, p), "utf8")

/**
 * Extrai o CORPO `{...}` (ou `[...]`) de uma declaração `const <name>`, por
 * contagem de delimitadores a partir da primeira abertura após o nome. Evita
 * capturar outras ocorrências do padrão no arquivo.
 */
function extractDelimited(src, name, open, close) {
  const declMatch = src.match(new RegExp(`const\\s+${name}\\b`))
  if (!declMatch || declMatch.index === undefined)
    throw new Error(`declaração "const ${name}" não encontrada`)
  const start = src.indexOf(open, declMatch.index)
  if (start === -1) throw new Error(`abertura de "${name}" não encontrada`)
  let depth = 0
  for (let i = start; i < src.length; i++) {
    const ch = src[i]
    if (ch === open) depth++
    else if (ch === close && --depth === 0) return src.slice(start + 1, i)
  }
  throw new Error(`fechamento de "${name}" não encontrado`)
}

const groupsTxt = read("src/data/groups.ts")

// 0. GROUP_IDS canônicos — derivados do array `GROUP_IDS` de groups.ts.
const groupIdsBody = extractDelimited(groupsTxt, "GROUP_IDS", "[", "]")
const GROUP_IDS = [...groupIdsBody.matchAll(/"([a-z0-9][a-z0-9-]*)"/g)].map(
  (m) => m[1],
)
if (GROUP_IDS.length === 0) throw new Error("GROUP_IDS vazio — parse falhou")

// 1. Slugs do registry (src/data/components.ts).
const componentsTxt = read("src/data/components.ts")
const slugs = []
{
  const re = /slug:\s*"([^"]+)"/g
  let m
  while ((m = re.exec(componentsTxt))) slugs.push(m[1])
}
const slugSet = new Set(slugs)

// 2. Entradas do SLUG_GROUP_MAP (src/data/groups.ts). Chave pode ser
//    identificador nu (`input:`) ou string entre aspas (`"input-otp":`).
const mapBody = extractDelimited(groupsTxt, "SLUG_GROUP_MAP", "{", "}")
const mapped = new Map() // slug → groupId
{
  const re =
    /(?:"([a-z0-9][a-z0-9-]*)"|([a-z0-9][a-z0-9-]*))\s*:\s*"([a-z0-9-]+)"/g
  let m
  while ((m = re.exec(mapBody))) mapped.set(m[1] ?? m[2], m[3])
}

// 3. Diferenças e validações.
const groupSet = new Set(GROUP_IDS)
const orphans = slugs.filter((s) => !mapped.has(s)) // sem grupo → falha
const dead = [...mapped.keys()].filter((s) => !slugSet.has(s)) // chave morta → aviso
const invalid = [...mapped.entries()].filter(([, g]) => !groupSet.has(g)) // valor inválido → falha
const usedGroups = new Set(mapped.values())
const emptyGroups = GROUP_IDS.filter((g) => !usedGroups.has(g)) // grupo vazio → falha

// 4. Relatório (não-interativo).
console.log("════════════════════════════════════════════════════════")
console.log(" validate-groups — cobertura de grupos")
console.log("────────────────────────────────────────────────────────")
console.log(` grupos (GROUP_IDS)      : ${GROUP_IDS.length}`)
console.log(` slugs em components.ts  : ${slugs.length}`)
console.log(` chaves em SLUG_GROUP_MAP: ${mapped.size}`)
console.log(` cobertos                : ${slugs.length - orphans.length}/${slugs.length}`)
console.log(` órfãos (sem grupo)      : ${orphans.length}`)
console.log(` grupos vazios           : ${emptyGroups.length}`)
console.log(` grupos inválidos        : ${invalid.length}`)
console.log(` chaves mortas (aviso)   : ${dead.length}`)
console.log("════════════════════════════════════════════════════════")

if (dead.length > 0) {
  console.warn("⚠ chaves em SLUG_GROUP_MAP sem slug correspondente em components.ts:")
  for (const s of dead) console.warn(`  - ${s}`)
}

let failed = false

if (orphans.length > 0) {
  failed = true
  console.error("✖ slugs SEM grupo em SLUG_GROUP_MAP (adicione-os em src/data/groups.ts):")
  for (const s of orphans) console.error(`  - ${s}`)
}

if (invalid.length > 0) {
  failed = true
  console.error("✖ entradas com grupo inválido (fora de GROUP_IDS):")
  for (const [s, g] of invalid) console.error(`  - ${s} → "${g}"`)
}

if (emptyGroups.length > 0) {
  failed = true
  console.error("✖ grupos sem nenhum componente (taxonomia com grupo vazio):")
  for (const g of emptyGroups) console.error(`  - ${g}`)
}

if (failed) process.exit(1)

console.log("✓ cobertura total: todo slug tem grupo válido e todo grupo tem itens.")
process.exit(0)
