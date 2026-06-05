import { CyberGlitchText } from "@/components/ui/cyber-glitch-text"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                            cyber-glitch-text                               */
/* -------------------------------------------------------------------------- */

const cyberGlitchTextDefault: Example = {
  title: "Básico com hover",
  description: "Texto decodifica no mount e dispara chromatic aberration ao passar o mouse.",
  code: `<CyberGlitchText
  text="DECRYPTING..."
  className="text-2xl font-bold"
/>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <CyberGlitchText
        text="DECRYPTING..."
        className="text-2xl font-bold"
      />
    </div>
  ),
}

const cyberGlitchTextNoMount: Example = {
  title: "Sem scramble no mount",
  description: "Texto aparece estático e só decodifica no hover.",
  code: `<CyberGlitchText
  text="STATIC"
  scrambleOnMount={false}
/>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <CyberGlitchText
        text="STATIC"
        scrambleOnMount={false}
      />
    </div>
  ),
}

const cyberGlitchTextSlow: Example = {
  title: "Scramble lento",
  description: "Scramble com intervalo de 150ms entre iterações.",
  code: `<CyberGlitchText
  text="SLOW_DECODE"
  scrambleDuration={150}
  className="text-xl font-mono"
/>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <CyberGlitchText
        text="SLOW_DECODE"
        scrambleDuration={150}
        className="text-xl font-mono"
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI cyber-glitch-text batch.
 * Keyed by component slug; consumed by the showcase.
 */
export const examplesCyber: Record<string, Example[]> = {
  "cyber-glitch-text": [
    cyberGlitchTextDefault,
    cyberGlitchTextNoMount,
    cyberGlitchTextSlow,
  ],
}
