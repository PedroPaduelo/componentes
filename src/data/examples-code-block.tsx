import type { Example } from "@/data/examples"
import { CodeBlock } from "@/components/ui/code-block"

const tabsExampleCode = `import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

export function Tabs({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="flex gap-2">
      {items.map((it, i) => (
        <button
          key={it.id}
          onClick={() => setActive(i)}
          className={cn(
            "rounded px-3 py-1.5 text-sm",
            i === active ? "bg-zinc-900 text-white" : "text-zinc-500"
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}`

const tabsExampleTsx = `import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface TabItem {
  id: string
  label: string
}

export function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="flex gap-2">
      {items.map((it, i) => (
        <button
          key={it.id}
          onClick={() => setActive(i)}
          className={cn(
            "rounded px-3 py-1.5 text-sm transition-colors",
            i === active ? "bg-zinc-900 text-white" : "text-zinc-500"
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}`

const tabsExamplePy = `from dataclasses import dataclass
from typing import Callable

@dataclass
class Tab:
    id: str
    label: str

class Tabs:
    def __init__(self, items: list[Tab], on_change: Callable[[int], None]):
        self.items = items
        self.active = 0
        self.on_change = on_change

    def select(self, index: int) -> None:
        self.active = index
        self.on_change(index)

    def render(self) -> str:
        return "\\n".join(
            f"[{t.label}]" if i == self.active else t.label
            for i, t in enumerate(self.items)
        )`

const basicExampleCode = `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Você clicou {count} vezes
    </button>
  )
}`

const exampleFetchBash = `#!/usr/bin/env bash
set -euo pipefail

# Faz o fetch com retry exponencial
fetch_with_retry() {
  local url="$1"
  local max=5
  local delay=1
  for i in $(seq 1 $max); do
    if curl -fsSL "$url"; then
      return 0
    fi
    sleep $delay
    delay=$((delay * 2))
  done
  echo "falhou após $max tentativas" >&2
  return 1
}

fetch_with_retry "https://api.example.com/health"`

export const examplesCodeBlock: Record<string, Example[]> = {
  "code-block": [
    {
      title: "Básico com filename",
      description:
        "Bloco de código único com nome de arquivo, syntax highlight manual, números de linha e botão de copiar com feedback visual (ícone Check + cor emerald por 2s).",
      code: `<CodeBlock
  language="tsx"
  filename="counter.tsx"
  code={counterCode}
/>`,
      render: (
        <div className="flex w-full justify-center p-4">
          <div className="w-full max-w-2xl">
            <CodeBlock
              language="tsx"
              filename="counter.tsx"
              code={basicExampleCode}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Com abas e múltiplas linguagens",
      description:
        "Array `tabs` cria um seletor animado (layoutId indicator) no topo; cada aba pode ter sua própria linguagem e linhas destacadas. O copy copia o código da aba ativa.",
      code: `<CodeBlock
  language="tsx"
  tabs={[
    { name: "Tabs.tsx", code: tabsCode, language: "tsx" },
    { name: "tabs.js",  code: tabsJs,   language: "js" },
    { name: "tabs.py",  code: tabsPy,   language: "py" },
  ]}
/>`,
      render: (
        <div className="flex w-full justify-center p-4">
          <div className="w-full max-w-2xl">
            <CodeBlock
              language="tsx"
              tabs={[
                { name: "Tabs.tsx", code: tabsExampleTsx, language: "tsx" },
                { name: "tabs.js", code: tabsExampleCode, language: "tsx" },
                { name: "tabs.py", code: tabsExamplePy, language: "py" },
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Com linhas destacadas",
      description:
        "Passe `highlightLines` (1-based) para realçar linhas com fundo `bg-white/[0.06]`. O highlight é preservado ao alternar abas (se definido por aba).",
      code: `<CodeBlock
  language="bash"
  filename="fetch.sh"
  highlightLines={[4, 5, 6, 12]}
  code={fetchBashCode}
/>`,
      render: (
        <div className="flex w-full justify-center p-4">
          <div className="w-full max-w-2xl">
            <CodeBlock
              language="bash"
              filename="fetch.sh"
              highlightLines={[4, 5, 6, 12]}
              code={exampleFetchBash}
            />
          </div>
        </div>
      ),
    },
  ],
}
