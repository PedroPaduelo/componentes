import { Typography } from "@/components/ui/typography"

import type { Example } from "./examples"

const headingsExample: Example = {
  title: "Títulos (h1–h4)",
  description:
    "A escala de títulos. Cada variante renderiza o elemento semântico correto (h1–h4) com peso e tracking proporcionais.",
  code: `import { Typography } from "@/components/ui/typography"

export function Demo() {
  return (
    <div className="space-y-3">
      <Typography variant="h1">Imposto sobre a piada</Typography>
      <Typography variant="h2">Como funciona</Typography>
      <Typography variant="h3">O rei e o reino</Typography>
      <Typography variant="h4">Detalhes da cobrança</Typography>
    </div>
  )
}`,
  render: (
    <div className="space-y-3">
      <Typography variant="h1">Imposto sobre a piada</Typography>
      <Typography variant="h2">Como funciona</Typography>
      <Typography variant="h3">O rei e o reino</Typography>
      <Typography variant="h4">Detalhes da cobrança</Typography>
    </div>
  ),
}

const proseExample: Example = {
  title: "Parágrafo, lead e ênfases",
  description:
    "Corpo de texto: `lead` para o subtítulo de abertura, `p` para parágrafos e `large`/`small`/`muted` para ênfases.",
  code: `import { Typography } from "@/components/ui/typography"

export function Demo() {
  return (
    <div className="max-w-xl">
      <Typography variant="lead">
        Um decreto real instituiu um imposto sobre toda piada contada no reino.
      </Typography>
      <Typography variant="p">
        O povo, claro, não achou a menor graça — e foi justamente esse o ponto.
      </Typography>
      <Typography variant="large">Resumo do trimestre</Typography>
      <Typography variant="small">Atualizado há 2 minutos</Typography>
      <Typography variant="muted">Sujeito a alterações sem aviso.</Typography>
    </div>
  )
}`,
  render: (
    <div className="max-w-xl">
      <Typography variant="lead">
        Um decreto real instituiu um imposto sobre toda piada contada no reino.
      </Typography>
      <Typography variant="p">
        O povo, claro, não achou a menor graça — e foi justamente esse o ponto.
      </Typography>
      <Typography variant="large">Resumo do trimestre</Typography>
      <Typography variant="small">Atualizado há 2 minutos</Typography>
      <Typography variant="muted">Sujeito a alterações sem aviso.</Typography>
    </div>
  ),
}

const blockExample: Example = {
  title: "Citação, lista e código inline",
  description:
    "Blocos de prose: `blockquote` (citação), `list` (lista com marcadores) e `inlineCode` para trechos de código no meio do texto.",
  code: `import { Typography } from "@/components/ui/typography"

export function Demo() {
  return (
    <div className="max-w-xl">
      <Typography variant="blockquote">
        "Depois de todos, a única piada de graça era a própria taxa."
      </Typography>
      <Typography variant="list">
        <li>1ª piada do dia: isenta</li>
        <li>Trocadilhos: alíquota dobrada</li>
        <li>Piada de tiozão: confisco</li>
      </Typography>
      <Typography variant="p">
        Rode <Typography asChild variant="inlineCode"><code>npm run dev</code></Typography> para começar.
      </Typography>
    </div>
  )
}`,
  render: (
    <div className="max-w-xl">
      <Typography variant="blockquote">
        "Depois de todos, a única piada de graça era a própria taxa."
      </Typography>
      <Typography variant="list">
        <li>1ª piada do dia: isenta</li>
        <li>Trocadilhos: alíquota dobrada</li>
        <li>Piada de tiozão: confisco</li>
      </Typography>
      <Typography variant="p">
        Rode{" "}
        <Typography asChild variant="inlineCode">
          <code>npm run dev</code>
        </Typography>{" "}
        para começar.
      </Typography>
    </div>
  ),
}

export const examplesTypography: Record<string, Example[]> = {
  typography: [headingsExample, proseExample, blockExample],
}
