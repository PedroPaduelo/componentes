import * as React from "react"

/** Um arco animado entre dois pontos da superfície do globo. */
export interface GlobeArc {
  order: number
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  /** Cor do arco (hex ou rgb). */
  arcColor: string
}

/** Configuração visual do globo (cores, atmosfera, opacidade). */
export interface GlobeConfig {
  pointSize?: number
  globeColor?: string
  showAtmosphere?: boolean
  atmosphereColor?: string
  atmosphereAltitude?: number
  emissive?: string
  emissiveIntensity?: number
  shininess?: number
  polygonColor?: string
  ambientLight?: string
  directionalLeftLight?: string
  directionalTopLight?: string
  pointLight?: string
  arcTime?: number
  arcLength?: number
  rings?: number
  maxRings?: number
  /** Habilita rotação automática. */
  autoRotate?: boolean
  autoRotateSpeed?: number
  /** Latitude/longitude inicial da câmera (foco). */
  initialPositionLat?: number
  initialPositionLng?: number
}

export type GitHubGlobeProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de arcos a animar. Se omitido, usa um conjunto demonstrativo. */
  arcs?: GlobeArc[]
  /** Sobrescreve a configuração visual do globo. */
  globeConfig?: GlobeConfig
}
