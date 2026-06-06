import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import type { Example } from "@/data/examples"

const backgroundGradientAnimationBasic: Example = {
  title: "Básico",
  description:
    "Blobs de gradiente animados que se movem continuamente, com um blob extra que segue o cursor (interativo). Heading sobreposto.",
  code: `<BackgroundGradientAnimation containerClassName="h-[420px] w-full rounded-lg">
  <div className="absolute inset-0 z-10 flex items-center justify-center">
    <p className="bg-gradient-to-b from-white/80 to-white/20 bg-clip-text text-center text-3xl font-bold text-transparent drop-shadow-2xl md:text-5xl">
      Gradients X Animations
    </p>
  </div>
</BackgroundGradientAnimation>`,
  render: (
    <BackgroundGradientAnimation containerClassName="h-[420px] w-full rounded-lg">
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <p className="bg-gradient-to-b from-white/80 to-white/20 bg-clip-text text-center text-3xl font-bold text-transparent drop-shadow-2xl md:text-5xl">
          Gradients X Animations
        </p>
      </div>
    </BackgroundGradientAnimation>
  ),
}

export const examplesBackgroundGradientAnimation: Record<string, Example[]> = {
  "background-gradient-animation": [backgroundGradientAnimationBasic],
}
