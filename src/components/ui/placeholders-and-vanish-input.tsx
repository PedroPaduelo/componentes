import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  type VanishPixel,
  PLACEHOLDERS_DEFAULT_INTERVAL_MS,
  VANISH_CANVAS_SIZE,
  VANISH_PIXEL_SIZE,
  VANISH_PIXEL_STEP,
  type PlaceholdersAndVanishInputProps,
} from "./placeholders-and-vanish-input-types"

/**
 * Input com placeholders rotativos e efeito de "vanish" — as letras
 * digitadas são pintadas em um canvas e apagadas progressivamente
 * em pixel-columns da direita para a esquerda ao submit.
 *
 * Inspirado no `PlaceholdersAndVanishInput` do Aceternity UI.
 * Adaptações zero-dívida aplicadas:
 *  - Removido `"use client"` (Vite, não Next).
 *  - Imports consolidados; `motion/react` (motion v12).
 *  - `useRef<VanishPixel[]>([])` (sem `any`).
 *  - Cor do "ink" lida via `getComputedStyle` para reagir ao tema
 *    (light: `oklch(0.145 0 0)` ≈ `text-zinc-900`; dark: `oklch(0.985 0 0)` ≈ `text-zinc-50`),
 *    substituindo o `#FFF` hardcoded do original (que ficava
 *    invisível em light mode).
 *  - Tokens shadcn para o wrapper (`bg-background`, `text-foreground`,
 *    `border-input`, `bg-muted`) — sem cores hardcoded no chrome.
 *  - `data-slot="placeholders-and-vanish-input"` no form raiz.
 */
function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  placeholderIntervalMs = PLACEHOLDERS_DEFAULT_INTERVAL_MS,
  defaultValue = "",
  className,
  ...hostProps
}: PlaceholdersAndVanishInputProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [value, setValue] = useState(defaultValue)
  const [animating, setAnimating] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const newDataRef = useRef<VanishPixel[]>([])

  const startAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, placeholderIntervalMs)
  }, [placeholders.length, placeholderIntervalMs])

  const handleVisibilityChange = useCallback(() => {
    if (
      typeof document !== "undefined" &&
      document.visibilityState !== "visible" &&
      intervalRef.current
    ) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    } else if (
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
    ) {
      startAnimation()
    }
  }, [startAnimation])

  useEffect(() => {
    startAnimation()
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }
  }, [startAnimation, handleVisibilityChange])

  const draw = useCallback(() => {
    if (!inputRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = VANISH_CANVAS_SIZE
    canvas.height = VANISH_CANVAS_SIZE
    ctx.clearRect(0, 0, VANISH_CANVAS_SIZE, VANISH_CANVAS_SIZE)

    const computedStyles = getComputedStyle(inputRef.current)
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"))
    // Cor do "ink" reativa ao tema: usa a `color` herdada do input,
    // que por sua vez vem de `text-foreground` no shadcn.
    const inkColor = computedStyles.color || "#000"

    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`
    ctx.fillStyle = inkColor
    ctx.fillText(value, 16, 40)

    const imageData = ctx.getImageData(
      0,
      0,
      VANISH_CANVAS_SIZE,
      VANISH_CANVAS_SIZE,
    )
    const pixelData = imageData.data
    const newData: VanishPixel[] = []

    // Cada pixel do canvas vira 1 partícula quando pintado.
    for (let i = 0; i < pixelData.length; i += 4) {
      const alpha = pixelData[i + 3]
      if (alpha > 0) {
        newData.push({
          x: (i % (VANISH_CANVAS_SIZE * 4)) / 2,
          y: Math.floor(i / (VANISH_CANVAS_SIZE * 4)) / 2,
          r: pixelData[i],
          g: pixelData[i + 1],
          b: pixelData[i + 2],
          a: alpha,
        })
      }
    }
    newDataRef.current = newData
  }, [value])

  useEffect(() => {
    draw()
  }, [value, draw])

  const animate = useCallback(
    (start: number) => {
      const animateFrame = (pos: number = start) => {
        requestAnimationFrame(() => {
          const newData: VanishPixel[] = []
          for (let i = 0; i < newDataRef.current.length; i++) {
            const current = newDataRef.current[i]
            if (current.x < pos) {
              newData.push(current)
            } else if (current.a > 0) {
              newData.push({
                x: current.x,
                y: current.y,
                r: current.r,
                g: current.g,
                b: current.b,
                a: current.a,
              })
            }
          }
          // Wipe canvas da posição `pos` em diante.
          const ctx = canvasRef.current?.getContext("2d")
          if (ctx) {
            ctx.clearRect(pos, 0, VANISH_CANVAS_SIZE, VANISH_CANVAS_SIZE)
            for (const { x, y, r, g, b, a } of newData) {
              if (x > pos) {
                ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`
                ctx.fillRect(x, y, VANISH_PIXEL_SIZE, VANISH_PIXEL_SIZE)
              }
            }
          }
          if (pos > VANISH_CANVAS_SIZE) {
            setAnimating(false)
          } else {
            animateFrame(pos - VANISH_PIXEL_STEP)
          }
        })
      }
      animateFrame(start)
    },
    [],
  )

  const vanishAndSubmit = useCallback(() => {
    setAnimating(true)
    draw()

    const currentValue = inputRef.current?.value || ""
    if (currentValue && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0,
      )
      animate(maxX)
    }
  }, [animate, draw])

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !animating) {
        vanishAndSubmit()
      }
    },
    [animating, vanishAndSubmit],
  )

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      vanishAndSubmit()
      onSubmit?.(e)
    },
    [vanishAndSubmit, onSubmit],
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!animating) {
        setValue(e.target.value)
        onChange?.(e)
      }
    },
    [animating, onChange],
  )

  return (
    <form
      data-slot="placeholders-and-vanish-input"
      className={cn(
        "relative mx-auto flex h-12 w-full max-w-xl items-center overflow-hidden rounded-full border border-input bg-background text-foreground shadow-sm transition-colors focus-within:border-foreground/40",
        value && "bg-muted/50",
        className,
      )}
      onSubmit={handleSubmit}
      {...hostProps}
    >
      <canvas
        className={cn(
          "pointer-events-none absolute origin-top-left scale-50 transform text-base",
          animating ? "opacity-100" : "opacity-0",
        )}
        ref={canvasRef}
      />
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        type="text"
        value={value}
        className={cn(
          "relative z-50 h-full w-full rounded-full border-none bg-transparent pl-4 pr-20 text-sm text-foreground placeholder:text-transparent outline-none focus:outline-none focus:ring-0 sm:pl-10 sm:text-base",
          animating && "text-transparent",
        )}
      />

      <button
        disabled={!value}
        type="submit"
        aria-label="Enviar"
        className={cn(
          "absolute right-2 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-background transition-colors disabled:bg-muted disabled:text-muted-foreground",
        )}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 12l14 0" />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="w-[calc(100%-2rem)] truncate pl-4 text-left text-sm font-normal text-muted-foreground sm:pl-10 sm:text-base"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

export { PlaceholdersAndVanishInput }
