import * as React from "react"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof PanelGroup>,
  React.ComponentPropsWithoutRef<typeof PanelGroup>
>(({ className, ...props }, ref) => (
  <PanelGroup
    ref={ref}
    data-slot="resizable-panel-group"
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof PanelResizeHandle>,
  React.ComponentPropsWithoutRef<typeof PanelResizeHandle> & { withHandle?: boolean }
>(({ className, withHandle, ...props }, ref) => (
  <PanelResizeHandle
    ref={ref}
    data-slot="resizable-handle"
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="h-2.5 w-1.5 text-muted-foreground">
          <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1 1L5 5L1 9" transform="translate(0,0)" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    )}
  </PanelResizeHandle>
))
ResizableHandle.displayName = "ResizableHandle"

const ResizablePanel = Panel

export { ResizablePanelGroup, ResizableHandle, ResizablePanel }
