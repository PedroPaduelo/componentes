import type { Example } from "@/data/examples"
import { Textarea } from "@/components/ui/textarea"

export const examplesTextarea: Record<string, Example[]> = {
  textarea: [
    {
      title: "Básico",
      description: "Textarea simples com placeholder.",
      code: `<Textarea placeholder="Digite sua mensagem..." />`,
      render: <Textarea placeholder="Digite sua mensagem..." />,
    },
    {
      title: "Com Label",
      description: "Textarea com label e texto de ajuda.",
      code: `<div className="grid w-full gap-1.5">
  <label htmlFor="message">Mensagem</label>
  <Textarea placeholder="Digite sua mensagem..." id="message" />
  <p className="text-sm text-muted-foreground">
    Sua mensagem será enviada em até 24h.
  </p>
</div>`,
      render: (
        <div className="grid w-full gap-1.5">
          <label htmlFor="message">Mensagem</label>
          <Textarea placeholder="Digite sua mensagem..." id="message" />
          <p className="text-sm text-muted-foreground">
            Sua mensagem será enviada em até 24h.
          </p>
        </div>
      ),
    },
  ],
}
