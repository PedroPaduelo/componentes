/**
 * Dados mock, tipos e helpers puros da composição `ai-ide`.
 *
 * Mantido fora de `ai-ide.tsx` para o arquivo de componente exportar apenas
 * `AiIde` (regra `react-refresh/only-export-components`) e concentrar a árvore
 * de arquivos mutável + utilitários determinísticos num só lugar.
 */

/* -------------------------------------------------------------------------- */
/*                            syntax highlight leve                            */
/* -------------------------------------------------------------------------- */

export type TokenKind =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "fn"
  | "tag"
  | "plain"

export const TOKEN_CLASS: Record<TokenKind, string> = {
  keyword: "text-violet-500 dark:text-violet-400",
  string: "text-emerald-600 dark:text-emerald-400",
  comment: "text-muted-foreground italic",
  number: "text-amber-600 dark:text-amber-400",
  fn: "text-sky-600 dark:text-sky-400",
  tag: "text-rose-600 dark:text-rose-400",
  plain: "text-foreground",
}

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "import", "export", "from", "default", "async", "await", "class", "extends",
  "new", "type", "interface", "of", "in", "as", "typeof", "true", "false",
  "null", "undefined", "void", "this", "def", "lambda", "and", "or", "not",
])

const TOKEN_RE =
  /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][A-Za-z0-9_$]*\b)|(\s+)|([^\sA-Za-z0-9_$])/g

export type Token = { text: string; kind: TokenKind }

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  TOKEN_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_RE.exec(line)) !== null) {
    const [, comment, str, num, ident, space, sym] = match
    if (comment !== undefined) {
      tokens.push({ text: comment, kind: "comment" })
    } else if (str !== undefined) {
      tokens.push({ text: str, kind: "string" })
    } else if (num !== undefined) {
      tokens.push({ text: num, kind: "number" })
    } else if (ident !== undefined) {
      if (KEYWORDS.has(ident)) {
        tokens.push({ text: ident, kind: "keyword" })
      } else {
        let k = TOKEN_RE.lastIndex
        while (k < line.length && line[k] === " ") k++
        if (line[k] === "(") tokens.push({ text: ident, kind: "fn" })
        else if (/^[A-Z]/.test(ident)) tokens.push({ text: ident, kind: "tag" })
        else tokens.push({ text: ident, kind: "plain" })
      }
    } else if (space !== undefined) {
      tokens.push({ text: space, kind: "plain" })
    } else if (sym !== undefined) {
      tokens.push({ text: sym, kind: "plain" })
    }
  }
  return tokens
}

/* -------------------------------------------------------------------------- */
/*                              modelo de dados                                */
/* -------------------------------------------------------------------------- */

export type Lang = "tsx" | "ts" | "css" | "md" | "json"

export const LANG_LABEL: Record<Lang, string> = {
  tsx: "TypeScript React",
  ts: "TypeScript",
  css: "CSS",
  md: "Markdown",
  json: "JSON",
}

export type FileProblem = {
  line: number
  message: string
  severity: "error" | "warning"
}

export type FileData = {
  kind: "file"
  id: string
  name: string
  lang: Lang
  code: string
  /** Sugestão fantasma inline aceitável. */
  ghost?: string
  problems?: FileProblem[]
}

export type DirData = {
  kind: "dir"
  id: string
  name: string
  open: boolean
  children: TreeNode[]
}

export type TreeNode = FileData | DirData

export const ROOT_NAME = "aurora-app"

export const INITIAL_TREE: TreeNode[] = [
  {
    kind: "dir",
    id: "src",
    name: "src",
    open: true,
    children: [
      {
        kind: "dir",
        id: "lib",
        name: "lib",
        open: true,
        children: [
          {
            kind: "file",
            id: "utils",
            name: "utils.ts",
            lang: "ts",
            code: `// Funções utilitárias compartilhadas
export function buildGreeting(user) {
  if (!user) return "Bem-vindo"
  return "Olá, " + user.name + "!"
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(" ")
}`,
          },
          {
            kind: "file",
            id: "api",
            name: "api.ts",
            lang: "ts",
            code: `const BASE_URL = "https://api.exemplo.dev"

export async function fetchUser(id) {
  const res = await fetch(BASE_URL + "/users/" + id)
  if (!res.ok) throw new Error("Falha ao buscar usuário")
  return res.json()
}`,
            problems: [
              { line: 3, message: "Parameter 'id' implicitly has an 'any' type.", severity: "error" },
            ],
          },
        ],
      },
      {
        kind: "file",
        id: "app",
        name: "App.tsx",
        lang: "tsx",
        ghost: `  const greeting = useMemo(() => buildGreeting(user), [user])`,
        code: `import { useMemo, useState } from "react"
import { buildGreeting } from "@/lib/utils"
import { fetchUser } from "@/lib/api"

export function App() {
  const [user, setUser] = useState(null)

  return (
    <main className="app">
      <h1>Olá, mundo</h1>
      <p>{user ? user.name : "Carregando…"}</p>
    </main>
  )
}`,
        problems: [
          { line: 5, message: "'setUser' is declared but never used.", severity: "warning" },
        ],
      },
      {
        kind: "file",
        id: "styles",
        name: "index.css",
        lang: "css",
        code: `.app {
  display: grid;
  gap: 1rem;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

.app h1 {
  font-size: 1.5rem;
  font-weight: 600;
}`,
      },
    ],
  },
  {
    kind: "file",
    id: "readme",
    name: "README.md",
    lang: "md",
    code: `# Aurora App

Projeto de exemplo gerado pela IDE com IA.

## Scripts

- npm run dev — inicia o servidor
- npm run build — gera o bundle de produção

> Dica: peça à IA para explicar ou refatorar qualquer arquivo.`,
  },
  {
    kind: "file",
    id: "pkg",
    name: "package.json",
    lang: "json",
    code: `{
  "name": "aurora-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`,
  },
]

/* -------------------------------------------------------------------------- */
/*                          helpers puros da árvore                            */
/* -------------------------------------------------------------------------- */

/** Detecta a linguagem a partir da extensão do nome do arquivo. */
export function langFromName(name: string): Lang {
  if (name.endsWith(".tsx")) return "tsx"
  if (name.endsWith(".css")) return "css"
  if (name.endsWith(".md")) return "md"
  if (name.endsWith(".json")) return "json"
  return "ts"
}

/** Percorre a árvore aplicando `fn` a cada nó (retorna uma nova árvore). */
export function mapTree(
  nodes: TreeNode[],
  fn: (node: TreeNode) => TreeNode,
): TreeNode[] {
  return nodes.map((node) => {
    const mapped = fn(node)
    if (mapped.kind === "dir") {
      return { ...mapped, children: mapTree(mapped.children, fn) }
    }
    return mapped
  })
}

/** Alterna o estado aberto/fechado de uma pasta. */
export function toggleDir(nodes: TreeNode[], id: string): TreeNode[] {
  return mapTree(nodes, (node) =>
    node.kind === "dir" && node.id === id ? { ...node, open: !node.open } : node,
  )
}

/** Renomeia um nó (arquivo ou pasta); arquivos têm a `lang` recalculada. */
export function renameNode(nodes: TreeNode[], id: string, name: string): TreeNode[] {
  return mapTree(nodes, (node) => {
    if (node.id !== id) return node
    if (node.kind === "file") {
      return { ...node, name, lang: langFromName(name) }
    }
    return { ...node, name }
  })
}

/** Remove um nó da árvore (em qualquer profundidade). */
export function deleteNode(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.kind === "dir"
        ? { ...node, children: deleteNode(node.children, id) }
        : node,
    )
}

/** Insere um nó na raiz (ordena pastas antes de arquivos). */
export function insertAtRoot(nodes: TreeNode[], node: TreeNode): TreeNode[] {
  const next = [...nodes, node]
  return next.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/** Atualiza o código de um arquivo. */
export function updateFileCode(
  nodes: TreeNode[],
  id: string,
  code: string,
): TreeNode[] {
  return mapTree(nodes, (node) =>
    node.kind === "file" && node.id === id ? { ...node, code } : node,
  )
}

/** Lista plana de todos os arquivos da árvore. */
export function collectFiles(nodes: TreeNode[]): FileData[] {
  const out: FileData[] = []
  for (const node of nodes) {
    if (node.kind === "file") out.push(node)
    else out.push(...collectFiles(node.children))
  }
  return out
}

/** Caminho (segmentos) de um arquivo a partir da raiz, ou null. */
export function findPath(
  nodes: TreeNode[],
  id: string,
  prefix: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === id) return [...prefix, node.name]
    if (node.kind === "dir") {
      const found = findPath(node.children, id, [...prefix, node.name])
      if (found) return found
    }
  }
  return null
}

/* -------------------------------------------------------------------------- */
/*                             modelo da IA / chat                             */
/* -------------------------------------------------------------------------- */

export type Role = "user" | "assistant"

export type AiCode = {
  language: Lang
  filename: string
  code: string
  targetId: string
}

export type ThinkStep = {
  icon: "search" | "brain" | "settings" | "check" | "globe"
  label: string
  description?: string
  sources?: { label: string; color: "blue" | "green" | "violet" }[]
  details?: { summary: string; items: string[] }
}

export const THINK_STEPS: ThinkStep[] = [
  {
    icon: "search",
    label: "Lendo arquivos do contexto",
    description: "Abrindo o arquivo ativo e suas dependências.",
    sources: [
      { label: "src/App.tsx", color: "blue" },
      { label: "src/lib/utils.ts", color: "green" },
    ],
  },
  {
    icon: "brain",
    label: "Analisando o código",
    description: "Mapeando tipos, fluxo de dados e pontos de melhoria.",
  },
  {
    icon: "settings",
    label: "Gerando o patch",
    details: {
      summary: "Ver raciocínio",
      items: [
        "Preserva a API pública dos componentes.",
        "Adiciona tipos explícitos onde faltavam.",
      ],
    },
  },
]

/** Estado do raciocínio embutido na bolha do assistant. */
export type ReasoningState = {
  steps: ThinkStep[]
  /** Quantos passos já apareceram (streaming dos passos). */
  visibleSteps: number
  /** Tempo de raciocínio em décimos de segundo (determinístico, por timer). */
  elapsedTenths: number
  /** true enquanto "pensando" (controla indicador + status do passo). */
  active: boolean
  /** Disclosure aberto/fechado. */
  expanded: boolean
  /** true quando o raciocínio terminou e o bloco auto-contraiu. */
  done: boolean
}

export type AiMessage = {
  id: number
  from: Role
  /** Texto-alvo final. */
  fullText: string
  /** Texto revelado até agora (efeito de digitação). */
  shownText: string
  /** true quando `shownText === fullText`. */
  streamed: boolean
  code?: AiCode
  reasoning?: ReasoningState
}

export const INITIAL_THREAD: AiMessage[] = [
  {
    id: 1,
    from: "assistant",
    fullText:
      "Oi! Sou seu copiloto. Posso explicar, corrigir ou refatorar qualquer arquivo do projeto. Use os comandos rápidos ou escreva um pedido — eu mostro o raciocínio e proponho um patch para você aplicar.",
    shownText:
      "Oi! Sou seu copiloto. Posso explicar, corrigir ou refatorar qualquer arquivo do projeto. Use os comandos rápidos ou escreva um pedido — eu mostro o raciocínio e proponho um patch para você aplicar.",
    streamed: true,
  },
]

export type AiModel = { id: string; name: string; vendor: string }

export const MODELS: AiModel[] = [
  { id: "gpt-4o", name: "GPT-4o", vendor: "OpenAI" },
  { id: "claude-3-7", name: "Claude 3.7 Sonnet", vendor: "Anthropic" },
  { id: "gemini-2", name: "Gemini 2.0 Pro", vendor: "Google" },
  { id: "llama-3", name: "Llama 3.1 70B", vendor: "Meta" },
]

export const AI_MODES = ["Chat", "Edit", "Agent"] as const

export const SLASH_COMMANDS: { cmd: string; label: string; prompt: string }[] = [
  { cmd: "/explain", label: "Explicar", prompt: "Explique o que este arquivo faz, linha a linha." },
  { cmd: "/fix", label: "Corrigir", prompt: "Corrija os erros e warnings deste arquivo." },
  { cmd: "/tests", label: "Testes", prompt: "Gere testes unitários para as funções deste arquivo." },
  { cmd: "/refactor", label: "Refatorar", prompt: "Refatore este arquivo para ficar mais legível e tipado." },
]

export const TERMINAL_RESPONSES: Record<string, string[]> = {
  "npm run dev": [
    "> aurora-app@1.0.0 dev",
    "> vite",
    "",
    "  VITE v6.0.0  ready in 412 ms",
    "  ➜  Local:   http://localhost:5173/",
  ],
  "npm run build": [
    "> aurora-app@1.0.0 build",
    "> vite build",
    "",
    "✓ 38 modules transformed.",
    "dist/index.html  0.46 kB",
    "✓ built in 1.21s",
  ],
  "git status": [
    "On branch main",
    "Changes not staged for commit:",
    "  modified:   src/App.tsx",
    "",
    'no changes added to commit (use "git add")',
  ],
  ls: ["README.md  package.json  src  node_modules"],
  help: [
    "Comandos disponíveis: npm run dev, npm run build, git status, ls, clear, help",
  ],
}

/** Resposta final mocada do copiloto (patch aplicável). */
export const REPLY: { text: string; code: AiCode } = {
  text: "Analisei o arquivo e preparei um patch: tipei os parâmetros, removi o estado não usado e memoizei a saudação. Revise e clique em Aplicar para escrever no editor.",
  code: {
    language: "tsx",
    filename: "src/App.tsx",
    targetId: "app",
    code: `import { useMemo, useState } from "react"
import { buildGreeting } from "@/lib/utils"
import { fetchUser } from "@/lib/api"
import type { User } from "@/lib/api"

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const greeting = useMemo(() => buildGreeting(user), [user])

  return (
    <main className="app">
      <h1>{greeting}</h1>
      <p>{user ? user.name : "Carregando…"}</p>
    </main>
  )
}`,
  },
}

/** Tempos (em ms) do roteiro determinístico de geração da resposta. */
export const GEN_TIMING = {
  /** Intervalo do contador de tempo de raciocínio (décimos de segundo). */
  tickMs: 100,
  /** Atraso até o primeiro passo aparecer. */
  firstStepMs: 450,
  /** Espaçamento entre passos. */
  stepGapMs: 800,
  /** Folga após o último passo antes de contrair e streamar. */
  afterStepsMs: 450,
  /** Respiro após o auto-contrair (≈ duração da transição de altura) antes de começar a streamar — evita o "pulo" de tela. */
  collapseRespiroMs: 340,
  /** Intervalo de revelação de cada token no streaming da resposta. */
  streamMs: 38,
}
