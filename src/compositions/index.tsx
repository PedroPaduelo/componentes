import type { ComponentType } from "react"
import { LandingPage } from "./landing-page"
import { SaasDashboard } from "./saas-dashboard"
import { PricingPage } from "./pricing-page"
import { TestimonialsWall } from "./testimonials-wall"
import { HeroGallery } from "./hero-gallery"
import { BackgroundsShowcase } from "./backgrounds-showcase"
import { TextEffectsShowcase } from "./text-effects-showcase"
import { SignupForm } from "./signup-form"
import { ChatApp } from "./chat-app"
import { ComponentPlayground } from "./component-playground"
import { AiAgentsPlatform } from "./ai-agents-platform"

/**
 * Mapa slug → componente de tela. Compartilhado entre a página de
 * detalhe (renderiza a composição) e fases futuras da feature.
 */
export const compositionScreens: Record<string, ComponentType> = {
  "landing-page": LandingPage,
  "saas-dashboard": SaasDashboard,
  "pricing-page": PricingPage,
  "testimonials-wall": TestimonialsWall,
  "hero-gallery": HeroGallery,
  "backgrounds-showcase": BackgroundsShowcase,
  "text-effects-showcase": TextEffectsShowcase,
  "signup-form": SignupForm,
  "chat-app": ChatApp,
  "component-playground": ComponentPlayground,
  "ai-agents-platform": AiAgentsPlatform,
}
