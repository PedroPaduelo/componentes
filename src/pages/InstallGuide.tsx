import { Link } from "react-router-dom"
import {
  Terminal,
  Package,
  Boxes,
  Puzzle,
  ArrowRight,
  Lightbulb,
  Bot,
  Sparkles,
  FileText,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CodeBlock } from "@/components/showcase/CodeBlock"
import { CopyFetchButton } from "@/components/showcase/CopyFetchButton"
import { aiSkills } from "@/data/ai-skills"
import { LLMS_TXT_PATH } from "@/data/ai-index"
import { cn } from "@/lib/utils"

/** Base pública do registry shadcn servido por esta vitrine. */
const REGISTRY_BASE_URL = "https://ui-list-ui-componets-cmqcdlm7.cloud.serendiped.com"

/** Comando de exemplo (button) — o usuário troca o slug pelo componente desejado. */
const ADD_COMMAND = `npx shadcn@latest add ${REGISTRY_BASE_URL}/r/button.json`

/** Comando de inicialização do shadcn no projeto do consumidor. */
const INIT_COMMAND = "npx shadcn@latest init"

/** Exemplo de consumo após instalar. */
const IMPORT_EXAMPLE = `import { Button } from "@/components/ui/button"

export function Exemplo() {
  return <Button>Clique aqui</Button>
}`

type StepProps = {
  index: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}

function Step({ index, icon: Icon, title, children }: StepProps) {
  return (
    <li className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
          {index}
        </span>
        <span
          aria-hidden="true"
          className="mt-2 w-px flex-1 bg-border last:hidden"
        />
      </div>
      <div className="min-w-0 flex-1 pb-10">
        <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </li>
  )
}

type CalloutProps = {
  title: string
  children: React.ReactNode
  className?: string
}

function Callout({ title, children, className }: CalloutProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-border bg-muted/40 p-4",
        className,
      )}
    >
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">{title}</p>
        <div className="text-muted-foreground [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

export function InstallGuide() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Título + intro */}
      <header className="space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          Registry shadcn
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Instalação
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Todo componente desta vitrine é{" "}
          <strong className="font-medium text-foreground">instalável</strong> via
          CLI do shadcn — não precisa copiar e colar arquivo por arquivo. Um único
          comando baixa o componente, instala as dependências npm e injeta o CSS
          necessário no seu projeto. Se preferir, você ainda pode{" "}
          <strong className="font-medium text-foreground">copiar o código</strong>{" "}
          direto na página de cada componente.
        </p>
      </header>

      {/* Passos */}
      <section className="mt-12">
        <ol className="space-y-0">
          <Step index={1} icon={Package} title="Pré-requisitos">
            <p>
              Você precisa de um projeto com{" "}
              <strong className="font-medium text-foreground">
                Tailwind CSS v4
              </strong>{" "}
              e o{" "}
              <strong className="font-medium text-foreground">shadcn</strong>{" "}
              inicializado. Se ainda não inicializou, rode:
            </p>
            <CodeBlock code={INIT_COMMAND} language="bash" />
            <p>
              O <code className="font-mono text-foreground">init</code> cria o
              arquivo <code className="font-mono text-foreground">components.json</code>,
              instala <code className="font-mono text-foreground">clsx</code> e{" "}
              <code className="font-mono text-foreground">tailwind-merge</code>, e
              gera o helper{" "}
              <code className="font-mono text-foreground">@/lib/utils</code> (a
              função <code className="font-mono text-foreground">cn</code>). Sem
              esse passo, os componentes instalados não encontram o{" "}
              <code className="font-mono text-foreground">cn</code> e quebram.
            </p>
          </Step>

          <Step index={2} icon={Terminal} title="Instalar um componente">
            <p>
              Use o comando <code className="font-mono text-foreground">add</code>{" "}
              apontando para a URL do componente no registry desta vitrine. Por
              exemplo, para o <strong className="font-medium text-foreground">Button</strong>:
            </p>
            <CodeBlock code={ADD_COMMAND} language="bash" />
            <p>
              Troque <code className="font-mono text-foreground">button</code> pelo{" "}
              <strong className="font-medium text-foreground">slug</strong> do
              componente que você quer. O CLI cuida de tudo automaticamente:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>baixa os arquivos do componente para o seu projeto;</li>
              <li>instala as dependências npm necessárias;</li>
              <li>injeta o CSS/tokens exigidos (ex.: animações).</li>
            </ul>
          </Step>

          <Step index={3} icon={Boxes} title="Onde achar o slug">
            <p>
              O slug é o final da URL na página de cada componente. Por exemplo,
              em <code className="font-mono text-foreground">/components/button</code>{" "}
              o slug é <code className="font-mono text-foreground">button</code>; em{" "}
              <code className="font-mono text-foreground">/components/card-hover-effect</code>{" "}
              o slug é{" "}
              <code className="font-mono text-foreground">card-hover-effect</code>.
              Cada página de componente também mostra o comando de instalação
              pronto para copiar.
            </p>
          </Step>

          <Step index={4} icon={Puzzle} title="Consumir o componente">
            <p>
              Depois de instalado, importe e use como qualquer componente do seu
              projeto:
            </p>
            <CodeBlock code={IMPORT_EXAMPLE} language="tsx" />
          </Step>
        </ol>
      </section>

      {/* Padrão de API única */}
      <section className="mt-2">
        <Callout title="Uma API, todos os componentes">
          <p>
            Todos os componentes da vitrine seguem o{" "}
            <strong className="font-medium text-foreground">
              mesmo schema de registry shadcn
            </strong>
            : a forma de instalar e de consumir é idêntica para qualquer um deles.
            Você sempre importa de{" "}
            <code className="font-mono text-foreground">@/components/ui/&lt;arquivo&gt;</code>
            , compõe classes com{" "}
            <code className="font-mono text-foreground">cn()</code> e usa as{" "}
            <em>variants</em> via props. Aprendeu a instalar um, sabe instalar
            todos.
          </p>
        </Callout>
      </section>

      {/* Troubleshooting */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          Resolução de problemas
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Os tropeços mais comuns ao instalar componentes do registry.
        </p>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="cn-not-defined">
            <AccordionTrigger>
              <span className="font-mono text-xs sm:text-sm">
                command not found
              </span>{" "}
              ou{" "}
              <span className="font-mono text-xs sm:text-sm">
                cn is not defined
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Você provavelmente não rodou o{" "}
                  <code className="font-mono text-foreground">
                    npx shadcn@latest init
                  </code>{" "}
                  ainda. O <code className="font-mono text-foreground">init</code>{" "}
                  é o que cria o <code className="font-mono text-foreground">components.json</code>{" "}
                  e o helper <code className="font-mono text-foreground">@/lib/utils</code>{" "}
                  (de onde vem a função{" "}
                  <code className="font-mono text-foreground">cn</code>). Rode o
                  init antes de instalar qualquer componente.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tailwind-v4">
            <AccordionTrigger>
              Estilos não aplicam / sem{" "}
              <span className="font-mono text-xs sm:text-sm">
                tailwind.config
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Esta vitrine usa{" "}
                  <strong className="font-medium text-foreground">
                    Tailwind v4
                  </strong>
                  , que <strong className="font-medium text-foreground">não
                  usa</strong>{" "}
                  <code className="font-mono text-foreground">
                    tailwind.config.js
                  </code>
                  . A configuração de tema vem por{" "}
                  <code className="font-mono text-foreground">@theme</code> e CSS
                  variables no seu arquivo CSS principal. Garanta que o seu projeto
                  está no Tailwind v4 e que os tokens (cores, etc.) estão definidos
                  via CSS variables — o <code className="font-mono text-foreground">init</code>{" "}
                  do shadcn configura isso.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tw-animate-css">
            <AccordionTrigger>
              Animações de entrada/saída não funcionam (overlays, accordion)
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Alguns componentes — overlays como{" "}
                  <code className="font-mono text-foreground">dialog</code>,{" "}
                  <code className="font-mono text-foreground">sheet</code>,{" "}
                  <code className="font-mono text-foreground">dropdown-menu</code>,{" "}
                  <code className="font-mono text-foreground">popover</code>,{" "}
                  <code className="font-mono text-foreground">select</code>,{" "}
                  <code className="font-mono text-foreground">tooltip</code> e o{" "}
                  <code className="font-mono text-foreground">accordion</code> —
                  usam classes de animação (
                  <code className="font-mono text-foreground">animate-in</code>,{" "}
                  <code className="font-mono text-foreground">animate-out</code>,
                  fade/zoom/slide) que vêm do plugin{" "}
                  <strong className="font-medium text-foreground">
                    tw-animate-css
                  </strong>
                  . Se as transições de abrir/fechar não acontecerem, instale o
                  plugin e importe-o no seu CSS principal:
                </p>
                <CodeBlock
                  code={`npm install -D tw-animate-css`}
                  language="bash"
                />
                <CodeBlock
                  code={`@import "tailwindcss";\n@import "tw-animate-css";`}
                  language="css"
                />
                <p>
                  Isso não quebra o build — sem o plugin os componentes ainda
                  funcionam, apenas sem a animação de entrada/saída.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dep-conflict">
            <AccordionTrigger>Conflito de versões de dependência</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  O CLI adiciona automaticamente as dependências do componente ao
                  seu <code className="font-mono text-foreground">package.json</code>
                  . Se o instalador reclamar de versões ou se algo não resolver,
                  rode <code className="font-mono text-foreground">npm install</code>{" "}
                  para reconciliar a árvore de dependências. Em casos de peer
                  dependencies conflitantes, ajuste a versão no{" "}
                  <code className="font-mono text-foreground">package.json</code> e
                  reinstale.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Skills para IA */}
      <section id="skills" className="mt-16 scroll-mt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Bot className="h-3.5 w-3.5" />
          Para IAs
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          Skills para IA
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Quer que uma IA (Claude, Cursor, etc.) instale e use os componentes e
          composições sozinha? Forneça a ela uma destas{" "}
          <strong className="font-medium text-foreground">skills</strong> — são
          arquivos markdown prontos (com frontmatter) que ensinam o passo a
          passo: descobrir o slug, instalar pelo registry e consumir. Cole o
          conteúdo como uma Skill/Regra do seu agente, ou aponte-o para a URL.
        </p>

        {/* llms.txt — índice machine-readable */}
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-4">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Índice completo legível por máquina —{" "}
            <code className="font-mono text-foreground">llms.txt</code> com todos
            os componentes e composições + comandos de instalação. Veja também o{" "}
            <Link
              to="/ai"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Índice para IA
            </Link>
            .
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <CopyFetchButton url={LLMS_TXT_PATH} label="Copiar llms.txt" />
            <Button asChild variant="outline" size="sm">
              <a href={LLMS_TXT_PATH} target="_blank" rel="noreferrer">
                Abrir
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            </Button>
          </div>
        </div>

        {/* Cards de skill */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {aiSkills.map((skill) => (
            <div
              key={skill.slug}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight">{skill.title}</h3>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {skill.slug}.md
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {skill.description}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">
                  Quando usar:
                </strong>{" "}
                {skill.whenToUse}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                <CopyFetchButton
                  url={skill.path}
                  label="Copiar skill"
                  copiedLabel="Skill copiada!"
                />
                <Button asChild variant="outline" size="sm">
                  <a href={skill.path} download={`${skill.slug}.md`}>
                    Baixar .md
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={skill.path} target="_blank" rel="noreferrer">
                    Abrir
                    <ExternalLink className="size-3.5 opacity-60" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-xl border border-border bg-muted/30 p-6 text-center sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Pronto para começar?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Explore o catálogo, escolha um componente e copie o comando de
          instalação direto da página dele.
        </p>
        <Button asChild className="mt-5">
          <Link to="/components">
            Ver catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
