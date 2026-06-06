/**
 * Examples — FileUpload (Aceternity UI).
 *
 * Componente de upload com drag-and-drop (`react-dropzone`) e seleção
 * nativa via input. O visual padrão (sem arquivos) mostra o grid de
 * pontos e o ícone central — é o estado demonstrável em qualquer
 * example, sem precisar de arquivo real.
 *
 * `code` e `render` em sincronia. Wrapper com altura mínima
 * (padrão do projeto) para o layout não colapsar.
 */

import type { Example } from "@/data/examples"
import { FileUpload } from "@/components/ui/file-upload"
import { FileUploadDemo } from "@/data/examples-file-upload-demos"

const fileUploadBasic: Example = {
  title: "Básico (single)",
  description:
    "Estado padrão (vazio) com o grid decorativo de fundo e o ícone de upload central. O usuário pode arrastar um arquivo para dentro da área OU clicar para abrir o seletor nativo. Apenas o primeiro arquivo é mantido (`multiple: false`).",
  code: `<FileUpload />`,
  render: (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <FileUpload />
    </div>
  ),
}

const fileUploadWithCallback: Example = {
  title: "Com callback (multi)",
  description:
    "Passe `onChange` para reagir a cada novo arquivo e `multiple` para permitir mais de um. Os arquivos carregados aparecem em cards com nome, tamanho (MB), MIME type e data de modificação, com transição animada via `layoutId`.",
  code: `function MultiUpload() {
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
      <p className="mt-2 text-xs text-muted-foreground">
        {items.length} arquivo(s) carregado(s)
      </p>
    </div>
  )
}`,
  render: (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <FileUploadDemo />
    </div>
  ),
}

export const examplesFileUpload: Record<string, Example[]> = {
  "file-upload": [fileUploadBasic, fileUploadWithCallback],
}
