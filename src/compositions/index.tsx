import type { ComponentType } from "react"
import { LandingPage } from "./landing-page"
import { SaasDashboard } from "./saas-dashboard"
import { PricingPage } from "./pricing-page"
import { TestimonialsWall } from "./testimonials-wall"
import { HeroGallery } from "./hero-gallery"

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
}
