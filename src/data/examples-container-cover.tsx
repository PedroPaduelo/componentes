import { ContainerCover } from "@/components/ui/container-cover"
import type { Example } from "@/data/examples"

const headlineExample: Example = {
  title: "Headline com destaque",
  description:
    "Passe o mouse sobre o trecho destacado: o fundo escurece, partículas e beams varrem a área e o texto encolhe levemente.",
  code: `<h1 className="text-center text-3xl font-semibold sm:text-4xl">
  Construa interfaces{" "}
  <ContainerCover>incríveis</ContainerCover>{" "}
  em minutos
</h1>`,
  render: (
    <h1 className="max-w-xl text-center text-3xl font-semibold text-foreground sm:text-4xl">
      Construa interfaces{" "}
      <ContainerCover>incríveis</ContainerCover> em minutos
    </h1>
  ),
}

const inlineExample: Example = {
  title: "Destaque inline em parágrafo",
  description:
    "O efeito funciona inline no meio de um parágrafo, preservando o fluxo do texto ao redor.",
  code: `<p className="max-w-md text-center text-lg">
  Velocidade que parece{" "}
  <ContainerCover>mágica</ContainerCover>{" "}
  para o seu time de produto.
</p>`,
  render: (
    <p className="max-w-md text-center text-lg text-foreground">
      Velocidade que parece{" "}
      <ContainerCover>mágica</ContainerCover> para o seu time de produto.
    </p>
  ),
}

export const examplesContainerCover: Record<string, Example[]> = {
  "container-cover": [headlineExample, inlineExample],
}
