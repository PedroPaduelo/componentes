export interface WorldMapLocation {
  lat: number
  lng: number
  label?: string
}

export interface WorldMapDot {
  start: WorldMapLocation
  end: WorldMapLocation
}

export type WorldMapProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Pares de coordenadas (origem → destino) que desenham os arcos animados. */
  dots?: WorldMapDot[]
  /** Cor das linhas/arcos e dos pontos pulsantes. */
  lineColor?: string
}
