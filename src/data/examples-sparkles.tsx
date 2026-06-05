/**
 * Examples do componente Sparkles (SparklesCore — Lote Aceternity).
 *
 * Partículas brancas só aparecem sobre fundo escuro → wrappers fixos em
 * `bg-black`. Contidos em `h-[420px]` (sem h-screen). `code` e `render`
 * mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { SparklesCore } from "@/components/ui/sparkles"

const sparklesBackgroundExample: Example = {
  title: "Background",
  description:
    "Campo de partículas brancas atrás de um heading — hero section estilo Aceternity.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
  <SparklesCore
    background="transparent"
    minSize={0.4}
    maxSize={1}
    particleDensity={120}
    particleColor="#FFFFFF"
    className="absolute inset-0"
  />
  <h1 className="relative z-10 text-3xl md:text-5xl font-bold text-white text-center">
    Build great products
  </h1>
</div>`,
  render: (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black">
      <SparklesCore
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleDensity={120}
        particleColor="#FFFFFF"
        className="absolute inset-0"
      />
      <h1 className="relative z-10 text-center text-3xl font-bold text-white md:text-5xl">
        Build great products
      </h1>
    </div>
  ),
}

const sparklesDenseExample: Example = {
  title: "Densidade alta",
  description:
    "Mais partículas e tamanhos maiores, com linhas de gradiente indigo/sky por baixo do título.",
  code: `<div className="relative h-[420px] w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
  <div className="relative z-20 flex flex-col items-center">
    <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
      Aceternity
    </h2>
    {/* linhas de gradiente */}
    <div className="relative mt-2 h-px w-40">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
    </div>
  </div>
  <SparklesCore
    background="transparent"
    minSize={0.6}
    maxSize={1.6}
    particleDensity={600}
    particleColor="#FFFFFF"
    speed={1.4}
    className="absolute inset-0"
  />
</div>`,
  render: (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black">
      <div className="relative z-20 flex flex-col items-center">
        <h2 className="text-center text-2xl font-bold text-white md:text-4xl">
          Aceternity
        </h2>
        <div className="relative mt-2 h-px w-40">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        </div>
      </div>
      <SparklesCore
        background="transparent"
        minSize={0.6}
        maxSize={1.6}
        particleDensity={600}
        particleColor="#FFFFFF"
        speed={1.4}
        className="absolute inset-0"
      />
    </div>
  ),
}

export const examplesSparkles: Record<string, Example[]> = {
  sparkles: [sparklesBackgroundExample, sparklesDenseExample],
}
