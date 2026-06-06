import { Keyboard } from "@/components/ui/keyboard"
import type { Example } from "@/data/examples"

const examplesKeyboardBasic: Example = {
  title: "Básico",
  description:
    "Teclado estilo Apple em escala 0.8 — as teclas afundam ao clicar (scale 0.98) ou quando você pressiona a tecla física correspondente no teclado do sistema.",
  code: `<Keyboard />`,
  render: (
    <div className="flex min-h-48 w-full items-center justify-center p-6">
      <Keyboard />
    </div>
  ),
}

const examplesKeyboardWithPreview: Example = {
  title: "Com preview da tecla",
  description:
    "Ativa o modo `showPreview` que mostra, acima do teclado, a etiqueta da última tecla pressionada (vinda do evento `keydown` do navegador), com entrada/saída animada via AnimatePresence + motion.",
  code: `<Keyboard showPreview />`,
  render: (
    <div className="flex min-h-48 w-full items-center justify-center p-6">
      <Keyboard showPreview />
    </div>
  ),
}

export const examplesKeyboard: Record<string, Example[]> = {
  "keyboard": [examplesKeyboardBasic, examplesKeyboardWithPreview],
}
