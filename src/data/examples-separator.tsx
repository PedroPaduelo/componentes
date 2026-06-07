import type { Example } from "@/data/examples"
import { Separator } from "@/components/ui/separator"

export const examplesSeparator: Record<string, Example[]> = {
  separator: [
    {
      title: "Horizontal",
      description: "Separator horizontal entre seções de conteúdo.",
      code: `<div className="space-y-4">
  <div>
    <h4 className="text-sm font-medium">Acima</h4>
    <p className="text-sm text-muted-foreground">Conteúdo antes do separador.</p>
  </div>
  <Separator />
  <div>
    <h4 className="text-sm font-medium">Abaixo</h4>
    <p className="text-sm text-muted-foreground">Conteúdo depois do separador.</p>
  </div>
</div>`,
      render: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Acima</h4>
            <p className="text-sm text-muted-foreground">Conteúdo antes do separador.</p>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium">Abaixo</h4>
            <p className="text-sm text-muted-foreground">Conteúdo depois do separador.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Vertical",
      description: "Separator vertical entre elementos lado a lado.",
      code: `<div className="flex h-5 items-center space-x-4 text-sm">
  <div>Item 1</div>
  <Separator orientation="vertical" />
  <div>Item 2</div>
  <Separator orientation="vertical" />
  <div>Item 3</div>
</div>`,
      render: (
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>Item 1</div>
          <Separator orientation="vertical" />
          <div>Item 2</div>
          <Separator orientation="vertical" />
          <div>Item 3</div>
        </div>
      ),
    },
  ],
}
