import { MovingBorder, MovingBorderButton } from "@/components/ui/moving-border"

import type { Example } from "./examples"

const movingBorderBasic: Example = {
  title: "Básico",
  description:
    "Botão Aceternity com a borda cyan (#0ea5e9) que percorre o perímetro do botão em loop (3s por volta). Fundo slate-900, borda fina slate-800 e backdrop-blur — alinhado com glare-card e text-reveal-card (brand dark fixo).",
  code: `<MovingBorderButton
  borderRadius="1.75rem"
  duration={3000}
  className="bg-slate-900 text-white"
>
  Borders are cool
</MovingBorderButton>`,
  render: (
    <div className="flex w-full items-center justify-center py-8">
      <MovingBorderButton
        borderRadius="1.75rem"
        duration={3000}
        className="bg-slate-900 text-white"
      >
        Borders are cool
      </MovingBorderButton>
    </div>
  ),
}

const movingBorderLink: Example = {
  title: "Como link (wrapper <a>)",
  description:
    "Para usar como link, envolva o MovingBorderButton em um <a>. A borda animada continua funcionando normalmente.",
  code: `<div className="flex items-center justify-center">
  <a href="#moving-border" className="rounded-3xl">
    <MovingBorderButton
      borderRadius="1.5rem"
      duration={2500}
      className="bg-slate-900 text-white"
    >
      Veja o demo
    </MovingBorderButton>
  </a>
</div>`,
  render: (
    <div className="flex w-full items-center justify-center gap-4 py-8">
      <a href="#moving-border" className="rounded-3xl">
        <MovingBorderButton
          borderRadius="1.5rem"
          duration={2500}
          className="bg-slate-900 text-white"
        >
          Veja o demo
        </MovingBorderButton>
      </a>
    </div>
  ),
}

const movingBorderCustomGradient: Example = {
  title: "Gradiente customizado",
  description:
    "Sobrescreva `borderClassName` para trocar a cor/forma da 'bola' que viaja no perímetro. Aqui usamos um gradiente radial roxo→rosa (`#a855f7 → #ec4899`) em vez do cyan padrão.",
  code: `<MovingBorderButton
  borderRadius="2rem"
  duration={4000}
  borderClassName="h-20 w-20 bg-[radial-gradient(#a855f7_40%,transparent_60%)] opacity-[0.8]"
  className="bg-slate-950 text-white"
>
  Custom gradient
</MovingBorderButton>`,
  render: (
    <div className="flex w-full items-center justify-center py-8">
      <MovingBorderButton
        borderRadius="2rem"
        duration={4000}
        borderClassName="h-20 w-20 bg-[radial-gradient(#a855f7_40%,transparent_60%)] opacity-[0.8]"
        className="bg-slate-950 text-white"
      >
        Custom gradient
      </MovingBorderButton>
    </div>
  ),
}

const movingBorderCore: Example = {
  title: "Núcleo reutilizável",
  description:
    "`MovingBorder` sozinho é só o SVG invisível + o `motion.div` que percorre o perímetro. Envolva qualquer wrapper com altura/largura (`relative h-* w-*`) e passe o conteúdo que quiser como filho — aqui, um 'cursor' que viaja em volta de um card.",
  code: `<div className="relative h-32 w-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
  <MovingBorder duration={2000} rx="10%" ry="40%">
    <div className="h-6 w-6 rounded-full bg-[radial-gradient(#22d3ee_40%,transparent_60%)] opacity-90" />
  </MovingBorder>
  <div className="relative flex h-full items-center justify-center text-sm text-slate-200">
    MovingBorder core
  </div>
</div>`,
  render: (
    <div className="flex w-full items-center justify-center py-8">
      <div className="relative h-32 w-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <MovingBorder duration={2000} rx="10%" ry="40%">
          <div className="h-6 w-6 rounded-full bg-[radial-gradient(#22d3ee_40%,transparent_60%)] opacity-90" />
        </MovingBorder>
        <div className="relative flex h-full items-center justify-center text-sm text-slate-200">
          MovingBorder core
        </div>
      </div>
    </div>
  ),
}

export const examplesMovingBorder: Record<string, Example[]> = {
  "moving-border": [
    movingBorderBasic,
    movingBorderLink,
    movingBorderCustomGradient,
    movingBorderCore,
  ],
}
