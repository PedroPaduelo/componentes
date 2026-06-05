import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import type { ComponentMeta } from "@/data/components"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ComponentCard({ component }: { component: ComponentMeta }) {
  return (
    <Link
      to={`/components/${component.slug}`}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Ver detalhes de ${component.name}`}
    >
      <Card className="h-full gap-4 transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg">{component.name}</CardTitle>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>
          <Badge variant="secondary" className="mt-1 w-fit">
            {component.category}
          </Badge>
          <CardDescription className="mt-2 line-clamp-3">
            {component.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
