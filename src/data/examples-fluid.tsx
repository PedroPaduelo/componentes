/**
 * Examples — lote Fluid (ONDA 2 lote A).
 *
 * Componentes adaptados da lib Fluid Functionalism (versões Radix), com a
 * mesma API de consumo da vitrine. Cada entrada espelha `code` (string) e
 * `render` (JSX). Componentes controlados (slider, switch) usam pequenos
 * wrappers locais com `useState` — definidos neste arquivo, não exportados,
 * pra não violar react-refresh/only-export-components (o arquivo só exporta
 * a const `examplesFluid`).
 */

import { ArrowRight, Download, Plus, Settings } from "lucide-react"
import type { Example } from "@/data/examples"
import { ButtonFluid } from "@/components/ui/button-fluid"
import { BadgeFluid } from "@/components/ui/badge-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import {
  TableFluid,
  TableFluidHeader,
  TableFluidBody,
  TableFluidRow,
  TableFluidHead,
  TableFluidCell,
} from "@/components/ui/table-fluid"
import {
  SliderDemo,
  SliderRangeDemo,
  SwitchDemo,
  SwitchGroupDemo,
} from "@/data/examples-fluid-demos"

// ── Button ────────────────────────────────────────────────

const buttonVariantsExample: Example = {
  title: "Variantes",
  description: "primary, secondary, tertiary e ghost.",
  code: `<ButtonFluid variant="primary">Primary</ButtonFluid>
<ButtonFluid variant="secondary">Secondary</ButtonFluid>
<ButtonFluid variant="tertiary">Tertiary</ButtonFluid>
<ButtonFluid variant="ghost">Ghost</ButtonFluid>`,
  render: (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonFluid variant="primary">Primary</ButtonFluid>
      <ButtonFluid variant="secondary">Secondary</ButtonFluid>
      <ButtonFluid variant="tertiary">Tertiary</ButtonFluid>
      <ButtonFluid variant="ghost">Ghost</ButtonFluid>
    </div>
  ),
}

const buttonIconLoadingExample: Example = {
  title: "Ícones e loading",
  description: "leadingIcon, trailingIcon, size e estado de loading.",
  code: `<ButtonFluid leadingIcon={Plus}>Adicionar</ButtonFluid>
<ButtonFluid variant="secondary" trailingIcon={ArrowRight}>Avançar</ButtonFluid>
<ButtonFluid variant="tertiary" leadingIcon={Download} size="lg">Baixar</ButtonFluid>
<ButtonFluid loading>Salvando</ButtonFluid>
<ButtonFluid size="icon" variant="secondary"><Settings /></ButtonFluid>`,
  render: (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonFluid leadingIcon={Plus}>Adicionar</ButtonFluid>
      <ButtonFluid variant="secondary" trailingIcon={ArrowRight}>
        Avançar
      </ButtonFluid>
      <ButtonFluid variant="tertiary" leadingIcon={Download} size="lg">
        Baixar
      </ButtonFluid>
      <ButtonFluid loading>Salvando</ButtonFluid>
      <ButtonFluid size="icon" variant="secondary">
        <Settings />
      </ButtonFluid>
    </div>
  ),
}

// ── Badge ─────────────────────────────────────────────────

const badgeVariantsExample: Example = {
  title: "Variantes e cores",
  description: "solid e dot, com paleta de cores via prop color.",
  code: `<BadgeFluid color="blue">Blue</BadgeFluid>
<BadgeFluid color="green">Green</BadgeFluid>
<BadgeFluid color="red">Red</BadgeFluid>
<BadgeFluid variant="dot" color="amber">Pendente</BadgeFluid>
<BadgeFluid variant="dot" color="emerald">Ativo</BadgeFluid>`,
  render: (
    <div className="flex flex-wrap items-center gap-2">
      <BadgeFluid color="blue">Blue</BadgeFluid>
      <BadgeFluid color="green">Green</BadgeFluid>
      <BadgeFluid color="red">Red</BadgeFluid>
      <BadgeFluid variant="dot" color="amber">
        Pendente
      </BadgeFluid>
      <BadgeFluid variant="dot" color="emerald">
        Ativo
      </BadgeFluid>
    </div>
  ),
}

const badgeSizesExample: Example = {
  title: "Tamanhos",
  description: "sm, md e lg.",
  code: `<BadgeFluid size="sm" color="violet">Small</BadgeFluid>
<BadgeFluid size="md" color="violet">Medium</BadgeFluid>
<BadgeFluid size="lg" color="violet">Large</BadgeFluid>`,
  render: (
    <div className="flex flex-wrap items-center gap-2">
      <BadgeFluid size="sm" color="violet">
        Small
      </BadgeFluid>
      <BadgeFluid size="md" color="violet">
        Medium
      </BadgeFluid>
      <BadgeFluid size="lg" color="violet">
        Large
      </BadgeFluid>
    </div>
  ),
}

// ── Slider ────────────────────────────────────────────────

const sliderBasicExample: Example = {
  title: "Básico",
  description: "Slider de valor único com label e tooltip de hover.",
  code: `function Demo() {
  const [value, setValue] = useState<SliderValue>(40)
  return <SliderFluid value={value} onChange={setValue} label="Volume" />
}`,
  render: <SliderDemo />,
}

const sliderRangeExample: Example = {
  title: "Faixa com steps",
  description: "Dois thumbs (range), pontos de step e valor em tooltip.",
  code: `function Demo() {
  const [value, setValue] = useState<SliderValue>([20, 70])
  return (
    <SliderFluid
      value={value}
      onChange={setValue}
      valuePosition="tooltip"
      showSteps
      step={10}
      label="Faixa"
    />
  )
}`,
  render: <SliderRangeDemo />,
}

// ── Switch ────────────────────────────────────────────────

const switchBasicExample: Example = {
  title: "Básico",
  description: "Switch controlado com label clicável e arraste.",
  code: `function Demo() {
  const [on, setOn] = useState(true)
  return (
    <SwitchFluid
      label="Notificações"
      checked={on}
      onToggle={() => setOn((v) => !v)}
    />
  )
}`,
  render: <SwitchDemo />,
}

const switchGroupExample: Example = {
  title: "Grupo",
  description: "Vários switches independentes.",
  code: `function Demo() {
  const [wifi, setWifi] = useState(true)
  const [bt, setBt] = useState(false)
  return (
    <>
      <SwitchFluid label="Wi-Fi" checked={wifi} onToggle={() => setWifi((v) => !v)} />
      <SwitchFluid label="Bluetooth" checked={bt} onToggle={() => setBt((v) => !v)} />
    </>
  )
}`,
  render: <SwitchGroupDemo />,
}

// ── Tooltip ───────────────────────────────────────────────

const tooltipBasicExample: Example = {
  title: "Básico",
  description: "Tooltip animado em torno de um botão.",
  code: `<TooltipFluid content="Adicionar item">
  <ButtonFluid size="icon" variant="secondary">
    <Plus />
  </ButtonFluid>
</TooltipFluid>`,
  render: (
    <TooltipFluid content="Adicionar item">
      <ButtonFluid size="icon" variant="secondary">
        <Plus />
      </ButtonFluid>
    </TooltipFluid>
  ),
}

const tooltipSidesExample: Example = {
  title: "Posições",
  description: "side: top, right, bottom, left.",
  code: `<TooltipFluid content="Topo" side="top">
  <ButtonFluid variant="tertiary">Top</ButtonFluid>
</TooltipFluid>
<TooltipFluid content="Direita" side="right">
  <ButtonFluid variant="tertiary">Right</ButtonFluid>
</TooltipFluid>
<TooltipFluid content="Baixo" side="bottom">
  <ButtonFluid variant="tertiary">Bottom</ButtonFluid>
</TooltipFluid>
<TooltipFluid content="Esquerda" side="left">
  <ButtonFluid variant="tertiary">Left</ButtonFluid>
</TooltipFluid>`,
  render: (
    <div className="flex flex-wrap items-center gap-3">
      <TooltipFluid content="Topo" side="top">
        <ButtonFluid variant="tertiary">Top</ButtonFluid>
      </TooltipFluid>
      <TooltipFluid content="Direita" side="right">
        <ButtonFluid variant="tertiary">Right</ButtonFluid>
      </TooltipFluid>
      <TooltipFluid content="Baixo" side="bottom">
        <ButtonFluid variant="tertiary">Bottom</ButtonFluid>
      </TooltipFluid>
      <TooltipFluid content="Esquerda" side="left">
        <ButtonFluid variant="tertiary">Left</ButtonFluid>
      </TooltipFluid>
    </div>
  ),
}

// ── Table ─────────────────────────────────────────────────

const tableBasicExample: Example = {
  title: "Básico",
  description: "Tabela com destaque de linha por proximidade do cursor.",
  code: `<TableFluid>
  <TableFluidHeader>
    <TableFluidRow>
      <TableFluidHead>Nome</TableFluidHead>
      <TableFluidHead>Função</TableFluidHead>
      <TableFluidHead>Status</TableFluidHead>
    </TableFluidRow>
  </TableFluidHeader>
  <TableFluidBody>
    <TableFluidRow index={0}>
      <TableFluidCell>Ana Souza</TableFluidCell>
      <TableFluidCell>Designer</TableFluidCell>
      <TableFluidCell>Ativo</TableFluidCell>
    </TableFluidRow>
    <TableFluidRow index={1}>
      <TableFluidCell>Bruno Lima</TableFluidCell>
      <TableFluidCell>Dev</TableFluidCell>
      <TableFluidCell>Ativo</TableFluidCell>
    </TableFluidRow>
    <TableFluidRow index={2}>
      <TableFluidCell>Carla Dias</TableFluidCell>
      <TableFluidCell>PM</TableFluidCell>
      <TableFluidCell>Férias</TableFluidCell>
    </TableFluidRow>
  </TableFluidBody>
</TableFluid>`,
  render: (
    <div className="w-full max-w-md">
      <TableFluid>
        <TableFluidHeader>
          <TableFluidRow>
            <TableFluidHead>Nome</TableFluidHead>
            <TableFluidHead>Função</TableFluidHead>
            <TableFluidHead>Status</TableFluidHead>
          </TableFluidRow>
        </TableFluidHeader>
        <TableFluidBody>
          <TableFluidRow index={0}>
            <TableFluidCell>Ana Souza</TableFluidCell>
            <TableFluidCell>Designer</TableFluidCell>
            <TableFluidCell>Ativo</TableFluidCell>
          </TableFluidRow>
          <TableFluidRow index={1}>
            <TableFluidCell>Bruno Lima</TableFluidCell>
            <TableFluidCell>Dev</TableFluidCell>
            <TableFluidCell>Ativo</TableFluidCell>
          </TableFluidRow>
          <TableFluidRow index={2}>
            <TableFluidCell>Carla Dias</TableFluidCell>
            <TableFluidCell>PM</TableFluidCell>
            <TableFluidCell>Férias</TableFluidCell>
          </TableFluidRow>
        </TableFluidBody>
      </TableFluid>
    </div>
  ),
}

// ── Mapa exportado ────────────────────────────────────────

export const examplesFluid: Record<string, Example[]> = {
  "button-fluid": [buttonVariantsExample, buttonIconLoadingExample],
  "badge-fluid": [badgeVariantsExample, badgeSizesExample],
  "slider-fluid": [sliderBasicExample, sliderRangeExample],
  "switch-fluid": [switchBasicExample, switchGroupExample],
  "tooltip-fluid": [tooltipBasicExample, tooltipSidesExample],
  "table-fluid": [tableBasicExample],
}
