import { ThreeDGlobe } from "@/components/ui/3d-globe"

import type { Example } from "./examples"

export const examples3dGlobe: Record<string, Example[]> = {
  "3d-globe": [
    {
      title: "Globo padrão",
      description:
        "Globo terrestre 3D renderizado via WebGL (cobe) com auto-rotação e pontos sobre grandes cidades. Sem texturas remotas.",
      code: `import { ThreeDGlobe } from "@/components/ui/3d-globe"

export function Demo() {
  return (
    <div className="w-full max-w-[480px]">
      <ThreeDGlobe />
    </div>
  )
}`,
      render: (
        <div className="w-full max-w-[480px]">
          <ThreeDGlobe />
        </div>
      ),
    },
    {
      title: "Markers customizados",
      description:
        "Passe seus próprios markers (`[latitude, longitude]` em graus + tamanho) e ajuste a velocidade de rotação.",
      code: `import { ThreeDGlobe } from "@/components/ui/3d-globe"

export function Demo() {
  return (
    <div className="w-full max-w-[480px]">
      <ThreeDGlobe
        rotationSpeed={0.008}
        markers={[
          { location: [-23.55, -46.63], size: 0.1 }, // São Paulo
          { location: [40.71, -74.0], size: 0.08 }, // Nova York
          { location: [35.68, 139.69], size: 0.08 }, // Tóquio
          { location: [51.51, -0.13], size: 0.06 }, // Londres
        ]}
      />
    </div>
  )
}`,
      render: (
        <div className="w-full max-w-[480px]">
          <ThreeDGlobe
            rotationSpeed={0.008}
            markers={[
              { location: [-23.55, -46.63], size: 0.1 },
              { location: [40.71, -74.0], size: 0.08 },
              { location: [35.68, 139.69], size: 0.08 },
              { location: [51.51, -0.13], size: 0.06 },
            ]}
          />
        </div>
      ),
    },
  ],
}
