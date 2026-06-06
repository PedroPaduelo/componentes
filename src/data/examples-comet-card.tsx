import { CometCard } from "@/components/ui/comet-card"
import type { Example } from "@/data/examples"

const cometCardBasic: Example = {
  title: "Básico",
  description:
    "Card da Aceternity UI com efeito 3D que segue o cursor (tilt + parallax) e um glare radial que se move com o mouse. Passe o mouse por cima para ver o card inclinar e brilhar — útil para destacar CTAs, cases ou cards de produto.",
  code: `<CometCard className="h-full w-full">
  <div className="relative h-full w-full overflow-hidden rounded-2xl border bg-card">
    <img
      src="https://picsum.photos/seed/comet/600/800"
      alt="Capa do card"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
    <div className="relative flex h-full flex-col justify-end p-6 text-white">
      <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
        Aceternity UI
      </span>
      <h3 className="mt-1 text-2xl font-bold">Comet Card</h3>
      <p className="mt-1 text-sm text-white/80">
        Tilt 3D + glare radial seguindo o cursor.
      </p>
    </div>
  </div>
</CometCard>`,
  render: (
    <div className="flex w-full items-center justify-center p-8">
      <div className="h-[420px] w-[300px]">
        <CometCard className="h-full w-full">
          <div className="relative h-full w-full overflow-hidden rounded-2xl border bg-card">
            <img
              src="https://picsum.photos/seed/comet/600/800"
              alt="Capa do card"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6 text-white">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Aceternity UI
              </span>
              <h3 className="mt-1 text-2xl font-bold">Comet Card</h3>
              <p className="mt-1 text-sm text-white/80">
                Tilt 3D + glare radial seguindo o cursor.
              </p>
            </div>
          </div>
        </CometCard>
      </div>
    </div>
  ),
}

const cometCardSutil: Example = {
  title: "Sutil (rotateDepth menor)",
  description:
    "Variante com rotateDepth 8° e translateDepth 8px — tilt discreto, ótimo para grids de cards onde o efeito 3D não pode competir com o conteúdo. Mesma API do básico, só mudando as props numéricas.",
  code: `<CometCard rotateDepth={8} translateDepth={8} className="h-full w-full">
  <div className="relative h-full w-full overflow-hidden rounded-2xl border bg-card p-6">
    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      Feature
    </span>
    <h3 className="mt-2 text-xl font-semibold text-foreground">
      Hover gentil
    </h3>
    <p className="mt-2 text-sm text-muted-foreground">
      Tilt de 8° + parallax de 8px: presença sem chamar atenção demais.
    </p>
  </div>
</CometCard>`,
  render: (
    <div className="flex w-full items-center justify-center p-8">
      <div className="h-[260px] w-[300px]">
        <CometCard rotateDepth={8} translateDepth={8} className="h-full w-full">
          <div className="relative flex h-full w-full flex-col justify-center overflow-hidden rounded-2xl border bg-card p-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Feature
            </span>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Hover gentil
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tilt de 8° + parallax de 8px: presença sem chamar atenção demais.
            </p>
          </div>
        </CometCard>
      </div>
    </div>
  ),
}

export const examplesCometCard: Record<string, Example[]> = {
  "comet-card": [cometCardBasic, cometCardSutil],
}
