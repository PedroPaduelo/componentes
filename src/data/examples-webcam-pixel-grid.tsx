import { WebcamPixelGrid } from "@/components/ui/webcam-pixel-grid"
import type { Example } from "@/data/examples"

const examplesWebcamPixelGridBasic: Example = {
  title: "Básico",
  description:
    "Grid de pixels que captura frames da webcam em tempo real. Quando a webcam não está disponível, exibe um fallback com gradiente animado.",
  code: `<WebcamPixelGrid
  gridCols={16}
  gridRows={16}
  className="rounded-lg"
/>`,
  render: (
    <div className="flex w-full items-center justify-center p-6">
      <WebcamPixelGrid gridCols={16} gridRows={16} className="rounded-lg" />
    </div>
  ),
}

export const examplesWebcamPixelGrid: Record<string, Example[]> = {
  "webcam-pixel-grid": [examplesWebcamPixelGridBasic],
}
