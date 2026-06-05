import type { Example } from "@/data/examples"
import {
  AnimatedNumberDemo,
  AnimatedScoreDemo,
} from "@/data/examples-animated-number-demos"

/* -------------------------------------------------------------------------- */
/*                       animated-number / animated-score                     */
/* -------------------------------------------------------------------------- */

const animatedNumberSlotMachine: Example = {
  title: "Slot Machine",
  description:
    "Cada dígito rola verticalmente (0–9) até o valor atual. Use +/- para ver o efeito disparar.",
  code: `function Demo() {
  const [value, setValue] = React.useState(1234)
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-5xl font-semibold">
        <AnimatedNumber value={value} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => setValue((v) => v - 1)}>
          <Minus className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setValue((v) => v + 1)}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}`,
  render: <AnimatedNumberDemo />,
}

const animatedScoreColor: Example = {
  title: "Score com cor",
  description:
    "Placar com bounce e feedback de cor: verde ao subir, vermelho ao descer. Cores fixas (brand) sobre fundo escuro.",
  code: `function Demo() {
  const [value, setValue] = React.useState(10)
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-20 w-32 items-center justify-center rounded-full bg-zinc-950 text-5xl font-semibold">
        <AnimatedScore value={value} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => setValue((v) => v - 1)}>
          <Minus className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setValue((v) => v + 1)}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}`,
  render: <AnimatedScoreDemo />,
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI animated-number batch.
 * Both AnimatedNumber and AnimatedScore share the same slug/page.
 */
export const examplesAnimatedNumber: Record<string, Example[]> = {
  "animated-number": [animatedNumberSlotMachine, animatedScoreColor],
}
