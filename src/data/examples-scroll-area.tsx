import { ScrollArea } from "@/components/ui/scroll-area"
import type { Example } from "@/data/examples"

const scrollAreaVerticalExample: Example = {
  title: "Vertical",
  description:
    "Área scrollável vertical com conteúdo longo e scrollbar estilizada.",
  code: `<ScrollArea className="h-72 w-full rounded-md border">
  <div className="p-4">
    <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
    {Array.from({ length: 50 }).map((_, i) => (
      <div key={i} className="text-sm">
        v1.2.0-beta.{i}
      </div>
    ))}
  </div>
</ScrollArea>`,
  render: (
    <ScrollArea className="h-72 w-full rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm">
            v1.2.0-beta.{i}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

const scrollAreaHorizontalExample: Example = {
  title: "Horizontal",
  description:
    "Área scrollável horizontal — ideal para galerias de imagens ou linhas de código.",
  code: `<ScrollArea className="w-full whitespace-nowrap rounded-md border">
  <div className="flex w-max space-x-4 p-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="flex h-24 w-40 shrink-0 items-center justify-center rounded-md border bg-muted text-sm"
      >
        Item {i + 1}
      </div>
    ))}
  </div>
</ScrollArea>`,
  render: (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex h-24 w-40 shrink-0 items-center justify-center rounded-md border bg-muted text-sm"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const examplesScrollArea: Record<string, Example[]> = {
  "scroll-area": [scrollAreaVerticalExample, scrollAreaHorizontalExample],
}
