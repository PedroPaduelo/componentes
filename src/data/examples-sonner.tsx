import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import type { Example } from "@/data/examples"

const toastSimpleExample: Example = {
  title: "Toast simples",
  description: "Notificação básica com título e descrição.",
  code: `import { toast } from "@/components/ui/sonner"
toast("Evento criado", {
  description: "Seu evento foi salvo com sucesso.",
})`,
  render: (
    <Button
      variant="outline"
      onClick={() =>
        toast("Evento criado", {
          description: "Seu evento foi salvo com sucesso.",
        })
      }
    >
      Mostrar toast
    </Button>
  ),
}

const toastWithActionExample: Example = {
  title: "Toast com ação",
  description: "Notificação com botão de desfazer (action).",
  code: `import { toast } from "@/components/ui/sonner"
toast("Mensagem enviada", {
  description: "Sua mensagem foi entregue.",
  action: {
    label: "Desfazer",
    onClick: () => console.log("Desfeito"),
  },
  duration: 6000,
})`,
  render: (
    <Button
      variant="outline"
      onClick={() =>
        toast("Mensagem enviada", {
          description: "Sua mensagem foi entregue.",
          action: {
            label: "Desfazer",
            onClick: () => {},
          },
          duration: 6000,
        })
      }
    >
      Enviar mensagem
    </Button>
  ),
}

const toastPromiseExample: Example = {
  title: "Toast com Promise",
  description: "Exibe loading durante promise depois sucesso ou erro.",
  code: `import { toast } from "@/components/ui/sonner"
toast.promise(
  fetch("/api/save").then((res) => {
    if (!res.ok) throw new Error("Erro")
    return res.json()
  }),
  {
    loading: "Salvando...",
    success: "Salvo com sucesso!",
    error: "Falha ao salvar.",
  }
)`,
  render: (
    <Button
      variant="outline"
      onClick={() =>
        toast.promise(
          () =>
            new Promise<string>((resolve) =>
              setTimeout(() => resolve("ok"), 1500)
            ),
          {
            loading: "Salvando...",
            success: "Salvo com sucesso!",
            error: "Falha ao salvar.",
          }
        )
      }
    >
      Salvar dados
    </Button>
  ),
}

export const examplesSonner: Record<string, Example[]> = {
  sonner: [toastSimpleExample, toastWithActionExample, toastPromiseExample],
}
