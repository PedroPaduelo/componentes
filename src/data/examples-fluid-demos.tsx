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
import {
  AccordionGroup as AccordionGroupFluid,
  AccordionItem as AccordionItemFluid,
  AccordionTrigger as AccordionTriggerFluid,
  AccordionContent as AccordionContentFluid,
} from "@/components/ui/accordion-fluid"
import { RadioGroup as RadioGroupFluid, RadioItem as RadioItemFluid } from "@/components/ui/radio-group-fluid"
import { CheckboxGroup as CheckboxGroupFluid, CheckboxItem as CheckboxItemFluid } from "@/components/ui/checkbox-group-fluid"
import {
  Select as SelectFluid,
  SelectTrigger as SelectTriggerFluid,
  SelectContent as SelectContentFluid,
  SelectItem as SelectItemFluid,
} from "@/components/ui/select-fluid"
import {
  Tabs as TabsFluid,
  TabsList as TabsListFluid,
  TabItem as TabItemFluid,
  TabPanel as TabPanelFluid,
} from "@/components/ui/tabs-fluid"

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

export function AccordionDemo() {
  return (
    <AccordionGroupFluid type="single" defaultValue="item-1">
      <AccordionItemFluid value="item-1" index={0}>
        <AccordionTriggerFluid>O que é a Fluid Functionalism?</AccordionTriggerFluid>
        <AccordionContentFluid>
          Uma biblioteca de componentes React com microinterações fluidas
          baseadas em molas e destaque por proximidade do cursor.
        </AccordionContentFluid>
      </AccordionItemFluid>
      <AccordionItemFluid value="item-2" index={1}>
        <AccordionTriggerFluid>Como funciona o destaque?</AccordionTriggerFluid>
        <AccordionContentFluid>
          O fundo de hover segue o cursor e a expansão usa uma mola criticamente
          amortecida para abrir suavemente.
        </AccordionContentFluid>
      </AccordionItemFluid>
      <AccordionItemFluid value="item-3" index={2}>
        <AccordionTriggerFluid>Posso abrir vários itens?</AccordionTriggerFluid>
        <AccordionContentFluid>
          Sim — use type="multiple" para permitir múltiplos itens abertos ao
          mesmo tempo.
        </AccordionContentFluid>
      </AccordionItemFluid>
    </AccordionGroupFluid>
  )
}

export function RadioGroupDemo() {
  const [value, setValue] = useState("comfortable")
  return (
    <RadioGroupFluid value={value} onValueChange={setValue}>
      <RadioItemFluid index={0} value="default" label="Padrão" />
      <RadioItemFluid index={1} value="comfortable" label="Confortável" />
      <RadioItemFluid index={2} value="compact" label="Compacto" />
    </RadioGroupFluid>
  )
}

export function CheckboxGroupDemo() {
  const [checked, setChecked] = useState<Set<number>>(new Set([0, 1]))
  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  const items = ["Notificações por e-mail", "Notificações push", "SMS", "Resumo semanal"]
  return (
    <CheckboxGroupFluid checkedIndices={checked}>
      {items.map((label, i) => (
        <CheckboxItemFluid
          key={label}
          index={i}
          label={label}
          checked={checked.has(i)}
          onToggle={() => toggle(i)}
        />
      ))}
    </CheckboxGroupFluid>
  )
}

export function SelectDemo() {
  const [value, setValue] = useState("")
  return (
    <SelectFluid value={value} onValueChange={setValue}>
      <SelectTriggerFluid placeholder="Selecione uma fruta…" />
      <SelectContentFluid>
        <SelectItemFluid index={0} value="apple">
          Maçã
        </SelectItemFluid>
        <SelectItemFluid index={1} value="banana">
          Banana
        </SelectItemFluid>
        <SelectItemFluid index={2} value="orange">
          Laranja
        </SelectItemFluid>
        <SelectItemFluid index={3} value="grape">
          Uva
        </SelectItemFluid>
      </SelectContentFluid>
    </SelectFluid>
  )
}

export function SelectIconDemo() {
  const [value, setValue] = useState("home")
  return (
    <SelectFluid value={value} onValueChange={setValue}>
      <SelectTriggerFluid icon={Home} placeholder="Navegar…" />
      <SelectContentFluid>
        <SelectItemFluid index={0} value="home" icon={Home}>
          Início
        </SelectItemFluid>
        <SelectItemFluid index={1} value="search" icon={Search}>
          Buscar
        </SelectItemFluid>
        <SelectItemFluid index={2} value="notifications" icon={Bell}>
          Notificações
        </SelectItemFluid>
        <SelectItemFluid index={3} value="settings" icon={Settings}>
          Configurações
        </SelectItemFluid>
      </SelectContentFluid>
    </SelectFluid>
  )
}

export function TabsDemo() {
  const [value, setValue] = useState("overview")
  return (
    <TabsFluid value={value} onValueChange={setValue}>
      <TabsListFluid>
        <TabItemFluid value="overview" label="Visão geral" />
        <TabItemFluid value="analytics" label="Análises" />
        <TabItemFluid value="reports" label="Relatórios" />
      </TabsListFluid>
      <TabPanelFluid value="overview" className="pt-4 text-[13px] text-muted-foreground">
        Resumo geral da conta e dos principais indicadores.
      </TabPanelFluid>
      <TabPanelFluid value="analytics" className="pt-4 text-[13px] text-muted-foreground">
        Gráficos e métricas detalhadas de uso ao longo do tempo.
      </TabPanelFluid>
      <TabPanelFluid value="reports" className="pt-4 text-[13px] text-muted-foreground">
        Exportações e relatórios agendados.
      </TabPanelFluid>
    </TabsFluid>
  )
}

export function TabsIconsDemo() {
  const [value, setValue] = useState("home")
  return (
    <TabsFluid value={value} onValueChange={setValue}>
      <TabsListFluid>
        <TabItemFluid value="home" label="Início" icon={Home} />
        <TabItemFluid value="search" label="Buscar" icon={Search} />
        <TabItemFluid value="alerts" label="Alertas" icon={Bell} />
      </TabsListFluid>
    </TabsFluid>
  )
}
