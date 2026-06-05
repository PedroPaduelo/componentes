/**
 * Teste da camada de derivação de família e origem (Task A).
 *
 * Não há vitest/jest no projeto e não queremos adicionar framework de teste só
 * por isso. Este script usa Node puro + `node:assert` e compila o módulo REAL
 * `src/data/families.ts` (e `src/data/components.ts`) via esbuild — que já é
 * dependência do toolchain (Vite) — resolvendo o alias `@/` → `src/`.
 *
 * Assim o teste valida a lógica de produção, não uma reimplementação.
 *
 * Uso: `node scripts/test-families.mjs`  (ou `npm test`)
 */

import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { existsSync } from "node:fs"
import { build } from "esbuild"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const srcDir = resolve(root, "src")

/** Resolve "@/x" → src/x, adicionando extensão .ts/.tsx/index quando faltar. */
function resolveAtPath(spec) {
  const base = resolve(srcDir, spec.slice(2))
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, resolve(base, "index.ts")]) {
    if (existsSync(candidate)) return candidate
  }
  return base
}

/** Compila um .ts (resolvendo alias @/) e devolve um data: URL importável. */
async function compileToDataUrl(entry) {
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent",
    plugins: [
      {
        name: "alias-at",
        setup(b) {
          b.onResolve({ filter: /^@\// }, (args) => ({ path: resolveAtPath(args.path) }))
        },
      },
    ],
  })
  return "data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64")
}

// Compila os módulos REAIS de produção e os importa.
const mod = await import(await compileToDataUrl(resolve(srcDir, "data/families.ts")))
const { components } = await import(
  await compileToDataUrl(resolve(srcDir, "data/components.ts")),
)

const { getOrigin, getFamilyBase, getFamily, groupByFamily, ORIGIN_OVERRIDES } = mod

let passed = 0
function check(label, fn) {
  fn()
  passed++
  console.log("  \u2713", label)
}

console.log("Teste da camada de família/origem (Task A)\n")

// --- Registry sanity ---
console.log("[Registry]")
check("registry tem 53 slugs", () => {
  assert.equal(components.length, 53)
})
check("ORIGIN_OVERRIDES (chanhdai) tem 20 slugs", () => {
  assert.equal(ORIGIN_OVERRIDES.size, 20)
})

// --- getOrigin: casos canônicos ---
console.log("\n[getOrigin — casos canônicos]")
check('getOrigin("button") === "shadcn"', () => {
  assert.equal(getOrigin("button"), "shadcn")
})
check('getOrigin("button-fluid") === "Fluid"', () => {
  assert.equal(getOrigin("button-fluid"), "Fluid")
})
check('getOrigin("copy-button") === "chanhdai"', () => {
  assert.equal(getOrigin("copy-button"), "chanhdai")
})
check('getOrigin("tree") === "@pierre/trees"', () => {
  assert.equal(getOrigin("tree"), "@pierre/trees")
})

// --- getOrigin: distribuição no registry ---
console.log("\n[getOrigin — distribuição no registry]")
const originCounts = { shadcn: 0, Fluid: 0, chanhdai: 0, "@pierre/trees": 0 }
for (const c of components) originCounts[getOrigin(c.slug, c.tags)]++
check("distribuição = shadcn:9, Fluid:23, chanhdai:20, @pierre/trees:1", () => {
  assert.deepEqual(originCounts, {
    shadcn: 9,
    Fluid: 23,
    chanhdai: 20,
    "@pierre/trees": 1,
  })
})
check("os 53 slugs somam exatamente as 4 origens", () => {
  const total = Object.values(originCounts).reduce((a, b) => a + b, 0)
  assert.equal(total, 53)
})

// --- getFamilyBase: normalização ---
console.log("\n[getFamilyBase — normalização]")
const baseCases = [
  ["button", "button"],
  ["button-fluid", "button"],
  ["dropdown-menu", "dropdown"],
  ["dropdown-fluid", "dropdown"],
  ["tabs", "tabs"],
  ["tabs-subtle-fluid", "tabs"],
  ["tabs-fluid", "tabs"],
  ["input", "input"],
  ["input-group-fluid", "input"],
  ["input-copy-fluid", "input"],
  ["input-message-fluid", "input"],
  ["checkbox", "checkbox"],
  ["checkbox-group-fluid", "checkbox"],
  ["radio-group-fluid", "radio"],
]
for (const [slug, expected] of baseCases) {
  check(`getFamilyBase("${slug}") === "${expected}"`, () => {
    assert.equal(getFamilyBase(slug), expected)
  })
}

// --- groupByFamily: contagens ---
console.log("\n[groupByFamily — contagens]")
const families = groupByFamily()
check("groupByFamily().length === 43", () => {
  assert.equal(families.length, 43)
})

const multi = families.filter((f) => f.variants.length > 1)
const solo = families.filter((f) => f.variants.length === 1)
check("7 famílias multi-variante", () => {
  assert.equal(multi.length, 7)
})
check("36 famílias solo", () => {
  assert.equal(solo.length, 36)
})
check("7 + 36 === 43", () => {
  assert.equal(multi.length + solo.length, 43)
})

// --- groupByFamily: famílias multi exatas ---
console.log("\n[groupByFamily — famílias multi exatas]")
const expectedMulti = {
  badge: 2,
  button: 2,
  checkbox: 2,
  dialog: 2,
  dropdown: 2,
  input: 4,
  tabs: 3,
}
const actualMulti = Object.fromEntries(multi.map((f) => [f.base, f.variants.length]))
check(
  "famílias multi = button(2), badge(2), dialog(2), dropdown(2), tabs(3), input(4), checkbox(2)",
  () => {
    assert.deepEqual(actualMulti, expectedMulti)
  },
)
check("soma das variantes multi === 17", () => {
  const sum = multi.reduce((a, f) => a + f.variants.length, 0)
  assert.equal(sum, 17)
})

// --- groupByFamily: cobertura e integridade ---
console.log("\n[groupByFamily — cobertura e integridade]")
check("soma de todas as variantes === 53 (nenhum slug fora)", () => {
  const sum = families.reduce((a, f) => a + f.variants.length, 0)
  assert.equal(sum, 53)
})
check("todos os 53 slugs do registry aparecem em alguma família", () => {
  const grouped = new Set(families.flatMap((f) => f.variants.map((v) => v.slug)))
  for (const c of components) assert.ok(grouped.has(c.slug), `slug ausente: ${c.slug}`)
  assert.equal(grouped.size, 53)
})
check("nenhuma família tem variantes duplicadas", () => {
  for (const f of families) {
    const slugs = f.variants.map((v) => v.slug)
    assert.equal(new Set(slugs).size, slugs.length, `duplicata em ${f.base}`)
  }
})
check("ordenação de groupByFamily é estável (alfabética por base, igual entre chamadas)", () => {
  const a = groupByFamily().map((f) => f.base)
  const b = groupByFamily().map((f) => f.base)
  assert.deepEqual(a, b)
  const sorted = [...a].sort((x, y) => x.localeCompare(y))
  assert.deepEqual(a, sorted)
})

// --- getFamily: variantes irmãs ---
console.log("\n[getFamily — variantes irmãs]")
check('getFamily("button-fluid") agrega button + button-fluid', () => {
  const fam = getFamily("button-fluid")
  assert.equal(fam.base, "button")
  assert.equal(fam.name, "Button")
  const slugs = fam.variants.map((v) => v.slug)
  assert.deepEqual(slugs, ["button", "button-fluid"]) // shadcn antes de Fluid
})
check('getFamily("input-copy-fluid") agrega 4 variantes de input', () => {
  const fam = getFamily("input-copy-fluid")
  assert.equal(fam.base, "input")
  assert.equal(fam.variants.length, 4)
  assert.equal(fam.variants[0].slug, "input") // shadcn primeiro
})
check('getFamily("tree") é solo com origem @pierre/trees', () => {
  const fam = getFamily("tree")
  assert.equal(fam.variants.length, 1)
  assert.deepEqual(fam.origins, ["@pierre/trees"])
})
check("família multi expõe origens distintas (button → shadcn, Fluid)", () => {
  const fam = getFamily("button")
  assert.deepEqual(fam.origins, ["shadcn", "Fluid"])
})

console.log(`\n\u2705 OK — ${passed} asserts passaram.`)
