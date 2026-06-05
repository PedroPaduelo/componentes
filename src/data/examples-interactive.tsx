/**
 * Registry de examples do lote chanhdai — componentes interativos.
 * Apenas constantes; os componentes de demo ficam em `examples-interactive-demos.tsx`.
 */

import { ChevronsUpDownIcon } from "@/components/ui/chevrons-up-down-icon"
import type { Example } from "@/data/examples"
import {
  ChevronsToggleDemo,
  IconSwapRow,
  ElasticSliderDemo,
  ElasticSliderDensityRow,
  SlideToUnlockDemo,
  SlideToUnlockVariants,
} from "@/data/examples-interactive-demos"

const chevronsBasicExample: Example = {
  title: "Indicador de dropdown",
  description: "Clique para alternar — os chevrons rotacionam 180°.",
  code: `function Demo() {
  const [open, setOpen] = React.useState(false)
  return (
    <Button
      variant="outline"
      onClick={() => setOpen((v) => !v)}
      className="gap-2"
    >
      Selecione uma opção
      <ChevronsUpDownIcon className={open ? "rotate-180" : ""} />
    </Button>
  )
}`,
  render: <ChevronsToggleDemo />,
}

const chevronsSizesExample: Example = {
  title: "Tamanhos",
  description: "O componente aceita a variante de tamanho via cva.",
  code: `<ChevronsUpDownIcon size="sm" />
<ChevronsUpDownIcon size="default" />
<ChevronsUpDownIcon size="lg" />`,
  render: (
    <div className="flex items-center gap-4 text-foreground">
      <ChevronsUpDownIcon size="sm" />
      <ChevronsUpDownIcon size="default" />
      <ChevronsUpDownIcon size="lg" />
    </div>
  ),
}

const iconSwapExample: Example = {
  title: "Crossfade entre ícones",
  description: "Clique para alternar — o ícone faz fade + rotação + escala.",
  code: `function Demo() {
  const [active, setActive] = React.useState(true)
  return (
    <Button variant="outline" size="icon" onClick={() => setActive(v => !v)}>
      <IconSwap iconOn={Sun} iconOff={Moon} active={active} iconClassName="size-5" />
    </Button>
  )
}`,
  render: <IconSwapRow />,
}

const elasticSliderExample: Example = {
  title: "Básico",
  description: "Arraste além das bordas para ver o efeito elástico (rubber-band).",
  code: `function Demo() {
  const [value, setValue] = React.useState(0.5)
  return (
    <ElasticSlider
      value={value}
      onValueChange={setValue}
      label="Volume"
      formatValue={(v) => \`\${Math.round(v * 100)}%\`}
    />
  )
}`,
  render: <ElasticSliderDemo />,
}

const elasticSliderDensityExample: Example = {
  title: "Densidades",
  description: "Compacto, padrão e relaxado.",
  code: `<ElasticSlider density="compact" defaultValue={0.3} label="Compact" />
<ElasticSlider density="default" defaultValue={0.5} label="Default" />
<ElasticSlider density="relaxed" defaultValue={0.7} label="Relaxed" />`,
  render: <ElasticSliderDensityRow />,
}

const slideToUnlockExample: Example = {
  title: "Deslize para confirmar",
  description: "Arraste o thumb até o fim para disparar a ação.",
  code: `function Demo() {
  const [unlocked, setUnlocked] = React.useState(false)
  return (
    <SlideToUnlock
      label={unlocked ? "Desbloqueado!" : "deslize para desbloquear"}
      onUnlock={() => setUnlocked(true)}
    />
  )
}`,
  render: <SlideToUnlockDemo label="deslize para desbloquear" />,
}

const slideToUnlockVariantsExample: Example = {
  title: "Variantes",
  description: "Estilos default, success e destructive no handle.",
  code: `<SlideToUnlock variant="default" label="deslize" onUnlock={fn} />
<SlideToUnlock variant="success" label="confirmar" onUnlock={fn} />
<SlideToUnlock variant="destructive" label="apagar" onUnlock={fn} />`,
  render: <SlideToUnlockVariants />,
}

export const examplesInteractive: Record<string, Example[]> = {
  "chevrons-up-down-icon": [chevronsBasicExample, chevronsSizesExample],
  "icon-swap": [iconSwapExample],
  "elastic-slider": [elasticSliderExample, elasticSliderDensityExample],
  "slide-to-unlock": [slideToUnlockExample, slideToUnlockVariantsExample],
}
