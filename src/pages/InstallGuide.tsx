import { Link } from "react-router-dom"
import {
  Terminal,
  Package,
  Boxes,
  Puzzle,
  ArrowRight,
  Lightbulb,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CodeBlock } from "@/components/showcase/CodeBlock"
import { cn } from "@/lib/utils"

/** Base pública do registry shadcn servido por esta vitrine. */
const REGISTRY_BASE_URL = "https://componentes-fe-cmq0d9kr.cloud.serendiped.com"

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

      {/* CTA */}
      <section className="mt-12 rounded-xl border border-border bg-muted/30 p-6 text-center sm:p-8">
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
