import type { Example } from "@/data/examples"
import {
  MultiStepLoaderDemo,
  MultiStepLoaderCustomDemo,
} from "./multi-step-loader-demos"

export const examplesMultiStepLoader: Record<string, Example[]> = {
  "multi-step-loader": [
    {
      title: "Loader com overlay",
      description:
        "Loader fullscreen com backdrop blur, lista de etapas com ícone Check progressivo e gradiente de fundo. Controlado por botão.",
      code: `<div className="relative min-h-[400px] rounded-lg border border-border bg-card overflow-hidden">
  {loading && (
    <MultiStepLoader
      loadingStates={[
        { text: "Verificando credenciais" },
        { text: "Carregando perfil do usuário" },
        { text: "Sincronizando preferências" },
        { text: "Preparando ambiente" },
        { text: "Quase pronto..." },
      ]}
      loading={loading}
      duration={2000}
      loop={true}
    />
  )}
  <div className="flex items-center justify-center h-[400px]">
    <button onClick={() => setLoading(!loading)}>
      {loading ? "Parar" : "Iniciar loading"}
    </button>
  </div>
</div>`,
      render: <MultiStepLoaderDemo />,
    },
    {
      title: "Etapas customizadas",
      description:
        "Loader com 3 etapas rápidas (1.5s cada) e loop desativado.",
      code: `<div className="relative min-h-[400px] rounded-lg border border-border bg-card overflow-hidden">
  {loading && (
    <MultiStepLoader
      loadingStates={[
        { text: "Conectando ao servidor" },
        { text: "Baixando dados" },
        { text: "Finalizando" },
      ]}
      loading={loading}
      duration={1500}
      loop={false}
    />
  )}
  <div className="flex items-center justify-center h-[400px]">
    <button onClick={() => setLoading(!loading)}>
      {loading ? "Parar" : "Iniciar loading"}
    </button>
  </div>
</div>`,
      render: <MultiStepLoaderCustomDemo />,
    },
  ],
}
