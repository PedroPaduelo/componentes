// scripts/_test-as-runtime.mjs
// Test runtime: cria uma rota dedicada /__test-icon-swap em index.html temporário
// que importa um entry que monta as 3 variantes.
import { chromium } from "playwright"
import { writeFileSync, readFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs"

mkdirSync("public", { recursive: true })

// Sobrescreve index.html com uma página de teste que importa um entry ad-hoc
const originalIndex = readFileSync("index.html", "utf8")
const testEntry = `import * as React from "react"
import { createRoot } from "react-dom/client"
import { Sun, Moon } from "lucide-react"
import { IconSwap } from "/src/components/ui/icon-swap.tsx"

function App() {
  return React.createElement(
    "div",
    { style: { display: "flex", gap: 16, padding: 24, alignItems: "center" } },
    React.createElement(IconSwap, { as: "button", type: "button", "aria-label": "Alternar tema", onClick: () => {}, iconOn: Sun, iconOff: Moon, active: true, iconClassName: "size-5" }),
    React.createElement(IconSwap, { "aria-label": "Modo noturno", iconOn: Sun, iconOff: Moon, active: false, iconClassName: "size-5" }),
    React.createElement(IconSwap, { iconOn: Sun, iconOff: Moon, active: true, iconClassName: "size-5" }),
  )
}

createRoot(document.getElementById("root")).render(React.createElement(App))`

writeFileSync("src/__test-icon-swap-entry.tsx", testEntry)
writeFileSync("index.html", `<!doctype html>
<html lang="pt-BR">
  <head><meta charset="UTF-8" /><title>IconSwap test</title></head>
  <body><div id="root"></div>
  <script type="module" src="/src/__test-icon-swap-entry.tsx"></script>
  </body>
</html>`)

try {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on("console", (m) => console.log("  [browser]", m.type(), m.text().slice(0, 200)))
  page.on("pageerror", (e) => console.log("  [pageerror]", e.message.slice(0, 300)))
  try {
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle", timeout: 20000 })
  } catch (e) { console.warn("warn:", e.message) }
  await page.waitForTimeout(3000)

  const result = await page.evaluate(() => {
    const wraps = Array.from(document.querySelectorAll("[data-slot='icon-swap']"))
    return wraps.map((w) => ({
      tagName: w.tagName,
      role: w.getAttribute("role"),
      ariaLabel: w.getAttribute("aria-label"),
      ariaHidden: w.getAttribute("aria-hidden"),
      type: w.getAttribute("type"),
      dataSlot: w.getAttribute("data-slot"),
      tabIndex: w.tabIndex,
      childCount: w.children.length,
    }))
  })

  console.log("\nVARIANTS:")
  console.log(JSON.stringify(result, null, 2))
  await page.screenshot({ path: "shots/icon-swap/test-as-variants.png" })
  await browser.close()
} finally {
  writeFileSync("index.html", originalIndex)
  for (const p of ["src/__test-icon-swap-entry.tsx"]) {
    if (existsSync(p)) unlinkSync(p)
  }
}
