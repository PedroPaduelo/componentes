import * as React from "react"
import { cn } from "@/lib/utils"

type TokenType =
  | "command"
  | "flag"
  | "string"
  | "number"
  | "operator"
  | "path"
  | "variable"
  | "comment"
  | "default"

interface Token {
  type: TokenType
  value: string
}

function tokenizeBash(text: string): Token[] {
  const tokens: Token[] = []
  const words = text.split(/(\s+)/)

  let isFirstWord = true

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      tokens.push({ type: "default", value: word })
      continue
    }

    if (word.startsWith("#")) {
      tokens.push({ type: "comment", value: word })
      continue
    }

    if (word.startsWith("$")) {
      tokens.push({ type: "variable", value: word })
      isFirstWord = false
      continue
    }

    if (word.startsWith("--") || word.startsWith("-")) {
      tokens.push({ type: "flag", value: word })
      isFirstWord = false
      continue
    }

    if (/^["'].*["']$/.test(word)) {
      tokens.push({ type: "string", value: word })
      isFirstWord = false
      continue
    }

    if (/^\d+$/.test(word)) {
      tokens.push({ type: "number", value: word })
      isFirstWord = false
      continue
    }

    if (/^[|>&<]+$/.test(word)) {
      tokens.push({ type: "operator", value: word })
      isFirstWord = true
      continue
    }

    if (word.includes("/") || word.startsWith(".") || word.startsWith("~")) {
      tokens.push({ type: "path", value: word })
      isFirstWord = false
      continue
    }

    if (isFirstWord) {
      tokens.push({ type: "command", value: word })
      isFirstWord = false
      continue
    }

    tokens.push({ type: "default", value: word })
  }

  return tokens
}

const tokenColors: Record<TokenType, string> = {
  command: "text-emerald-400",
  flag: "text-sky-400",
  string: "text-amber-300",
  number: "text-purple-400",
  operator: "text-red-400",
  path: "text-cyan-300",
  variable: "text-pink-400",
  comment: "text-neutral-500",
  default: "text-neutral-300",
}

function SyntaxHighlightedText({ text }: { text: string }) {
  const tokens = tokenizeBash(text)

  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={tokenColors[token.type]}>
          {token.value}
        </span>
      ))}
    </>
  )
}

function useInView(ref: React.RefObject<HTMLElement | null>, once = true) {
  const [inView, setInView] = React.useState(false)
  const triggered = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || (once && triggered.current)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          setInView(true)
          if (once) {
            triggered.current = true
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, once])

  return inView
}

interface TerminalLine {
  type: "command" | "output"
  content: string
}

type TerminalPhase =
  | "idle"
  | "typing"
  | "executing"
  | "outputting"
  | "pausing"
  | "done"

export interface TerminalProps {
  /** Comandos datilografados, um por linha, em sequência. */
  commands?: string[]
  /** Linhas de saída por índice de comando (ex.: `{ 0: ["instalado!"] }`). */
  outputs?: Record<number, string[]>
  /** Usuário exibido no prompt e na barra de título. */
  username?: string
  className?: string
  /** Velocidade base de digitação em ms por caractere. */
  typingSpeed?: number
  /** Pausa entre comandos consecutivos em ms. */
  delayBetweenCommands?: number
  /** Atraso antes do primeiro comando começar a ser digitado, em ms. */
  initialDelay?: number
}

export function Terminal({
  commands = ["npx shadcn@latest init"],
  outputs = {},
  username = "Manus-Macbook",
  className,
  typingSpeed = 50,
  delayBetweenCommands = 800,
  initialDelay = 500,
}: TerminalProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef)

  const [lines, setLines] = React.useState<TerminalLine[]>([])
  const [currentText, setCurrentText] = React.useState("")
  const [commandIdx, setCommandIdx] = React.useState(0)
  const [charIdx, setCharIdx] = React.useState(0)
  const [outputIdx, setOutputIdx] = React.useState(-1)
  const [phase, setPhase] = React.useState<TerminalPhase>("idle")
  const [cursorVisible, setCursorVisible] = React.useState(true)

  const currentCommand = commands[commandIdx] || ""
  const currentOutputs = React.useMemo(
    () => outputs[commandIdx] || [],
    [outputs, commandIdx],
  )
  const isLastCommand = commandIdx === commands.length - 1

  React.useEffect(() => {
    if (!inView || phase !== "idle") return
    const t = setTimeout(() => setPhase("typing"), initialDelay)
    return () => clearTimeout(t)
  }, [inView, phase, initialDelay])

  React.useEffect(() => {
    if (phase !== "typing") return

    if (charIdx < currentCommand.length) {
      const t = setTimeout(
        () => {
          setCurrentText(currentCommand.slice(0, charIdx + 1))
          setCharIdx((c) => c + 1)
        },
        typingSpeed + Math.random() * 30,
      )
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setPhase("executing")
      }, 80)
      return () => clearTimeout(t)
    }
  }, [phase, charIdx, currentCommand, typingSpeed])

  React.useEffect(() => {
    if (phase !== "executing") return

    setLines((prev) => [...prev, { type: "command", content: currentCommand }])
    setCurrentText("")

    if (currentOutputs.length > 0) {
      setOutputIdx(0)
      setPhase("outputting")
    } else if (isLastCommand) {
      setPhase("done")
    } else {
      setPhase("pausing")
    }
  }, [phase, currentCommand, currentOutputs.length, isLastCommand])

  React.useEffect(() => {
    if (phase !== "outputting") return

    if (outputIdx >= 0 && outputIdx < currentOutputs.length) {
      const t = setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { type: "output", content: currentOutputs[outputIdx] },
        ])
        setOutputIdx((i) => i + 1)
      }, 150)
      return () => clearTimeout(t)
    } else if (outputIdx >= currentOutputs.length) {
      const t = setTimeout(() => {
        if (isLastCommand) {
          setPhase("done")
        } else {
          setPhase("pausing")
        }
      }, 300)
      return () => clearTimeout(t)
    }
  }, [phase, outputIdx, currentOutputs, isLastCommand])

  React.useEffect(() => {
    if (phase !== "pausing") return
    const t = setTimeout(() => {
      setCharIdx(0)
      setOutputIdx(-1)
      setCommandIdx((c) => c + 1)
      setPhase("typing")
    }, delayBetweenCommands)
    return () => clearTimeout(t)
  }, [phase, delayBetweenCommands])

  React.useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [lines, phase])

  const prompt = (
    <span className="text-neutral-500">
      <span className="text-sky-500">{username}</span>
      <span className="text-emerald-600">:</span>
      <span className="text-sky-400">~</span>
      <span className="text-neutral-500">$</span>{" "}
    </span>
  )

  return (
    <div
      ref={containerRef}
      data-slot="terminal"
      className={cn("mx-auto w-full max-w-xl px-4 font-mono text-xs", className)}
    >
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Title Bar */}
        <div className="flex items-center gap-2 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500 transition-colors hover:bg-red-600" />
            <div className="h-3 w-3 rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600" />
            <div className="h-3 w-3 rounded-full bg-green-500 transition-colors hover:bg-green-600" />
          </div>
          <div className="flex-1 text-center">
            <span className="truncate text-xs text-neutral-400">
              {username} — bash
            </span>
          </div>
          <div className="w-[52px]" />
        </div>

        {/* Terminal Content */}
        <div
          ref={contentRef}
          className="h-80 overflow-y-auto p-4 font-mono [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {lines.map((line, i) => (
            <div key={i} className="leading-relaxed whitespace-pre-wrap">
              {line.type === "command" ? (
                <span>
                  {prompt}
                  <SyntaxHighlightedText text={line.content} />
                </span>
              ) : (
                <span className="text-neutral-400">{line.content}</span>
              )}
            </div>
          ))}

          {phase === "typing" && (
            <div className="leading-relaxed whitespace-pre-wrap">
              {prompt}
              <SyntaxHighlightedText text={currentText} />
              <span className="ml-0.5 inline-block h-4 w-2 bg-neutral-300 align-middle" />
            </div>
          )}

          {(phase === "done" ||
            phase === "pausing" ||
            phase === "outputting") && (
            <div className="leading-relaxed whitespace-pre-wrap">
              {prompt}
              <span
                className={cn(
                  "inline-block h-4 w-2 bg-neutral-300 align-middle transition-opacity duration-100",
                  !cursorVisible && "opacity-0",
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
