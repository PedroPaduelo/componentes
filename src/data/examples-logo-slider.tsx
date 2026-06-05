import {
  Apple,
  Chrome,
  Figma,
  Github,
  Slack,
  Twitch,
  Twitter,
  Youtube,
} from "lucide-react"

import { LogoSlider } from "@/components/ui/logo-slider"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                                logo-slider                                 */
/* -------------------------------------------------------------------------- */

const logoSliderBasic: Example = {
  title: "Básico",
  description:
    "Marquee infinito rolando para a esquerda, com blur progressivo nas bordas.",
  code: `<LogoSlider
  logos={[
    <Apple className="h-8 w-8" />,
    <Github className="h-8 w-8" />,
    <Chrome className="h-8 w-8" />,
    <Figma className="h-8 w-8" />,
    <Slack className="h-8 w-8" />,
    <Twitch className="h-8 w-8" />,
    <Twitter className="h-8 w-8" />,
    <Youtube className="h-8 w-8" />,
  ]}
/>`,
  render: (
    <div className="w-full">
      <LogoSlider
        logos={[
          <Apple className="h-8 w-8" />,
          <Github className="h-8 w-8" />,
          <Chrome className="h-8 w-8" />,
          <Figma className="h-8 w-8" />,
          <Slack className="h-8 w-8" />,
          <Twitch className="h-8 w-8" />,
          <Twitter className="h-8 w-8" />,
          <Youtube className="h-8 w-8" />,
        ]}
      />
    </div>
  ),
}

const logoSliderRight: Example = {
  title: "Direção à direita",
  description: "Mesmo marquee, mas rolando para a direita (direction=\"right\").",
  code: `<LogoSlider
  direction="right"
  logos={[
    <Apple className="h-8 w-8" />,
    <Github className="h-8 w-8" />,
    <Chrome className="h-8 w-8" />,
    <Figma className="h-8 w-8" />,
    <Slack className="h-8 w-8" />,
    <Twitch className="h-8 w-8" />,
    <Twitter className="h-8 w-8" />,
    <Youtube className="h-8 w-8" />,
  ]}
/>`,
  render: (
    <div className="w-full">
      <LogoSlider
        direction="right"
        logos={[
          <Apple className="h-8 w-8" />,
          <Github className="h-8 w-8" />,
          <Chrome className="h-8 w-8" />,
          <Figma className="h-8 w-8" />,
          <Slack className="h-8 w-8" />,
          <Twitch className="h-8 w-8" />,
          <Twitter className="h-8 w-8" />,
          <Youtube className="h-8 w-8" />,
        ]}
      />
    </div>
  ),
}

const logoSliderFast: Example = {
  title: "Velocidade rápida",
  description: "Ciclo mais curto (speed=30) deixa o marquee mais veloz.",
  code: `<LogoSlider
  speed={30}
  logos={[
    <Apple className="h-8 w-8" />,
    <Github className="h-8 w-8" />,
    <Chrome className="h-8 w-8" />,
    <Figma className="h-8 w-8" />,
    <Slack className="h-8 w-8" />,
    <Twitch className="h-8 w-8" />,
    <Twitter className="h-8 w-8" />,
    <Youtube className="h-8 w-8" />,
  ]}
/>`,
  render: (
    <div className="w-full">
      <LogoSlider
        speed={30}
        logos={[
          <Apple className="h-8 w-8" />,
          <Github className="h-8 w-8" />,
          <Chrome className="h-8 w-8" />,
          <Figma className="h-8 w-8" />,
          <Slack className="h-8 w-8" />,
          <Twitch className="h-8 w-8" />,
          <Twitter className="h-8 w-8" />,
          <Youtube className="h-8 w-8" />,
        ]}
      />
    </div>
  ),
}

const logoSliderPauseOnHover: Example = {
  title: "Pausar no hover",
  description:
    "Com pauseOnHover, a animação congela enquanto o cursor está sobre o slider.",
  code: `<LogoSlider
  pauseOnHover
  logos={[
    <Apple className="h-8 w-8" />,
    <Github className="h-8 w-8" />,
    <Chrome className="h-8 w-8" />,
    <Figma className="h-8 w-8" />,
    <Slack className="h-8 w-8" />,
    <Twitch className="h-8 w-8" />,
    <Twitter className="h-8 w-8" />,
    <Youtube className="h-8 w-8" />,
  ]}
/>`,
  render: (
    <div className="w-full">
      <LogoSlider
        pauseOnHover
        logos={[
          <Apple className="h-8 w-8" />,
          <Github className="h-8 w-8" />,
          <Chrome className="h-8 w-8" />,
          <Figma className="h-8 w-8" />,
          <Slack className="h-8 w-8" />,
          <Twitch className="h-8 w-8" />,
          <Twitter className="h-8 w-8" />,
          <Youtube className="h-8 w-8" />,
        ]}
      />
    </div>
  ),
}

const logoSliderWithoutBlur: Example = {
  title: "Sem blur",
  description:
    "Com showBlur={false}, os painéis de blur progressivo são removidos (só o fade do mask permanece).",
  code: `<LogoSlider
  showBlur={false}
  logos={[
    <Apple className="h-8 w-8" />,
    <Github className="h-8 w-8" />,
    <Chrome className="h-8 w-8" />,
    <Figma className="h-8 w-8" />,
    <Slack className="h-8 w-8" />,
    <Twitch className="h-8 w-8" />,
    <Twitter className="h-8 w-8" />,
    <Youtube className="h-8 w-8" />,
  ]}
/>`,
  render: (
    <div className="w-full">
      <LogoSlider
        showBlur={false}
        logos={[
          <Apple className="h-8 w-8" />,
          <Github className="h-8 w-8" />,
          <Chrome className="h-8 w-8" />,
          <Figma className="h-8 w-8" />,
          <Slack className="h-8 w-8" />,
          <Twitch className="h-8 w-8" />,
          <Twitter className="h-8 w-8" />,
          <Youtube className="h-8 w-8" />,
        ]}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Curated examples for the VengenceUI logo-slider component.
 * Keyed by component slug; consumed by the showcase.
 */
export const examplesLogoSlider: Record<string, Example[]> = {
  "logo-slider": [
    logoSliderBasic,
    logoSliderRight,
    logoSliderFast,
    logoSliderPauseOnHover,
    logoSliderWithoutBlur,
  ],
}
