import type { Example } from "@/data/examples"
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast"

export const examplesToast: Record<string, Example[]> = {
  toast: [
    {
      title: "Toast Simples",
      description: "Toast básico com título e descrição.",
      code: `<ToastProvider>
  <Toast open>
    <div className="grid gap-1">
      <ToastTitle>Sucesso</ToastTitle>
      <ToastDescription>Operação concluída com sucesso.</ToastDescription>
    </div>
  </Toast>
  <ToastViewport />
</ToastProvider>`,
      render: (
        <ToastProvider>
          <Toast open className="relative">
            <div className="grid gap-1">
              <ToastTitle>Sucesso</ToastTitle>
              <ToastDescription>Operação concluída com sucesso.</ToastDescription>
            </div>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      ),
    },
    {
      title: "Toast com Ação",
      description: "Toast com botão de ação e botão de fechar.",
      code: `<ToastProvider>
  <Toast open>
    <div className="grid gap-1">
      <ToastTitle>Atualização disponível</ToastTitle>
      <ToastDescription>Uma nova versão está disponível.</ToastDescription>
    </div>
    <ToastAction altText="Atualizar">Atualizar</ToastAction>
    <ToastClose />
  </Toast>
  <ToastViewport />
</ToastProvider>`,
      render: (
        <ToastProvider>
          <Toast open className="relative">
            <div className="grid gap-1">
              <ToastTitle>Atualização disponível</ToastTitle>
              <ToastDescription>Uma nova versão está disponível.</ToastDescription>
            </div>
            <ToastAction altText="Atualizar">Atualizar</ToastAction>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      ),
    },
  ],
}
