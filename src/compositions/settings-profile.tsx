/**
 * Composição "Configurações & Perfil" (settings-profile).
 *
 * Tela de configurações de conta de um app, NAVEGÁVEL, montada com
 * componentes do registry:
 *  - Sidebar de seções (Perfil/Conta/Notificações/Aparência/Segurança) que
 *    troca o painel central via useState.
 *  - Perfil: Avatar + FileUpload (trocar foto), Inputs, Textarea, SelectFluid.
 *  - Notificações: lista de SwitchFluid funcionais.
 *  - Aparência: RadioGroup de tema (ligado ao ThemeProvider real) + Switches.
 *  - Segurança: Inputs de senha + Switch de 2FA.
 *  - StatefulButton (loading→sucesso) + Sonner toast de confirmação.
 *
 * Estado real via useState — sem backend (tudo mockado).
 */
import * as React from "react"
import { toast } from "sonner"
import {
  User,
  UserCog,
  Bell,
  Palette,
  ShieldCheck,
  Mail,
  Lock,
  Globe,
  AtSign,
  Sparkles,
  Camera,
  Sun,
  Moon,
  Monitor,
  KeyRound,
} from "lucide-react"

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Button,
  Input,
  Textarea,
  FileUpload,
  StatefulButton,
  SwitchFluid,
  RadioGroup,
  RadioGroupItem,
  SelectFluid,
  SelectTriggerFluid,
  SelectContentFluid,
  SelectItemFluid,
  Toaster,
} from "@/components/ui"
import { useTheme } from "@/components/theme/use-theme"
import type { Theme } from "@/components/theme/theme-context"

/* -------------------------------------------------------------------------- */
/*                                   tipos                                     */
/* -------------------------------------------------------------------------- */

type SectionId =
  | "profile"
  | "account"
  | "notifications"
  | "appearance"
  | "security"

type NavItem = {
  id: SectionId
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

/* -------------------------------------------------------------------------- */
/*                                   dados                                     */
/* -------------------------------------------------------------------------- */

const NAV: NavItem[] = [
  {
    id: "profile",
    label: "Perfil",
    description: "Foto, nome e bio públicos",
    icon: User,
  },
  {
    id: "account",
    label: "Conta",
    description: "E-mail, usuário e fuso",
    icon: UserCog,
  },
  {
    id: "notifications",
    label: "Notificações",
    description: "Como te avisamos",
    icon: Bell,
  },
  {
    id: "appearance",
    label: "Aparência",
    description: "Tema e densidade",
    icon: Palette,
  },
  {
    id: "security",
    label: "Segurança",
    description: "Senha e 2FA",
    icon: ShieldCheck,
  },
]

const TIMEZONES = [
  { value: "utc-3", label: "(GMT-03:00) São Paulo" },
  { value: "utc-5", label: "(GMT-05:00) Nova York" },
  { value: "utc", label: "(GMT+00:00) Londres" },
  { value: "utc+1", label: "(GMT+01:00) Berlim" },
  { value: "utc+9", label: "(GMT+09:00) Tóquio" },
]

const LANGUAGES = [
  { value: "pt-br", label: "Português (Brasil)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
]

const THEME_OPTIONS: {
  value: Theme
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: "light", label: "Claro", description: "Sempre claro", icon: Sun },
  { value: "dark", label: "Escuro", description: "Sempre escuro", icon: Moon },
  {
    value: "system",
    label: "Sistema",
    description: "Segue o dispositivo",
    icon: Monitor,
  },
]

/* -------------------------------------------------------------------------- */
/*                              sub-componentes                                */
/* -------------------------------------------------------------------------- */

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">
        <SwitchFluid
          label={checked ? "Ativado" : "Desativado"}
          checked={checked}
          onToggle={onToggle}
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  seções                                     */
/* -------------------------------------------------------------------------- */

function ProfileSection({
  state,
  set,
}: {
  state: ProfileState
  set: SetProfile
}) {
  const initials = state.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

  function handlePhoto(files: File[]) {
    const file = files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    set((prev) => ({ ...prev, avatarUrl: url }))
    toast.success("Foto atualizada", {
      description: `${file.name} pronta para salvar.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Foto de perfil"
        description="Visível para outras pessoas no seu workspace."
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar className="size-20 border border-border">
              <AvatarImage src={state.avatarUrl} alt={state.name} />
              <AvatarFallback className="text-lg font-semibold text-muted-foreground">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
              <Camera className="size-3.5" />
            </span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-dashed border-border">
            <FileUpload accept="image/*" onChange={handlePhoto} />
          </div>
        </div>
      </Panel>

      <Panel
        title="Informações públicas"
        description="Como você aparece para a comunidade."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome completo" htmlFor="sp-name">
            <Input
              id="sp-name"
              value={state.name}
              onChange={(e) =>
                set((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Seu nome"
            />
          </Field>
          <Field label="Cargo / título" htmlFor="sp-role">
            <Input
              id="sp-role"
              value={state.role}
              onChange={(e) =>
                set((prev) => ({ ...prev, role: e.target.value }))
              }
              placeholder="Ex.: Product Designer"
            />
          </Field>
        </div>

        <Field
          label="Bio"
          htmlFor="sp-bio"
          hint={`${state.bio.length}/160 caracteres`}
        >
          <Textarea
            id="sp-bio"
            value={state.bio}
            maxLength={160}
            onChange={(e) =>
              set((prev) => ({ ...prev, bio: e.target.value }))
            }
            placeholder="Conte um pouco sobre você…"
            className="min-h-[96px] resize-none"
          />
        </Field>
      </Panel>
    </div>
  )
}

function AccountSection({
  state,
  set,
}: {
  state: ProfileState
  set: SetProfile
}) {
  return (
    <Panel
      title="Conta"
      description="Dados privados de acesso e preferências regionais."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="E-mail" htmlFor="sp-email" hint="Usado para login e avisos.">
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="sp-email"
              type="email"
              value={state.email}
              onChange={(e) =>
                set((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="voce@exemplo.com"
              className="pl-8"
            />
          </div>
        </Field>

        <Field label="Nome de usuário" htmlFor="sp-username">
          <div className="relative">
            <AtSign className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="sp-username"
              value={state.username}
              onChange={(e) =>
                set((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="usuario"
              className="pl-8"
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fuso horário">
          <SelectFluid
            value={state.timezone}
            onValueChange={(v) =>
              set((prev) => ({ ...prev, timezone: v }))
            }
          >
            <SelectTriggerFluid placeholder="Selecione um fuso…" />
            <SelectContentFluid>
              {TIMEZONES.map((tz, i) => (
                <SelectItemFluid key={tz.value} index={i} value={tz.value}>
                  {tz.label}
                </SelectItemFluid>
              ))}
            </SelectContentFluid>
          </SelectFluid>
        </Field>

        <Field label="Idioma">
          <SelectFluid
            value={state.language}
            onValueChange={(v) =>
              set((prev) => ({ ...prev, language: v }))
            }
          >
            <SelectTriggerFluid placeholder="Selecione um idioma…" />
            <SelectContentFluid>
              {LANGUAGES.map((lng, i) => (
                <SelectItemFluid key={lng.value} index={i} value={lng.value}>
                  {lng.label}
                </SelectItemFluid>
              ))}
            </SelectContentFluid>
          </SelectFluid>
        </Field>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Globe className="size-4 shrink-0" />
        As preferências regionais afetam datas, números e notificações.
      </div>
    </Panel>
  )
}

function NotificationsSection({
  state,
  set,
}: {
  state: ProfileState
  set: SetProfile
}) {
  const toggle = (key: keyof ProfileState["notifications"]) =>
    set((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }))

  return (
    <Panel
      title="Notificações"
      description="Escolha o que e como você quer receber."
    >
      <div className="flex flex-col divide-y divide-border">
        <ToggleRow
          title="E-mail de atividade"
          description="Resumo de menções, respostas e convites."
          checked={state.notifications.email}
          onToggle={() => toggle("email")}
        />
        <ToggleRow
          title="Notificações push"
          description="Alertas em tempo real no navegador."
          checked={state.notifications.push}
          onToggle={() => toggle("push")}
        />
        <ToggleRow
          title="Resumo semanal"
          description="Um digest dos destaques toda segunda."
          checked={state.notifications.weekly}
          onToggle={() => toggle("weekly")}
        />
        <ToggleRow
          title="Novidades e marketing"
          description="Lançamentos, dicas e ofertas ocasionais."
          checked={state.notifications.marketing}
          onToggle={() => toggle("marketing")}
        />
        <ToggleRow
          title="Sons de notificação"
          description="Tocar um som ao receber alertas."
          checked={state.notifications.sound}
          onToggle={() => toggle("sound")}
        />
      </div>
    </Panel>
  )
}

function AppearanceSection({
  state,
  set,
}: {
  state: ProfileState
  set: SetProfile
}) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Tema"
        description="Aplica imediatamente em toda a vitrine."
      >
        <RadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = theme === opt.value
            return (
              <label
                key={opt.value}
                htmlFor={`theme-${opt.value}`}
                className={
                  active
                    ? "flex cursor-pointer items-start gap-3 rounded-lg border border-primary bg-primary/5 p-4 ring-1 ring-primary/40 transition-colors"
                    : "flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
                }
              >
                <RadioGroupItem
                  id={`theme-${opt.value}`}
                  value={opt.value}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Icon className="size-4" />
                    {opt.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {opt.description}
                  </span>
                </div>
              </label>
            )
          })}
        </RadioGroup>
      </Panel>

      <Panel
        title="Interface"
        description="Ajuste a densidade e as animações."
      >
        <div className="flex flex-col divide-y divide-border">
          <ToggleRow
            title="Modo compacto"
            description="Reduz espaçamentos para caber mais conteúdo."
            checked={state.appearance.compact}
            onToggle={() =>
              set((prev) => ({
                ...prev,
                appearance: {
                  ...prev.appearance,
                  compact: !prev.appearance.compact,
                },
              }))
            }
          />
          <ToggleRow
            title="Animações"
            description="Transições e efeitos de movimento na interface."
            checked={state.appearance.animations}
            onToggle={() =>
              set((prev) => ({
                ...prev,
                appearance: {
                  ...prev.appearance,
                  animations: !prev.appearance.animations,
                },
              }))
            }
          />
          <ToggleRow
            title="Barra lateral fixa"
            description="Mantém a navegação sempre visível."
            checked={state.appearance.stickySidebar}
            onToggle={() =>
              set((prev) => ({
                ...prev,
                appearance: {
                  ...prev.appearance,
                  stickySidebar: !prev.appearance.stickySidebar,
                },
              }))
            }
          />
        </div>
      </Panel>
    </div>
  )
}

function SecuritySection({
  state,
  set,
}: {
  state: ProfileState
  set: SetProfile
}) {
  const mismatch =
    state.confirmPassword.length > 0 &&
    state.newPassword !== state.confirmPassword

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Alterar senha"
        description="Use ao menos 8 caracteres com letras e números."
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Senha atual" htmlFor="sp-current">
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="sp-current"
                type="password"
                value={state.currentPassword}
                onChange={(e) =>
                  set((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="••••••••"
                className="pl-8"
              />
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nova senha" htmlFor="sp-new">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sp-new"
                  type="password"
                  value={state.newPassword}
                  onChange={(e) =>
                    set((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Nova senha"
                  className="pl-8"
                />
              </div>
            </Field>
            <Field
              label="Confirmar senha"
              htmlFor="sp-confirm"
              hint={mismatch ? "As senhas não coincidem." : undefined}
            >
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sp-confirm"
                  type="password"
                  value={state.confirmPassword}
                  onChange={(e) =>
                    set((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repita a senha"
                  aria-invalid={mismatch}
                  className={
                    mismatch
                      ? "border-destructive pl-8 focus-visible:ring-destructive/40"
                      : "pl-8"
                  }
                />
              </div>
            </Field>
          </div>
        </div>
      </Panel>

      <Panel
        title="Proteção da conta"
        description="Camadas extras de segurança no login."
      >
        <div className="flex flex-col divide-y divide-border">
          <ToggleRow
            title="Autenticação em dois fatores (2FA)"
            description="Exige um código além da senha ao entrar."
            checked={state.security.twoFactor}
            onToggle={() =>
              set((prev) => ({
                ...prev,
                security: {
                  ...prev.security,
                  twoFactor: !prev.security.twoFactor,
                },
              }))
            }
          />
          <ToggleRow
            title="Alertas de login"
            description="Avisar quando houver acesso de novo dispositivo."
            checked={state.security.loginAlerts}
            onToggle={() =>
              set((prev) => ({
                ...prev,
                security: {
                  ...prev.security,
                  loginAlerts: !prev.security.loginAlerts,
                },
              }))
            }
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
          {state.security.twoFactor
            ? "Sua conta está protegida com 2FA."
            : "Recomendamos ativar a verificação em dois fatores."}
        </div>
      </Panel>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  estado                                     */
/* -------------------------------------------------------------------------- */

type ProfileState = {
  avatarUrl: string
  name: string
  role: string
  bio: string
  email: string
  username: string
  timezone: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    weekly: boolean
    marketing: boolean
    sound: boolean
  }
  appearance: {
    compact: boolean
    animations: boolean
    stickySidebar: boolean
  }
  security: {
    twoFactor: boolean
    loginAlerts: boolean
  }
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type SetProfile = React.Dispatch<React.SetStateAction<ProfileState>>

const INITIAL_STATE: ProfileState = {
  avatarUrl: "https://picsum.photos/seed/settings-avatar/160/160",
  name: "Mariana Costa",
  role: "Product Designer",
  bio: "Designer de produto apaixonada por sistemas de design e acessibilidade.",
  email: "mariana@exemplo.com",
  username: "maricosta",
  timezone: "utc-3",
  language: "pt-br",
  notifications: {
    email: true,
    push: true,
    weekly: false,
    marketing: false,
    sound: true,
  },
  appearance: {
    compact: false,
    animations: true,
    stickySidebar: true,
  },
  security: {
    twoFactor: true,
    loginAlerts: true,
  },
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

const SECTION_TITLES: Record<SectionId, string> = {
  profile: "Perfil",
  account: "Conta",
  notifications: "Notificações",
  appearance: "Aparência",
  security: "Segurança",
}

/* -------------------------------------------------------------------------- */
/*                                 composição                                  */
/* -------------------------------------------------------------------------- */

export function SettingsProfile() {
  const [section, setSection] = React.useState<SectionId>("profile")
  const [state, setState] = React.useState<ProfileState>(INITIAL_STATE)
  const { resolvedTheme } = useTheme()

  async function handleSave() {
    // Simula uma chamada de API enquanto o StatefulButton roda o spinner.
    await new Promise((resolve) => setTimeout(resolve, 1100))
    toast.success("Alterações salvas", {
      description: `Suas configurações de ${SECTION_TITLES[
        section
      ].toLowerCase()} foram atualizadas.`,
    })
  }

  return (
    <div className="flex min-h-[70vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground lg:flex-row">
      {/* Sidebar de seções */}
      <aside className="shrink-0 border-b border-border bg-card/40 p-4 lg:w-64 lg:border-r lg:border-b-0">
        <div className="mb-4 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Configurações</p>
            <p className="truncate text-xs text-muted-foreground">
              {state.name}
            </p>
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
          aria-label="Seções de configurações"
        >
          {NAV.map((item) => {
            const Icon = item.icon
            const active = item.id === section
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex shrink-0 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left shadow-sm transition-colors lg:w-full"
                    : "flex shrink-0 items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-muted/60 lg:w-full"
                }
              >
                <span
                  className={
                    active
                      ? "flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
                      : "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                  }
                >
                  <Icon className="size-4" />
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <span className="text-sm font-medium text-foreground sm:hidden">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight">
              {SECTION_TITLES[section]}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Gerencie suas preferências de {SECTION_TITLES[section].toLowerCase()}.
            </p>
          </div>
          <Badge variant="outline" className="hidden shrink-0 gap-1.5 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Tema {resolvedTheme === "dark" ? "escuro" : "claro"}
          </Badge>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-3xl">
            {section === "profile" ? (
              <ProfileSection state={state} set={setState} />
            ) : null}
            {section === "account" ? (
              <AccountSection state={state} set={setState} />
            ) : null}
            {section === "notifications" ? (
              <NotificationsSection state={state} set={setState} />
            ) : null}
            {section === "appearance" ? (
              <AppearanceSection state={state} set={setState} />
            ) : null}
            {section === "security" ? (
              <SecuritySection state={state} set={setState} />
            ) : null}
          </div>
        </div>

        {/* Barra de ações */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card/40 px-4 py-3.5 sm:px-6">
          <p className="hidden text-xs text-muted-foreground sm:block">
            As alterações são aplicadas apenas nesta demonstração.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setState(INITIAL_STATE)
                toast("Alterações descartadas")
              }}
            >
              Descartar
            </Button>
            <StatefulButton onClick={handleSave}>
              Salvar alterações
            </StatefulButton>
          </div>
        </footer>
      </div>

      {/* Toaster local da composição (Sonner) */}
      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </div>
  )
}
