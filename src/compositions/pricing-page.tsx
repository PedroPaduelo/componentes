/**
 * Composição "Pricing".
 *
 * Página de preços completa e coesa, montada SÓ com componentes do registry:
 * - `Card` (+ Header/Title/Description/Content/Footer) para os 3 planos.
 * - `Badge` "Popular" destacando o plano do meio.
 * - `SwitchFluid` (controlado) alternando entre cobrança mensal e anual; ao
 *   alternar, os preços de TODOS os planos, a calculadora e a tabela mudam
 *   (anual = mensal * 10, ou seja, "2 meses grátis").
 * - `Slider` numa calculadora de assentos que recalcula o custo do plano Pro.
 * - `Table` comparando os recursos de cada plano lado a lado.
 * - `LogoSlider` com a prova social de marcas que usam o produto.
 * - `InfiniteMovingCards` com depoimentos de clientes.
 * - `Accordion` com as perguntas frequentes.
 * - `Button` como CTA de cada plano e da seção final.
 * - `DottedGlowBackground` / `ScalesContainer` como decoração sutil.
 */
import { Fragment, useMemo, useState } from "react"
import {
  BadgeCheck,
  Check,
  Gauge,
  Globe,
  Headphones,
  Lock,
  Minus,
  Plug,
  Puzzle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedNumber,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DottedGlowBackground,
  InfiniteMovingCards,
  Input,
  LogoSlider,
  ScalesContainer,
  Slider,
  SwitchFluid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { cn } from "@/lib/utils"

type Plan = {
  name: string
  description: string
  /** preço mensal base por assento, em reais. `0` = grátis. */
  monthly: number
  features: string[]
  cta: string
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    name: "Starter",
    description: "Para começar e validar suas ideias.",
    monthly: 0,
    features: [
      "1 projeto",
      "Até 3 colaboradores",
      "Componentes da comunidade",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
  },
  {
    name: "Pro",
    description: "Para times que precisam escalar.",
    monthly: 29,
    features: [
      "Projetos ilimitados",
      "Colaboradores ilimitados",
      "Biblioteca premium completa",
      "Analytics avançado",
      "Suporte prioritário",
    ],
    cta: "Assinar o Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Para organizações com necessidades sob medida.",
    monthly: 99,
    features: [
      "Tudo do Pro",
      "SSO & SAML",
      "SLA dedicado 99,9%",
      "Onboarding personalizado",
      "Gerente de conta",
    ],
    cta: "Falar com vendas",
  },
]

/** Matriz de comparação de recursos por plano. */
type FeatureCell = boolean | string
type FeatureRow = {
  label: string
  starter: FeatureCell
  pro: FeatureCell
  enterprise: FeatureCell
}

const comparison: { group: string; rows: FeatureRow[] }[] = [
  {
    group: "Essencial",
    rows: [
      { label: "Projetos", starter: "1", pro: "Ilimitados", enterprise: "Ilimitados" },
      { label: "Colaboradores", starter: "3", pro: "Ilimitados", enterprise: "Ilimitados" },
      { label: "Componentes da comunidade", starter: true, pro: true, enterprise: true },
      { label: "Biblioteca premium", starter: false, pro: true, enterprise: true },
    ],
  },
  {
    group: "Colaboração & dados",
    rows: [
      { label: "Histórico de versões", starter: "7 dias", pro: "Ilimitado", enterprise: "Ilimitado" },
      { label: "Analytics avançado", starter: false, pro: true, enterprise: true },
      { label: "Exportação de dados", starter: false, pro: true, enterprise: true },
      { label: "Ambientes de teste", starter: "1", pro: "5", enterprise: "Ilimitados" },
    ],
  },
  {
    group: "Segurança & suporte",
    rows: [
      { label: "SSO & SAML", starter: false, pro: false, enterprise: true },
      { label: "SLA 99,9%", starter: false, pro: false, enterprise: true },
      { label: "Suporte", starter: "E-mail", pro: "Prioritário", enterprise: "Dedicado 24/7" },
      { label: "Gerente de conta", starter: false, pro: false, enterprise: true },
    ],
  },
]

const testimonials = [
  {
    quote:
      "Migramos toda a nossa design system em uma semana. O plano Pro pagou por si só no primeiro mês.",
    name: "Marina Alves",
    title: "Head of Design · Nuveo",
  },
  {
    quote:
      "A cobrança por assento é justa e previsível. Escalamos de 5 para 40 pessoas sem surpresa na fatura.",
    name: "Rafael Santos",
    title: "CTO · Cumulus",
  },
  {
    quote:
      "O suporte dedicado do Enterprise resolveu nosso onboarding de SSO em horas, não dias.",
    name: "Júlia Pereira",
    title: "Eng. Manager · Lumini",
  },
  {
    quote:
      "Comecei no plano grátis pra testar e nunca mais saí da plataforma. Vale cada centavo.",
    name: "Diego Martins",
    title: "Founder · Indie Labs",
  },
]

const faqs = [
  {
    q: "Posso trocar de plano a qualquer momento?",
    a: "Sim. Você pode fazer upgrade ou downgrade quando quiser. O valor é ajustado de forma proporcional no próximo ciclo de cobrança, sem multa.",
  },
  {
    q: "Como funciona a cobrança anual?",
    a: "No plano anual você paga por 10 meses e usa 12 — ou seja, 2 meses grátis. O valor é cobrado uma vez por ano e some os assentos ativos.",
  },
  {
    q: "O plano grátis tem prazo de validade?",
    a: "Não. O Starter é gratuito para sempre, com 1 projeto e até 3 colaboradores. É ideal para validar ideias antes de escalar.",
  },
  {
    q: "Vocês oferecem desconto para ONGs e educação?",
    a: "Sim. Instituições de ensino e organizações sem fins lucrativos têm condições especiais. Fale com nosso time de vendas para saber mais.",
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "Aceitamos os principais cartões de crédito, Pix e boleto para planos anuais. Contas Enterprise podem ser faturadas via nota fiscal.",
  },
]

/** Logos fictícios (texto estilizado) usados na faixa de prova social. */
const brandLogos = [
  "Nuveo",
  "Cumulus",
  "Lumini",
  "Vértice",
  "Orbital",
  "Praxis",
  "Helio",
  "Quanta",
].map((name) => (
  <span
    key={name}
    className="text-lg font-semibold tracking-tight text-muted-foreground"
  >
    {name}
  </span>
))

/** Indicadores de confiança exibidos na barra de stats. */
const stats: { icon: typeof Zap; value: string; label: string }[] = [
  { icon: Users, value: "12k+", label: "times ativos" },
  { icon: Zap, value: "99,9%", label: "uptime garantido" },
  { icon: BadgeCheck, value: "4,9/5", label: "avaliação média" },
  { icon: Headphones, value: "< 2h", label: "tempo de resposta" },
]

/** Add-ons opcionais que podem ser somados a qualquer plano pago. */
const addons: {
  icon: typeof Plug
  name: string
  description: string
  /** preço mensal do add-on, em reais. */
  monthly: number
}[] = [
  {
    icon: Plug,
    name: "Integrações premium",
    description: "Conecte a 50+ ferramentas com sincronização em tempo real.",
    monthly: 9,
  },
  {
    icon: ShieldCheck,
    name: "Auditoria avançada",
    description: "Logs de auditoria detalhados e retenção estendida de 1 ano.",
    monthly: 15,
  },
  {
    icon: Headphones,
    name: "Suporte premium 24/7",
    description: "Canal dedicado com SLA de resposta em até 1 hora.",
    monthly: 19,
  },
]

/** Diferenciais incluídos em todos os planos. */
const benefits: { icon: typeof Gauge; title: string; description: string }[] = [
  {
    icon: Gauge,
    title: "Performance de ponta",
    description:
      "Infraestrutura distribuída globalmente para carregar tudo em milissegundos.",
  },
  {
    icon: Puzzle,
    title: "Encaixa no seu fluxo",
    description:
      "Integra com as ferramentas que você já usa, sem reinventar o processo.",
  },
  {
    icon: Lock,
    title: "Seguro por padrão",
    description:
      "Criptografia de ponta a ponta e controle granular de permissões.",
  },
  {
    icon: Globe,
    title: "Pronto para escala",
    description:
      "De projetos solo a organizações com milhares de assentos ativos.",
  },
]

/** Selos de conformidade exibidos na faixa de segurança. */
const compliance = ["SOC 2 Type II", "GDPR", "ISO 27001", "LGPD", "99,9% SLA"]

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR")
}

/** Renderiza uma célula da tabela de comparação. */
function FeatureValue({ value }: { value: FeatureCell }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-4 text-primary" aria-hidden="true" />
        <span className="sr-only">Incluído</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <Minus
          className="mx-auto size-4 text-muted-foreground/40"
          aria-hidden="true"
        />
        <span className="sr-only">Não incluído</span>
      </>
    )
  }
  return <span className="text-sm text-foreground">{value}</span>
}

export function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [seats, setSeats] = useState(5)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const proMonthly = plans.find((p) => p.highlighted)?.monthly ?? 29

  /** Custo da calculadora de assentos para o plano Pro. */
  const estimate = useMemo(() => {
    const perSeat = annual ? proMonthly * 10 : proMonthly
    const total = perSeat * seats
    // economia anual vs. pagar 12 meses no mensal (2 meses grátis).
    const fullYear = proMonthly * 12 * seats
    const savings = annual ? fullYear - total : 0
    return { perSeat, total, savings }
  }, [annual, seats, proMonthly])

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      {/* Fundo decorativo sutil */}
      <DottedGlowBackground
        gap={16}
        radius={2}
        opacity={0.5}
        backgroundOpacity={0.2}
        colorLightVar="--color-neutral-500"
        colorDarkVar="--color-neutral-400"
        glowColorLightVar="--color-violet-500"
        glowColorDarkVar="--color-violet-400"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Cabeçalho */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Planos para todo tamanho de time
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Preços simples e transparentes
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Escolha o plano ideal para o seu time. Mude ou cancele quando quiser.
          </p>
        </div>

        {/* Toggle mensal / anual */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              annual ? "text-muted-foreground" : "text-foreground"
            )}
          >
            Mensal
          </span>
          <SwitchFluid
            label="Alternar cobrança anual"
            checked={annual}
            onToggle={() => setAnnual((v) => !v)}
          />
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              annual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Anual
          </span>
          <Badge variant="secondary" className="ml-1">
            2 meses grátis
          </Badge>
        </div>

        {/* Faixa decorativa (Scales) separando o toggle da grade */}
        <ScalesContainer
          orientation="diagonal"
          size={12}
          containerClassName="mt-10 overflow-hidden rounded-lg border border-border/60 bg-card/40"
        >
          <div className="flex items-center justify-center px-6 py-4">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sem taxas escondidas · Cancele quando quiser
            </p>
          </div>
        </ScalesContainer>

        {/* Barra de estatísticas / confiança */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-card/40 px-4 py-5 text-center"
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Grade de planos */}
        <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.monthly * 10 : plan.monthly
            const isFree = plan.monthly === 0
            const unit = annual ? "/ano" : "/mês"

            return (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col bg-card/80 backdrop-blur-sm",
                  plan.highlighted &&
                    "border-primary shadow-lg ring-1 ring-primary/40 md:scale-[1.03]"
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Popular
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6">
                  <div className="flex items-baseline gap-1">
                    {isFree ? (
                      <span className="text-4xl font-bold text-foreground">
                        Grátis
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          R$ {formatPrice(price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {unit} · por assento
                        </span>
                      </>
                    )}
                  </div>

                  <ul className="flex flex-col gap-3 text-sm">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-foreground"
                      >
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Diferenciais incluídos em todos os planos */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Tudo que você precisa, em qualquer plano
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Recursos essenciais que acompanham você desde o primeiro dia.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calculadora de assentos */}
        <Card className="mt-12 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-primary" aria-hidden="true" />
              Calcule o custo do seu time
            </CardTitle>
            <CardDescription>
              Estime o investimento no plano Pro de acordo com o número de
              assentos ativos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {seats} {seats === 1 ? "assento" : "assentos"}
                </span>
                <span className="text-muted-foreground">
                  R$ {formatPrice(estimate.perSeat)} {annual ? "/ano" : "/mês"} por assento
                </span>
              </div>
              <Slider
                value={[seats]}
                min={1}
                max={50}
                step={1}
                onValueChange={(v) => setSeats(v[0] ?? 1)}
                aria-label="Número de assentos"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 px-6 py-5 text-center md:min-w-[200px]">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Total estimado
              </p>
              <p className="mt-1 inline-flex items-baseline gap-1 text-3xl font-bold text-foreground">
                <span className="text-xl">R$</span>
                <AnimatedNumber value={estimate.total} />
              </p>
              <p className="text-xs text-muted-foreground">
                {annual ? "cobrança anual" : "cobrança mensal"}
              </p>
              {estimate.savings > 0 && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <TrendingDown className="size-3.5" aria-hidden="true" />
                  Economize R$ {formatPrice(estimate.savings)}/ano
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabela comparativa de recursos */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Compare todos os recursos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Veja exatamente o que está incluído em cada plano.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%]">Recurso</TableHead>
                  <TableHead className="text-center">Starter</TableHead>
                  <TableHead className="text-center">
                    <span className="inline-flex items-center gap-1.5">
                      Pro
                      <Badge className="px-1.5 py-0 text-[10px]">Popular</Badge>
                    </span>
                  </TableHead>
                  <TableHead className="text-center">Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.map((section) => (
                  <Fragment key={section.group}>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell
                        colSpan={4}
                        className="py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        {section.group}
                      </TableCell>
                    </TableRow>
                    {section.rows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-medium text-foreground">
                          {row.label}
                        </TableCell>
                        <TableCell className="text-center">
                          <FeatureValue value={row.starter} />
                        </TableCell>
                        <TableCell className="bg-primary/5 text-center">
                          <FeatureValue value={row.pro} />
                        </TableCell>
                        <TableCell className="text-center">
                          <FeatureValue value={row.enterprise} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add-ons opcionais */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Potencialize com add-ons
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Recursos opcionais que você adiciona a qualquer plano pago quando
              precisar.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {addons.map((addon) => {
              const Icon = addon.icon
              const price = annual ? addon.monthly * 10 : addon.monthly
              return (
                <Card
                  key={addon.name}
                  className="flex flex-col bg-card/80 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-3 text-base">
                      {addon.name}
                    </CardTitle>
                    <CardDescription>{addon.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto flex items-center justify-between">
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">
                        + R$ {formatPrice(price)}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {annual ? "/ano" : "/mês"}
                      </span>
                    </span>
                    <Button variant="outline" size="sm">
                      Adicionar
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Prova social — logos */}
        <div className="mt-16">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Times de todos os tamanhos confiam na plataforma
          </p>
          <div className="mt-6">
            <LogoSlider logos={brandLogos} speed={28} />
          </div>
        </div>

        {/* Depoimentos */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Quem usa, recomenda
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Histórias reais de times que escalaram com a gente.
            </p>
          </div>
          <div className="mt-8 overflow-hidden">
            <InfiniteMovingCards
              items={testimonials}
              direction="left"
              speed="slow"
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Perguntas frequentes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tudo o que você precisa saber antes de assinar.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={faq.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Segurança & compliance */}
        <div className="mt-16">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Segurança de nível empresarial
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {compliance.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                <ShieldCheck
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Garantia */}
        <div className="mt-16">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-8 text-center sm:flex-row sm:gap-5 sm:text-left">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground">
                Garantia de 30 dias ou seu dinheiro de volta
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Experimente qualquer plano pago sem risco. Se não for pra você,
                devolvemos 100% do valor — sem perguntas.
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 gap-1">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Sem risco
            </Badge>
          </div>
        </div>

        {/* Contato Enterprise */}
        <div className="mt-16">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="grid gap-8 py-8 md:grid-cols-2 md:items-center">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Enterprise
                </Badge>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Precisa de algo sob medida?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Volumes maiores, contratos personalizados e onboarding
                  dedicado. Deixe seu e-mail que nosso time entra em contato.
                </p>
              </div>

              {submitted ? (
                <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-4 text-sm text-foreground">
                  <BadgeCheck
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>
                    Obrigado! Recebemos seu contato e retornaremos em breve.
                  </span>
                </div>
              ) : (
                <form
                  className="flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (email.trim()) setSubmitted(true)
                  }}
                >
                  <Input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="E-mail corporativo"
                    className="bg-background"
                  />
                  <Button type="submit" className="shrink-0">
                    Falar com vendas
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CTA final */}
        <div className="mt-16">
          <ScalesContainer
            orientation="diagonal"
            size={14}
            containerClassName="overflow-hidden rounded-2xl border border-border/60 bg-card/60"
          >
            <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
              <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Pronto para acelerar seu próximo projeto?
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Comece grátis hoje. Sem cartão de crédito, sem compromisso.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg">Começar grátis</Button>
                <Button size="lg" variant="outline">
                  Falar com vendas
                </Button>
              </div>
            </div>
          </ScalesContainer>
        </div>
      </div>
    </div>
  )
}
