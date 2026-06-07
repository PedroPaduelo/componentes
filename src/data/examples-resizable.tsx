import * as React from "react"
import { ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { Example } from "./examples"

const HorizontalDemo = () => (
  <div className="flex h-[200px] w-full items-center justify-center">
    <ResizablePanelGroup direction="horizontal" className="h-[200px] w-full max-w-lg rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6"><span className="font-semibold">Panel 1</span></div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6"><span className="font-semibold">Panel 2</span></div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
)

const VerticalDemo = () => (
  <div className="flex h-[300px] w-full items-center justify-center">
    <ResizablePanelGroup direction="vertical" className="h-[300px] w-full max-w-lg rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6"><span className="font-semibold">Top</span></div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6"><span className="font-semibold">Bottom</span></div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
)

const ThreePanelDemo = () => (
  <div className="flex h-[200px] w-full items-center justify-center">
    <ResizablePanelGroup direction="horizontal" className="h-[200px] w-full max-w-2xl rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-4"><span className="text-xs font-medium text-muted-foreground">Sidebar</span></div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6"><span className="font-semibold">Main Content</span></div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="flex h-full items-center justify-center p-4"><span className="text-xs font-medium text-muted-foreground">Aside</span></div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
)

export const examplesResizable: Record<string, Example[]> = {
  resizable: [
    { title: "Horizontal", description: "Dois painéis lado a lado com handle arrastável.", code: "ResizablePanelGroup direction=horizontal ...", render: <HorizontalDemo /> },
    { title: "Vertical", description: "Dois painéis empilhados verticalmente.", code: "ResizablePanelGroup direction=vertical ...", render: <VerticalDemo /> },
    { title: "Três painéis", description: "Layout de três colunas (sidebar, main, aside).", code: "três painéis ...", render: <ThreePanelDemo /> },
  ],
}
