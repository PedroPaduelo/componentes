import { AuroraBackground } from "@/components/ui/aurora-background"

import type { Example } from "./examples"

export const examplesAuroraBackground: Record<string, Example[]> = {
  "aurora-background": [
  {
    title: "Básico",
    description:
      "Wrapper com gradiente aurora animado atrás de qualquer conteúdo. A aurora desliza horizontalmente em loop infinito; a prop showRadialGradient aplica uma máscara radial que suaviza a borda superior-direita.",
    code: `<AuroraBackground>
  <div className="relative z-10 flex flex-col items-center gap-3 text-center">
    <span className="text-xs font-semibold tracking-[0.35em] text-slate-700 uppercase dark:text-slate-300">
      Aceternity UI
    </span>
    <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl dark:text-white">
      Aurora Background
    </h1>
    <p className="max-w-xl text-base text-slate-700 dark:text-slate-300">
      Gradiente animado de aurora boreal em tons azul, índigo e violeta
      com deslocamento horizontal em loop infinito de 60 segundos.
    </p>
  </div>
</AuroraBackground>`,
    render: (
      <div className="bg-background w-full rounded-lg">
        <AuroraBackground>
          <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
            <span className="text-xs font-semibold tracking-[0.35em] text-slate-700 uppercase dark:text-slate-300">
              Aceternity UI
            </span>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl dark:text-white">
              Aurora Background
            </h1>
            <p className="max-w-xl text-base text-slate-700 dark:text-slate-300">
              Gradiente animado de aurora boreal em tons azul, índigo e
              violeta com deslocamento horizontal em loop infinito de 60
              segundos.
            </p>
          </div>
        </AuroraBackground>
      </div>
    ),
  },
  {
    title: "Sem máscara radial",
    description:
      "Mesma aurora animada, porém sem a máscara radial que suaviza a borda superior-direita — útil quando o conteúdo precisa preencher a área inteira ou quando você quer um efeito mais uniforme.",
    code: `<AuroraBackground showRadialGradient={false}>
  <div className="relative z-10 flex flex-col items-center gap-2 text-center">
    <h2 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
      Aurora cheia
    </h2>
    <p className="max-w-md text-sm text-slate-700 dark:text-slate-300">
      O gradiente agora se estende por toda a área sem fade radial na
      borda superior-direita.
    </p>
  </div>
</AuroraBackground>`,
    render: (
      <div className="bg-background w-full rounded-lg">
        <AuroraBackground showRadialGradient={false}>
          <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Aurora cheia
            </h2>
            <p className="max-w-md text-sm text-slate-700 dark:text-slate-300">
              O gradiente agora se estende por toda a área sem fade radial
              na borda superior-direita.
            </p>
          </div>
        </AuroraBackground>
      </div>
    ),
  },
],
}
