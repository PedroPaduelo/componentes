import { Meteors } from "@/components/ui/meteors"
import type { Example } from "@/data/examples"

const meteorsBasic: Example = {
  title: "Básico",
  description:
    "Uma chuva de meteoros animada atrás de um card central. O wrapper precisa de altura e overflow-hidden para conter o efeito.",
  code: `<div className="relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-lg">
  <div className="relative w-full max-w-xs">
    <div className="absolute -inset-0.5 scale-[0.8] transform rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-60 blur-3xl" />
    <div className="relative flex h-full flex-col items-start justify-end overflow-hidden rounded-2xl border border-border bg-card px-4 py-8 shadow-xl">
      <h2 className="relative z-50 mb-4 text-xl font-bold text-foreground">
        Meteoros caindo
      </h2>
      <p className="relative z-50 mb-4 text-base font-normal text-muted-foreground">
        Um efeito de fundo com meteoros diagonais animados, ideal para dar
        movimento sutil a cards e heros.
      </p>
      <Meteors number={20} />
    </div>
  </div>
</div>`,
  render: (
    <div className="relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-lg">
      <div className="relative w-full max-w-xs">
        <div className="absolute -inset-0.5 scale-[0.8] transform rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-60 blur-3xl" />
        <div className="relative flex h-full flex-col items-start justify-end overflow-hidden rounded-2xl border border-border bg-card px-4 py-8 shadow-xl">
          <h2 className="relative z-50 mb-4 text-xl font-bold text-foreground">
            Meteoros caindo
          </h2>
          <p className="relative z-50 mb-4 text-base font-normal text-muted-foreground">
            Um efeito de fundo com meteoros diagonais animados, ideal para dar
            movimento sutil a cards e heros.
          </p>
          <Meteors number={20} />
        </div>
      </div>
    </div>
  ),
}

const meteorsDenso: Example = {
  title: "Mais denso",
  description:
    "Aumentando o número de meteoros (number) a chuva fica mais intensa. Aqui sobre um fundo escuro full-width.",
  code: `<div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-950">
  <h2 className="relative z-10 text-3xl font-bold text-white md:text-4xl">
    Chuva de meteoros
  </h2>
  <Meteors number={40} />
</div>`,
  render: (
    <div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-950">
      <h2 className="relative z-10 text-3xl font-bold text-white md:text-4xl">
        Chuva de meteoros
      </h2>
      <Meteors number={40} />
    </div>
  ),
}

export const examplesMeteors: Record<string, Example[]> = {
  meteors: [meteorsBasic, meteorsDenso],
}
