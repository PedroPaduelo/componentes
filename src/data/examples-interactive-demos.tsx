/**
 * Componentes de demo (com useState) usados pelos examples do lote chanhdai
 * interativo. Mantidos em arquivo separado para o registry `examplesInteractive`
 * ficar puro (só constantes), evitando o lint `react-refresh/only-export-components`.
 */

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Sun, Moon, Eye, EyeOff, Bell, BellOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChevronsUpDownIcon } from "@/components/ui/chevrons-up-down-icon"
import { IconSwap } from "@/components/ui/icon-swap"
import { ElasticSlider } from "@/components/ui/elastic-slider"
import { SlideToUnlock } from "@/components/ui/slide-to-unlock"

export function ChevronsToggleDemo() {
  return (
    <Button variant="outline" className="gap-2">
      Selecione uma opção
      <ChevronsUpDownIcon aria-hidden />
    </Button>
  )
}

export function IconSwapDemo({
  on,
  off,
}: {
  on: LucideIcon
  off: LucideIcon
}) {
  const [active, setActive] = React.useState(true)
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setActive((v) => !v)}
      aria-label="Alternar"
    >
      <IconSwap iconOn={on} iconOff={off} active={active} iconClassName="size-5" />
    </Button>
  )
}

export function IconSwapRow() {
  return (
    <div className="flex items-center gap-3">
      <IconSwapDemo on={Sun} off={Moon} />
      <IconSwapDemo on={Eye} off={EyeOff} />
      <IconSwapDemo on={Bell} off={BellOff} />
    </div>
  )
}

export function ElasticSliderDemo() {
  const [value, setValue] = React.useState(0.5)
  return (
    <div className="w-[200px]">
      <ElasticSlider
        value={value}
        onValueChange={setValue}
        label="Volume"
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
    </div>
  )
}

export function ElasticSliderDensityRow() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ElasticSlider density="compact" defaultValue={0.3} label="Compact" />
      <ElasticSlider density="default" defaultValue={0.5} label="Default" />
      <ElasticSlider density="relaxed" defaultValue={0.7} label="Relaxed" />
    </div>
  )
}

export function SlideToUnlockDemo({
  variant,
  label,
}: {
  variant?: "default" | "success" | "destructive"
  label: string
}) {
  const [unlocked, setUnlocked] = React.useState(false)
  return (
    <div className="w-full max-w-xs space-y-2">
      <SlideToUnlock
        variant={variant}
        label={unlocked ? "Desbloqueado!" : label}
        onUnlock={() => setUnlocked(true)}
      />
    </div>
  )
}

export function SlideToUnlockVariants() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <SlideToUnlockDemo variant="default" label="slide" />
      <SlideToUnlockDemo variant="success" label="confirm" />
      <SlideToUnlockDemo variant="destructive" label="delete" />
    </div>
  )
}
