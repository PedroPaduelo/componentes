/**
 * Composição "Pricing".
 *
 * Página de preços coesa, montada SÓ com componentes do registry:
 * - `Card` (+ Header/Title/Description/Content/Footer) para os 3 planos.
 * - `Badge` "Popular" destacando o plano do meio.
 * - `SwitchFluid` (controlado) alternando entre cobrança mensal e anual; ao
 *   alternar, os preços de TODOS os planos mudam (anual = mensal * 10, ou seja,
 *   "2 meses grátis").
 * - `Button` como CTA de cada plano.
 * - `DottedGlowBackground` como fundo decorativo sutil atrás da seção.
 */
import { useState } from "react"
import { Check } from "lucide-react"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DottedGlowBackground,
  SwitchFluid,
} from "@/components/ui"
import { cn } from "@/lib/utils"

type Plan = {
  name: string
  description: string
  /** preço mensal base, em reais. `0` = grátis. */
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

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR")
}

export function PricingPage() {
  const [annual, setAnnual] = useState(false)

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
                          {unit}
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
      </div>
    </div>
  )
}
