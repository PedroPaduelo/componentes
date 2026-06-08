// scripts/val-code-block.mjs
// Validação visual/funcional do CodeBlock (Aceternity UI) na vitrine.
// Verifica: render de 3 instâncias (básico/tabs/highlight), syntax highlight
// com 58 linhas totais, troca de aba reativa (linguagem + conteúdo), botão
// copy com feedback de 2s, dark mode preservando slate-900 (brand dark), e
// ausência de console errors.
//
// Uso: node scripts/val-code-block.mjs
import { chromium } from "playwright"

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"])
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`)
  })

  await page.goto("http://localhost:5173/components/code-block", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  })
  await page.waitForTimeout(2500)

  const initial = await page.evaluate(() => {
    const roots = Array.from(document.querySelectorAll("[data-slot=code-block]"))
    return {
      instances: roots.length,
      withTabs: roots.filter((r) => r.getAttribute("data-tabs") === "true").length,
      withFilename: roots.filter((r) => r.querySelector("[data-slot=code-block-header]")).length,
      copyButtons: document.querySelectorAll("[data-slot=code-block-copy]").length,
      totalLines: document.querySelectorAll("[data-slot=code-block-content] [data-line]").length,
      activeTab: document.querySelector("[data-slot=code-block-tab][data-active=true]")?.textContent,
      highlightedLines: document.querySelectorAll("[data-slot=code-block-content] [data-highlighted=true]").length,
    }
  })

  // Trocar pra tab "tabs.py" (3ª aba)
  await page.click("[data-slot=code-block-tab]:nth-of-type(3)")
  await page.waitForTimeout(800)
  const afterTabSwitch = await page.evaluate(() => {
    const roots = Array.from(document.querySelectorAll("[data-slot=code-block]"))
    const tabsInstance = roots.find((r) => r.getAttribute("data-tabs") === "true")
    return {
      activeTab: tabsInstance?.querySelector("[data-slot=code-block-tab][data-active=true]")?.textContent,
      language: tabsInstance?.getAttribute("data-language"),
      firstLine: tabsInstance?.querySelector("[data-slot=code-block-content] [data-line]")?.textContent?.slice(0, 60),
    }
  })

  // Clicar no primeiro botão copy (counter.tsx)
  const copyBtn = page.locator("[data-slot=code-block-copy]").first()
  await copyBtn.click()
  await page.waitForTimeout(500)
  const copy = await page.evaluate(async () => {
    const btn = document.querySelector("[data-slot=code-block-copy]")
    const clipboard = await navigator.clipboard
      .readText()
      .then((t) => t.slice(0, 80))
      .catch(() => "ERR")
    return { copied: btn?.getAttribute("data-copied"), clipboardPreview: clipboard }
  })
  await page.waitForTimeout(2200)
  const copiedAfter2s = await page.evaluate(
    () => document.querySelector("[data-slot=code-block-copy]")?.getAttribute("data-copied"),
  )

  await page.screenshot({ path: "shots/code-block-light.png", fullPage: true })

  // Dark mode (após reload com localStorage pré-populado)
  await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  await page.reload({ waitUntil: "domcontentloaded" })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: "shots/code-block-dark.png", fullPage: true })
  const darkBg = await page.evaluate(() => {
    const root = document.querySelector("[data-slot=code-block]")
    return root ? getComputedStyle(root).backgroundColor : "MISSING"
  })

  const summary = {
    initial,
    afterTabSwitch,
    copy: { ...copy, copiedAfter2s },
    darkBg,
    errors,
  }
  console.log(JSON.stringify(summary, null, 2))

  // Score simples: tudo verde se 3 instâncias + 58 linhas + troca de aba + copy + dark
  const ok =
    initial.instances === 3 &&
    initial.withTabs === 1 &&
    initial.withFilename === 2 &&
    initial.copyButtons === 3 &&
    initial.totalLines === 58 &&
    initial.highlightedLines === 4 &&
    afterTabSwitch.activeTab === "tabs.py" &&
    afterTabSwitch.language === "py" &&
    copy.copied === "true" &&
    copiedAfter2s === "false" &&
    darkBg.includes("oklch(0.208") &&
    errors.length === 0
  console.log(ok ? "✅ val-code-block: PASS" : "❌ val-code-block: FAIL")
  process.exitCode = ok ? 0 : 1
} finally {
  await browser.close()
}
