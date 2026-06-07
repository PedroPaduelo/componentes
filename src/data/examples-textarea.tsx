import { Textarea } from "@/components/ui/textarea"
import { type Example } from "@/data/examples"

const textareaBasicExample: Example = {
  title: "Básico",
  description: "Campo de texto multiline para descrições e conteúdo longo.",
  code: `<Textarea placeholder="Escreva uma descrição..." />`,
  render: (
    <Textarea placeholder="Escreva uma descrição..." />
  ),
}

const textareaWithLabelExample: Example = {
  title: "Com rótulo",
  description: "Textarea com label e estados de foco e desabilitado.",
  code: `<label className="flex flex-col gap-1.5 text-sm">
  <span className="font-medium">Mensagem</span>
  <Textarea placeholder="Digite sua mensagem..." rows={4} />
</label>`,
  render: (
    <label className="flex w-full max-w-xs flex-col gap-1.5 text-sm">
      <span className="font-medium">Mensagem</span>
      <Textarea placeholder="Digite sua mensagem..." rows={4} />
    </label>
  ),
}

const textareaStatesExample: Example = {
  title: "Estados",
  description: "Textarea desabilitado e com erro de validação.",
  code: `<Textarea disabled placeholder="Desabilitado" />
<Textarea aria-invalid placeholder="Com erro" />`,
  render: (
    <div className="flex flex-col gap-3">
      <Textarea disabled placeholder="Desabilitado" />
      <Textarea aria-invalid placeholder="Com erro" />
    </div>
  ),
}

export const examplesTextarea: Record<string, Example[]> = {
  textarea: [textareaBasicExample, textareaWithLabelExample, textareaStatesExample],
}
