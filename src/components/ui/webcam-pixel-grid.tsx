import * as React from "react"
import { cn } from "@/lib/utils"
import type { WebcamPixelGridProps, WebcamPixelColorMode } from "./webcam-pixel-grid-types"

function WebcamPixelGrid({
  gridCols = 16,
  gridRows = 16,
  maxElevation = 30,
  motionSensitivity = 0.5,
  elevationSmoothing = 0.15,
  colorMode = "webcam",
  monochromeColor = "#06b6d4",
  backgroundColor = "#000000",
  mirror = true,
  gapRatio = 0.15,
  borderColor = "#ffffff",
  borderOpacity = 0.05,
  forceFallback = false,
  onWebcamError,
  onWebcamReady,
  className,
  ...hostProps
}: WebcamPixelGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const animFrameRef = React.useRef<number>(0)
  const prevFrameRef = React.useRef<Uint8ClampedArray | null>(null)
  const [webcamActive, setWebcamActive] = React.useState(false)
  const [webcamFailed, setWebcamFailed] = React.useState(false)

  // Tentar webcam
  React.useEffect(() => {
    if (forceFallback) {
      setWebcamFailed(true)
      return
    }
    let cancelled = false
    let stream: MediaStream | null = null

    async function startWebcam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setWebcamActive(true)
          onWebcamReady?.()
        }
      } catch (err) {
        if (!cancelled) {
          setWebcamFailed(true)
          onWebcamError?.(err instanceof Error ? err : new Error(String(err)))
        }
      }
    }

    startWebcam()
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [forceFallback, onWebcamError, onWebcamReady])

  // Loop de render
  React.useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    let running = true

    function render() {
      if (!running) return

      const w = canvas!.width
      const h = canvas!.height
      ctx!.clearRect(0, 0, w, h)

      const cellW = w / gridCols
      const cellH = h / gridRows
      const gap = Math.min(cellW, cellH) * gapRatio

      if (webcamActive && video && video.readyState >= 2) {
        // Capturar frame da webcam
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = gridCols
        tempCanvas.height = gridRows
        const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true })
        if (tempCtx) {
          if (mirror) {
            tempCtx.translate(gridCols, 0)
            tempCtx.scale(-1, 1)
          }
          tempCtx.drawImage(video, 0, 0, gridCols, gridRows)
          const frame = tempCtx.getImageData(0, 0, gridCols, gridRows).data

          // Calcular movimento
          const prev = prevFrameRef.current
          const hasPrev = prev && prev.length === frame.length

          for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
              const i = (row * gridCols + col) * 4
              const r = frame[i]
              const g = frame[i + 1]
              const b = frame[i + 2]

              let elevation = 0
              if (hasPrev) {
                const dr = Math.abs(r - prev![i])
                const dg = Math.abs(g - prev![i + 1])
                const db = Math.abs(b - prev![i + 2])
                const diff = (dr + dg + db) / 3
                if (diff > motionSensitivity * 255) {
                  elevation = (diff / 255) * maxElevation
                }
              }

              const x = col * cellW + gap / 2
              const y = row * cellH + gap / 2
              const cw = cellW - gap
              const ch = cellH - gap

              if (colorMode === "monochrome") {
                const mr = parseInt(monochromeColor.slice(1, 3), 16)
                const mg = parseInt(monochromeColor.slice(3, 5), 16)
                const mb = parseInt(monochromeColor.slice(5, 7), 16)
                const brightness = (r + g + b) / (3 * 255)
                ctx!.fillStyle = `rgb(${Math.round(mr * brightness)},${Math.round(mg * brightness)},${Math.round(mb * brightness)})`
              } else {
                ctx!.fillStyle = `rgb(${r},${g},${b})`
              }

              ctx!.globalAlpha = 1
              ctx!.fillRect(x, y - elevation, cw, ch)

              if (borderOpacity > 0) {
                ctx!.strokeStyle = borderColor
                ctx!.globalAlpha = borderOpacity
                ctx!.lineWidth = 0.5
                ctx!.strokeRect(x, y - elevation, cw, ch)
              }
            }
          }

          prevFrameRef.current = new Uint8ClampedArray(frame)
        }
      } else {
        // Fallback: gradiente animado
        const time = Date.now() / 1000
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            const x = col * cellW + gap / 2
            const y = row * cellH + gap / 2
            const cw = cellW - gap
            const ch = cellH - gap

            const wave = Math.sin(time + col * 0.3 + row * 0.2) * 0.5 + 0.5
            const elevation = wave * maxElevation * 0.5

            const hue = (col / gridCols) * 60 + 180 + time * 10
            const sat = 70 + wave * 30
            const light = 30 + wave * 30

            ctx!.fillStyle = `hsl(${hue % 360},${sat}%,${light}%)`
            ctx!.globalAlpha = 1
            ctx!.fillRect(x, y - elevation, cw, ch)

            if (borderOpacity > 0) {
              ctx!.strokeStyle = borderColor
              ctx!.globalAlpha = borderOpacity
              ctx!.lineWidth = 0.5
              ctx!.strokeRect(x, y - elevation, cw, ch)
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()
    return () => {
      running = false
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [webcamActive, webcamFailed, gridCols, gridRows, maxElevation, motionSensitivity, colorMode, monochromeColor, mirror, gapRatio, borderColor, borderOpacity])

  return (
    <div
      data-slot="webcam-pixel-grid"
      className={cn("relative overflow-hidden", className)}
      {...hostProps}
    >
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="h-full w-full"
        style={{ backgroundColor }}
      />
    </div>
  )
}

export { WebcamPixelGrid }
