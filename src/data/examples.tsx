/**
 * Examples — exemplos data-driven por slug de componente.
 *
 * A página de detalhe (ComponentDetail) consome este mapa e renderiza
 * um ExampleBlock por entrada. Slugs sem entrada aqui recebem o fallback
 * "Exemplos em breve" (vide ComponentDetail).
 *
 * Cada Example tem:
 *  - title: rótulo do bloco
 *  - description (opcional): sub-rótulo
 *  - code: string JSX mostrada no CodeBlock E copiada pelo CopyButton.
 *  - render: ReactNode renderizado no preview.
 *
 * IMPORTANTE: `code` é escrito manualmente espelhando o `render` (e vice-versa).
 * Mantemos snippets curtos e legíveis — não é o código de produção do usuário,
 * é o "como usar" suficiente pra entender a API.
 */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Settings, User, LogOut } from "lucide-react"
import { Tree } from "@/components/ui/tree"
import { ScrollFadeEffect } from "@/components/ui/scroll-fade-effect"
import { cn } from "@/lib/utils"

export type Example = {
  title: string
  description?: string
  code: string
  render: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/*                                button                                       */
/* -------------------------------------------------------------------------- */

const buttonVariantsExample: Example = {
  title: "Variantes",
  description: "Estilos pré-definidos para diferentes níveis de ênfase.",
  code: `<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
  render: (
    <>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </>
  ),
}

const buttonSizesExample: Example = {
  title: "Tamanhos",
  description: "Três alturas padrão para diferentes densidades de UI.",
  code: `<Button size="sm">Salvar</Button>
<Button size="default">Salvar</Button>
<Button size="lg">Salvar</Button>`,
  render: (
    <>
      <Button size="sm">Salvar</Button>
      <Button size="default">Salvar</Button>
      <Button size="lg">Salvar</Button>
    </>
  ),
}

const buttonDisabledExample: Example = {
  title: "Desabilitado",
  code: `<Button disabled>Carregando...</Button>`,
  render: <Button disabled>Carregando...</Button>,
}

/* -------------------------------------------------------------------------- */
/*                              dropdown-menu                                  */
/* -------------------------------------------------------------------------- */

const dropdownBasicExample: Example = {
  title: "Básico",
  description: "Menu com itens, label e separador.",
  code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Abrir menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Perfil</DropdownMenuItem>
    <DropdownMenuItem>Configurações</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Sair</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
  render: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Abrir menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}


const dropdownIconExample: Example = {
  title: "Com ícones",
  description: "Itens com ícones Lucide para melhor identificação visual.",
  code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Ações</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      <User className="size-4" /> Perfil
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="size-4" /> Configurações
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">
      <LogOut className="size-4" /> Sair
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
  render: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ações</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <User className="size-4" /> Perfil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" /> Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut className="size-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  card                                       */
/* -------------------------------------------------------------------------- */

const cardBasicExample: Example = {
  title: "Básico",
  description: "Header, conteúdo e footer como blocos composicionais.",
  code: `<Card>
  <CardHeader>
    <CardTitle>Vitrine UI</CardTitle>
    <CardDescription>Componentes React open-source.</CardDescription>
  </CardHeader>
  <CardContent>
    Construído com Vite, Tailwind e shadcn/ui.
  </CardContent>
  <CardFooter>
    <Button>Ver mais</Button>
  </CardFooter>
</Card>`,
  render: (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Vitrine UI</CardTitle>
        <CardDescription>Componentes React open-source.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Construído com Vite, Tailwind e shadcn/ui.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Ver mais</Button>
      </CardFooter>
    </Card>
  ),
}

const cardInteractiveExample: Example = {
  title: "Com imagem",
  description: "Card com área de mídia, conteúdo e link de ação.",
  code: `<Card className="w-full max-w-sm">
  <div className="aspect-video w-full rounded-t-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
    16:9
  </div>
  <CardHeader>
    <CardTitle>Tailwind CSS v4</CardTitle>
    <CardDescription>
      Novo sistema de estilos utilitários.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Versão 4 traz @theme, CSS first config e performance melhorada.
    </p>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button size="sm">Ler mais</Button>
    <Button size="sm" variant="outline">Compartilhar</Button>
  </CardFooter>
</Card>`,
  render: (
    <Card className="w-full max-w-sm">
      <div className="flex aspect-video w-full items-center justify-center rounded-t-lg bg-muted text-sm text-muted-foreground">
        16:9
      </div>
      <CardHeader>
        <CardTitle>Tailwind CSS v4</CardTitle>
        <CardDescription>Novo sistema de estilos utilitários.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Versão 4 traz @theme, CSS first config e performance melhorada.
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button size="sm">Ler mais</Button>
        <Button size="sm" variant="outline">
          Compartilhar
        </Button>
      </CardFooter>
    </Card>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                 dialog                                      */
/* -------------------------------------------------------------------------- */

const dialogBasicExample: Example = {
  title: "Básico",
  description: "Modal centralizado para confirmações e fluxos focados.",
  code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Abrir diálogo</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tem certeza?</DialogTitle>
      <DialogDescription>
        Essa ação não pode ser desfeita.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  render: (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

const dialogFormExample: Example = {
  title: "Com formulário",
  description: "Modal com campos de entrada para criação de registro.",
  code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Novo projeto</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Criar projeto</DialogTitle>
      <DialogDescription>
        Preencha os dados para criar um novo projeto.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome</label>
        <Input placeholder="Meu projeto" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Input placeholder="Descrição opcional" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Criar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  render: (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Novo projeto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar projeto</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo projeto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input placeholder="Meu projeto" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input placeholder="Descrição opcional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  sheet                                      */
/* -------------------------------------------------------------------------- */

const sheetBasicExample: Example = {
  title: "Painel lateral",
  description: "Desliza a partir da borda direita da tela.",
  code: `<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Abrir painel</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Editar perfil</SheetTitle>
      <SheetDescription>
        Faça mudanças e salve quando terminar.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`,
  render: (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir painel</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar perfil</SheetTitle>
          <SheetDescription>
            Faça mudanças e salve quando terminar.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

const sheetSideExample: Example = {
  title: "Lado esquerdo",
  description: "Painel que desliza a partir da borda esquerda.",
  code: `<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Abrir menu</Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Navegação</SheetTitle>
      <SheetDescription>
        Links principais do sistema.
      </SheetDescription>
    </SheetHeader>
    <nav className="mt-6 flex flex-col gap-2">
      <a href="#" className="text-sm">Dashboard</a>
      <a href="#" className="text-sm">Projetos</a>
      <a href="#" className="text-sm">Configurações</a>
    </nav>
  </SheetContent>
</Sheet>`,
  render: (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir menu</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navegação</SheetTitle>
          <SheetDescription>
            Links principais do sistema.
          </SheetDescription>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projetos</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Configurações</a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  tabs                                       */
/* -------------------------------------------------------------------------- */

const tabsBasicExample: Example = {
  title: "Básico",
  description: "Alterne entre seções de conteúdo num mesmo contexto.",
  code: `<Tabs defaultValue="conta">
  <TabsList>
    <TabsTrigger value="conta">Conta</TabsTrigger>
    <TabsTrigger value="senha">Senha</TabsTrigger>
    <TabsTrigger value="equipe">Equipe</TabsTrigger>
  </TabsList>
  <TabsContent value="conta">Configurações da sua conta.</TabsContent>
  <TabsContent value="senha">Atualize sua senha.</TabsContent>
  <TabsContent value="equipe">Gerencie os membros.</TabsContent>
</Tabs>`,
  render: (
    <Tabs defaultValue="conta" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="conta">Conta</TabsTrigger>
        <TabsTrigger value="senha">Senha</TabsTrigger>
        <TabsTrigger value="equipe">Equipe</TabsTrigger>
      </TabsList>
      <TabsContent
        value="conta"
        className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground"
      >
        Configurações da sua conta.
      </TabsContent>
      <TabsContent
        value="senha"
        className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground"
      >
        Atualize sua senha.
      </TabsContent>
      <TabsContent
        value="equipe"
        className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground"
      >
        Gerencie os membros.
      </TabsContent>
    </Tabs>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  input                                      */
/* -------------------------------------------------------------------------- */

const inputBasicExample: Example = {
  title: "Básico",
  description: "Campo de texto com placeholder e tipos nativos.",
  code: `<Input type="email" placeholder="seu@email.com" />
<Input type="password" placeholder="Senha" />
<Input disabled placeholder="Desabilitado" />`,
  render: (
    <>
      <Input type="email" placeholder="seu@email.com" />
      <Input type="password" placeholder="Senha" />
      <Input disabled placeholder="Desabilitado" />
    </>
  ),
}

const inputWithLabelExample: Example = {
  title: "Com rótulo",
  code: `<label className="flex flex-col gap-1.5 text-sm">
  <span className="font-medium">Nome</span>
  <Input placeholder="Como você quer ser chamado?" />
</label>`,
  render: (
    <label className="flex w-full max-w-xs flex-col gap-1.5 text-sm">
      <span className="font-medium">Nome</span>
      <Input placeholder="Como você quer ser chamado?" />
    </label>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                checkbox                                     */
/* -------------------------------------------------------------------------- */

const checkboxBasicExample: Example = {
  title: "Básico",
  description: "Estados marcado, desmarcado e desabilitado.",
  code: `<div className="flex items-center gap-2">
  <Checkbox id="c1" />
  <label htmlFor="c1">Aceito os termos</label>
</div>
<div className="flex items-center gap-2">
  <Checkbox id="c2" defaultChecked />
  <label htmlFor="c2">Receber novidades</label>
</div>
<div className="flex items-center gap-2">
  <Checkbox id="c3" disabled />
  <label htmlFor="c3">Indisponível</label>
</div>`,
  render: (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="c1" />
        <label htmlFor="c1" className="text-sm">
          Aceito os termos
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c2" defaultChecked />
        <label htmlFor="c2" className="text-sm">
          Receber novidades
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c3" disabled />
        <label htmlFor="c3" className="text-sm text-muted-foreground">
          Indisponível
        </label>
      </div>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  badge                                      */
/* -------------------------------------------------------------------------- */

const badgeVariantsExample: Example = {
  title: "Variantes",
  description: "Quatro estilos pré-definidos para destacar status.",
  code: `<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`,
  render: (
    <>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </>
  ),
}

const badgeUseCaseExample: Example = {
  title: "Casos de uso",
  description: "Status, contadores e rótulos contextuais.",
  code: `<Badge variant="secondary">Em revisão</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="outline">v1.0.0</Badge>`,
  render: (
    <>
      <Badge variant="secondary">Em revisão</Badge>
      <Badge variant="destructive">Erro</Badge>
      <Badge variant="outline">v1.0.0</Badge>
    </>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  tree                                       */
/* -------------------------------------------------------------------------- */

const treeBasicExample: Example = {
  title: "Básico",
  description: "Árvore de arquivos com expansão total e ícones automáticos.",
  code: `<Tree
  data={[
    "src/index.ts",
    "src/lib/utils.ts",
    "src/components/ui/button.tsx",
    "src/components/ui/card.tsx",
    "src/components/ui/tree.tsx",
    "src/data/components.ts",
    "src/data/examples.tsx",
    "README.md",
    "package.json",
    "tsconfig.json",
  ]}
  initialExpansion="open"
/>`,
  render: (
    <div className="w-full">
      <Tree
        data={[
          "src/index.ts",
          "src/lib/utils.ts",
          "src/components/ui/button.tsx",
          "src/components/ui/card.tsx",
          "src/components/ui/tree.tsx",
          "src/data/components.ts",
          "src/data/examples.tsx",
          "README.md",
          "package.json",
          "tsconfig.json",
        ]}
        initialExpansion="open"
      />
    </div>
  ),
}

const treeSearchExample: Example = {
  title: "Com busca",
  description: "Árvore com campo de busca embutido para filtrar arquivos.",
  code: `<Tree
  data={[
    "src/index.ts",
    "src/lib/utils.ts",
    "src/components/ui/button.tsx",
    "src/components/ui/card.tsx",
    "src/components/ui/tree.tsx",
    "src/data/components.ts",
    "README.md",
    "package.json",
  ]}
  initialExpansion={2}
  search
/>`,
  render: (
    <div className="w-full">
      <Tree
        data={[
          "src/index.ts",
          "src/lib/utils.ts",
          "src/components/ui/button.tsx",
          "src/components/ui/card.tsx",
          "src/components/ui/tree.tsx",
          "src/data/components.ts",
          "README.md",
          "package.json",
        ]}
        initialExpansion={2}
        search
      />
    </div>
  ),
}

const treeDensityExample: Example = {
  title: "Densidades",
  description: "Compacto, padrão e relaxado — controle de espaçamento.",
  code: `<div className="flex flex-col gap-4">
  <Tree density="compact" data={...} initialExpansion={1} />
  <Tree density="default" data={...} initialExpansion={1} />
  <Tree density="relaxed" data={...} initialExpansion={1} />
</div>`,
  render: (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Compact</span>
        <Tree
          data={["src/index.ts", "src/lib/utils.ts", "src/components/ui/button.tsx", "README.md"]}
          initialExpansion={1}
          density="compact"
        />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Default</span>
        <Tree
          data={["src/index.ts", "src/lib/utils.ts", "src/components/ui/button.tsx", "README.md"]}
          initialExpansion={1}
          density="default"
        />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Relaxed</span>
        <Tree
          data={["src/index.ts", "src/lib/utils.ts", "src/components/ui/button.tsx", "README.md"]}
          initialExpansion={1}
          density="relaxed"
        />
      </div>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            scroll-fade-effect                               */
/* -------------------------------------------------------------------------- */

const scrollFadeVerticalExample: Example = {
  title: "Scroll vertical",
  description: "Lista longa com fade nas bordas superior e inferior.",
  code: `<ScrollFadeEffect className="h-72 w-48" orientation="vertical">
  <div className="p-4 space-y-2">
    {Array.from({ length: 50 }, (_, i) => (
      <div key={i} className="text-sm">Item {i + 1}</div>
    ))}
  </div>
</ScrollFadeEffect>`,
  render: (
    <div className="flex items-center justify-center">
      <ScrollFadeEffect className="h-72 w-48" orientation="vertical">
        <div className="space-y-2 p-4">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="text-sm">
              Item {i + 1}
            </div>
          ))}
        </div>
      </ScrollFadeEffect>
    </div>
  ),
}

const scrollFadeHorizontalExample: Example = {
  title: "Scroll horizontal",
  description: "Galeria de cards com fade nas bordas laterais.",
  code: `<ScrollFadeEffect className="h-40" orientation="horizontal">
  <div className="flex gap-4 p-4">
    {Array.from({ length: 12 }, (_, i) => (
      <div key={i} className="shrink-0 rounded-lg border p-4 w-32">
        Card {i + 1}
      </div>
    ))}
  </div>
</ScrollFadeEffect>`,
  render: (
    <div className="flex items-center justify-center">
      <ScrollFadeEffect className="h-40" orientation="horizontal">
        <div className="flex gap-4 p-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg border text-sm"
            >
              Card {i + 1}
            </div>
          ))}
        </div>
      </ScrollFadeEffect>
    </div>
  ),
}

const scrollFadeChatExample: Example = {
  title: "Chat log",
  description: "Log de mensagens com fade estilo app de chat.",
  code: `<ScrollFadeEffect className="h-64 max-w-sm" fadeHeight={48}>
  <div className="p-4 space-y-3">
    {messages.map((msg, i) => (
      <div key={i} className={cn("rounded-lg p-3 text-sm", msg.isUser ? "bg-primary text-primary-foreground ml-8" : "bg-muted mr-8")}>
        {msg.text}
      </div>
    ))}
  </div>
</ScrollFadeEffect>`,
  render: (
    <div className="flex items-center justify-center">
      <ScrollFadeEffect className="h-64 max-w-sm" fadeHeight={48}>
        <div className="space-y-3 p-4">
          {[
            { text: "Olá! Como vai?", isUser: false },
            { text: "Tudo bem! E você?", isUser: true },
            { text: "Estou ótimo, obrigado por perguntar.", isUser: false },
            { text: "Que bom! Posso ajudar em algo?", isUser: true },
            { text: "Sim, preciso de ajuda com React.", isUser: false },
            { text: "Claro! O que você precisa saber?", isUser: true },
            { text: "Como funciona o useEffect?", isUser: false },
            { text: "É um hook para efeitos colaterais.", isUser: true },
            { text: "Entendi, muito obrigado!", isUser: false },
            { text: "De nada! Qualquer coisa, é só perguntar.", isUser: true },
          ].map((msg, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg p-3 text-sm",
                msg.isUser
                  ? "ml-8 bg-primary text-primary-foreground"
                  : "mr-8 bg-muted"
              )}
            >
              {msg.text}
            </div>
          ))}
        </div>
      </ScrollFadeEffect>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
}

/** Retorna os exemplos de um slug, ou `undefined` se não houver. */
export function getExamplesBySlug(slug: string): Example[] | undefined {
  return examples[slug]
}
