import * as React from "react"
import { motion } from "motion/react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Uma aba de código alternativa dentro do `CodeBlock`. Use o array `tabs`
 * na prop principal para criar um seletor com várias linguagens/trechos.
 */
export type CodeBlockTab = {
  /** Rótulo exibido na aba (ex.: "app.tsx", "index.js"). */
  name: string
  /** Conteúdo do código. */
  code: string
  /** Linguagem desta aba. Se omitida, usa `language` da prop raiz. */
  language?: string
  /** Linhas (1-based) a serem destacadas nesta aba. */
  highlightLines?: number[]
}

export type CodeBlockProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "children"
  | "onDrag"
  | "onDragEnd"
  | "onDragStart"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
> & {
  /** Linguagem padrão (ex.: "ts", "tsx", "js", "py", "bash", "json", "css"). */
  language: string
  /** Nome do arquivo exibido no header (omitido quando há `tabs`). */
  filename?: string
  /** Linhas (1-based) a destacar (ignorado se houver `tabs`). */
  highlightLines?: number[]
  /** Callback disparado após copiar com sucesso. */
  onCopy?: () => void
  /** Conteúdo do código. Use **somente** quando não houver `tabs`. */
  code?: string
  /** Abas alternativas. Use **somente** quando não houver `code`. */
  tabs?: CodeBlockTab[]
}

// ===== Syntax highlight manual (lexer leve, zero deps) =====

type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "text"

type Token = { type: TokenType; text: string }

const KEYWORDS_BY_LANG: Record<string, ReadonlySet<string>> = {
  js: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for",
    "while", "class", "extends", "new", "import", "export", "from", "as",
    "default", "async", "await", "try", "catch", "throw", "of", "in", "do",
    "switch", "case", "break", "continue", "typeof", "instanceof", "this",
    "super", "null", "undefined", "true", "false", "void", "yield", "delete",
  ]),
  ts: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for",
    "while", "class", "extends", "new", "import", "export", "from", "as",
    "default", "async", "await", "try", "catch", "throw", "of", "in", "do",
    "switch", "case", "break", "continue", "typeof", "instanceof", "this",
    "super", "null", "undefined", "true", "false", "void", "yield", "delete",
    "interface", "type", "enum", "public", "private", "protected", "static",
    "readonly", "implements", "abstract", "namespace", "declare", "keyof",
    "satisfies", "infer",
  ]),
  py: new Set([
    "def", "class", "import", "from", "as", "return", "if", "elif", "else",
    "for", "while", "try", "except", "finally", "with", "lambda", "yield",
    "pass", "break", "continue", "in", "is", "not", "and", "or", "True",
    "False", "None", "self", "raise", "global", "nonlocal",
  ]),
  bash: new Set([
    "if", "then", "fi", "else", "elif", "for", "do", "done", "while",
    "case", "esac", "function", "return", "export", "local", "echo", "cd",
    "ls", "cat", "rm", "mv", "cp", "mkdir", "touch", "grep", "sed", "awk",
    "in",
  ]),
}

const LANG_ALIAS: Record<string, keyof typeof KEYWORDS_BY_LANG> = {
  js: "js", javascript: "js", jsx: "js",
  ts: "ts", typescript: "ts", tsx: "ts",
  py: "py", python: "py",
  sh: "bash", bash: "bash", shell: "bash", zsh: "bash",
  json: "bash", css: "bash", scss: "bash", html: "bash", xml: "bash",
  md: "bash", markdown: "bash", yaml: "bash", yml: "bash",
}

const TOKEN_COLOR: Record<TokenType, string> = {
  comment: "text-zinc-500 italic",
  string: "text-emerald-300",
  keyword: "text-rose-300",
  number: "text-amber-300",
  function: "text-sky-300",
  text: "",
}

const TOKEN_RE =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][A-Za-z0-9_$]*\b)|(#+\s.*)|(.)/g

function tokenize(code: string, language: string): Token[] {
  const norm = (LANG_ALIAS[language.toLowerCase()] ?? language.toLowerCase()) as
    | "js" | "ts" | "py" | "bash"
  const keywords = KEYWORDS_BY_LANG[norm] ?? KEYWORDS_BY_LANG.js
  const tokens: Token[] = []
  TOKEN_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_RE.exec(code)) !== null) {
    const [
      whole,
      lineComment,
      blockComment,
      str,
      num,
      ident,
      hashLine,
      ch,
    ] = match
    if (lineComment !== undefined) {
      tokens.push({ type: "comment", text: lineComment })
    } else if (blockComment !== undefined) {
      tokens.push({ type: "comment", text: blockComment })
    } else if (str !== undefined) {
      tokens.push({ type: "string", text: str })
    } else if (num !== undefined) {
      tokens.push({ type: "number", text: num })
    } else if (ident !== undefined) {
      // Python: keyword check (inclui "def", "class", "import" etc.)
      // JS/TS: keyword check
      if (keywords.has(ident)) {
        tokens.push({ type: "keyword", text: ident })
      } else {
        // peek próximo char não-espaço pra detectar chamada de função `ident(`
        let k = TOKEN_RE.lastIndex
        while (k < code.length && /\s/.test(code[k])) k++
        if (code[k] === "(") {
          tokens.push({ type: "function", text: ident })
        } else if (/^[A-Z]/.test(ident)) {
          // Classes/Componentes React (PascalCase) ganham cor "function" também
          tokens.push({ type: "function", text: ident })
        } else {
          tokens.push({ type: "text", text: ident })
        }
      }
    } else if (hashLine !== undefined) {
      // # em py, ## em md, #! shebang em bash — trata como comentário
      tokens.push({ type: "comment", text: hashLine })
    } else if (ch !== undefined) {
      tokens.push({ type: "text", text: ch })
    } else {
      // fallback defensivo
      tokens.push({ type: "text", text: whole })
    }
  }
  return tokens
}

type Line = { tokens: Token[]; lineNumber: number; highlighted: boolean }

function splitLines(tokens: Token[], highlightLines: number[]): Line[] {
  const lines: Line[] = []
  let current: Token[] = []
  let lineNumber = 1
  for (const tok of tokens) {
    const parts = tok.text.split("\n")
    parts.forEach((part, idx) => {
      if (idx > 0) {
        lines.push({
          tokens: current,
          lineNumber,
          highlighted: highlightLines.includes(lineNumber),
        })
        lineNumber++
        current = []
      }
      if (part) current.push({ type: tok.type, text: part })
    })
  }
  if (current.length > 0) {
    lines.push({
      tokens: current,
      lineNumber,
      highlighted: highlightLines.includes(lineNumber),
    })
  }
  return lines
}

function renderLineTokens(tokens: Token[]): React.ReactNode[] {
  return tokens.map((t, i) => {
    if (t.type === "text" || t.text.includes("\n")) {
      return <React.Fragment key={i}>{t.text}</React.Fragment>
    }
    return (
      <span key={i} className={TOKEN_COLOR[t.type]}>
        {t.text}
      </span>
    )
  })
}

function HighlightedCode({
  code,
  language,
  highlightLines,
}: {
  code: string
  language: string
  highlightLines: number[]
}) {
  const tokens = React.useMemo(
    () => tokenize(code, language),
    [code, language],
  )
  const lines = React.useMemo(
    () => splitLines(tokens, highlightLines),
    [tokens, highlightLines],
  )
  return (
    <pre className="m-0 overflow-x-auto bg-transparent p-0 font-mono text-sm leading-6">
      <code data-slot="code-block-content" className="block">
        {lines.map(({ tokens: lineTokens, lineNumber, highlighted }) => (
          <div
            key={lineNumber}
            data-line={lineNumber}
            data-highlighted={highlighted ? "true" : "false"}
            className={cn(
              "block w-full px-4",
              highlighted && "bg-white/[0.06]",
            )}
          >
            <span
              aria-hidden
              className="mr-4 inline-block w-6 select-none text-right text-zinc-600"
            >
              {lineNumber}
            </span>
            <span>{renderLineTokens(lineTokens)}</span>
          </div>
        ))}
      </code>
    </pre>
  )
}

// ===== Inline copy button (com cleanup do setTimeout) =====

function InlineCopyButton({
  value,
  onCopy,
}: {
  value: string
  onCopy?: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = React.useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopy?.()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard pode não estar disponível (SSR, permissões); falha silenciosa
    }
  }, [value, onCopy])

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Código copiado" : "Copiar código"}
      data-slot="code-block-copy"
      data-copied={copied ? "true" : "false"}
      className={cn(
        "flex items-center gap-1 rounded px-1.5 py-1 text-xs font-sans transition-colors",
        copied
          ? "text-emerald-300"
          : "text-zinc-400 hover:text-zinc-100",
      )}
    >
      <motion.span
        key={copied ? "check" : "copy"}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="inline-flex"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </motion.span>
    </button>
  )
}

// ===== Header com tabs (com indicator animado) =====

function CodeBlockTabs({
  tabs,
  activeTab,
  onTabChange,
  onCopy,
}: {
  tabs: CodeBlockTab[]
  activeTab: number
  onTabChange: (i: number) => void
  onCopy?: () => void
}) {
  const active = tabs[activeTab]
  return (
    <div
      data-slot="code-block-tabs"
      role="tablist"
      className="flex items-center justify-between border-b border-slate-800/80"
    >
      <div className="flex min-w-0 overflow-x-auto">
        {tabs.map((tab, i) => {
          const selected = i === activeTab
          return (
            <button
              key={`${tab.name}-${i}`}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onTabChange(i)}
              data-slot="code-block-tab"
              data-active={selected ? "true" : "false"}
              className={cn(
                "relative px-3 py-2 text-xs font-sans transition-colors",
                selected
                  ? "text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              {tab.name}
              {selected ? (
                <motion.span
                  layoutId="code-block-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-zinc-100"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
            </button>
          )
        })}
      </div>
      <div className="px-2">
        <InlineCopyButton value={active.code} onCopy={onCopy} />
      </div>
    </div>
  )
}

// ===== Componente principal =====

function CodeBlock({
  language,
  filename,
  code,
  tabs,
  highlightLines,
  onCopy,
  className,
  ...hostProps
}: CodeBlockProps) {
  const tabsExist = (tabs?.length ?? 0) > 0
  const safeTabs: CodeBlockTab[] = tabsExist ? (tabs as CodeBlockTab[]) : []
  const safeCode: string = tabsExist ? "" : ((code as string | undefined) ?? "")
  const [activeTab, setActiveTab] = React.useState(0)
  const activeCode: string = tabsExist ? safeTabs[activeTab].code : safeCode
  const activeLanguage: string = tabsExist
    ? (safeTabs[activeTab].language ?? language)
    : language
  const activeHighlightLines: number[] = tabsExist
    ? (safeTabs[activeTab].highlightLines ?? [])
    : (highlightLines ?? [])

  return (
    <motion.div
      data-slot="code-block"
      data-language={activeLanguage}
      data-tabs={tabsExist ? "true" : "false"}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900 font-mono text-sm text-zinc-100",
        className,
      )}
      {...hostProps}
    >
      {tabsExist ? (
        <CodeBlockTabs
          tabs={safeTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCopy={onCopy}
        />
      ) : filename ? (
        <div
          data-slot="code-block-header"
          className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2"
        >
          <div className="text-xs font-sans text-zinc-400">{filename}</div>
          <InlineCopyButton value={safeCode} onCopy={onCopy} />
        </div>
      ) : null}
      <HighlightedCode
        key={`${activeLanguage}-${activeTab}`}
        code={activeCode}
        language={activeLanguage}
        highlightLines={activeHighlightLines}
      />
    </motion.div>
  )
}

export { CodeBlock }
