/**
 * Composição "Pricing" — vitrine focada.
 *
 * Uma página de preços enxuta e elegante, pensada como vitrine: mostra o
 * potencial dos componentes com qualidade e hierarquia clara, sem sobrecarga.
 * Montada só com componentes do registry:
 * - `Badge` (eyebrow do hero + selo "Popular").
 * - `SwitchFluid` (controlado) alternando cobrança mensal/anual; ao alternar,
 *   os preços dos planos mudam (anual = mensal * 10, "2 meses grátis").
 * - `Card` (+ Header/Title/Description/Content/Footer) para os 3 planos.
 * - `Button` como CTA de cada plano e da seção final.
 * - `Table` comparando os recursos de cada plano lado a lado.
 * - `Accordion` com as perguntas frequentes.
 */
import { Fragment, useState } from "react"
import { Check, Minus, Sparkles } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
    ],
  },
  {
    group: "Segurança & suporte",
    rows: [
      { label: "SSO & SAML", starter: false, pro: false, enterprise: true },
      { label: "SLA 99,9%", starter: false, pro: false, enterprise: true },
      { label: "Suporte", starter: "E-mail", pro: "Prioritário", enterprise: "Dedicado 24/7" },
    ],
  },
]

const faqs = [
  {
    q: "Posso trocar de plano a qualquer momento?",
    a: "Sim. Você pode fazer upgrade ou downgrade quando quiser. O valor é ajustado de forma proporcional no próximo ciclo de cobrança, sem multa.",
  },
  {
    q: "Como funciona a cobrança anual?",
    a: "No plano anual você paga por 10 meses e usa 12 — ou seja, 2 meses grátis. O valor é cobrado uma vez por ano e soma os assentos ativos.",
  },
  {
    q: "O plano grátis tem prazo de validade?",
    a: "Não. O Starter é gratuito para sempre, com 1 projeto e até 3 colaboradores. É ideal para validar ideias antes de escalar.",
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "Aceitamos os principais cartões de crédito, Pix e boleto para planos anuais. Contas Enterprise podem ser faturadas via nota fiscal.",
  },
]

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

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      {/* Fundo: gradiente estático e sutil no topo (sem animação) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-muted/40 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        {/* Cabeçalho */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Planos para todo tamanho de time
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Preços simples e transparentes
          </h1>
          <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
            Escolha o plano ideal para o seu time. Mude ou cancele quando quiser,
            sem taxas escondidas.
          </p>
        </div>

        {/* Toggle mensal / anual */}
        <div className="mt-10 flex items-center justify-center gap-3">
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

        {/* Grade de planos */}
        <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.monthly * 10 : plan.monthly
            const isFree = plan.monthly === 0
            const unit = annual ? "/ano" : "/mês"

            return (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col",
                  plan.highlighted &&
                    "border-primary shadow-xl ring-1 ring-primary/30"
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

        {/* Tabela comparativa de recursos */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Compare os planos
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Veja exatamente o que está incluído em cada um.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border">
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

        {/* FAQ */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Perguntas frequentes
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Tudo o que você precisa saber antes de assinar.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
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

        {/* CTA final */}
        <div className="mt-24">
          <div className="overflow-hidden rounded-2xl border bg-muted/30 px-6 py-14 text-center">
            <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
              Pronto para acelerar seu próximo projeto?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Comece grátis hoje. Sem cartão de crédito, sem compromisso.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg">Começar grátis</Button>
              <Button size="lg" variant="outline">
                Falar com vendas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
