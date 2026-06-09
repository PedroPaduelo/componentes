/**
 * Composição "IDE com IA" (ai-ide).
 *
 * Ambiente de IDE estilo VS Code montado SÓ com componentes do registry da
 * vitrine, 100% mocado, com a IA como protagonista. Tudo em tokens shadcn
 * (light/dark), responsivo (painel da IA vira Sheet em telas estreitas).
 *
 * Estado real (useState/useMemo/useRef):
 *  - Activity bar troca o side panel (Explorer / Search / Source Control).
 *  - File tree abre/foca tabs no editor; tabs fecháveis com dot de não-salvo.
 *  - Editor apresentacional com numeração de linha, syntax highlight por
 *    tokens e ghost suggestion inline aceitável (Tab/botão).
 *  - Painel da IA: seletor de modelo (DropdownFluid), modos Chat/Edit/Agent
 *    (TabsSubtleFluid), thread (ChatMessageFluid), raciocínio (ThinkingStepsFluid)
 *    no envio, resposta com bloco de código + "Aplicar" que edita o arquivo
 *    (mock) e o marca como modificado (dot na tab + Source Control + status bar),
 *    chips de contexto (@arquivo), slash commands e composer (InputMessageFluid).
 *  - Painel inferior: Terminal mock que responde a comandos, Problems, Output.
 *  - Command palette (⌘K) busca arquivos e comandos e executa a ação.
 *  - Status bar reativa (branch, erros/warnings, linguagem, Ln/Col).
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  Bot,
  Check,
  ChevronRight,
  Circle,
  CircleDot,
  FileCode2,
  FileText,
  Files,
  FileType2,
  FolderOpen,
  GitBranch,
  Hash,
  Play,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  TerminalSquare,
  TriangleAlert,
  X,
  Braces,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { ButtonFluid } from "@/components/ui/button-fluid"
import { BadgeFluid } from "@/components/ui/badge-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import { InputMessageFluid } from "@/components/ui/input-message-fluid"
import {
  ChatMessageFluid,
  ThinkingStepsFluid,
  ThinkingStepsHeaderFluid,
  ThinkingStepsContentFluid,
  ThinkingStepFluid,
  ThinkingStepDetailsFluid,
  ThinkingStepSourcesFluid,
  ThinkingStepSourceFluid,
  TabsSubtleFluid,
  TabsSubtleFluidItem,
  DropdownFluid,
  DropdownFluidLabel,
  DropdownFluidSeparator,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui"
import { ThinkingIndicatorFluid } from "@/components/ui/thinking-indicator-fluid"
import { MenuItemFluid } from "@/components/ui/menu-item-fluid"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                            syntax highlight leve                            */
/* -------------------------------------------------------------------------- */

type TokenKind =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "fn"
  | "tag"
  | "plain"

const TOKEN_CLASS: Record<TokenKind, string> = {
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

type Token = { text: string; kind: TokenKind }

function tokenizeLine(line: string): Token[] {
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

function HighlightedLine({ line }: { line: string }) {
  if (line === "") return <span>{"\u00A0"}</span>
  return (
    <>
      {tokenizeLine(line).map((tok, i) =>
        tok.kind === "plain" ? (
          <span key={i}>{tok.text}</span>
        ) : (
          <span key={i} className={TOKEN_CLASS[tok.kind]}>
            {tok.text}
          </span>
        ),
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                              modelo de dados                                */
/* -------------------------------------------------------------------------- */

type Lang = "tsx" | "ts" | "css" | "md" | "json"

const LANG_LABEL: Record<Lang, string> = {
  tsx: "TypeScript React",
  ts: "TypeScript",
  css: "CSS",
  md: "Markdown",
  json: "JSON",
}

const LANG_ICON: Record<Lang, LucideIcon> = {
  tsx: FileCode2,
  ts: FileType2,
  css: Braces,
  md: FileText,
  json: Braces,
}

type FileNode = {
  id: string
  name: string
  path: string
  lang: Lang
  /** Código inicial (mock). Mutável em runtime via "Aplicar" da IA. */
  code: string
  /** Sugestão fantasma inline aceitável (apenas no arquivo de boas-vindas). */
  ghost?: string
  /** Problemas associados ao arquivo (para o painel Problems). */
  problems?: { line: number; message: string; severity: "error" | "warning" }[]
}

type TreeDir = {
  id: string
  name: string
  children: (TreeDir | { fileId: string })[]
}

const FILES: FileNode[] = [
  {
    id: "app",
    name: "App.tsx",
    path: "src/App.tsx",
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
    id: "utils",
    name: "utils.ts",
    path: "src/lib/utils.ts",
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
    id: "api",
    name: "api.ts",
    path: "src/lib/api.ts",
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
  {
    id: "styles",
    name: "index.css",
    path: "src/index.css",
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
  {
    id: "readme",
    name: "README.md",
    path: "README.md",
    lang: "md",
    code: `# Aurora App

Projeto de exemplo gerado pela IDE com IA.

## Scripts

- npm run dev — inicia o servidor
- npm run build — gera o bundle de produção

> Dica: peça à IA para explicar ou refatorar qualquer arquivo.`,
  },
  {
    id: "pkg",
    name: "package.json",
    path: "package.json",
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

const TREE: TreeDir = {
  id: "root",
  name: "aurora-app",
  children: [
    {
      id: "src",
      name: "src",
      children: [
        {
          id: "lib",
          name: "lib",
          children: [{ fileId: "utils" }, { fileId: "api" }],
        },
        { fileId: "app" },
        { fileId: "styles" },
      ],
    },
    { fileId: "readme" },
    { fileId: "pkg" },
  ],
}

type Role = "user" | "assistant"

type AiCode = { language: Lang; filename: string; code: string; targetId: string }

type AiMessage = {
  id: number
  from: Role
  text: string
  code?: AiCode
}

const INITIAL_THREAD: AiMessage[] = [
  {
    id: 1,
    from: "assistant",
    text: "Oi! Sou seu copiloto. Posso explicar, corrigir ou refatorar qualquer arquivo do projeto. Use os comandos rápidos ou escreva um pedido — eu mostro o raciocínio e proponho um patch para você aplicar.",
  },
]

type ThinkStep = {
  icon: "search" | "brain" | "settings" | "check" | "globe"
  label: string
  description?: string
  sources?: { label: string; color: "blue" | "green" | "violet" }[]
  details?: { summary: string; items: string[] }
}

const THINK_STEPS: ThinkStep[] = [
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

type AiModel = { id: string; name: string; vendor: string }

const MODELS: AiModel[] = [
  { id: "gpt-4o", name: "GPT-4o", vendor: "OpenAI" },
  { id: "claude-3-7", name: "Claude 3.7 Sonnet", vendor: "Anthropic" },
  { id: "gemini-2", name: "Gemini 2.0 Pro", vendor: "Google" },
  { id: "llama-3", name: "Llama 3.1 70B", vendor: "Meta" },
]

const AI_MODES = ["Chat", "Edit", "Agent"] as const

const SLASH_COMMANDS: { cmd: string; label: string; prompt: string }[] = [
  { cmd: "/explain", label: "Explicar", prompt: "Explique o que este arquivo faz, linha a linha." },
  { cmd: "/fix", label: "Corrigir", prompt: "Corrija os erros e warnings deste arquivo." },
  { cmd: "/tests", label: "Testes", prompt: "Gere testes unitários para as funções deste arquivo." },
  { cmd: "/refactor", label: "Refatorar", prompt: "Refatore este arquivo para ficar mais legível e tipado." },
]

const TERMINAL_RESPONSES: Record<string, string[]> = {
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

const REPLY_DELAY_MS = 1300

const REPLY: { text: string; code: AiCode } = {
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

/* -------------------------------------------------------------------------- */
/*                              sub-componentes                                */
/* -------------------------------------------------------------------------- */

type ActivityKey = "explorer" | "search" | "scm" | "run" | "extensions"

function ActivityBar({
  active,
  onSelect,
  modifiedCount,
}: {
  active: ActivityKey
  onSelect: (key: ActivityKey) => void
  modifiedCount: number
}) {
  const items: { key: ActivityKey; icon: LucideIcon; label: string; badge?: number }[] = [
    { key: "explorer", icon: Files, label: "Explorer" },
    { key: "search", icon: Search, label: "Buscar" },
    { key: "scm", icon: GitBranch, label: "Controle de origem", badge: modifiedCount },
    { key: "run", icon: Play, label: "Executar e depurar" },
    { key: "extensions", icon: Puzzle, label: "Extensões" },
  ]
  return (
    <nav
      aria-label="Barra de atividades"
      className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-card/60 py-2"
    >
      {items.map((item) => {
        const isActive = item.key === active
        const Icon = item.icon
        return (
          <TooltipFluid key={item.key} content={item.label} side="right">
            <button
              type="button"
              onClick={() => onSelect(item.key)}
              aria-current={isActive ? "true" : undefined}
              data-active={isActive ? "true" : undefined}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
            </button>
          </TooltipFluid>
        )
      })}
      <div className="mt-2 flex flex-col items-center gap-1">
        <TooltipFluid content="Copiloto IA" side="right">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Sparkles className="size-5" />
          </span>
        </TooltipFluid>
      </div>
      <div className="mt-auto">
        <TooltipFluid content="Configurações" side="right">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            aria-label="Configurações"
          >
            <Settings className="size-5" />
          </button>
        </TooltipFluid>
      </div>
    </nav>
  )
}

function FileTreeNode({
  node,
  depth,
  activeId,
  modified,
  onOpen,
}: {
  node: TreeDir | { fileId: string }
  depth: number
  activeId: string
  modified: Set<string>
  onOpen: (id: string) => void
}) {
  const PAD: Record<number, string> = { 0: "pl-2", 1: "pl-5", 2: "pl-8", 3: "pl-11" }
  const padClass = PAD[depth] ?? "pl-11"

  if ("fileId" in node) {
    const file = FILES.find((f) => f.id === node.fileId)
    if (!file) return null
    const isActive = file.id === activeId
    const isModified = modified.has(file.id)
    const Icon = LANG_ICON[file.lang]
    return (
      <button
        type="button"
        onClick={() => onOpen(file.id)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-1.5 py-1 pr-2 text-left text-[13px] transition-colors",
          padClass,
          isActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{file.name}</span>
        {isModified ? (
          <CircleDot className="ml-auto size-3 shrink-0 text-amber-500" />
        ) : null}
      </button>
    )
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 py-1 pr-2 text-[13px] font-medium text-foreground",
          padClass,
        )}
      >
        <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
      </div>
      <div>
        {node.children.map((child, i) => (
          <FileTreeNode
            key={"id" in child ? child.id : child.fileId + i}
            node={child}
            depth={depth + 1}
            activeId={activeId}
            modified={modified}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}

function SidePanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-8 items-center px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   AiIde                                     */
/* -------------------------------------------------------------------------- */

export function AiIde() {
  // ── activity bar + side panel ──────────────────────────────────────────
  const [activity, setActivity] = useState<ActivityKey>("explorer")
  const [searchQuery, setSearchQuery] = useState("")
  const [commitMsg, setCommitMsg] = useState("")

  // ── editor ──────────────────────────────────────────────────────────────
  const [openTabs, setOpenTabs] = useState<string[]>(["app", "utils"])
  const [activeId, setActiveId] = useState<string>("app")
  const [codes, setCodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(FILES.map((f) => [f.id, f.code])),
  )
  const [modified, setModified] = useState<Set<string>>(() => new Set())
  const [ghostAccepted, setGhostAccepted] = useState(false)

  // ── painel IA ─────────────────────────────────────────────────────────
  const [thread, setThread] = useState<AiMessage[]>(INITIAL_THREAD)
  const [pending, setPending] = useState(false)
  const [composer, setComposer] = useState("")
  const [modelId, setModelId] = useState(MODELS[0].id)
  const [mode, setMode] = useState(0)
  const [contextFiles, setContextFiles] = useState<Set<string>>(() => new Set(["app"]))
  const [aiSheetOpen, setAiSheetOpen] = useState(false)

  // ── painel inferior ──────────────────────────────────────────────────
  const [bottomTab, setBottomTab] = useState<"terminal" | "problems" | "output">("terminal")
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const [terminalInput, setTerminalInput] = useState("")
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "aurora-app — zsh",
    "Digite um comando (ex.: npm run dev, git status, help).",
  ])

  // ── command palette ─────────────────────────────────────────────────
  const [paletteOpen, setPaletteOpen] = useState(false)

  // ── caret (Ln/Col) ──────────────────────────────────────────────────
  const [caret, setCaret] = useState<{ line: number; col: number }>({ line: 1, col: 1 })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const terminalScrollRef = useRef<HTMLDivElement>(null)

  // Limpa o timer pendente ao desmontar.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Auto-scroll do chat ao mudar a thread ou o estado de "thinking".
  useEffect(() => {
    const el = chatScrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread, pending])

  // Auto-scroll do terminal ao adicionar linhas.
  useEffect(() => {
    const el = terminalScrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [terminalLines, bottomTab])

  // ⌘K / Ctrl+K abre o command palette.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const activeFile = useMemo(
    () => FILES.find((f) => f.id === activeId) ?? FILES[0],
    [activeId],
  )
  const activeCode = codes[activeId] ?? ""
  const codeLines = useMemo(() => activeCode.split("\n"), [activeCode])

  const allProblems = useMemo(
    () =>
      FILES.flatMap((f) =>
        (f.problems ?? []).map((p) => ({ ...p, file: f })),
      ),
    [],
  )
  const errorCount = allProblems.filter((p) => p.severity === "error").length
  const warningCount = allProblems.filter((p) => p.severity === "warning").length
  const activeModel = MODELS.find((m) => m.id === modelId) ?? MODELS[0]

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    const out: { file: FileNode; line: number; text: string }[] = []
    for (const file of FILES) {
      const lines = (codes[file.id] ?? "").split("\n")
      lines.forEach((text, i) => {
        if (text.toLowerCase().includes(q)) {
          out.push({ file, line: i + 1, text: text.trim() })
        }
      })
    }
    return out.slice(0, 20)
  }, [searchQuery, codes])

  // ── ações ───────────────────────────────────────────────────────────
  const openFile = useCallback((id: string) => {
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setActiveId(id)
    setCaret({ line: 1, col: 1 })
  }, [])

  const closeTab = useCallback(
    (id: string) => {
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t !== id)
        if (id === activeId && next.length > 0) {
          setActiveId(next[next.length - 1])
        }
        return next
      })
    },
    [activeId],
  )

  const acceptGhost = useCallback(() => {
    const ghost = activeFile.ghost
    if (!ghost || ghostAccepted) return
    setCodes((prev) => {
      const lines = (prev[activeFile.id] ?? "").split("\n")
      // Insere a sugestão logo após a linha do useState (linha 6 do App.tsx).
      const insertAt = Math.min(6, lines.length)
      lines.splice(insertAt, 0, ghost)
      return { ...prev, [activeFile.id]: lines.join("\n") }
    })
    setGhostAccepted(true)
    setModified((prev) => new Set(prev).add(activeFile.id))
  }, [activeFile, ghostAccepted])

  const applyPatch = useCallback((code: AiCode) => {
    setCodes((prev) => ({ ...prev, [code.targetId]: code.code }))
    setModified((prev) => new Set(prev).add(code.targetId))
    setOpenTabs((prev) => (prev.includes(code.targetId) ? prev : [...prev, code.targetId]))
    setActiveId(code.targetId)
    setActivity("scm")
  }, [])

  const sendPrompt = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setThread((prev) => {
      const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1
      return [...prev, { id: nextId, from: "user", text: trimmed }]
    })
    setComposer("")
    setPending(true)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setThread((prev) => {
        const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1
        return [
          ...prev,
          { id: nextId, from: "assistant", text: REPLY.text, code: REPLY.code },
        ]
      })
      setPending(false)
      timerRef.current = null
    }, REPLY_DELAY_MS)
  }, [])

  const runTerminal = useCallback(() => {
    const cmd = terminalInput.trim()
    if (!cmd) return
    if (cmd === "clear") {
      setTerminalLines([])
      setTerminalInput("")
      return
    }
    const response = TERMINAL_RESPONSES[cmd] ?? [`zsh: command not found: ${cmd}`]
    setTerminalLines((prev) => [...prev, `$ ${cmd}`, ...response])
    setTerminalInput("")
  }, [terminalInput])

  const commitChanges = useCallback(() => {
    if (modified.size === 0) return
    setModified(new Set())
    setCommitMsg("")
    setTerminalLines((prev) => [
      ...prev,
      `$ git commit -m "${commitMsg || "atualiza arquivos"}"`,
      `[main] ${modified.size} arquivo(s) committed`,
    ])
  }, [modified, commitMsg])

  const toggleContext = useCallback((id: string) => {
    setContextFiles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  /* ---- painel IA (reutilizado no desktop e no Sheet mobile) ---- */
  const aiPanel = (
    <div className="flex h-full min-h-0 flex-col bg-card/40">
      {/* header do painel IA */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Copiloto</span>
        <div className="ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent/50"
                aria-label="Selecionar modelo de IA"
              >
                <Bot className="size-3.5 text-muted-foreground" />
                {activeModel.name}
                <ChevronRight className="size-3 rotate-90 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={6} className="p-0">
              <DropdownFluid
                data-slot="model-picker"
                checkedIndex={MODELS.findIndex((m) => m.id === modelId)}
              >
                <DropdownFluidLabel>Modelo de IA</DropdownFluidLabel>
                <DropdownFluidSeparator />
                {MODELS.map((model, i) => (
                  <MenuItemFluid
                    key={model.id}
                    index={i}
                    icon={Bot}
                    label={`${model.name} · ${model.vendor}`}
                    checked={model.id === modelId}
                    onSelect={() => setModelId(model.id)}
                  />
                ))}
              </DropdownFluid>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* modos Chat/Edit/Agent */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 py-1.5">
        <TabsSubtleFluid selectedIndex={mode} onSelect={setMode} idPrefix="ai-mode">
          {AI_MODES.map((label, i) => (
            <TabsSubtleFluidItem
              key={label}
              index={i}
              label={label}
              icon={i === 0 ? Bot : i === 1 ? FileCode2 : Sparkles}
            />
          ))}
        </TabsSubtleFluid>
      </div>

      {/* thread */}
      <div
        ref={chatScrollRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4"
      >
        {thread.map((m) =>
          m.from === "user" ? (
            <ChatMessageFluid key={m.id} from="user">
              {m.text}
            </ChatMessageFluid>
          ) : (
            <div key={m.id} className="flex w-full flex-col gap-2 self-start">
              <ChatMessageFluid from="assistant">{m.text}</ChatMessageFluid>
              {m.code ? (
                <div className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-muted/40">
                  <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <FileCode2 className="size-3" />
                      {m.code.filename}
                    </span>
                    <ButtonFluid
                      variant="primary"
                      size="sm"
                      onClick={() => m.code && applyPatch(m.code)}
                    >
                      <Check className="size-3.5" />
                      Aplicar
                    </ButtonFluid>
                  </div>
                  <pre className="max-h-48 overflow-auto px-3 py-2 font-mono text-[12px] leading-5">
                    <code>
                      {m.code.code.split("\n").map((line, i) => (
                        <div key={i}>
                          <HighlightedLine line={line} />
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              ) : null}
            </div>
          ),
        )}

        {pending ? (
          <div className="flex w-full max-w-full flex-col gap-2 self-start">
            <ThinkingStepsFluid defaultOpen>
              <ThinkingStepsHeaderFluid>Raciocinando</ThinkingStepsHeaderFluid>
              <ThinkingStepsContentFluid>
                {THINK_STEPS.map((step, i) => {
                  const isLast = i === THINK_STEPS.length - 1
                  return (
                    <ThinkingStepFluid
                      key={step.label}
                      index={i}
                      icon={step.icon}
                      label={step.label}
                      description={step.description}
                      status={isLast ? "active" : "complete"}
                      isLast={isLast}
                    >
                      {step.sources ? (
                        <ThinkingStepSourcesFluid>
                          {step.sources.map((s) => (
                            <ThinkingStepSourceFluid key={s.label} color={s.color}>
                              {s.label}
                            </ThinkingStepSourceFluid>
                          ))}
                        </ThinkingStepSourcesFluid>
                      ) : null}
                      {step.details ? (
                        <ThinkingStepDetailsFluid
                          summary={step.details.summary}
                          details={step.details.items}
                        />
                      ) : null}
                    </ThinkingStepFluid>
                  )
                })}
              </ThinkingStepsContentFluid>
            </ThinkingStepsFluid>
            <div className="flex items-center gap-2 pl-1 text-[13px] text-muted-foreground">
              <ThinkingIndicatorFluid />
              <span>Gerando resposta…</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* chips de contexto + slash commands + composer */}
      <div className="shrink-0 space-y-2 border-t border-border px-3 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Contexto:</span>
          {FILES.slice(0, 4).map((f) => {
            const on = contextFiles.has(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleContext(f.id)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                  on
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent/50",
                )}
              >
                <Hash className="size-2.5" />
                {f.name}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SLASH_COMMANDS.map((s) => (
            <button
              key={s.cmd}
              type="button"
              onClick={() => setComposer(`${s.cmd} ${s.prompt}`)}
              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              {s.cmd}
            </button>
          ))}
        </div>
        <InputMessageFluid
          value={composer}
          onValueChange={setComposer}
          placeholder="Peça uma explicação, correção ou patch…"
          onSend={sendPrompt}
        />
      </div>
    </div>
  )

  /* ---- side panel ---- */
  const sidePanel = (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      {activity === "explorer" ? (
        <>
          <SidePanelHeader>Explorer</SidePanelHeader>
          <div className="min-h-0 flex-1 overflow-y-auto pb-2">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
              {TREE.name}
            </div>
            {TREE.children.map((child, i) => (
              <FileTreeNode
                key={"id" in child ? child.id : child.fileId + i}
                node={child}
                depth={0}
                activeId={activeId}
                modified={modified}
                onOpen={openFile}
              />
            ))}
          </div>
        </>
      ) : null}

      {activity === "search" ? (
        <>
          <SidePanelHeader>Buscar</SidePanelHeader>
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
              <Search className="size-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no projeto…"
                aria-label="Buscar no projeto"
                className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {searchQuery.trim() === "" ? (
              <p className="px-2 py-3 text-[12px] text-muted-foreground">
                Digite para buscar nos arquivos do projeto.
              </p>
            ) : searchResults.length === 0 ? (
              <p className="px-2 py-3 text-[12px] text-muted-foreground">
                Nenhum resultado para “{searchQuery}”.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {searchResults.map((r) => (
                  <li key={`${r.file.id}-${r.line}`}>
                    <button
                      type="button"
                      onClick={() => openFile(r.file.id)}
                      className="flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
                    >
                      <span className="flex items-center gap-1 text-[12px] text-foreground">
                        <FileCode2 className="size-3 text-muted-foreground" />
                        {r.file.name}:{r.line}
                      </span>
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {r.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}

      {activity === "scm" ? (
        <>
          <SidePanelHeader>Controle de origem</SidePanelHeader>
          <div className="px-3 pb-2">
            <input
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="Mensagem do commit"
              aria-label="Mensagem do commit"
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <ButtonFluid
              variant="primary"
              size="sm"
              className="mt-2 w-full"
              disabled={modified.size === 0}
              onClick={commitChanges}
            >
              <Check className="size-3.5" />
              Commit ({modified.size})
            </ButtonFluid>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
              Alterações ({modified.size})
            </div>
            {modified.size === 0 ? (
              <p className="px-2 py-3 text-[12px] text-muted-foreground">
                Nenhuma alteração. Aplique um patch da IA ou aceite uma sugestão.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {[...modified].map((id) => {
                  const f = FILES.find((x) => x.id === id)
                  if (!f) return null
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => openFile(id)}
                        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-accent/50"
                      >
                        <FileCode2 className="size-3.5 text-muted-foreground" />
                        <span className="truncate">{f.name}</span>
                        <span className="ml-auto text-[11px] font-semibold text-amber-500">
                          M
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      ) : null}

      {activity === "run" ? (
        <>
          <SidePanelHeader>Executar e depurar</SidePanelHeader>
          <div className="px-3 py-4 text-[12px] text-muted-foreground">
            <p>Nenhuma configuração de execução.</p>
            <ButtonFluid
              variant="secondary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setBottomTab("terminal")
                setBottomCollapsed(false)
                setTerminalLines((prev) => [...prev, "$ npm run dev", ...TERMINAL_RESPONSES["npm run dev"]])
              }}
            >
              <Play className="size-3.5" />
              Executar npm run dev
            </ButtonFluid>
          </div>
        </>
      ) : null}

      {activity === "extensions" ? (
        <>
          <SidePanelHeader>Extensões</SidePanelHeader>
          <ul className="flex flex-col gap-1 px-2 py-2">
            {["Copiloto IA", "Prettier", "ESLint", "GitLens"].map((ext) => (
              <li
                key={ext}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-[13px] text-foreground"
              >
                <Puzzle className="size-4 text-muted-foreground" />
                <span className="flex-1">{ext}</span>
                <BadgeFluid variant="solid" size="sm" color="green">
                  ativo
                </BadgeFluid>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  )

  return (
    <div
      data-slot="ai-ide"
      className="flex h-[82vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground"
    >
      {/* ── Title bar ─────────────────────────────────────────────────── */}
      <header className="flex h-10 shrink-0 items-center gap-3 border-b border-border bg-card/60 px-3">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-rose-500" aria-hidden="true" />
          <span className="size-3 rounded-full bg-amber-500" aria-hidden="true" />
          <span className="size-3 rounded-full bg-emerald-500" aria-hidden="true" />
        </div>
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
          <FileCode2 className="size-3.5 text-primary" />
          aurora-app
        </span>
        <nav className="ml-2 hidden items-center gap-1 text-[12px] text-muted-foreground sm:flex">
          {["Arquivo", "Editar", "Ver"].map((menu) => (
            <button
              key={menu}
              type="button"
              className="rounded px-2 py-1 transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              {menu}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mx-auto hidden h-6 w-72 items-center gap-2 rounded-md border border-border bg-background px-2 text-[12px] text-muted-foreground transition-colors hover:bg-accent/40 md:flex"
        >
          <Search className="size-3" />
          <span className="flex-1 text-left">aurora-app</span>
          <kbd className="rounded border border-border bg-card px-1 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
        <ButtonFluid
          variant="primary"
          size="sm"
          className="ml-auto lg:hidden"
          onClick={() => setAiSheetOpen(true)}
        >
          <Sparkles className="size-3.5" />
          Ask AI
        </ButtonFluid>
        <span className="ml-auto hidden items-center gap-1.5 text-[12px] text-primary lg:flex">
          <Sparkles className="size-3.5" />
          Ask AI
        </span>
      </header>

      {/* ── Corpo ─────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <ActivityBar active={activity} onSelect={setActivity} modifiedCount={modified.size} />
        {sidePanel}

        {/* coluna do editor + painel inferior */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* tabs do editor */}
          <div className="flex h-9 shrink-0 items-center overflow-x-auto border-b border-border bg-card/40">
            {openTabs.map((id) => {
              const f = FILES.find((x) => x.id === id)
              if (!f) return null
              const isActive = id === activeId
              const isModified = modified.has(id)
              const Icon = LANG_ICON[f.lang]
              return (
                <div
                  key={id}
                  className={cn(
                    "group flex h-full shrink-0 items-center gap-1.5 border-r border-border px-3 text-[12px] transition-colors",
                    isActive
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(id)}
                    className="flex items-center gap-1.5"
                  >
                    <Icon className="size-3.5" />
                    {f.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => closeTab(id)}
                    aria-label={`Fechar ${f.name}`}
                    className="flex size-4 items-center justify-center rounded-sm hover:bg-accent"
                  >
                    {isModified ? (
                      <Circle className="size-2.5 fill-current text-amber-500 group-hover:hidden" />
                    ) : null}
                    <X className={cn("size-3", isModified ? "hidden group-hover:block" : "")} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* breadcrumb */}
          <div className="flex h-7 shrink-0 items-center gap-1 border-b border-border px-3 text-[11px] text-muted-foreground">
            {activeFile.path.split("/").map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-3" /> : null}
                <span className={i === arr.length - 1 ? "text-foreground" : ""}>{part}</span>
              </span>
            ))}
          </div>

          {/* área de código */}
          <div className="min-h-0 flex-1 overflow-auto bg-background">
            <div className="flex min-w-max font-mono text-[13px] leading-6">
              <div className="select-none border-r border-border bg-card/30 px-3 py-2 text-right tabular-nums text-muted-foreground">
                {codeLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
                {activeFile.ghost && !ghostAccepted ? (
                  <div className="opacity-40">{codeLines.length + 1}</div>
                ) : null}
              </div>
              <div className="px-3 py-2">
                {codeLines.map((line, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCaret({ line: i + 1, col: line.length + 1 })}
                    className={cn(
                      "block w-full whitespace-pre text-left",
                      caret.line === i + 1 ? "bg-accent/40" : "",
                    )}
                  >
                    <HighlightedLine line={line} />
                  </button>
                ))}
                {activeFile.ghost && !ghostAccepted ? (
                  <div className="group flex items-center gap-2">
                    <span className="whitespace-pre text-muted-foreground/50 italic">
                      {activeFile.ghost}
                    </span>
                    <button
                      type="button"
                      onClick={acceptGhost}
                      className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      Tab para aceitar
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* painel inferior */}
          <div className="shrink-0 border-t border-border bg-card/40">
            <div className="flex h-8 items-center gap-1 px-2">
              {(["terminal", "problems", "output"] as const).map((tab) => {
                const labels = { terminal: "Terminal", problems: "Problemas", output: "Saída" }
                const isActive = tab === bottomTab && !bottomCollapsed
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      if (tab === bottomTab && !bottomCollapsed) setBottomCollapsed(true)
                      else {
                        setBottomTab(tab)
                        setBottomCollapsed(false)
                      }
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-2 py-1 text-[12px] transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "terminal" ? <TerminalSquare className="size-3.5" /> : null}
                    {tab === "problems" ? <TriangleAlert className="size-3.5" /> : null}
                    {tab === "output" ? <FileText className="size-3.5" /> : null}
                    {labels[tab]}
                    {tab === "problems" && errorCount + warningCount > 0 ? (
                      <span className="rounded-full bg-muted px-1 text-[10px]">
                        {errorCount + warningCount}
                      </span>
                    ) : null}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setBottomCollapsed((c) => !c)}
                aria-label={bottomCollapsed ? "Expandir painel" : "Recolher painel"}
                className="ml-auto flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              >
                <ChevronRight className={cn("size-4", bottomCollapsed ? "-rotate-90" : "rotate-90")} />
              </button>
            </div>

            {!bottomCollapsed ? (
              <div className="h-36 border-t border-border">
                {bottomTab === "terminal" ? (
                  <div className="flex h-full flex-col">
                    <div
                      ref={terminalScrollRef}
                      className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-5"
                    >
                      {terminalLines.map((line, i) => (
                        <div
                          key={i}
                          className={cn(
                            line.startsWith("$")
                              ? "text-foreground"
                              : line.startsWith("zsh:")
                                ? "text-rose-500"
                                : "text-muted-foreground",
                          )}
                        >
                          {line === "" ? "\u00A0" : line}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 border-t border-border px-3 py-1.5 font-mono text-[12px]">
                      <span className="text-emerald-500">aurora-app</span>
                      <span className="text-muted-foreground">$</span>
                      <input
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            runTerminal()
                          }
                        }}
                        placeholder="npm run dev"
                        aria-label="Comando do terminal"
                        className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                ) : null}

                {bottomTab === "problems" ? (
                  <div className="h-full overflow-y-auto px-3 py-2">
                    {allProblems.length === 0 ? (
                      <p className="text-[12px] text-muted-foreground">Nenhum problema detectado.</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {allProblems.map((p, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => openFile(p.file.id)}
                              className="flex w-full items-start gap-2 rounded px-1 py-0.5 text-left text-[12px] transition-colors hover:bg-accent/50"
                            >
                              <TriangleAlert
                                className={cn(
                                  "mt-0.5 size-3.5 shrink-0",
                                  p.severity === "error" ? "text-rose-500" : "text-amber-500",
                                )}
                              />
                              <span className="text-foreground">{p.message}</span>
                              <span className="ml-auto shrink-0 font-mono text-muted-foreground">
                                {p.file.name}:{p.line}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}

                {bottomTab === "output" ? (
                  <div className="h-full overflow-y-auto px-3 py-2 font-mono text-[12px] text-muted-foreground">
                    <div>[copiloto] modelo ativo: {activeModel.name}</div>
                    <div>[copiloto] modo: {AI_MODES[mode]}</div>
                    <div>[vite] HMR conectado · pronto.</div>
                    <div>[ts] {errorCount} erro(s), {warningCount} aviso(s).</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* painel IA — desktop */}
        <aside className="hidden w-96 shrink-0 border-l border-border lg:block">
          {aiPanel}
        </aside>
      </div>

      {/* ── Status bar ────────────────────────────────────────────────── */}
      <footer className="flex h-6 shrink-0 items-center gap-3 border-t border-border bg-primary/90 px-3 text-[11px] text-primary-foreground">
        <span className="flex items-center gap-1">
          <GitBranch className="size-3" />
          main
        </span>
        <span className="flex items-center gap-1">
          <TriangleAlert className="size-3" />
          {errorCount}
          <span className="opacity-70">erros</span>
        </span>
        <span className="flex items-center gap-1">
          {warningCount}
          <span className="opacity-70">avisos</span>
        </span>
        {modified.size > 0 ? (
          <span className="flex items-center gap-1">
            <CircleDot className="size-3" />
            {modified.size} modificado(s)
          </span>
        ) : null}
        <span className="ml-auto">{LANG_LABEL[activeFile.lang]}</span>
        <span className="tabular-nums">
          Ln {caret.line}, Col {caret.col}
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="size-3" />
          Copilot
          <Check className="size-3" />
        </span>
      </footer>

      {/* painel IA — mobile (Sheet) */}
      <Sheet open={aiSheetOpen} onOpenChange={setAiSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Copiloto
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-3.5rem)]">{aiPanel}</div>
        </SheetContent>
      </Sheet>

      {/* command palette ⌘K */}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Buscar arquivos e comandos…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Arquivos">
            {FILES.map((f) => (
              <CommandItem
                key={f.id}
                value={`arquivo ${f.name} ${f.path}`}
                onSelect={() => {
                  openFile(f.id)
                  setPaletteOpen(false)
                }}
              >
                <FileCode2 />
                <span>{f.name}</span>
                <CommandShortcut>{f.path}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Comandos">
            <CommandItem
              value="comando executar terminal npm run dev"
              onSelect={() => {
                setBottomTab("terminal")
                setBottomCollapsed(false)
                setTerminalLines((prev) => [...prev, "$ npm run dev", ...TERMINAL_RESPONSES["npm run dev"]])
                setPaletteOpen(false)
              }}
            >
              <Play />
              <span>Executar: npm run dev</span>
            </CommandItem>
            <CommandItem
              value="comando abrir copiloto ia chat"
              onSelect={() => {
                setAiSheetOpen(true)
                setPaletteOpen(false)
              }}
            >
              <Sparkles />
              <span>Abrir Copiloto IA</span>
            </CommandItem>
            <CommandItem
              value="comando controle de origem source control git"
              onSelect={() => {
                setActivity("scm")
                setPaletteOpen(false)
              }}
            >
              <GitBranch />
              <span>Ver Controle de origem</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
