import { Loader } from "@/components/ui/loader"
import type { Example } from "@/data/examples"

const loaderAllVariants: Example = {
  title: "Cinco variantes lado a lado",
  description:
    "Showcase das cinco variantes do Loader: pontos saltitantes (one), pontos deslizando (two), raio SVG animado (three), texto com glitch verde+violeta (four) e caracteres pulsantes (five).",
  code: `<div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
    <span className="text-xs uppercase tracking-wider text-muted-foreground">one</span>
    <Loader variant="one" />
  </div>
  <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
    <span className="text-xs uppercase tracking-wider text-muted-foreground">two</span>
    <Loader variant="two" />
  </div>
  <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
    <span className="text-xs uppercase tracking-wider text-muted-foreground">three</span>
    <Loader variant="three" />
  </div>
  <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
    <span className="text-xs uppercase tracking-wider text-muted-foreground">four</span>
    <Loader variant="four" text="Carregando" />
  </div>
  <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6 md:col-span-2 lg:col-span-1">
    <span className="text-xs uppercase tracking-wider text-muted-foreground">five</span>
    <Loader variant="five" text="Aguarde..." />
  </div>
</div>`,
  render: (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          one
        </span>
        <Loader variant="one" />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          two
        </span>
        <Loader variant="two" />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          three
        </span>
        <Loader variant="three" />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          four
        </span>
        <Loader variant="four" text="Carregando" />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6 md:col-span-2 lg:col-span-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          five
        </span>
        <Loader variant="five" text="Aguarde..." />
      </div>
    </div>
  ),
}

const loaderTextGlitch: Example = {
  title: "Loader Four — texto customizado",
  description:
    "Variante 'four' com texto longo: o efeito de glitch RGB (verde #00e571 + violeta #8b00ff) atrás do texto principal funciona melhor com palavras curtas; ajuste a `text` para sua copy.",
  code: `<div className="flex w-full items-center justify-center rounded-lg border border-border bg-neutral-950 p-12">
  <Loader variant="four" text="Aguarde um instante" className="text-2xl text-white" />
</div>`,
  render: (
    <div className="flex w-full items-center justify-center rounded-lg border border-border bg-neutral-950 p-12">
      <Loader
        variant="four"
        text="Aguarde um instante"
        className="text-2xl text-white"
      />
    </div>
  ),
}

export const examplesLoader: Record<string, Example[]> = {
  loader: [loaderAllVariants, loaderTextGlitch],
}
