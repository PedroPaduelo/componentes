export function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Hello vitrine
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Vitrine de Componentes React
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          O shell está no ar: header, navegação, alternância de tema e footer
          funcionando. O catálogo de componentes chega na próxima etapa.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Tailwind v4 ativo
          </span>
          <span className="rounded-md border border-border px-4 py-2 text-sm font-medium">
            Tema persistente
          </span>
        </div>
      </div>
    </section>
  )
}
