# `_meta/scratch/` — rascunhos e artefatos efêmeros

Tudo aqui é **descartável e gitignored**. É o lugar para:

- Output de scripts Playwright: `shots/`, `tmp-shots/` (screenshots, JSONs de
  inspeção, relatórios, dumps de DOM).
- Rascunhos temporários, arquivos de "teste rápido", dumps de debug.
- Qualquer coisa que você quer escrever no disco mas **não** quer no repo.

## Política de versionamento

O `.gitignore` desta pasta ignora **tudo** exceto ele mesmo e este `README.md`:

```
*
!.gitignore
!README.md
```

Ou seja: nada criado aqui vai pro git. Pode escrever à vontade.

## Como usar

- Scripts Playwright escrevem aqui via o helper `_meta/playwright/_shots.mjs`
  (ancorado em `_meta/scratch/shots`).
- Para um rascunho manual, é só criar o arquivo aqui — ele será ignorado.

## O que NÃO fazer

- **Não** dependa de nada aqui para o build ou o runtime — é efêmero.
- **Não** force `git add -f` de artefatos daqui — se algo precisa ser
  versionado, ele não pertence ao scratch.
