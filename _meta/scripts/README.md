# `_meta/scripts/` — scripts versionados de automação

Scripts de automação do projeto, **versionados** e organizados por finalidade.
Diferente de `_meta/playwright/` (validação headless), aqui ficam os scripts de
processamento em massa, banco e helpers.

## Subpastas

| Pasta | Para que serve |
| --- | --- |
| `lote/` | Geração, build, enriquecimento e auditoria **em massa** de componentes (ex.: `lote/chanhdai/` — print + validação de catálogo/exemplos do lote chanhdai). |
| `db/` | Scripts de banco: seed, migração auxiliar, dumps estruturados. |
| `lib/` | Helpers compartilhados entre os scripts acima (utilitários, parsers, etc.). |

## Como usar

```bash
node _meta/scripts/lote/chanhdai/validate-catalog.mjs
node _meta/scripts/lote/chanhdai/validate-examples.mjs
node _meta/scripts/lote/chanhdai/print.mjs
```

## O que NÃO fazer

- **Não** colocar validadores Playwright de componente aqui — eles vão em
  `_meta/playwright/val-*.mjs`.
- **Não** escrever output/artefato aqui — use `_meta/scratch/`.
- **Não** deixar scripts efêmeros/descartáveis versionados aqui — se é rascunho,
  vai em `_meta/scratch/`.
