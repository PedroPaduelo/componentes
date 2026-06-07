import { Slider } from "@/components/ui/slider"
import type { Example } from "@/data/examples"

const sliderBasicExample: Example = {
  title: "B\u00e1sico",
  description:
    "Slider simples com um \u00fanico thumb. Valor inicial de 30, m\u00ednimo 0 e m\u00e1ximo 100.",
  code: `<Slider
  defaultValue={[30]}
  max={100}
  step={1}
  className="w-full"
/>`,
  render: (
    <div className="w-full px-2">
      <Slider defaultValue={[30]} max={100} step={1} className="w-full" />
    </div>
  ),
}

const sliderRangeExample: Example = {
  title: "Intervalo",
  description:
    "Slider de intervalo com dois thumbs para sele\u00e7\u00e3o de um range de valores.",
  code: `<Slider
  defaultValue={[25, 75]}
  max={100}
  step={1}
  className="w-full"
/>`,
  render: (
    <div className="w-full px-2">
      <Slider defaultValue={[25, 75]} max={100} step={1} className="w-full" />
    </div>
  ),
}

const sliderStepsExample: Example = {
  title: "Com Steps",
  description:
    "Slider com step de 10 para valores discretos e slider desabilitado.",
  code: `<div className="flex flex-col gap-6">
  <Slider
    defaultValue={[50]}
    max={100}
    step={10}
    className="w-full"
  />
  <Slider
    defaultValue={[30]}
    max={100}
    step={10}
    disabled
    className="w-full"
  />
</div>`,
  render: (
    <div className="flex flex-col gap-6 px-2">
      <Slider defaultValue={[50]} max={100} step={10} className="w-full" />
      <Slider
        defaultValue={[30]}
        max={100}
        step={10}
        disabled
        className="w-full"
      />
    </div>
  ),
}

export const examplesSlider: Record<string, Example[]> = {
  slider: [sliderBasicExample, sliderRangeExample, sliderStepsExample],
}
