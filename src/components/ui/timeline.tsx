import * as React from "react"
import {
  motion,
  useScroll,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"
import type { TimelineProps } from "@/components/ui/timeline-types"

function Timeline({
  data,
  heading = "Changelog da jornada",
  description = "Uma linha do tempo dos principais marcos, com a barra de progresso crescendo conforme você rola a página.",
  scrollRef,
  className,
  ...props
}: TimelineProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)

  React.useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [data])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div
      data-slot="timeline"
      ref={containerRef}
      className={cn(
        "w-full bg-background font-sans md:px-10",
        className
      )}
      {...props}
    >
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 lg:px-10">
        <h2 className="mb-4 max-w-4xl text-lg text-foreground md:text-4xl">
          {heading}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            data-slot="timeline-item"
            className="flex justify-start pt-10 md:gap-10 md:pt-40"
          >
            <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-background md:left-3">
                <div className="h-4 w-4 rounded-full border border-border bg-muted p-2" />
              </div>
              <h3 className="hidden text-xl font-bold text-muted-foreground md:block md:pl-20 md:text-5xl">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <h3 className="mb-4 block text-left text-2xl font-bold text-muted-foreground md:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{ height: height + "px" }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-border to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-purple-500 from-[0%] via-blue-500 via-[10%] to-transparent"
          />
        </div>
      </div>
    </div>
  )
}

export { Timeline }
