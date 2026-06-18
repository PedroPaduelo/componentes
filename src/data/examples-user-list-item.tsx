import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserListItem } from "@/components/ui/user-list-item"

import type { Example } from "./examples"

const USERS = [
  { name: "Ana Silva", email: "ana@example.com", status: "Ativo" },
  { name: "Carlos Souza", email: "carlos@example.com", status: "Ativo" },
  { name: "Maria Santos", email: "maria@example.com", status: "Pendente" },
  { name: "João Oliveira", email: "joao@example.com", status: "Inativo" },
]

const listExample: Example = {
  title: "Lista de usuários",
  description:
    "Avatar (fallback de iniciais) + nome/e-mail à esquerda e um status à direita. Cada linha vai numa \"caixa\" via className; passe `badge` quando quiser controlar a variante.",
  code: `import { Badge } from "@/components/ui/badge"
import { UserListItem } from "@/components/ui/user-list-item"

export function Demo() {
  return (
    <div className="space-y-3">
      {users.map((u) => (
        <UserListItem
          key={u.email}
          name={u.name}
          email={u.email}
          className="rounded-lg border bg-background/50 px-4 py-3"
          badge={
            <Badge variant={u.status === "Ativo" ? "default" : "secondary"}>
              {u.status}
            </Badge>
          }
        />
      ))}
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md space-y-3">
      {USERS.map((u) => (
        <UserListItem
          key={u.email}
          name={u.name}
          email={u.email}
          className="rounded-lg border bg-background/50 px-4 py-3"
          badge={
            <Badge
              variant={
                u.status === "Ativo"
                  ? "default"
                  : u.status === "Pendente"
                    ? "secondary"
                    : "outline"
              }
            >
              {u.status}
            </Badge>
          }
        />
      ))}
    </div>
  ),
}

const actionsExample: Example = {
  title: "Com avatar, meta e ações",
  description:
    "Com `avatar`, `meta` (linha auxiliar) e `actions` à direita. Use em listas separadas por divisória (`divide-y`).",
  code: `<div className="divide-y divide-border rounded-lg border">
  <UserListItem
    name="Ana Silva"
    email="ana@example.com"
    avatar="https://i.pravatar.cc/80?img=5"
    meta="Ativa há 2 min"
    className="px-4 py-3"
    actions={<Button size="sm" variant="outline">Ver</Button>}
  />
</div>`,
  render: (
    <div className="w-full max-w-md divide-y divide-border rounded-lg border">
      <UserListItem
        name="Ana Silva"
        email="ana@example.com"
        avatar="https://i.pravatar.cc/80?img=5"
        meta="Ativa há 2 min"
        className="px-4 py-3"
        actions={
          <Button size="sm" variant="outline">
            Ver
          </Button>
        }
      />
      <UserListItem
        name="Carlos Souza"
        email="carlos@example.com"
        meta="Ativo há 1 h"
        className="px-4 py-3"
        actions={
          <Button size="sm" variant="outline">
            Ver
          </Button>
        }
      />
    </div>
  ),
}

export const examplesUserListItem: Record<string, Example[]> = {
  "user-list-item": [listExample, actionsExample],
}
