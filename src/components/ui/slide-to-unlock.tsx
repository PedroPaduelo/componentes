import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { slideToUnlockVariants } from "@/components/ui/slide-to-unlock-variants"

export type SlideToUnlockProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof slideToUnlockVariants> & {
    /** Callback fired when the user slides past the threshold. */
    onUnlock: () => void
    /** Text label displayed on the track. */
    label?: string
    /** Fraction of the track width that must be dragged to trigger unlock (0-1). */
    threshold?: number
    /** Whether the slider is disabled. */
    disabled?: boolean
    /** Width of the handle in pixels. */
    handleWidth?: number
  }

function SlideToUnlock({
  onUnlock,
  label = "slide to unlock",
  threshold = 0.85,
  disabled = false,
  className,
  variant,
  handleWidth = 56,
  ...hostProps
}: SlideToUnlockProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [x, setX] = React.useState(0)
  const [unlocked, setUnlocked] = React.useState(false)

  // Refs to avoid stale closures inside window-level mouse/touch listeners.
  // The state vars above are still needed to trigger re-renders.
  const draggingRef = React.useRef(false)
  const unlockedRef = React.useRef(false)

  // Latest x value, mirrored on every move so the up/end listeners read the
  // current position instead of a stale value captured at drag-start.
  const xRef = React.useRef(0)

  const dragStartX = React.useRef(0)
  const dragStartLeft = React.useRef(0)
  const maxX = React.useRef(0)

  const updateMaxX = React.useCallback(() => {
    if (trackRef.current) {
      maxX.current = trackRef.current.clientWidth - handleWidth
    }
  }, [handleWidth])

  React.useEffect(() => {
    updateMaxX()
    window.addEventListener("resize", updateMaxX)
    return () => window.removeEventListener("resize", updateMaxX)
  }, [updateMaxX])

  // Mouse/touch listeners are attached on drag-start and read state from refs
  // (not from React state) so the listeners never go stale. The closure only
  // captures the props/refs created at mount time, which is exactly what we want.
  const onMouseDown = (e: React.MouseEvent) => {
    if (disabled || unlockedRef.current) return
    e.preventDefault()
    draggingRef.current = true
    setDragging(true)
    dragStartX.current = e.clientX
    dragStartLeft.current = xRef.current

    const handleMove = (ev: MouseEvent) => {
      if (!draggingRef.current || disabled || unlockedRef.current) return
      const delta = ev.clientX - dragStartX.current
      const newX = Math.max(
        0,
        Math.min(maxX.current, dragStartLeft.current + delta),
      )
      xRef.current = newX
      setX(newX)
    }

    const handleUp = () => {
      const wasDragging = draggingRef.current
      if (!wasDragging || disabled || unlockedRef.current) {
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleUp)
        return
      }
      draggingRef.current = false
      setDragging(false)

      // Read latest x from the ref (state `x` would be one render stale here).
      const finalX = xRef.current
      const thresholdX = maxX.current * threshold
      if (finalX >= thresholdX) {
        xRef.current = maxX.current
        setX(maxX.current)
        unlockedRef.current = true
        setUnlocked(true)
        onUnlock()
      } else {
        xRef.current = 0
        setX(0)
      }

      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled || unlockedRef.current) return
    draggingRef.current = true
    setDragging(true)
    dragStartX.current = e.touches[0].clientX
    dragStartLeft.current = xRef.current

    const handleMove = (ev: TouchEvent) => {
      if (!draggingRef.current || disabled || unlockedRef.current) return
      ev.preventDefault()
      const delta = ev.touches[0].clientX - dragStartX.current
      const newX = Math.max(
        0,
        Math.min(maxX.current, dragStartLeft.current + delta),
      )
      xRef.current = newX
      setX(newX)
    }

    const handleEnd = () => {
      const wasDragging = draggingRef.current
      if (!wasDragging || disabled || unlockedRef.current) {
        window.removeEventListener("touchmove", handleMove)
        window.removeEventListener("touchend", handleEnd)
        return
      }
      draggingRef.current = false
      setDragging(false)

      const finalX = xRef.current
      const thresholdX = maxX.current * threshold
      if (finalX >= thresholdX) {
        xRef.current = maxX.current
        setX(maxX.current)
        unlockedRef.current = true
        setUnlocked(true)
        onUnlock()
      } else {
        xRef.current = 0
        setX(0)
      }

      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
    }

    window.addEventListener("touchmove", handleMove, { passive: false })
    window.addEventListener("touchend", handleEnd)
  }

  // Opacity of the label: fades as drag progresses
  const progress = maxX.current > 0 ? x / maxX.current : 0
  const labelOpacity = 1 - progress * 0.85

  const isDisabledOrUnlocked = disabled || unlocked

  return (
    <div
      data-slot="slide-to-unlock"
      className={cn(slideToUnlockVariants({ variant, className }))}
      {...hostProps}
    >
      <div
        ref={trackRef}
        data-slot="track"
        className="relative flex h-10 items-center justify-center"
      >
        {/* Label / text — split into individual letters with a shimmer wave */}
        <div
          data-slot="text"
          data-dragging={dragging}
          className="pl-1 text-lg font-medium select-none pointer-events-none"
          style={{
            marginLeft: handleWidth,
            opacity: labelOpacity,
          }}
        >
          <span
            className="inline-block"
            style={
              {
                "--slide-to-unlock-letter-color": "var(--muted-foreground)",
                "--slide-to-unlock-letter-highlight": "var(--foreground)",
              } as React.CSSProperties & Record<`--${string}`, string>
            }
            aria-label={label}
          >
            {Array.from(label).map((char, index) => (
              <span
                key={`${char}-${index}`}
                aria-hidden="true"
                className="slide-to-unlock-letter"
                style={
                  {
                    "--slide-to-unlock-letter-delay": `${index * 0.06}s`,
                  } as React.CSSProperties & Record<`--${string}`, string>
                }
              >
                {char}
              </span>
            ))}
          </span>
        </div>

        {/* Handle */}
        <div
          data-slot="handle"
          className={cn(
            "absolute top-0 left-0 flex h-10 cursor-grab items-center justify-center rounded-lg bg-white text-zinc-400 shadow-sm",
            "active:cursor-grabbing",
            isDisabledOrUnlocked && "cursor-default",
            variant === "success" &&
              "bg-linear-to-b from-emerald-500 to-emerald-700 text-white",
            variant === "destructive" &&
              "bg-linear-to-b from-red-500 to-red-700 text-white",
          )}
          style={{
            width: handleWidth,
            transform: `translateX(${x}px)`,
            transition: dragging
              ? "none"
              : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
            touchAction: "pan-y",
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="size-5"
          >
            <path d="M24 12 12.75 3v4.696H0v8.608h12.75V21z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export { SlideToUnlock }
