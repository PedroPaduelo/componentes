# Validação headless (Playwright)

Cada `val-<slug>.mjs` é o **validador canônico** de um componente da vitrine:
compara o componente renderizado (`http://localhost:5173/components/<slug>`)
com o site de referência via Playwright, em light e dark, e gera prints +
relatório em `_meta/scratch/shots/<slug>/`.

## Pré-requisitos

```bash
npm install --save-dev playwright   # já está em devDependencies
npx playwright install chromium
```

O dev server (`fe`, porta 5173) precisa estar no ar:

```bash
npm run dev
```

## Uso

```bash
node _meta/playwright/val-<slug>.mjs
```

Ex.: `node _meta/playwright/val-button.mjs`, `node _meta/playwright/val-glow-card-grid.mjs`.

Os artefatos (`_meta/scratch/shots/`) são gerados localmente e **não** vão pro
repo (ver `_meta/scratch/.gitignore`).

## Convenção: só `val-*.mjs` versionados

- **Só `val-*.mjs` (+ `_shots.mjs` + este `README.md`) são versionados.** São os
  validadores de regressão por componente e o helper de output.
- Scripts efêmeros de diagnóstico/probe (`probe-*`, `diag-*`, `inspect-*`,
  `debug-*`, `compare-*`, `print-*`, etc.) **não** são commitados — o `.gitignore`
  da raiz ignora tudo em `_meta/playwright/` que não seja `val-*.mjs`,
  `_shots.mjs` ou `README.md`.

## O que NÃO fazer

- **Não** escrever output em `_meta/playwright/` → é `root:root`, o shell não
  tem permissão (`EACCES`). Use sempre `_meta/scratch/shots/`.
- **Não** escrever em `/tmp` → não persiste entre comandos isolados do sandbox.
- **Não** commitar scripts efêmeros — só validadores canônicos `val-*.mjs`.

## Output: SEMPRE em `_meta/scratch/shots/`

**Regra fixa do projeto:** todo output gerado por scripts Playwright
(screenshots `.png`, JSONs de inspeção, relatórios, dumps de DOM) vai
**exclusivamente** para `/workspace/_meta/scratch/shots`.

Use o helper compartilhado `_meta/playwright/_shots.mjs`:

```js
import { shot, saveJSON, saveText, outPath, SHOTS_DIR } from "./_shots.mjs"

await shot(page, "landing-light")                 // -> _meta/scratch/shots/landing-light.png
await shot(page, "preview", { sub: "vortex" })    // -> _meta/scratch/shots/vortex/preview.png
saveJSON("vortex/inspect", data)                  // -> _meta/scratch/shots/vortex/inspect.json
saveText("dump.html", html)                       // -> _meta/scratch/shots/dump.html
const p = outPath("foo.png")                       // caminho absoluto em _meta/scratch/shots/
```

O helper cria as subpastas sozinho e ancora o caminho em
`/workspace/_meta/scratch/shots` independentemente do `cwd`.
