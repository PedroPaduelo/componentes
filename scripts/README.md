# Scripts de validação visual

Cada `val-<slug>.mjs` é o **validador canônico** de um componente da vitrine:
compara o componente renderizado (`http://localhost:5173/components/<slug>`)
com o site de referência via Playwright, em light e dark, e gera prints +
relatório em `shots/<slug>/`.

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
node scripts/val-<slug>.mjs
```

Ex.: `node scripts/val-button.mjs`, `node scripts/val-glow-card-grid.mjs`.

Os artefatos (`shots/`) são gerados localmente e **não** vão pro repo
(`shots/` está no `.gitignore`).

## Convenção

- **Só `val-*.mjs` são versionados.** São os validadores de regressão por componente.
- Scripts efêmeros de diagnóstico/probe (`probe-*`, `diag-*`, `inspect-*`,
  `debug-*`, `_*`, etc.) **não** são commitados — o `.gitignore` ignora tudo
  em `scripts/` que não seja `val-*.mjs` ou este `README.md`.
