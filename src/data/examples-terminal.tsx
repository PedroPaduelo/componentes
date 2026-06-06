import { Terminal } from "@/components/ui/terminal"
import type { Example } from "@/data/examples"

const examplesTerminalBasic: Example = {
  title: "Básico: instalação shadcn",
  description:
    "Terminal mock que datilografa comandos linha a linha com cursor piscante e syntax highlight de bash. Anima ao entrar na viewport.",
  code: `<Terminal
  username="dev-macbook"
  commands={[
    "npx shadcn@latest init",
    "npx shadcn@latest add button card",
    "npm run dev",
  ]}
  outputs={{
    0: ["✔ Configuração criada em components.json"],
    1: ["✔ button.tsx adicionado", "✔ card.tsx adicionado"],
    2: ["VITE v6.0.0  ready in 312 ms", "➜  Local:   http://localhost:5173/"],
  }}
/>`,
  render: (
    <div className="w-full py-6">
      <Terminal
        username="dev-macbook"
        commands={[
          "npx shadcn@latest init",
          "npx shadcn@latest add button card",
          "npm run dev",
        ]}
        outputs={{
          0: ["✔ Configuração criada em components.json"],
          1: ["✔ button.tsx adicionado", "✔ card.tsx adicionado"],
          2: [
            "VITE v6.0.0  ready in 312 ms",
            "➜  Local:   http://localhost:5173/",
          ],
        }}
      />
    </div>
  ),
}

const examplesTerminalGit: Example = {
  title: "Fluxo git com flags e paths",
  description:
    "Sequência de comandos git destacando flags (azul), strings (âmbar) e paths (ciano). Velocidade de digitação mais rápida.",
  code: `<Terminal
  username="ana@deploy"
  typingSpeed={30}
  delayBetweenCommands={600}
  commands={[
    "git status -s",
    'git commit -m "feat: integra terminal"',
    "git push origin main",
  ]}
  outputs={{
    0: [" M src/components/ui/terminal.tsx"],
    1: ["[main 3efeb1c] feat: integra terminal", " 2 files changed, 312 insertions(+)"],
    2: ["To github.com:org/repo.git", "   a8545d6..3efeb1c  main -> main"],
  }}
/>`,
  render: (
    <div className="w-full py-6">
      <Terminal
        username="ana@deploy"
        typingSpeed={30}
        delayBetweenCommands={600}
        commands={[
          "git status -s",
          'git commit -m "feat: integra terminal"',
          "git push origin main",
        ]}
        outputs={{
          0: [" M src/components/ui/terminal.tsx"],
          1: [
            "[main 3efeb1c] feat: integra terminal",
            " 2 files changed, 312 insertions(+)",
          ],
          2: [
            "To github.com:org/repo.git",
            "   a8545d6..3efeb1c  main -> main",
          ],
        }}
      />
    </div>
  ),
}

export const examplesTerminal: Record<string, Example[]> = {
  terminal: [examplesTerminalBasic, examplesTerminalGit],
}
