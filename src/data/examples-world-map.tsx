import { WorldMap } from "@/components/ui/world-map"
import type { Example } from "@/data/examples"

const worldMapConnections: Example = {
  title: "Conexões globais",
  description:
    "Mapa-múndi pontilhado (SVG gerado por dotted-map) com arcos que se desenham (pathLength animado por motion) ligando cidades, e pontos pulsantes nas pontas. Passe os pares origem→destino via prop dots.",
  code: `<WorldMap
  dots={[
    {
      start: { lat: 40.7128, lng: -74.006, label: "Nova York" },
      end: { lat: 51.5074, lng: -0.1278, label: "Londres" },
    },
    {
      start: { lat: 51.5074, lng: -0.1278, label: "Londres" },
      end: { lat: 35.6762, lng: 139.6503, label: "Tóquio" },
    },
    {
      start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
      end: { lat: 40.7128, lng: -74.006, label: "Nova York" },
    },
    {
      start: { lat: 1.3521, lng: 103.8198, label: "Singapura" },
      end: { lat: -33.8688, lng: 151.2093, label: "Sydney" },
    },
  ]}
/>`,
  render: (
    <div className="w-full">
      <WorldMap
        dots={[
          {
            start: { lat: 40.7128, lng: -74.006, label: "Nova York" },
            end: { lat: 51.5074, lng: -0.1278, label: "Londres" },
          },
          {
            start: { lat: 51.5074, lng: -0.1278, label: "Londres" },
            end: { lat: 35.6762, lng: 139.6503, label: "Tóquio" },
          },
          {
            start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
            end: { lat: 40.7128, lng: -74.006, label: "Nova York" },
          },
          {
            start: { lat: 1.3521, lng: 103.8198, label: "Singapura" },
            end: { lat: -33.8688, lng: 151.2093, label: "Sydney" },
          },
        ]}
      />
    </div>
  ),
}

const worldMapHubAndColor: Example = {
  title: "Hub central e cor customizada",
  description:
    "Vários destinos partindo de um único hub (São Paulo), com a cor das linhas e dos pontos trocada via prop lineColor (aqui um verde esmeralda).",
  code: `<WorldMap
  lineColor="#10b981"
  dots={[
    {
      start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
      end: { lat: 40.7128, lng: -74.006, label: "Nova York" },
    },
    {
      start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
      end: { lat: 48.8566, lng: 2.3522, label: "Paris" },
    },
    {
      start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
      end: { lat: -33.8688, lng: 151.2093, label: "Sydney" },
    },
  ]}
/>`,
  render: (
    <div className="w-full">
      <WorldMap
        lineColor="#10b981"
        dots={[
          {
            start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
            end: { lat: 40.7128, lng: -74.006, label: "Nova York" },
          },
          {
            start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
            end: { lat: 48.8566, lng: 2.3522, label: "Paris" },
          },
          {
            start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
            end: { lat: -33.8688, lng: 151.2093, label: "Sydney" },
          },
        ]}
      />
    </div>
  ),
}

export const examplesWorldMap: Record<string, Example[]> = {
  "world-map": [worldMapConnections, worldMapHubAndColor],
}
