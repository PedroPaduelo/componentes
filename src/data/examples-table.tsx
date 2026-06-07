import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Example } from "@/data/examples"

const tableBasicExample: Example = {
  title: "Básico",
  description: "Tabela simples com cabeçalho, corpo e linhas de dados.",
  code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Ana Silva</TableCell>
      <TableCell>ana@email.com</TableCell>
      <TableCell>Ativo</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Bruno Costa</TableCell>
      <TableCell>bruno@email.com</TableCell>
      <TableCell>Inativo</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Carla Dias</TableCell>
      <TableCell>carla@email.com</TableCell>
      <TableCell>Ativo</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  render: (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ana Silva</TableCell>
          <TableCell>ana@email.com</TableCell>
          <TableCell>Ativo</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bruno Costa</TableCell>
          <TableCell>bruno@email.com</TableCell>
          <TableCell>Inativo</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Carla Dias</TableCell>
          <TableCell>carla@email.com</TableCell>
          <TableCell>Ativo</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

const tableWithCaptionExample: Example = {
  title: "Com caption",
  description: "Tabela com legenda (caption) e rodapé (footer) para resumos.",
  code: `<Table>
  <TableCaption>Lista de faturas recentes.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Fatura</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Método</TableHead>
      <TableHead className="text-right">Valor</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV-001</TableCell>
      <TableCell>Pago</TableCell>
      <TableCell>Cartão</TableCell>
      <TableCell className="text-right">R$ 250,00</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>INV-002</TableCell>
      <TableCell>Pendente</TableCell>
      <TableCell>Boleto</TableCell>
      <TableCell className="text-right">R$ 150,00</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>INV-003</TableCell>
      <TableCell>Pago</TableCell>
      <TableCell>Pix</TableCell>
      <TableCell className="text-right">R$ 350,00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">R$ 750,00</TableCell>
    </TableRow>
  </TableFooter>
</Table>`,
  render: (
    <Table>
      <TableCaption>Lista de faturas recentes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Método</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV-001</TableCell>
          <TableCell>Pago</TableCell>
          <TableCell>Cartão</TableCell>
          <TableCell className="text-right">R$ 250,00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-002</TableCell>
          <TableCell>Pendente</TableCell>
          <TableCell>Boleto</TableCell>
          <TableCell className="text-right">R$ 150,00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-003</TableCell>
          <TableCell>Pago</TableCell>
          <TableCell>Pix</TableCell>
          <TableCell className="text-right">R$ 350,00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">R$ 750,00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const examplesTable: Record<string, Example[]> = {
  table: [tableBasicExample, tableWithCaptionExample],
}
