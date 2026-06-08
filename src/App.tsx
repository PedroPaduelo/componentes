import { Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { DocsLayout } from "@/components/layout/DocsLayout"
import { Home } from "@/pages/Home"
import { ComponentsIndex } from "@/pages/ComponentsIndex"
import { FamilyDetail } from "@/pages/FamilyDetail"
import { InstallGuide } from "@/pages/InstallGuide"
import { Compositions } from "@/pages/Compositions"
import { CompositionDetail } from "@/pages/CompositionDetail"
import { NotFound } from "@/pages/NotFound"

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/*
          Área de documentação: sidebar de navegação + conteúdo central.
          - /components            → índice (redireciona pra primeira família)
          - /components/:id        → família (ex.: "button") renderiza FamilyDetail;
            slug de variante (ex.: "button-fluid") redireciona pra
            /components/<base>#<slug> (tratado dentro do FamilyDetail).
        */}
        <Route element={<DocsLayout />}>
          <Route path="/components" element={<ComponentsIndex />} />
          <Route path="/components/:id" element={<FamilyDetail />} />
        </Route>
        <Route path="/instalacao" element={<InstallGuide />} />
        <Route path="/compositions" element={<Compositions />} />
        <Route path="/compositions/:slug" element={<CompositionDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
