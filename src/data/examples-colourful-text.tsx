import { ColourfulText } from "@/components/ui/colourful-text"
import type { Example } from "@/data/examples"

const colourfulTextHero: Example = {
  title: "Hero headline",
  description:
    "Passe a palavra/frase que deve ganhar o efeito colorido via prop text. As 10 cores do espectro são reembaralhadas a cada 5s; cada caractere anima com y, scale, blur e opacity em loop. Cores são fixas (brand do efeito).",
  code: `<h1 className="text-3xl font-bold text-foreground md:text-5xl">
  Construa produtos
  <br />
  <ColourfulText text="incrivelmente rápidos" />
</h1>`,
  render: (
    <h1 className="text-3xl font-bold text-foreground md:text-5xl">
      Construa produtos
      <br />
      <ColourfulText text="incrivelmente rápidos" />
    </h1>
  ),
}

const colourfulTextInline: Example = {
  title: "Frase inline curta",
  description:
    "Funciona inline dentro de qualquer parágrafo. Aqui uma única palavra-chave ganha o destaque animado sem competir com o restante do texto.",
  code: `<p className="text-lg text-foreground md:text-2xl">
  Sua próxima grande ideia começa com uma
  {" "}
  <ColourfulText text="linha de código" />.
</p>`,
  render: (
    <p className="text-lg text-foreground md:text-2xl">
      Sua próxima grande ideia começa com uma{" "}
      <ColourfulText text="linha de código" />.
    </p>
  ),
}

export const examplesColourfulText: Record<string, Example[]> = {
  "colourful-text": [colourfulTextHero, colourfulTextInline],
}
