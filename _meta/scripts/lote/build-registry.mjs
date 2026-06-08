/**
 * build-registry.mjs — gerador automático do registry shadcn da vitrine.
 *
 * Lê o filesystem real (src/) e produz `registry.json` na raiz, depois roda
 * `shadcn build` para emitir `public/r/<name>.json` (um por item) + o índice
 * `public/r/registry.json`. Cada item fica instalável via:
 *
 *   npx shadcn@latest add https://<homepage>/r/<slug>.json
 *
 * Algoritmo (resumo):
 *  1. Parseia src/data/components.ts → lista de { slug, name, description }.
 *  2. Resolve o arquivo principal de cada slug (overrides conhecidos, ex.:
 *     3d-card-effect → 3d-card.tsx).
 *  3. BFS no grafo de imports LOCAIS de cada componente:
 *       - companheiro ui (não-registrado, ex.: button-variants, *-types)  → file[]
 *       - outro componente ui registrado (ex.: canvas-reveal-effect)       → registryDependencies
 *       - @/lib/<x>, @/hooks/<x>, @/components/theme/<x> (entries)         → registryDependencies + item registry:lib|hook
 *       - @/lib/utils (cn)                                                 → IGNORADO (pré-requisito do consumer)
 *  4. Detecta imports de pacotes externos (não @/, não react) e casa com as
 *     chaves de `dependencies` do package.json → dependencies[] (com versão).
 *  5. Anexa CSS co-localizado via mapa curado (registry-css-map.mjs):
 *     --animate-* → cssVars.theme; @keyframes/@utility/seletores → css{}.
 *     Surfaces/tokens Fluid compartilhados → item `fluid-tokens` (cssVars).
 *  6. Loga REVISAR_CSS: componentes que usam animação custom sem definição.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, resolve, relative, posix } from "node:path"
import {
  CSS_BLOCKS,
  DEFINED_ANIMATIONS,
  BUILTIN_ANIMATIONS,
  UNDEFINED_IN_SOURCE,
} from "./registry-css-map.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../../..")
const SRC = resolve(ROOT, "src")
const HOMEPAGE = "https://componentes-fe-cmq0d9kr.cloud.serendiped.com"

/**
 * registryDependencies precisam ser URLs ABSOLUTAS do NOSSO registry — o
 * shadcn resolve nomes "pelados" contra ui.shadcn.com (404 nos itens custom
 * como icon-context/shape-context/fluid-tokens). Como TODO nome referenciado
 * é um item nosso, sempre emitimos a URL completa.
 */
const regDepUrl = (name) => `${HOMEPAGE}/r/${name}.json`

// ── helpers de filesystem ────────────────────────────────────────────────
const EXT_ORDER = [".tsx", ".ts", ".jsx", ".js"]
const read = (p) => readFileSync(p, "utf8")
const toRel = (abs) => posix.normalize(relative(ROOT, abs).split(/[\\/]/).join("/"))

/** Resolve um caminho de arquivo (sem extensão) para o arquivo real existente. */
function resolveFile(absNoExt) {
  if (existsSync(absNoExt) && !isDir(absNoExt)) return absNoExt
  for (const ext of EXT_ORDER) {
    if (existsSync(absNoExt + ext)) return absNoExt + ext
  }
  for (const ext of EXT_ORDER) {
    const idx = resolve(absNoExt, "index" + ext)
    if (existsSync(idx)) return idx
  }
  return null
}
function isDir(p) {
  try {
    return readdirSync(p) && true
  } catch {
    return false
  }
}

// ── parse de package.json ────────────────────────────────────────────────
const pkg = JSON.parse(read(resolve(ROOT, "package.json")))
const PKG_DEPS = pkg.dependencies || {}
const PKG_DEV_DEPS = pkg.devDependencies || {}
const PEER_IGNORE = new Set(["react", "react-dom", "react/jsx-runtime"])

/** specifier externo → nome do pacote npm. */
function pkgNameOf(spec) {
  if (spec.startsWith("@")) {
    const parts = spec.split("/")
    return parts.slice(0, 2).join("/")
  }
  return spec.split("/")[0]
}

/** Nome do pacote @types correspondente a um pacote npm (convenção DT). */
function typesPkgName(p) {
  if (p.startsWith("@")) {
    const [scope, name] = p.slice(1).split("/")
    return `@types/${scope}__${name}`
  }
  return `@types/${p}`
}

/**
 * Mapa curado: pacotes cujos tipos vivem em OUTRO @types (não o homônimo).
 * Ex.: three-globe e @react-three/fiber não têm tipos embutidos e usam os
 * tipos de `three` (@types/three). Generalizável caso surjam novos casos.
 */
const EXTRA_TYPES = {
  three: ["@types/three"],
  "three-globe": ["@types/three"],
  "@react-three/fiber": ["@types/three"],
}

/**
 * Dado o conjunto de pacotes externos (bare names) usados por um item, devolve
 * os @types necessários que EXISTAM no devDependencies da vitrine, pinados na
 * faixa de lá. Cobre tanto o @types homônimo (ex.: @types/three p/ three)
 * quanto os casos curados (three-globe/@react-three/fiber → @types/three).
 */
function devTypesFor(depPkgs) {
  const out = new Set()
  for (const p of depPkgs) {
    const candidates = [typesPkgName(p), ...(EXTRA_TYPES[p] || [])]
    for (const t of candidates) {
      if (PKG_DEV_DEPS[t]) out.add(`${t}@${PKG_DEV_DEPS[t]}`)
    }
  }
  return [...out].sort()
}

// ── extração de imports de um arquivo ────────────────────────────────────
const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']/g
const DYNIMPORT_RE = /import\(\s*["']([^"']+)["']\)/g

function extractImports(content) {
  const specs = new Set()
  let m
  while ((m = IMPORT_RE.exec(content))) specs.add(m[1])
  while ((m = DYNIMPORT_RE.exec(content))) specs.add(m[1])
  return [...specs]
}

/** Resolve um specifier de import (relativo a `fromAbs`) → caminho absoluto ou tipo externo. */
function resolveSpec(spec, fromAbs) {
  if (spec.startsWith("@/")) {
    return { kind: "local", abs: resolveFile(resolve(SRC, spec.slice(2))) }
  }
  if (spec.startsWith("./") || spec.startsWith("../")) {
    return { kind: "local", abs: resolveFile(resolve(dirname(fromAbs), spec)) }
  }
  if (PEER_IGNORE.has(spec)) return { kind: "peer" }
  return { kind: "external", pkg: pkgNameOf(spec) }
}

/** Classifica um arquivo local por diretório. */
function classify(abs) {
  const rel = toRel(abs)
  if (rel.startsWith("src/components/ui/")) return "ui"
  if (rel.startsWith("src/lib/")) return "lib"
  if (rel.startsWith("src/hooks/")) return "hook"
  if (rel.startsWith("src/components/theme/")) return "theme"
  return "other"
}
const baseOf = (abs) => toRel(abs).replace(/^.*\//, "").replace(/\.(tsx|ts|jsx|js)$/, "")

/**
 * Monta a entrada files[] de um arquivo, escolhendo type/target pelo diretório.
 * - src/components/ui/*  → registry:ui (vai pro alias ui, sem target).
 * - src/lib/*            → registry:lib.
 * - src/hooks/*          → registry:hook.
 * - demais src/components/* (ex.: showcase/) → registry:component COM target
 *   explícito (root-relative via "~/") preservando o subpath, p/ o import
 *   `@/components/<sub>/<x>` continuar resolvendo no consumer.
 */
function fileEntry(rel) {
  if (rel.startsWith("src/components/ui/")) return { path: rel, type: "registry:ui" }
  if (rel.startsWith("src/lib/")) return { path: rel, type: "registry:lib" }
  if (rel.startsWith("src/hooks/")) return { path: rel, type: "registry:hook" }
  if (rel.startsWith("src/components/theme/"))
    return { path: rel, type: "registry:component", target: `~/${rel}` }
  if (rel.startsWith("src/components/"))
    return { path: rel, type: "registry:component", target: `~/${rel}` }
  return { path: rel, type: "registry:file", target: `~/${rel}` }
}

// ── 1. parse components.ts ───────────────────────────────────────────────
function parseComponents() {
  const txt = read(resolve(SRC, "data/components.ts"))
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
    const dM = chunk.match(/description:\s*([\s\S]*?)\n\s*(?:tags|usage|category):/)
    if (dM) {
      const segs = dM[1].match(/"((?:[^"\\]|\\.)*)"/g) || []
      description = segs.map((s) => unescapeStr(s.slice(1, -1))).join("")
    }
    if (description === "..." || !description) description = name
    out.push({ slug, name, description })
  }
  return out
}
function unescapeStr(s) {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, " ")
}

// ── 2. resolução do arquivo principal por slug ───────────────────────────
const MAIN_FILE_OVERRIDE = {
  "3d-card-effect": "3d-card",
}
function mainBaseOf(slug) {
  return MAIN_FILE_OVERRIDE[slug] || slug
}

const components = parseComponents()
const slugSet = new Set(components.map((c) => c.slug))
// base do arquivo principal → slug (para mapear imports cruzados ui→ui)
const baseToSlug = new Map()
for (const c of components) baseToSlug.set(mainBaseOf(c.slug), c.slug)

// ── pré-leitura de TODO conteúdo de ui/lib/hook/theme (cache) ────────────
const fileCache = new Map()
function content(abs) {
  if (!fileCache.has(abs)) fileCache.set(abs, read(abs))
  return fileCache.get(abs)
}

// ── 3. entrySet de libs/hooks/theme (importados diretamente por componentes ui) ─
const entryPath = new Map() // entryName → abs
function registerEntry(abs) {
  const cl = classify(abs)
  if (cl === "lib" && baseOf(abs) === "utils") return
  if (cl === "lib" || cl === "hook" || cl === "theme") {
    entryPath.set(baseOf(abs), abs)
  }
}
// varre os arquivos principais (e companheiros) dos componentes p/ achar entries
for (const c of components) {
  const mainAbs = resolveFile(resolve(SRC, "components/ui", mainBaseOf(c.slug)))
  if (!mainAbs) continue
  // BFS rasa só p/ achar imports de lib/hook/theme em qualquer arquivo ui do item
  const seen = new Set()
  const stack = [mainAbs]
  while (stack.length) {
    const cur = stack.pop()
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const spec of extractImports(content(cur))) {
      const r = resolveSpec(spec, cur)
      if (r.kind !== "local" || !r.abs) continue
      const cl = classify(r.abs)
      if (cl === "ui") {
        // só desce em companheiros (não-registrados) para achar libs aninhadas
        if (!baseToSlug.has(baseOf(r.abs))) stack.push(r.abs)
      } else if (cl === "lib" || cl === "hook" || cl === "theme") {
        registerEntry(r.abs)
      } else {
        stack.push(r.abs) // "other" (ex.: showcase/*) → desce p/ achar entries
      }
    }
  }
}
const entrySet = new Set(entryPath.keys())

// ── parser CSS → objeto aninhado (para o campo `css` do registry-item) ────
function parseCssToObject(css) {
  let i = 0
  const n = css.length
  function skipWs() {
    while (i < n) {
      const ch = css[i]
      if (ch === " " || ch === "\n" || ch === "\t" || ch === "\r") {
        i++
        continue
      }
      if (ch === "/" && css[i + 1] === "*") {
        i += 2
        while (i < n && !(css[i] === "*" && css[i + 1] === "/")) i++
        i += 2
        continue
      }
      break
    }
  }
  function parseBlock() {
    const obj = {}
    skipWs()
    while (i < n && css[i] !== "}") {
      let buf = ""
      while (i < n && css[i] !== "{" && css[i] !== ";" && css[i] !== "}") {
        if (css[i] === "/" && css[i + 1] === "*") {
          i += 2
          while (i < n && !(css[i] === "*" && css[i + 1] === "/")) i++
          i += 2
          continue
        }
        buf += css[i]
        i++
      }
      if (i < n && css[i] === "{") {
        i++
        const inner = parseBlock()
        if (i < n && css[i] === "}") i++
        const sel = buf.trim().replace(/\s+/g, " ")
        obj[sel] = inner
        skipWs()
      } else if (i < n && css[i] === ";") {
        i++
        assignDecl(obj, buf)
        skipWs()
      } else {
        assignDecl(obj, buf)
        break
      }
    }
    return obj
  }
  function assignDecl(obj, buf) {
    const decl = buf.trim()
    if (!decl) return
    const ci = decl.indexOf(":")
    if (ci === -1) return
    obj[decl.slice(0, ci).trim()] = decl.slice(ci + 1).trim()
  }
  return parseBlock()
}

// ── mapa slug → { themeVars, cssObj } a partir do mapa curado ─────────────
const cssBySlug = new Map()
for (const block of CSS_BLOCKS) {
  const cssObj = block.cssText ? parseCssToObject(block.cssText) : null
  for (const slug of block.slugs) {
    if (!cssBySlug.has(slug)) cssBySlug.set(slug, { theme: {}, css: {} })
    const e = cssBySlug.get(slug)
    if (block.themeVars) Object.assign(e.theme, block.themeVars)
    if (cssObj) Object.assign(e.css, cssObj)
  }
}

// ── detecção de fluid-tokens (surfaces / hover / active / etc.) ───────────
const FLUID_TOKEN_RE =
  /\b(?:bg|shadow|text|border)-surface-\d|\bbg-hover\b|\bbg-active\b|--surface-|--hover\b|--active\b|destructive-light|--checker-/
const FLUID_TOKEN_ENTRIES = new Set([
  "surface-context",
  "surface-classes",
  "elevated",
])

// ── 4/5. resolução de um item de componente ──────────────────────────────
const libItemsNeeded = new Set() // entryName(s) a materializar
const componentItems = []
const REVISAR_CSS = []
const NON_PKG_DEPS = new Map() // pkg externo NÃO declarado no package.json → [itens que usam]

/** versão instalada em node_modules (best-effort) para deps fora do package.json. */
function installedVersion(pkg) {
  try {
    const p = JSON.parse(read(resolve(ROOT, "node_modules", pkg, "package.json")))
    return p.version
  } catch {
    return null
  }
}
/**
 * Resolve o "spec" de dependência npm para o array dependencies do item.
 * - em package.json → nome@<faixa exata do package.json da vitrine> (pin!).
 *   Sem isso o consumer instala `latest` e quebra (pdfjs-dist v6,
 *   react-day-picker v10, three 0.18x etc.).
 * - fora do package.json mas instalado → nome@^versao (+ flag REVISAR).
 */
function depSpec(pkg, itemName) {
  if (PKG_DEPS[pkg]) return `${pkg}@${PKG_DEPS[pkg]}`
  const v = installedVersion(pkg)
  if (!NON_PKG_DEPS.has(pkg)) NON_PKG_DEPS.set(pkg, [])
  NON_PKG_DEPS.get(pkg).push(itemName)
  return v ? `${pkg}@^${v}` : pkg
}

for (const c of components) {
  const mainAbs = resolveFile(resolve(SRC, "components/ui", mainBaseOf(c.slug)))
  if (!mainAbs) {
    REVISAR_CSS.push(`${c.slug}: ARQUIVO PRINCIPAL NÃO ENCONTRADO (${mainBaseOf(c.slug)})`)
    continue
  }

  const files = new Map() // abs → rel (companheiros + principal)
  const deps = new Set()
  const depPkgs = new Set() // nomes "pelados" dos pacotes externos (p/ @types)
  const registryDeps = new Set()
  const seen = new Set()
  const stack = [mainAbs]
  let usesFluidTokens = false
  const animClasses = new Set()

  while (stack.length) {
    const cur = stack.pop()
    if (seen.has(cur)) continue
    seen.add(cur)
    const txt = content(cur)
    files.set(cur, toRel(cur))

    // detectar tokens fluid + classes de animação custom no conteúdo
    if (FLUID_TOKEN_RE.test(txt)) usesFluidTokens = true
    for (const am of txt.matchAll(/\banimate-([a-z][a-z0-9-]+)/g)) {
      animClasses.add(am[1])
    }

    for (const spec of extractImports(txt)) {
      const r = resolveSpec(spec, cur)
      if (r.kind === "external") {
        deps.add(depSpec(r.pkg, c.slug))
        depPkgs.add(r.pkg)
        continue
      }
      if (r.kind !== "local" || !r.abs) continue
      const cl = classify(r.abs)
      const b = baseOf(r.abs)
      if (cl === "ui") {
        if (baseToSlug.has(b) && baseToSlug.get(b) !== c.slug) {
          registryDeps.add(baseToSlug.get(b)) // outro componente registrado
        } else {
          stack.push(r.abs) // companheiro → file + continua BFS
        }
      } else if (cl === "lib" && b === "utils") {
        // cn → pré-requisito, ignora
      } else if (cl === "lib" || cl === "hook" || cl === "theme") {
        if (entrySet.has(b)) {
          registryDeps.add(b)
          libItemsNeeded.add(b)
          if (FLUID_TOKEN_ENTRIES.has(b)) usesFluidTokens = true
        } else {
          stack.push(r.abs) // helper importado direto → inline
        }
      } else {
        // "other": @/components/* que NÃO é ui nem theme (ex.: showcase/*)
        // → inlina o arquivo em files[] e continua a BFS (resolve os imports
        //   DELE também: ex. CopyButton → button como registryDependency).
        stack.push(r.abs)
      }
    }
  }

  // REVISAR_CSS: animações custom sem definição conhecida
  const curatedCss = cssBySlug.get(c.slug)
  for (const a of animClasses) {
    if (BUILTIN_ANIMATIONS.has(a)) continue
    if (DEFINED_ANIMATIONS.has(a)) continue
    if (UNDEFINED_IN_SOURCE.has(a)) {
      REVISAR_CSS.push(`${c.slug}: usa animate-${a} (SEM definição no projeto / tw-animate-css ausente)`)
      continue
    }
    // animação custom não catalogada
    REVISAR_CSS.push(`${c.slug}: usa animate-${a} (animação custom não mapeada — verificar CSS)`)
  }

  if (usesFluidTokens) {
    registryDeps.add("fluid-tokens")
    libItemsNeeded.add("fluid-tokens")
  }

  // ordena files: principal primeiro
  const fileList = [...files.values()].sort((a, b) => {
    if (a === toRel(mainAbs)) return -1
    if (b === toRel(mainAbs)) return 1
    return a.localeCompare(b)
  })

  const item = {
    name: c.slug,
    type: "registry:ui",
    title: c.name,
    description: c.description,
  }
  if (deps.size) item.dependencies = [...deps].sort()
  const devDeps = devTypesFor(depPkgs)
  if (devDeps.length) item.devDependencies = devDeps
  if (registryDeps.size)
    item.registryDependencies = [...registryDeps].sort().map(regDepUrl)
  item.files = fileList.map(fileEntry)
  if (curatedCss) {
    if (Object.keys(curatedCss.theme).length)
      item.cssVars = { theme: curatedCss.theme }
    if (Object.keys(curatedCss.css).length) item.css = curatedCss.css
  }
  componentItems.push(item)
}

// ── 6. materializa itens de lib/hook/theme (entries) ─────────────────────
const libItems = []
const builtLib = new Set()

function buildLibItem(entryName) {
  if (builtLib.has(entryName)) return
  builtLib.add(entryName)
  if (entryName === "fluid-tokens") {
    libItems.push(buildFluidTokens())
    return
  }
  const entryAbs = entryPath.get(entryName)
  if (!entryAbs) return
  const files = new Map()
  const deps = new Set()
  const depPkgs = new Set()
  const registryDeps = new Set()
  const seen = new Set()
  const stack = [entryAbs]
  while (stack.length) {
    const cur = stack.pop()
    if (seen.has(cur)) continue
    seen.add(cur)
    const txt = content(cur)
    files.set(cur, toRel(cur))
    for (const spec of extractImports(txt)) {
      const r = resolveSpec(spec, cur)
      if (r.kind === "external") {
        deps.add(depSpec(r.pkg, entryName))
        depPkgs.add(r.pkg)
        continue
      }
      if (r.kind !== "local" || !r.abs) continue
      const cl = classify(r.abs)
      const b = baseOf(r.abs)
      if (cl === "lib" && b === "utils") continue
      if (cl === "ui") {
        if (baseToSlug.has(b)) registryDeps.add(baseToSlug.get(b))
        else stack.push(r.abs)
      } else if (cl === "lib" || cl === "hook" || cl === "theme") {
        if (entrySet.has(b) && b !== entryName) {
          registryDeps.add(b)
          libItemsNeeded.add(b)
        } else {
          stack.push(r.abs)
        }
      } else {
        stack.push(r.abs) // "other" → inline
      }
    }
  }
  const type = classify(entryAbs) === "hook" ? "registry:hook" : "registry:lib"
  const fileList = [...files.values()].sort()
  const item = { name: entryName, type, title: titleize(entryName) }
  if (deps.size) item.dependencies = [...deps].sort()
  const devDeps = devTypesFor(depPkgs)
  if (devDeps.length) item.devDependencies = devDeps
  if (registryDeps.size)
    item.registryDependencies = [...registryDeps].sort().map(regDepUrl)
  item.files = fileList.map(fileEntry)
  libItems.push(item)
}

function titleize(name) {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── fluid-tokens: surfaces + interaction tokens (cssVars only) ────────────
function buildFluidTokens() {
  const light = {}
  const dark = {}
  const theme = {}
  // surfaces
  const surfLight = ["#FAFAFA", "#FCFCFC", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]
  const surfDark = ["#171717", "#1E1E1E", "#252525", "#2C2C2C", "#333333", "#3A3A3A", "#414141", "#484848"]
  for (let i = 1; i <= 8; i++) {
    light[`surface-${i}`] = surfLight[i - 1]
    dark[`surface-${i}`] = surfDark[i - 1]
    theme[`--color-surface-${i}`] = `var(--surface-${i})`
    theme[`--shadow-surface-${i}`] = `var(--shadow-${i})`
  }
  // shadows (light)
  light["shadow-color"] = "rgb(0 0 0 / 0.06)"
  const sc = "var(--shadow-color)"
  const lShadows = [
    `0 0 0 1px ${sc}`,
    `0 0 0 1px ${sc}, 0 1px 1px -0.5px ${sc}`,
    `0 0 0 1px ${sc}, 0 1px 1px -0.5px ${sc}, 0 3px 3px -1.5px ${sc}`,
    `0 0 0 1px ${sc}, 0 1px 1px -0.5px ${sc}, 0 3px 3px -1.5px ${sc}, 0 6px 6px -3px ${sc}`,
    `0 0 0 1px ${sc}, 0 1px 1px -0.5px ${sc}, 0 3px 3px -1.5px ${sc}, 0 6px 6px -3px ${sc}, 0 12px 12px -6px ${sc}`,
    `0 0 0 1px ${sc}, 0 1px 1px -0.5px ${sc}, 0 3px 3px -1.5px ${sc}, 0 6px 6px -3px ${sc}, 0 12px 12px -6px ${sc}, 0 24px 24px -12px ${sc}`,
    `0 0 0 1px ${sc}, 0 1px 1px -0.5px ${sc}, 0 3px 3px -1.5px ${sc}, 0 6px 6px -3px ${sc}, 0 12px 12px -6px ${sc}, 0 24px 24px -12px ${sc}, 0 48px 48px -24px ${sc}`,
    `0 0 0 1px ${sc}, 0 1px 1px -0.5px ${sc}, 0 3px 3px -1.5px ${sc}, 0 6px 6px -3px ${sc}, 0 12px 12px -6px ${sc}, 0 24px 24px -12px ${sc}, 0 48px 48px -24px ${sc}, 0 96px 96px -48px ${sc}`,
  ]
  for (let i = 1; i <= 8; i++) light[`shadow-${i}`] = lShadows[i - 1]
  // shadows (dark) — inset highlights + ring + drop
  Object.assign(dark, {
    "dm-hi-base": "rgba(255,255,255,0.01)",
    "dm-hi-mid": "rgba(255,255,255,0.02)",
    "dm-hi-high": "rgba(255,255,255,0.04)",
    "dm-hi-peak": "rgba(255,255,255,0.06)",
    "dm-ring-base": "rgba(255,255,255,0.02)",
    "dm-ring-mid": "rgba(255,255,255,0.04)",
    "dm-ring-high": "rgba(255,255,255,0.06)",
    "dm-drop": "rgba(0,0,0,0.18)",
  })
  const dShadows = [
    "inset 0 0 0 1px var(--dm-ring-base)",
    "inset 0 1px 0 0 var(--dm-hi-base), inset 0 0 0 1px var(--dm-ring-base), 0 1px 1px -0.5px var(--dm-drop)",
    "inset 0 1px 0 0 var(--dm-hi-mid), inset 0 0 0 1px var(--dm-ring-base), 0 0 0 1px rgba(0,0,0,0.12), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop)",
    "inset 0 1px 0 0 var(--dm-hi-mid), inset 0 0 0 1px var(--dm-ring-mid), 0 0 0 1px rgba(0,0,0,0.14), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop)",
    "inset 0 1px 0 0 var(--dm-hi-high), inset 0 0 0 1px var(--dm-ring-mid), 0 0 0 1px rgba(0,0,0,0.16), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop)",
    "inset 0 1px 0 0 var(--dm-hi-high), inset 0 0 0 1px var(--dm-ring-high), 0 0 0 1px rgba(0,0,0,0.18), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop), 0 24px 24px -12px var(--dm-drop)",
    "inset 0 1px 0 0 var(--dm-hi-peak), inset 0 0 0 1px var(--dm-ring-high), 0 0 0 1px rgba(0,0,0,0.20), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop), 0 24px 24px -12px var(--dm-drop), 0 48px 48px -24px var(--dm-drop)",
    "inset 0 1px 0 0 var(--dm-hi-peak), inset 0 0 0 1px var(--dm-ring-high), 0 0 0 1px rgba(0,0,0,0.22), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop), 0 24px 24px -12px var(--dm-drop), 0 48px 48px -24px var(--dm-drop), 0 96px 96px -48px var(--dm-drop)",
  ]
  for (let i = 1; i <= 8; i++) dark[`shadow-${i}`] = dShadows[i - 1]
  // interaction tokens
  light["hover"] = "oklch(0 0 0 / 0.04)"
  light["active"] = "oklch(0 0 0 / 0.08)"
  light["destructive-light"] = "oklch(0.936 0.032 17.717)"
  light["checker-a"] = "oklch(0.92 0 0)"
  light["checker-b"] = "oklch(1 0 0)"
  dark["hover"] = "oklch(1 0 0 / 0.06)"
  dark["active"] = "oklch(1 0 0 / 0.10)"
  dark["destructive-light"] = "oklch(0.396 0.133 25.723)"
  dark["checker-a"] = "oklch(0.30 0 0)"
  dark["checker-b"] = "oklch(0.22 0 0)"
  theme["--color-hover"] = "var(--hover)"
  theme["--color-active"] = "var(--active)"
  theme["--color-destructive-light"] = "var(--destructive-light)"

  return {
    name: "fluid-tokens",
    type: "registry:lib",
    title: "Fluid Tokens",
    description:
      "Tokens compartilhados da Fluid Functionalism: superfícies elevadas (surface-1..8), sombras temáticas e tokens de interação (hover/active/destructive-light/checker). Pré-requisito de cor para os componentes (Fluid).",
    cssVars: { theme, light, dark },
    files: [],
  }
}

// resolve transitivamente todos os lib items necessários
let pending = [...libItemsNeeded]
while (pending.length) {
  const e = pending.pop()
  if (builtLib.has(e)) continue
  buildLibItem(e)
  for (const n of libItemsNeeded) if (!builtLib.has(n)) pending.push(n)
}

// ── verificação de integridade: nenhum import interno órfão ───────────────
// Para cada item, todo import @/ (ou relativo) que aponte pra um arquivo do
// projeto precisa estar coberto por: files[] do próprio item, uma
// registryDependency (componente registrado OU entry lib/hook/theme), ou o
// pré-requisito @/lib/utils (cn). Caso contrário, o JSON gerado referencia um
// módulo que o consumer NÃO recebe → quebra. Aqui isso FALHA o build.
function regDepNamesOf(item) {
  const names = new Set()
  for (const url of item.registryDependencies || []) {
    const m = url.match(/\/r\/([^/]+)\.json$/)
    if (m) names.add(m[1])
  }
  return names
}
const ORPHANS = []
for (const item of [...componentItems, ...libItems]) {
  if (!item.files || !item.files.length) continue
  const filesRel = new Set(item.files.map((f) => f.path))
  const regDeps = regDepNamesOf(item)
  for (const f of item.files) {
    const abs = resolve(ROOT, f.path)
    let txt
    try {
      txt = content(abs)
    } catch {
      continue
    }
    for (const spec of extractImports(txt)) {
      if (!spec.startsWith("@/") && !spec.startsWith("./") && !spec.startsWith("../"))
        continue
      const r = resolveSpec(spec, abs)
      if (r.kind !== "local") continue
      if (!r.abs) {
        ORPHANS.push(`${item.name}: import "${spec}" em ${f.path} NÃO resolve a um arquivo`)
        continue
      }
      const cl = classify(r.abs)
      const b = baseOf(r.abs)
      if (cl === "lib" && b === "utils") continue // cn → pré-requisito
      const rel2 = toRel(r.abs)
      if (filesRel.has(rel2)) continue // arquivo embutido no item
      if (cl === "ui" && baseToSlug.has(b) && regDeps.has(baseToSlug.get(b))) continue
      if (
        (cl === "lib" || cl === "hook" || cl === "theme") &&
        regDeps.has(b)
      )
        continue
      ORPHANS.push(
        `${item.name}: import "${spec}" (${rel2}) NÃO está em files[] nem em registryDependencies`
      )
    }
  }
}
if (ORPHANS.length) {
  console.error("\n✖ IMPORTS INTERNOS ÓRFÃOS DETECTADOS:")
  for (const o of ORPHANS) console.error("   • " + o)
  throw new Error(`Integridade do registry falhou: ${ORPHANS.length} import(s) interno(s) órfão(s).`)
}

// ── monta registry.json ──────────────────────────────────────────────────
const allItems = [...componentItems, ...libItems].sort((a, b) =>
  a.name.localeCompare(b.name)
)
const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "vitrine-ui",
  homepage: HOMEPAGE,
  items: allItems,
}
writeFileSync(resolve(ROOT, "registry.json"), JSON.stringify(registry, null, 2) + "\n")

// ── stats ────────────────────────────────────────────────────────────────
const uiCount = componentItems.length
const libCount = libItems.filter((i) => i.type === "registry:lib").length
const hookCount = libItems.filter((i) => i.type === "registry:hook").length
const withDeps = componentItems.filter((i) => i.dependencies?.length).length
const withCss = componentItems.filter((i) => i.css || i.cssVars).length
const withRegDeps = componentItems.filter((i) => i.registryDependencies?.length).length

console.log("════════════════════════════════════════════════════════")
console.log(" REGISTRY GERADO (registry.json na raiz)")
console.log("────────────────────────────────────────────────────────")
console.log(` itens registry:ui   : ${uiCount}`)
console.log(` itens registry:lib  : ${libCount}  [${libItems.filter((i) => i.type === "registry:lib").map((i) => i.name).join(", ")}]`)
console.log(` itens registry:hook : ${hookCount}  [${libItems.filter((i) => i.type === "registry:hook").map((i) => i.name).join(", ")}]`)
console.log(` total de itens      : ${allItems.length}`)
console.log(` componentes c/ deps externas    : ${withDeps}`)
console.log(` componentes c/ registryDeps     : ${withRegDeps}`)
console.log(` componentes c/ css/cssVars      : ${withCss}`)
console.log("────────────────────────────────────────────────────────")
console.log(` DEPS FORA DO package.json (${NON_PKG_DEPS.size}):`)
for (const [pkg, users] of NON_PKG_DEPS) {
  const u = [...new Set(users)]
  console.log(`   • ${pkg}  (${u.length} itens: ${u.slice(0, 6).join(", ")}${u.length > 6 ? "…" : ""})`)
}
console.log("────────────────────────────────────────────────────────")
console.log(` REVISAR_CSS (${REVISAR_CSS.length}):`)
for (const r of REVISAR_CSS) console.log("   • " + r)
console.log("════════════════════════════════════════════════════════")

// ── 3. roda shadcn build ─────────────────────────────────────────────────
if (process.env.SKIP_SHADCN_BUILD !== "1") {
  console.log("Rodando `npx shadcn@latest build`…")
  execSync("npx shadcn@latest build", { cwd: ROOT, stdio: "inherit" })
  const built = readdirSync(resolve(ROOT, "public/r")).filter((f) => f.endsWith(".json"))
  console.log(`public/r: ${built.length} arquivos JSON gerados.`)
}
