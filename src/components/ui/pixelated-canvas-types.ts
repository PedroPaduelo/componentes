export type PixelatedCanvasShape = "circle" | "square"

export type PixelatedCanvasDistortionMode = "repel" | "attract" | "swirl"

export type PixelatedCanvasObjectFit = "cover" | "contain" | "fill" | "none"

export type PixelatedCanvasProps = {
  src: string
  width?: number
  height?: number
  /** Size of each cell (in CSS pixels) used for sampling and spacing. */
  cellSize?: number
  /** Dot size as a fraction of cell size (0..1). */
  dotScale?: number
  /** Shape of the dot drawn for each sample. */
  shape?: PixelatedCanvasShape
  /** Optional background color to clear the canvas with before drawing. */
  backgroundColor?: string
  /** Convert to grayscale before drawing. */
  grayscale?: boolean
  className?: string
  /** Redraw on window resize using the provided width/height. */
  responsive?: boolean
  /** 0..1. Higher value removes more dots in low-contrast regions. */
  dropoutStrength?: number
  /** Enable interactive mouse distortion animation. */
  interactive?: boolean
  /** Max per-dot offset (px) due to distortion. */
  distortionStrength?: number
  /** Radius (px) around pointer influencing distortion. */
  distortionRadius?: number
  /** How pixels move near the pointer. */
  distortionMode?: PixelatedCanvasDistortionMode
  /** 0..1 smoothing factor for pointer follow. */
  followSpeed?: number
  /** Average multiple samples per cell instead of single center sample. */
  sampleAverage?: boolean
  /** Apply a color tint (e.g., "#0ea5e9" or "rgb(14,165,233)"). */
  tintColor?: string
  /** 0..1 tint mix amount with original colors. */
  tintStrength?: number
  /** Cap animation frame rate to improve perf on large canvases. */
  maxFps?: number
  /** Object-fit behavior for the source image within the canvas. */
  objectFit?: PixelatedCanvasObjectFit
  /** Random motion amplitude for dots near the pointer. */
  jitterStrength?: number
  /** Speed factor for the random motion. */
  jitterSpeed?: number
  /** Smoothly fade the distortion when the pointer leaves. */
  fadeOnLeave?: boolean
  /** 0..1 smoothing factor for leave fade. Higher = faster fade. */
  fadeSpeed?: number
}

export type PixelatedCanvasSample = {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
  drop: boolean
  seed: number
}
