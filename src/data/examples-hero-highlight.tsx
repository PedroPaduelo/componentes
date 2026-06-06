import {
  HeroHighlight,
  HeroHighlightText,
} from "@/components/ui/hero-highlight"
import type { Example } from "@/data/examples"

const heroHighlightBasic: Example = {
  title: "Básico",
  description:
    "Hero com fundo de pontos que revela um realce indigo seguindo o cursor. O wrapper define a altura via containerClassName; passe o mouse sobre a área para ver o efeito.",
  code: `<HeroHighlight containerClassName="h-[24rem] rounded-lg">
  <p className="mx-auto max-w-2xl px-4 text-center text-2xl font-bold text-neutral-700 dark:text-white md:text-4xl">
    Com insight e foco, transforme dados em{" "}
    <HeroHighlightText>decisões que importam</HeroHighlightText>
  </p>
</HeroHighlight>`,
  render: (
    <HeroHighlight containerClassName="h-[24rem] rounded-lg">
      <p className="mx-auto max-w-2xl px-4 text-center text-2xl font-bold text-neutral-700 dark:text-white md:text-4xl">
        Com insight e foco, transforme dados em{" "}
        <HeroHighlightText>decisões que importam</HeroHighlightText>
      </p>
    </HeroHighlight>
  ),
}

const heroHighlightCustom: Example = {
  title: "Realce personalizado",
  description:
    "O HeroHighlightText aceita className para trocar o gradiente do realce, mantendo a animação de preenchimento.",
  code: `<HeroHighlight containerClassName="h-[24rem] rounded-lg">
  <h1 className="mx-auto max-w-3xl px-4 text-center text-3xl font-bold text-neutral-700 dark:text-white md:text-5xl">
    Construa interfaces que as pessoas{" "}
    <HeroHighlightText className="from-emerald-300 to-cyan-300 dark:from-emerald-500 dark:to-cyan-500">
      adoram usar
    </HeroHighlightText>
  </h1>
</HeroHighlight>`,
  render: (
    <HeroHighlight containerClassName="h-[24rem] rounded-lg">
      <h1 className="mx-auto max-w-3xl px-4 text-center text-3xl font-bold text-neutral-700 dark:text-white md:text-5xl">
        Construa interfaces que as pessoas{" "}
        <HeroHighlightText className="from-emerald-300 to-cyan-300 dark:from-emerald-500 dark:to-cyan-500">
          adoram usar
        </HeroHighlightText>
      </h1>
    </HeroHighlight>
  ),
}

export const examplesHeroHighlight: Record<string, Example[]> = {
  "hero-highlight": [heroHighlightBasic, heroHighlightCustom],
}
