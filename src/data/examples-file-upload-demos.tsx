/**
 * Componentes de demo (com useState) usados pelos examples do
 * FileUpload (lote Aceternity). Mantidos em arquivo separado para o
 * registry `examplesFileUpload` ficar puro (só constantes), evitando
 * o lint `react-refresh/only-export-components`.
 */

import * as React from "react"

import { FileUpload } from "@/components/ui/file-upload"

export function FileUploadDemo() {
  const [items, setItems] = React.useState<File[]>([])
  return (
    <div>
      <FileUpload
        multiple
        accept="image/*"
        onChange={(newFiles) => {
          setItems((prev) => [...prev, ...newFiles])
        }}
      />
      <p className="mt-2 px-4 pb-3 text-xs text-muted-foreground">
        {items.length} arquivo(s) carregado(s)
      </p>
    </div>
  )
}
