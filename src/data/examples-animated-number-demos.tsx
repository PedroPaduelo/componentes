/**
 * Componentes de demo (com useState) usados pelos examples do
 * AnimatedNumber/AnimatedScore (lote VengenceUI). Mantidos em arquivo separado
 * para o registry `examplesAnimatedNumber` ficar puro (só constantes), evitando
 * o lint `react-refresh/only-export-components`.
 *
 * O efeito de ambos só dispara quando `value` muda — por isso os demos têm
 * estado e botões +/- (Minus/Plus do lucide).
 */

import * as React from "react"
import { Minus, Plus } from "lucide-react"

import { AnimatedNumber, AnimatedScore } from "@/components/ui/animated-number"
import { Button } from "@/components/ui/button"

export function AnimatedNumberDemo() {
  const [value, setValue] = React.useState(1234)
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="text-5xl font-semibold text-foreground">
        <AnimatedNumber value={value} />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setValue((v) => v - 1)}
          aria-label="Diminuir"
        >
          <Minus className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setValue((v) => v + 1)}
          aria-label="Aumentar"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function AnimatedScoreDemo() {
  const [value, setValue] = React.useState(10)
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex h-20 w-32 items-center justify-center rounded-full bg-zinc-950 text-5xl font-semibold">
        <AnimatedScore value={value} />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setValue((v) => v - 1)}
          aria-label="Diminuir"
        >
          <Minus className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setValue((v) => v + 1)}
          aria-label="Aumentar"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}
