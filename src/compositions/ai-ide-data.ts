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

/**
 * Insere um nó dentro de uma pasta específica (por id), reabrindo-a e ordenando
 * pastas antes de arquivos. Se a pasta não existir, retorna a árvore inalterada.
 */
export function insertIntoDir(
  nodes: TreeNode[],
  dirId: string,
  node: TreeNode,
): TreeNode[] {
  return nodes.map((current) => {
    if (current.kind === "dir") {
      if (current.id === dirId) {
        const children = [...current.children, node].sort((a, b) => {
          if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        return { ...current, open: true, children }
      }
      return { ...current, children: insertIntoDir(current.children, dirId, node) }
    }
    return current
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

/** Indica se já existe um arquivo com este id em qualquer profundidade. */
export function fileExists(nodes: TreeNode[], id: string): boolean {
  for (const node of nodes) {
    if (node.kind === "file") {
      if (node.id === id) return true
    } else if (fileExists(node.children, id)) {
      return true
    }
  }
  return false
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

/* -------------------------------------------------------------------------- */
/*                          revisão de diff por hunk                           */
/* -------------------------------------------------------------------------- */

/**
 * Bloco de um diff unificado pré-computado (determinístico — sem algoritmo de
 * diffing em runtime). Um `context` são linhas inalteradas; um `hunk` agrupa as
 * linhas removidas (`removed`) e adicionadas (`added`) de um trecho decidível.
 */
export type DiffBlock =
  | { kind: "context"; lines: string[] }
  | { kind: "hunk"; id: string; removed: string[]; added: string[] }

/** Decisão do usuário sobre um hunk durante a revisão. */
export type HunkStatus = "pending" | "accepted" | "rejected"

/** Plano de revisão de uma mudança: arquivo-alvo + blocos do diff. */
export type DiffPlan = {
  targetId: string
  filename: string
  blocks: DiffBlock[]
}

/** Soma agregada de linhas adicionadas/removidas de todos os hunks. */
export function countDiff(blocks: DiffBlock[]): { added: number; removed: number } {
  let added = 0
  let removed = 0
  for (const block of blocks) {
    if (block.kind === "hunk") {
      added += block.added.length
      removed += block.removed.length
    }
  }
  return { added, removed }
}

/**
 * Reconstrói o conteúdo final do arquivo a partir das decisões: hunk aceito vira
 * suas linhas `added`; hunk pendente ou rejeitado mantém as linhas `removed`
 * (estado original). Contexto é sempre preservado.
 */
export function materializeDiff(
  blocks: DiffBlock[],
  statuses: Record<string, HunkStatus>,
): string {
  const out: string[] = []
  for (const block of blocks) {
    if (block.kind === "context") {
      out.push(...block.lines)
    } else {
      out.push(...(statuses[block.id] === "accepted" ? block.added : block.removed))
    }
  }
  return out.join("\n")
}

export type AiCode = {
  language: Lang
  filename: string
  code: string
  targetId: string
  /** Diff segmentado em hunks para a revisão inline (aceitar/rejeitar). */
  blocks: DiffBlock[]
}

export type ThinkStep = {
  icon: "search" | "brain" | "settings" | "check" | "globe"
  label: string
  description?: string
  sources?: { label: string; color: "blue" | "green" | "violet" }[]
  details?: { summary: string; items: string[] }
}

/** Ícone (mock) associado a uma chamada de ferramenta do agente. */
export type ToolIcon = "file" | "search" | "terminal" | "folder" | "regex"

/**
 * Cartão de \"uso de ferramenta\" exibido durante o raciocínio (estilo agentic):
 * nome da tool (mono), argumento e um mini-resultado mocado determinístico.
 */
export type ToolCall = {
  icon: ToolIcon
  /** Nome da ferramenta (ex.: `read_file`). */
  tool: string
  /** Argumento da chamada (ex.: `api.ts`). */
  arg: string
  /** Mini-resultado mocado (ex.: `42 linhas`). */
  result: string
}

/**
 * Item do fluxo de raciocínio embutido: ou um passo textual (`text`) ou um
 * cartão de chamada de ferramenta (`tool`). Renderizados na mesma sequência de
 * reveal por timer determinístico — um único pipeline de scroll.
 */
export type ReasoningItem =
  | { kind: "text"; step: ThinkStep }
  | { kind: "tool"; tool: ToolCall }

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

/**
 * Chamadas de ferramenta mocadas (determinísticas) que o agente \"executa\"
 * durante o raciocínio. Cobrem leitura de arquivo, busca, terminal e listagem.
 */
export const TOOL_CALLS: ToolCall[] = [
  { icon: "file", tool: "read_file", arg: "src/App.tsx", result: "32 linhas" },
  { icon: "search", tool: "search", arg: '"buildGreeting"', result: "3 ocorrências" },
  { icon: "folder", tool: "list_dir", arg: "src/lib", result: "8 itens" },
  { icon: "file", tool: "read_file", arg: "lib/api.ts", result: "42 linhas" },
  { icon: "terminal", tool: "run_terminal", arg: "npm test", result: "✓ 12 passando" },
]

/**
 * Fluxo unificado do raciocínio embutido: intercala os passos textuais com os
 * cartões de chamada de ferramenta, em ordem determinística de reveal. Um único
 * pipeline garante a mesma cadência e o mesmo stick-to-bottom.
 */
export const REASONING_ITEMS: ReasoningItem[] = [
  { kind: "text", step: THINK_STEPS[0] },
  { kind: "tool", tool: TOOL_CALLS[0] },
  { kind: "tool", tool: TOOL_CALLS[1] },
  { kind: "text", step: THINK_STEPS[1] },
  { kind: "tool", tool: TOOL_CALLS[2] },
  { kind: "tool", tool: TOOL_CALLS[3] },
  { kind: "tool", tool: TOOL_CALLS[4] },
  { kind: "text", step: THINK_STEPS[2] },
]

/** Estado do raciocínio embutido na bolha do assistant. */
export type ReasoningState = {
  items: ReasoningItem[]
  /** Quantos itens já apareceram (streaming dos passos + tool calls). */
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
    blocks: [
      {
        kind: "context",
        lines: [
          `import { useMemo, useState } from "react"`,
          `import { buildGreeting } from "@/lib/utils"`,
          `import { fetchUser } from "@/lib/api"`,
        ],
      },
      {
        kind: "hunk",
        id: "h-import-type",
        removed: [],
        added: [`import type { User } from "@/lib/api"`],
      },
      { kind: "context", lines: ["", "export function App() {"] },
      {
        kind: "hunk",
        id: "h-state",
        removed: ["  const [user, setUser] = useState(null)"],
        added: [
          "  const [user, setUser] = useState<User | null>(null)",
          "  const greeting = useMemo(() => buildGreeting(user), [user])",
        ],
      },
      {
        kind: "context",
        lines: ["", "  return (", `    <main className="app">`],
      },
      {
        kind: "hunk",
        id: "h-heading",
        removed: ["      <h1>Olá, mundo</h1>"],
        added: ["      <h1>{greeting}</h1>"],
      },
      {
        kind: "context",
        lines: [
          `      <p>{user ? user.name : "Carregando…"}</p>`,
          "    </main>",
          "  )",
          "}",
        ],
      },
    ],
  },
}

/* -------------------------------------------------------------------------- */
/*                       modo Agent — plano multi-arquivo                      */
/* -------------------------------------------------------------------------- */

/** Tipo de cada passo do plano de execução do agente. */
export type AgentStepKind = "create" | "edit" | "run"

/** Estado de um passo durante a execução do plano. */
export type AgentStepStatus = "pending" | "running" | "done"

/**
 * Passo TIPADO de um plano do modo Agent (determinístico, sem runtime real).
 * `kind` decide o efeito aplicado na IDE ao executar:
 *  - `create`: insere `fileId`/`fileName` na árvore e abre a tab (conteúdo `code`).
 *  - `edit`: substitui o conteúdo de `targetId` no editor e marca modificado.
 *  - `run`: escreve `command` + `output` no terminal mock.
 * `detail` é um mini-resumo exibido ao concluir (ex.: `+24 linhas`, `✓ 12 passando`).
 */
export type AgentPlanStep =
  | {
      kind: "create"
      id: string
      label: string
      detail: string
      fileId: string
      fileName: string
      /** Pasta-alvo (id) onde o arquivo é criado; fallback para a raiz. */
      dirId: string
      lang: Lang
      code: string
    }
  | {
      kind: "edit"
      id: string
      label: string
      detail: string
      targetId: string
      code: string
    }
  | {
      kind: "run"
      id: string
      label: string
      detail: string
      command: string
      output: string[]
    }

/** Estado de um passo do plano em execução (definição + status corrente). */
export type AgentStep = AgentPlanStep & { status: AgentStepStatus }

/** Fase do orquestrador do agente. */
export type AgentRunStatus =
  | "idle"
  | "running"
  | "paused"
  | "stopped"
  | "done"

/** Estado completo de uma execução de plano do agente. */
export type AgentRun = {
  /** Id da mensagem do assistant que hospeda o plano na thread. */
  messageId: number
  prompt: string
  steps: AgentStep[]
  /** Índice do passo corrente (0..steps.length); === length quando concluído. */
  currentIndex: number
  status: AgentRunStatus
}

/** Rótulo curto de cada tipo de passo (badge do plano). */
export const AGENT_KIND_LABEL: Record<AgentStepKind, string> = {
  create: "Criar",
  edit: "Editar",
  run: "Rodar",
}

/**
 * Plano de execução determinístico do modo Agent: cria dois arquivos novos,
 * edita o `App.tsx` para usá-los e roda os comandos de teste e build. Inclui ao
 * menos um passo de cada tipo (create/edit/run), na ordem de reveal/execução.
 */
export const AGENT_PLAN: AgentPlanStep[] = [
  {
    kind: "create",
    id: "ag-create-types",
    label: "Criar src/lib/types.ts",
    detail: "+12 linhas",
    fileId: "agent-types",
    fileName: "types.ts",
    dirId: "lib",
    lang: "ts",
    code: `// Tipos compartilhados do domínio
export type User = {
  id: string
  name: string
  email: string
}

export type ApiResult<T> = {
  data: T
  error: string | null
}`,
  },
  {
    kind: "create",
    id: "ag-create-format",
    label: "Criar src/lib/format.ts",
    detail: "+9 linhas",
    fileId: "agent-format",
    fileName: "format.ts",
    dirId: "lib",
    lang: "ts",
    code: `import type { User } from "@/lib/types"

export function formatUser(user: User): string {
  return user.name + " <" + user.email + ">"
}

export function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase()
}`,
  },
  {
    kind: "edit",
    id: "ag-edit-app",
    label: "Editar src/App.tsx",
    detail: "+3 linhas",
    targetId: "app",
    code: `import { useMemo, useState } from "react"
import { buildGreeting } from "@/lib/utils"
import { fetchUser } from "@/lib/api"
import type { User } from "@/lib/types"
import { formatUser } from "@/lib/format"

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const greeting = useMemo(() => buildGreeting(user), [user])

  return (
    <main className="app">
      <h1>{greeting}</h1>
      <p>{user ? formatUser(user) : "Carregando…"}</p>
    </main>
  )
}`,
  },
  {
    kind: "run",
    id: "ag-run-test",
    label: "Rodar npm test",
    detail: "✓ 12 passando",
    command: "npm test",
    output: [
      "> aurora-app@1.0.0 test",
      "> vitest run",
      "",
      "✓ src/lib/format.test.ts (4)",
      "✓ src/lib/utils.test.ts (8)",
      "",
      "Test Files  2 passed (2)",
      "     Tests  12 passed (12)",
    ],
  },
  {
    kind: "run",
    id: "ag-run-build",
    label: "Rodar npm run build",
    detail: "✓ build ok",
    command: "npm run build",
    output: [
      "> aurora-app@1.0.0 build",
      "> vite build",
      "",
      "✓ 40 modules transformed.",
      "dist/index.html  0.46 kB",
      "✓ built in 1.34s",
    ],
  },
]

/** Resposta do assistant ao receber um prompt no modo Agent. */
export const AGENT_REPLY_TEXT =
  "Montei um plano de execução com 5 passos: 2 arquivos novos, 1 edição e 2 comandos. Acompanhe o progresso abaixo — dá para pausar ou parar a qualquer momento."

/** Tempos (em ms) do roteiro determinístico do driver do modo Agent. */
export const AGENT_TIMING = {
  /** Atraso até o plano ficar visível e o primeiro passo começar. */
  planRevealMs: 360,
  /** Duração em que um passo fica "em execução" antes de concluir. */
  stepRunMs: 820,
  /** Folga entre concluir um passo e iniciar o próximo. */
  stepGapMs: 260,
}

/** Tempos (em ms) do roteiro determinístico de geração da resposta. */
export const GEN_TIMING = {
  /** Intervalo do contador de tempo de raciocínio (décimos de segundo). */
  tickMs: 100,
  /** Atraso até o primeiro passo aparecer. */
  firstStepMs: 450,
  /** Espaçamento entre itens do raciocínio (passos textuais + tool calls). */
  stepGapMs: 300,
  /** Folga após o último passo antes de contrair e streamar. */
  afterStepsMs: 450,
  /** Respiro após o auto-contrair (≈ duração da transição de altura) antes de começar a streamar — evita o "pulo" de tela. */
  collapseRespiroMs: 340,
  /** Intervalo de revelação de cada token no streaming da resposta. */
  streamMs: 38,
}
