import * as React from "react"
import {
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

export type MovingBorderProps = {
  children: React.ReactNode
  duration?: number
  rx?: string
  ry?: string
  svgProps?: React.SVGAttributes<SVGSVGElement>
}

function MovingBorder({
  children,
  duration = 3000,
  rx,
  ry,
  svgProps,
}: MovingBorderProps) {
  const pathRef = React.useRef<SVGRectElement>(null)
  const progress = useMotionValue<number>(0)

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength()
    if (length) {
      const pxPerMillisecond = length / duration
      progress.set((time * pxPerMillisecond) % length)
    }
  })

  const x = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val)
    return point?.x ?? 0
  })
  const y = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val)
    return point?.y ?? 0
  })

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...svgProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform: transform as unknown as string,
        }}
      >
        {children}
      </div>
    </>
  )
}

export type MovingBorderButtonProps = {
  children: React.ReactNode
  borderRadius?: string
  containerClassName?: string
  borderClassName?: string
  duration?: number
  className?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  "aria-label"?: string
}

function MovingBorderButton({
  borderRadius = "1.75rem",
  children,
  containerClassName,
  borderClassName,
  duration,
  className,
  style,
  onClick,
  type,
  disabled,
  "aria-label": ariaLabel,
}: MovingBorderButtonProps) {
  return (
    <button
      data-slot="moving-border"
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "relative h-16 w-40 overflow-hidden bg-transparent p-[1px] text-xl",
        containerClassName,
      )}
      style={{ borderRadius, ...style }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 bg-[radial-gradient(#0ea5e9_40%,transparent_60%)] opacity-[0.8]",
              borderClassName,
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.8] text-sm text-white antialiased backdrop-blur-xl",
          className,
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </button>
  )
}

export { MovingBorder, MovingBorderButton }
