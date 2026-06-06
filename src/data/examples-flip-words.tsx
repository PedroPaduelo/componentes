import { FlipWords } from "@/components/ui/flip-words"
import type { Example } from "@/data/examples"

const flipWordsBasic: Example = {
  title: "Básico",
  description:
    "FlipWords cicla por uma lista de palavras: cada palavra entra com stagger por letra (blur → nítido) e sai com blur dramático (scale 2, x+40, y-40). Tema segue token semântico text-foreground.",
  code: `<h1 className="text-2xl font-bold text-foreground md:text-4xl">
  Construa coisas
  <FlipWords
    words={["rápido", "bonitas", "modernas", "acessíveis"]}
    className="text-primary"
  />
</h1>`,
  render: (
    <h1 className="text-2xl font-bold text-foreground md:text-4xl">
      Construa coisas
      <FlipWords
        words={["rápido", "bonitas", "modernas", "acessíveis"]}
        className="text-primary"
      />
    </h1>
  ),
}

const flipWordsCustom: Example = {
  title: "Ritmo customizado",
  description:
    "duration controla o tempo em tela de cada palavra. Aqui 1.2s cria um efeito de 'digitando' rápido, útil para hero pages com copy curta.",
  code: `<p className="text-xl text-foreground md:text-2xl">
  Somos uma equipe
  <FlipWords
    words={["criativa", "obstinada", "humilde", "curiosa"]}
    duration={1200}
    className="px-2 font-semibold text-foreground"
  />
  que entrega software.
</p>`,
  render: (
    <p className="text-xl text-foreground md:text-2xl">
      Somos uma equipe
      <FlipWords
        words={["criativa", "obstinada", "humilde", "curiosa"]}
        duration={1200}
        className="px-2 font-semibold text-foreground"
      />
      que entrega software.
    </p>
  ),
}

export const examplesFlipWords: Record<string, Example[]> = {
  "flip-words": [flipWordsBasic, flipWordsCustom],
}
