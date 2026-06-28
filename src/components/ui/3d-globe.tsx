import * as React from "react"
import createGlobe, { type COBEOptions } from "cobe"

import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"

type RGB = [number, number, number]

export type ThreeDGlobeMarker = {
  /** Geographic coordinate as `[latitude, longitude]` in degrees. */
  location: [number, number]
  /** Marker dot size relative to the globe (e.g. `0.05`). */
  size: number
}

export type ThreeDGlobeProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Markers plotted on the surface (`[lat, lng]` in degrees + size). */
  markers?: ThreeDGlobeMarker[]
  /** Base globe color as RGB in the `0..1` range. Overrides the theme default. */
  baseColor?: RGB
  /** Marker color as RGB in the `0..1` range. Overrides the theme default. */
  markerColor?: RGB
  /** Glow/atmosphere color as RGB in the `0..1` range. Overrides the theme default. */
  glowColor?: RGB
  /** Auto-rotation speed (radians per frame). Set `0` to disable. */
  rotationSpeed?: number
}

const DEFAULT_MARKERS: ThreeDGlobeMarker[] = [
  { location: [37.78, -122.41], size: 0.06 }, // San Francisco
  { location: [40.71, -74.0], size: 0.08 }, // New York
  { location: [51.51, -0.13], size: 0.05 }, // London
  { location: [48.85, 2.35], size: 0.05 }, // Paris
  { location: [-23.55, -46.63], size: 0.07 }, // São Paulo
  { location: [35.68, 139.69], size: 0.06 }, // Tokyo
  { location: [1.35, 103.82], size: 0.05 }, // Singapore
  { location: [-33.87, 151.21], size: 0.05 }, // Sydney
  { location: [55.75, 37.62], size: 0.05 }, // Moscow
  { location: [28.61, 77.21], size: 0.06 }, // New Delhi
]

// Paletas por tema: o globo acompanha o light/dark do app. Se o consumidor
// passar `baseColor`/`markerColor`/`glowColor`, o valor dele tem prioridade.
const DARK_BASE_COLOR: RGB = [0.25, 0.25, 0.32]
const DARK_MARKER_COLOR: RGB = [0.4, 0.85, 1]
const DARK_GLOW_COLOR: RGB = [0.16, 0.18, 0.26]
const LIGHT_BASE_COLOR: RGB = [0.92, 0.92, 0.96]
const LIGHT_MARKER_COLOR: RGB = [0.13, 0.5, 0.92]
const LIGHT_GLOW_COLOR: RGB = [0.86, 0.89, 0.96]
const DEFAULT_ROTATION_SPEED = 0.004

function ThreeDGlobe({
  markers = DEFAULT_MARKERS,
  baseColor,
  markerColor,
  glowColor,
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  className,
  ...props
}: ThreeDGlobeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const phiRef = React.useRef(0)
  const [unsupported, setUnsupported] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== "light"
  // Cor explícita do consumidor vence; senão segue o tema do app.
  const resolvedBase = baseColor ?? (isDark ? DARK_BASE_COLOR : LIGHT_BASE_COLOR)
  const resolvedMarker =
    markerColor ?? (isDark ? DARK_MARKER_COLOR : LIGHT_MARKER_COLOR)
  const resolvedGlow = glowColor ?? (isDark ? DARK_GLOW_COLOR : LIGHT_GLOW_COLOR)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let width = 0
    let frameId = 0
    let globe: ReturnType<typeof createGlobe> | null = null
    // Flag de segurança contra race entre StrictMode (mount → cleanup →
    // mount) e o rAF do render loop: se um render agendado na primeira
    // montagem escapar do cancelAnimationFrame (porque já estava em
    // processamento), ele não deve chamar `globe.update()` em um globe
    // que já foi destruído no cleanup — daí o INVALID_OPERATION.
    let destroyed = false

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width || canvas.offsetWidth
    }
    measure()

    if (width === 0) {
      const rafId = requestAnimationFrame(() => {
        if (destroyed) return
        measure()
        init()
      })
      return () => {
        destroyed = true
        cancelAnimationFrame(rafId)
      }
    }

    function init() {
      if (!canvas || destroyed) return
      if (globe) return
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || canvas.offsetWidth
      if (w === 0) return

      const options: COBEOptions = {
        devicePixelRatio: 2,
        width: w * 2,
        height: w * 2,
        phi: 0,
        theta: 0.3,
        dark: isDark ? 1 : 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: isDark ? 6 : 8,
        baseColor: resolvedBase,
        markerColor: resolvedMarker,
        glowColor: resolvedGlow,
        markers: markers.map((m) => ({ location: m.location, size: m.size })),
      }

      try {
        globe = createGlobe(canvas, options)
      } catch {
        setUnsupported(true)
        return
      }

      width = w
      const render = () => {
        if (destroyed || !globe) return
        phiRef.current += rotationSpeed
        globe.update({
          phi: phiRef.current,
          width: width * 2,
          height: width * 2,
        })
        canvas.style.opacity = "1"
        frameId = requestAnimationFrame(render)
      }
      frameId = requestAnimationFrame(render)
    }

    init()

    const resizeObserver = new ResizeObserver(() => {
      if (destroyed) return
      const rect = canvas.getBoundingClientRect()
      const newWidth = rect.width || canvas.offsetWidth
      if (newWidth > 0 && newWidth !== width) {
        width = newWidth
        if (globe) {
          globe.update({ width: width * 2, height: width * 2 })
        }
      }
    })
    resizeObserver.observe(canvas)

    return () => {
      destroyed = true
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      if (globe) {
        globe.destroy()
        globe = null
      }
    }
  }, [markers, resolvedBase, resolvedMarker, resolvedGlow, isDark, rotationSpeed])

  return (
    <div
      data-slot="3d-globe"
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[600px]",
        className
      )}
      {...props}
    >
      {unsupported ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-6 text-center">
          <p className="text-sm font-medium text-foreground/80">
            Visualização 3D indisponível
          </p>
          <p className="text-xs text-muted-foreground">
            Seu navegador não suporta WebGL.
          </p>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{
            contain: "layout paint size",
            opacity: 0,
            transition: "opacity 1s ease",
          }}
        />
      )}
    </div>
  )
}

export { ThreeDGlobe }
