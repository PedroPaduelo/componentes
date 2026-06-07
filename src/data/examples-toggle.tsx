import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import type { Example } from "@/data/examples"


export const examplesToggle: Record<string, Example[]> = {
  toggle: [
    {
      title: "Toggle Básico",
      description: "Toggle simples com texto e ícone de destaque.",
      code: `<div className="flex items-center gap-2">
  <Toggle aria-label="Toggle bold">
    <Bold className="h-4 w-4" />
  </Toggle>
  <Toggle aria-label="Toggle italic">
    <Italic className="h-4 w-4" />
  </Toggle>
  <Toggle aria-label="Toggle underline">
    <Underline className="h-4 w-4" />
  </Toggle>
</div>`,
      render: (
        <div className="flex items-center gap-2">
          <Toggle aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>
      ),
    },
    {
      title: "Toggle com Variantes e Tamanhos",
      description: "Demonstra as variantes default/outline e tamanhos sm/default/lg.",
      code: `<div className="flex flex-col gap-4">
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground w-16">Default</span>
    <Toggle variant="default" size="sm" aria-label="Small default">
      <Bold className="h-4 w-4" />
    </Toggle>
    <Toggle variant="default" size="default" aria-label="Medium default">
      <Italic className="h-4 w-4" />
    </Toggle>
    <Toggle variant="default" size="lg" aria-label="Large default">
      <Underline className="h-4 w-4" />
    </Toggle>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground w-16">Outline</span>
    <Toggle variant="outline" size="sm" aria-label="Small outline small">
      <AlignLeft className="h-4 w-4" />
    </Toggle>
    <Toggle variant="outline" size="default" aria-label="Medium outline">
      <AlignCenter className="h-4 w-4" />
    </Toggle>
    <Toggle variant="outline" size="lg" aria-label="Large outline">
      <AlignRight className="h-4 w-4" />
    </Toggle>
  </div>
</div>`,
      render: (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16">Default</span>
            <Toggle variant="default" size="sm" aria-label="Small default">
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle variant="default" size="default" aria-label="Medium default">
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle variant="default" size="lg" aria-label="Large default">
              <Underline className="h-4 w-4" />
            </Toggle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16">Outline</span>
            <Toggle variant="outline" size="sm" aria-label="Small outline">
              <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle variant="outline" size="default" aria-label="Medium outline">
              <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle variant="outline" size="lg" aria-label="Large outline">
              <AlignRight className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
      ),
    },
  ],
};
