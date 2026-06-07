import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import type { Example } from "@/data/examples"

type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  date: string
}

const statusVariant: Record<Payment["status"], string> = {
  pending: "secondary",
  processing: "default",
  success: "outline",
  failed: "destructive",
} as const

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("id")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Payment["status"]
      return (
        <Badge variant={statusVariant[status] as "secondary" | "default" | "outline" | "destructive"}>
          {status === "pending"
            ? "Pendente"
            : status === "processing"
              ? "Processando"
              : status === "success"
                ? "Concluído"
                : "Falhou"}
        </Badge>
      )
    },
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)
      return <span className="font-medium tabular-nums">{formatted}</span>
    },
  },
  { accessorKey: "date", header: "Data" },
]

const data: Payment[] = [
  { id: "PAY-001", amount: 250.0, status: "success", email: "ana@exemplo.com", date: "2025-01-15" },
  { id: "PAY-002", amount: 150.0, status: "pending", email: "carlos@exemplo.com", date: "2025-01-16" },
  { id: "PAY-003", amount: 350.0, status: "processing", email: "maria@exemplo.com", date: "2025-01-16" },
  { id: "PAY-004", amount: 450.0, status: "success", email: "joao@exemplo.com", date: "2025-01-17" },
  { id: "PAY-005", amount: 550.0, status: "failed", email: "lucia@exemplo.com", date: "2025-01-17" },
  { id: "PAY-006", amount: 200.0, status: "success", email: "pedro@exemplo.com", date: "2025-01-18" },
  { id: "PAY-007", amount: 750.0, status: "pending", email: "fernanda@exemplo.com", date: "2025-01-18" },
  { id: "PAY-008", amount: 320.0, status: "processing", email: "rafael@exemplo.com", date: "2025-01-19" },
  { id: "PAY-009", amount: 180.0, status: "success", email: "camila@exemplo.com", date: "2025-01-19" },
  { id: "PAY-010", amount: 420.0, status: "failed", email: "bruno@exemplo.com", date: "2025-01-20" },
  { id: "PAY-011", amount: 620.0, status: "success", email: "patricia@exemplo.com", date: "2025-01-20" },
  { id: "PAY-012", amount: 290.0, status: "pending", email: "diego@exemplo.com", date: "2025-01-21" },
]

const dataTablePaymentsExample: Example = {
  title: "Pagamentos",
  description: "Tabela de pagamentos com ordenação, paginação e busca.",
  code: `<DataTable
  columns={columns}
  data={payments}
  filterPlaceholder="Filtrar pagamentos..."
  pageSize={5}
/>`,
  render: (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        filterPlaceholder="Filtrar pagamentos..."
        pageSize={5}
      />
    </div>
  ),
}

const usersColumns: ColumnDef<{
  name: string
  role: string
  active: boolean
  joined: string
}>[] = [
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "role", header: "Cargo" },
  {
    accessorKey: "active",
    header: "Ativo",
    cell: ({ row }) => (
      row.getValue("active") ? (
        <Badge variant="outline">Sim</Badge>
      ) : (
        <Badge variant="destructive">Não</Badge>
      )
    ),
  },
  { accessorKey: "joined", header: "Desde" },
]

const usersData = [
  { name: "Ana Silva", role: "Admin", active: true, joined: "2024-03-10" },
  { name: "Carlos Souza", role: "Editor", active: true, joined: "2024-05-22" },
  { name: "Maria Costa", role: "Viewer", active: false, joined: "2024-07-15" },
  { name: "João Lima", role: "Editor", active: true, joined: "2024-09-01" },
  { name: "Lucia Ferreira", role: "Admin", active: true, joined: "2024-11-18" },
]

const dataTableUsersExample: Example = {
  title: "Usuários",
  description: "Tabela de usuários com badges de status e paginação compacta.",
  code: `<DataTable
  columns={usersColumns}
  data={usersData}
  filterPlaceholder="Buscar usuário..."
  pageSize={3}
/>`,
  render: (
    <div className="w-full">
      <DataTable
        columns={usersColumns}
        data={usersData}
        filterPlaceholder="Buscar usuário..."
        pageSize={3}
      />
    </div>
  ),
}

export const examplesDataTable: Record<string, Example[]> = {
  "data-table": [dataTablePaymentsExample, dataTableUsersExample],
}
