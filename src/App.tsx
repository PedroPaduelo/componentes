import { lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { DocsLayout } from "@/components/layout/DocsLayout"
import { CompositionsLayout } from "@/components/layout/CompositionsLayout"
import { Home } from "@/pages/Home"

/*
  Code-splitting por rota: a Home (landing) é a única página carregada de forma
  estática, porque é o destino padrão. As demais páginas são carregadas sob
  demanda via React.lazy → cada rota vira um chunk separado, removendo do boot
  de `/` o grafo pesado de FamilyDetail (barrel src/data/examples.tsx),
  CompositionDetail (src/compositions, que arrasta three/@xyflow/react/motion…),
  AiIndex/InstallGuide (src/data/ai-index → component-prompt → examples), etc.

  Os layouts (Layout/DocsLayout/CompositionsLayout) permanecem estáticos: são o
  shell leve e cada um envolve seu <Outlet/> com <Suspense> (ver os respectivos
  componentes), então o header/footer/sidebar continuam visíveis enquanto o
  chunk da página é baixado.
*/
const ComponentsIndex = lazy(() =>
  import("@/pages/ComponentsIndex").then((m) => ({ default: m.ComponentsIndex }))
)
const FamilyDetail = lazy(() =>
  import("@/pages/FamilyDetail").then((m) => ({ default: m.FamilyDetail }))
)
const GroupDetail = lazy(() =>
  import("@/pages/GroupDetail").then((m) => ({ default: m.GroupDetail }))
)
const InstallGuide = lazy(() =>
  import("@/pages/InstallGuide").then((m) => ({ default: m.InstallGuide }))
)
const AiIndex = lazy(() =>
  import("@/pages/AiIndex").then((m) => ({ default: m.AiIndex }))
)
const DashboardIndex = lazy(() =>
  import("@/pages/DashboardIndex").then((m) => ({
    default: m.DashboardIndex,
  }))
)
const Compositions = lazy(() =>
  import("@/pages/Compositions").then((m) => ({ default: m.Compositions }))
)
const CompositionDetail = lazy(() =>
  import("@/pages/CompositionDetail").then((m) => ({
    default: m.CompositionDetail,
  }))
)
const CompositionLive = lazy(() =>
  import("@/pages/CompositionLive").then((m) => ({
    default: m.CompositionLive,
  }))
)
const TremorTestMisc = lazy(() =>
  import("@/pages/tremor-test-misc").then((m) => ({
    default: m.TremorTestMisc,
  }))
)
const NotFound = lazy(() =>
  import("@/pages/NotFound").then((m) => ({ default: m.NotFound }))
)

function App() {
  return (
    <Routes>
      {/* Live demo — fullscreen, sem Header/Footer/Layout */}
      <Route path="/compositions/:slug/live" element={<CompositionLive />} />
      {/* Harness Tremor misc — fullscreen, sem Layout (validador Playwright) */}
      <Route path="/tremor-test-misc" element={<TremorTestMisc />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/*
          Área de documentação: sidebar de navegação + conteúdo central.
          - /components            → índice (redireciona pra primeira família)
          - /components/grupo/:groupId → group-page (cluster inteiro: todas as
            famílias/variantes em seções com âncora). Segmento estático "grupo"
            torna a rota mais específica que /components/:id (não colidem).
          - /components/:id        → família (ex.: "button") renderiza FamilyDetail;
            slug de variante (ex.: "button-fluid") redireciona pra
            /components/<base>#<slug> (tratado dentro do FamilyDetail).
        */}
        <Route element={<DocsLayout />}>
          <Route path="/components" element={<ComponentsIndex />} />
          <Route path="/components/grupo/:groupId" element={<GroupDetail />} />
          <Route path="/components/:id" element={<FamilyDetail />} />
        </Route>
        <Route path="/instalacao" element={<InstallGuide />} />
        <Route path="/ai" element={<AiIndex />} />
        <Route path="/dashboard" element={<DashboardIndex />} />
        {/*
          Área de composições: mesma estrutura de docs (sidebar + conteúdo
          central), agrupando as telas por categoria.
        */}
        <Route element={<CompositionsLayout />}>
          <Route path="/compositions" element={<Compositions />} />
          <Route path="/compositions/:slug" element={<CompositionDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
