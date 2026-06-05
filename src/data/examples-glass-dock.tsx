import {
  Home,
  Terminal,
  Layout,
  Archive,
  History,
  Twitter,
  Github,
} from "lucide-react"

import { GlassDock } from "@/components/ui/glass-dock"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                               glass-dock                                   */
/* -------------------------------------------------------------------------- */

const glassDockBasicExample: Example = {
  title: "Básico com 7 itens",
  description:
    "Dock glassmorphic com 7 ícones lucide. Hover em qualquer item revela tooltip animado e aplica magnify 1.1× com leve lift -3px.",
  code: `<GlassDock
  items={[
    { title: "Home", icon: Home },
    { title: "Terminal", icon: Terminal },
    { title: "Layout", icon: Layout },
    { title: "Archive", icon: Archive },
    { title: "History", icon: History },
    { title: "Twitter", icon: Twitter },
    { title: "Github", icon: Github },
  ]}
/>`,
  render: (
    <div className="flex h-[300px] w-full items-center justify-center">
      <GlassDock
        items={[
          { title: "Home", icon: Home },
          { title: "Terminal", icon: Terminal },
          { title: "Layout", icon: Layout },
          { title: "Archive", icon: Archive },
          { title: "History", icon: History },
          { title: "Twitter", icon: Twitter },
          { title: "Github", icon: Github },
        ]}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI glass-dock batch.
 * Keyed by component slug; consumed by the showcase.
 */
export const examplesGlassDock: Record<string, Example[]> = {
  "glass-dock": [glassDockBasicExample],
}
