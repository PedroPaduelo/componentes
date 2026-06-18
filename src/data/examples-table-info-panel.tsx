import { TableInfoPanel } from "@/components/ui/table-info-panel"

import type { Example } from "./examples"

const sampleTable = {
  name: "users",
  rowCount: 4_812,
  sizeMB: 18,
  description: "Identidades de usuários humanos e service accounts.",
  columns: [
    { name: "id", type: "uuid", isPrimary: true },
    { name: "email", type: "citext" },
    { name: "tenant_id", type: "uuid", isForeign: true },
    { name: "created_at", type: "timestamptz" },
  ],
  indexes: [
    { name: "users_pkey", type: "btree", columns: ["id"] },
    { name: "users_email_key", type: "btree", columns: ["tenant_id", "email"] },
  ],
  foreignKeys: [
    {
      name: "users_tenant_fk",
      references: { schema: "iam", table: "tenants", column: "id" },
      onDelete: "RESTRICT",
    },
  ],
}

const basicExample: Example = {
  title: "Painel de inspeção de tabela",
  description:
    "Cabeçalho com `schema.tabela`, dois StatTiles (linhas/tamanho) e listas de colunas, índices e foreign keys. Com `onNavigateFk`, as FKs viram clicáveis; com `onToggleFavorite`, mostra o botão de favoritar.",
  code: `import { TableInfoPanel } from "@/components/ui/table-info-panel"

export function Demo() {
  return (
    <TableInfoPanel
      schemaName="iam"
      table={sampleTable}
      isFavorite={false}
      onToggleFavorite={() => {}}
      onNavigateFk={(ref) => console.log(ref)}
    />
  )
}`,
  render: (
    <div className="h-[520px] w-[300px] overflow-hidden rounded-lg border border-border bg-card/40">
      <TableInfoPanel
        schemaName="iam"
        table={sampleTable}
        isFavorite={false}
        onToggleFavorite={() => undefined}
        onNavigateFk={() => undefined}
      />
    </div>
  ),
}

const emptyExample: Example = {
  title: "Estado vazio",
  description: "Sem `table`, o painel mostra o estado vazio com uma dica.",
  code: `import { TableInfoPanel } from "@/components/ui/table-info-panel"

export function Demo() {
  return <TableInfoPanel table={null} />
}`,
  render: (
    <div className="h-[320px] w-[300px] overflow-hidden rounded-lg border border-border bg-card/40">
      <TableInfoPanel table={null} />
    </div>
  ),
}

export const examplesTableInfoPanel: Record<string, Example[]> = {
  "table-info-panel": [basicExample, emptyExample],
}
