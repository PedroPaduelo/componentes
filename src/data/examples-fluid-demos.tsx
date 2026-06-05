/**
 * Demo components (com estado) do lote Fluid.
 * Arquivo SÓ exporta componentes — necessário pro react-refresh/only-export-components
 * (os mapas de examples ficam em `examples-fluid.tsx`).
 */

import { useState, useEffect } from "react"
import { SliderFluid, type SliderValue } from "@/components/ui/slider-fluid"
import { SwitchFluid } from "@/components/ui/switch-fluid"
import { Mail, User, Lock, Home, Search, Bell, Settings, Sun, Moon, Monitor } from "lucide-react"
import { InputGroupFluid, InputFieldFluid } from "@/components/ui/input-group-fluid"
import { InputCopyFluid } from "@/components/ui/input-copy-fluid"
import {
  TabsSubtleFluid,
  TabsSubtleFluidItem,
  TabsSubtleFluidPanel,
} from "@/components/ui/tabs-subtle-fluid"
import { DropdownFluid, DropdownFluidLabel, DropdownFluidSeparator } from "@/components/ui/dropdown-fluid"
import { MenuItemFluid } from "@/components/ui/menu-item-fluid"
import { FileThumbnailFluid } from "@/components/ui/file-thumbnail-fluid"

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

// ── Input Group (Fluid) ───────────────────────────────────

export function InputGroupDemo() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  return (
    <InputGroupFluid>
      <InputFieldFluid
        index={0}
        label="Nome"
        icon={User}
        placeholder="Seu nome"
        value={name}
        onChange={setName}
      />
      <InputFieldFluid
        index={1}
        label="E-mail"
        icon={Mail}
        placeholder="voce@exemplo.com"
        value={email}
        onChange={setEmail}
      />
    </InputGroupFluid>
  )
}

export function InputGroupErrorDemo() {
  const [pass, setPass] = useState("123")
  return (
    <InputGroupFluid>
      <InputFieldFluid
        index={0}
        label="Senha"
        icon={Lock}
        type="password"
        placeholder="••••••••"
        value={pass}
        onChange={setPass}
        error={pass.length < 6 ? "Mínimo de 6 caracteres" : undefined}
      />
    </InputGroupFluid>
  )
}

// ── Input Copy (Fluid) ────────────────────────────────────

export function InputCopyDemo() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card px-2">
      <InputCopyFluid label="Chave de API" value="sk_live_4eC39HqLyjWDarjtT1zdp7dc" />
    </div>
  )
}

export function InputCopyButtonDemo() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card px-2">
      <InputCopyFluid
        label="Comando"
        variant="button"
        value="npx shadcn@latest add button"
      />
    </div>
  )
}

// ── Tabs Subtle (Fluid) ───────────────────────────────────

export function TabsSubtleDemo() {
  const [selected, setSelected] = useState(0)
  const idPrefix = "tabs-subtle-demo"
  return (
    <div className="w-full max-w-md">
      <TabsSubtleFluid selectedIndex={selected} onSelect={setSelected} idPrefix={idPrefix}>
        <TabsSubtleFluidItem index={0} label="Visão geral" />
        <TabsSubtleFluidItem index={1} label="Atividade" />
        <TabsSubtleFluidItem index={2} label="Configurações" />
      </TabsSubtleFluid>
      <div className="mt-3 text-[13px] text-muted-foreground">
        <TabsSubtleFluidPanel index={0} selectedIndex={selected} idPrefix={idPrefix}>
          Resumo do projeto e métricas principais.
        </TabsSubtleFluidPanel>
        <TabsSubtleFluidPanel index={1} selectedIndex={selected} idPrefix={idPrefix}>
          Histórico de eventos recentes.
        </TabsSubtleFluidPanel>
        <TabsSubtleFluidPanel index={2} selectedIndex={selected} idPrefix={idPrefix}>
          Preferências e ajustes da conta.
        </TabsSubtleFluidPanel>
      </div>
    </div>
  )
}

export function TabsSubtleIconsDemo() {
  const [selected, setSelected] = useState(0)
  return (
    <TabsSubtleFluid selectedIndex={selected} onSelect={setSelected} activeLabel>
      <TabsSubtleFluidItem index={0} label="Início" icon={Home} />
      <TabsSubtleFluidItem index={1} label="Buscar" icon={Search} />
      <TabsSubtleFluidItem index={2} label="Alertas" icon={Bell} />
      <TabsSubtleFluidItem index={3} label="Ajustes" icon={Settings} />
    </TabsSubtleFluid>
  )
}

// ── Dropdown (Fluid) ──────────────────────────────────────

export function DropdownDemo() {
  const [checked, setChecked] = useState(0)
  const options = [
    { label: "Claro", icon: Sun },
    { label: "Escuro", icon: Moon },
    { label: "Sistema", icon: Monitor },
  ]
  return (
    <DropdownFluid checkedIndex={checked}>
      <DropdownFluidLabel>Tema</DropdownFluidLabel>
      {options.map((opt, i) => (
        <MenuItemFluid
          key={opt.label}
          index={i}
          label={opt.label}
          icon={opt.icon}
          checked={checked === i}
          onSelect={() => setChecked(i)}
        />
      ))}
      <DropdownFluidSeparator />
      <MenuItemFluid
        index={3}
        label="Configurações"
        icon={Settings}
        checked={checked === 3}
        onSelect={() => setChecked(3)}
      />
    </DropdownFluid>
  )
}

// ── File Thumbnail (Fluid) ────────────────────────────────

// Gera um File de imagem em memória (canvas → blob) pra demonstrar o preview
// sem depender de upload do usuário.
function useGeneratedImageFile() {
  const [file, setFile] = useState<File | null>(null)
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 240
    canvas.height = 240
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 240, 240)
      grad.addColorStop(0, "#6366f1")
      grad.addColorStop(1, "#ec4899")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 240, 240)
      ctx.fillStyle = "rgba(255,255,255,0.9)"
      ctx.font = "bold 120px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("F", 120, 130)
    }
    canvas.toBlob((blob) => {
      if (blob) setFile(new File([blob], "preview.png", { type: "image/png" }))
    }, "image/png")
  }, [])
  return file
}

export function FileThumbnailDemo() {
  const file = useGeneratedImageFile()
  return (
    <div className="flex items-center gap-4">
      {file ? (
        <>
          <FileThumbnailFluid file={file} size={64} />
          <FileThumbnailFluid file={file} size={96} />
          <FileThumbnailFluid file={file} size={128} />
        </>
      ) : (
        <span className="text-[13px] text-muted-foreground">Gerando preview…</span>
      )}
    </div>
  )
}
