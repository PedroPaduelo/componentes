import { InvoiceTable } from "@/components/ui/invoice-table"
import type { InvoiceTableItem } from "@/components/ui/invoice-table"

import type { Example } from "./examples"

const ITEMS: InvoiceTableItem[] = [
  { label: "Pro anual", qty: 1, unit: 290 },
  { label: "Assentos adicionais", qty: 5, unit: 19 },
]

const basicExample: Example = {
  title: "Itens da fatura",
  description:
    "Tabela de itens com quantidade e valor calculado (qty × unit). Valor formatado em dólar (default).",
  code: `import { InvoiceTable } from "@/components/ui/invoice-table"
import type { InvoiceTableItem } from "@/components/ui/invoice-table"

const items: InvoiceTableItem[] = [
  { label: "Pro anual", qty: 1, unit: 290 },
  { label: "Assentos adicionais", qty: 5, unit: 19 },
]

export function Demo() {
  return (
    <div className="w-full max-w-md">
      <InvoiceTable items={items} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <InvoiceTable items={ITEMS} />
    </div>
  ),
}

const totalExample: Example = {
  title: "Com linha de total",
  description:
    "Passando `total`, a tabela ganha um rodapé (<tfoot>) com o valor total destacado.",
  code: `import { InvoiceTable } from "@/components/ui/invoice-table"

export function Demo() {
  return (
    <div className="w-full max-w-md">
      <InvoiceTable
        items={[
          { label: "Enterprise mensal", qty: 1, unit: 1200 },
          { label: "Assentos adicionais", qty: 8, unit: 19 },
        ]}
        total={1352}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md">
      <InvoiceTable
        items={[
          { label: "Enterprise mensal", qty: 1, unit: 1200 },
          { label: "Assentos adicionais", qty: 8, unit: 19 },
        ]}
        total={1352}
      />
    </div>
  ),
}

export const examplesInvoiceTable: Record<string, Example[]> = {
  "invoice-table": [basicExample, totalExample],
}
