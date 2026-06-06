/**
 * Examples — AnimatedModal (Aceternity UI).
 *
 * Modal com animação de entrada (scale + rotateX + translateY), overlay
 * com backdrop-blur, click-outside para fechar e lock do body scroll
 * enquanto aberto. `code` (string) e `render` (JSX) em sincronia
 * string-by-string.
 *
 * data-slot esperado: `animated-modal` (no Provider wrapper) e
 * `animated-modal-body` (no card que recebe scale/rotateX/translateY).
 */

import { Button } from "@/components/ui/button"
import {
  AnimatedModalBody,
  AnimatedModalContent,
  AnimatedModalFooter,
  AnimatedModalProvider,
  AnimatedModalTrigger,
} from "@/components/ui/animated-modal"

import type { Example } from "./examples"

const animatedModalBasic: Example = {
  title: "Básico",
  description:
    "Modal Aceternity com animação de entrada (scale + rotateX + translateY), overlay com backdrop-blur, click-outside e body scroll-lock. O X no canto superior direito também fecha. Ideal para diálogos contextuais, confirmações ou qualquer overlay que precise de entrada com personalidade.",
  code: `<AnimatedModalProvider>
  <AnimatedModalTrigger>Book a call</AnimatedModalTrigger>
  <AnimatedModalBody>
    <AnimatedModalContent>
      <h2 className="text-2xl font-bold tracking-tight">
        Hello! 👋
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This is an animated modal from Aceternity UI. Click outside
        this card or on the X to close.
      </p>
    </AnimatedModalContent>
    <AnimatedModalFooter>
      <Button variant="default" size="sm">
        Got it
      </Button>
    </AnimatedModalFooter>
  </AnimatedModalBody>
</AnimatedModalProvider>`,
  render: (
    <div className="min-h-[400px] grid place-items-center">
      <AnimatedModalProvider>
        <AnimatedModalTrigger>Book a call</AnimatedModalTrigger>
        <AnimatedModalBody>
          <AnimatedModalContent>
            <h2 className="text-2xl font-bold tracking-tight">
              Hello! 👋
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This is an animated modal from Aceternity UI. Click outside
              this card or on the X to close.
            </p>
          </AnimatedModalContent>
          <AnimatedModalFooter>
            <Button variant="default" size="sm">
              Got it
            </Button>
          </AnimatedModalFooter>
        </AnimatedModalBody>
      </AnimatedModalProvider>
    </div>
  ),
}

const animatedModalWithForm: Example = {
  title: "Com formulário",
  description:
    "Mesmo modal, agora com inputs dentro do AnimatedModalContent. O card cresce verticalmente conforme o conteúdo (flex-col + flex-1 no content), mantendo a proporção e a borda arredondada em telas ≥md.",
  code: `<AnimatedModalProvider>
  <AnimatedModalTrigger>Sign up</AnimatedModalTrigger>
  <AnimatedModalBody>
    <AnimatedModalContent>
      <h2 className="text-2xl font-bold tracking-tight">
        Crie sua conta
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Leva menos de um minuto.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          placeholder="voce@empresa.com"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
        <input
          type="password"
          placeholder="Senha"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
    </AnimatedModalContent>
    <AnimatedModalFooter>
      <Button variant="ghost" size="sm">
        Cancelar
      </Button>
      <Button variant="default" size="sm">
        Criar conta
      </Button>
    </AnimatedModalFooter>
  </AnimatedModalBody>
</AnimatedModalProvider>`,
  render: (
    <div className="min-h-[400px] grid place-items-center">
      <AnimatedModalProvider>
        <AnimatedModalTrigger>Sign up</AnimatedModalTrigger>
        <AnimatedModalBody>
          <AnimatedModalContent>
            <h2 className="text-2xl font-bold tracking-tight">
              Crie sua conta
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Leva menos de um minuto.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                placeholder="voce@empresa.com"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                type="password"
                placeholder="Senha"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </AnimatedModalContent>
          <AnimatedModalFooter>
            <Button variant="ghost" size="sm">
              Cancelar
            </Button>
            <Button variant="default" size="sm">
              Criar conta
            </Button>
          </AnimatedModalFooter>
        </AnimatedModalBody>
      </AnimatedModalProvider>
    </div>
  ),
}

export const animatedModalExamples: Record<string, Example[]> = {
  "animated-modal": [animatedModalBasic, animatedModalWithForm],
}
