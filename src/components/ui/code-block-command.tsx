import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/showcase/CopyButton"
import { codeBlockCommandVariants } from "@/components/ui/code-block-command-variants"

/**
 * Token types for shell command syntax coloring.
 */
type TokenType = "prompt" | "command" | "subcommand" | "arg" | "flag" | "string" | "pipe" | "text"

interface Token {
  type: TokenType
  value: string
}

/**
 * Known shell/package manager commands for classification.
 */
const COMMANDS = new Set([
  "npm", "npx", "pnpm", "yarn", "bun", "bunx",
  "git", "docker", "node", "deno", "python", "pip",
  "curl", "wget", "ls", "cd", "cat", "echo", "mkdir",
  "rm", "cp", "mv", "touch", "chmod", "sudo", "make",
  "cargo", "rustc", "go", "java", "javac", "mvn", "gradle",
  "sh", "bash", "zsh", "fish",
])

const SUBCOMMANDS = new Set([
  "install", "add", "remove", "rm", "update", "upgrade",
  "init", "create", "build", "dev", "start", "test", "lint",
  "run", "exec", "publish", "deploy", "dlx", "config",
  "list", "ls", "info", "outdated", "audit", "link", "unlink",
])

/**
 * Tokenize a shell command string into typed tokens for coloring.
 *
 * Rules:
 * - First non-whitespace token after $ → "command"
 * - Known subcommands (add, install, dlx…) → "subcommand"
 * - Tokens starting with - or -- → "flag"
 * - Tokens in quotes → "string"
 * - | → "pipe"
 * - Everything else → "arg"
 */
function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  // Split by whitespace but preserve the whitespace
  const parts = code.trim().split(/(\s+)/)

  let isFirst = true
  let afterCommand = false

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ type: "text", value: part })
      continue
    }

    if (part === "$") {
      tokens.push({ type: "prompt", value: part })
      isFirst = true
      afterCommand = false
      continue
    }

    if (isFirst && COMMANDS.has(part)) {
      tokens.push({ type: "command", value: part })
      isFirst = false
      afterCommand = true
    } else if (afterCommand && SUBCOMMANDS.has(part)) {
      tokens.push({ type: "subcommand", value: part })
      afterCommand = false
    } else if (part.startsWith("-")) {
      tokens.push({ type: "flag", value: part })
      afterCommand = false
    } else if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
      tokens.push({ type: "string", value: part })
      afterCommand = false
    } else if (part === "|" || part === "||" || part === "&&") {
      tokens.push({ type: "pipe", value: part })
      afterCommand = false
    } else {
      tokens.push({ type: "arg", value: part })
      afterCommand = false
    }
  }

  return tokens
}

/**
 * CSS color classes per token type.
 * Uses Tailwind classes that map to shadcn CSS variables.
 */
const TOKEN_COLORS: Record<TokenType, string> = {
  prompt: "text-muted-foreground/60",
  command: "text-amber-600 dark:text-amber-400",
  subcommand: "text-sky-600 dark:text-sky-400",
  arg: "text-foreground",
  flag: "text-muted-foreground",
  string: "text-emerald-600 dark:text-emerald-400",
  pipe: "text-muted-foreground/50",
  text: "",
}

export type CodeBlockCommandLanguage = "bash" | "shell" | "text"

export type CodeBlockCommandProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof codeBlockCommandVariants> & {
    /** The shell command string to display (e.g. "pnpm dlx shadcn@latest add button"). */
    code: string
    /** Language label displayed in the header. Default "bash". */
    language?: CodeBlockCommandLanguage
    /** Whether to show the copy button. Default true. */
    showCopy?: boolean
  }

function CodeBlockCommand({
  code,
  language = "bash",
  showCopy = true,
  variant,
  className,
  ...hostProps
}: CodeBlockCommandProps) {
  const { resolvedTheme } = useTheme()
  const tokens = React.useMemo(() => tokenize(code), [code])

  return (
    <div
      data-slot="code-block-command"
      data-theme={resolvedTheme}
      style={{ colorScheme: resolvedTheme }}
      className={cn(codeBlockCommandVariants({ variant, className }))}
      {...hostProps}
    >
      {/* Header bar with language label */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        {showCopy && (
          <CopyButton
            value={code}
            variant="ghost"
            size="sm"
            iconOnly
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground [&_svg]:size-3"
          />
        )}
      </div>

      {/* Code content with token coloring */}
      <pre className="overflow-x-auto p-4 leading-6">
        <code className="font-mono">
          {tokens.map((token, i) => (
            <span key={i} className={TOKEN_COLORS[token.type]}>
              {token.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

export { CodeBlockCommand }
