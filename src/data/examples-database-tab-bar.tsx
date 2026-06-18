import { Database, FileCode2 } from "lucide-react"

import { DatabaseTabBar } from "@/components/ui/database-tab-bar"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Abas estilo VS Code (com close + dirty)",
  description:
    "Abas controladas (`activeId` + `onSelect`). Com `onClose`, cada aba ganha um \"X\"; abas `dirty` mostram um ponto que vira o \"X\" no hover. `onNew` adiciona o botão \"+\".",
  code: `import { useState } from "react"
import { Database, FileCode2 } from "lucide-react"

import { DatabaseTabBar } from "@/components/ui/database-tab-bar"

export function Demo() {
  const [active, setActive] = useState("prod")
  const tabs = [
    { id: "prod", label: "audit-prod-01", icon: Database },
    { id: "stg", label: "sgt-maker", icon: Database, dirty: true },
    { id: "query", label: "untitled.sql", icon: FileCode2 },
  ]
  return (
    <DatabaseTabBar
      tabs={tabs}
      activeId={active}
      onSelect={setActive}
      onClose={() => {}}
      onNew={() => {}}
    />
  )
}`,
  render: (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <DatabaseTabBar
        tabs={[
          { id: "prod", label: "audit-prod-01", icon: Database },
          { id: "stg", label: "sgt-maker", icon: Database, dirty: true },
          { id: "query", label: "untitled.sql", icon: FileCode2 },
        ]}
        activeId="prod"
        onSelect={() => undefined}
        onClose={() => undefined}
        onNew={() => undefined}
      />
    </div>
  ),
}

export const examplesDatabaseTabBar: Record<string, Example[]> = {
  "database-tab-bar": [basicExample],
}
