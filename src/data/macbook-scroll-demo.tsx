import * as React from "react"
import { MacbookScroll } from "@/components/ui/macbook-scroll"

export function MacbookScrollDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[500px] overflow-y-auto"
    >
      <MacbookScroll
        scrollRef={scrollRef}
        src="https://picsum.photos/seed/macbook-scroll/1200/800"
        title="MacBook Pro — Tailwind CSS"
        showGradient
        badge={
          <span className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-white">
            Aceternity UI
          </span>
        }
      />
    </div>
  )
}

export function MacbookScrollDemoMinimal() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[500px] overflow-y-auto"
    >
      <MacbookScroll scrollRef={scrollRef} />
    </div>
  )
}
