import type { ComponentType } from "react"
import { LandingPage } from "./landing-page"
import { SaasDashboard } from "./saas-dashboard"
import { SaasDashboardPro } from "./saas-dashboard-pro"
import { PricingPage } from "./pricing-page"
import { TestimonialsWall } from "./testimonials-wall"
import { HeroGallery } from "./hero-gallery"
import { BackgroundsShowcase } from "./backgrounds-showcase"
import { TextEffectsShowcase } from "./text-effects-showcase"
import { SignupForm } from "./signup-form"
import { ChatApp } from "./chat-app"
import { ChatInboxPro } from "./chat-inbox-pro"
import { ComponentPlayground } from "./component-playground"
import { AiAgentsPlatform } from "./ai-agents-platform"
import { ProductShowcase } from "./product-showcase"
import { InteractiveDashboard } from "./interactive-dashboard"
import { CreativePortfolio } from "./creative-portfolio"
import { SaasLanding2 } from "./saas-landing-2"
import { WorldMapExplorer } from "./world-map-explorer"
import { ComponentPlayground2 } from "./component-playground-2"
import { EcommerceStorefront } from "./ecommerce-storefront"
import { ProductDetail } from "./product-detail"
import { BlogArticle } from "./blog-article"
import { DocsPortal } from "./docs-portal"
import { EventConference } from "./event-conference"
import { SettingsProfile } from "./settings-profile"
import { OnboardingWizard } from "./onboarding-wizard"
import { MusicPlayer } from "./music-player"
import { ComingSoon } from "./coming-soon"
import { TravelBooking } from "./travel-booking"

/**
 * Mapa slug → componente de tela. Compartilhado entre a página de
 * detalhe (renderiza a composição) e fases futuras da feature.
 */
export const compositionScreens: Record<string, ComponentType> = {
  "landing-page": LandingPage,
  "saas-dashboard": SaasDashboard,
  "saas-dashboard-pro": SaasDashboardPro,
  "pricing-page": PricingPage,
  "testimonials-wall": TestimonialsWall,
  "hero-gallery": HeroGallery,
  "backgrounds-showcase": BackgroundsShowcase,
  "text-effects-showcase": TextEffectsShowcase,
  "signup-form": SignupForm,
  "chat-app": ChatApp,
  "chat-inbox-pro": ChatInboxPro,
  "component-playground": ComponentPlayground,
  "ai-agents-platform": AiAgentsPlatform,
  "product-showcase": ProductShowcase,
  "creative-portfolio": CreativePortfolio,
  "saas-landing-2": SaasLanding2,
  "interactive-dashboard": InteractiveDashboard,
  "world-map-explorer": WorldMapExplorer,
  "component-playground-2": ComponentPlayground2,
  "ecommerce-storefront": EcommerceStorefront,
  "product-detail": ProductDetail,
  "blog-article": BlogArticle,
  "docs-portal": DocsPortal,
  "event-conference": EventConference,
  "settings-profile": SettingsProfile,
  "onboarding-wizard": OnboardingWizard,
  "music-player": MusicPlayer,
  "coming-soon": ComingSoon,
  "travel-booking": TravelBooking,
}
