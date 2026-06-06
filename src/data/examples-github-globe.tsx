import { GitHubGlobe } from "@/components/ui/github-globe"

import type { Example } from "./examples"

const githubGlobeBasicExample: Example = {
  title: "Globo padrão",
  description:
    "Globo 3D estilo GitHub com arcos animados entre cidades, anéis pulsantes e rotação automática. Renderizado com three + three-globe sobre WebGL (fundo escuro).",
  code: `<GitHubGlobe className="h-[28rem]" />`,
  render: (
    <div className="w-full">
      <GitHubGlobe className="h-[28rem]" />
    </div>
  ),
}

const githubGlobeCustomExample: Example = {
  title: "Cores e arcos customizados",
  description:
    "Passe seus próprios arcos (lat/lng de origem e destino + cor) e ajuste a paleta do globo via globeConfig (cor do globo, atmosfera, velocidade de rotação).",
  code: `<GitHubGlobe
  className="h-[28rem]"
  globeConfig={{
    globeColor: "#1d072e",
    emissive: "#1d072e",
    atmosphereColor: "#a78bfa",
    autoRotateSpeed: 1,
  }}
  arcs={[
    { order: 1, startLat: 40.7128, startLng: -74.006, endLat: 51.5072, endLng: -0.1276, arcColor: "#a78bfa" },
    { order: 1, startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, arcColor: "#22d3ee" },
    { order: 2, startLat: -23.5505, startLng: -46.6333, endLat: 48.8566, endLng: 2.3522, arcColor: "#f472b6" },
    { order: 2, startLat: 19.076, startLng: 72.8777, endLat: 1.3521, endLng: 103.8198, arcColor: "#a78bfa" },
    { order: 3, startLat: 55.7558, startLng: 37.6173, endLat: 39.9042, endLng: 116.4074, arcColor: "#22d3ee" },
  ]}
/>`,
  render: (
    <div className="w-full">
      <GitHubGlobe
        className="h-[28rem]"
        globeConfig={{
          globeColor: "#1d072e",
          emissive: "#1d072e",
          atmosphereColor: "#a78bfa",
          autoRotateSpeed: 1,
        }}
        arcs={[
          { order: 1, startLat: 40.7128, startLng: -74.006, endLat: 51.5072, endLng: -0.1276, arcColor: "#a78bfa" },
          { order: 1, startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, arcColor: "#22d3ee" },
          { order: 2, startLat: -23.5505, startLng: -46.6333, endLat: 48.8566, endLng: 2.3522, arcColor: "#f472b6" },
          { order: 2, startLat: 19.076, startLng: 72.8777, endLat: 1.3521, endLng: 103.8198, arcColor: "#a78bfa" },
          { order: 3, startLat: 55.7558, startLng: 37.6173, endLat: 39.9042, endLng: 116.4074, arcColor: "#22d3ee" },
        ]}
      />
    </div>
  ),
}

export const examplesGitHubGlobe: Record<string, Example[]> = {
  "github-globe": [githubGlobeBasicExample, githubGlobeCustomExample],
}
