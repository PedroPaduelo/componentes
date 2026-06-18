import { Loader2 } from "lucide-react"

/**
 * Fallback leve exibido enquanto um chunk de rota (lazy) é carregado.
 *
 * Usado pelos `<Suspense>` que envolvem o `<Outlet/>` dos layouts, de modo que
 * o shell (header/footer/sidebar) permaneça visível durante o carregamento
 * sob demanda das páginas pesadas. Mantém um spinner simples, sem dependências
 * extras além do ícone já presente no projeto (lucide-react).
 */
export function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Carregando…"
      className="flex min-h-[40vh] w-full items-center justify-center"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
