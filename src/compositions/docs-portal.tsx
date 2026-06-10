/**
 * Composição "Portal de Documentação".
 *
 * Doc de produto/dev NAVEGÁVEL: sidebar à esquerda agrupada por seções; clicar
 * um item troca o conteúdo central (useState). Topbar com busca e um Command
 * palette (CommandDialog) que abre com Cmd/Ctrl+K e também navega entre docs.
 * Conteúdo central: breadcrumb, título, Tabs de exemplos, CodeBlockCommand
 * (instalação com copiar), CodeBlock, callouts (Alert), Accordion de FAQ e
 * Table de props. Coluna direita "Nesta página" com âncoras das seções.
 *
 * Tudo em tokens shadcn (light/dark). Componentes usados (~16):
 * Breadcrumb, Tabs, CodeBlock, CodeBlockCommand, Alert, Accordion, Table,
 * Command/CommandDialog, Badge, Button, Input, Separator, ScrollArea.
 */
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Edge,
  type NodeTypes,
} from "@xyflow/react"
import {
  Book,
  Boxes,
  Component,
  FileCode2,
  FileText,
  Hash,
  Info,
  Lightbulb,
  Menu,
  Network,
  PanelsTopLeft,
  Rocket,
  Search,
  Settings2,
  TriangleAlert,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import {
  DocGroupNode,
  DocPageNode,
  DocRootNode,
  type DocMapGroupColor,
  type DocMapNodeType,
} from "@/compositions/docs-portal-map-nodes"

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  CodeBlock,
  CodeBlockCommand,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                              modelo de dados                               */
/* -------------------------------------------------------------------------- */

type PropRow = {
  name: string
  type: string
  default: string
  description: string
}

type Example = {
  value: string
  label: string
  description: string
  language: string
  filename: string
  code: string
}

type FaqItem = {
  question: string
  answer: string
}

type Callout = {
  variant: "default" | "destructive"
  icon: LucideIcon
  title: string
  description: string
}

type DocPage = {
  id: string
  group: string
  title: string
  badge: string
  description: string
  install: string
  importLine: string
  examples: Example[]
  props: PropRow[]
  faq: FaqItem[]
  callouts: Callout[]
}

type SidebarGroup = {
  group: string
  icon: LucideIcon
  pages: DocPage[]
}

/* -------------------------------------------------------------------------- */
/*                                conteúdo                                     */
/* -------------------------------------------------------------------------- */

const DOCS: DocPage[] = [
  {
    id: "introducao",
    group: "Começando",
    title: "Introdução",
    badge: "Guia",
    description:
      "Visão geral do design system: princípios, anatomia dos componentes e como tudo se encaixa no seu app.",
    install: "npm install @acme/ui",
    importLine: `import { Button } from "@acme/ui"`,
    examples: [
      {
        value: "preview",
        label: "Visão geral",
        description: "Importe e renderize qualquer componente em segundos.",
        language: "tsx",
        filename: "app.tsx",
        code: `import { Button, Card } from "@acme/ui"

export function App() {
  return (
    <Card>
      <h2>Olá, mundo</h2>
      <Button>Começar agora</Button>
    </Card>
  )
}`,
      },
      {
        value: "theme",
        label: "Tema",
        description: "Tokens semânticos respondem ao modo claro/escuro.",
        language: "tsx",
        filename: "theme.tsx",
        code: `import { ThemeProvider } from "@acme/ui"

export function Root({ children }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      {children}
    </ThemeProvider>
  )
}`,
      },
    ],
    props: [
      {
        name: "theme",
        type: `"light" | "dark" | "system"`,
        default: `"system"`,
        description: "Tema inicial aplicado ao montar o provider.",
      },
      {
        name: "storageKey",
        type: "string",
        default: `"ui-theme"`,
        description: "Chave usada para persistir a preferência no localStorage.",
      },
      {
        name: "disableTransitionOnChange",
        type: "boolean",
        default: "false",
        description: "Evita transições de cor ao alternar o tema.",
      },
    ],
    faq: [
      {
        question: "Preciso configurar o Tailwind?",
        answer:
          "Sim — adicione o preset do design system ao seu tailwind.config e importe o CSS base uma vez na raiz do app.",
      },
      {
        question: "Funciona com React Server Components?",
        answer:
          "Os primitivos interativos são client components; envolva-os em arquivos marcados com \"use client\" quando necessário.",
      },
      {
        question: "Posso usar só um componente?",
        answer:
          "Pode. O barrel é tree-shakeable, então o bundle final inclui apenas o que você importar de fato.",
      },
    ],
    callouts: [
      {
        variant: "default",
        icon: Info,
        title: "Dica de instalação",
        description:
          "Rode o instalador uma única vez por projeto — ele cuida das dependências de peer e dos tokens de tema.",
      },
    ],
  },
  {
    id: "instalacao",
    group: "Começando",
    title: "Instalação",
    badge: "Setup",
    description:
      "Adicione o pacote, configure os tokens e importe o CSS base. Em poucos minutos você tem o tema rodando.",
    install: "npm install @acme/ui class-variance-authority",
    importLine: `import "@acme/ui/styles.css"`,
    examples: [
      {
        value: "cli",
        label: "Via CLI",
        description: "O jeito mais rápido — o CLI cria o config por você.",
        language: "bash",
        filename: "terminal",
        code: `# Inicializa o design system no projeto
npx @acme/ui init

# Adiciona um componente específico
npx @acme/ui add button card dialog`,
      },
      {
        value: "manual",
        label: "Manual",
        description: "Para controle total sobre o que entra no projeto.",
        language: "tsx",
        filename: "main.tsx",
        code: `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@acme/ui/styles.css"
import { App } from "./app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)`,
      },
    ],
    props: [
      {
        name: "--background",
        type: "color",
        default: "oklch(1 0 0)",
        description: "Cor de fundo base da superfície.",
      },
      {
        name: "--foreground",
        type: "color",
        default: "oklch(0.145 0 0)",
        description: "Cor de texto principal sobre o fundo.",
      },
      {
        name: "--radius",
        type: "length",
        default: "0.625rem",
        description: "Raio de borda compartilhado entre os componentes.",
      },
    ],
    faq: [
      {
        question: "Quais versões de React são suportadas?",
        answer: "React 18 e 19. A lib usa apenas APIs estáveis do React.",
      },
      {
        question: "Preciso de um bundler específico?",
        answer:
          "Não. Vite, Next.js, Remix e qualquer bundler com suporte a ESM funcionam sem ajustes.",
      },
    ],
    callouts: [
      {
        variant: "destructive",
        icon: TriangleAlert,
        title: "Atenção com o CSS",
        description:
          "Importe o styles.css uma única vez na raiz. Importações duplicadas inflam o bundle e podem sobrescrever tokens.",
      },
    ],
  },
  {
    id: "button",
    group: "Componentes",
    title: "Button",
    badge: "Componente",
    description:
      "Botão acessível com variantes, tamanhos e suporte a ícones. A base de toda ação no seu produto.",
    install: "npx @acme/ui add button",
    importLine: `import { Button } from "@acme/ui"`,
    examples: [
      {
        value: "variants",
        label: "Variantes",
        description: "Cinco estilos visuais para cada nível de ênfase.",
        language: "tsx",
        filename: "buttons.tsx",
        code: `<div className="flex gap-3">
  <Button>Primário</Button>
  <Button variant="secondary">Secundário</Button>
  <Button variant="outline">Contornado</Button>
  <Button variant="ghost">Fantasma</Button>
  <Button variant="destructive">Excluir</Button>
</div>`,
      },
      {
        value: "sizes",
        label: "Tamanhos",
        description: "Do compacto ao grande, com área de toque adequada.",
        language: "tsx",
        filename: "sizes.tsx",
        code: `<div className="flex items-center gap-3">
  <Button size="sm">Pequeno</Button>
  <Button size="default">Padrão</Button>
  <Button size="lg">Grande</Button>
  <Button size="icon" aria-label="Buscar">
    <Search />
  </Button>
</div>`,
      },
      {
        value: "loading",
        label: "Carregando",
        description: "Estado de carregamento com indicador e desabilitado.",
        language: "tsx",
        filename: "loading.tsx",
        code: `<Button disabled>
  <Loader className="animate-spin" />
  Salvando…
</Button>`,
      },
    ],
    props: [
      {
        name: "variant",
        type: `"default" | "secondary" | "outline" | "ghost" | "destructive"`,
        default: `"default"`,
        description: "Estilo visual do botão conforme a ênfase desejada.",
      },
      {
        name: "size",
        type: `"sm" | "default" | "lg" | "icon"`,
        default: `"default"`,
        description: "Controla padding e altura do botão.",
      },
      {
        name: "asChild",
        type: "boolean",
        default: "false",
        description: "Renderiza o filho como elemento raiz (ex.: <a>).",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Desabilita interações e reduz a opacidade.",
      },
    ],
    faq: [
      {
        question: "Como faço um botão virar link?",
        answer:
          "Use a prop asChild e coloque um <a> (ou <Link>) como filho — o botão repassa os estilos para ele.",
      },
      {
        question: "Dá para colocar ícone à esquerda e à direita?",
        answer:
          "Sim — qualquer ícone é alinhado automaticamente com gap consistente. Use size=\"icon\" para botões só de ícone.",
      },
    ],
    callouts: [
      {
        variant: "default",
        icon: Lightbulb,
        title: "Boas práticas",
        description:
          "Use uma única ação primária por vista. Variantes secundárias e fantasma reduzem ruído visual em ações de apoio.",
      },
    ],
  },
  {
    id: "dialog",
    group: "Componentes",
    title: "Dialog",
    badge: "Overlay",
    description:
      "Janela modal com overlay, foco preso e fechamento por Esc. Ideal para confirmações e formulários curtos.",
    install: "npx @acme/ui add dialog",
    importLine: `import { Dialog, DialogContent } from "@acme/ui"`,
    examples: [
      {
        value: "basic",
        label: "Básico",
        description: "Gatilho, cabeçalho, corpo e rodapé com ações.",
        language: "tsx",
        filename: "dialog.tsx",
        code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar</DialogTitle>
      <DialogDescription>Deseja continuar?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      },
      {
        value: "controlled",
        label: "Controlado",
        description: "Controle o estado de abertura via useState.",
        language: "tsx",
        filename: "controlled.tsx",
        code: `const [open, setOpen] = useState(false)

return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>{/* … */}</DialogContent>
  </Dialog>
)`,
      },
    ],
    props: [
      {
        name: "open",
        type: "boolean",
        default: "—",
        description: "Estado controlado de abertura do diálogo.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        default: "—",
        description: "Disparado quando o usuário abre ou fecha.",
      },
      {
        name: "modal",
        type: "boolean",
        default: "true",
        description: "Quando true, bloqueia interação com o restante da página.",
      },
    ],
    faq: [
      {
        question: "O foco volta para o gatilho ao fechar?",
        answer:
          "Sim — o foco é restaurado automaticamente para o elemento que abriu o diálogo, seguindo as práticas de acessibilidade.",
      },
      {
        question: "Posso aninhar um diálogo dentro de outro?",
        answer:
          "É possível, mas evite — prefira fluxos de etapas dentro do mesmo diálogo para não confundir o usuário.",
      },
    ],
    callouts: [
      {
        variant: "default",
        icon: Info,
        title: "Acessibilidade",
        description:
          "Sempre forneça um DialogTitle. Leitores de tela o anunciam ao abrir o modal, dando contexto imediato.",
      },
    ],
  },
  {
    id: "tabs",
    group: "Componentes",
    title: "Tabs",
    badge: "Navegação",
    description:
      "Alterne entre painéis de conteúdo relacionados sem sair da página. Navegação por teclado inclusa.",
    install: "npx @acme/ui add tabs",
    importLine: `import { Tabs, TabsContent } from "@acme/ui"`,
    examples: [
      {
        value: "basic",
        label: "Básico",
        description: "Lista de gatilhos e painéis correspondentes.",
        language: "tsx",
        filename: "tabs.tsx",
        code: `<Tabs defaultValue="conta">
  <TabsList>
    <TabsTrigger value="conta">Conta</TabsTrigger>
    <TabsTrigger value="senha">Senha</TabsTrigger>
  </TabsList>
  <TabsContent value="conta">Dados da conta</TabsContent>
  <TabsContent value="senha">Trocar senha</TabsContent>
</Tabs>`,
      },
    ],
    props: [
      {
        name: "defaultValue",
        type: "string",
        default: "—",
        description: "Aba ativa inicial quando não controlado.",
      },
      {
        name: "value",
        type: "string",
        default: "—",
        description: "Aba ativa em modo controlado.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        default: "—",
        description: "Disparado quando a aba ativa muda.",
      },
      {
        name: "orientation",
        type: `"horizontal" | "vertical"`,
        default: `"horizontal"`,
        description: "Direção da navegação por setas do teclado.",
      },
    ],
    faq: [
      {
        question: "As setas do teclado funcionam?",
        answer:
          "Sim — use as setas para mover entre abas e Home/End para ir à primeira ou última. Tudo segue o padrão WAI-ARIA.",
      },
    ],
    callouts: [
      {
        variant: "default",
        icon: Lightbulb,
        title: "Quando usar",
        description:
          "Use abas para conteúdo paralelo de mesmo nível. Para passos sequenciais, prefira um stepper.",
      },
    ],
  },
  {
    id: "tema",
    group: "Fundamentos",
    title: "Tema & Tokens",
    badge: "Fundamento",
    description:
      "Tokens semânticos em CSS variables alimentam todos os componentes e respondem ao modo claro/escuro.",
    install: "npx @acme/ui add theme",
    importLine: `import { useTheme } from "@acme/ui"`,
    examples: [
      {
        value: "tokens",
        label: "Tokens",
        description: "Use os tokens semânticos no lugar de cores fixas.",
        language: "css",
        filename: "tokens.css",
        code: `:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}`,
      },
      {
        value: "hook",
        label: "Hook",
        description: "Leia e troque o tema programaticamente.",
        language: "tsx",
        filename: "toggle.tsx",
        code: `const { resolvedTheme, setTheme } = useTheme()

return (
  <Button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
    Alternar tema
  </Button>
)`,
      },
    ],
    props: [
      {
        name: "resolvedTheme",
        type: `"light" | "dark"`,
        default: "—",
        description: "Tema efetivo após resolver a opção \"system\".",
      },
      {
        name: "setTheme",
        type: `(theme: "light" | "dark" | "system") => void`,
        default: "—",
        description: "Define o tema e persiste a preferência.",
      },
    ],
    faq: [
      {
        question: "Como adiciono uma cor de marca?",
        answer:
          "Defina o token em :root e em .dark, depois referencie via classe utilitária. Os componentes herdam o contraste correto.",
      },
      {
        question: "Os tokens funcionam com Tailwind v4?",
        answer:
          "Sim — eles são mapeados em @theme inline, então as classes utilitárias enxergam cada token automaticamente.",
      },
    ],
    callouts: [
      {
        variant: "default",
        icon: Info,
        title: "Contraste",
        description:
          "Sempre pareie um token de fundo com o seu foreground correspondente para garantir contraste AA em ambos os temas.",
      },
    ],
  },
]

const GROUP_ICONS: Record<string, LucideIcon> = {
  "Começando": Rocket,
  Componentes: Component,
  Fundamentos: Boxes,
}

function buildGroups(): SidebarGroup[] {
  const order: string[] = []
  const map = new Map<string, DocPage[]>()
  for (const page of DOCS) {
    if (!map.has(page.group)) {
      map.set(page.group, [])
      order.push(page.group)
    }
    map.get(page.group)?.push(page)
  }
  return order.map((group) => ({
    group,
    icon: GROUP_ICONS[group] ?? Book,
    pages: map.get(group) ?? [],
  }))
}

/* -------------------------------------------------------------------------- */
/*                          mapa da documentação                              */
/* -------------------------------------------------------------------------- */

/** Cor de ramo atribuída a cada seção, na ordem em que aparecem. */
const GROUP_COLOR_ORDER: DocMapGroupColor[] = [
  "sky",
  "violet",
  "emerald",
  "amber",
  "rose",
  "teal",
]

/** Cor decorativa do MiniMap por ramo (hex — não são tokens de tema). */
const GROUP_HEX: Record<DocMapGroupColor, string> = {
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  teal: "#14b8a6",
}

const MAP_COL_GAP = 300
const MAP_ROW_GAP = 86
const MAP_GROUP_Y = 150
const MAP_PAGE_Y0 = 286

const MAP_ROOT_ID = "root"

const MAP_EDGE: Partial<Edge> = {
  type: "smoothstep",
  style: { stroke: "var(--muted-foreground)", strokeWidth: 1.5 },
}

/** ID determinístico do nó de uma página. */
function pageNodeId(pageId: string): string {
  return `page:${pageId}`
}

/** Auto-layout em árvore determinístico: raiz → seções (colunas) → páginas. */
function buildMapGraph(
  groups: SidebarGroup[],
  activeId: string,
): { nodes: DocMapNodeType[]; edges: Edge[] } {
  const nodes: DocMapNodeType[] = []
  const edges: Edge[] = []
  const centerX = ((groups.length - 1) * MAP_COL_GAP) / 2

  nodes.push({
    id: MAP_ROOT_ID,
    type: "docRoot",
    position: { x: centerX, y: 0 },
    data: { label: "Acme UI Docs" },
  })

  groups.forEach((group, gi) => {
    const color = GROUP_COLOR_ORDER[gi % GROUP_COLOR_ORDER.length]
    const x = gi * MAP_COL_GAP
    const groupId = `group:${group.group}`

    nodes.push({
      id: groupId,
      type: "docGroup",
      position: { x, y: MAP_GROUP_Y },
      data: {
        label: group.group,
        color,
        icon: group.icon,
        count: group.pages.length,
      },
    })
    edges.push({
      id: `e-${MAP_ROOT_ID}-${groupId}`,
      source: MAP_ROOT_ID,
      target: groupId,
      ...MAP_EDGE,
    })

    group.pages.forEach((page, pi) => {
      const id = pageNodeId(page.id)
      nodes.push({
        id,
        type: "docPage",
        position: { x, y: MAP_PAGE_Y0 + pi * MAP_ROW_GAP },
        data: {
          label: page.title,
          badge: page.badge,
          color,
          active: page.id === activeId,
        },
      })
      edges.push({
        id: `e-${groupId}-${id}`,
        source: groupId,
        target: id,
        ...MAP_EDGE,
      })
    })
  })

  return { nodes, edges }
}

const MAP_NODE_TYPES: NodeTypes = {
  docRoot: DocRootNode,
  docGroup: DocGroupNode,
  docPage: DocPageNode,
}

function DocsMap({
  groups,
  activeId,
  onNavigate,
}: {
  groups: SidebarGroup[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  const { resolvedTheme } = useTheme()
  const { nodes, edges } = useMemo(
    () => buildMapGraph(groups, activeId),
    [groups, activeId],
  )

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: DocMapNodeType) => {
      if (node.type === "docPage" && node.id.startsWith("page:")) {
        onNavigate(node.id.slice("page:".length))
      }
    },
    [onNavigate],
  )

  return (
    <section
      aria-label="Mapa da documentação"
      className="h-[70vh] min-h-[480px] w-full overflow-hidden rounded-xl border border-border bg-card/30"
    >
      <div data-slot="react-flow" className="h-full w-full">
        <ReactFlow<DocMapNodeType, Edge>
          colorMode={resolvedTheme}
          nodes={nodes}
          edges={edges}
          nodeTypes={MAP_NODE_TYPES}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          nodesDraggable={false}
          nodesConnectable={false}
          deleteKeyCode={null}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              if (n.type === "docRoot") return "var(--primary)"
              const data = n.data as { color?: DocMapGroupColor }
              return data.color ? GROUP_HEX[data.color] : "var(--muted-foreground)"
            }}
          />
        </ReactFlow>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                sidebar nav                                  */
/* -------------------------------------------------------------------------- */

function SidebarNav({
  groups,
  activeId,
  onSelect,
}: {
  groups: SidebarGroup[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="flex flex-col gap-5" aria-label="Navegação da documentação">
      {groups.map((group) => {
        const GroupIcon = group.icon
        return (
          <div key={group.group} className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <GroupIcon className="size-3.5" />
              {group.group}
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.pages.map((page) => {
                const active = page.id === activeId
                return (
                  <li key={page.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(page.id)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        active
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full transition-colors",
                          active ? "bg-primary" : "bg-border",
                        )}
                      />
                      {page.title}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*                               doc content                                   */
/* -------------------------------------------------------------------------- */

const SECTIONS: { id: string; label: string }[] = [
  { id: "exemplos", label: "Exemplos" },
  { id: "instalacao", label: "Instalação" },
  { id: "notas", label: "Notas" },
  { id: "props", label: "Propriedades" },
  { id: "faq", label: "Perguntas frequentes" },
]

function DocSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
        <a
          href={`#${id}`}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Âncora para ${title}`}
        >
          <Hash className="size-4" />
        </a>
        {title}
      </h2>
      {children}
    </section>
  )
}

function DocContent({ page }: { page: DocPage }) {
  const [tab, setTab] = useState(page.examples[0]?.value ?? "")

  // Reseta a aba ao trocar de página.
  useEffect(() => {
    setTab(page.examples[0]?.value ?? "")
  }, [page])

  const activeExample = useMemo(
    () => page.examples.find((ex) => ex.value === tab) ?? page.examples[0],
    [page.examples, tab],
  )

  return (
    <article className="min-w-0 flex-1 space-y-10">
      <header className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{page.group}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{page.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
          <Badge variant="secondary">{page.badge}</Badge>
        </div>
        <p className="max-w-2xl text-base text-muted-foreground">
          {page.description}
        </p>
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <FileCode2 className="size-3.5" />
          {page.importLine}
        </div>
      </header>

      <Separator />

      <DocSection id="exemplos" title="Exemplos">
        <Tabs value={tab} onValueChange={setTab} className="gap-4">
          <TabsList>
            {page.examples.map((ex) => (
              <TabsTrigger key={ex.value} value={ex.value}>
                {ex.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {page.examples.map((ex) => (
            <TabsContent key={ex.value} value={ex.value} className="space-y-3">
              <p className="text-sm text-muted-foreground">{ex.description}</p>
              <CodeBlock
                language={ex.language}
                filename={ex.filename}
                code={ex.code}
              />
            </TabsContent>
          ))}
        </Tabs>
        {activeExample ? (
          <p className="text-xs text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {activeExample.label}
            </span>{" "}
            · {page.examples.length} exemplo(s) disponível(is).
          </p>
        ) : null}
      </DocSection>

      <DocSection id="instalacao" title="Instalação">
        <p className="text-sm text-muted-foreground">
          Adicione o componente ao seu projeto com um comando:
        </p>
        <CodeBlockCommand code={page.install} language="bash" />
      </DocSection>

      <DocSection id="notas" title="Notas">
        <div className="space-y-3">
          {page.callouts.map((callout) => {
            const CalloutIcon = callout.icon
            return (
              <Alert key={callout.title} variant={callout.variant}>
                <CalloutIcon />
                <AlertTitle>{callout.title}</AlertTitle>
                <AlertDescription>{callout.description}</AlertDescription>
              </Alert>
            )
          })}
        </div>
      </DocSection>

      <DocSection id="props" title="Propriedades">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[22%]">Prop</TableHead>
                <TableHead className="w-[34%]">Tipo</TableHead>
                <TableHead className="w-[16%]">Padrão</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.props.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {row.name}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs text-sky-600 dark:text-sky-400">
                      {row.type}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs text-muted-foreground">
                      {row.default}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DocSection>

      <DocSection id="faq" title="Perguntas frequentes">
        <Accordion type="single" collapsible className="w-full">
          {page.faq.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DocSection>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/*                              "nesta página"                                 */
/* -------------------------------------------------------------------------- */

function OnThisPage({ pageId }: { pageId: string }) {
  const [active, setActive] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    setActive(SECTIONS[0].id)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: "-72px 0px -65% 0px", threshold: [0, 1] },
    )
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [pageId])

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-20 space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <PanelsTopLeft className="size-3.5" />
          Nesta página
        </p>
        <nav aria-label="Nesta página">
          <ul className="space-y-1 border-l border-border">
            {SECTIONS.map((section) => {
              const isActive = section.id === active
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "-ml-px block border-l-2 py-1 pl-3 text-sm transition-colors",
                      isActive
                        ? "border-primary font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  página                                     */
/* -------------------------------------------------------------------------- */

export function DocsPortal() {
  const groups = useMemo(() => buildGroups(), [])
  const [activeId, setActiveId] = useState<string>(DOCS[0].id)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [view, setView] = useState<"doc" | "map">("doc")

  const activePage = useMemo(
    () => DOCS.find((page) => page.id === activeId) ?? DOCS[0],
    [activeId],
  )

  // Abre o command palette com Cmd/Ctrl+K.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const goTo = useCallback((id: string) => {
    setActiveId(id)
    setMobileNavOpen(false)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  const selectFromPalette = useCallback(
    (id: string) => {
      goTo(id)
      setPaletteOpen(false)
    },
    [goTo],
  )

  // Clicar num nó de página no mapa navega e volta para a vista de documento.
  const navigateFromMap = useCallback(
    (id: string) => {
      goTo(id)
      setView("doc")
    },
    [goTo],
  )

  return (
    <div
      data-slot="docs-portal"
      className="flex min-h-[640px] w-full flex-col bg-background text-foreground"
    >
      {/* Topbar */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir navegação"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <Book className="size-4" />
                Acme UI Docs
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto p-4">
              <SidebarNav
                groups={groups}
                activeId={activeId}
                onSelect={goTo}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Book className="size-4" />
          </span>
          <span className="hidden sm:inline">Acme UI</span>
          <Badge variant="outline" className="hidden font-mono text-[10px] sm:inline-flex">
            v2.4
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Alternar vista"
            className="hidden items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5 sm:flex"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "doc"}
              onClick={() => setView("doc")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
                view === "doc"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <FileText className="size-3.5" />
              Doc
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "map"}
              onClick={() => setView("map")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
                view === "map"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Network className="size-3.5" />
              Mapa
            </button>
          </div>
          <Button
            variant={view === "map" ? "secondary" : "ghost"}
            size="icon"
            className="sm:hidden"
            aria-label={view === "map" ? "Ver documentação" : "Ver mapa da documentação"}
            aria-pressed={view === "map"}
            onClick={() => setView((v) => (v === "map" ? "doc" : "map"))}
          >
            {view === "map" ? <FileText /> : <Network />}
          </Button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="group flex h-9 w-44 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:w-60"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Buscar docs…</span>
            <kbd className="pointer-events-none hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              ⌘K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" aria-label="Configurações">
            <Settings2 />
          </Button>
        </div>
      </header>

      {/* Corpo */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 lg:px-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20">
            <SidebarNav groups={groups} activeId={activeId} onSelect={goTo} />
          </div>
        </aside>

        {view === "doc" ? (
          <>
            {/* Conteúdo central */}
            <DocContent page={activePage} />

            {/* Nesta página */}
            <OnThisPage pageId={activePage.id} />
          </>
        ) : (
          /* Mapa da documentação */
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Mapa da documentação
                </h1>
                <Badge variant="secondary" className="gap-1">
                  <Network className="size-3" />
                  Visão geral
                </Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Navegue pela estrutura completa do design system. Clique em
                qualquer página para abri-la — é a terceira forma de navegar,
                junto da barra lateral e do{" "}
                <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                  ⌘K
                </kbd>
                .
              </p>
            </div>
            <DocsMap
              groups={groups}
              activeId={activeId}
              onNavigate={navigateFromMap}
            />
          </div>
        )}
      </div>

      {/* Command palette */}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Buscar páginas da documentação…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {groups.map((group, index) => (
            <div key={group.group}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.group}>
                {group.pages.map((page) => (
                  <CommandItem
                    key={page.id}
                    value={`${page.group} ${page.title} ${page.description}`}
                    onSelect={() => selectFromPalette(page.id)}
                  >
                    <FileCode2 />
                    <span>{page.title}</span>
                    <CommandShortcut>{page.badge}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
