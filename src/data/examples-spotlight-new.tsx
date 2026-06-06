import { SpotlightNew } from "@/components/ui/spotlight-new"
import type { Example } from "@/data/examples"

const spotlightNewBasic: Example = {
  title: "Básico",
  description:
    "Dois feixes de luz que balançam suavemente sobre um fundo escuro.",
  code: `<div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/[0.96]">
  <SpotlightNew />
  <div className="relative z-10 mx-auto max-w-lg px-4 text-center">
    <h2 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
      Spotlight New
    </h2>
    <p className="mt-4 text-base text-neutral-300">
      Um efeito de holofote com dois feixes animados para destacar seu hero.
    </p>
  </div>
</div>`,
  render: (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/[0.96]">
      <SpotlightNew />
      <div className="relative z-10 mx-auto max-w-lg px-4 text-center">
        <h2 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
          Spotlight New
        </h2>
        <p className="mt-4 text-base text-neutral-300">
          Um efeito de holofote com dois feixes animados para destacar seu hero.
        </p>
      </div>
    </div>
  ),
}

const spotlightNewCustom: Example = {
  title: "Cor e balanço customizados",
  description:
    "Gradientes em tom violeta com maior amplitude e ciclo mais lento.",
  code: `<div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/[0.96]">
  <SpotlightNew
    gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(270, 100%, 85%, .10) 0, hsla(270, 100%, 55%, .03) 50%, hsla(270, 100%, 45%, 0) 80%)"
    gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(270, 100%, 85%, .08) 0, hsla(270, 100%, 55%, .03) 80%, transparent 100%)"
    gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(270, 100%, 85%, .06) 0, hsla(270, 100%, 45%, .03) 80%, transparent 100%)"
    duration={10}
    xOffset={160}
  />
  <h2 className="relative z-10 text-3xl font-bold text-neutral-100 md:text-5xl">
    Hero em destaque
  </h2>
</div>`,
  render: (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/[0.96]">
      <SpotlightNew
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(270, 100%, 85%, .10) 0, hsla(270, 100%, 55%, .03) 50%, hsla(270, 100%, 45%, 0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(270, 100%, 85%, .08) 0, hsla(270, 100%, 55%, .03) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(270, 100%, 85%, .06) 0, hsla(270, 100%, 45%, .03) 80%, transparent 100%)"
        duration={10}
        xOffset={160}
      />
      <h2 className="relative z-10 text-3xl font-bold text-neutral-100 md:text-5xl">
        Hero em destaque
      </h2>
    </div>
  ),
}

export const examplesSpotlightNew: Record<string, Example[]> = {
  "spotlight-new": [spotlightNewBasic, spotlightNewCustom],
}
