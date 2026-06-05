import * as React from "react"

import { cn } from "@/lib/utils"
import type { LogoSliderProps } from "@/components/ui/logo-slider-types"

/**
 * LogoSlider — marquee infinito de logos (VengenceUI).
 *
 * Implementação 100% CSS (sem motion): a track de logos é renderizada duas
 * vezes lado a lado e animada com `translateX` em loop, criando o efeito de
 * rolagem contínua e sem emenda. As bordas recebem um fade via mask gradient
 * e, opcionalmente, painéis de blur progressivo (`showBlur`).
 *
 * Respeita `prefers-reduced-motion`: a animação só roda dentro do bloco
 * `@media (prefers-reduced-motion: no-preference)` definido em `index.css`.
 */
function LogoSlider({
  logos,
  direction = "left",
  speed = 40,
  pauseOnHover = false,
  showBlur = true,
  gap = 64,
  className,
}: LogoSliderProps) {
  const style = {
    "--logo-slider-duration": `${speed}s`,
    "--logo-slider-gap": `${gap}px`,
  } as React.CSSProperties

  return (
    <div
      data-slot="logo-slider"
      data-direction={direction}
      data-pause-on-hover={pauseOnHover}
      className={cn("logo-slider", className)}
      style={style}
    >
      <div className="logo-slider__container">
        <div className="logo-slider__item" aria-hidden={false}>
          {logos.map((logo, index) => (
            <span
              key={`logo-a-${index}`}
              className="inline-flex items-center justify-center fill-zinc-800 text-zinc-800 grayscale brightness-100 dark:fill-zinc-200 dark:text-zinc-200"
            >
              {logo}
            </span>
          ))}
        </div>
        <div className="logo-slider__item" aria-hidden>
          {logos.map((logo, index) => (
            <span
              key={`logo-b-${index}`}
              className="inline-flex items-center justify-center fill-zinc-800 text-zinc-800 grayscale brightness-100 dark:fill-zinc-200 dark:text-zinc-200"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>

      {showBlur ? (
        <>
          <div className="logo-slider__blur logo-slider__blur--left" aria-hidden>
            <div />
          </div>
          <div className="logo-slider__blur logo-slider__blur--right" aria-hidden>
            <div />
          </div>
        </>
      ) : null}
    </div>
  )
}

LogoSlider.displayName = "LogoSlider"

export { LogoSlider }
