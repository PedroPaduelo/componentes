// scripts/val-consent-manager.mjs
// Validação visual Playwright — consent-manager
// DIFERENÇA IMPORTANTE: chanhdai.com NÃO tem demo interativo aberto na página
// do consent-manager. É uma página de documentação (descrição, instalação, código).
// A vitrine adiciona um trigger "Gerenciar cookies" + Dialog interativo com 3 switches
// (1 disabled essential + 2 enabled). Padrão shadcn de showcase.

import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("consent-manager")
mkdirSync(OUT, { recursive: true })

const ORIGINAL = "https://chanhdai.com/components/consent-manager"
const VITRINE = "http://localhost:5173/components/consent-manager"
const VP = { width: 1440, height: 900 }

const browser = await chromium.launch()
const report = {
  component: "consent-manager",
  timestamp: new Date().toISOString(),
  screenshots: [],
  domInspect: {},
  interactions: [],
  issues: [],
  score: 0,
}

async function screenshot(page, name) {
  const path = `${OUT}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  report.screenshots.push(name)
  console.log(`✓ ${path}`)
}

async function inspectDOM(page, label) {
  const data = await page.evaluate(() => {
    const root = document.querySelector("[data-slot='consent-manager']") ||
                 document.querySelector("[data-slot*='consent']") ||
                 document.querySelector("[role='dialog']") ||
                 document.querySelector("main") ||
                 document.body

    const rootRect = root.getBoundingClientRect()
    const rootStyle = getComputedStyle(root)

    const switches = Array.from(
      root.querySelectorAll("button[role='switch'], input[type='checkbox'], [data-slot*='switch']")
    ).map((el) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return {
        tag: el.tagName,
        label: el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 60) || "",
        checked: el.getAttribute("aria-checked") || (el.checked != null ? el.checked.toString() : "unknown"),
        dataState: el.getAttribute("data-state") || null,
        rect: { w: Math.round(r.width), h: Math.round(r.height) },
        bg: s.backgroundColor,
        color: s.color,
        disabled: el.disabled || el.getAttribute("disabled") !== null,
      }
    })

    const buttons = Array.from(
      root.querySelectorAll("button:not([role='switch']):not([aria-hidden='true'])")
    ).map((el) => ({
      text: el.textContent?.trim().slice(0, 60) || "",
      type: el.getAttribute("type") || "button",
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
      bg: getComputedStyle(el).backgroundColor,
    }))

    const dialog = document.querySelector("[role='dialog']")
    const dialogInfo = dialog ? {
      rect: (() => { const r = dialog.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
      visible: dialog.getAttribute("data-state") !== "closed",
      title: dialog.querySelector("h1, h2, h3, [data-slot='dialog-title']")?.textContent?.trim().slice(0, 80) || "",
      description: dialog.querySelector("p, [data-slot='dialog-description']")?.textContent?.trim().slice(0, 120) || "",
    } : null

    // CSS custom properties do :root
    const rootStyleEl = getComputedStyle(document.documentElement)
    const cssVars = {}
    for (const prop of rootStyleEl) {
      if (prop.startsWith("--")) cssVars[prop] = rootStyleEl.getPropertyValue(prop).trim()
    }

    const trigger = Array.from(document.querySelectorAll("button")).find(b =>
      /cookie|consent|gerenciar/i.test(b.textContent || "")
    )

    return {
      root: {
        tag: root.tagName,
        dataSlot: root.dataset?.slot || null,
        rect: { w: Math.round(rootRect.width), h: Math.round(rootRect.height) },
        bg: rootStyle.backgroundColor,
        color: rootStyle.color,
        dataTheme: root.dataset?.theme || null,
      },
      dialog: dialogInfo,
      trigger: trigger ? {
        text: trigger.textContent?.trim().slice(0, 60),
        rect: (() => { const r = trigger.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
      } : null,
      switches,
      buttons,
      cssVars: Object.fromEntries(
        Object.entries(cssVars).filter(([k]) =>
          k.match(/background|foreground|primary|accent|muted|border|ring|card|popover|destructive|secondary|input|radius/i)
        )
      ),
    }
  })
  writeFileSync(`${OUT}/inspect-${label}.json`, JSON.stringify(data, null, 2))
  report.domInspect[label] = data
  console.log(`✓ ${OUT}/inspect-${label}.json`)
  return data
}

// ─── ORIGINAL LIGHT ────────────────────────────────────────────────
const ctxOrig = await browser.newContext({ viewport: VP })
const pageOrig = await ctxOrig.newPage()
await pageOrig.goto(ORIGINAL, { waitUntil: "networkidle", timeout: 30000 })
await pageOrig.waitForTimeout(3500)
await screenshot(pageOrig, "original-light")
await inspectDOM(pageOrig, "original")

// Tenta encontrar o trigger, se houver
const origTrigger = pageOrig.locator("button").filter({ hasText: /(cookie|consent|manage|open)/i }).first()
const origTriggerCount = await origTrigger.count()
if (origTriggerCount > 0) {
  const triggerText = await origTrigger.textContent()
  if (triggerText && triggerText.trim().length > 0 && triggerText.length < 50) {
    await origTrigger.click()
    await pageOrig.waitForTimeout(1500)
    await screenshot(pageOrig, "original-light-dialog")
    await inspectDOM(pageOrig, "original-dialog")
  }
}
await pageOrig.close()
await ctxOrig.close()

// ─── ORIGINAL DARK ─────────────────────────────────────────────
const ctxOrigDark = await browser.newContext({ viewport: VP, colorScheme: "dark" })
const pageOrigDark = await ctxOrigDark.newPage()
await pageOrigDark.goto(ORIGINAL, { waitUntil: "networkidle", timeout: 30000 })
await pageOrigDark.waitForTimeout(3500)
await screenshot(pageOrigDark, "original-dark")
await inspectDOM(pageOrigDark, "original-dark")
await pageOrigDark.close()
await ctxOrigDark.close()

// ─── VITRINE LIGHT ──────────────────────────────────────────────
const ctxVit = await browser.newContext({ viewport: VP })
const pageVit = await ctxVit.newPage()
await pageVit.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
await pageVit.goto(VITRINE, { waitUntil: "networkidle", timeout: 30000 })
await pageVit.waitForTimeout(2500)
await screenshot(pageVit, "vitrine-light")
await inspectDOM(pageVit, "vitrine-light")

// Abre o dialog
const vitTrigger = pageVit.locator("button").filter({ hasText: /(cookie|consent|gerenciar)/i }).first()
if (await vitTrigger.count() > 0) {
  await vitTrigger.click()
  await pageVit.waitForTimeout(1500)
  await screenshot(pageVit, "vitrine-light-dialog")
  await inspectDOM(pageVit, "vitrine-dialog")
} else {
  report.issues.push({ severity: "high", category: "structure", detail: "Trigger de consent-manager não encontrado na vitrine" })
}

// ─── INTERAÇÕES VITRINE LIGHT ───────────────────────────────────
const dialog = pageVit.locator("[role='dialog']")
const enabledSwitches = dialog.locator("button[role='switch']:not([disabled])")
const allSwitches = dialog.locator("button[role='switch']")
const firstSwitch = enabledSwitches.first()

// Aceita PT e EN
const acceptBtn = dialog.locator("button").filter({ hasText: /(aceitar tudo|accept all)/i }).first()
const rejectBtn = dialog.locator("button").filter({ hasText: /(rejeitar tudo|reject all)/i }).first()
const saveBtn = dialog.locator("button").filter({ hasText: /(salvar|save)/i }).first()

// Hover em um switch
if (await firstSwitch.count() > 0) {
  const before = await firstSwitch.evaluate(el => getComputedStyle(el).backgroundColor)
  await firstSwitch.hover()
  await pageVit.waitForTimeout(500)
  const after = await firstSwitch.evaluate(el => getComputedStyle(el).backgroundColor)
  await screenshot(pageVit, "vitrine-light-hover-switch")
  report.interactions.push({
    name: "hover-switch",
    status: "ok",
    note: before !== after ? "cor mudou no hover" : "cor não mudou (pode ser intencional — shadcn Switch não muda bg no hover)",
  })
} else {
  report.interactions.push({ name: "hover-switch", status: "skip", reason: "nenhum switch enabled encontrado" })
}

// Toggle manual
if (await firstSwitch.count() > 0) {
  const beforeChecked = await firstSwitch.getAttribute("aria-checked")
  await firstSwitch.click()
  await pageVit.waitForTimeout(500)
  const afterChecked = await firstSwitch.getAttribute("aria-checked")
  await screenshot(pageVit, "vitrine-light-switch-toggled")
  report.interactions.push({
    name: "toggle-switch",
    status: beforeChecked !== afterChecked ? "ok" : "warn",
    before: beforeChecked,
    after: afterChecked,
  })
}

// Reject All
if (await rejectBtn.count() > 0) {
  await rejectBtn.click()
  await pageVit.waitForTimeout(800)
  await screenshot(pageVit, "vitrine-light-reject-all")
  const total = await allSwitches.count()
  const enabledTotal = await enabledSwitches.count()
  const checked = await enabledSwitches.evaluateAll(els => els.filter(e => e.getAttribute("aria-checked") === "true").length)
  report.interactions.push({
    name: "reject-all",
    status: checked === 0 ? "ok" : "warn",
    checked,
    total,
    enabledTotal,
    note: checked === 0 ? "todos os enabled desmarcados" : `${checked}/${enabledTotal} enabled ainda marcados`,
  })
} else {
  report.interactions.push({ name: "reject-all", status: "skip", reason: "botão Reject All/Rejeitar tudo não encontrado" })
}

// Accept All
if (await acceptBtn.count() > 0) {
  await acceptBtn.click()
  await pageVit.waitForTimeout(800)
  await screenshot(pageVit, "vitrine-light-accept-all")
  const total = await allSwitches.count()
  const enabledTotal = await enabledSwitches.count()
  const checked = await enabledSwitches.evaluateAll(els => els.filter(e => e.getAttribute("aria-checked") === "true").length)
  report.interactions.push({
    name: "accept-all",
    status: checked === enabledTotal ? "ok" : "warn",
    checked,
    total,
    enabledTotal,
    note: checked === enabledTotal ? "todos os enabled marcados" : `${checked}/${enabledTotal} enabled marcados`,
  })
} else {
  report.interactions.push({ name: "accept-all", status: "skip", reason: "botão Accept All/Aceitar tudo não encontrado" })
}

// Save Preferences
if (await saveBtn.count() > 0) {
  report.interactions.push({ name: "save-preferences", status: "found" })
} else {
  report.interactions.push({ name: "save-preferences", status: "not-found", note: "botão pode estar implícito no Accept All/Reject All" })
}

// Persistência — primeiro verifica localStorage atual
const lsBefore = await pageVit.evaluate(() => {
  const result = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    result[key] = localStorage.getItem(key)
  }
  return result
})
report.interactions.push({
  name: "localstorage-before-reload",
  status: "info",
  state: lsBefore,
})

// Reload
await pageVit.reload({ waitUntil: "networkidle" })
await pageVit.waitForTimeout(2500)
await screenshot(pageVit, "vitrine-light-after-reload")

// Reabrir dialog
const vitTriggerReload = pageVit.locator("button").filter({ hasText: /(cookie|consent|gerenciar)/i }).first()
if (await vitTriggerReload.count() > 0) {
  await vitTriggerReload.click()
  await pageVit.waitForTimeout(1500)
  await screenshot(pageVit, "vitrine-light-after-reload-dialog")
  await inspectDOM(pageVit, "vitrine-after-reload-dialog")

  const total = await allSwitches.count()
  const enabledTotal = await enabledSwitches.count()
  const checked = await enabledSwitches.evaluateAll(els => els.filter(e => e.getAttribute("aria-checked") === "true").length)
  // A vitrine é uma DEMO (description diz "Demo — sem persistência")
  // então "warn" é OK — não é bug
  report.interactions.push({
    name: "persist-after-reload",
    status: enabledTotal > 0 ? "info" : "skip",
    checked,
    total,
    enabledTotal,
    note: enabledTotal > 0
      ? (checked === enabledTotal
          ? "estado persistido"
          : `estado não persistiu após reload (esperado — vitrine é demo, diz "Demo — sem persistência" na descrição do dialog)`)
      : "sem switches enabled pra verificar",
  })
}

await pageVit.close()
await ctxVit.close()

// ─── VITRINE DARK ─────────────────────────────────────────────
const ctxDark = await browser.newContext({ viewport: VP })
const pageDark = await ctxDark.newPage()
await pageDark.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
await pageDark.goto(VITRINE, { waitUntil: "networkidle", timeout: 30000 })
await pageDark.waitForTimeout(2500)
await screenshot(pageDark, "vitrine-dark")
await inspectDOM(pageDark, "vitrine-dark")

const vitTriggerDark = pageDark.locator("button").filter({ hasText: /(cookie|consent|gerenciar)/i }).first()
if (await vitTriggerDark.count() > 0) {
  await vitTriggerDark.click()
  await pageDark.waitForTimeout(1500)
  await screenshot(pageDark, "vitrine-dark-dialog")
  await inspectDOM(pageDark, "vitrine-dark-dialog")
}

await pageDark.close()
await ctxDark.close()

// ─── COMPARAÇÃO ──────────────────────────────────────────────
const vitDialog = report.domInspect["vitrine-dialog"]
const origDialog = report.domInspect["original-dialog"]
const vitDarkDialog = report.domInspect["vitrine-dark-dialog"]
const origDarkDialog = report.domInspect["original-dark-dialog"]
const issues = []

// Como o original não tem demo interativo, não há switches/botões do dialog
// pra comparar. A comparação é sobre:
// 1. Página renderiza OK
// 2. Vitrine adiciona um trigger + dialog interativo (3 switches + 3 botões)
// 3. Tema light/dark funciona

if (!vitDialog || !vitDialog.dialog || !vitDialog.dialog.visible) {
  issues.push({ severity: "high", category: "vitrine", detail: "Dialog do consent-manager não abriu na vitrine" })
}

if (vitDialog && vitDialog.switches.length < 2) {
  issues.push({ severity: "medium", category: "vitrine", detail: `Poucos switches no dialog da vitrine: ${vitDialog.switches.length}` })
}

// Tema dark — verifica que o background do dialog dark é diferente do light
if (vitDialog && vitDarkDialog) {
  const lightBg = vitDialog.root.bg
  const darkBg = vitDarkDialog.root.bg
  if (lightBg === darkBg) {
    issues.push({
      severity: "medium",
      category: "theme",
      detail: `Background do root idêntico em light e dark: ${lightBg}`,
    })
  }
}

for (const ix of report.interactions) {
  if (ix.status === "warn") {
    issues.push({
      severity: "medium",
      category: "interaction",
      detail: `Interação "${ix.name}" com comportamento inesperado: ${JSON.stringify(ix)}`,
    })
  }
}

report.issues = issues

const high = issues.filter(i => i.severity === "high").length
const medium = issues.filter(i => i.severity === "medium").length
const low = issues.filter(i => i.severity === "low").length
report.score = Math.max(0, 100 - (high * 20 + medium * 10 + low * 5))

writeFileSync(`${OUT}/report-data.json`, JSON.stringify(report, null, 2))
console.log(`✓ ${OUT}/report-data.json`)

await browser.close()
console.log(`\n✅ Validação completa: ${OUT}/ — Score ${report.score}/100 — ${issues.length} problemas`)
