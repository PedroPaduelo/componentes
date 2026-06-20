/**
 * Página de TESTE — agregada com os 9 componentes "misc" Tremor:
 * - divider-tremor
 * - tab-navigation-tremor
 * - date-range-picker-tremor
 * - radio-card-group-tremor
 * - card-tremor
 * - calendar-tremor
 * - select-native-tremor
 * - label-tremor
 * - toggle-tremor
 *
 * Criada exclusivamente para o validador Playwright `val-tremor-misc.mjs`
 * (Onda 6 da iniciativa Tremor, task O6.3/32). Renderiza uma única página
 * com todos os componentes juntos num grid — sem Header/Footer/sidebar —
 * para que o validador inspecione o DOM em uma única navegação.
 *
 * NÃO é uma página de produção. Acessível apenas em dev/build para os
 * agentes de validação. Mantida no src/pages para reuso do lazy-router
 * do App.tsx (mesma convenção de CompositionLive).
 *
 * Não possui "use client" — não usamos Next.js.
 *
 * Rota: `/tremor-test-misc` (fullscreen, sem Layout).
 */

import { CreditCard, Home, Mail, Settings, Users, Wallet, Zap } from "lucide-react"

import { CardTremor } from "@/components/ui/card-tremor"
import { CalendarTremor } from "@/components/ui/calendar-tremor"
import { DividerTremor } from "@/components/ui/divider-tremor"
import { LabelTremor } from "@/components/ui/label-tremor"
import { RadioCardGroupTremor } from "@/components/ui/radio-card-group-tremor"
import {
  SelectNativeTremor,
  type SelectNativeTremorOption,
} from "@/components/ui/select-native-tremor"
import { TabNavigationTremor } from "@/components/ui/tab-navigation-tremor"
import { ToggleTremor } from "@/components/ui/toggle-tremor"
import { DateRangePickerTremor } from "@/components/ui/date-range-picker-tremor"

const TAB_ITEMS = [
  { value: "overview", label: "Visão geral" },
  { value: "reports", label: "Relatórios" },
  { value: "alerts", label: "Alertas" },
  { value: "settings", label: "Ajustes", disabled: true },
]

const TAB_ITEMS_WITH_ICONS = [
  { value: "home", label: "Início", icon: Home },
  { value: "team", label: "Equipe", icon: Users },
  { value: "settings", label: "Ajustes", icon: Settings },
]

const RADIO_CARD_ITEMS = [
  {
    value: "free",
    label: "Free",
    description: "1 usuário, 100 req/mês",
    icon: Wallet,
  },
  {
    value: "pro",
    label: "Pro",
    description: "10 usuários, 10k req/mês",
    icon: Zap,
  },
  {
    value: "biz",
    label: "Business",
    description: "Ilimitado, SLA 99.9%",
    icon: CreditCard,
  },
]

const SELECT_OPTIONS: SelectNativeTremorOption[] = [
  { value: "free", label: "Free — 1 usuário, 100 req/mês" },
  { value: "pro", label: "Pro — 10 usuários, 10k req/mês" },
  { value: "enterprise", label: "Enterprise — SLA 99.9%, dedicado" },
]

export function TremorTestMisc() {
  const today = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  const initialCalendarDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    15,
  )

  return (
    <div className="min-h-screen w-full bg-background p-8 text-foreground">
      <header className="mx-auto mb-8 max-w-6xl">
        <h1 className="text-2xl font-bold tracking-tight">
          Tremor Misc — Test Harness
        </h1>
        <p className="text-sm text-muted-foreground">
          Render agregado dos 9 componentes Tremor misc (UI + inputs) para
          validação headless via Playwright (val-tremor-misc.mjs).
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* 1. divider-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            divider-tremor
          </h2>
          <DividerTremor />
          <DividerTremor>OU</DividerTremor>
          <div className="flex h-12 items-center gap-3">
            <span className="text-sm">A</span>
            <DividerTremor orientation="vertical" />
            <span className="text-sm">B</span>
            <DividerTremor orientation="vertical" />
            <span className="text-sm">C</span>
          </div>
        </section>

        {/* 2. tab-navigation-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            tab-navigation-tremor
          </h2>
          <TabNavigationTremor defaultValue="overview" items={TAB_ITEMS} />
          <TabNavigationTremor
            defaultValue="home"
            items={TAB_ITEMS_WITH_ICONS}
          />
        </section>

        {/* 3. date-range-picker-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            date-range-picker-tremor
          </h2>
          <DateRangePickerTremor
            value={{ from: weekAgo, to: today }}
            onValueChange={() => {
              /* noop — harness estático */
            }}
            placeholder="Selecione um período"
          />
        </section>

        {/* 4. radio-card-group-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            radio-card-group-tremor
          </h2>
          <RadioCardGroupTremor
            defaultValue="pro"
            items={RADIO_CARD_ITEMS}
          />
        </section>

        {/* 5. card-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            card-tremor
          </h2>
          <CardTremor>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Card simples
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Container base Tremor — borda gray-200, fundo branco, padding
              generoso.
            </p>
          </CardTremor>
        </section>

        {/* 6. calendar-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            calendar-tremor
          </h2>
          <CalendarTremor
            mode="single"
            selected={initialCalendarDate}
            onSelect={() => {
              /* noop */
            }}
          />
        </section>

        {/* 7. select-native-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            select-native-tremor
          </h2>
          <SelectNativeTremor
            options={SELECT_OPTIONS}
            placeholder="Escolha um plano"
            name="plan"
          />
        </section>

        {/* 8. label-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            label-tremor
          </h2>
          <div className="flex flex-col gap-2">
            <LabelTremor htmlFor="harness-email">E-mail</LabelTremor>
            <input
              id="harness-email"
              type="email"
              placeholder="voce@empresa.com"
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-[#090E1A] dark:text-gray-50"
            />
          </div>
          <LabelTremor className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="size-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-700"
            />
            <Mail className="size-4 text-gray-500" />
            Receber alertas por e-mail
          </LabelTremor>
        </section>

        {/* 9. toggle-tremor */}
        <section className="space-y-4 rounded-lg border border-border p-6 md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            toggle-tremor
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleTremor defaultPressed={false}>Notificações</ToggleTremor>
            <ToggleTremor defaultPressed variant="default">
              Default
            </ToggleTremor>
            <ToggleTremor defaultPressed variant="success">
              Success
            </ToggleTremor>
            <ToggleTremor defaultPressed variant="warning">
              Warning
            </ToggleTremor>
            <ToggleTremor defaultPressed variant="error">
              Error
            </ToggleTremor>
          </div>
        </section>
      </main>
    </div>
  )
}