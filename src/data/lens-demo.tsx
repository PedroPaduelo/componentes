import * as React from "react"

import { Lens } from "@/components/ui/lens"

/**
 * Demo de Lens com hover controlado: ao passar o mouse sobre o card inteiro,
 * a lente é ativada e o restante do conteúdo recebe um leve realce.
 */
export function LensControlledDemo() {
  const [hovering, setHovering] = React.useState(false)

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      <Lens hovering={hovering} setHovering={setHovering} zoomFactor={1.7} lensSize={150}>
        <img
          src="https://picsum.photos/seed/lens-card/500/300"
          alt="Paisagem"
          className="h-56 w-full rounded-xl object-cover"
        />
      </Lens>
      <div
        className="mt-4 transition-opacity"
        style={{ opacity: hovering ? 0.5 : 1 }}
      >
        <h3 className="text-lg font-semibold text-foreground">
          Detalhe sob a lente
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Passe o cursor sobre a imagem para ampliar os detalhes. O texto reage
          ao estado de hover compartilhado.
        </p>
      </div>
    </div>
  )
}
