/**
 * Examples — 3D Pin (Aceternity UI).
 *
 * PinContainer é um `<a>` que inclina o card em 3D (rotateX + scale) no hover
 * e dispara o efeito de PinPerspective (linhas cyan + bolhas concêntricas em
 * loop). Como o conteúdo interno do PinContainer é `absolute`, o example
 * precisa de um wrapper com altura explícita para o card ficar visível.
 * `code` e `render` em sincronia.
 *
 * Imagem via picsum.photos com seed fixo (estável, sem dep nova).
 */

import type { Example } from "@/data/examples"
import { PinContainer } from "@/components/ui/3d-pin"

const threeDPinBasicExample: Example = {
  title: "Básico",
  description:
    "Passe o mouse sobre o pin: o card inclina em 3D e o PinPerspective aparece com o título e linhas cyan animadas.",
  code: `<div className="relative h-[40rem] w-full flex items-center justify-center">
  <PinContainer title="acme.com" href="https://acme.com">
    <div className="flex h-72 w-72 flex-col gap-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-slate-200">
      <img
        src="https://picsum.photos/seed/3d-pin-acme/600/300"
        alt="thumbnail"
        className="h-32 w-full rounded-xl object-cover"
      />
      <h3 className="text-xl font-bold text-white">Acme</h3>
      <p className="text-sm text-slate-300">
        Plataforma all-in-one para times de produto. Passez o mouse sobre o
        pin para revelar o efeito 3D completo.
      </p>
    </div>
  </PinContainer>
</div>`,
  render: (
    <div className="relative h-[40rem] w-full flex items-center justify-center">
      <PinContainer title="acme.com" href="https://acme.com">
        <div className="flex h-72 w-72 flex-col gap-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-slate-200">
          <img
            src="https://picsum.photos/seed/3d-pin-acme/600/300"
            alt="thumbnail"
            className="h-32 w-full rounded-xl object-cover"
          />
          <h3 className="text-xl font-bold text-white">Acme</h3>
          <p className="text-sm text-slate-300">
            Plataforma all-in-one para times de produto. Passez o mouse sobre o
            pin para revelar o efeito 3D completo.
          </p>
        </div>
      </PinContainer>
    </div>
  ),
}

const threeDPinCustomTitleExample: Example = {
  title: "Título customizado",
  description:
    "O prop `title` define o rótulo que aparece no PinPerspective (bolinha com nome do site) e o link de destino via `href`.",
  code: `<div className="relative h-[40rem] w-full flex items-center justify-center">
  <PinContainer
    title="github.com/componentes"
    href="https://github.com"
  >
    <div className="flex h-72 w-72 flex-col gap-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-black p-6 text-zinc-100">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
          Open source
        </span>
      </div>
      <h3 className="text-xl font-bold text-white">
        Vitrine de Componentes
      </h3>
      <p className="text-sm text-zinc-300">
        Componentes React open-source — shadcn/ui, Aceternity, chanhdai e
        mais. Veja o efeito 3D ao passar o mouse.
      </p>
      <div className="mt-auto flex items-center gap-2 text-xs text-zinc-400">
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
          ★ 12.4K
        </span>
        <span>v1.0</span>
      </div>
    </div>
  </PinContainer>
</div>`,
  render: (
    <div className="relative h-[40rem] w-full flex items-center justify-center">
      <PinContainer
        title="github.com/componentes"
        href="https://github.com"
      >
        <div className="flex h-72 w-72 flex-col gap-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-black p-6 text-zinc-100">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
              Open source
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Vitrine de Componentes
          </h3>
          <p className="text-sm text-zinc-300">
            Componentes React open-source — shadcn/ui, Aceternity, chanhdai e
            mais. Veja o efeito 3D ao passar o mouse.
          </p>
          <div className="mt-auto flex items-center gap-2 text-xs text-zinc-400">
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              ★ 12.4K
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </PinContainer>
    </div>
  ),
}

export const examples3dPin: Record<string, Example[]> = {
  "3d-pin": [threeDPinBasicExample, threeDPinCustomTitleExample],
}
