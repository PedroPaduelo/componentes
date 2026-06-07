/**
 * Composição "Interactive Dashboard".
 *
 * Dashboard interativo com sticky scroll, loading states animados e teclado visual.
 * Usa componentes do registry: StickyScrollReveal, MultiStepLoader, Keyboard,
 * GlowCardGrid + GlowCard, Button, Badge, Card.
 */

import * as React from "react"
import { Activity, BarChart3, LayoutDashboard, Settings, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GlowCard, GlowCardGrid } from "@/components/ui/glow-card-grid"
import { Keyboard } from "@/components/ui/keyboard"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal"

/* ------------------------------------------------------------------ */
/*  Loading demo data                                                  */
/* ------------------------------------------------------------------ */

const LOADING_STEPS = [
  { text: "Conectando ao servidor…" },
  { text: "Autenticando credenciais…" },
  { text: "Carregando métricas…" },
  { text: "Renderizando dashboard…" },
  { text: "Pronto!" },
]

/* ------------------------------------------------------------------ */
/*  Sticky scroll sections                                             */
/* ------------------------------------------------------------------ */

const STICKY_SECTIONS = [
  {
    title: "Overview",
    description:
      "Visão geral do sistema com métricas em tempo real, cards de destaque e indicadores de performance.",
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <LayoutDashboard className="h-12 w-12 text-cyan-400" />
        <span className="text-sm font-medium text-white">Overview ativo</span>
      </div>
    ),
  },
  {
    title: "Analytics",
    description:
      "Gráficos interativos, tendências de uso e análise de conversão com dados atualizados a cada 5 minutos.",
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <BarChart3 className="h-12 w-12 text-pink-400" />
        <span className="text-sm font-medium text-white">Analytics ativo</span>
      </div>
    ),
  },
  {
    title: "Users",
    description:
      "Gestão de usuários com tabela filtrável, paginação e ações em lote para administradores.",
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <Users className="h-12 w-12 text-orange-400" />
        <span className="text-sm font-medium text-white">Users ativo</span>
      </div>
    ),
  },
  {
    title: "Settings",
    description:
      "Preferências do sistema, configurações de tema, notificações e integrações com serviços externos.",
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <Settings className="h-12 w-12 text-yellow-400" />
        <span className="text-sm font-medium text-white">Settings ativo</span>
      </div>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Metric cards data                                                  */
/* ------------------------------------------------------------------ */

const METRICS = [
  {
    title: "Receita Mensal",
    value: "R$ 124.500",
    change: "+12.5%",
    positive: true,
    icon: "https://picsum.photos/seed/metric-revenue/160/160",
  },
  {
    title: "Usuários Ativos",
    value: "8.420",
    change: "+8.1%",
    positive: true,
    icon: "https://picsum.photos/seed/metric-users/160/160",
  },
  {
    title: "Taxa de Conversão",
    value: "3.24%",
    change: "-0.4%",
    positive: false,
    icon: "https://picsum.photos/seed/metric-conversion/160/160",
  },
  {
    title: "Tempo Médio",
    value: "4m 32s",
    change: "+15s",
    positive: false,
    icon: "https://picsum.photos/seed/metric-time/160/160",
  },
]

/* ------------------------------------------------------------------ */
/*  InteractiveDashboard                                               */
/* ------------------------------------------------------------------ */

export function InteractiveDashboard() {
  const [loading, setLoading] = React.useState(false)

  const handleTriggerLoading = React.useCallback(() => {
    setLoading(true)
    setTimeout(() => setLoading(false), 12000)
  }, [])

  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/* Header / Navbar                                              */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">Dashboard</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Overview
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Analytics
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Users
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Settings
            </Button>
          </nav>
        </div>
      </header>

      {/* ============================================================ */}
      {/* Hero                                                         */}
      {/* ============================================================ */}
      <section className="border-b bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">
              <Activity className="mr-1.5 h-3.5 w-3.5" />
              Tempo real
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Dashboard
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Monitore métricas, gerencie usuários e configure seu sistema — tudo em um só lugar.
            </p>
          </div>

          {/* Keyboard component showing shortcuts */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <p className="text-sm font-medium text-muted-foreground">
              Atalhos de teclado
            </p>
            <Keyboard />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Loading Demo                                                 */}
      {/* ============================================================ */}
      <section className="border-b bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Loading States
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Animação de carregamento com etapas sequenciais. Clique para demonstrar.
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={handleTriggerLoading} disabled={loading}>
                {loading ? "Carregando…" : "Iniciar loading"}
              </Button>
            </div>
          </div>
        </div>

        <MultiStepLoader loadingStates={LOADING_STEPS} loading={loading} />
      </section>

      {/* ============================================================ */}
      {/* Sticky Scroll Sections                                       */}
      {/* ============================================================ */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Seções Interativas
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Role para explorar as seções. O painel à direita acompanha o scroll.
            </p>
          </div>
          <div className="mt-10">
            <StickyScroll content={STICKY_SECTIONS} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Metrics Overview (GlowCardGrid)                               */}
      {/* ============================================================ */}
      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Métricas em Destaque
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Passe o mouse sobre os cards para ver o efeito de brilho.
            </p>
          </div>
          <div className="mt-10">
            <GlowCardGrid columns={4}>
              {METRICS.map((metric) => (
                <GlowCard key={metric.title} icon={metric.icon} iconAlt={metric.title}>
                  <div className="px-4 text-center">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {metric.value}
                    </p>
                    <span
                      className={`mt-1 inline-block text-xs font-medium ${
                        metric.positive ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </GlowCard>
              ))}
            </GlowCardGrid>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Analytics placeholder (chart)                                 */}
      {/* ============================================================ */}
      <section className="border-t bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Analytics
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Visualização de dados com gráficos interativos.
            </p>
          </div>
          <div className="mt-10">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Tráfego Mensal
                </CardTitle>
                <CardDescription>
                  Visitantes únicos nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-end justify-between gap-2 rounded-lg bg-muted/30 p-4">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-primary/70 transition-all hover:bg-primary"
                        style={{ height: `${h}%` }}
                      />
                    ),
                  )}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>Jan</span>
                  <span>Fev</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>Mai</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Ago</span>
                  <span>Set</span>
                  <span>Out</span>
                  <span>Nov</span>
                  <span>Dez</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Users placeholder (table)                                     */}
      {/* ============================================================ */}
      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Usuários
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Lista de usuários com status e ações.
            </p>
          </div>
          <div className="mt-10">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Usuários Recentes
                </CardTitle>
                <CardDescription>
                  Últimos 5 usuários registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Ana Silva", email: "ana@example.com", status: "Ativo" },
                    { name: "Carlos Souza", email: "carlos@example.com", status: "Ativo" },
                    { name: "Maria Santos", email: "maria@example.com", status: "Pendente" },
                    { name: "João Oliveira", email: "joao@example.com", status: "Ativo" },
                    { name: "Fernanda Lima", email: "fernanda@example.com", status: "Inativo" },
                  ].map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center justify-between rounded-lg border bg-background/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://picsum.photos/seed/${user.name.replace(/\s/g, "-")}/40/40`}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          user.status === "Ativo"
                            ? "default"
                            : user.status === "Pendente"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Settings placeholder (form)                                   */}
      {/* ============================================================ */}
      <section className="border-t bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Configurações
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Preferências do sistema e notificações.
            </p>
          </div>
          <div className="mt-10">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Preferências
                </CardTitle>
                <CardDescription>
                  Gerencie suas configurações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Notificações por email", description: "Receba atualizações por email" },
                    { label: "Modo escuro automático", description: "Alterna conforme o sistema" },
                    { label: "Relatórios semanais", description: "Resumo toda segunda-feira" },
                  ].map((setting) => (
                    <div
                      key={setting.label}
                      className="flex items-center justify-between rounded-lg border bg-background/50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {setting.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      <Badge variant="secondary">Ativo</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Footer                                                        */}
      {/* ============================================================ */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-foreground">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-lg font-semibold">Dashboard</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Dashboard interativo com componentes da vitrine.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <span className="text-muted-foreground">Overview</span>
            <span className="text-muted-foreground">Analytics</span>
            <span className="text-muted-foreground">Users</span>
          </nav>
        </div>
        <div className="border-t">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Interactive Dashboard. Construído com React, Vite e
              Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
