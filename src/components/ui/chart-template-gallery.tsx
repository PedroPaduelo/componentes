import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChartTemplate {
  id: string
  name: string
  icon?: LucideIcon
  description: string
  preview?: React.ReactNode
}

interface ChartTemplateGalleryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  templates: ChartTemplate[]
  selected?: string
  onSelect?: (id: string) => void
}

function ChartTemplateGallery({
  templates,
  selected,
  onSelect,
  className,
  ...props
}: ChartTemplateGalleryProps) {
  return (
    <div
      data-slot="chart-template-gallery"
      className={cn("grid grid-cols-2 gap-3", className)}
      {...props}
    >
      {templates.map((template) => {
        const Icon = template.icon
        const isSelected = template.id === selected

        return (
          <div
            key={template.id}
            role="button"
            tabIndex={0}
            aria-label={template.name}
            aria-pressed={isSelected}
            data-state={isSelected ? "selected" : "unselected"}
            onClick={() => onSelect?.(template.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect?.(template.id)
              }
            }}
            className={cn(
              "group flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected && "border-primary bg-accent text-accent-foreground",
              !isSelected && "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              {Icon ? (
                <Icon className="size-4 shrink-0 text-muted-foreground" />
              ) : null}
              <span className="text-sm font-medium leading-none">
                {template.name}
              </span>
            </div>

            {template.description ? (
              <p className="text-muted-foreground line-clamp-2 text-xs">
                {template.description}
              </p>
            ) : null}

            {template.preview ? (
              <div className="text-muted-foreground mt-1 overflow-hidden">
                {template.preview}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export { ChartTemplateGallery }
export type {
  ChartTemplate,
  ChartTemplateGalleryProps,
}
