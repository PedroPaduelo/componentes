import { useState } from "react"

import { GooeyInput } from "@/components/ui/gooey-input"

/**
 * Demo controlado do GooeyInput.
 *
 * Exportado em arquivo separado (sem consts/objetos lado a lado)
 * para o eslint `react-refresh/only-export-components` não reclamar
 * de o arquivo do examplesX ter componente + objeto.
 */
export function ControlledGooeyInputDemo() {
  const [value, setValue] = useState("")
  return (
    <GooeyInput
      placeholder="Buscar…"
      value={value}
      onValueChange={setValue}
    />
  )
}
