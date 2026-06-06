import * as React from "react"

import { cn } from "@/lib/utils"

export type SpotlightProps = Omit<
  React.SVGProps<SVGSVGElement>,
  "viewBox" | "fill"
> & {
  /** Cor do brilho do holofote. Default: branco. */
  fill?: string
}

/**
 * Spotlight (Aceternity UI) — SVG de uma elipse desfocada que simula um facho
 * de luz vindo de um canto, com fade-in suave (`animate-spotlight`). Pensado
 * para ser posicionado de forma absoluta dentro de um container `relative` de
 * fundo escuro, atrás do conteúdo.
 */
function Spotlight({ className, fill, ...props }: SpotlightProps) {
  return (
    <svg
      data-slot="spotlight"
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] opacity-0 lg:w-[84%]",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
      {...props}
    >
      <g filter="url(#spotlight-filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || "white"}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter
          id="spotlight-filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          />
        </filter>
      </defs>
    </svg>
  )
}

export { Spotlight }
