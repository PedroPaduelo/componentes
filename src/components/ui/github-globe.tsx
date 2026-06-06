import * as React from "react"
import * as THREE from "three"
import ThreeGlobe from "three-globe"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import { cn } from "@/lib/utils"
import type {
  GitHubGlobeProps,
  GlobeArc,
  GlobeConfig,
} from "@/components/ui/github-globe-types"
import { countries } from "@/components/ui/github-globe-data"

const DEFAULT_CONFIG: Required<GlobeConfig> = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#ffffff",
  atmosphereAltitude: 0.1,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.5,
  initialPositionLat: 22.3193,
  initialPositionLng: 114.1694,
}

const ARC_COLORS = ["#06b6d4", "#3b82f6", "#6366f1"]

const DEFAULT_ARCS: GlobeArc[] = [
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -22.9068, endLng: -43.1729, arcColor: ARC_COLORS[0] },
  { order: 1, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcColor: ARC_COLORS[1] },
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -1.303396, endLng: 36.852443, arcColor: ARC_COLORS[2] },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcColor: ARC_COLORS[0] },
  { order: 2, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcColor: ARC_COLORS[1] },
  { order: 2, startLat: -15.785493, startLng: -47.909029, endLat: 36.162809, endLng: -115.119411, arcColor: ARC_COLORS[2] },
  { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcColor: ARC_COLORS[0] },
  { order: 3, startLat: 21.3099, startLng: -157.8581, endLat: 40.7128, endLng: -74.006, arcColor: ARC_COLORS[1] },
  { order: 3, startLat: -6.2088, startLng: 106.8456, endLat: 51.5072, endLng: -0.1276, arcColor: ARC_COLORS[2] },
  { order: 4, startLat: 11.986597, startLng: 8.571831, endLat: -15.595412, endLng: -56.05918, arcColor: ARC_COLORS[0] },
  { order: 4, startLat: -34.6037, startLng: -58.3816, endLat: 22.3193, endLng: 114.1694, arcColor: ARC_COLORS[1] },
  { order: 4, startLat: 51.5072, startLng: -0.1276, endLat: 48.8566, endLng: -2.3522, arcColor: ARC_COLORS[2] },
  { order: 5, startLat: 14.5995, startLng: 120.9842, endLat: 51.5072, endLng: -0.1276, arcColor: ARC_COLORS[0] },
  { order: 5, startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, arcColor: ARC_COLORS[1] },
  { order: 5, startLat: 34.0522, startLng: -118.2437, endLat: 48.8566, endLng: -2.3522, arcColor: ARC_COLORS[2] },
  { order: 6, startLat: -15.432563, startLng: 28.315853, endLat: 1.094136, endLng: -63.34546, arcColor: ARC_COLORS[0] },
  { order: 6, startLat: 37.5665, startLng: 126.978, endLat: 35.6762, endLng: 139.6503, arcColor: ARC_COLORS[1] },
  { order: 6, startLat: 22.3193, startLng: 114.1694, endLat: 51.5072, endLng: -0.1276, arcColor: ARC_COLORS[2] },
  { order: 7, startLat: -19.885592, startLng: -43.951191, endLat: -15.595412, endLng: -56.05918, arcColor: ARC_COLORS[0] },
  { order: 7, startLat: 48.8566, startLng: -2.3522, endLat: 52.52, endLng: 13.405, arcColor: ARC_COLORS[1] },
  { order: 7, startLat: 52.52, startLng: 13.405, endLat: 34.0522, endLng: -118.2437, arcColor: ARC_COLORS[2] },
  { order: 8, startLat: -8.833221, startLng: 13.264837, endLat: -33.936138, endLng: 18.436529, arcColor: ARC_COLORS[0] },
  { order: 8, startLat: 49.2827, startLng: -123.1207, endLat: 52.3676, endLng: 4.9041, arcColor: ARC_COLORS[1] },
  { order: 8, startLat: 1.3521, startLng: 103.8198, endLat: 40.7128, endLng: -74.006, arcColor: ARC_COLORS[2] },
]

function numbersOfRings(arcs: GlobeArc[], maxRings: number): number[] {
  const newNumbersOfRings = Math.floor((arcs.length * 4) / 5)
  const selected: number[] = []
  for (let i = 0; i < Math.min(newNumbersOfRings, maxRings); i++) {
    const random = Math.round(Math.random() * (arcs.length - 1))
    if (!selected.includes(random)) {
      selected.push(random)
    }
  }
  return selected
}

function GitHubGlobe({ arcs, globeConfig, className, ...props }: GitHubGlobeProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const data = React.useMemo(() => arcs ?? DEFAULT_ARCS, [arcs])
  const config = React.useMemo<Required<GlobeConfig>>(
    () => ({ ...DEFAULT_CONFIG, ...globeConfig }),
    [globeConfig],
  )

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let width = container.clientWidth || 600
    let height = container.clientHeight || 600

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xffffff, 400, 2000)

    const camera = new THREE.PerspectiveCamera(50, width / height, 180, 1800)
    camera.position.z = 300

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Luzes
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(config.ambientLight),
      0.6,
    )
    scene.add(ambientLight)

    const dLight = new THREE.DirectionalLight(
      new THREE.Color(config.directionalLeftLight),
      1,
    )
    dLight.position.set(-400, 100, 400)
    scene.add(dLight)

    const dLight2 = new THREE.DirectionalLight(
      new THREE.Color(config.directionalTopLight),
      1,
    )
    dLight2.position.set(-200, 500, 200)
    scene.add(dLight2)

    const pLight = new THREE.PointLight(new THREE.Color(config.pointLight), 0.8)
    pLight.position.set(-200, 500, 200)
    scene.add(pLight)

    // Globo
    const globe = new ThreeGlobe()
    globe
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(config.showAtmosphere)
      .atmosphereColor(config.atmosphereColor)
      .atmosphereAltitude(config.atmosphereAltitude)
      .hexPolygonColor(() => config.polygonColor)

    const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial
    globeMaterial.color = new THREE.Color(config.globeColor)
    globeMaterial.emissive = new THREE.Color(config.emissive)
    globeMaterial.emissiveIntensity = config.emissiveIntensity
    globeMaterial.shininess = config.shininess

    // Arcos
    globe
      .arcsData(data)
      .arcStartLat((d) => (d as GlobeArc).startLat)
      .arcStartLng((d) => (d as GlobeArc).startLng)
      .arcEndLat((d) => (d as GlobeArc).endLat)
      .arcEndLng((d) => (d as GlobeArc).endLng)
      .arcColor((d: object) => (d as GlobeArc).arcColor)
      .arcAltitude((d) => (d as GlobeArc).order * 0.05 + 0.1)
      .arcStroke(() => 0.4)
      .arcDashLength(config.arcLength)
      .arcDashInitialGap((d) => (d as GlobeArc).order * 1)
      .arcDashGap(15)
      .arcDashAnimateTime(() => config.arcTime)

    // Pontos (endpoints dos arcos)
    const points = data.flatMap((arc) => [
      { lat: arc.startLat, lng: arc.startLng, color: arc.arcColor },
      { lat: arc.endLat, lng: arc.endLng, color: arc.arcColor },
    ])
    globe
      .pointsData(points)
      .pointColor((d) => (d as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(config.pointSize / 4)

    // Rings
    globe
      .ringsData([])
      .ringColor(() => (t: number) => `rgba(255,255,255,${1 - t})`)
      .ringMaxRadius(config.maxRings)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod((config.arcTime * config.arcLength) / config.rings)

    scene.add(globe)

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enablePan = false
    controls.enableZoom = false
    controls.minPolarAngle = Math.PI / 3.5
    controls.maxPolarAngle = Math.PI - Math.PI / 3
    controls.autoRotate = config.autoRotate
    controls.autoRotateSpeed = config.autoRotateSpeed

    // Posição inicial (rotaciona o globo para o foco)
    const phi = (90 - config.initialPositionLat) * (Math.PI / 180)
    const theta = (config.initialPositionLng + 180) * (Math.PI / 180)
    globe.rotation.y = -theta + Math.PI / 2
    globe.rotation.x = phi - Math.PI / 2

    // Animação de rings periódica
    const ringsInterval = window.setInterval(() => {
      if (!data.length) return
      const indexes = numbersOfRings(data, config.maxRings)
      const ringData = data
        .filter((_, i) => indexes.includes(i))
        .map((arc) => ({
          lat: arc.startLat,
          lng: arc.startLng,
          color: arc.arcColor,
        }))
      globe.ringsData(ringData)
    }, 2000)

    let frameId = 0
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      width = container.clientWidth || width
      height = container.clientHeight || height
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frameId)
      window.clearInterval(ringsInterval)
      resizeObserver.disconnect()
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose()
          const material = object.material
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose())
          } else {
            material?.dispose()
          }
        }
      })
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [data, config])

  return (
    <div
      data-slot="github-globe"
      className={cn(
        "relative flex h-[28rem] w-full items-center justify-center overflow-hidden rounded-2xl bg-black",
        className,
      )}
      {...props}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 mx-auto h-full w-full max-w-full"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black to-transparent" />
    </div>
  )
}

export { GitHubGlobe }
