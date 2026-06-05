/**
 * Demo components (com estado) do lote Fluid.
 * Arquivo SÓ exporta componentes — necessário pro react-refresh/only-export-components
 * (os mapas de examples ficam em `examples-fluid.tsx`).
 */

import { useState } from "react"
import { SliderFluid, type SliderValue } from "@/components/ui/slider-fluid"
import { SwitchFluid } from "@/components/ui/switch-fluid"

export function SliderDemo() {
  const [value, setValue] = useState<SliderValue>(40)
  return (
    <div className="w-full max-w-sm">
      <SliderFluid value={value} onChange={setValue} label="Volume" />
    </div>
  )
}

export function SliderRangeDemo() {
  const [value, setValue] = useState<SliderValue>([20, 70])
  return (
    <div className="w-full max-w-sm">
      <SliderFluid
        value={value}
        onChange={setValue}
        valuePosition="tooltip"
        showSteps
        step={10}
        label="Faixa"
      />
    </div>
  )
}

export function SwitchDemo() {
  const [on, setOn] = useState(true)
  return (
    <SwitchFluid label="Notificações" checked={on} onToggle={() => setOn((v) => !v)} />
  )
}

export function SwitchGroupDemo() {
  const [wifi, setWifi] = useState(true)
  const [bt, setBt] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <SwitchFluid label="Wi-Fi" checked={wifi} onToggle={() => setWifi((v) => !v)} />
      <SwitchFluid label="Bluetooth" checked={bt} onToggle={() => setBt((v) => !v)} />
    </div>
  )
}
