import { Lens } from "@/components/ui/lens"

import type { Example } from "@/data/examples"
import { LensControlledDemo } from "@/data/lens-demo"

const lensHoverExample: Example = {
  title: "Lente no hover",
  description:
    "Passe o cursor sobre a imagem para ativar a lente, que segue o mouse e amplia a região sob ela.",
  code: `<Lens zoomFactor={1.6} lensSize={170}>
  <img
    src="https://picsum.photos/seed/lens-hover/500/350"
    alt="Imagem com lente"
    className="h-64 w-full rounded-xl object-cover"
  />
</Lens>`,
  render: (
    <div className="mx-auto w-full max-w-sm">
      <Lens zoomFactor={1.6} lensSize={170}>
        <img
          src="https://picsum.photos/seed/lens-hover/500/350"
          alt="Imagem com lente"
          className="h-64 w-full rounded-xl object-cover"
        />
      </Lens>
    </div>
  ),
}

const lensStaticExample: Example = {
  title: "Lente estática",
  description:
    "Com `isStatic`, a lente fica fixa em uma posição definida — útil para destacar um ponto específico.",
  code: `<Lens isStatic position={{ x: 180, y: 120 }} zoomFactor={1.8} lensSize={140}>
  <img
    src="https://picsum.photos/seed/lens-static/500/350"
    alt="Imagem com lente estática"
    className="h-64 w-full rounded-xl object-cover"
  />
</Lens>`,
  render: (
    <div className="mx-auto w-full max-w-sm">
      <Lens
        isStatic
        position={{ x: 180, y: 120 }}
        zoomFactor={1.8}
        lensSize={140}
      >
        <img
          src="https://picsum.photos/seed/lens-static/500/350"
          alt="Imagem com lente estática"
          className="h-64 w-full rounded-xl object-cover"
        />
      </Lens>
    </div>
  ),
}

const lensControlledExample: Example = {
  title: "Hover controlado",
  description:
    "Estado de hover controlado externamente via `hovering`/`setHovering`, permitindo reagir ao foco em outras partes do card.",
  code: `function LensCard() {
  const [hovering, setHovering] = React.useState(false)

  return (
    <div className="relative mx-auto w-full max-w-sm rounded-2xl border bg-card p-6">
      <Lens hovering={hovering} setHovering={setHovering} zoomFactor={1.7} lensSize={150}>
        <img
          src="https://picsum.photos/seed/lens-card/500/300"
          alt="Paisagem"
          className="h-56 w-full rounded-xl object-cover"
        />
      </Lens>
      <div className="mt-4 transition-opacity" style={{ opacity: hovering ? 0.5 : 1 }}>
        <h3 className="text-lg font-semibold">Detalhe sob a lente</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Passe o cursor sobre a imagem para ampliar os detalhes.
        </p>
      </div>
    </div>
  )
}`,
  render: <LensControlledDemo />,
}

export const examplesLens: Record<string, Example[]> = {
  lens: [lensHoverExample, lensStaticExample, lensControlledExample],
}
