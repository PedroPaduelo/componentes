import { PixelatedCanvas } from "@/components/ui/pixelated-canvas"
import type { Example } from "@/data/examples"

const interactiveExample: Example = {
  title: "Interativo (swirl)",
  description:
    "Imagem pixelada em quadrados. Passe o mouse para distorcer os pixels com o modo swirl.",
  code: `<div className="flex h-[520px] w-full items-center justify-center rounded-xl bg-black p-4">
  <PixelatedCanvas
    src="https://picsum.photos/id/237/600/700"
    width={400}
    height={500}
    cellSize={4}
    dotScale={0.9}
    shape="square"
    distortionMode="swirl"
    distortionStrength={3}
    distortionRadius={90}
    tintColor="#ffffff"
    tintStrength={0.15}
    className="rounded-lg"
  />
</div>`,
  render: (
    <div className="flex h-[520px] w-full items-center justify-center rounded-xl bg-black p-4">
      <PixelatedCanvas
        src="https://picsum.photos/id/237/600/700"
        width={400}
        height={500}
        cellSize={4}
        dotScale={0.9}
        shape="square"
        distortionMode="swirl"
        distortionStrength={3}
        distortionRadius={90}
        tintColor="#ffffff"
        tintStrength={0.15}
        className="rounded-lg"
      />
    </div>
  ),
}

const dotsRepelExample: Example = {
  title: "Pontos circulares (repel)",
  description:
    "Pixels em círculos com tom azulado e distorção de repulsão ao redor do cursor.",
  code: `<div className="flex h-[520px] w-full items-center justify-center rounded-xl bg-black p-4">
  <PixelatedCanvas
    src="https://picsum.photos/id/1025/600/700"
    width={400}
    height={500}
    cellSize={5}
    dotScale={0.8}
    shape="circle"
    distortionMode="repel"
    distortionStrength={6}
    distortionRadius={110}
    tintColor="#0ea5e9"
    tintStrength={0.25}
    dropoutStrength={0.5}
    className="rounded-lg"
  />
</div>`,
  render: (
    <div className="flex h-[520px] w-full items-center justify-center rounded-xl bg-black p-4">
      <PixelatedCanvas
        src="https://picsum.photos/id/1025/600/700"
        width={400}
        height={500}
        cellSize={5}
        dotScale={0.8}
        shape="circle"
        distortionMode="repel"
        distortionStrength={6}
        distortionRadius={110}
        tintColor="#0ea5e9"
        tintStrength={0.25}
        dropoutStrength={0.5}
        className="rounded-lg"
      />
    </div>
  ),
}

const grayscaleStaticExample: Example = {
  title: "Escala de cinza (estático)",
  description:
    "Render em tons de cinza sem interação — pixels desenhados uma única vez.",
  code: `<div className="flex h-[520px] w-full items-center justify-center rounded-xl bg-black p-4">
  <PixelatedCanvas
    src="https://picsum.photos/id/64/600/700"
    width={400}
    height={500}
    cellSize={4}
    dotScale={0.95}
    shape="square"
    grayscale
    interactive={false}
    dropoutStrength={0.3}
    className="rounded-lg"
  />
</div>`,
  render: (
    <div className="flex h-[520px] w-full items-center justify-center rounded-xl bg-black p-4">
      <PixelatedCanvas
        src="https://picsum.photos/id/64/600/700"
        width={400}
        height={500}
        cellSize={4}
        dotScale={0.95}
        shape="square"
        grayscale
        interactive={false}
        dropoutStrength={0.3}
        className="rounded-lg"
      />
    </div>
  ),
}

export const examplesPixelatedCanvas: Record<string, Example[]> = {
  "pixelated-canvas": [
    interactiveExample,
    dotsRepelExample,
    grayscaleStaticExample,
  ],
}
