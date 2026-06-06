import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"
import type {
  HeroFloatingItem,
  HeroSectionWithMousemoveProps,
} from "@/components/ui/hero-section-with-mousemove-types"

const DEFAULT_ITEMS: HeroFloatingItem[] = [
  {
    src: "https://picsum.photos/seed/hero-mm-1/240/180",
    alt: "Paisagem montanhosa",
    depth: 40,
    position: "left-[6%] top-[14%]",
  },
  {
    src: "https://picsum.photos/seed/hero-mm-2/220/160",
    alt: "Cidade ao entardecer",
    depth: 24,
    position: "right-[8%] top-[20%]",
  },
  {
    src: "https://picsum.photos/seed/hero-mm-3/200/150",
    alt: "Floresta nublada",
    depth: 55,
    position: "left-[14%] bottom-[12%]",
  },
  {
    src: "https://picsum.photos/seed/hero-mm-4/210/170",
    alt: "Praia ao amanhecer",
    depth: 32,
    position: "right-[12%] bottom-[16%]",
  },
]

function FloatingCard({
  item,
  pointerX,
  pointerY,
}: {
  item: HeroFloatingItem
  pointerX: ReturnType<typeof useSpring>
  pointerY: ReturnType<typeof useSpring>
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  React.useEffect(() => {
    const updateX = () => x.set(pointerX.get() * item.depth)
    const updateY = () => y.set(pointerY.get() * item.depth)
    updateX()
    updateY()
    const unsubX = pointerX.on("change", updateX)
    const unsubY = pointerY.on("change", updateY)
    return () => {
      unsubX()
      unsubY()
    }
  }, [item.depth, pointerX, pointerY, x, y])

  return (
    <motion.div
      data-slot="hero-section-with-mousemove-item"
      style={{ x, y }}
      className={cn(
        "pointer-events-none absolute hidden w-32 overflow-hidden rounded-xl border border-white/10 shadow-2xl sm:block md:w-40",
        item.position,
      )}
    >
      <img
        src={item.src}
        alt={item.alt}
        className="h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </motion.div>
  )
}

function HeroSectionWithMousemove({
  title = "Construído para criar experiências",
  description = "Mova o cursor e veja os elementos reagirem com profundidade. Um hero imersivo com parallax dirigido pelo mouse.",
  items = DEFAULT_ITEMS,
  className,
  ...props
}: HeroSectionWithMousemoveProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const pointerX = useSpring(useMotionValue(0), {
    stiffness: 120,
    damping: 20,
    mass: 0.5,
  })
  const pointerY = useSpring(useMotionValue(0), {
    stiffness: 120,
    damping: 20,
    mass: 0.5,
  })

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const handleMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5
      pointerX.set(relativeX)
      pointerY.set(relativeY)
    }

    const handleLeave = () => {
      pointerX.set(0)
      pointerY.set(0)
    }

    node.addEventListener("pointermove", handleMove)
    node.addEventListener("pointerleave", handleLeave)
    return () => {
      node.removeEventListener("pointermove", handleMove)
      node.removeEventListener("pointerleave", handleLeave)
    }
  }, [pointerX, pointerY])

  return (
    <div
      ref={containerRef}
      data-slot="hero-section-with-mousemove"
      className={cn(
        "relative flex min-h-[28rem] w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-950",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.25),transparent_60%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px]"
        aria-hidden="true"
      />

      {items.map((item) => (
        <FloatingCard
          key={`${item.src}-${item.position}`}
          item={item}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <h1 className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-neutral-300 md:text-lg">
          {description}
        </p>
      </div>
    </div>
  )
}

export { HeroSectionWithMousemove }
