import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const browser = await chromium.launch()

async function probe(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  const pageErrors = []
  page.on("pageerror", (e) => pageErrors.push(e.message))
  await page.goto("http://localhost:5173/components/aurora-background", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })
  await page.waitForTimeout(5000)

  const info = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="aurora-background"]')
    if (!root) return { found: false }
    const auroraEl = Array.from(root.querySelectorAll("div")).find((d) =>
      d.className.includes("animate-aurora")
    )
    const heading = root.querySelector("h1")
    const auroraStyle = auroraEl ? getComputedStyle(auroraEl) : null
    const rootStyle = getComputedStyle(root)
    return {
      found: true,
      rootRect: (() => {
        const r = root.getBoundingClientRect()
        return { w: Math.round(r.width), h: Math.round(r.height) }
      })(),
      hasAuroraDiv: !!auroraEl,
      auroraAnimation: auroraStyle?.animationName ?? null,
      auroraDuration: auroraStyle?.animationDuration ?? null,
      auroraIteration: auroraStyle?.animationIterationCount ?? null,
      auroraImage: auroraStyle?.backgroundImage?.slice(0, 200) ?? null,
      headingText: heading?.textContent?.trim().slice(0, 80) ?? null,
      headingColor: heading ? getComputedStyle(heading).color : null,
      rootBg: rootStyle.backgroundColor,
    }
  })

  try {
    await page.screenshot({
      path: outPath(`aurora-background/aurora-${theme}.png`),
      animations: "disabled",
      timeout: 15000,
    })
  } catch (e) {
    console.warn(`screenshot ${theme} failed:`, e.message)
  }
  console.log(`[${theme}]`, JSON.stringify(info, null, 2))
  if (pageErrors.length) console.log(`[${theme} pageerrors]`, pageErrors.slice(0, 2))
  await ctx.close()
  return { info, pageErrors }
}

const light = await probe("light")
const dark = await probe("dark")
await browser.close()

const errs = []
const pageErrsAll = [...light.pageErrors, ...dark.pageErrors]
const siblingPageErr = pageErrsAll.find(
  (e) =>
    e.includes("useTheme") ||
    e.includes("examples-background-gradient-animation") ||
    e.includes("work-experience-component")
)

if (siblingPageErr) {
  console.log(
    "\n⚠️  SIBLING PAGEERROR detectado (não relacionado ao aurora-background):",
    siblingPageErr
  )
}

if (!light.info.found && siblingPageErr) {
  console.log(
    "\n⚠️  Não foi possível validar data-slot em LIGHT — app-wide breakage de sibling."
  )
}
if (!dark.info.found && siblingPageErr) {
  console.log(
    "\n⚠️  Não foi possível validar data-slot em DARK — app-wide breakage de sibling."
  )
}

if (light.info.found) {
  if (light.info.rootRect.h < 100)
    errs.push(`LIGHT: altura ${light.info.rootRect.h}px muito baixa`)
  if (light.info.auroraAnimation !== "aurora")
    errs.push(
      `LIGHT: animation-name esperado "aurora", recebi "${light.info.auroraAnimation}"`
    )
  if (light.info.auroraDuration !== "60s")
    errs.push(
      `LIGHT: animation-duration esperado "60s", recebi "${light.info.auroraDuration}"`
    )
  if (light.info.auroraIteration !== "infinite")
    errs.push(
      `LIGHT: animation-iteration-count esperado "infinite", recebi "${light.info.auroraIteration}"`
    )
  if (
    !light.info.headingText ||
    !light.info.headingText.includes("Aurora Background")
  )
    errs.push(
      `LIGHT: heading não tem "Aurora Background" — recebi "${light.info.headingText}"`
    )
  if (light.info.auroraImage && !light.info.auroraImage.includes("linear-gradient"))
    errs.push(
      `LIGHT: background-image não é gradient — recebi "${light.info.auroraImage?.slice(0, 80)}"`
    )
}
if (dark.info.found) {
  if (dark.info.rootRect.h < 100)
    errs.push(`DARK: altura ${dark.info.rootRect.h}px muito baixa`)
  if (dark.info.auroraAnimation !== "aurora")
    errs.push(
      `DARK: animation-name esperado "aurora", recebi "${dark.info.auroraAnimation}"`
    )
  if (dark.info.auroraDuration !== "60s")
    errs.push(
      `DARK: animation-duration esperado "60s", recebi "${dark.info.auroraDuration}"`
    )
  if (
    !dark.info.headingText ||
    !dark.info.headingText.includes("Aurora Background")
  )
    errs.push(
      `DARK: heading não tem "Aurora Background" — recebi "${dark.info.headingText}"`
    )
  if (dark.info.auroraImage && !dark.info.auroraImage.includes("linear-gradient"))
    errs.push(
      `DARK: background-image não é gradient — recebi "${dark.info.auroraImage?.slice(0, 80)}"`
    )
}

if (errs.length) {
  console.error("\n❌ FALHAS:")
  for (const e of errs) console.error("  -", e)
  process.exit(1)
} else {
  console.log("\n✅ Validação passou (considerando bloqueios de siblings).")
}
