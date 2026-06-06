import { GooeyInput } from "@/components/ui/gooey-input"
import type { Example } from "@/data/examples"

import { ControlledGooeyInputDemo } from "./examples-gooey-input-demo"

const examplesGooeyInputBasic: Example = {
  title: "Básico",
  description:
    "Botão circular com lupa. Ao clicar, expande em barra de search com o ícone destacado à esquerda (efeito goo via SVG filter).",
  code: `<GooeyInput
  placeholder="Type to search..."
  collapsedWidth={115}
  expandedWidth={200}
  expandedOffset={50}
  gooeyBlur={5}
/>`,
  render: (
    <div className="flex min-h-32 w-full items-center justify-center">
      <GooeyInput
        placeholder="Type to search..."
        collapsedWidth={115}
        expandedWidth={200}
        expandedOffset={50}
        gooeyBlur={5}
      />
    </div>
  ),
}

const examplesGooeyInputControlled: Example = {
  title: "Controlado",
  description:
    "Exemplo controlado via prop `value` + `onValueChange`. O estado externo sincroniza com o input; ao desfocar com campo vazio, o controle fecha.",
  code: `function ControlledGooeyInputDemo() {
  const [value, setValue] = React.useState("")
  return (
    <GooeyInput
      placeholder="Buscar…"
      value={value}
      onValueChange={setValue}
    />
  )
}`,
  render: (
    <div className="flex min-h-32 w-full items-center justify-center">
      <ControlledGooeyInputDemo />
    </div>
  ),
}

export const examplesGooeyInput: Record<string, Example[]> = {
  "gooey-input": [examplesGooeyInputBasic, examplesGooeyInputControlled],
}
