import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import type { Family } from "@/data/families"
import { GROUP_BY_ID, getGroup } from "@/data/groups"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OriginBadge } from "@/components/catalog/OriginBadge"

export function ComponentCard({ family }: { family: Family }) {
  const variantCount = family.variants.length
  const variantLabel =
    variantCount === 1 ? "1 variante" : `${variantCount} variantes`
  // Descrição: usa a da variante representativa (primeira após ordenação).
  const description = family.variants[0]?.description ?? ""
  // Grupo canônico (taxonomia única de /components).
  const groupLabel = GROUP_BY_ID[getGroup(family.representativeSlug)].label

  return (
    <Link
      to={`/components/${family.base}`}
      data-slot="family-card"
      data-family-base={family.base}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Ver a família ${family.name} (${variantLabel})`}
    >
      <Card className="h-full gap-4 transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg">{family.name}</CardTitle>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="w-fit">
              {groupLabel}
            </Badge>
            <Badge variant="outline" className="w-fit">
              {variantLabel}
            </Badge>
            {family.origins.map((origin) => (
              <OriginBadge key={origin} origin={origin} />
            ))}
          </div>
          <CardDescription className="mt-2 line-clamp-3">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
