import { BackgroundGradient } from "@/components/ui/background-gradient"
import type { Example } from "@/data/examples"

const backgroundGradientCard: Example = {
  title: "Card de produto",
  description:
    "Um cartão com borda em gradiente radial animado que intensifica no hover.",
  code: `<div className="relative flex w-full items-center justify-center py-8">
  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900">
    <img
      src="https://picsum.photos/seed/bg-gradient/400/300"
      alt="Pré-visualização do produto"
      className="h-48 w-full rounded-[18px] object-cover"
    />
    <p className="mt-4 text-base font-semibold text-black dark:text-neutral-200">
      Air Jordan 4 Retro
    </p>
    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
      O Air Jordan 4 Retro reimaginado em uma paleta vibrante com detalhes em
      gradiente.
    </p>
    <button className="mt-4 inline-flex items-center rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white dark:bg-zinc-800">
      Comprar agora <span className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-white">$100</span>
    </button>
  </BackgroundGradient>
</div>`,
  render: (
    <div className="relative flex w-full items-center justify-center py-8">
      <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900">
        <img
          src="https://picsum.photos/seed/bg-gradient/400/300"
          alt="Pré-visualização do produto"
          className="h-48 w-full rounded-[18px] object-cover"
        />
        <p className="mt-4 text-base font-semibold text-black dark:text-neutral-200">
          Air Jordan 4 Retro
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          O Air Jordan 4 Retro reimaginado em uma paleta vibrante com detalhes
          em gradiente.
        </p>
        <button className="mt-4 inline-flex items-center rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white dark:bg-zinc-800">
          Comprar agora{" "}
          <span className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-white">
            $100
          </span>
        </button>
      </BackgroundGradient>
    </div>
  ),
}

const backgroundGradientStatic: Example = {
  title: "Sem animação",
  description:
    "O mesmo gradiente em estado estático, ativado apenas no hover.",
  code: `<div className="relative flex w-full items-center justify-center py-8">
  <BackgroundGradient
    animate={false}
    className="rounded-[22px] bg-white px-6 py-8 text-center dark:bg-zinc-900"
  >
    <p className="text-lg font-semibold text-black dark:text-neutral-200">
      Borda estática
    </p>
    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
      Passe o mouse para intensificar o brilho do gradiente.
    </p>
  </BackgroundGradient>
</div>`,
  render: (
    <div className="relative flex w-full items-center justify-center py-8">
      <BackgroundGradient
        animate={false}
        className="rounded-[22px] bg-white px-6 py-8 text-center dark:bg-zinc-900"
      >
        <p className="text-lg font-semibold text-black dark:text-neutral-200">
          Borda estática
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Passe o mouse para intensificar o brilho do gradiente.
        </p>
      </BackgroundGradient>
    </div>
  ),
}

export const examplesBackgroundGradient: Record<string, Example[]> = {
  "background-gradient": [backgroundGradientCard, backgroundGradientStatic],
}
