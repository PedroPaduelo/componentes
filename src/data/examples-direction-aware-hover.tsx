import { DirectionAwareHover } from "@/components/ui/direction-aware-hover"

import type { Example } from "./examples"

const directionAwareHoverBasic: Example = {
  title: "Básico",
  description:
    "Card da Aceternity UI que detecta a borda de entrada do mouse via atan2 e desloca imagem + texto pela direção oposta: entrar por baixo → imagem sobe; entrar por cima → imagem desce. O overlay escuro e o texto surgem suavemente no hover.",
  code: `<DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-1/600/600">
  <div>
    <p className="font-bold text-lg">Aurora Mendez</p>
    <p className="text-sm opacity-80">@auroramendez · Designer</p>
  </div>
</DirectionAwareHover>`,
  render: (
    <div className="flex w-full items-center justify-center py-4">
      <DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-1/600/600">
        <div>
          <p className="font-bold text-lg">Aurora Mendez</p>
          <p className="text-sm opacity-80">@auroramendez · Designer</p>
        </div>
      </DirectionAwareHover>
    </div>
  ),
}

const directionAwareHoverGrid: Example = {
  title: "Grid 3 cards",
  description:
    "Mesma mecânica, três perfis lado a lado: cada card reage de forma independente à direção da qual o mouse entra, criando um efeito de cards que se \"afastam\" do cursor para dar profundidade ao grid.",
  code: `<div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
  <DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-1/600/600">
    <div className="text-left">
      <p className="font-bold text-base leading-tight md:text-lg">Aurora</p>
      <p className="text-xs opacity-80 md:text-sm">@aurora · Designer</p>
    </div>
  </DirectionAwareHover>
  <DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-2/600/600">
    <div className="text-left">
      <p className="font-bold text-base leading-tight md:text-lg">Theo</p>
      <p className="text-xs opacity-80 md:text-sm">@theo · Engineer</p>
    </div>
  </DirectionAwareHover>
  <DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-3/600/600">
    <div className="text-left">
      <p className="font-bold text-base leading-tight md:text-lg">Suki</p>
      <p className="text-xs opacity-80 md:text-sm">@suki · PM</p>
    </div>
  </DirectionAwareHover>
</div>`,
  render: (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-1/600/600">
        <div className="text-left">
          <p className="font-bold text-base leading-tight md:text-lg">Aurora</p>
          <p className="text-xs opacity-80 md:text-sm">@aurora · Designer</p>
        </div>
      </DirectionAwareHover>
      <DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-2/600/600">
        <div className="text-left">
          <p className="font-bold text-base leading-tight md:text-lg">Theo</p>
          <p className="text-xs opacity-80 md:text-sm">@theo · Engineer</p>
        </div>
      </DirectionAwareHover>
      <DirectionAwareHover imageUrl="https://picsum.photos/seed/dah-3/600/600">
        <div className="text-left">
          <p className="font-bold text-base leading-tight md:text-lg">Suki</p>
          <p className="text-xs opacity-80 md:text-sm">@suki · PM</p>
        </div>
      </DirectionAwareHover>
    </div>
  ),
}

export const examplesDirectionAwareHover: Record<string, Example[]> = {
  "direction-aware-hover": [directionAwareHoverBasic, directionAwareHoverGrid],
}
