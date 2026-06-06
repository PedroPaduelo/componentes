import { EvervaultCard } from "@/components/ui/evervault-card"
import type { Example } from "./examples"

const evervaultCardBasic: Example = {
  title: "Básico",
  description:
    "Card único dentro de um wrapper com altura fixa. Mova o mouse sobre ele para revelar a chuva de caracteres sob o mask radial verde→azul.",
  code: `<div className="relative h-[400px] w-full">
  <EvervaultCard text="Hover me" />
</div>`,
  render: (
    <div className="relative h-[400px] w-full">
      <EvervaultCard text="Hover me" />
    </div>
  ),
}

const evervaultCardGrid: Example = {
  title: "Grid 3 cards",
  description:
    "Três cards lado a lado com rótulos diferentes — mostra como a versão básica escala para destacar múltiplos conceitos (Secure, Encrypt, Magic).",
  code: `<div className="grid gap-4 md:grid-cols-3">
  <div className="relative h-[400px] w-full">
    <EvervaultCard text="Secure" />
  </div>
  <div className="relative h-[400px] w-full">
    <EvervaultCard text="Encrypt" />
  </div>
  <div className="relative h-[400px] w-full">
    <EvervaultCard text="Magic" />
  </div>
</div>`,
  render: (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="relative h-[400px] w-full">
        <EvervaultCard text="Secure" />
      </div>
      <div className="relative h-[400px] w-full">
        <EvervaultCard text="Encrypt" />
      </div>
      <div className="relative h-[400px] w-full">
        <EvervaultCard text="Magic" />
      </div>
    </div>
  ),
}

export const examplesEvervaultCard: Record<string, Example[]> = {
  "evervault-card": [evervaultCardBasic, evervaultCardGrid],
}
