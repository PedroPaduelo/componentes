import { FavoritesList } from "@/components/ui/favorites-list"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Lista de favoritos (com remover)",
  description:
    "Itens com estrela preenchida e rótulo mono. Com `onRemove`, um botão de remover (StarOff) aparece no hover. Lista vazia mostra o `emptyLabel`.",
  code: `import { useState } from "react"

import { FavoritesList } from "@/components/ui/favorites-list"

export function Demo() {
  const [items, setItems] = useState([
    { id: "iam.users", label: "iam.users" },
    { id: "audit.events", label: "audit.events" },
  ])
  return (
    <FavoritesList
      items={items}
      onSelect={() => {}}
      onRemove={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
    />
  )
}`,
  render: (
    <div className="w-64 rounded-lg border border-border p-2">
      <FavoritesList
        items={[
          { id: "iam.users", label: "iam.users" },
          { id: "audit.events", label: "audit.events" },
          { id: "billing.invoices", label: "billing.invoices" },
        ]}
        onSelect={() => undefined}
        onRemove={() => undefined}
      />
    </div>
  ),
}

export const examplesFavoritesList: Record<string, Example[]> = {
  "favorites-list": [basicExample],
}
