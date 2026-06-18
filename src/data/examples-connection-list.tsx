import { ConnectionList } from "@/components/ui/connection-list"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Lista de conexões",
  description:
    "Cada item tem um indicador de status (ponto), nome e um slot `meta` à direita; o item ativo recebe destaque. Use `status` para forçar a cor do ponto (online/offline/warning).",
  code: `import { useState } from "react"

import { ConnectionList } from "@/components/ui/connection-list"

export function Demo() {
  const [active, setActive] = useState("prod")
  return (
    <ConnectionList
      activeId={active}
      onSelect={setActive}
      items={[
        { id: "prod", name: "audit-prod-01", meta: "4sch" },
        { id: "stg", name: "sgt-maker", meta: "6sch" },
        { id: "dw", name: "warehouse", meta: "2sch", status: "warning" },
        { id: "legacy", name: "legacy-mysql", meta: "1sch", status: "offline" },
      ]}
    />
  )
}`,
  render: (
    <div className="w-64 rounded-lg border border-border p-2">
      <ConnectionList
        activeId="prod"
        onSelect={() => undefined}
        items={[
          { id: "prod", name: "audit-prod-01", meta: "4sch" },
          { id: "stg", name: "sgt-maker", meta: "6sch" },
          { id: "dw", name: "warehouse", meta: "2sch", status: "warning" },
          { id: "legacy", name: "legacy-mysql", meta: "1sch", status: "offline" },
        ]}
      />
    </div>
  ),
}

export const examplesConnectionList: Record<string, Example[]> = {
  "connection-list": [basicExample],
}
