import { Separator } from "@/components/ui/separator"
import type { Example } from "@/data/examples"

export const examplesSeparator: Record<string, Example[]> = {
  separator: [
    {
      title: "Horizontal",
      description: "Linha divisória horizontal padrão para separar seções.",
      code: `<div className="space-y-4">
  <div>
    <h3 className="text-lg font-medium">Seção 1</h3>
    <p className="text-sm text-muted-foreground">Conteúdo da primeira seção.</p>
  </div>
  <Separator />
  <div>
    <h3 className="text-lg font-medium">Seção 2</h3>
    <p className="text-sm text-muted-foreground">Conteúdo da segunda seção.</p>
  </div>
</div>`,
      render: (
        <div className="w-full max-w-md space-y-4">
          <div>
            <h3 className="text-lg font-medium">Seção 1</h3>
            <p className="text-sm text-muted-foreground">
              Conteúdo da primeira seção.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium">Seção 2</h3>
            <p className="text-sm text-muted-foreground">
              Conteúdo da segunda seção.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Vertical",
      description: "Divisor vertical para separar conteúdo em layout horizontal.",
      code: `<div className="flex items-center gap-4">
  <span className="text-sm">Esquerda</span>
  <Separator orientation="vertical" className="h-6" />
  <span className="text-sm">Direita</span>
</div>`,
      render: (
        <div className="flex items-center gap-4">
          <span className="text-sm">Esquerda</span>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm">Direita</span>
        </div>
      ),
    },
  ],
}
