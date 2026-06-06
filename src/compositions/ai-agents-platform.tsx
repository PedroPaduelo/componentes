/**
 * Composição "Plataforma de Agentes de IA".
 *
 * App de 3 painéis montado SÓ com componentes do registry da vitrine:
 *  - Sidebar de agentes (avatar picsum + nome + função/badge + dot de status)
 *  - Painel central: conversa (ChatMessageFluid) + execução
 *    (ThinkingStepsFluid + subcomponentes + ThinkingIndicatorFluid) + composer
 *    (InputMessageFluid controlado)
 *  - Painel direito: tools com SwitchFluid + métricas com AnimatedNumber
 *
 * Estado real (useState): trocar de agente muda a thread + tools + métricas;
 * enviar mensagem adiciona a bolha do user na hora e dispara um "thinking"
 * mockado (setTimeout) que responde com a mensagem do assistant.
 */
import { useEffect, useRef, useState } from "react"
import { Bot, MessageSquarePlus } from "lucide-react"

import { ButtonFluid } from "@/components/ui/button-fluid"
import { BadgeFluid } from "@/components/ui/badge-fluid"
import { SwitchFluid } from "@/components/ui/switch-fluid"
import { TooltipFluid } from "@/components/ui/tooltip-fluid"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { ChatMessageFluid } from "@/components/ui/index"
import {
  ThinkingStepsFluid,
  ThinkingStepsHeaderFluid,
  ThinkingStepsContentFluid,
  ThinkingStepFluid,
  ThinkingStepDetailsFluid,
  ThinkingStepSourcesFluid,
  ThinkingStepSourceFluid,
} from "@/components/ui/index"
import { ThinkingIndicatorFluid } from "@/components/ui/thinking-indicator-fluid"
import { InputMessageFluid } from "@/components/ui/input-message-fluid"
import type { IconName } from "@/lib/icon-context"
import type { BadgeColor } from "@/components/ui/badge-fluid-variants"

/* -------------------------------------------------------------------------- */
/*                                  modelos                                    */
/* -------------------------------------------------------------------------- */

type Role = "user" | "assistant"

type Message = {
  id: number
  from: Role
  text: string
  time?: string
}

type ExecStep = {
  icon: IconName
  label: string
  description?: string
  /** Fontes (badges) opcionais exibidas sob o passo. */
  sources?: { label: string; color: BadgeColor }[]
  /** Detalhes expansíveis opcionais. */
  details?: { summary: string; items: string[] }
}

type Tool = {
  id: string
  label: string
  enabled: boolean
}

type Metric = {
  label: string
  value: number
  prefix?: string
  suffix?: string
}

type Agent = {
  id: string
  name: string
  role: string
  badge: string
  badgeColor: BadgeColor
  online: boolean
  seed: string
  initial: string
  /** Thread inicial mockada do agente. */
  thread: Message[]
  /** Passos de execução exibidos enquanto o agente "pensa". */
  steps: ExecStep[]
  /** Ferramentas do agente (com estado on/off inicial). */
  tools: Tool[]
  /** Métricas do agente. */
  metrics: Metric[]
  /** Texto-base da resposta gerada ao enviar uma mensagem. */
  replyHint: string
}

const AGENTS: Agent[] = [
  {
    id: "atlas",
    name: "Atlas",
    role: "Pesquisador",
    badge: "Research",
    badgeColor: "blue",
    online: true,
    seed: "atlas-agent",
    initial: "A",
    thread: [
      {
        id: 1,
        from: "user",
        text: "Levanta as tendências de adoção de WebGPU em 2025.",
        time: "Hoje 09:12",
      },
      {
        id: 2,
        from: "assistant",
        text: "Reuni 6 fontes recentes. O suporte em navegadores chegou a ~78% e o uso em libs de ML no browser triplicou. Quer um resumo por vertical?",
      },
    ],
    steps: [
      {
        icon: "search",
        label: "Planejando a busca",
        description: "Quebrando a pergunta em sub-tópicos.",
      },
      {
        icon: "globe",
        label: "Consultando fontes",
        sources: [
          { label: "caniuse.com", color: "blue" },
          { label: "web.dev", color: "green" },
        ],
      },
      {
        icon: "check",
        label: "Sintetizando achados",
        details: {
          summary: "Ver raciocínio",
          items: [
            "Cruzou dados de suporte com casos de uso.",
            "Priorizou fontes dos últimos 6 meses.",
          ],
        },
      },
    ],
    tools: [
      { id: "web", label: "Busca na web", enabled: true },
      { id: "scholar", label: "Artigos acadêmicos", enabled: true },
      { id: "summarize", label: "Resumo automático", enabled: false },
    ],
    metrics: [
      { label: "Pesquisas", value: 1284 },
      { label: "Tokens", value: 92, suffix: "k" },
      { label: "Precisão", value: 96, suffix: "%" },
    ],
    replyHint:
      "Boa pergunta. Mapeei as fontes mais relevantes e organizei um panorama — posso detalhar qualquer ponto que você quiser.",
  },
  {
    id: "nova",
    name: "Nova",
    role: "Engenheira de código",
    badge: "Code",
    badgeColor: "purple",
    online: true,
    seed: "nova-agent",
    initial: "N",
    thread: [
      {
        id: 1,
        from: "user",
        text: "Refatora esse hook pra usar useReducer e evitar re-renders.",
        time: "Hoje 10:40",
      },
      {
        id: 2,
        from: "assistant",
        text: "Migrei o estado pra um reducer tipado e memoizei o dispatch. Os re-renders caíram de 9 para 2 por interação.",
      },
    ],
    steps: [
      {
        icon: "brain",
        label: "Analisando o código",
        description: "Mapeando dependências do estado.",
      },
      {
        icon: "settings",
        label: "Aplicando refatoração",
        sources: [{ label: "react.dev", color: "blue" }],
      },
      {
        icon: "check",
        label: "Rodando os testes",
        details: {
          summary: "Ver diff",
          items: ["12 testes passando.", "Cobertura mantida em 94%."],
        },
      },
    ],
    tools: [
      { id: "exec", label: "Executar código", enabled: true },
      { id: "lint", label: "Lint automático", enabled: true },
      { id: "deploy", label: "Deploy preview", enabled: false },
    ],
    metrics: [
      { label: "Commits", value: 342 },
      { label: "Tokens", value: 148, suffix: "k" },
      { label: "Build", value: 99, suffix: "%" },
    ],
    replyHint:
      "Fechado. Apliquei a mudança preservando a API pública e rodei a suíte — está tudo verde.",
  },
  {
    id: "sol",
    name: "Sol",
    role: "Suporte ao cliente",
    badge: "Support",
    badgeColor: "amber",
    online: true,
    seed: "sol-agent",
    initial: "S",
    thread: [
      {
        id: 1,
        from: "user",
        text: "Um cliente não consegue redefinir a senha. Por onde começo?",
        time: "Hoje 11:05",
      },
      {
        id: 2,
        from: "assistant",
        text: "Verifiquei os logs: o e-mail de reset está caindo no spam do domínio dele. Sugeri liberar o remetente e reenviei o link.",
      },
    ],
    steps: [
      {
        icon: "search",
        label: "Buscando o ticket",
        description: "Localizando o histórico do cliente.",
      },
      {
        icon: "mail",
        label: "Checando entregabilidade",
        sources: [{ label: "postmark", color: "amber" }],
      },
      {
        icon: "check",
        label: "Propondo solução",
      },
    ],
    tools: [
      { id: "kb", label: "Base de conhecimento", enabled: true },
      { id: "email", label: "Enviar e-mail", enabled: true },
      { id: "escalate", label: "Escalar p/ humano", enabled: false },
    ],
    metrics: [
      { label: "Tickets", value: 5120 },
      { label: "Tokens", value: 64, suffix: "k" },
      { label: "CSAT", value: 92, suffix: "%" },
    ],
    replyHint:
      "Já investiguei o caso e identifiquei a causa provável. Posso aplicar a correção ou abrir um passo a passo pro cliente.",
  },
  {
    id: "vega",
    name: "Vega",
    role: "Analista de dados",
    badge: "Data",
    badgeColor: "green",
    online: false,
    seed: "vega-agent",
    initial: "V",
    thread: [
      {
        id: 1,
        from: "user",
        text: "Qual foi a coorte com maior retenção no trimestre?",
        time: "Ontem 17:22",
      },
      {
        id: 2,
        from: "assistant",
        text: "A coorte de março liderou com 41% de retenção em D30 — 9 pontos acima da média. Posso plotar a curva completa.",
      },
    ],
    steps: [
      {
        icon: "search",
        label: "Selecionando o dataset",
        description: "Filtrando eventos do trimestre.",
      },
      {
        icon: "settings",
        label: "Calculando coortes",
        sources: [{ label: "warehouse", color: "green" }],
      },
      {
        icon: "check",
        label: "Resumindo insights",
        details: {
          summary: "Ver método",
          items: ["Janela D30 por coorte mensal.", "Excluiu contas de teste."],
        },
      },
    ],
    tools: [
      { id: "sql", label: "Consultas SQL", enabled: true },
      { id: "charts", label: "Gerar gráficos", enabled: false },
      { id: "export", label: "Exportar CSV", enabled: false },
    ],
    metrics: [
      { label: "Consultas", value: 876 },
      { label: "Tokens", value: 110, suffix: "k" },
      { label: "Cobertura", value: 88, suffix: "%" },
    ],
    replyHint:
      "Analisei os números e destaquei o que mais se move. Quer que eu gere uma visualização pra acompanhar?",
  },
  {
    id: "iris",
    name: "Iris",
    role: "Redatora",
    badge: "Writing",
    badgeColor: "pink",
    online: true,
    seed: "iris-agent",
    initial: "I",
    thread: [
      {
        id: 1,
        from: "user",
        text: "Reescreve esse parágrafo com um tom mais leve e direto.",
        time: "Hoje 08:30",
      },
      {
        id: 2,
        from: "assistant",
        text: "Pronto: cortei 30% das palavras, troquei a voz passiva por ativa e abri com um gancho mais curto. Quer duas variações de título?",
      },
    ],
    steps: [
      {
        icon: "brain",
        label: "Lendo o texto",
        description: "Identificando tom e redundâncias.",
      },
      {
        icon: "pencil",
        label: "Reescrevendo",
        sources: [{ label: "guia de estilo", color: "pink" }],
      },
      {
        icon: "check",
        label: "Revisando",
      },
    ],
    tools: [
      { id: "tone", label: "Ajuste de tom", enabled: true },
      { id: "grammar", label: "Revisão gramatical", enabled: true },
      { id: "seo", label: "Otimização SEO", enabled: false },
    ],
    metrics: [
      { label: "Textos", value: 2310 },
      { label: "Tokens", value: 73, suffix: "k" },
      { label: "Aprovação", value: 94, suffix: "%" },
    ],
    replyHint:
      "Trabalhei na versão final cuidando do ritmo e da clareza. Posso ajustar o tom se quiser algo mais formal ou mais casual.",
  },
]

const REPLY_DELAY_MS = 1400

/* -------------------------------------------------------------------------- */
/*                              sub-componentes                                */
/* -------------------------------------------------------------------------- */

function AgentAvatar({ agent }: { agent: Agent }) {
  return (
    <span className="relative inline-flex shrink-0">
      <img
        src={`https://picsum.photos/seed/${agent.seed}/64/64`}
        alt={agent.name}
        loading="lazy"
        className="size-9 rounded-full object-cover ring-1 ring-border"
      />
      <span
        className={
          agent.online
            ? "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
            : "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-zinc-400 ring-2 ring-card"
        }
        aria-hidden="true"
      />
    </span>
  )
}

function AgentListItem({
  agent,
  active,
  onSelect,
}: {
  agent: Agent
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={
        active
          ? "flex w-full items-center gap-3 rounded-lg border border-border bg-accent/60 px-2.5 py-2 text-left transition-colors"
          : "flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-accent/40"
      }
    >
      <AgentAvatar agent={agent} />
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">
            {agent.name}
          </span>
          <BadgeFluid variant="solid" size="sm" color={agent.badgeColor}>
            {agent.badge}
          </BadgeFluid>
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {agent.role}
        </span>
      </span>
    </button>
  )
}

function ExecutionPanel({
  steps,
  pending,
}: {
  steps: ExecStep[]
  pending: boolean
}) {
  return (
    <div className="flex w-full max-w-[90%] flex-col gap-2 self-start">
      <ThinkingStepsFluid defaultOpen>
        <ThinkingStepsHeaderFluid>
          {pending ? "Executando" : "Plano de execução"}
        </ThinkingStepsHeaderFluid>
        <ThinkingStepsContentFluid>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1
            const status = pending && isLast ? "active" : "complete"
            return (
              <ThinkingStepFluid
                key={step.label}
                index={i}
                icon={step.icon}
                label={step.label}
                description={step.description}
                status={status}
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
      {pending ? (
        <div className="flex items-center gap-2 pl-1 text-[13px] text-muted-foreground">
          <ThinkingIndicatorFluid />
          <span>Gerando resposta…</span>
        </div>
      ) : null}
    </div>
  )
}

function MetricTile({ metric }: { metric: Metric }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3">
      <span className="text-[11px] text-muted-foreground">{metric.label}</span>
      <span className="flex items-baseline text-xl font-semibold tracking-tight text-foreground">
        {metric.prefix ? <span>{metric.prefix}</span> : null}
        <AnimatedNumber value={metric.value} />
        {metric.suffix ? (
          <span className="text-base text-muted-foreground">
            {metric.suffix}
          </span>
        ) : null}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              AiAgentsPlatform                               */
/* -------------------------------------------------------------------------- */

export function AiAgentsPlatform() {
  const [activeId, setActiveId] = useState<string>(AGENTS[0].id)

  // Threads por agente (estado real, semente do mock por agente).
  const [threads, setThreads] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(AGENTS.map((a) => [a.id, a.thread]))
  )
  // Tools por agente (toggle on/off).
  const [tools, setTools] = useState<Record<string, Tool[]>>(() =>
    Object.fromEntries(AGENTS.map((a) => [a.id, a.tools]))
  )
  const [pending, setPending] = useState(false)
  const [value, setValue] = useState("")

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Limpa o timer pendente ao desmontar.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const activeAgent = AGENTS.find((a) => a.id === activeId) ?? AGENTS[0]
  const activeThread = threads[activeId] ?? []
  const activeTools = tools[activeId] ?? []
  const showExecution = pending || activeThread.length > 0

  function selectAgent(id: string) {
    if (id === activeId) return
    // Trocar de agente interrompe qualquer "thinking" em andamento.
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPending(false)
    setValue("")
    setActiveId(id)
  }

  function toggleTool(toolId: string) {
    setTools((prev) => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map((t) =>
        t.id === toolId ? { ...t, enabled: !t.enabled } : t
      ),
    }))
  }

  function handleSend(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const targetId = activeId

    setThreads((prev) => {
      const current = prev[targetId] ?? []
      const nextId = current.length
        ? current[current.length - 1].id + 1
        : 1
      return {
        ...prev,
        [targetId]: [
          ...current,
          { id: nextId, from: "user", text: trimmed, time: "Agora" },
        ],
      }
    })
    setValue("")
    setPending(true)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const agent = AGENTS.find((a) => a.id === targetId) ?? AGENTS[0]
      setThreads((prev) => {
        const current = prev[targetId] ?? []
        const nextId = current.length
          ? current[current.length - 1].id + 1
          : 1
        return {
          ...prev,
          [targetId]: [
            ...current,
            { id: nextId, from: "assistant", text: agent.replyHint },
          ],
        }
      })
      setPending(false)
      timerRef.current = null
    }, REPLY_DELAY_MS)
  }

  function resetThread() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPending(false)
    setValue("")
    setThreads((prev) => ({ ...prev, [activeId]: activeAgent.thread }))
  }

  return (
    <div className="flex h-[80vh] w-full overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-sm">
      {/* ── Sidebar de agentes ─────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="flex min-h-[3.75rem] items-center gap-2 border-b border-border px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Orquestra IA</span>
            <span className="text-[11px] text-muted-foreground">
              {AGENTS.filter((a) => a.online).length} agentes online
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {AGENTS.map((agent) => (
            <AgentListItem
              key={agent.id}
              agent={agent}
              active={agent.id === activeId}
              onSelect={() => selectAgent(agent.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── Painel central — conversa + execução + composer ────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[3.75rem] shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <AgentAvatar agent={activeAgent} />
            <div className="flex flex-col leading-tight">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                {activeAgent.name}
                <BadgeFluid
                  variant="solid"
                  size="sm"
                  color={activeAgent.badgeColor}
                >
                  {activeAgent.badge}
                </BadgeFluid>
              </span>
              <span className="text-[11px] text-muted-foreground">
                {activeAgent.online ? "Disponível agora" : "Offline"} ·{" "}
                {activeAgent.role}
              </span>
            </div>
          </div>
          <TooltipFluid content="Reiniciar conversa">
            <ButtonFluid
              variant="ghost"
              size="icon-sm"
              aria-label="Reiniciar conversa"
              onClick={resetThread}
            >
              <MessageSquarePlus size={16} />
            </ButtonFluid>
          </TooltipFluid>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
          {activeThread.map((m) =>
            m.from === "user" ? (
              <ChatMessageFluid key={m.id} from="user" time={m.time}>
                {m.text}
              </ChatMessageFluid>
            ) : (
              <ChatMessageFluid key={m.id} from="assistant">
                {m.text}
              </ChatMessageFluid>
            )
          )}

          {showExecution ? (
            <ExecutionPanel steps={activeAgent.steps} pending={pending} />
          ) : null}
        </div>

        <div className="shrink-0 border-t border-border px-4 py-3">
          <InputMessageFluid
            value={value}
            onValueChange={setValue}
            placeholder={`Escreva para ${activeAgent.name}…`}
            onSend={handleSend}
          />
        </div>
      </div>

      {/* ── Painel direito — tools + métricas ──────────────────────────── */}
      <aside className="hidden w-72 shrink-0 flex-col border-l border-border bg-card/40 lg:flex">
        <div className="flex min-h-[3.75rem] shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Ferramentas & métricas</span>
        </div>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
          <section className="flex flex-col gap-2">
            <h3 className="px-1 text-xs font-medium text-muted-foreground">
              Tools do agente
            </h3>
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-1">
              {activeTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between rounded-md px-1"
                >
                  <SwitchFluid
                    label={tool.label}
                    checked={tool.enabled}
                    onToggle={() => toggleTool(tool.id)}
                  />
                  <span
                    className={
                      tool.enabled
                        ? "pr-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                        : "pr-2 text-[11px] text-muted-foreground"
                    }
                  >
                    {tool.enabled ? "On" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="px-1 text-xs font-medium text-muted-foreground">
              Métricas
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {activeAgent.metrics.map((metric) => (
                <MetricTile key={metric.label} metric={metric} />
              ))}
            </div>
          </section>

          <section className="mt-auto rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-foreground">
              {activeAgent.name} · {activeAgent.role}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeTools.filter((t) => t.enabled).length} de{" "}
              {activeTools.length} ferramentas ativas nesta sessão.
            </p>
          </section>
        </div>
      </aside>
    </div>
  )
}
