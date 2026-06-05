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
  InputGroupDemo,
  InputGroupErrorDemo,
  InputCopyDemo,
  InputCopyButtonDemo,
  TabsSubtleDemo,
  TabsSubtleIconsDemo,
  DropdownDemo,
  FileThumbnailDemo,
  AccordionDemo,
  RadioGroupDemo,
  CheckboxGroupDemo,
  SelectDemo,
  SelectIconDemo,
  TabsDemo,
  TabsIconsDemo,
  DialogDemo,
  ChatMessageDemo,
  ThinkingStepsDemo,
} from "@/data/examples-fluid-demos"
import { ThinkingIndicatorFluid } from "@/components/ui/thinking-indicator-fluid"

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

// ── Thinking Indicator ────────────────────────────────────

const thinkingIndicatorExample: Example = {
  title: "Básico",
  description: "Ícone que morfa entre formas e texto com shimmer alternando palavras a cada 4s.",
  code: `<ThinkingIndicatorFluid />`,
  render: (
    <div className="rounded-lg border border-border bg-card">
      <ThinkingIndicatorFluid />
    </div>
  ),
}

// ── File Thumbnail ────────────────────────────────────────

const fileThumbnailExample: Example = {
  title: "Preview de imagem",
  description: "Miniatura quadrada que mostra a imagem (object-cover) em três tamanhos.",
  code: `<FileThumbnailFluid file={file} size={64} />
<FileThumbnailFluid file={file} size={96} />
<FileThumbnailFluid file={file} size={128} />`,
  render: <FileThumbnailDemo />,
}

// ── Input Group ───────────────────────────────────────────

const inputGroupExample: Example = {
  title: "Campos com ícones",
  description: "Grupo com destaque por proximidade do cursor e foco animado.",
  code: `function Demo() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  return (
    <InputGroupFluid>
      <InputFieldFluid index={0} label="Nome" icon={User} value={name} onChange={setName} />
      <InputFieldFluid index={1} label="E-mail" icon={Mail} value={email} onChange={setEmail} />
    </InputGroupFluid>
  )
}`,
  render: <InputGroupDemo />,
}

const inputGroupErrorExample: Example = {
  title: "Com erro",
  description: "Estado de erro com ring e mensagem.",
  code: `<InputFieldFluid
  index={0}
  label="Senha"
  icon={Lock}
  type="password"
  value={pass}
  onChange={setPass}
  error={pass.length < 6 ? "Mínimo de 6 caracteres" : undefined}
/>`,
  render: <InputGroupErrorDemo />,
}

// ── Input Copy ────────────────────────────────────────────

const inputCopyExample: Example = {
  title: "Variante ícone",
  description: "Valor monoespaçado com botão de copiar (ícone) e tooltip.",
  code: `<InputCopyFluid label="Chave de API" value="sk_live_4eC39HqLyjWDarjtT1zdp7dc" />`,
  render: <InputCopyDemo />,
}

const inputCopyButtonExample: Example = {
  title: "Variante botão",
  description: "Ação de copiar com rótulo \"Copy\"/\"Copied\" e check animado.",
  code: `<InputCopyFluid label="Comando" variant="button" value="npx shadcn@latest add button" />`,
  render: <InputCopyButtonDemo />,
}

// ── Tabs Subtle ───────────────────────────────────────────

const tabsSubtleExample: Example = {
  title: "Básico",
  description: "Abas com pílula selecionada animada e hover por proximidade.",
  code: `function Demo() {
  const [selected, setSelected] = useState(0)
  return (
    <TabsSubtleFluid selectedIndex={selected} onSelect={setSelected} idPrefix="t">
      <TabsSubtleFluidItem index={0} label="Visão geral" />
      <TabsSubtleFluidItem index={1} label="Atividade" />
      <TabsSubtleFluidItem index={2} label="Configurações" />
    </TabsSubtleFluid>
  )
}`,
  render: <TabsSubtleDemo />,
}

const tabsSubtleIconsExample: Example = {
  title: "Rótulo só na ativa",
  description: "activeLabel: ícones sempre visíveis, rótulo só na aba selecionada.",
  code: `<TabsSubtleFluid selectedIndex={selected} onSelect={setSelected} activeLabel>
  <TabsSubtleFluidItem index={0} label="Início" icon={Home} />
  <TabsSubtleFluidItem index={1} label="Buscar" icon={Search} />
  <TabsSubtleFluidItem index={2} label="Alertas" icon={Bell} />
  <TabsSubtleFluidItem index={3} label="Ajustes" icon={Settings} />
</TabsSubtleFluid>`,
  render: <TabsSubtleIconsDemo />,
}

// ── Dropdown ──────────────────────────────────────────────

const dropdownExample: Example = {
  title: "Menu de seleção",
  description: "Itens selecionáveis (radio) com check animado, separador e destaque por proximidade.",
  code: `function Demo() {
  const [checked, setChecked] = useState(0)
  return (
    <DropdownFluid checkedIndex={checked}>
      <DropdownFluidLabel>Tema</DropdownFluidLabel>
      <MenuItemFluid index={0} label="Claro" icon={Sun} checked={checked === 0} onSelect={() => setChecked(0)} />
      <MenuItemFluid index={1} label="Escuro" icon={Moon} checked={checked === 1} onSelect={() => setChecked(1)} />
      <MenuItemFluid index={2} label="Sistema" icon={Monitor} checked={checked === 2} onSelect={() => setChecked(2)} />
      <DropdownFluidSeparator />
      <MenuItemFluid index={3} label="Configurações" icon={Settings} checked={checked === 3} onSelect={() => setChecked(3)} />
    </DropdownFluid>
  )
}`,
  render: (
    <div className="flex justify-center py-2">
      <DropdownDemo />
    </div>
  ),
}

const accordionExample: Example = {
  title: "Single (padrão)",
  description:
    "Accordion com um item aberto por vez, expansão por mola e destaque por proximidade do cursor.",
  code: `<AccordionGroup type="single" defaultValue="item-1">
  <AccordionItem value="item-1" index={0}>
    <AccordionTrigger>O que é a Fluid Functionalism?</AccordionTrigger>
    <AccordionContent>Uma biblioteca de componentes React…</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2" index={1}>
    <AccordionTrigger>Como funciona o destaque?</AccordionTrigger>
    <AccordionContent>O fundo de hover segue o cursor…</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3" index={2}>
    <AccordionTrigger>Posso abrir vários itens?</AccordionTrigger>
    <AccordionContent>Sim — use type="multiple".</AccordionContent>
  </AccordionItem>
</AccordionGroup>`,
  render: (
    <div className="flex justify-center py-2">
      <AccordionDemo />
    </div>
  ),
}

const radioGroupExample: Example = {
  title: "Básico",
  description:
    "Grupo de opções exclusivas com fundo selecionado animado, ponto que aparece com mola e navegação por teclado.",
  code: `const [value, setValue] = useState("comfortable")

<RadioGroup value={value} onValueChange={setValue}>
  <RadioItem index={0} value="default" label="Padrão" />
  <RadioItem index={1} value="comfortable" label="Confortável" />
  <RadioItem index={2} value="compact" label="Compacto" />
</RadioGroup>`,
  render: (
    <div className="flex justify-center py-2">
      <RadioGroupDemo />
    </div>
  ),
}

const checkboxGroupExample: Example = {
  title: "Merge / split",
  description:
    "Caixas de seleção cujos fundos contíguos se fundem em um bloco único e se separam quando uma linha do meio é desmarcada.",
  code: `const [checked, setChecked] = useState(new Set([0, 1]))
const toggle = (i) =>
  setChecked((prev) => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

<CheckboxGroup checkedIndices={checked}>
  {items.map((label, i) => (
    <CheckboxItem key={label} index={i} label={label}
      checked={checked.has(i)} onToggle={() => toggle(i)} />
  ))}
</CheckboxGroup>`,
  render: (
    <div className="flex justify-center py-2">
      <CheckboxGroupDemo />
    </div>
  ),
}

const selectExample: Example = {
  title: "Básico",
  description:
    "Select com popover em portal, destaque por proximidade, check animado na opção selecionada e fechamento por clique externo/Escape.",
  code: `const [value, setValue] = useState("")

<Select value={value} onValueChange={setValue}>
  <SelectTrigger placeholder="Selecione uma fruta…" />
  <SelectContent>
    <SelectItem index={0} value="apple">Maçã</SelectItem>
    <SelectItem index={1} value="banana">Banana</SelectItem>
    <SelectItem index={2} value="orange">Laranja</SelectItem>
    <SelectItem index={3} value="grape">Uva</SelectItem>
  </SelectContent>
</Select>`,
  render: (
    <div className="flex justify-center py-2">
      <SelectDemo />
    </div>
  ),
}

const selectIconExample: Example = {
  title: "Com ícones",
  description:
    "Trigger e itens com ícones lucide. O ícone do trigger ganha peso de traço no hover.",
  code: `<Select value={value} onValueChange={setValue}>
  <SelectTrigger icon={Home} placeholder="Navegar…" />
  <SelectContent>
    <SelectItem index={0} value="home" icon={Home}>Início</SelectItem>
    <SelectItem index={1} value="search" icon={Search}>Buscar</SelectItem>
    <SelectItem index={2} value="notifications" icon={Bell}>Notificações</SelectItem>
    <SelectItem index={3} value="settings" icon={Settings}>Configurações</SelectItem>
  </SelectContent>
</Select>`,
  render: (
    <div className="flex justify-center py-2">
      <SelectIconDemo />
    </div>
  ),
}

const tabsExample: Example = {
  title: "Básico",
  description:
    "Abas com indicador de pílula elevada que desliza por mola, hover por proximidade horizontal e painéis controlados.",
  code: `const [value, setValue] = useState("overview")

<Tabs value={value} onValueChange={setValue}>
  <TabsList>
    <TabItem value="overview" label="Visão geral" />
    <TabItem value="analytics" label="Análises" />
    <TabItem value="reports" label="Relatórios" />
  </TabsList>
  <TabPanel value="overview">Resumo geral…</TabPanel>
  <TabPanel value="analytics">Gráficos e métricas…</TabPanel>
  <TabPanel value="reports">Exportações e relatórios…</TabPanel>
</Tabs>`,
  render: (
    <div className="flex justify-center py-2">
      <TabsDemo />
    </div>
  ),
}

const tabsIconsExample: Example = {
  title: "Com ícones",
  description: "Abas com ícone à esquerda do rótulo.",
  code: `<Tabs value={value} onValueChange={setValue}>
  <TabsList>
    <TabItem value="home" label="Início" icon={Home} />
    <TabItem value="search" label="Buscar" icon={Search} />
    <TabItem value="alerts" label="Alertas" icon={Bell} />
  </TabsList>
</Tabs>`,
  render: (
    <div className="flex justify-center py-2">
      <TabsIconsDemo />
    </div>
  ),
}

// ── Dialog ────────────────────────────────────────────────

const dialogExample: Example = {
  title: "Básico",
  description: "Modal com cabeçalho, descrição e ações no rodapé.",
  code: `<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button variant="primary">Abrir diálogo</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar ação</DialogTitle>
      <DialogDescription>
        Esta ação não pode ser desfeita. Deseja continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="ghost">Cancelar</Button>
      </DialogClose>
      <DialogClose asChild>
        <Button variant="primary">Confirmar</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  render: (
    <div className="flex justify-center py-2">
      <DialogDemo />
    </div>
  ),
}

// ── Chat Message ──────────────────────────────────────────

const chatMessageExample: Example = {
  title: "Conversa",
  description:
    "Mensagem do usuário (bolha à direita) e resposta do assistente (texto à esquerda) com ações reveladas no hover.",
  code: `<ChatMessage from="user" time="Hoje 14:32">
  Como faço pra centralizar uma div em CSS?
</ChatMessage>
<ChatMessage
  from="assistant"
  actions={
    <>
      <Button variant="ghost" size="icon-sm" aria-label="Copiar">
        <Copy />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Regenerar">
        <RefreshCw />
      </Button>
    </>
  }
>
  Use \`display: flex\` no container…
</ChatMessage>`,
  render: (
    <div className="flex justify-center py-2">
      <div className="w-full max-w-md">
        <ChatMessageDemo />
      </div>
    </div>
  ),
}

// ── Thinking Steps ────────────────────────────────────────

const thinkingStepsExample: Example = {
  title: "Trilha de raciocínio",
  description:
    "Passos animados com status, fontes em badges e detalhes aninhados expansíveis.",
  code: `<ThinkingSteps defaultOpen>
  <ThinkingStepsHeader>Pensando</ThinkingStepsHeader>
  <ThinkingStepsContent>
    <ThinkingStep index={0} icon="search" label="Analisando a pergunta"
      description="Identificando a intenção." status="complete" />
    <ThinkingStep index={1} icon="globe" label="Buscando fontes" status="complete">
      <ThinkingStepSources>
        <ThinkingStepSource color="blue">docs.css</ThinkingStepSource>
        <ThinkingStepSource color="green">mdn.dev</ThinkingStepSource>
      </ThinkingStepSources>
    </ThinkingStep>
    <ThinkingStep index={2} icon="check" label="Montando a resposta"
      status="complete" isLast>
      <ThinkingStepDetails summary="Ver detalhes"
        details={["Comparou flexbox vs grid.", "Escolheu flexbox."]} />
    </ThinkingStep>
  </ThinkingStepsContent>
</ThinkingSteps>`,
  render: (
    <div className="flex justify-center py-2">
      <ThinkingStepsDemo />
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
  "file-thumbnail-fluid": [fileThumbnailExample],
  "thinking-indicator-fluid": [thinkingIndicatorExample],
  "input-group-fluid": [inputGroupExample, inputGroupErrorExample],
  "input-copy-fluid": [inputCopyExample, inputCopyButtonExample],
  "tabs-subtle-fluid": [tabsSubtleExample, tabsSubtleIconsExample],
  "dropdown-fluid": [dropdownExample],
  "accordion-fluid": [accordionExample],
  "radio-group-fluid": [radioGroupExample],
  "checkbox-group-fluid": [checkboxGroupExample],
  "select-fluid": [selectExample, selectIconExample],
  "tabs-fluid": [tabsExample, tabsIconsExample],
  "dialog-fluid": [dialogExample],
  "chat-message-fluid": [chatMessageExample],
  "thinking-steps-fluid": [thinkingStepsExample],
}
