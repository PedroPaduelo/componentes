import { LogStream } from "@/components/ui/log-stream"

import type { Example } from "./examples"

const ENTRIES = [
  { id: 1, time: "10:32:01", level: "info", service: "GW", method: "GET", path: "/v1/feed", code: 200, ms: 42, message: "request concluído" },
  { id: 2, time: "10:32:01", level: "debug", service: "Auth", method: "POST", path: "/session/verify", code: 200, ms: 8, message: "token validado" },
  { id: 3, time: "10:32:02", level: "warn", service: "Orders", method: "GET", path: "/orders/{id}", code: 429, ms: 180, message: "pool perto do limite" },
  { id: 4, time: "10:32:02", level: "error", service: "Pay", method: "POST", path: "/charge", code: 503, ms: 920, message: "upstream timeout" },
  { id: 5, time: "10:32:03", level: "info", service: "Search", method: "GET", path: "/search?q=", code: 200, ms: 61, message: "cache hit" },
  { id: 6, time: "10:32:03", level: "debug", service: "Redis", path: "GET sess:*", code: 200, ms: 2, message: "cache lookup" },
]

const filtersExample: Example = {
  title: "Stream com filtros internos",
  description:
    "Lista densa em fonte monoespaçada. Sem `levels` controlado, os chips de filtro mantêm o próprio estado (clique para ligar/desligar níveis).",
  code: `import { LogStream } from "@/components/ui/log-stream"

const ENTRIES = [
  { id: 1, time: "10:32:01", level: "info", service: "GW", method: "GET", path: "/v1/feed", code: 200, ms: 42, message: "request concluído" },
  { id: 3, time: "10:32:02", level: "warn", service: "Orders", method: "GET", path: "/orders/{id}", code: 429, ms: 180, message: "pool perto do limite" },
  { id: 4, time: "10:32:02", level: "error", service: "Pay", method: "POST", path: "/charge", code: 503, ms: 920, message: "upstream timeout" },
  // ...
]

export function Demo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <LogStream entries={ENTRIES} className="h-[240px]" />
    </div>
  )
}`,
  render: (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
      <LogStream entries={ENTRIES} className="h-[240px]" />
    </div>
  ),
}

const noFiltersExample: Example = {
  title: "Sem barra de filtros",
  description:
    "Com `showFilters={false}`, mostra apenas a lista — útil quando o filtro vive em outro lugar da tela.",
  code: `import { LogStream } from "@/components/ui/log-stream"

export function Demo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <LogStream entries={ENTRIES} showFilters={false} className="h-[200px]" />
    </div>
  )
}`,
  render: (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
      <LogStream entries={ENTRIES} showFilters={false} className="h-[200px]" />
    </div>
  ),
}

export const examplesLogStream: Record<string, Example[]> = {
  "log-stream": [filtersExample, noFiltersExample],
}
