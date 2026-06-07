import type { Example } from "@/data/examples"
import { Progress } from "@/components/ui/progress"

export const examplesProgress: Record<string, Example[]> = {
  progress: [
    {
      title: "Básico",
      description: "Barra de progresso com valor controlado.",
      code: `<Progress value={60} />`,
      render: (
        <div className="w-full max-w-sm space-y-4">
          <Progress value={60} />
        </div>
      ),
    },
    {
      title: "Valores dinâmicos",
      description: "Demonstrando diferentes níveis de progresso.",
      code: `<div className="space-y-4">
  <div className="space-y-1.5">
    <span className="text-xs text-muted-foreground">Início — 20%</span>
    <Progress value={20} />
  </div>
  <div className="space-y-1.5">
    <span className="text-xs text-muted-foreground">Metade — 50%</span>
    <Progress value={50} />
  </div>
  <div className="space-y-1.5">
    <span className="text-xs text-muted-foreground">Quase lá — 80%</span>
    <Progress value={80} />
  </div>
  <div className="space-y-1.5">
    <span className="text-xs text-muted-foreground">Completo — 100%</span>
    <Progress value={100} />
  </div>
</div>`,
      render: (
        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Início — 20%</span>
            <Progress value={20} />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Metade — 50%</span>
            <Progress value={50} />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Quase lá — 80%</span>
            <Progress value={80} />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Completo — 100%</span>
            <Progress value={100} />
          </div>
        </div>
      ),
    },
  ],
}
