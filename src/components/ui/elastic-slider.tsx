import * as React from "react"
import { cn } from "@/lib/utils"
import { sliderVariants } from "@/components/ui/elastic-slider-variants"

export type SliderDensity = "compact" | "default" | "relaxed"

export interface ElasticSliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Controlled value. When provided, the slider is controlled. */
  value?: number
  /** Default value (uncontrolled mode). Ignored if `value` is provided. */
  defaultValue?: number
  /** Minimum value. Default: 0. */
  min?: number
  /** Maximum value. Default: 1. */
  max?: number
  /** Step increment. Default: 0.01. */
  step?: number
  /** Called when value changes. */
  onValueChange?: (value: number) => void
  /** Elasticity of the rubber-band effect. Default: "medium". */
  elasticity?: "low" | "medium" | "high"
  /** Label shown on the left side of the track. */
  label?: string
  /** Formats the displayed value. */
  formatValue?: (value: number) => string
  /** Accessible label for the slider track (defaults to `label`). */
  "aria-label"?: string
  /** Density of the slider. */
  density?: "compact" | "default" | "relaxed"
  /** Visual variant. */
  variant?: "default" | "ghost"
}

const ELASTICITY_FACTOR: Record<string, number> = {
  low: 0.3,
  medium: 0.5,
  high: 0.8,
}

function ElasticSlider({
  value: controlledValue,
  defaultValue = 0.5,
  min = 0,
  max = 1,
  step = 0.01,
  onValueChange,
  elasticity = "medium",
  label,
  formatValue,
  density,
  variant,
  className,
  ...hostProps
}: ElasticSliderProps) {
  const isControlled = controlledValue !== undefined

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = React.useState(() => {
    const initial = isControlled ? controlledValue : defaultValue
    return clamp(initial, min, max)
  })

  // Use controlled or internal value
  const currentValue = isControlled ? clamp(controlledValue, min, max) : internalValue

  // Drag state
  const [isDragging, setIsDragging] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  // Elastic stretch (rubber-band effect when dragging past bounds)
  const [elasticStretch, setElasticStretch] = React.useState(0)

  const trackRef = React.useRef<HTMLDivElement>(null)
  const startXRef = React.useRef(0)
  const startValueRef = React.useRef(0)

  const active = isDragging || isFocused || isHovered

  // Compute value from pointer position
  function valueFromPointer(clientX: number): number {
    const track = trackRef.current
    if (!track) return currentValue

    const rect = track.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    const raw = min + ratio * (max - min)
    const stepped = Math.round(raw / step) * step
    return clamp(stepped, min, max)
  }

  // Elastic offset when dragging past bounds
  function computeElasticOffset(clientX: number): { value: number; stretch: number } {
    const track = trackRef.current
    if (!track) return { value: currentValue, stretch: 0 }

    const rect = track.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    const factor = ELASTICITY_FACTOR[elasticity] ?? 0.5

    if (ratio < 0) {
      const overshoot = -ratio
      const stretch = -overshoot * 30 * factor // px offset for visual stretch
      return { value: min, stretch }
    }
    if (ratio > 1) {
      const overshoot = ratio - 1
      const stretch = overshoot * 30 * factor
      return { value: max, stretch }
    }
    return { value: valueFromPointer(clientX), stretch: 0 }
  }

  function setValue(v: number) {
    const clamped = clamp(v, min, max)
    if (!isControlled) {
      setInternalValue(clamped)
    }
    onValueChange?.(clamped)
  }

  // Pointer handlers
  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setIsDragging(true)
    startXRef.current = e.clientX
    startValueRef.current = currentValue
    setElasticStretch(0)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    const { value, stretch } = computeElasticOffset(e.clientX)
    setValue(value)
    setElasticStretch(stretch)
  }

  function handlePointerUp() {
    if (!isDragging) return
    setIsDragging(false)
    // Reset elastic stretch — the CSS transition creates the bounce-back
    setElasticStretch(0)
  }

  // Keyboard
  function handleKeyDown(e: React.KeyboardEvent) {
    const shift = e.shiftKey ? 10 : 1
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault()
        setValue(currentValue + step * shift)
        break
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault()
        setValue(currentValue - step * shift)
        break
      case "Home":
        e.preventDefault()
        setValue(min)
        break
      case "End":
        e.preventDefault()
        setValue(max)
        break
    }
  }

  // Display value
  const displayValue = formatValue
    ? formatValue(currentValue)
    : currentValue.toFixed(2)

  // Fill percentage
  const fillPercent = ((currentValue - min) / (max - min)) * 100

  // Track transform for elastic stretch
  const trackStyle = isDragging
    ? {
        width: `calc(100% + ${Math.abs(elasticStretch)}px)`,
        transform: `translateX(${elasticStretch < 0 ? elasticStretch : 0}px)`,
        transition: isDragging
          ? "none"
          : "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }
    : undefined

  // Hash marks (10 deciles)
  const hashMarks = Array.from({ length: 9 }, (_, i) => (i + 1) * 10)

  // Respect prefers-reduced-motion
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const bounceTransition = prefersReducedMotion
    ? "width 0.15s ease-out, transform 0.15s ease-out"
    : "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"

  return (
    <div
      data-slot="elastic-slider"
      data-active={active || undefined}
      data-focus-visible={isFocused || undefined}
      className={cn(sliderVariants({ density, variant }), className)}
      {...hostProps}
    >
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label ?? hostProps["aria-label"]}
        aria-orientation="horizontal"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        aria-valuetext={displayValue}
        className="group/elastic-slider absolute inset-0 cursor-pointer touch-none overflow-hidden rounded-[var(--elastic-slider-radius)] bg-[var(--elastic-slider-bg)] outline-none select-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-ring/50 data-[focus-visible=true]:ring-offset-1 data-[focus-visible=true]:ring-offset-background"
        style={trackStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (isDragging) {
            setIsDragging(false)
            setElasticStretch(0)
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
      >
        {/* Hash marks */}
        <div
          data-slot="elastic-slider-hash-marks"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {hashMarks.map((pct) => (
            <div
              key={pct}
              className="absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200 bg-transparent group-data-[active=true]/elastic-slider:bg-[var(--elastic-slider-hash)]"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>

        {/* Fill */}
        <div
          data-slot="elastic-slider-fill"
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 transition-colors bg-[var(--elastic-slider-fill)] group-data-[active=true]/elastic-slider:bg-[var(--elastic-slider-fill-active)]"
          style={{
            width: `${fillPercent}%`,
            transition: isDragging ? "none" : bounceTransition,
          }}
        />

        {/* Handle */}
        <div
          data-slot="elastic-slider-handle"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-5 w-px rounded-full bg-[var(--elastic-slider-handle)]"
          style={{
            left: `max(4px, calc(${fillPercent}% - 8px))`,
            transform: "translateY(-50%)",
            transition: isDragging ? "none" : bounceTransition,
          }}
        />

        {/* Label */}
        {label && (
          <span
            data-slot="elastic-slider-label"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 inline-flex -translate-y-1/2 items-center text-sm/none font-medium text-[var(--elastic-slider-label)] transition-colors"
          >
            {label}
          </span>
        )}

        {/* Value */}
        <span
          data-slot="elastic-slider-value"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-sm/none font-medium transition-colors text-[var(--elastic-slider-label)] group-data-[active=true]/elastic-slider:text-[var(--elastic-slider-focus)]"
        >
          {displayValue}
        </span>
      </div>
    </div>
  )
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

export { ElasticSlider }
