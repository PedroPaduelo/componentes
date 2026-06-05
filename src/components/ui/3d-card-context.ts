import { createContext, useContext } from "react"
import type { Dispatch, SetStateAction } from "react"

/**
 * Contexto de hover do 3D Card Effect.
 *
 * Compartilha o estado `isMouseEntered` entre o CardContainer (provider) e os
 * CardItem (consumidores), que reagem aplicando/zerando o transform 3D.
 *
 * Em arquivo .ts separado para não misturar contexto/hook com os componentes
 * no .tsx (react-refresh/only-export-components).
 */
export const MouseEnterContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | undefined
>(undefined)

export function useMouseEnter() {
  const context = useContext(MouseEnterContext)
  if (context === undefined) {
    throw new Error(
      "useMouseEnter must be used within a MouseEnterProvider (CardContainer)",
    )
  }
  return context
}
