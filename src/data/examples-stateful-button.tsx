import type { Example } from "@/data/examples"
import { StatefulButton } from "@/components/ui/stateful-button"

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const statefulButtonBasicExample: Example = {
  title: "Básico",
  description:
    "Clique para disparar o spinner de loading; o check de sucesso aparece quando o handler resolve.",
  code: `<StatefulButton
  onClick={async () => {
    await new Promise((r) => setTimeout(r, 1500))
  }}
>
  Salvar alterações
</StatefulButton>`,
  render: (
    <StatefulButton
      onClick={async () => {
        await wait(1500)
      }}
    >
      Salvar alterações
    </StatefulButton>
  ),
}

const statefulButtonCustomExample: Example = {
  title: "Estilizado",
  description:
    "A cor e o tamanho são customizáveis via className — aqui um botão azul, mais largo.",
  code: `<StatefulButton
  className="min-w-[160px] bg-blue-500 hover:ring-blue-500"
  onClick={async () => {
    await new Promise((r) => setTimeout(r, 2000))
  }}
>
  Enviar formulário
</StatefulButton>`,
  render: (
    <StatefulButton
      className="min-w-[160px] bg-blue-500 hover:ring-blue-500"
      onClick={async () => {
        await wait(2000)
      }}
    >
      Enviar formulário
    </StatefulButton>
  ),
}

export const examplesStatefulButton: Record<string, Example[]> = {
  "stateful-button": [
    statefulButtonBasicExample,
    statefulButtonCustomExample,
  ],
}
