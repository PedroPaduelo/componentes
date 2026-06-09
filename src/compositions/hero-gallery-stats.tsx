/**
 * Faixa de stats/credenciais da composição "Hero Gallery".
 *
 * Vive em arquivo próprio (export único de componente) porque usa hooks
 * (`useState`/`useRef`/`useEffect` + IntersectionObserver) para disparar a
 * contagem animada quando a faixa entra na viewport — isso evita o lint
 * `react-refresh/only-export-components` no `hero-gallery.tsx`, que exporta a
 * função de composição. Cada número usa o `AnimatedNumber` do registry: parte
 * de 0 e "rola" (slot-machine) até o valor-alvo na primeira vez que aparece.
 */

import * as React from "react"

import { AnimatedNumber } from "@/components/ui/animated-number"

type Stat = {
  label: string
  value: number
  prefix?: string
  suffix?: string
}

const STATS: Stat[] = [
  { label: "Ensaios publicados", value: 120, suffix: "+" },
  { label: "Países percorridos", value: 8 },
  { label: "Resolução máxima", value: 4, suffix: "K" },
  { label: "Fotógrafos no time", value: 24 },
]

export function HeroGalleryStats() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-4 md:grid-cols-4"
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
        >
          <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums sm:text-4xl">
            {stat.prefix}
            <AnimatedNumber value={shown ? stat.value : 0} />
            {stat.suffix}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
