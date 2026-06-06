import { MagneticButton } from "@/components/ui/magnetic-button"
import type { Example } from "./examples"

export const examplesMagneticButton: Record<string, Example[]> = {
  "magnetic-button": [
    {
      title: "Básico",
      description:
        "Wrapper que atrai o conteúdo do botão em direção ao cursor com spring. Aproxime o mouse do botão para ver o efeito magnético.",
      code: `<MagneticButton>
  <button className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
    Click me
  </button>
</MagneticButton>`,
      render: (
        <div className="flex h-32 items-center justify-center">
          <MagneticButton>
            <button className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
              Click me
            </button>
          </MagneticButton>
        </div>
      ),
    },
    {
      title: "Força customizada",
      description:
        "Ajuste `strength` para um efeito mais sutil e `maxDistance` para definir até onde o cursor influencia.",
      code: `<MagneticButton strength={0.3} maxDistance={80}>
  <button className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
    Hover sutil
  </button>
</MagneticButton>`,
      render: (
        <div className="flex h-32 items-center justify-center">
          <MagneticButton strength={0.3} maxDistance={80}>
            <button className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              Hover sutil
            </button>
          </MagneticButton>
        </div>
      ),
    },
  ],
}
