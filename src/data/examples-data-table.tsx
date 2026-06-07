import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import type { Example } from "@/data/examples"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const usersData: UserRow[] = [
  { id: "1", name: "Ana Silva", email: "ana@example.com", role: "Admin", status: "Ativo" },
  { id: "2", name: "Bruno Costa", email: "bruno@example.com", role: "Editor", status: "Ativo" },
  { id: "3", name: "Carla Dias", email: "carla@example.com", role: "Viewer", status: "Inativo" },
  { id: "4", name: "Daniel Lima", email: "daniel@example.com", role: "Editor", status: "Ativo" },
  { id: "5", name: "Eva Souza", email: "eva@example.com", role: "Viewer", status: "Pendente" },
]

const usersColumns: ColumnDef<UserRow>[] = [
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "email", header: "E-mail" },
  { accessorKey: "role", header: "Função" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const color =
        status === "Ativo"
          ? "text-green-600 dark:text-green-400"
          : status === "Inativo"
            ? "text-red-500"
            : "text-yellow-600 dark:text-yellow-400"
      return <span className={color}>{status}</span>
    },
  },
]

const usersExample: Example = {
  title: "Tabela de usuários",
  description: "Tabela com colunas de dados, status colorido e estado vazio integrado.",
  code: `<DataTable
  columns={[
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "email", header: "E-mail" },
    { accessorKey: "role", header: "Função" },
    { accessorKey: "status", header: "Status" },
  ]}
  data={users}
/>`,
  render: (
    <DataTable<UserRow> columns={usersColumns} data={usersData} />
  ),
}

type InvoiceRow = {
  invoice: string
  amount: string
  method: string
  date: string
}

const invoicesData: InvoiceRow[] = [
  { invoice: "INV-001", amount: "R$ 1.200,00", method: "Pix", date: "01/06/2025" },
  { invoice: "INV-002", amount: "R$ 850,00", method: "Cartão", date: "03/06/2025" },
  { invoice: "INV-003", amount: "R$ 2.100,00", method: "Boleto", date: "05/06/2025" },
  { invoice: "INV-004", amount: "R$ 430,00", method: "Pix", date: "07/06/2025" },
]

const invoicesColumns: ColumnDef<InvoiceRow>[] = [
  { accessorKey: "invoice", header: "Fatura" },
  { accessorKey: "amount", header: "Valor" },
  { accessorKey: "method", header: "Pagamento" },
  { accessorKey: "date", header: "Data" },
]

const invoicesExample: Example = {
  title: "Tabela de faturas",
  description: "Exemplo com dados financeiros e colunas simples via accessorKey.",
  code: `<DataTable
  columns={[
    { accessorKey: "invoice", header: "Fatura" },
    { accessorKey: "amount", header: "Valor" },
    { accessorKey: "method", header: "Pagamento" },
    { accessorKey: "date", header: "Data" },
  ]}
  data={invoices}
/>`,
  render: (
    <DataTable<InvoiceRow> columns={invoicesColumns} data={invoicesData} />
  ),
}

export const examplesDataTable: Record<string, Example[]> = {
  "data-table": [usersExample, invoicesExample],
}
