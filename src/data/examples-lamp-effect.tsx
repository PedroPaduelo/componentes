import { LampContainer } from "@/components/ui/lamp-effect"
import type { Example } from "@/data/examples"

const lampBasic: Example = {
  title: "Lâmpada",
  description:
    "Dois cones de luz cônicos com blur que crescem ao entrar na viewport, com uma linha brilhante, revelando o título abaixo da luz.",
  code: `import { LampContainer } from "@/components/ui/lamp-effect"

export function Demo() {
  return (
    <LampContainer>
      <h1 className="bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        Construa lampejos <br /> a partir do escuro
      </h1>
    </LampContainer>
  )
}`,
  render: (
    <div className="w-full">
      <LampContainer>
        <h1 className="bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          Construa lampejos <br /> a partir do escuro
        </h1>
      </LampContainer>
    </div>
  ),
}

export const examplesLampEffect: Record<string, Example[]> = {
  "lamp-effect": [lampBasic],
}
