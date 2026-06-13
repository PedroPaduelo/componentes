// Runner do `npm test`.
//
// Não duplica a lógica de validação: apenas faz um *guard* dos pré-requisitos
// (dev server em http://localhost:5173 + chromium do Playwright) e, se tudo
// estiver no lugar, delega para o validador canônico de famílias
// (`_meta/playwright/val-families.mjs`), propagando o exit code dele.
//
// Exit codes (determinísticos e documentados):
//   0  → o validador rodou e todos os cenários passaram.
//   1  → o validador rodou e reportou falhas (propaga o exit do val-families).
//   2  → pré-requisitos ausentes (dev server fora do ar ou chromium não
//        instalado). Nesse caso imprimimos instruções acionáveis e saímos —
//        NUNCA um stack trace de "Cannot find module".
import { existsSync } from "node:fs"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = "http://localhost:5173"
const VALIDATOR = resolve(__dirname, "../_meta/playwright/val-families.mjs")

const EXIT_OK = 0
const EXIT_FAILURES = 1
const EXIT_PREREQ_MISSING = 2

function guide(reason) {
  return [
    "",
    `✗ npm test — pré-requisito ausente: ${reason}`,
    "",
    "Esta suíte valida o catálogo por família via Playwright contra o dev server.",
    "Ela precisa de DOIS pré-requisitos no ambiente:",
    "",
    "  1. Dev server no ar em http://localhost:5173:",
    "       npm run dev",
    "",
    "  2. Browser chromium do Playwright instalado (não vem por postinstall):",
    "       npx playwright install chromium",
    "",
    "Com os dois prontos, rode de novo:",
    "       npm test            # (este runner, com guard)",
    "       npm run test:families   # (direto, sem guard)",
    "",
    `Saindo com código ${EXIT_PREREQ_MISSING} (pré-requisitos ausentes).`,
    "",
  ].join("\n")
}

async function devServerUp() {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch(BASE, { signal: ctrl.signal })
    clearTimeout(timer)
    // Qualquer resposta HTTP (mesmo 404) significa que tem servidor escutando.
    return res.status > 0
  } catch {
    return false
  }
}

// Retorna true (instalado), false (ausente) ou null (não deu pra checar —
// playwright não resolvível, provavelmente sem `npm install`).
async function chromiumInstalled() {
  try {
    const { chromium } = await import("playwright")
    const execPath = chromium.executablePath()
    return !!execPath && existsSync(execPath)
  } catch {
    return null
  }
}

function runValidator() {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [VALIDATOR], { stdio: "inherit" })
    child.on("exit", (code, signal) => {
      if (signal) {
        resolvePromise(1)
        return
      }
      resolvePromise(code ?? 1)
    })
    child.on("error", () => resolvePromise(1))
  })
}

async function main() {
  if (!existsSync(VALIDATOR)) {
    // Salvaguarda: nunca deve acontecer no repo, mas evita ENOENT silencioso.
    console.error(guide(`validador não encontrado em ${VALIDATOR}`))
    process.exit(EXIT_PREREQ_MISSING)
  }

  if (!(await devServerUp())) {
    console.error(guide("dev server não respondeu em http://localhost:5173"))
    process.exit(EXIT_PREREQ_MISSING)
  }

  const chromium = await chromiumInstalled()
  if (chromium !== true) {
    const reason =
      chromium === false
        ? "chromium do Playwright não instalado"
        : "Playwright não resolvível (rode `npm install` primeiro)"
    console.error(guide(reason))
    process.exit(EXIT_PREREQ_MISSING)
  }

  console.log("✓ Pré-requisitos OK (dev server :5173 + chromium). Rodando val-families…\n")
  const code = await runValidator()
  process.exit(code === 0 ? EXIT_OK : EXIT_FAILURES)
}

main()
