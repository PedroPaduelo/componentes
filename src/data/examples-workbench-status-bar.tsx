import { Activity, Clock, Database } from "lucide-react"

import { WorkbenchStatusBar } from "@/components/ui/workbench-status-bar"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Barra de status (slots left/right)",
  description:
    "Faixa fina de rodapé estilo IDE. Passe `left` e `right` com o conteúdo já montado (spans com ícones/pontos). O grupo da direita é empurrado com `ml-auto`.",
  code: `import { Activity, Clock, Database } from "lucide-react"

import { WorkbenchStatusBar } from "@/components/ui/workbench-status-bar"

export function Demo() {
  return (
    <WorkbenchStatusBar
      left={
        <>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" /> conectado
          </span>
          <span className="flex items-center gap-1">
            <Database className="size-3" /> audit-prod-01
          </span>
          <span>encoding: UTF8</span>
        </>
      }
      right={
        <>
          <span className="flex items-center gap-1">
            <Activity className="size-3" /> idle
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> 24 tabelas
          </span>
        </>
      }
    />
  )
}`,
  render: (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <WorkbenchStatusBar
        left={
          <>
            <span className="flex shrink-0 items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />{" "}
              conectado
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <Database className="size-3" /> audit-prod-01
            </span>
            <span className="shrink-0">encoding: UTF8</span>
          </>
        }
        right={
          <>
            <span className="flex items-center gap-1">
              <Activity className="size-3" /> idle
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> 24 tabelas
            </span>
          </>
        }
      />
    </div>
  ),
}

export const examplesWorkbenchStatusBar: Record<string, Example[]> = {
  "workbench-status-bar": [basicExample],
}
