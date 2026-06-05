/**
 * Examples — exemplos data-driven por slug de componente.
 *
 * A página de detalhe consome este mapa e renderiza
 * um ExampleBlock por entrada. Slugs sem entrada aqui recebem o fallback
 * "Exemplos em breve".
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
import { WorkExperienceComponent } from "@/components/ui/work-experience-component"

// Exemplos do lote chanhdai — divididos em arquivos por grupo para evitar
// edições concorrentes no mesmo arquivo. Cada um exporta um Record parcial.
import { examplesChanhdaiA } from "@/data/examples-chanhdai-a"
import { examplesChanhdaiB } from "@/data/examples-chanhdai-b"
import { examplesChanhdaiC } from "@/data/examples-chanhdai-c"
import { examplesInteractive } from "@/data/examples-interactive"
import { examplesFluid } from "@/data/examples-fluid"
import { examplesCyber } from "@/data/examples-cyber"
import { animatedButtonExamples } from "@/data/examples-animated"
import { examplesFlipText } from "@/data/examples-flip-text"
import { examplesFlipFadeText } from "@/data/examples-flip-fade-text"
import { examplesLightLines } from "@/data/examples-light-lines"
import { perspectiveGridExamples } from "@/data/examples-perspective-grid"
import { examplesGlassDock } from "@/data/examples-glass-dock"
import { creepyButtonExamples } from "@/data/examples-creepy"
import { examplesAnimatedNumber } from "@/data/examples-animated-number"
import { examplesParallaxHeroImages } from "@/data/examples-parallax-hero-images"
import { examplesImagesBadge } from "@/data/examples-images-badge"
import { examplesDottedGlowBackground } from "@/data/examples-dotted-glow-background"
import { examplesScales } from "@/data/examples-scales"
import { examplesBackgroundBoxes } from "@/data/examples-background-boxes"
import { examplesWavyBackground } from "@/data/examples-wavy-background"
import { examplesBackgroundRippleEffect } from "@/data/examples-background-ripple-effect"
import { examplesBackgroundBeamsWithCollision } from "@/data/examples-background-beams-with-collision"
import { examplesSparkles } from "@/data/examples-sparkles"
import { examplesBackgroundBeams } from "@/data/examples-background-beams"
import { examplesCardHoverEffect } from "@/data/examples-card-hover-effect"
import { examplesSvgMaskEffect } from "@/data/examples-svg-mask-effect"
import { examplesVortex } from "@/data/examples-vortex"
import { examplesBackgroundLines } from "@/data/examples-background-lines"
import { examplesCardStack } from "@/data/examples-card-stack"
import { examples3dCard } from "@/data/examples-3d-card"
import { examplesTooltipCard } from "@/data/examples-tooltip-card"

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

const treeIconsColoredExample: Example = {
  title: "Ícones coloridos",
  description: "Set \"complete\" + colored: ícones específicos por extensão com cor semântica.",
  code: `<Tree
  data={[
    "src/index.ts",
    "src/lib/utils.ts",
    "src/components/ui/button.tsx",
    "src/data/components.ts",
    "README.md",
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "Dockerfile",
    "docker-compose.yml",
  ]}
  initialExpansion="open"
  icons={{ set: "complete", colored: true }}
/>`,
  render: (
    <div className="w-full">
      <Tree
        data={[
          "src/index.ts",
          "src/lib/utils.ts",
          "src/components/ui/button.tsx",
          "src/data/components.ts",
          "README.md",
          "package.json",
          "tsconfig.json",
          "vite.config.ts",
          "Dockerfile",
          "docker-compose.yml",
        ]}
        initialExpansion="open"
        icons={{ set: "complete", colored: true }}
      />
    </div>
  ),
}

const treeGitStatusExample: Example = {
  title: "Git status",
  description: "Bolinhas coloridas indicam arquivos modificados/adicionados/removidos.",
  code: `<Tree
  data={[
    "src/index.ts",
    "src/lib/utils.ts",
    "src/components/ui/button.tsx",
    "src/components/ui/card.tsx",
    "README.md",
    "package.json",
  ]}
  initialExpansion="open"
  gitStatus={[
    { path: "src/index.ts", status: "modified" },
    { path: "src/lib/utils.ts", status: "added" },
    { path: "README.md", status: "modified" },
    { path: "package.json", status: "renamed" },
  ]}
/>`,
  render: (
    <div className="w-full">
      <Tree
        data={[
          "src/index.ts",
          "src/lib/utils.ts",
          "src/components/ui/button.tsx",
          "src/components/ui/card.tsx",
          "README.md",
          "package.json",
        ]}
        initialExpansion="open"
        gitStatus={[
          { path: "src/index.ts", status: "modified" },
          { path: "src/lib/utils.ts", status: "added" },
          { path: "README.md", status: "modified" },
          { path: "package.json", status: "renamed" },
        ]}
      />
    </div>
  ),
}

const treeDragDropRenamingExample: Example = {
  title: "Drag & drop + Renaming",
  description: "Arraste arquivos para reordenar, F2 (ou duplo-clique) para renomear in-place.",
  code: `<Tree
  data={[
    "src/index.ts",
    "src/lib/utils.ts",
    "src/components/ui/button.tsx",
    "src/components/ui/card.tsx",
    "src/components/ui/tree.tsx",
  ]}
  initialExpansion="open"
  dragAndDrop
  renaming
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
        ]}
        initialExpansion="open"
        dragAndDrop
        renaming
      />
    </div>
  ),
}

const treeCustomHeaderExample: Example = {
  title: "Header customizado",
  description: "Slot React acima da árvore com ações (botão \"novo arquivo\").",
  code: `<Tree
  data={[
    "src/index.ts",
    "src/lib/utils.ts",
    "src/components/ui/button.tsx",
  ]}
  initialExpansion="open"
  header={
    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2 text-sm">
      <span className="font-medium text-foreground">Projeto</span>
      <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
        main
      </span>
    </div>
  }
/>`,
  render: (
    <div className="w-full">
      <Tree
        data={[
          "src/index.ts",
          "src/lib/utils.ts",
          "src/components/ui/button.tsx",
        ]}
        initialExpansion="open"
        header={
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="font-medium text-foreground">Projeto</span>
            <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
              main
            </span>
          </div>
        }
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                          work-experience-component                          */
/* -------------------------------------------------------------------------- */

const workExperienceTimelineExample: Example = {
  title: "Timeline",
  description:
    "Linha do tempo vertical com logos reais, descrições em lista de bullets e stats cards.",
  code: `<WorkExperienceComponent
  variant="timeline"
  experiences={[
    {
      company: "Vercel",
      role: "Senior Frontend Engineer",
      period: "2022 — Presente",
      logo: "https://logo.clearbit.com/vercel.com",
      description: [
        "Liderança técnica do redesign do dashboard, migrando de Next.js Pages Router para App Router.",
        "Reduziu LCP em 38% e INP em 42% nas páginas de marketing via edge runtime.",
        "Implementação de design system com Tailwind, Radix Primitives e Storybook.",
      ],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
      stats: [
        { label: "Deploys/Day", value: "312" },
        { label: "Edge Regions", value: "18" },
        { label: "PRs/Month", value: "47" },
        { label: "GH Stars", value: "12.4K" },
      ],
      href: "https://vercel.com",
    },
    {
      company: "Linear",
      role: "Frontend Engineer",
      period: "2019 — 2022",
      logo: "https://logo.clearbit.com/linear.app",
      description: [
        "Reescrita do cliente web com foco em keyboard-first navigation e atalhos.",
        "Implementação de sync engine local-first com CRDTs (Yjs).",
        "Reduziu bundle size em 60% com code splitting por rota.",
      ],
      technologies: ["React", "TypeScript", "Yjs", "Vite"],
      stats: [
        { label: "Active Users", value: "8.4K" },
        { label: "Sync Latency", value: "23ms" },
        { label: "NPS", value: "74" },
        { label: "Bundle", value: "412KB" },
      ],
      href: "https://linear.app",
    },
    {
      company: "Figma",
      role: "Web Developer",
      period: "2017 — 2019",
      logo: "https://logo.clearbit.com/figma.com",
      description: [
        "Desenvolvimento do site institucional e landing pages de marketing.",
        "Integração com CMS headless e otimização de imagens via AVIF/WebP.",
        "Acessibilidade WCAG AA em todas as páginas públicas.",
      ],
      technologies: ["React", "Gatsby", "Sanity", "Figma"],
      stats: [
        { label: "LCP", value: "0.9s" },
        { label: "A11y", value: "AA" },
        { label: "Languages", value: "12" },
        { label: "i18n Keys", value: "1.8K" },
      ],
    },
  ]}
/>`,
  render: (
    <div className="w-full max-w-xl">
      <WorkExperienceComponent
        variant="timeline"
        experiences={[
          {
            company: "Vercel",
            role: "Senior Frontend Engineer",
            period: "2022 — Presente",
            logo: "https://logo.clearbit.com/vercel.com",
            description: [
              "Liderança técnica do redesign do dashboard, migrando de Next.js Pages Router para App Router.",
              "Reduziu LCP em 38% e INP em 42% nas páginas de marketing via edge runtime.",
              "Implementação de design system com Tailwind, Radix Primitives e Storybook.",
            ],
            technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
            stats: [
              { label: "Deploys/Day", value: "312" },
              { label: "Edge Regions", value: "18" },
              { label: "PRs/Month", value: "47" },
              { label: "GH Stars", value: "12.4K" },
            ],
            href: "https://vercel.com",
          },
          {
            company: "Linear",
            role: "Frontend Engineer",
            period: "2019 — 2022",
            logo: "https://logo.clearbit.com/linear.app",
            description: [
              "Reescrita do cliente web com foco em keyboard-first navigation e atalhos.",
              "Implementação de sync engine local-first com CRDTs (Yjs).",
              "Reduziu bundle size em 60% com code splitting por rota.",
            ],
            technologies: ["React", "TypeScript", "Yjs", "Vite"],
            stats: [
              { label: "Active Users", value: "8.4K" },
              { label: "Sync Latency", value: "23ms" },
              { label: "NPS", value: "74" },
              { label: "Bundle", value: "412KB" },
            ],
            href: "https://linear.app",
          },
          {
            company: "Figma",
            role: "Web Developer",
            period: "2017 — 2019",
            logo: "https://logo.clearbit.com/figma.com",
            description: [
              "Desenvolvimento do site institucional e landing pages de marketing.",
              "Integração com CMS headless e otimização de imagens via AVIF/WebP.",
              "Acessibilidade WCAG AA em todas as páginas públicas.",
            ],
            technologies: ["React", "Gatsby", "Sanity", "Figma"],
            stats: [
              { label: "LCP", value: "0.9s" },
              { label: "A11y", value: "AA" },
              { label: "Languages", value: "12" },
              { label: "i18n Keys", value: "1.8K" },
            ],
          },
        ]}
      />
    </div>
  ),
}

const workExperienceCardExample: Example = {
  title: "Cards",
  description:
    "Lista vertical de cards sem linha do tempo, com logos, descrições em bullets e stats.",
  code: `<WorkExperienceComponent
  variant="card"
  experiences={[
    {
      company: "Stripe",
      role: "Full Stack Developer",
      period: "2021 — Presente",
      logo: "https://logo.clearbit.com/stripe.com",
      description: [
        "Construção de APIs públicas com versionamento semântico e changelog automatizado.",
        "Integração com 12+ bancos e processadores via adapters tipados.",
        "Reduziu tempo de integração de novos parceiros em 65%.",
      ],
      technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis"],
      stats: [
        { label: "Hours/Day", value: "8.4" },
        { label: "Visitors/Day", value: "1.2K" },
        { label: "Subscribers", value: "3.5K" },
        { label: "GitHub Stars", value: "2.1K" },
      ],
    },
    {
      company: "GitHub",
      role: "Senior Engineer",
      period: "2018 — 2021",
      logo: "https://logo.clearbit.com/github.com",
      description: [
        "Liderança técnica do módulo de Actions, com fila distribuída de runners.",
        "Reescrita do scheduler de jobs em Rust (3x throughput).",
        "Adoção de feature flags para rollout gradual em 100% da frota.",
      ],
      technologies: ["React", "TypeScript", "Rust", "Kubernetes"],
      stats: [
        { label: "Runners", value: "32K" },
        { label: "Queue Depth", value: "0.4s" },
        { label: "MTTR", value: "12m" },
        { label: "Incidents", value: "0" },
      ],
    },
    {
      company: "Notion",
      role: "Frontend Engineer",
      period: "2015 — 2018",
      logo: "https://logo.clearbit.com/notion.so",
      description: [
        "Implementação do editor de blocos com virtualização de árvore de documentos.",
        "Sistema de undo/redo cooperativo com Yjs.",
        "Acessibilidade total via teclado e leitor de tela.",
      ],
      technologies: ["React", "TypeScript", "Yjs", "Electron"],
      stats: [
        { label: "Block Types", value: "47" },
        { label: "Undo Depth", value: "100" },
        { label: "A11y", value: "AAA" },
        { label: "Bundle", value: "1.2MB" },
      ],
    },
  ]}
/>`,
  render: (
    <div className="w-full max-w-xl">
      <WorkExperienceComponent
        variant="card"
        experiences={[
          {
            company: "Stripe",
            role: "Full Stack Developer",
            period: "2021 — Presente",
            logo: "https://logo.clearbit.com/stripe.com",
            description: [
              "Construção de APIs públicas com versionamento semântico e changelog automatizado.",
              "Integração com 12+ bancos e processadores via adapters tipados.",
              "Reduziu tempo de integração de novos parceiros em 65%.",
            ],
            technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis"],
            stats: [
              { label: "Hours/Day", value: "8.4" },
              { label: "Visitors/Day", value: "1.2K" },
              { label: "Subscribers", value: "3.5K" },
              { label: "GitHub Stars", value: "2.1K" },
            ],
          },
          {
            company: "GitHub",
            role: "Senior Engineer",
            period: "2018 — 2021",
            logo: "https://logo.clearbit.com/github.com",
            description: [
              "Liderança técnica do módulo de Actions, com fila distribuída de runners.",
              "Reescrita do scheduler de jobs em Rust (3x throughput).",
              "Adoção de feature flags para rollout gradual em 100% da frota.",
            ],
            technologies: ["React", "TypeScript", "Rust", "Kubernetes"],
            stats: [
              { label: "Runners", value: "32K" },
              { label: "Queue Depth", value: "0.4s" },
              { label: "MTTR", value: "12m" },
              { label: "Incidents", value: "0" },
            ],
          },
          {
            company: "Notion",
            role: "Frontend Engineer",
            period: "2015 — 2018",
            logo: "https://logo.clearbit.com/notion.so",
            description: [
              "Implementação do editor de blocos com virtualização de árvore de documentos.",
              "Sistema de undo/redo cooperativo com Yjs.",
              "Acessibilidade total via teclado e leitor de tela.",
            ],
            technologies: ["React", "TypeScript", "Yjs", "Electron"],
            stats: [
              { label: "Block Types", value: "47" },
              { label: "Undo Depth", value: "100" },
              { label: "A11y", value: "AAA" },
              { label: "Bundle", value: "1.2MB" },
            ],
          },
        ]}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  mapa                                       */
/* -------------------------------------------------------------------------- */

export const examples: Record<string, Example[]> = {
  button: [buttonVariantsExample, buttonSizesExample, buttonDisabledExample],
  "dropdown-menu": [dropdownBasicExample, dropdownIconExample],
  card: [cardBasicExample, cardInteractiveExample],
  dialog: [dialogBasicExample, dialogFormExample],
  sheet: [sheetBasicExample, sheetSideExample],
  tabs: [tabsBasicExample],
  input: [inputBasicExample, inputWithLabelExample],
  checkbox: [checkboxBasicExample],
  badge: [badgeVariantsExample, badgeUseCaseExample],
  tree: [
    treeBasicExample,
    treeSearchExample,
    treeDensityExample,
    treeIconsColoredExample,
    treeGitStatusExample,
    treeDragDropRenamingExample,
    treeCustomHeaderExample,
  ],
  "work-experience-component": [workExperienceTimelineExample, workExperienceCardExample],
  // Lote chanhdai (arquivos separados, merge por spread)
  ...examplesChanhdaiA,
  ...examplesChanhdaiB,
  ...examplesChanhdaiC,
  ...examplesInteractive,
  // Lote Fluid (ONDA 2 lote A)
  ...examplesFluid,
  // Lote VengenceUI
  ...examplesCyber,
  ...animatedButtonExamples,
  ...examplesFlipText,
  ...examplesFlipFadeText,
  ...examplesGlassDock,
  ...creepyButtonExamples,
  ...perspectiveGridExamples,
  ...examplesLightLines,
  ...examplesAnimatedNumber,
  // Lote Aceternity
  ...examples3dCard,
  ...examplesCardStack,
  ...examplesBackgroundLines,
  ...examplesSvgMaskEffect,
  ...examplesBackgroundBeamsWithCollision,
  ...examplesImagesBadge,
  ...examplesParallaxHeroImages,
  ...examplesScales,
  ...examplesBackgroundRippleEffect,
  ...examplesSparkles,
  ...examplesDottedGlowBackground,
  ...examplesWavyBackground,
  ...examplesBackgroundBoxes,
  ...examplesBackgroundBeams,
  ...examplesCardHoverEffect,
  ...examplesVortex,
  ...examplesTooltipCard,
}

/** Retorna os exemplos de um slug, ou `undefined` se não houver. */
export function getExamplesBySlug(slug: string): Example[] | undefined {
  return examples[slug]
}
