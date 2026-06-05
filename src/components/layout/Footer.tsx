import { Boxes } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="flex items-center gap-1.5">
            <Boxes className="h-4 w-4" />
            <span className="font-medium text-foreground">Vitrine UI</span>
          </p>
          <p>
            Componentes React open-source baseados em{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              shadcn/ui
            </a>
            .
          </p>
        </div>
        <p className="text-xs">
          Construído com Vite, React &amp; Tailwind CSS · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
