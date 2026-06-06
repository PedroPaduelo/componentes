/**
 * Composição "Component Playground".
 *
 * Bancada ("kitchen sink") que reúne primitivos e overlays do registry em
 * seções rotuladas, exercitando a cobertura final dos componentes. Cada bloco
 * demonstra um agrupamento (navegação, ações, conteúdo, overlays) usando SÓ
 * componentes do barrel `@/components/ui`, com tokens shadcn (light/dark).
 *
 * Componentes usados (~15):
 * Card, TabsFluid, TabsSubtleFluid, AccordionFluid, Dialog, DialogFluid,
 * DropdownMenu, DropdownFluid, Sheet, BadgeFluid, Button, CopyButton,
 * CodeBlockCommand, ScrollFadeEffect, GlassDock.
 */
import { useState } from "react"
import {
  Home,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Settings,
  Terminal,
  Layout as LayoutIcon,
  Archive,
  History,
  Github,
  ChevronDown,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  BadgeFluid,
  CopyButton,
  CodeBlockCommand,
  ScrollFadeEffect,
  GlassDock,
  // Tabs (Fluid)
  TabsFluid,
  TabsListFluid,
  TabItemFluid,
  TabPanelFluid,
  // Tabs subtle (Fluid)
  TabsSubtleFluid,
  TabsSubtleFluidItem,
  TabsSubtleFluidPanel,
  // Accordion (Fluid)
  AccordionFluid,
  AccordionGroupFluid,
  AccordionItemFluid,
  AccordionTriggerFluid,
  AccordionContentFluid,
  // Dialog (shadcn)
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // Dialog (Fluid)
  DialogFluid,
  DialogTriggerFluid,
  DialogContentFluid,
  DialogHeaderFluid,
  DialogFooterFluid,
  DialogTitleFluid,
  DialogDescriptionFluid,
  DialogCloseFluid,
  ButtonFluid,
  // Dropdown (shadcn)
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  // Dropdown (Fluid)
  DropdownFluid,
  DropdownFluidLabel,
  DropdownFluidSeparator,
  MenuItemFluid,
  // Sheet (shadcn)
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui"

/* -------------------------------------------------------------------------- */
/*                                 helpers                                     */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card data-slot="playground-section">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-start gap-4">
        {children}
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                              navegação (tabs)                               */
/* -------------------------------------------------------------------------- */

function NavigationSection() {
  const [tab, setTab] = useState("overview")
  const [subtle, setSubtle] = useState(0)
  return (
    <Section
      title="Navegação"
      description="Abas com mola (TabsFluid) e abas sutis (TabsSubtleFluid)."
    >
      <div className="w-full max-w-md">
        <TabsFluid value={tab} onValueChange={setTab}>
          <TabsListFluid>
            <TabItemFluid value="overview" label="Visão geral" />
            <TabItemFluid value="analytics" label="Análises" />
            <TabItemFluid value="reports" label="Relatórios" />
          </TabsListFluid>
          <TabPanelFluid
            value="overview"
            className="pt-4 text-[13px] text-muted-foreground"
          >
            Resumo do projeto e principais métricas.
          </TabPanelFluid>
          <TabPanelFluid
            value="analytics"
            className="pt-4 text-[13px] text-muted-foreground"
          >
            Gráficos de engajamento e conversão.
          </TabPanelFluid>
          <TabPanelFluid
            value="reports"
            className="pt-4 text-[13px] text-muted-foreground"
          >
            Relatórios exportáveis em PDF e CSV.
          </TabPanelFluid>
        </TabsFluid>
      </div>

      <div className="w-full max-w-md">
        <TabsSubtleFluid
          selectedIndex={subtle}
          onSelect={setSubtle}
          idPrefix="pg-subtle"
        >
          <TabsSubtleFluidItem index={0} label="Início" icon={Home} />
          <TabsSubtleFluidItem index={1} label="Buscar" icon={Search} />
          <TabsSubtleFluidItem index={2} label="Alertas" icon={Bell} />
        </TabsSubtleFluid>
        <TabsSubtleFluidPanel
          index={0}
          selectedIndex={subtle}
          idPrefix="pg-subtle"
        >
          <p className="pt-3 text-[13px] text-muted-foreground">
            Painel de início com atalhos.
          </p>
        </TabsSubtleFluidPanel>
        <TabsSubtleFluidPanel
          index={1}
          selectedIndex={subtle}
          idPrefix="pg-subtle"
        >
          <p className="pt-3 text-[13px] text-muted-foreground">
            Resultados da busca recente.
          </p>
        </TabsSubtleFluidPanel>
        <TabsSubtleFluidPanel
          index={2}
          selectedIndex={subtle}
          idPrefix="pg-subtle"
        >
          <p className="pt-3 text-[13px] text-muted-foreground">
            Suas notificações pendentes.
          </p>
        </TabsSubtleFluidPanel>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  ações                                      */
/* -------------------------------------------------------------------------- */

function ActionsSection() {
  return (
    <Section
      title="Ações e selos"
      description="Botões, selos coloridos (BadgeFluid) e botão de copiar."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button>Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="outline">Contornado</Button>
        <Button variant="ghost">Fantasma</Button>
      </div>
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
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5">
        <code className="text-xs text-muted-foreground">
          npx create-vite@latest
        </code>
        <CopyButton value="npx create-vite@latest" aria-label="Copiar comando" />
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                            conteúdo / docs                                  */
/* -------------------------------------------------------------------------- */

function ContentSection() {
  return (
    <Section
      title="Conteúdo e documentação"
      description="Accordion com mola, bloco de comando e área com fade no scroll."
    >
      <div className="w-full max-w-md">
        <AccordionGroupFluid type="single" defaultValue="item-1">
          <AccordionItemFluid value="item-1" index={0}>
            <AccordionTriggerFluid>O que é o playground?</AccordionTriggerFluid>
            <AccordionContentFluid>
              Uma bancada que reúne primitivos e overlays do registry para
              testar comportamento e tema rapidamente.
            </AccordionContentFluid>
          </AccordionItemFluid>
          <AccordionItemFluid value="item-2" index={1}>
            <AccordionTriggerFluid>Posso copiar o código?</AccordionTriggerFluid>
            <AccordionContentFluid>
              Sim — cada componente tem sua página de detalhe com snippet e botão
              de copiar.
            </AccordionContentFluid>
          </AccordionItemFluid>
          <AccordionItemFluid value="item-3" index={2}>
            <AccordionTriggerFluid>Suporta tema escuro?</AccordionTriggerFluid>
            <AccordionContentFluid>
              Tudo usa tokens shadcn, então responde ao toggle de tema
              automaticamente.
            </AccordionContentFluid>
          </AccordionItemFluid>
        </AccordionGroupFluid>
      </div>

      <div className="w-full max-w-md">
        <CodeBlockCommand
          code="npm install @tanstack/react-query"
          language="shell"
        />
      </div>

      <ScrollFadeEffect className="h-44 w-full max-w-md rounded-lg border border-border p-4">
        <div className="space-y-2 text-[13px] text-muted-foreground">
          <p>Role esta área para ver o efeito de fade nas bordas.</p>
          <p>O fade indica que há mais conteúdo acima ou abaixo.</p>
          <p>Linha 3 — conteúdo de exemplo.</p>
          <p>Linha 4 — conteúdo de exemplo.</p>
          <p>Linha 5 — conteúdo de exemplo.</p>
          <p>Linha 6 — conteúdo de exemplo.</p>
          <p>Linha 7 — conteúdo de exemplo.</p>
          <p>Linha 8 — fim do conteúdo.</p>
        </div>
      </ScrollFadeEffect>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 overlays                                    */
/* -------------------------------------------------------------------------- */

function OverlaysSection() {
  const [dialogFluidOpen, setDialogFluidOpen] = useState(false)
  const [checked, setChecked] = useState(0)

  const themeOptions = [
    { label: "Claro", icon: Sun },
    { label: "Escuro", icon: Moon },
    { label: "Sistema", icon: Monitor },
  ]

  return (
    <Section
      title="Overlays"
      description="Dialog (shadcn + Fluid), dropdowns e sheet — clique para abrir."
    >
      {/* Dialog shadcn */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Abrir Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog (shadcn)</DialogTitle>
            <DialogDescription>
              Modal padrão do registry, com overlay e foco preso.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Conteúdo do diálogo. Pressione Esc ou clique fora para fechar.
          </p>
          <DialogFooter>
            <Button variant="secondary">Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Fluid */}
      <DialogFluid open={dialogFluidOpen} onOpenChange={setDialogFluidOpen}>
        <DialogTriggerFluid asChild>
          <ButtonFluid variant="primary">Abrir Dialog Fluid</ButtonFluid>
        </DialogTriggerFluid>
        <DialogContentFluid>
          <DialogHeaderFluid>
            <DialogTitleFluid>Confirmar ação</DialogTitleFluid>
            <DialogDescriptionFluid>
              Esta ação não pode ser desfeita. Deseja continuar?
            </DialogDescriptionFluid>
          </DialogHeaderFluid>
          <DialogFooterFluid>
            <DialogCloseFluid asChild>
              <ButtonFluid variant="ghost">Cancelar</ButtonFluid>
            </DialogCloseFluid>
            <DialogCloseFluid asChild>
              <ButtonFluid variant="primary">Confirmar</ButtonFluid>
            </DialogCloseFluid>
          </DialogFooterFluid>
        </DialogContentFluid>
      </DialogFluid>

      {/* Dropdown shadcn */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Menu
            <ChevronDown className="ml-1 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Conta</DropdownMenuLabel>
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Faturamento</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dropdown Fluid */}
      <DropdownFluid checkedIndex={checked}>
        <DropdownFluidLabel>Tema</DropdownFluidLabel>
        {themeOptions.map((opt, i) => (
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

      {/* Sheet shadcn */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Abrir Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Painel lateral</SheetTitle>
            <SheetDescription>
              Sheet do registry deslizando da borda da tela.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 text-sm text-muted-foreground">
            Use sheets para configurações contextuais e fluxos secundários.
          </div>
        </SheetContent>
      </Sheet>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   dock                                      */
/* -------------------------------------------------------------------------- */

function DockSection() {
  return (
    <Section
      title="Dock"
      description="GlassDock glassmorphic com magnify no hover."
    >
      <div className="flex h-[180px] w-full items-center justify-center">
        <GlassDock
          items={[
            { title: "Home", icon: Home },
            { title: "Terminal", icon: Terminal },
            { title: "Layout", icon: LayoutIcon },
            { title: "Archive", icon: Archive },
            { title: "History", icon: History },
            { title: "Settings", icon: Settings },
            { title: "Github", icon: Github },
          ]}
        />
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   faq                                       */
/* -------------------------------------------------------------------------- */

function FaqSection() {
  return (
    <Section
      title="Perguntas frequentes"
      description="Accordion standalone com mola (AccordionFluid) — single + collapsible."
    >
      <div className="w-full max-w-md">
        <AccordionFluid type="single" collapsible defaultValue="faq-1">
          <AccordionItemFluid value="faq-1">
            <AccordionTriggerFluid>
              Posso cancelar quando quiser?
            </AccordionTriggerFluid>
            <AccordionContentFluid>
              Sim — cancele a qualquer momento, sem multa nem letras miúdas.
            </AccordionContentFluid>
          </AccordionItemFluid>
          <AccordionItemFluid value="faq-2">
            <AccordionTriggerFluid>
              Os componentes seguem o tema?
            </AccordionTriggerFluid>
            <AccordionContentFluid>
              Tudo usa tokens shadcn, então responde ao toggle de tema
              automaticamente em light e dark.
            </AccordionContentFluid>
          </AccordionItemFluid>
          <AccordionItemFluid value="faq-3">
            <AccordionTriggerFluid>
              Preciso instalar dependências extras?
            </AccordionTriggerFluid>
            <AccordionContentFluid>
              Não — todos os componentes desta bancada vêm do mesmo barrel
              `@/components/ui`.
            </AccordionContentFluid>
          </AccordionItemFluid>
        </AccordionFluid>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  página                                     */
/* -------------------------------------------------------------------------- */

export function ComponentPlayground() {
  return (
    <div
      data-slot="component-playground"
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Component Playground
        </h1>
        <p className="text-sm text-muted-foreground">
          Bancada de primitivos e overlays do registry — navegação, ações,
          conteúdo, overlays e dock.
        </p>
      </header>

      <NavigationSection />
      <ActionsSection />
      <ContentSection />
      <OverlaysSection />
      <DockSection />
      <FaqSection />
    </div>
  )
}
