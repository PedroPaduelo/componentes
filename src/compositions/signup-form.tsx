import { useState } from "react"
import { User, Mail, Lock, Palette } from "lucide-react"

import {
  Input,
  Checkbox,
  InputGroupFluid,
  InputFieldFluid,
  InputCopyFluid,
  InputMessageFluid,
  CheckboxGroupFluid,
  CheckboxItemFluid,
  RadioGroupFluid,
  RadioItemFluid,
  SelectFluid,
  SelectTriggerFluid,
  SelectContentFluid,
  SelectItemFluid,
  SliderFluid,
  ElasticSlider,
  SwitchFluid,
  ColorPickerFluid,
  ReactWheelPicker,
  SlideToUnlock,
  MiddleTruncation,
  AskUserQuestionsFluid,
  ConsentManager,
} from "@/components/ui"
import type { SliderValue } from "@/components/ui/slider-fluid"

const ageYears = Array.from({ length: 60 }, (_, i) => ({
  value: String(18 + i),
  label: String(18 + i),
}))

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

const prefItems = [
  "Notificações por e-mail",
  "Notificações push",
  "Resumo semanal",
  "Novidades e ofertas",
]

export function SignupForm() {
  // Conta
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")

  // Perfil
  const [plan, setPlan] = useState("pro")
  const [role, setRole] = useState("")
  const [age, setAge] = useState("25")
  const [accentColor, setAccentColor] = useState("#6366f1")

  // Preferências
  const [prefChecked, setPrefChecked] = useState<Set<number>>(new Set([0, 2]))
  const [volume, setVolume] = useState<SliderValue>(60)
  const [intensity, setIntensity] = useState(0.5)
  const [marketing, setMarketing] = useState(true)
  const [darkUi, setDarkUi] = useState(false)

  // Onboarding
  const [interests, setInterests] = useState<string | null>(null)
  const [bio, setBio] = useState("")
  const [bioFiles, setBioFiles] = useState<File[]>([])

  // Privacidade
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const togglePref = (i: number) =>
    setPrefChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bem-vindo — vamos configurar sua conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha o formulário de onboarding abaixo. Tudo é apenas demonstração
          visual (sem backend).
        </p>
      </header>

      {/* ── Conta ─────────────────────────────────────── */}
      <Section
        title="Conta"
        description="Informações básicas de acesso."
      >
        <InputGroupFluid>
          <InputFieldFluid
            index={0}
            label="Nome completo"
            icon={User}
            placeholder="Maria Silva"
            value={fullName}
            onChange={setFullName}
          />
          <InputFieldFluid
            index={1}
            label="E-mail"
            icon={Mail}
            placeholder="voce@exemplo.com"
            value={email}
            onChange={setEmail}
          />
          <InputFieldFluid
            index={2}
            label="Senha"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            error={
              password.length > 0 && password.length < 6
                ? "Mínimo de 6 caracteres"
                : undefined
            }
          />
        </InputGroupFluid>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-username"
            className="text-[13px] font-medium text-foreground"
          >
            Nome de usuário
          </label>
          <Input
            id="signup-username"
            placeholder="@maria"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Seu link público:{" "}
            <MiddleTruncation
              as="span"
              className="font-mono"
              text={`https://app.exemplo.com/u/${username || "username"}`}
              maxLength={36}
              ellipsis="…"
            />
          </p>
        </div>
      </Section>

      {/* ── Perfil ────────────────────────────────────── */}
      <Section
        title="Perfil"
        description="Conte um pouco mais sobre você."
      >
        <div className="space-y-1.5">
          <span className="text-[13px] font-medium text-foreground">Plano</span>
          <SelectFluid value={plan} onValueChange={setPlan}>
            <SelectTriggerFluid placeholder="Escolha um plano…" />
            <SelectContentFluid>
              <SelectItemFluid index={0} value="free">
                Gratuito
              </SelectItemFluid>
              <SelectItemFluid index={1} value="pro">
                Pro
              </SelectItemFluid>
              <SelectItemFluid index={2} value="team">
                Equipe
              </SelectItemFluid>
              <SelectItemFluid index={3} value="enterprise">
                Enterprise
              </SelectItemFluid>
            </SelectContentFluid>
          </SelectFluid>
        </div>

        <div className="space-y-2">
          <span className="text-[13px] font-medium text-foreground">
            Como você se descreve?
          </span>
          <RadioGroupFluid value={role} onValueChange={setRole}>
            <RadioItemFluid index={0} value="dev" label="Desenvolvedor(a)" />
            <RadioItemFluid index={1} value="design" label="Designer" />
            <RadioItemFluid index={2} value="pm" label="Product Manager" />
            <RadioItemFluid index={3} value="other" label="Outro" />
          </RadioGroupFluid>
        </div>

        <div className="flex flex-wrap items-end gap-8">
          <div className="space-y-2">
            <span className="text-[13px] font-medium text-foreground">Idade</span>
            <ReactWheelPicker
              id="signup-age"
              options={ageYears}
              defaultValue={age}
              onValueChange={setAge}
              className="w-24"
            />
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
              <Palette size={14} /> Cor de destaque
            </span>
            <ColorPickerFluid
              value={accentColor}
              onValueChange={(v) => setAccentColor(v)}
            />
            <code className="text-xs text-muted-foreground">{accentColor}</code>
          </div>
        </div>
      </Section>

      {/* ── Preferências ──────────────────────────────── */}
      <Section
        title="Preferências"
        description="Ajuste como o produto se comporta para você."
      >
        <div className="space-y-2">
          <span className="text-[13px] font-medium text-foreground">
            Quero receber
          </span>
          <CheckboxGroupFluid checkedIndices={prefChecked}>
            {prefItems.map((label, i) => (
              <CheckboxItemFluid
                key={label}
                index={i}
                label={label}
                checked={prefChecked.has(i)}
                onToggle={() => togglePref(i)}
              />
            ))}
          </CheckboxGroupFluid>
        </div>

        <div className="w-full max-w-sm space-y-1.5">
          <span className="text-[13px] font-medium text-foreground">
            Volume das notificações
          </span>
          <SliderFluid value={volume} onChange={setVolume} label="Volume" />
        </div>

        <div className="w-full max-w-sm space-y-1.5">
          <span className="text-[13px] font-medium text-foreground">
            Intensidade de animações
          </span>
          <ElasticSlider
            value={intensity}
            onValueChange={setIntensity}
            label="Animações"
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
        </div>

        <div className="flex flex-col gap-1 pt-2">
          <SwitchFluid
            label="E-mails de marketing"
            checked={marketing}
            onToggle={() => setMarketing((v) => !v)}
          />
          <SwitchFluid
            label="Tema escuro por padrão"
            checked={darkUi}
            onToggle={() => setDarkUi((v) => !v)}
          />
        </div>
      </Section>

      {/* ── Onboarding ────────────────────────────────── */}
      <Section
        title="Onboarding"
        description="Algumas perguntas rápidas para personalizar sua experiência."
      >
        {interests ? (
          <p className="text-[13px] text-muted-foreground">
            Interesses selecionados:{" "}
            <span className="font-medium text-foreground">{interests}</span>
          </p>
        ) : (
          <AskUserQuestionsFluid
            questions={[
              {
                id: "goal",
                title: "Qual é o seu objetivo principal?",
                options: [
                  {
                    id: "build",
                    title: "Construir um produto",
                    description: "do zero ao deploy",
                  },
                  {
                    id: "learn",
                    title: "Aprender",
                    description: "estudar e praticar",
                  },
                  {
                    id: "team",
                    title: "Colaborar em equipe",
                    description: "trabalho conjunto",
                  },
                ],
              },
              {
                id: "topics",
                title: "Quais temas te interessam? (múltipla)",
                multiSelect: true,
                allowOther: true,
                otherPlaceholder: "Outro tema…",
                options: [
                  { id: "frontend", title: "Frontend" },
                  { id: "backend", title: "Backend" },
                  { id: "design", title: "Design" },
                  { id: "ai", title: "IA" },
                ],
              },
            ]}
            onComplete={(answers) =>
              setInterests(
                Object.values(answers)
                  .flatMap((a) => a.selectedIds)
                  .join(", ") || "(pulado)"
              )
            }
          />
        )}

        <div className="space-y-1.5">
          <span className="text-[13px] font-medium text-foreground">
            Conte um pouco sobre você
          </span>
          <InputMessageFluid
            value={bio}
            onValueChange={setBio}
            files={bioFiles}
            onFilesChange={setBioFiles}
            placeholder="Escreva uma breve apresentação…"
            onSend={(text) => setBio(text)}
          />
        </div>
      </Section>

      {/* ── Segurança & Privacidade ───────────────────── */}
      <ConsentManager position="bottom-right">
        <Section
          title="Segurança & Privacidade"
          description="Sua chave de API e termos de uso."
        >
          <div className="rounded-lg border border-border bg-background px-2">
            <InputCopyFluid
              label="Sua chave de API"
              value="sk_live_4eC39HqLyjWDarjtT1zdp7dc"
            />
          </div>

          <label className="flex items-start gap-3 text-[13px] text-foreground">
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(v) => setAcceptTerms(v === true)}
              className="mt-0.5"
            />
            <span>
              Li e aceito os{" "}
              <span className="font-medium underline">Termos de Uso</span> e a{" "}
              <span className="font-medium underline">
                Política de Privacidade
              </span>
              . Use o botão <em>Cookies</em> no canto para gerenciar consentimento.
            </span>
          </label>
        </Section>
      </ConsentManager>

      {/* ── Enviar ────────────────────────────────────── */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        {submitted ? (
          <p className="text-center text-sm font-medium text-foreground">
            🎉 Cadastro enviado! Bem-vindo(a), {fullName || "novo usuário"}.
          </p>
        ) : (
          <>
            <p className="text-center text-[13px] text-muted-foreground">
              Arraste para concluir o cadastro
              {!acceptTerms && " (aceite os termos acima)"}
            </p>
            <div className="mx-auto w-full max-w-xs">
              <SlideToUnlock
                variant="success"
                label={submitted ? "Concluído!" : "Deslize para enviar"}
                onUnlock={() => setSubmitted(true)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
