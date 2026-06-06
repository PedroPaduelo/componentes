import { WobbleCard } from "@/components/ui/wobble-card"

import type { Example } from "./examples"

const wobbleCardBasic: Example = {
  title: "Básico (com gradiente)",
  description:
    "Card Aceternity que balança seguindo o cursor: o container translada na direção do mouse e o conteúdo faz o movimento inverso + leve scale (1.03). Inclui um noise overlay sutil via SVG fractalNoise inline. Passe `containerClassName` para trocar a cor/gradiente de fundo.",
  code: `<WobbleCard containerClassName="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
  <div className="flex flex-col gap-3">
    <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
      Aceternity · Wobble Card
    </span>
    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
      Passe o mouse aqui
    </h2>
    <p className="max-w-md text-sm opacity-90 sm:text-base">
      O card inteiro balança conforme você move o cursor, criando uma
      sensação de profundidade. O conteúdo translada na direção oposta
      e ganha um leve zoom.
    </p>
  </div>
</WobbleCard>`,
  render: (
    <div className="w-full">
      <WobbleCard containerClassName="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Aceternity · Wobble Card
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Passe o mouse aqui
          </h2>
          <p className="max-w-md text-sm opacity-90 sm:text-base">
            O card inteiro balança conforme você move o cursor, criando
            uma sensação de profundidade. O conteúdo translada na
            direção oposta e ganha um leve zoom.
          </p>
        </div>
      </WobbleCard>
    </div>
  ),
}

const wobbleCardPlain: Example = {
  title: "Com imagem",
  description:
    "Mesma mecânica, agora com `bg-card` (token shadcn, reage a dark/light) e uma imagem picsum. O `min-h-[500px]` do container mantém a perspectiva do tilt perceptível.",
  code: `<WobbleCard>
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
    <img
      src="https://picsum.photos/seed/wobble/240/240"
      alt=""
      className="h-32 w-32 rounded-xl object-cover"
    />
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold tracking-tight">
        Wobble + tema
      </h2>
      <p className="text-sm text-muted-foreground">
        Em dark mode o card fica escuro; em light mode, claro. O
        noise overlay aparece independente do tema.
      </p>
    </div>
  </div>
</WobbleCard>`,
  render: (
    <div className="w-full">
      <WobbleCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src="https://picsum.photos/seed/wobble/240/240"
            alt=""
            className="h-32 w-32 rounded-xl object-cover"
          />
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Wobble + tema
            </h2>
            <p className="text-sm text-muted-foreground">
              Em dark mode o card fica escuro; em light mode, claro. O
              noise overlay aparece independente do tema.
            </p>
          </div>
        </div>
      </WobbleCard>
    </div>
  ),
}

export const examplesWobbleCard: Record<string, Example[]> = {
  "wobble-card": [wobbleCardBasic, wobbleCardPlain],
}
