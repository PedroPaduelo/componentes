# `_meta/tests/` — testes auxiliares

Testes auxiliares e sandboxes de teste que **não** fazem parte da suíte de
produção (não rodam no CI principal). Use para experimentos de teste, scripts
de verificação pontual versionados, ou setups de teste exploratório.

## Como usar

Coloque aqui scripts/arquivos de teste que valem a pena versionar mas que não
pertencem a `src/`. Documente no topo de cada arquivo como rodá-lo.

## O que NÃO fazer

- **Não** colocar testes de produção aqui — esses ficam junto ao código em
  `src/` (ou onde o framework de teste do projeto espera).
- **Não** deixar artefatos de saída aqui — use `_meta/scratch/`.
