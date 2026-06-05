import { Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Home } from "@/pages/Home"
import { FamilyDetail } from "@/pages/FamilyDetail"
import { NotFound } from "@/pages/NotFound"

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/*
          Uma única rota resolve família e variante:
          - base de família (ex.: "button")  → renderiza FamilyDetail
          - slug de variante (ex.: "button-fluid") → redireciona pra
            /components/<base>#<slug> (dentro do FamilyDetail).
        */}
        <Route path="/components/:id" element={<FamilyDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
