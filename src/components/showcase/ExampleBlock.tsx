import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CodeBlock } from "@/components/showcase/CodeBlock"
import { cn } from "@/lib/utils"

type ExampleBlockProps = {
  /** Título do exemplo (ex.: "Variantes", "Com ícone"). */
  title: string
  /** Descrição opcional mostrada acima do preview. */
  description?: string
  /** Snippet JSX correspondente ao preview. */
  code: string
  /** Preview ao vivo: o componente real renderizado. */
  render: React.ReactNode
  className?: string
}

/**
 * Bloco padrão de exemplo na página de detalhe: tabs "Preview" / "Código"
 * com o componente real renderizado e o snippet correspondente copiável.
 *
 * O padrão de Tabs é aplicado uniformemente em todos os componentes
 * da vitrine — escolha feita no planejamento da Task 3.
 */
export function ExampleBlock({
  title,
  description,
  code,
  render,
  className,
}: ExampleBlockProps) {
  return (
    <section
      aria-labelledby={`example-${slugify(title)}`}
      className={cn("space-y-3", className)}
    >
      <header className="space-y-1">
        <h3
          id={`example-${slugify(title)}`}
          className="text-base font-semibold tracking-tight"
        >
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Código</TabsTrigger>
        </TabsList>

        <TabsContent
          value="preview"
          className="mt-3 rounded-lg border border-dashed border-border bg-background p-6"
        >
          <div className="flex flex-wrap items-center gap-3">{render}</div>
        </TabsContent>

        <TabsContent value="code" className="mt-3">
          <CodeBlock code={code} />
        </TabsContent>
      </Tabs>
    </section>
  )
}

/** Slug simples só pra id semântica. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
