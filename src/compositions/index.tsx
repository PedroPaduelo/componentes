import { lazy, type ComponentType, type LazyExoticComponent } from "react"

/**
 * Mapa slug → componente de tela (composição), agora com **code-splitting**.
 *
 * Antes, este barrel importava as 42 composições de forma ESTÁTICA, o que
 * arrastava three / @xyflow/react / motion / cobe e todo o conteúdo das telas
 * para o grafo de boot assim que `CompositionDetail` (ou qualquer coisa que
 * tocasse `@/compositions`) entrasse no bundle. Agora cada composição vira um
 * `React.lazy(() => import("./<slug>"))` — só a tela aberta é baixada.
 *
 * Cada composição é um export NOMEADO (ex.: `export function LandingPage()`),
 * então mapeamos para `{ default: m.<Export> }` no `.then`, como o React.lazy
 * exige. O consumidor (`CompositionDetail`) renderiza dentro de um `<Suspense>`.
 */
export const compositionScreens: Record<
  string,
  LazyExoticComponent<ComponentType>
> = {
  "landing-page": lazy(() =>
    import("./landing-page").then((m) => ({ default: m.LandingPage }))
  ),
  "saas-dashboard": lazy(() =>
    import("./saas-dashboard").then((m) => ({ default: m.SaasDashboard }))
  ),
  "saas-dashboard-pro": lazy(() =>
    import("./saas-dashboard-pro").then((m) => ({
      default: m.SaasDashboardPro,
    }))
  ),
  "pricing-page": lazy(() =>
    import("./pricing-page").then((m) => ({ default: m.PricingPage }))
  ),
  "testimonials-wall": lazy(() =>
    import("./testimonials-wall").then((m) => ({
      default: m.TestimonialsWall,
    }))
  ),
  "hero-gallery": lazy(() =>
    import("./hero-gallery").then((m) => ({ default: m.HeroGallery }))
  ),
  "backgrounds-showcase": lazy(() =>
    import("./backgrounds-showcase").then((m) => ({
      default: m.BackgroundsShowcase,
    }))
  ),
  "text-effects-showcase": lazy(() =>
    import("./text-effects-showcase").then((m) => ({
      default: m.TextEffectsShowcase,
    }))
  ),
  "signup-form": lazy(() =>
    import("./signup-form").then((m) => ({ default: m.SignupForm }))
  ),
  "chat-app": lazy(() =>
    import("./chat-app").then((m) => ({ default: m.ChatApp }))
  ),
  "chat-inbox-pro": lazy(() =>
    import("./chat-inbox-pro").then((m) => ({ default: m.ChatInboxPro }))
  ),
  "component-playground": lazy(() =>
    import("./component-playground").then((m) => ({
      default: m.ComponentPlayground,
    }))
  ),
  "ai-agents-platform": lazy(() =>
    import("./ai-agents-platform").then((m) => ({
      default: m.AiAgentsPlatform,
    }))
  ),
  "product-showcase": lazy(() =>
    import("./product-showcase").then((m) => ({ default: m.ProductShowcase }))
  ),
  "creative-portfolio": lazy(() =>
    import("./creative-portfolio").then((m) => ({
      default: m.CreativePortfolio,
    }))
  ),
  "saas-landing-2": lazy(() =>
    import("./saas-landing-2").then((m) => ({ default: m.SaasLanding2 }))
  ),
  "interactive-dashboard": lazy(() =>
    import("./interactive-dashboard").then((m) => ({
      default: m.InteractiveDashboard,
    }))
  ),
  "world-map-explorer": lazy(() =>
    import("./world-map-explorer").then((m) => ({
      default: m.WorldMapExplorer,
    }))
  ),
  "component-playground-2": lazy(() =>
    import("./component-playground-2").then((m) => ({
      default: m.ComponentPlayground2,
    }))
  ),
  "ecommerce-storefront": lazy(() =>
    import("./ecommerce-storefront").then((m) => ({
      default: m.EcommerceStorefront,
    }))
  ),
  "product-detail": lazy(() =>
    import("./product-detail").then((m) => ({ default: m.ProductDetail }))
  ),
  "blog-article": lazy(() =>
    import("./blog-article").then((m) => ({ default: m.BlogArticle }))
  ),
  "docs-portal": lazy(() =>
    import("./docs-portal").then((m) => ({ default: m.DocsPortal }))
  ),
  "event-conference": lazy(() =>
    import("./event-conference").then((m) => ({ default: m.EventConference }))
  ),
  "settings-profile": lazy(() =>
    import("./settings-profile").then((m) => ({ default: m.SettingsProfile }))
  ),
  "onboarding-wizard": lazy(() =>
    import("./onboarding-wizard").then((m) => ({
      default: m.OnboardingWizard,
    }))
  ),
  "music-player": lazy(() =>
    import("./music-player").then((m) => ({ default: m.MusicPlayer }))
  ),
  "coming-soon": lazy(() =>
    import("./coming-soon").then((m) => ({ default: m.ComingSoon }))
  ),
  "travel-booking": lazy(() =>
    import("./travel-booking").then((m) => ({ default: m.TravelBooking }))
  ),
  "ai-ide": lazy(() =>
    import("./ai-ide").then((m) => ({ default: m.AiIde }))
  ),
  "workflow-builder": lazy(() =>
    import("./workflow-builder").then((m) => ({ default: m.WorkflowBuilder }))
  ),
  "ai-agent-flow": lazy(() =>
    import("./ai-agent-flow").then((m) => ({ default: m.AiAgentFlow }))
  ),
  "db-schema-designer": lazy(() =>
    import("./db-schema-designer").then((m) => ({
      default: m.DbSchemaDesigner,
    }))
  ),
  "mind-map": lazy(() =>
    import("./mind-map").then((m) => ({ default: m.MindMap }))
  ),
  "circuit-simulator": lazy(() =>
    import("./circuit-simulator").then((m) => ({
      default: m.CircuitSimulator,
    }))
  ),
  "image-pipeline": lazy(() =>
    import("./image-pipeline").then((m) => ({ default: m.ImagePipeline }))
  ),
  "json-visualizer": lazy(() =>
    import("./json-visualizer").then((m) => ({ default: m.JsonVisualizer }))
  ),
  "data-pipeline": lazy(() =>
    import("./data-pipeline").then((m) => ({ default: m.DataPipeline }))
  ),
  "media-studio": lazy(() =>
    import("./media-studio").then((m) => ({ default: m.MediaStudio }))
  ),
  "observability-center": lazy(() =>
    import("./observability-center").then((m) => ({
      default: m.ObservabilityCenter,
    }))
  ),
  "db-schema-explorer": lazy(() =>
    import("./db-schema-explorer").then((m) => ({
      default: m.DbSchemaExplorerScreen,
    }))
  ),
  "dba-workbench": lazy(() =>
    import("./dba-workbench").then((m) => ({ default: m.DbaWorkbench }))
  ),
  "ai-dashboard-builder": lazy(() =>
    import("./ai-dashboard-builder").then((m) => ({
      default: m.AiDashboardBuilder,
    }))
  ),
}
