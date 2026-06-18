/**
 * build-compositions-registry.mjs — gera os "blocos" instaláveis das
 * composições da vitrine no formato registry-item do shadcn.
 *
 * Para cada composição (src/data/compositions.ts → slug), faz BFS no grafo de
 * imports a partir de `src/compositions/<slug>.tsx` e emite
 * `public/r/<slug>.json` (schema registry-item), de modo que:
 *
 *   npx shadcn@latest add https://<homepage>/r/<comp-slug>.json
 *
 * baixe a TELA INTEIRA (tsx + arquivos companheiros) + instale, via
 * `registryDependencies`, todos os componentes da vitrine que ela usa, e via
 * `dependencies`, os pacotes npm externos (pinados na faixa do package.json).
 *
 * Diferença para o gerador de componentes (build-registry.mjs):
 *  - resolve o BARREL `@/components/ui` (named imports) → slugs;
 *  - prefere `registryDependency` quando o item JÁ está publicado em public/r
 *    (componentes, libs, hooks); caso contrário, INLINA o arquivo (auto-contido);
 *  - inclui o `content` de cada arquivo embutido (não depende de `shadcn build`);
 *  - emite type `registry:block`.
 *
 * Saída: public/r/<comp-slug>.json (um por composição). NÃO mexe nos 217
 * itens de componente já existentes nem em registry.json.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve, relative, posix } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../../..")
const SRC = resolve(ROOT, "src")
const PUBLIC_R = resolve(ROOT, "public/r")
const HOMEPAGE = "https://ui-list-ui-componets-cmqcdlm7.cloud.serendiped.com"
const regDepUrl = (name) => `${HOMEPAGE}/r/${name}.json`

// ── helpers de filesystem ────────────────────────────────────────────────
const EXT_ORDER = [".tsx", ".ts", ".jsx", ".js"]
const read = (p) => readFileSync(p, "utf8")
const toRel = (abs) => posix.normalize(relative(ROOT, abs).split(/[\\/]/).join("/"))
function isDir(p) {
  try {
    return readdirSync(p) && true
  } catch {
    return false
  }
}
function resolveFile(absNoExt) {
  if (existsSync(absNoExt) && !isDir(absNoExt)) return absNoExt
  for (const e of EXT_ORDER) if (existsSync(absNoExt + e)) return absNoExt + e
  for (const e of EXT_ORDER) {
    const i = resolve(absNoExt, "index" + e)
    if (existsSync(i)) return i
  }
  return null
}
const baseOf = (abs) =>
  toRel(abs).replace(/^.*\//, "").replace(/\.(tsx|ts|jsx|js)$/, "")

// ── package.json (pin de deps) ───────────────────────────────────────────
const pkg = JSON.parse(read(resolve(ROOT, "package.json")))
const PKG_DEPS = pkg.dependencies || {}
const PKG_DEV = pkg.devDependencies || {}
const PEER_IGNORE = new Set(["react", "react-dom", "react/jsx-runtime"])
const EXTRA_TYPES = {
  three: ["@types/three"],
  "three-globe": ["@types/three"],
  "@react-three/fiber": ["@types/three"],
}
function pkgNameOf(spec) {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/")
  return spec.split("/")[0]
}
function typesPkgName(p) {
  if (p.startsWith("@")) {
    const [scope, name] = p.slice(1).split("/")
    return `@types/${scope}__${name}`
  }
  return `@types/${p}`
}
function installedVersion(p) {
  try {
    return JSON.parse(read(resolve(ROOT, "node_modules", p, "package.json")))
      .version
  } catch {
    return null
  }
}
function depSpec(p) {
  if (PKG_DEPS[p]) return `${p}@${PKG_DEPS[p]}`
  const v = installedVersion(p)
  return v ? `${p}@^${v}` : p
}
function devTypesFor(depPkgs) {
  const out = new Set()
  for (const p of depPkgs) {
    for (const t of [typesPkgName(p), ...(EXTRA_TYPES[p] || [])]) {
      if (PKG_DEV[t]) out.add(`${t}@${PKG_DEV[t]}`)
    }
  }
  return [...out].sort()
}

// ── imports ──────────────────────────────────────────────────────────────
// IMPORTANTE: várias composições (ex.: ai-ide) carregam CÓDIGO como DADO
// (template literals/strings simulando arquivos de uma IDE). Esse código contém
// `import ... from "..."` que NÃO são dependências reais da composição. Para não
// poluir o grafo, só consideramos o BLOCO DE IMPORTS NO TOPO do arquivo (imports
// ES são hoisted), parando no primeiro statement de código real, e removendo
// comentários (JSDoc com exemplos de import) antes de extrair.
const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']/g

/** Remove comentários de bloco e de linha (preservando `https://`). */
function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
}

/**
 * Retorna apenas a região de imports no topo do arquivo: linhas em branco,
 * comentários e statements `import`/`export … from`/`export { … }` (inclusive
 * multilinha via contagem de chaves), parando na primeira linha de código real.
 */
function topImportRegion(content) {
  const lines = content.split("\n")
  const kept = []
  let depth = 0
  let inImport = false
  for (const line of lines) {
    const t = line.trim()
    if (!inImport && depth === 0) {
      if (
        t === "" ||
        t.startsWith("//") ||
        t.startsWith("/*") ||
        t.startsWith("*") ||
        t.endsWith("*/")
      ) {
        kept.push(line)
        continue
      }
      const isImport = t.startsWith("import")
      const isExportFrom =
        /^export\b/.test(t) && (/\bfrom\b/.test(line) || /\{/.test(line))
      if (isImport || isExportFrom) {
        kept.push(line)
        const opens = (line.match(/\{/g) || []).length
        const closes = (line.match(/\}/g) || []).length
        depth += opens - closes
        inImport = depth > 0
      } else {
        break // primeiro código real → fim da região de imports
      }
    } else {
      kept.push(line)
      const opens = (line.match(/\{/g) || []).length
      const closes = (line.match(/\}/g) || []).length
      depth += opens - closes
      if (depth <= 0) {
        depth = 0
        inImport = false
      }
    }
  }
  return stripComments(kept.join("\n"))
}

function extractImports(content) {
  const region = topImportRegion(content)
  const specs = new Set()
  let m
  while ((m = IMPORT_RE.exec(region))) specs.add(m[1])
  return [...specs]
}
/** Nomes importados de um specifier específico (named imports, sem `type`). */
function namedImportsFrom(content, spec) {
  const region = topImportRegion(content)
  const names = new Set()
  const esc = spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(
    `import\\s*(?:type\\s*)?\\{([^}]*)\\}\\s*from\\s*["']${esc}["']`,
    "g",
  )
  let m
  while ((m = re.exec(region))) {
    for (let part of m[1].split(",")) {
      part = part.trim().replace(/^type\s+/, "")
      if (!part) continue
      const name = part.split(/\s+as\s+/)[0].trim()
      if (name) names.add(name)
    }
  }
  return [...names]
}

// ── 1. componentes registrados (base do arquivo → slug) ──────────────────
const MAIN_FILE_OVERRIDE = { "3d-card-effect": "3d-card" }
function mainBaseOf(slug) {
  return MAIN_FILE_OVERRIDE[slug] || slug
}
function parseSlugs(file) {
  const txt = read(resolve(SRC, file))
  return [...txt.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1])
}
const componentSlugs = parseSlugs("data/components.ts")
const baseToSlug = new Map() // arquivo base → slug do componente
for (const slug of componentSlugs) baseToSlug.set(mainBaseOf(slug), slug)

// item publicado em public/r? (componente, lib, hook, fluid-tokens…)
function isPublished(name) {
  return existsSync(resolve(PUBLIC_R, `${name}.json`))
}

// ── 2. barrel @/components/ui → name → slug ───────────────────────────────
const barrelTxt = read(resolve(SRC, "components/ui/index.ts"))
const nameToSlug = new Map()
const EXPORT_FROM_RE =
  /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["']\.\/([^"']+)["']/g
let bm
while ((bm = EXPORT_FROM_RE.exec(barrelTxt))) {
  const fileBase = bm[1] && bm[2] ? bm[2] : null
  const slug = baseToSlug.get(bm[2])
  if (!slug) continue
  for (let part of bm[1].split(",")) {
    part = part.trim().replace(/^type\s+/, "")
    if (!part) continue
    const exported = part.split(/\s+as\s+/).pop().trim()
    if (exported) nameToSlug.set(exported, slug)
  }
  void fileBase
}

// ── detecção de fluid-tokens (surfaces / hover / active) ─────────────────
const FLUID_TOKEN_RE =
  /\b(?:bg|shadow|text|border)-surface-\d|\bbg-hover\b|\bbg-active\b|--surface-|--hover\b|--active\b|destructive-light|--checker-/

// ── classificação + entry de arquivo ─────────────────────────────────────
function classify(abs) {
  const rel = toRel(abs)
  if (rel.startsWith("src/components/ui/")) return "ui"
  if (rel.startsWith("src/lib/")) return "lib"
  if (rel.startsWith("src/hooks/")) return "hook"
  if (rel.startsWith("src/components/theme/")) return "theme"
  return "other"
}
function fileEntry(abs) {
  const rel = toRel(abs)
  let type = "registry:component"
  if (rel.startsWith("src/components/ui/")) type = "registry:ui"
  else if (rel.startsWith("src/lib/")) type = "registry:lib"
  else if (rel.startsWith("src/hooks/")) type = "registry:hook"
  return { path: rel, content: read(abs), type, target: `~/${rel}` }
}

// ── 3. composições ───────────────────────────────────────────────────────
function parseCompositions() {
  const txt = read(resolve(SRC, "data/compositions.ts"))
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
    let description = ""
    const dM = chunk.match(/description:\s*([\s\S]*?)\n\s*(?:tags|category|wide):/)
    if (dM) {
      const segs = dM[1].match(/"((?:[^"\\]|\\.)*)"/g) || []
      description = segs.map((s) => unescapeStr(s.slice(1, -1))).join("")
    }
    if (!description) description = name
    out.push({ slug, name, description })
  }
  return out
}
function unescapeStr(s) {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, " ")
}

// ── BFS de uma composição → item registry ────────────────────────────────
function buildCompositionItem(comp) {
  const mainAbs = resolveFile(resolve(SRC, "compositions", comp.slug))
  if (!mainAbs) return { item: null, warn: `arquivo principal não encontrado` }

  const files = new Map() // abs → rel
  const deps = new Set()
  const depPkgs = new Set()
  const registryDeps = new Set()
  const warnings = []
  const seen = new Set()
  const stack = [mainAbs]
  let usesFluid = false

  while (stack.length) {
    const cur = stack.pop()
    if (seen.has(cur)) continue
    seen.add(cur)
    const txt = read(cur)
    files.set(cur, toRel(cur))
    if (FLUID_TOKEN_RE.test(txt)) usesFluid = true

    for (const spec of extractImports(txt)) {
      // externo
      if (
        !spec.startsWith("@/") &&
        !spec.startsWith("./") &&
        !spec.startsWith("../")
      ) {
        if (PEER_IGNORE.has(spec)) continue
        const p = pkgNameOf(spec)
        deps.add(depSpec(p))
        depPkgs.add(p)
        continue
      }

      // barrel @/components/ui (named imports → slugs)
      if (spec === "@/components/ui" || spec === "@/components/ui/index") {
        for (const name of namedImportsFrom(txt, spec)) {
          const slug = nameToSlug.get(name)
          if (slug && isPublished(slug)) registryDeps.add(slug)
          else if (!slug)
            warnings.push(`barrel: "${name}" sem slug mapeado`)
        }
        continue
      }

      // resolve caminho local
      let abs = null
      if (spec.startsWith("@/")) abs = resolveFile(resolve(SRC, spec.slice(2)))
      else abs = resolveFile(resolve(dirname(cur), spec))
      if (!abs) {
        warnings.push(`import "${spec}" não resolve`)
        continue
      }
      const cl = classify(abs)
      const b = baseOf(abs)

      if (cl === "lib" && b === "utils") continue // cn → pré-requisito

      if (cl === "ui") {
        const slug = baseToSlug.get(b)
        if (slug && isPublished(slug)) registryDeps.add(slug)
        else stack.push(abs) // companheiro ui não publicado → inline
        continue
      }
      if (cl === "lib" || cl === "hook" || cl === "theme") {
        if (isPublished(b)) registryDeps.add(b)
        else stack.push(abs) // entry não publicado → inline (auto-contido)
        continue
      }
      // "other": @/compositions/*, @/data/*, relativo → inline
      stack.push(abs)
    }
  }

  if (usesFluid && isPublished("fluid-tokens")) registryDeps.add("fluid-tokens")

  // ordena: principal primeiro, depois alfabético
  const mainRel = toRel(mainAbs)
  const fileList = [...files.keys()].sort((a, b) => {
    const ra = toRel(a)
    const rb = toRel(b)
    if (ra === mainRel) return -1
    if (rb === mainRel) return 1
    return ra.localeCompare(rb)
  })

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: comp.slug,
    type: "registry:block",
    title: comp.name,
    description: comp.description,
  }
  if (deps.size) item.dependencies = [...deps].sort()
  const devDeps = devTypesFor(depPkgs)
  if (devDeps.length) item.devDependencies = devDeps
  if (registryDeps.size)
    item.registryDependencies = [...registryDeps].sort().map(regDepUrl)
  item.files = fileList.map(fileEntry)

  return { item, warnings }
}

// ── execução ─────────────────────────────────────────────────────────────
const comps = parseCompositions()
let emitted = 0
const allWarnings = []
const summary = []

for (const comp of comps) {
  // guarda anti-colisão com um item de componente já existente
  if (componentSlugs.includes(comp.slug)) {
    throw new Error(
      `Colisão de slug: a composição "${comp.slug}" colide com um componente. Renomeie.`,
    )
  }
  const { item, warnings, warn } = buildCompositionItem(comp)
  if (!item) {
    allWarnings.push(`${comp.slug}: ${warn}`)
    continue
  }
  writeFileSync(
    resolve(PUBLIC_R, `${comp.slug}.json`),
    JSON.stringify(item, null, 2) + "\n",
  )
  emitted++
  summary.push({
    slug: comp.slug,
    files: item.files.length,
    regDeps: (item.registryDependencies || []).length,
    deps: (item.dependencies || []).length,
  })
  for (const w of warnings || []) allWarnings.push(`${comp.slug}: ${w}`)
}

console.log("════════════════════════════════════════════════════════")
console.log(" BLOCOS DE COMPOSIÇÃO GERADOS (public/r/<slug>.json)")
console.log("────────────────────────────────────────────────────────")
for (const s of summary) {
  console.log(
    `  ${s.slug.padEnd(26)} files:${String(s.files).padStart(2)}  regDeps:${String(
      s.regDeps,
    ).padStart(2)}  deps:${String(s.deps).padStart(2)}`,
  )
}
console.log("────────────────────────────────────────────────────────")
console.log(` total emitidos: ${emitted}/${comps.length}`)
if (allWarnings.length) {
  console.log(`\n AVISOS (${allWarnings.length}):`)
  for (const w of allWarnings) console.log("   • " + w)
}
console.log("════════════════════════════════════════════════════════")
