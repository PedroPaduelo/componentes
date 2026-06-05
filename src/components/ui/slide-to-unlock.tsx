import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { slideToUnlockVariants } from "@/components/ui/slide-to-unlock-variants"
import { ChevronRight } from "lucide-react"

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

  const handleDragStart = React.useCallback(
    (clientX: number) => {
      if (disabled || unlocked) return
      setDragging(true)
      dragStartX.current = clientX
      dragStartLeft.current = x
    },
    [disabled, unlocked, x]
  )

  const handleDragMove = React.useCallback(
    (clientX: number) => {
      if (!dragging || disabled || unlocked) return
      const delta = clientX - dragStartX.current
      const newX = Math.max(0, Math.min(maxX.current, dragStartLeft.current + delta))
      setX(newX)
    },
    [dragging, disabled, unlocked]
  )

  const handleDragEnd = React.useCallback(() => {
    if (!dragging || disabled || unlocked) return
    setDragging(false)

    const thresholdX = maxX.current * threshold
    if (x >= thresholdX) {
      // Animate to end
      setX(maxX.current)
      setUnlocked(true)
      onUnlock()
    } else {
      // Bounce back with elastic easing
      setX(0)
    }
  }, [dragging, disabled, unlocked, x, threshold, onUnlock])

  // Mouse events
  const onMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleDragStart(e.clientX)

      const onMouseMove = (ev: MouseEvent) => handleDragMove(ev.clientX)
      const onMouseUp = () => {
        handleDragEnd()
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
      }
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    },
    [handleDragStart, handleDragMove, handleDragEnd]
  )

  // Touch events
  const onTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX)

      const onTouchMove = (ev: TouchEvent) => {
        ev.preventDefault()
        handleDragMove(ev.touches[0].clientX)
      }
      const onTouchEnd = () => {
        handleDragEnd()
        window.removeEventListener("touchmove", onTouchMove)
        window.removeEventListener("touchend", onTouchEnd)
      }
      window.addEventListener("touchmove", onTouchMove, { passive: false })
      window.addEventListener("touchend", onTouchEnd)
    },
    [handleDragStart, handleDragMove, handleDragEnd]
  )

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
        {/* Label / text */}
        <div
          data-slot="text"
          data-dragging={dragging}
          className="pl-1 text-lg font-medium select-none pointer-events-none"
          style={{
            marginLeft: handleWidth,
            opacity: labelOpacity,
          }}
        >
          <span className="inline-block whitespace-pre text-muted-foreground">
            {label}
          </span>
        </div>

        {/* Handle */}
        <div
          data-slot="handle"
          className={cn(
            "absolute top-0 left-0 flex h-10 cursor-grab items-center justify-center rounded-lg bg-white text-zinc-400 shadow-sm",
            "active:cursor-grabbing [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
            isDisabledOrUnlocked && "cursor-default",
            variant === "success" &&
              "bg-linear-to-b from-emerald-500 to-emerald-700 text-white",
            variant === "destructive" &&
              "bg-linear-to-b from-red-500 to-red-700 text-white"
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
          <ChevronRight className="size-5" />
        </div>
      </div>
    </div>
  )
}

export { SlideToUnlock }
