import * as React from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export const examplesResizable: Record<string, Example[]> = {
  resizable: [
    {
      title: "Horizontal",
      description: "Painéis redimensionáveis na horizontal com handle de arrasto.",
      code: `<ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
  <ResizablePanel defaultSize={50}>
    <div className="flex h-[200px] items-center justify-center p-6">
      <span className="font-semibold">Painel 1</span>
    </div>
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={50}>
    <div className="flex h-[200px] items-center justify-center p-6">
      <span className="font-semibold">Painel 2</span>
    </div>
  </ResizablePanel>
</ResizablePanelGroup>`,
      render: (
        <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border h-[200px]">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Painel 1</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Painel 2</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ),
    },
    {
      title: "Vertical",
      description: "Painéis redimensionáveis na vertical com handle visual.",
      code: `<ResizablePanelGroup direction="vertical" className="min-h-[200px] max-w-md rounded-lg border">
  <ResizablePanel defaultSize={25}>
    <div className="flex h-full items-center justify-center p-6">
      <span className="font-semibold">Topo</span>
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={75}>
    <div className="flex h-full items-center justify-center p-6">
      <span className="font-semibold">Conteúdo</span>
    </div>
  </ResizablePanel>
</ResizablePanelGroup>`,
      render: (
        <ResizablePanelGroup direction="vertical" className="min-h-[200px] max-w-md rounded-lg border h-[300px]">
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Topo</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Conteúdo</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ),
    },
  ],
}
