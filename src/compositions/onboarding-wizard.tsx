import { useMemo, useState } from "react"
import {
  User,
  Building2,
  Rocket,
  GraduationCap,
  Users,
  LineChart,
  Palette,
  Code2,
  Mail,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"

import {
  Input,
  Button,
  SwitchFluid,
  RadioGroupFluid,
  RadioItemFluid,
  MultiStepLoader,
} from "@/components/ui"
import { cn } from "@/lib/utils"

/* ── Tipos & dados estáticos ───────────────────────────── */

type Goal = {
  id: string
  title: string
  description: string
  icon: typeof Rocket
}

const GOALS: Goal[] = [
  {
    id: "ship",
    title: "Lançar um produto",
    description: "Do protótipo ao deploy em produção.",
    icon: Rocket,
  },
  {
    id: "learn",
    title: "Aprender e praticar",
    description: "Estudar e dominar novas tecnologias.",
    icon: GraduationCap,
  },
  {
    id: "collaborate",
    title: "Colaborar em equipe",
    description: "Trabalhar junto com seu time.",
    icon: Users,
  },
  {
    id: "grow",
    title: "Crescer o negócio",
    description: "Acompanhar métricas e escalar.",
    icon: LineChart,
  },
  {
    id: "design",
    title: "Desenhar interfaces",
    description: "Prototipar e refinar a experiência.",
    icon: Palette,
  },
  {
    id: "automate",
    title: "Automatizar fluxos",
    description: "Integrar ferramentas via código.",
    icon: Code2,
  },
]

const STEP_META = [
  { label: "Perfil", title: "Conte sobre você" },
  { label: "Objetivos", title: "O que você quer alcançar?" },
  { label: "Preferências", title: "Ajuste sua experiência" },
  { label: "Equipe", title: "Convide seu time" },
  { label: "Revisão", title: "Tudo certo?" },
] as const

const LOADER_STEPS = [
  { text: "Criando sua conta" },
  { text: "Salvando seus objetivos" },
  { text: "Aplicando preferências" },
  { text: "Enviando convites" },
  { text: "Preparando seu workspace" },
]

const ROLES: { value: string; label: string }[] = [
  { value: "dev", label: "Desenvolvedor(a)" },
  { value: "design", label: "Designer" },
  { value: "pm", label: "Product Manager" },
  { value: "founder", label: "Fundador(a)" },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ── Stepper ───────────────────────────────────────────── */

function Stepper({ step }: { step: number }) {
  const total = STEP_META.length
  return (
    <div className="space-y-3">
      <ol className="flex items-center">
        {STEP_META.map((meta, i) => {
          const done = i < step
          const active = i === step
          return (
            <li key={meta.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active &&
                      "border-primary bg-primary/10 text-primary ring-2 ring-primary/30",
                    !done && !active && "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-[11px] font-medium sm:block",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {meta.label}
                </span>
              </div>
              {i < total - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2",
                    i < step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ── Campos auxiliares ─────────────────────────────────── */

function Field({
  id,
  label,
  icon: Icon,
  ...rest
}: {
  id: string
  label: string
  icon: typeof User
} & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[13px] font-medium text-foreground"
      >
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
      </label>
      <Input id={id} {...rest} />
    </div>
  )
}

/* ── Componente principal ──────────────────────────────── */

export function OnboardingWizard() {
  const [step, setStep] = useState(0)

  // Etapa 1 — perfil
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")

  // Etapa 2 — objetivos
  const [goals, setGoals] = useState<Set<string>>(new Set())

  // Etapa 3 — preferências
  const [role, setRole] = useState("dev")
  const [emailNotif, setEmailNotif] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [productTips, setProductTips] = useState(true)

  // Etapa 4 — equipe
  const [invites, setInvites] = useState<string[]>([])
  const [inviteDraft, setInviteDraft] = useState("")

  // Conclusão
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const toggleGoal = (id: string) =>
    setGoals((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const draftValid = EMAIL_RE.test(inviteDraft.trim())
  const canAddInvite = draftValid && !invites.includes(inviteDraft.trim())

  const addInvite = () => {
    if (!canAddInvite) return
    setInvites((prev) => [...prev, inviteDraft.trim()])
    setInviteDraft("")
  }

  const removeInvite = (email: string) =>
    setInvites((prev) => prev.filter((e) => e !== email))

  // Validação leve por etapa
  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return name.trim().length > 0
      case 1:
        return goals.size > 0
      default:
        return true
    }
  }, [step, name, goals])

  const isLast = step === STEP_META.length - 1

  const next = () => {
    if (!canContinue) return
    setStep((s) => Math.min(s + 1, STEP_META.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const finish = () => {
    setLoading(true)
    // Sequência do loader: duração por etapa × nº de etapas.
    const perStep = 1400
    window.setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, perStep * LOADER_STEPS.length)
  }

  const restart = () => {
    setStep(0)
    setName("")
    setCompany("")
    setGoals(new Set())
    setRole("dev")
    setEmailNotif(true)
    setWeeklyDigest(false)
    setProductTips(true)
    setInvites([])
    setInviteDraft("")
    setDone(false)
  }

  /* ── Tela de sucesso ─────────────────────────────────── */
  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/20">
          <Sparkles className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tudo pronto, {name || "por aqui"}! 🎉
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Seu workspace foi configurado com {goals.size}{" "}
            {goals.size === 1 ? "objetivo" : "objetivos"} e {invites.length}{" "}
            {invites.length === 1 ? "convite enviado" : "convites enviados"}.
          </p>
        </div>
        <Button onClick={restart} variant="outline">
          Refazer onboarding
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-8">
      <MultiStepLoader
        loadingStates={LOADER_STEPS}
        loading={loading}
        duration={1400}
        loop={false}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Cabeçalho + stepper */}
        <div className="space-y-5 border-b border-border bg-muted/30 px-6 py-6 sm:px-8">
          <Stepper step={step} />
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-primary">
              Passo {step + 1} de {STEP_META.length}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {STEP_META[step].title}
            </h1>
          </div>
        </div>

        {/* Conteúdo da etapa */}
        <div className="min-h-[300px] px-6 py-6 sm:px-8">
          {/* Etapa 1 — Perfil */}
          {step === 0 && (
            <div className="space-y-4">
              <Field
                id="ob-name"
                label="Nome completo"
                icon={User}
                placeholder="Maria Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Field
                id="ob-company"
                label="Empresa (opcional)"
                icon={Building2}
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              {!canContinue && (
                <p className="text-xs text-muted-foreground">
                  Informe seu nome para continuar.
                </p>
              )}
            </div>
          )}

          {/* Etapa 2 — Objetivos */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[13px] text-muted-foreground">
                Selecione um ou mais objetivos (pelo menos um).
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {GOALS.map((goal) => {
                  const selected = goals.has(goal.id)
                  const Icon = goal.icon
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      aria-pressed={selected}
                      className={cn(
                        "group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                          : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          {goal.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {goal.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border transition-all",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-transparent text-transparent"
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Etapa 3 — Preferências */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[13px] font-medium text-foreground">
                  Qual seu papel principal?
                </span>
                <RadioGroupFluid value={role} onValueChange={setRole}>
                  {ROLES.map((r, i) => (
                    <RadioItemFluid
                      key={r.value}
                      index={i}
                      value={r.value}
                      label={r.label}
                    />
                  ))}
                </RadioGroupFluid>
              </div>

              <div className="space-y-1 border-t border-border pt-4">
                <span className="text-[13px] font-medium text-foreground">
                  Notificações
                </span>
                <div className="flex flex-col">
                  <SwitchFluid
                    label="E-mails sobre atividade da conta"
                    checked={emailNotif}
                    onToggle={() => setEmailNotif((v) => !v)}
                  />
                  <SwitchFluid
                    label="Resumo semanal de progresso"
                    checked={weeklyDigest}
                    onToggle={() => setWeeklyDigest((v) => !v)}
                  />
                  <SwitchFluid
                    label="Dicas e novidades do produto"
                    checked={productTips}
                    onToggle={() => setProductTips((v) => !v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4 — Equipe */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-[13px] text-muted-foreground">
                Convide colegas por e-mail. Você pode pular esta etapa.
              </p>
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1.5">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="colega@empresa.com"
                      className="pl-9"
                      value={inviteDraft}
                      onChange={(e) => setInviteDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addInvite()
                        }
                      }}
                    />
                  </div>
                  {inviteDraft.length > 0 && !draftValid && (
                    <p className="text-xs text-destructive">
                      Digite um e-mail válido.
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={addInvite}
                  disabled={!canAddInvite}
                  className="shrink-0"
                >
                  <Plus className="size-4" />
                  Adicionar
                </Button>
              </div>

              {invites.length > 0 ? (
                <ul className="space-y-2">
                  {invites.map((email) => (
                    <li
                      key={email}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
                    >
                      <span className="flex items-center gap-2 truncate text-sm text-foreground">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold uppercase text-primary">
                          {email.slice(0, 2)}
                        </span>
                        <span className="truncate">{email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeInvite(email)}
                        aria-label={`Remover ${email}`}
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  Nenhum convite adicionado ainda.
                </p>
              )}
            </div>
          )}

          {/* Etapa 5 — Revisão */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-[13px] text-muted-foreground">
                Revise as informações antes de finalizar.
              </p>
              <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                <ReviewRow label="Nome" value={name || "—"} onEdit={() => setStep(0)} />
                <ReviewRow
                  label="Empresa"
                  value={company || "—"}
                  onEdit={() => setStep(0)}
                />
                <ReviewRow
                  label="Objetivos"
                  value={
                    goals.size > 0
                      ? GOALS.filter((g) => goals.has(g.id))
                          .map((g) => g.title)
                          .join(", ")
                      : "—"
                  }
                  onEdit={() => setStep(1)}
                />
                <ReviewRow
                  label="Papel"
                  value={ROLES.find((r) => r.value === role)?.label ?? "—"}
                  onEdit={() => setStep(2)}
                />
                <ReviewRow
                  label="Notificações"
                  value={
                    [
                      emailNotif && "Atividade",
                      weeklyDigest && "Resumo semanal",
                      productTips && "Dicas",
                    ]
                      .filter(Boolean)
                      .join(", ") || "Nenhuma"
                  }
                  onEdit={() => setStep(2)}
                />
                <ReviewRow
                  label="Convites"
                  value={
                    invites.length > 0 ? `${invites.length} pessoa(s)` : "Nenhum"
                  }
                  onEdit={() => setStep(3)}
                />
              </dl>
            </div>
          )}
        </div>

        {/* Rodapé — navegação */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className={cn(step === 0 && "invisible")}
          >
            <ChevronLeft className="size-4" />
            Voltar
          </Button>

          {isLast ? (
            <Button type="button" onClick={finish} disabled={loading}>
              <Sparkles className="size-4" />
              Finalizar
            </Button>
          ) : (
            <Button type="button" onClick={next} disabled={!canContinue}>
              Continuar
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Linha de revisão ──────────────────────────────────── */

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-background px-4 py-3">
      <dt className="shrink-0 text-[13px] font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="flex min-w-0 items-center gap-2 text-right">
        <span className="truncate text-[13px] text-foreground">{value}</span>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          editar
        </button>
      </dd>
    </div>
  )
}
