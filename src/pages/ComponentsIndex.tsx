import { Navigate } from "react-router-dom"

import { groupByFamily } from "@/data/families"

/**
 * Rota índice `/components`: redireciona para a primeira família da navegação
 * (ordem alfabética estável de `groupByFamily`). Mantém o usuário sempre numa
 * página de componente válida ao entrar na área de docs sem um slug.
 */
export function ComponentsIndex() {
  const families = groupByFamily()
  const first = families[0]
  if (!first) return null
  return <Navigate to={`/components/${first.base}`} replace />
}
