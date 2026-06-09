/**
 * Composição "IDE com IA" (ai-ide).
 *
 * Ambiente de IDE estilo VS Code montado SÓ com componentes do registry da
 * vitrine, 100% mocado, com a IA como protagonista. Tudo em tokens shadcn
 * (light/dark), responsivo (painel da IA vira Sheet em telas estreitas) e
 * mais largo via flag `wide` em CompositionDetail.
 *
 * Imersão total — todos os botões reagem:
 *  - Explorer com árvore MUTÁVEL: abrir/fechar pastas, criar arquivo/pasta
 *    (input inline), renomear e excluir (menu de ações no hover).
 *  - Title bar com menus Arquivo/Editar/Ver como dropdowns de ações reais.
 *  - Activity bar troca painel (Explorer/Search/SCM/Run/Extensions/Settings);
 *    Run dispara no terminal; Settings tem preferências com SwitchFluid.
 *  - Editor com tabs fecháveis, caret por linha (Ln/Col) e ghost suggestion.
 *  - Painel inferior Terminal/Problems/Output, colapsável; terminal responde.
 *  - Command palette ⌘K.
 *
 * Chat com IA "UAU": ao enviar um prompt, a bolha do assistant traz o
 * raciocínio EMBUTIDO num bloco disclosure — expandido durante o "pensar"
 * (passos em streaming + indicador + contador de tempo) e auto-contraído ao
 * terminar para "Pensei por Ns ›", reabrível por clique. Em seguida a resposta
 * final aparece com efeito de digitação token-a-token e bloco de código
 * aplicável. Todos os timers limpos via refs no unmount/troca de prompt.
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
  Minus,
  Plus,
  FileCode2,
  FilePlus,
  FileText,
  Files,
  FolderOpen,
  FolderPlus,
  FolderTree,
  GitBranch,
  Hash,
  Loader2,
  Regex,
  Pencil,
  Play,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  TerminalSquare,
  Trash2,
  TriangleAlert,
  X,
  Braces,
  FileType2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { ButtonFluid } from "@/components/ui/button-fluid"
import { BadgeFluid } from "@/components/ui/badge-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import { SwitchFluid } from "@/components/ui/switch-fluid"
import { InputMessageFluid } from "@/components/ui/input-message-fluid"
import {
  ChatMessageFluid,
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
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"
import {
  AI_MODES,
  GEN_TIMING,
  INITIAL_THREAD,
  INITIAL_TREE,
  LANG_LABEL,
  MODELS,
  REASONING_ITEMS,
  REPLY,
  ROOT_NAME,
  SLASH_COMMANDS,
  TERMINAL_RESPONSES,
  TOKEN_CLASS,
  collectFiles,
  countDiff,
  deleteNode,
  findPath,
  insertAtRoot,
  langFromName,
  materializeDiff,
  renameNode,
  toggleDir,
  tokenizeLine,
  updateFileCode,
  type AiCode,
  type AiMessage,
  type DiffBlock,
  type DiffPlan,
  type FileData,
  type HunkStatus,
  type Lang,
  type ToolCall,
  type ToolIcon,
  type TreeNode,
} from "@/compositions/ai-ide-data"

/* -------------------------------------------------------------------------- */
/*                            syntax highlight leve                            */
/* -------------------------------------------------------------------------- */

const LANG_ICON: Record<Lang, LucideIcon> = {
  tsx: FileCode2,
  ts: FileType2,
  css: Braces,
  md: FileText,
  json: Braces,
}

/** Ícone lucide de cada tipo de chamada de ferramenta exibida no raciocínio. */
const TOOL_ICON: Record<ToolIcon, LucideIcon> = {
  file: FileText,
  search: Search,
  terminal: TerminalSquare,
  folder: FolderTree,
  regex: Regex,
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
/*                         revisão de diff inline                              */
/* -------------------------------------------------------------------------- */

/** Linha de contexto (inalterada) dentro do diff. */
function DiffContextLine({ line }: { line: string }) {
  return (
    <div className="flex">
      <span className="w-5 shrink-0 select-none text-center text-muted-foreground/50">
        {"\u00A0"}
      </span>
      <span className="whitespace-pre pl-1 text-muted-foreground">
        <HighlightedLine line={line} />
      </span>
    </div>
  )
}

/** Linha removida (−) ou adicionada (+) com realce visível em light/dark. */
function DiffChangeLine({ sign, line }: { sign: "+" | "-"; line: string }) {
  const isAdd = sign === "+"
  return (
    <div
      className={cn(
        "flex",
        isAdd
          ? "bg-emerald-500/10 dark:bg-emerald-400/10"
          : "bg-rose-500/10 dark:bg-rose-400/10",
      )}
    >
      <span
        className={cn(
          "w-5 shrink-0 select-none text-center font-semibold",
          isAdd
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-rose-700 dark:text-rose-300",
        )}
      >
        {sign}
      </span>
      <span className="whitespace-pre pl-1">
        <HighlightedLine line={line === "" ? "" : line} />
      </span>
    </div>
  )
}

function DiffHunkBlock({
  block,
  status,
  onDecide,
}: {
  block: Extract<DiffBlock, { kind: "hunk" }>
  status: HunkStatus
  onDecide: (id: string, status: HunkStatus) => void
}) {
  const decided = status !== "pending"
  return (
    <div
      data-hunk={block.id}
      data-hunk-status={status}
      className={cn(
        "my-1 overflow-hidden rounded-md border",
        status === "accepted"
          ? "border-emerald-500/40"
          : status === "rejected"
            ? "border-rose-500/40 opacity-60"
            : "border-border",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-2 py-1 font-sans">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bloco
        </span>
        <span className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300">
            <Plus className="size-3" />
            {block.added.length}
          </span>
          <span className="flex items-center gap-0.5 text-rose-700 dark:text-rose-300">
            <Minus className="size-3" />
            {block.removed.length}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-1">
          {decided ? (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                status === "accepted"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
              )}
            >
              {status === "accepted" ? "Aceito" : "Rejeitado"}
            </span>
          ) : (
            <>
              <button
                type="button"
                data-diff-action="reject-hunk"
                onClick={() => onDecide(block.id, "rejected")}
                className="flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-rose-700 transition-colors hover:bg-rose-500/10 dark:text-rose-300"
              >
                <X className="size-3" />
                Rejeitar
              </button>
              <button
                type="button"
                data-diff-action="accept-hunk"
                onClick={() => onDecide(block.id, "accepted")}
                className="flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300"
              >
                <Check className="size-3" />
                Aceitar
              </button>
            </>
          )}
        </div>
      </div>
      <div className="py-1">
        {block.removed.map((line, i) => (
          <DiffChangeLine key={`r-${i}`} sign="-" line={line} />
        ))}
        {block.added.map((line, i) => (
          <DiffChangeLine key={`a-${i}`} sign="+" line={line} />
        ))}
      </div>
    </div>
  )
}

function DiffReview({
  plan,
  statuses,
  onAcceptAll,
  onRejectAll,
  onDecideHunk,
}: {
  plan: DiffPlan
  statuses: Record<string, HunkStatus>
  onAcceptAll: () => void
  onRejectAll: () => void
  onDecideHunk: (id: string, status: HunkStatus) => void
}) {
  const counts = countDiff(plan.blocks)
  return (
    <div data-diff="true" className="flex min-h-full flex-col bg-background">
      {/* cabeçalho do diff */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border bg-card/80 px-3 py-2 backdrop-blur">
        <span className="flex items-center gap-1.5 font-mono text-[12px] text-foreground">
          <FileCode2 className="size-3.5 text-primary" />
          {plan.filename}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[12px]">
          <span className="text-emerald-700 dark:text-emerald-300">
            +{counts.added}
          </span>
          <span className="text-rose-700 dark:text-rose-300">
            −{counts.removed}
          </span>
        </span>
        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Revisão
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <ButtonFluid
            variant="secondary"
            size="sm"
            data-diff-action="reject-all"
            onClick={onRejectAll}
          >
            <X className="size-3.5" />
            Rejeitar tudo
          </ButtonFluid>
          <ButtonFluid
            variant="primary"
            size="sm"
            data-diff-action="accept-all"
            onClick={onAcceptAll}
          >
            <Check className="size-3.5" />
            Aceitar tudo
          </ButtonFluid>
        </div>
      </div>

      {/* corpo do diff unificado */}
      <div className="min-w-max px-3 py-2 font-mono text-[12px] leading-6">
        {plan.blocks.map((block, i) =>
          block.kind === "context" ? (
            <div key={`c-${i}`}>
              {block.lines.map((line, j) => (
                <DiffContextLine key={j} line={line} />
              ))}
            </div>
          ) : (
            <DiffHunkBlock
              key={block.id}
              block={block}
              status={statuses[block.id] ?? "pending"}
              onDecide={onDecideHunk}
            />
          ),
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              sub-componentes                                */
/* -------------------------------------------------------------------------- */

type ActivityKey =
  | "explorer"
  | "search"
  | "scm"
  | "run"
  | "extensions"
  | "settings"

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
            onClick={() => onSelect("settings")}
            aria-current={active === "settings" ? "true" : undefined}
            data-active={active === "settings" ? "true" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg transition-colors",
              active === "settings"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
            aria-label="Configurações"
          >
            <Settings className="size-5" />
          </button>
        </TooltipFluid>
      </div>
    </nav>
  )
}

/* ---- file tree (estado mutável) ---- */

const TREE_PAD: Record<number, string> = {
  0: "pl-2",
  1: "pl-5",
  2: "pl-8",
  3: "pl-11",
  4: "pl-14",
}

type TreeActions = {
  activeId: string
  modified: Set<string>
  renamingId: string | null
  renameValue: string
  onOpenFile: (id: string) => void
  onToggleDir: (id: string) => void
  onStartRename: (id: string, current: string) => void
  onRenameChange: (value: string) => void
  onCommitRename: () => void
  onCancelRename: () => void
  onDelete: (id: string) => void
}

function TreeRowActions({
  id,
  name,
  actions,
}: {
  id: string
  name: string
  actions: TreeActions
}) {
  return (
    <span className="ml-auto hidden shrink-0 items-center gap-0.5 pl-1 group-hover:flex">
      <span
        role="button"
        tabIndex={0}
        aria-label={`Renomear ${name}`}
        onClick={(e) => {
          e.stopPropagation()
          actions.onStartRename(id, name)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            e.stopPropagation()
            actions.onStartRename(id, name)
          }
        }}
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Pencil className="size-3" />
      </span>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Excluir ${name}`}
        onClick={(e) => {
          e.stopPropagation()
          actions.onDelete(id)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            e.stopPropagation()
            actions.onDelete(id)
          }
        }}
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-rose-500"
      >
        <Trash2 className="size-3" />
      </span>
    </span>
  )
}

function RenameInput({ actions }: { actions: TreeActions }) {
  return (
    <input
      autoFocus
      value={actions.renameValue}
      onChange={(e) => actions.onRenameChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          actions.onCommitRename()
        } else if (e.key === "Escape") {
          e.preventDefault()
          actions.onCancelRename()
        }
      }}
      onBlur={actions.onCommitRename}
      aria-label="Novo nome"
      className="min-w-0 flex-1 rounded border border-primary/50 bg-background px-1 py-0 text-[13px] text-foreground outline-none"
    />
  )
}

function FileTreeNode({
  node,
  depth,
  actions,
}: {
  node: TreeNode
  depth: number
  actions: TreeActions
}) {
  const padClass = TREE_PAD[depth] ?? "pl-14"
  const isRenaming = actions.renamingId === node.id

  if (node.kind === "file") {
    const isActive = node.id === actions.activeId
    const isModified = actions.modified.has(node.id)
    const Icon = LANG_ICON[node.lang]
    return (
      <div
        className={cn(
          "group flex w-full items-center gap-1.5 py-1 pr-2 text-left text-[13px] transition-colors",
          padClass,
          isActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        {isRenaming ? (
          <RenameInput actions={actions} />
        ) : (
          <>
            <button
              type="button"
              onClick={() => actions.onOpenFile(node.id)}
              aria-current={isActive ? "true" : undefined}
              className="min-w-0 flex-1 truncate text-left"
            >
              {node.name}
            </button>
            {isModified ? (
              <CircleDot className="size-3 shrink-0 text-amber-500 group-hover:hidden" />
            ) : null}
            <TreeRowActions id={node.id} name={node.name} actions={actions} />
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 py-1 pr-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent/50",
          padClass,
        )}
      >
        <button
          type="button"
          onClick={() => actions.onToggleDir(node.id)}
          aria-expanded={node.open}
          aria-label={`${node.open ? "Recolher" : "Expandir"} pasta ${node.name}`}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              node.open ? "rotate-90" : "",
            )}
          />
          <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
          {isRenaming ? (
            <RenameInput actions={actions} />
          ) : (
            <span className="truncate">{node.name}</span>
          )}
        </button>
        {isRenaming ? null : (
          <TreeRowActions id={node.id} name={node.name} actions={actions} />
        )}
      </div>
      {node.open ? (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              actions={actions}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SidePanelHeader({
  children,
  actions,
}: {
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex h-8 items-center gap-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <span className="flex-1">{children}</span>
      {actions}
    </div>
  )
}

/* ---- cartão de uso de ferramenta (tool call) no raciocínio ---- */

function ToolCallCard({ tool, running }: { tool: ToolCall; running: boolean }) {
  const Icon = TOOL_ICON[tool.icon]
  return (
    <div
      data-tool-call="true"
      data-tool-name={tool.tool}
      data-tool-status={running ? "running" : "complete"}
      className="my-0.5 ml-1 flex items-center gap-2 rounded-md border border-border bg-card/70 px-2 py-1.5"
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <span className="flex min-w-0 flex-1 items-baseline gap-1 font-mono text-[11px]">
        <span className="shrink-0 font-medium text-foreground">{tool.tool}</span>
        <span className="truncate text-muted-foreground">({tool.arg})</span>
      </span>
      <span
        data-tool-result="true"
        className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground"
      >
        {running ? (
          <Loader2 className="size-3 animate-spin text-primary" />
        ) : (
          <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
        )}
        <span className="tabular-nums">{tool.result}</span>
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   AiIde                                     */
/* -------------------------------------------------------------------------- */

let uidCounter = 0
function nextUid(prefix: string): string {
  uidCounter += 1
  return `${prefix}-${uidCounter}`
}

/** Distância (px) do fim a partir da qual o chat ainda "gruda" no fundo (stick-to-bottom). */
const STICK_TO_BOTTOM_PX = 80

export function AiIde() {
  const { setTheme, resolvedTheme } = useTheme()

  // ── árvore de arquivos (estado mutável) ────────────────────────────────
  const [tree, setTree] = useState<TreeNode[]>(INITIAL_TREE)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [creating, setCreating] = useState<null | "file" | "dir">(null)
  const [createValue, setCreateValue] = useState("")

  // ── activity bar + side panel ──────────────────────────────────────────
  const [activity, setActivity] = useState<ActivityKey>("explorer")
  const [searchQuery, setSearchQuery] = useState("")
  const [commitMsg, setCommitMsg] = useState("")

  // ── preferências (Settings) ─────────────────────────────────────────────
  const [wordWrap, setWordWrap] = useState(false)
  const [minimap, setMinimap] = useState(true)
  const [ligatures, setLigatures] = useState(true)

  // ── editor ──────────────────────────────────────────────────────────────
  const [openTabs, setOpenTabs] = useState<string[]>(["app", "utils"])
  const [activeId, setActiveId] = useState<string>("app")
  const [modified, setModified] = useState<Set<string>>(() => new Set())
  const [ghostAccepted, setGhostAccepted] = useState<Set<string>>(() => new Set())

  // ── revisão de diff inline (aceitar/rejeitar por hunk) ─────────────────
  const [diffPlan, setDiffPlan] = useState<DiffPlan | null>(null)
  const [hunkStatus, setHunkStatus] = useState<Record<string, HunkStatus>>({})

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

  // ── derivados da árvore ────────────────────────────────────────────────
  const files = useMemo(() => collectFiles(tree), [tree])
  const filesById = useMemo(
    () => new Map(files.map((f) => [f.id, f])),
    [files],
  )

  // timers (todos guardados em refs e limpos no unmount / novo prompt)
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const terminalScrollRef = useRef<HTMLDivElement>(null)
  // Stick-to-bottom: true enquanto o usuário está perto do fim do chat.
  const stickToBottomRef = useRef(true)
  // rAF que coalesce os auto-scrolls (evita reescrever scrollTop em alta frequência).
  const scrollRafRef = useRef<number | null>(null)

  const clearAiTimers = useCallback(() => {
    stepTimersRef.current.forEach((t) => clearTimeout(t))
    stepTimersRef.current = []
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current)
      tickTimerRef.current = null
    }
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current)
      streamTimerRef.current = null
    }
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current)
      scrollRafRef.current = null
    }
  }, [])

  // Limpa todos os timers ao desmontar.
  useEffect(() => clearAiTimers, [clearAiTimers])

  // Atualiza a flag stick-to-bottom conforme o usuário rola o chat.
  const onChatScroll = useCallback(() => {
    const el = chatScrollRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distance < STICK_TO_BOTTOM_PX
  }, [])

  // Auto-scroll suave e coalescido: só "gruda" no fundo se o usuário já estava lá.
  // Coalesce via rAF para não brigar com a transição de altura (300ms) nem reescrever
  // scrollTop a cada tick/palavra. Desacoplado dos incrementos de alta frequência —
  // reage apenas a sinais "grossos" (nº de mensagens, passos revelados, fim do streaming).
  const scrollSignal = useMemo(() => {
    const last = thread[thread.length - 1]
    const reasoning = last?.reasoning
    return [
      thread.length,
      reasoning?.visibleSteps ?? 0,
      reasoning?.expanded ? 1 : 0,
      last?.shownText.length ?? 0,
      pending ? 1 : 0,
    ].join(":")
  }, [thread, pending])

  useEffect(() => {
    if (!stickToBottomRef.current) return
    if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current)
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null
      const el = chatScrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [scrollSignal])

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
    () => filesById.get(activeId) ?? files[0],
    [filesById, activeId, files],
  )
  const activeCode = activeFile?.code ?? ""
  const codeLines = useMemo(() => activeCode.split("\n"), [activeCode])
  const activePath = useMemo(
    () => (activeFile ? findPath(tree, activeFile.id) ?? [activeFile.name] : []),
    [tree, activeFile],
  )
  const ghostShown =
    activeFile?.ghost !== undefined && !ghostAccepted.has(activeFile.id)

  const allProblems = useMemo(
    () =>
      files.flatMap((f) =>
        (f.problems ?? []).map((p) => ({ ...p, file: f })),
      ),
    [files],
  )
  const errorCount = allProblems.filter((p) => p.severity === "error").length
  const warningCount = allProblems.filter((p) => p.severity === "warning").length
  const activeModel = MODELS.find((m) => m.id === modelId) ?? MODELS[0]

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    const out: { file: FileData; line: number; text: string }[] = []
    for (const file of files) {
      const lines = file.code.split("\n")
      lines.forEach((text, i) => {
        if (text.toLowerCase().includes(q)) {
          out.push({ file, line: i + 1, text: text.trim() })
        }
      })
    }
    return out.slice(0, 20)
  }, [searchQuery, files])

  // ── ações de arquivo / editor ───────────────────────────────────────
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

  const setFileCode = useCallback((id: string, code: string) => {
    setTree((prev) => updateFileCode(prev, id, code))
  }, [])

  const acceptGhost = useCallback(() => {
    if (!activeFile?.ghost || ghostAccepted.has(activeFile.id)) return
    const lines = activeFile.code.split("\n")
    const insertAt = Math.min(6, lines.length)
    lines.splice(insertAt, 0, activeFile.ghost)
    setFileCode(activeFile.id, lines.join("\n"))
    setGhostAccepted((prev) => new Set(prev).add(activeFile.id))
    setModified((prev) => new Set(prev).add(activeFile.id))
  }, [activeFile, ghostAccepted, setFileCode])

  // Aplica de fato uma revisão decidida: materializa o conteúdo final e, se
  // houver ao menos um hunk aceito, escreve no editor e marca o arquivo como
  // modificado (dot na tab + Source Control + status bar). Sempre encerra o
  // modo diff. Reutilizável: recebe o plano e o mapa de decisões.
  const finalizeReview = useCallback(
    (plan: DiffPlan, statuses: Record<string, HunkStatus>) => {
      const anyAccepted = plan.blocks.some(
        (b) => b.kind === "hunk" && statuses[b.id] === "accepted",
      )
      if (anyAccepted) {
        setFileCode(plan.targetId, materializeDiff(plan.blocks, statuses))
        setModified((prev) => new Set(prev).add(plan.targetId))
        setActivity("scm")
      }
      setDiffPlan(null)
      setHunkStatus({})
    },
    [setFileCode],
  )

  // Entra no modo de revisão de diff inline para uma mudança proposta. Não troca
  // o código direto: abre a aba do arquivo-alvo e mostra o diff por hunks.
  // Reutilizável pela Task 4 (Cmd+K inline) — qualquer origem que monte um
  // { targetId, filename, blocks } dispara o mesmo fluxo de revisão.
  const startReview = useCallback((code: AiCode) => {
    setOpenTabs((prev) =>
      prev.includes(code.targetId) ? prev : [...prev, code.targetId],
    )
    setActiveId(code.targetId)
    setDiffPlan({
      targetId: code.targetId,
      filename: code.filename,
      blocks: code.blocks,
    })
    setHunkStatus({})
  }, [])

  // Decide um hunk; quando todos os hunks foram decididos, finaliza a revisão.
  const decideHunk = useCallback(
    (id: string, status: HunkStatus) => {
      if (!diffPlan) return
      const next: Record<string, HunkStatus> = { ...hunkStatus, [id]: status }
      const allDecided = diffPlan.blocks.every(
        (b) => b.kind !== "hunk" || next[b.id] !== undefined,
      )
      if (allDecided) finalizeReview(diffPlan, next)
      else setHunkStatus(next)
    },
    [diffPlan, hunkStatus, finalizeReview],
  )

  const acceptAllHunks = useCallback(() => {
    if (!diffPlan) return
    const next: Record<string, HunkStatus> = {}
    for (const b of diffPlan.blocks) {
      if (b.kind === "hunk") next[b.id] = "accepted"
    }
    finalizeReview(diffPlan, next)
  }, [diffPlan, finalizeReview])

  const rejectAllHunks = useCallback(() => {
    setDiffPlan(null)
    setHunkStatus({})
  }, [])

  // ── árvore: criar / renomear / excluir ───────────────────────────────
  const startCreate = useCallback((kind: "file" | "dir") => {
    setActivity("explorer")
    setCreating(kind)
    setCreateValue("")
  }, [])

  const commitCreate = useCallback(() => {
    const name = createValue.trim()
    if (!name) {
      setCreating(null)
      return
    }
    const kind = creating
    if (kind === "dir") {
      const id = nextUid("dir")
      setTree((prev) =>
        insertAtRoot(prev, { kind: "dir", id, name, open: true, children: [] }),
      )
    } else {
      const id = nextUid("file")
      const node: FileData = {
        kind: "file",
        id,
        name,
        lang: langFromName(name),
        code: `// ${name}\n`,
      }
      setTree((prev) => insertAtRoot(prev, node))
      setOpenTabs((prev) => [...prev, id])
      setActiveId(id)
      setCaret({ line: 1, col: 1 })
    }
    setCreating(null)
    setCreateValue("")
  }, [createValue, creating])

  const startRename = useCallback((id: string, current: string) => {
    setRenamingId(id)
    setRenameValue(current)
  }, [])

  const commitRename = useCallback(() => {
    setRenamingId((id) => {
      if (id) {
        const name = renameValue.trim()
        if (name) setTree((prev) => renameNode(prev, id, name))
      }
      return null
    })
  }, [renameValue])

  const cancelRename = useCallback(() => setRenamingId(null), [])

  const deleteItem = useCallback((id: string) => {
    setTree((prev) => deleteNode(prev, id))
    setOpenTabs((prev) => prev.filter((t) => t !== id))
    setActiveId((curr) => (curr === id ? "" : curr))
    setModified((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggleDirOpen = useCallback((id: string) => {
    setTree((prev) => toggleDir(prev, id))
  }, [])

  const treeActions: TreeActions = {
    activeId,
    modified,
    renamingId,
    renameValue,
    onOpenFile: openFile,
    onToggleDir: toggleDirOpen,
    onStartRename: startRename,
    onRenameChange: setRenameValue,
    onCommitRename: commitRename,
    onCancelRename: cancelRename,
    onDelete: deleteItem,
  }

  // ── terminal ──────────────────────────────────────────────────────────
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

  const runScript = useCallback((cmd: string) => {
    setBottomTab("terminal")
    setBottomCollapsed(false)
    setTerminalLines((prev) => [
      ...prev,
      `$ ${cmd}`,
      ...(TERMINAL_RESPONSES[cmd] ?? [`zsh: command not found: ${cmd}`]),
    ])
  }, [])

  const commitChanges = useCallback(() => {
    if (modified.size === 0) return
    const count = modified.size
    setModified(new Set())
    setCommitMsg("")
    setTerminalLines((prev) => [
      ...prev,
      `$ git commit -m "${commitMsg || "atualiza arquivos"}"`,
      `[main] ${count} arquivo(s) committed`,
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

  // ── envio de prompt → raciocínio embutido + streaming ─────────────────
  const sendPrompt = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || pending) return

      clearAiTimers()
      // ao enviar um novo prompt, retomamos o acompanhamento do fim do chat.
      stickToBottomRef.current = true

      const assistantId = Date.now()
      setThread((prev) => {
        const baseId = prev.length ? prev[prev.length - 1].id + 1 : 1
        const userMsg: AiMessage = {
          id: baseId,
          from: "user",
          fullText: trimmed,
          shownText: trimmed,
          streamed: true,
        }
        const assistantMsg: AiMessage = {
          id: assistantId,
          from: "assistant",
          fullText: REPLY.text,
          shownText: "",
          streamed: false,
          reasoning: {
            items: REASONING_ITEMS,
            visibleSteps: 0,
            elapsedTenths: 0,
            active: true,
            expanded: true,
            done: false,
          },
        }
        return [...prev, userMsg, assistantMsg]
      })
      setComposer("")
      setPending(true)

      const patchReasoning = (
        patch: Partial<NonNullable<AiMessage["reasoning"]>>,
      ) => {
        setThread((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.reasoning
              ? { ...m, reasoning: { ...m.reasoning, ...patch } }
              : m,
          ),
        )
      }

      // contador de tempo de raciocínio (determinístico).
      tickTimerRef.current = setInterval(() => {
        setThread((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.reasoning && m.reasoning.active
              ? {
                  ...m,
                  reasoning: {
                    ...m.reasoning,
                    elapsedTenths: m.reasoning.elapsedTenths + 1,
                  },
                }
              : m,
          ),
        )
      }, GEN_TIMING.tickMs)

      // revela os itens do raciocínio (passos textuais + tool calls) um a um.
      REASONING_ITEMS.forEach((_, i) => {
        const t = setTimeout(
          () => patchReasoning({ visibleSteps: i + 1 }),
          GEN_TIMING.firstStepMs + i * GEN_TIMING.stepGapMs,
        )
        stepTimersRef.current.push(t)
      })

      // ao terminar os itens: para o contador, auto-contrai e streama.
      const totalThinkMs =
        GEN_TIMING.firstStepMs +
        REASONING_ITEMS.length * GEN_TIMING.stepGapMs +
        GEN_TIMING.afterStepsMs
      const finishThink = setTimeout(() => {
        if (tickTimerRef.current) {
          clearInterval(tickTimerRef.current)
          tickTimerRef.current = null
        }
        // Auto-contrai SUAVE: dispara só a transição de altura/opacidade (grid-rows
        // 1fr→0fr, 300ms). O streaming começa após o respiro para o conteúdo não "pular".
        patchReasoning({ active: false, expanded: false, done: true })

        // respiro ≈ duração da transição antes de começar a streamar a resposta.
        const startStream = setTimeout(() => {
          // streaming token-a-token da resposta final (por palavras).
          const words = REPLY.text.split(" ")
          let wi = 0
          streamTimerRef.current = setInterval(() => {
            wi += 1
            const shown = words.slice(0, wi).join(" ")
            const isDone = wi >= words.length
            setThread((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      shownText: shown,
                      streamed: isDone,
                      code: isDone ? REPLY.code : m.code,
                    }
                  : m,
              ),
            )
            if (isDone && streamTimerRef.current) {
              clearInterval(streamTimerRef.current)
              streamTimerRef.current = null
              setPending(false)
            }
          }, GEN_TIMING.streamMs)
        }, GEN_TIMING.collapseRespiroMs)
        stepTimersRef.current.push(startStream)
      }, totalThinkMs)
      stepTimersRef.current.push(finishThink)
    },
    [pending, clearAiTimers],
  )

  const toggleReasoning = useCallback((id: number) => {
    setThread((prev) =>
      prev.map((m) =>
        m.id === id && m.reasoning
          ? { ...m, reasoning: { ...m.reasoning, expanded: !m.reasoning.expanded } }
          : m,
      ),
    )
  }, [])

  // ── menus da title bar ────────────────────────────────────────────────
  const fileMenuItems = [
    { icon: FilePlus, label: "Novo arquivo", action: () => startCreate("file") },
    { icon: FolderPlus, label: "Nova pasta", action: () => startCreate("dir") },
    {
      icon: Check,
      label: "Salvar",
      action: () => {
        if (activeFile) {
          setModified((prev) => {
            if (!prev.has(activeFile.id)) return prev
            const next = new Set(prev)
            next.delete(activeFile.id)
            return next
          })
          setTerminalLines((prev) => [...prev, `$ salvar ${activeFile.name} ✓`])
        }
      },
    },
    {
      icon: X,
      label: "Fechar aba",
      action: () => {
        if (activeId) closeTab(activeId)
      },
    },
  ]

  const editMenuItems = [
    {
      icon: Sparkles,
      label: "Inserir snippet",
      action: () => {
        if (activeFile) {
          setFileCode(
            activeFile.id,
            `${activeFile.code}\n\n// snippet inserido pelo editor`,
          )
          setModified((prev) => new Set(prev).add(activeFile.id))
        }
      },
    },
    {
      icon: Check,
      label: "Aceitar sugestão",
      action: acceptGhost,
    },
    {
      icon: Search,
      label: "Localizar no arquivo",
      action: () => {
        setActivity("search")
        if (activeFile) setSearchQuery(activeFile.name.split(".")[0])
      },
    },
  ]

  const viewMenuItems = [
    {
      icon: TerminalSquare,
      label: "Alternar painel inferior",
      action: () => setBottomCollapsed((c) => !c),
    },
    {
      icon: Sparkles,
      label: "Alternar painel IA",
      action: () => setAiSheetOpen((o) => !o),
    },
    {
      icon: resolvedTheme === "dark" ? Circle : CircleDot,
      label: "Alternar tema claro/escuro",
      action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    },
    {
      icon: Search,
      label: "Paleta de comandos (⌘K)",
      action: () => setPaletteOpen(true),
    },
  ]

  type MenuConfig = {
    name: string
    label: string
    items: { icon: LucideIcon; label: string; action: () => void }[]
  }
  const menus: MenuConfig[] = [
    { name: "file", label: "Arquivo", items: fileMenuItems },
    { name: "edit", label: "Editar", items: editMenuItems },
    { name: "view", label: "Ver", items: viewMenuItems },
  ]

  /* ---- bloco de raciocínio embutido ---- */
  function ReasoningBlock({ message }: { message: AiMessage }) {
    const r = message.reasoning
    if (!r) return null
    const seconds = (r.elapsedTenths / 10).toFixed(1)
    const headerLabel = r.active
      ? `Pensando… ${seconds}s`
      : `Pensei por ${seconds}s`
    return (
      <div
        data-reasoning="true"
        data-expanded={r.expanded ? "true" : "false"}
        data-active={r.active ? "true" : "false"}
        className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-muted/40"
      >
        <button
          type="button"
          onClick={() => toggleReasoning(message.id)}
          aria-expanded={r.expanded}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:bg-accent/40"
        >
          {r.active ? (
            <ThinkingIndicatorFluid />
          ) : (
            <Sparkles className="size-3.5 text-primary" />
          )}
          <span className="font-medium text-foreground">{headerLabel}</span>
          <ChevronRight
            className={cn(
              "ml-auto size-3.5 transition-transform",
              r.expanded ? "rotate-90" : "",
            )}
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            r.expanded ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]",
          )}
        >
          <div
            className={cn(
              "min-h-0 overflow-hidden transition-opacity duration-300 ease-out",
              r.expanded ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="flex flex-col border-t border-border px-2 py-2">
              {r.items.map((item, i) => {
                if (i >= r.visibleSteps) return null
                const isLastVisible = i === r.visibleSteps - 1
                const isRunning = r.active && isLastVisible

                if (item.kind === "tool") {
                  return (
                    <ToolCallCard
                      key={`tool-${i}`}
                      tool={item.tool}
                      running={isRunning}
                    />
                  )
                }

                const step = item.step
                // Conector da timeline só não desce no último item textual revelado
                // que também é o último item do fluxo.
                const isLastTextItem = !r.items
                  .slice(i + 1)
                  .some((it) => it.kind === "text")
                return (
                  <ThinkingStepFluid
                    key={`step-${i}`}
                    index={i}
                    icon={step.icon}
                    label={step.label}
                    description={step.description}
                    status={isRunning ? "active" : "complete"}
                    isLast={isLastTextItem}
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
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        onScroll={onChatScroll}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4"
      >
        {thread.map((m) =>
          m.from === "user" ? (
            <ChatMessageFluid key={m.id} from="user">
              {m.fullText}
            </ChatMessageFluid>
          ) : (
            <div key={m.id} className="flex w-full flex-col gap-2 self-start">
              {m.reasoning ? <ReasoningBlock message={m} /> : null}
              {m.shownText !== "" ? (
                <ChatMessageFluid from="assistant">
                  {m.shownText}
                  {!m.streamed ? (
                    <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-primary align-middle" />
                  ) : null}
                </ChatMessageFluid>
              ) : null}
              {m.code && m.streamed ? (
                <div className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-muted/40">
                  <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <FileCode2 className="size-3" />
                      {m.code.filename}
                    </span>
                    <ButtonFluid
                      variant="primary"
                      size="sm"
                      onClick={() => m.code && startReview(m.code)}
                    >
                      <FileCode2 className="size-3.5" />
                      Revisar mudança
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
      </div>

      {/* chips de contexto + slash commands + composer */}
      <div className="shrink-0 space-y-2 border-t border-border px-3 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Contexto:</span>
          {files.slice(0, 4).map((f) => {
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
          disabled={pending}
        />
      </div>
    </div>
  )

  /* ---- side panel ---- */
  const explorerActions = (
    <span className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => startCreate("file")}
        aria-label="Novo arquivo"
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <FilePlus className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => startCreate("dir")}
        aria-label="Nova pasta"
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <FolderPlus className="size-3.5" />
      </button>
    </span>
  )

  const explorerPanel = (
    <>
      <SidePanelHeader actions={explorerActions}>Explorer</SidePanelHeader>
      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        <div className="px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
          {ROOT_NAME}
        </div>
        {tree.map((node) => (
          <FileTreeNode key={node.id} node={node} depth={0} actions={treeActions} />
        ))}
        {creating ? (
          <div className="flex items-center gap-1.5 py-1 pl-5 pr-2">
            {creating === "dir" ? (
              <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <FileCode2 className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <input
              autoFocus
              value={createValue}
              onChange={(e) => setCreateValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  commitCreate()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  setCreating(null)
                }
              }}
              onBlur={commitCreate}
              placeholder={creating === "dir" ? "nova-pasta" : "arquivo.tsx"}
              aria-label={creating === "dir" ? "Nome da nova pasta" : "Nome do novo arquivo"}
              className="min-w-0 flex-1 rounded border border-primary/50 bg-background px-1 py-0 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        ) : null}
      </div>
    </>
  )

  const sidePanel = (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      {activity === "explorer" ? explorerPanel : null}

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
                  const f = filesById.get(id)
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
            <p>Scripts disponíveis no package.json:</p>
            <div className="mt-3 flex flex-col gap-2">
              <ButtonFluid
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => runScript("npm run dev")}
              >
                <Play className="size-3.5" />
                npm run dev
              </ButtonFluid>
              <ButtonFluid
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => runScript("npm run build")}
              >
                <Play className="size-3.5" />
                npm run build
              </ButtonFluid>
            </div>
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

      {activity === "settings" ? (
        <>
          <SidePanelHeader>Preferências</SidePanelHeader>
          <div className="flex flex-col gap-3 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-foreground">Tema escuro</span>
              <SwitchFluid
                label="Tema escuro"
                checked={resolvedTheme === "dark"}
                onToggle={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-foreground">Quebra de linha</span>
              <SwitchFluid
                label="Quebra de linha"
                checked={wordWrap}
                onToggle={() => setWordWrap((v) => !v)}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-foreground">Minimapa</span>
              <SwitchFluid
                label="Minimapa"
                checked={minimap}
                onToggle={() => setMinimap((v) => !v)}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-foreground">Ligaduras de fonte</span>
              <SwitchFluid
                label="Ligaduras de fonte"
                checked={ligatures}
                onToggle={() => setLigatures((v) => !v)}
              />
            </div>
          </div>
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
          {menus.map((menu) => (
            <Popover key={menu.name}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-menu={menu.name}
                  className="rounded px-2 py-1 transition-colors hover:bg-accent/50 hover:text-foreground data-[state=open]:bg-accent/50 data-[state=open]:text-foreground"
                >
                  {menu.label}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={4} className="p-0">
                <DropdownFluid data-slot={`menu-${menu.name}`}>
                  <DropdownFluidLabel>{menu.label}</DropdownFluidLabel>
                  <DropdownFluidSeparator />
                  {menu.items.map((item, i) => (
                    <MenuItemFluid
                      key={item.label}
                      index={i}
                      icon={item.icon}
                      label={item.label}
                      onSelect={item.action}
                    />
                  ))}
                </DropdownFluid>
              </PopoverContent>
            </Popover>
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
              const f = filesById.get(id)
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
            {activePath.map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-3" /> : null}
                <span className={i === arr.length - 1 ? "text-foreground" : ""}>{part}</span>
              </span>
            ))}
          </div>

          {/* área de código */}
          <div className="min-h-0 flex-1 overflow-auto bg-background">
            {diffPlan && diffPlan.targetId === activeId ? (
              <DiffReview
                plan={diffPlan}
                statuses={hunkStatus}
                onAcceptAll={acceptAllHunks}
                onRejectAll={rejectAllHunks}
                onDecideHunk={decideHunk}
              />
            ) : activeFile ? (
              <div className="flex min-w-max font-mono text-[13px] leading-6">
                <div className="select-none border-r border-border bg-card/30 px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {codeLines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                  {ghostShown ? (
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
                  {ghostShown ? (
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
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <FileCode2 className="size-8 opacity-40" />
                <p className="text-[13px]">Nenhum arquivo aberto.</p>
                <ButtonFluid variant="secondary" size="sm" onClick={() => startCreate("file")}>
                  <FilePlus className="size-3.5" />
                  Novo arquivo
                </ButtonFluid>
              </div>
            )}
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
                              onClick={() => {
                                openFile(p.file.id)
                                setCaret({ line: p.line, col: 1 })
                              }}
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
        <span className="ml-auto">{activeFile ? LANG_LABEL[activeFile.lang] : "—"}</span>
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
            {files.map((f) => (
              <CommandItem
                key={f.id}
                value={`arquivo ${f.name}`}
                onSelect={() => {
                  openFile(f.id)
                  setPaletteOpen(false)
                }}
              >
                <FileCode2 />
                <span>{f.name}</span>
                <CommandShortcut>{f.name}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Comandos">
            <CommandItem
              value="comando novo arquivo"
              onSelect={() => {
                startCreate("file")
                setPaletteOpen(false)
              }}
            >
              <FilePlus />
              <span>Novo arquivo</span>
            </CommandItem>
            <CommandItem
              value="comando executar terminal npm run dev"
              onSelect={() => {
                runScript("npm run dev")
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
