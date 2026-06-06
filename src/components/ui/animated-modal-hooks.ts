/**
 * AnimatedModal (Aceternity UI) — hooks auxiliares.
 *
 * Mantido em arquivo `.ts` puro (sem JSX) para satisfazer o
 * `react-refresh/only-export-components`: hooks e Contexts ficam aqui;
 * componentes ficam em `./animated-modal.tsx`.
 *
 * - `AnimatedModalContext`  → Context com `{ open, setOpen }`.
 * - `useAnimatedModal`      → Lê o Context; throw se usado fora do Provider.
 * - `useAnimatedModalOutsideClick` → fecha modal ao clicar fora do ref.
 */

import * as React from "react"

interface AnimatedModalContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const AnimatedModalContext = React.createContext<
  AnimatedModalContextValue | undefined
>(undefined)

function useAnimatedModal(): AnimatedModalContextValue {
  const context = React.useContext(AnimatedModalContext)
  if (!context) {
    throw new Error(
      "useAnimatedModal must be used within an AnimatedModalProvider",
    )
  }
  return context
}

function useAnimatedModalOutsideClick(
  ref: React.RefObject<HTMLDivElement | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
): void {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      callback(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, callback])
}

export {
  AnimatedModalContext,
  useAnimatedModal,
  useAnimatedModalOutsideClick,
}
