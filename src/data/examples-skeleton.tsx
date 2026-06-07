import { Skeleton } from "@/components/ui/skeleton"
import type { Example } from "@/data/examples"

const skeletonCardExample: Example = {
  title: "Card skeleton",
  description: "Placeholder de card com avatar, título e linhas de texto.",
  code: `<div className="flex flex-col gap-4 rounded-lg border p-4">
  <div className="flex items-center gap-3">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
  <Skeleton className="h-32 w-full rounded-md" />
  <div className="flex flex-col gap-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
</div>`,
  render: (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  ),
}

const skeletonListExample: Example = {
  title: "Lista com avatar",
  description: "Lista de itens com avatar e texto placeholder.",
  code: `<div className="flex flex-col gap-3">
  {Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  ))}
</div>`,
  render: (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  ),
}

export const examplesSkeleton: Record<string, Example[]> = {
  skeleton: [skeletonCardExample, skeletonListExample],
}
