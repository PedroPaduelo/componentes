import * as React from "react"
import { AsciiArt, AsciiArtStatic } from "@/components/ui/ascii-art"

type Example = {
  title: string
  description: string
  code: string
  render: React.ReactNode
}

const AsciiArtFadeExample: Example = {
  title: "Fade Animation",
  description: "Imagem renderizada como ASCII art com animação de fade-in.",
  code: `<div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
  <AsciiArt
    src="https://picsum.photos/seed/ascii-art/800/600"
    resolution={80}
    charset="standard"
    color="#ffffff"
    animated={true}
    animationStyle="fade"
    animationDuration={1.5}
    className="h-full w-full"
  />
</div>`,
  render: (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
      <AsciiArt
        src="https://picsum.photos/seed/ascii-art/800/600"
        resolution={80}
        charset="standard"
        color="#ffffff"
        animated={true}
        animationStyle="fade"
        animationDuration={1.5}
        className="h-full w-full"
      />
    </div>
  ),
}

const AsciiArtMatrixExample: Example = {
  title: "Matrix Animation",
  description: "Efeito matrix com caracteres katakana caindo em verde.",
  code: `<div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
  <AsciiArt
    src="https://picsum.photos/seed/ascii-matrix/800/600"
    resolution={80}
    charset="dense"
    animated={true}
    animationStyle="matrix"
    className="h-full w-full"
  />
</div>`,
  render: (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
      <AsciiArt
        src="https://picsum.photos/seed/ascii-matrix/800/600"
        resolution={80}
        charset="dense"
        animated={true}
        animationStyle="matrix"
        className="h-full w-full"
      />
    </div>
  ),
}

const AsciiArtTypewriterExample: Example = {
  title: "Typewriter Animation",
  description: "Revelação caractere por caractere, estilo máquina de escrever.",
  code: `<div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
  <AsciiArt
    src="https://picsum.photos/seed/ascii-typewriter/800/600"
    resolution={60}
    charset="blocks"
    color="#00ff00"
    animated={true}
    animationStyle="typewriter"
    className="h-full w-full"
  />
</div>`,
  render: (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
      <AsciiArt
        src="https://picsum.photos/seed/ascii-typewriter/800/600"
        resolution={60}
        charset="blocks"
        color="#00ff00"
        animated={true}
        animationStyle="typewriter"
        className="h-full w-full"
      />
    </div>
  ),
}

const AsciiArtStaticExample: Example = {
  title: "Static (sem animação)",
  description: "Renderização instantânea, ideal para previews e thumbnails.",
  code: `<div className="relative h-[300px] w-full rounded-xl overflow-hidden bg-black">
  <AsciiArtStatic
    src="https://picsum.photos/seed/ascii-static/800/600"
    resolution={50}
    charset="braille"
    colored={true}
    className="h-full w-full"
  />
</div>`,
  render: (
    <div className="relative h-[300px] w-full rounded-xl overflow-hidden bg-black">
      <AsciiArtStatic
        src="https://picsum.photos/seed/ascii-static/800/600"
        resolution={50}
        charset="braille"
        colored={true}
        className="h-full w-full"
      />
    </div>
  ),
}

const AsciiArtColoredExample: Example = {
  title: "Colored ASCII",
  description: "ASCII art colorido usando as cores originais da imagem.",
  code: `<div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
  <AsciiArt
    src="https://picsum.photos/seed/ascii-colored/800/600"
    resolution={70}
    charset="standard"
    colored={true}
    animated={false}
    className="h-full w-full"
  />
</div>`,
  render: (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-black">
      <AsciiArt
        src="https://picsum.photos/seed/ascii-colored/800/600"
        resolution={70}
        charset="standard"
        colored={true}
        animated={false}
        className="h-full w-full"
      />
    </div>
  ),
}

export const examplesAsciiArt: Record<string, Example[]> = {
  "ascii-art": [
    AsciiArtFadeExample,
    AsciiArtMatrixExample,
    AsciiArtTypewriterExample,
    AsciiArtStaticExample,
    AsciiArtColoredExample,
  ],
}
