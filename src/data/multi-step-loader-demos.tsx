import * as React from "react"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"

const defaultSteps = [
  { text: "Verificando credenciais" },
  { text: "Carregando perfil do usuário" },
  { text: "Sincronizando preferências" },
  { text: "Preparando ambiente" },
  { text: "Quase pronto..." },
]

export function MultiStepLoaderDemo() {
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="relative min-h-[400px] rounded-lg border border-border bg-card overflow-hidden">
      {loading && (
        <MultiStepLoader
          loadingStates={defaultSteps}
          loading={loading}
          duration={2000}
          loop={true}
        />
      )}
      <div className="flex items-center justify-center h-[400px]">
        <button
          onClick={() => setLoading(!loading)}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          {loading ? "Parar" : "Iniciar loading"}
        </button>
      </div>
    </div>
  )
}

export function MultiStepLoaderCustomDemo() {
  const [loading, setLoading] = React.useState(false)

  const steps = [
    { text: "Conectando ao servidor" },
    { text: "Baixando dados" },
    { text: "Finalizando" },
  ]

  return (
    <div className="relative min-h-[400px] rounded-lg border border-border bg-card overflow-hidden">
      {loading && (
        <MultiStepLoader
          loadingStates={steps}
          loading={loading}
          duration={1500}
          loop={false}
        />
      )}
      <div className="flex items-center justify-center h-[400px]">
        <button
          onClick={() => setLoading(!loading)}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          {loading ? "Parar" : "Iniciar loading"}
        </button>
      </div>
    </div>
  )
}
