// Helper padrão de OUTPUT do Playwright.
//
// CONVENÇÃO DO PROJETO: TODO output de scripts Playwright (screenshots, JSON de
// inspeção, relatórios, dumps de DOM, etc.) vai SEMPRE para
// /workspace/_meta/scratch/shots. Essa pasta é sandbox:sandbox (gravável pelo
// shell) e está no .gitignore via _meta/scratch/.gitignore (artefatos locais,
// não vão pro repo).
//
// NÃO escreva output em `_meta/playwright/` (é root:root → EACCES) nem em `/tmp`
// (não persiste entre comandos isolados do sandbox).
//
// Uso:
//   import { SHOTS_DIR, outPath, shot, saveJSON, saveText } from "./_shots.mjs"
//
//   await shot(page, "landing-light")              // -> _meta/scratch/shots/landing-light.png
//   await shot(page, "vortex", { sub: "vortex" })  // -> _meta/scratch/shots/vortex/vortex.png
//   saveJSON("vortex/inspect", data)               // -> _meta/scratch/shots/vortex/inspect.json
//   const p = outPath("foo.png")                   // -> caminho absoluto em _meta/scratch/shots/

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join, isAbsolute } from "node:path"

// raiz do workspace independe do cwd em que o script roda
export const SHOTS_DIR = (() => {
  const cwd = process.cwd()
  // se já estamos dentro de /workspace, ancora ali; senão usa cwd
  const root = cwd.includes("/workspace") ? "/workspace" : cwd
  return join(root, "_meta", "scratch", "shots")
})()

mkdirSync(SHOTS_DIR, { recursive: true })

/** Resolve um nome relativo para um caminho absoluto dentro de shots/. */
export function outPath(name) {
  if (isAbsolute(name)) return name
  const full = join(SHOTS_DIR, name)
  mkdirSync(dirname(full), { recursive: true })
  return full
}

/**
 * Tira screenshot do `page` salvando em shots/.
 * @param {import('playwright').Page} page
 * @param {string} name  nome sem extensão (ex.: "landing-light")
 * @param {{ sub?: string, fullPage?: boolean }} [opts] sub = subpasta (ex.: slug do componente)
 */
export async function shot(page, name, opts = {}) {
  const file = opts.sub ? `${opts.sub}/${name}.png` : `${name}.png`
  const path = outPath(file)
  await page.screenshot({ path, fullPage: opts.fullPage ?? false })
  console.log(`✓ ${path}`)
  return path
}

/** Salva JSON em shots/<name>.json (extensão opcional). */
export function saveJSON(name, data) {
  const file = name.endsWith(".json") ? name : `${name}.json`
  const path = outPath(file)
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`✓ ${path}`)
  return path
}

/** Salva texto cru em shots/<name>. */
export function saveText(name, text) {
  const path = outPath(name)
  writeFileSync(path, text)
  console.log(`✓ ${path}`)
  return path
}
