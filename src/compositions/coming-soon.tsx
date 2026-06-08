/**
 * Coming Soon / Waitlist — tela de lançamento "em breve", full-bleed e centrada,
 * montada a partir de componentes ricos da vitrine:
 *
 * - Fundo animado de espaço profundo: `StarsBackground` (canvas com estrelas
 *   piscando) + `ShootingStars` (estrelas cadentes em SVG), sobre um preto fixo
 *   com glows radiais. O fundo é dark por natureza; o texto é branco para
 *   garantir legibilidade tanto no tema light quanto no dark.
 * - Título com `ColourfulText` (efeito de cor animada caractere a caractere) e
 *   subtítulo com `TextGenerateEffect`.
 * - Countdown dd:hh:mm:ss até a data de lançamento, com cada dígito animado via
 *   `AnimatedNumber` (slot machine).
 * - Captura de e-mail para waitlist com `PlaceholdersAndVanishInput`; ao enviar
 *   dispara um toast (Sonner) de confirmação e incrementa o contador de prova
 *   social "X pessoas já na lista".
 * - Ícones sociais (lucide) e linha de prova social com avatares (picsum).
 */

import * as React from "react"
import { Github, Instagram, Linkedin, Twitter, Sparkles } from "lucide-react"
import { toast } from "sonner"

import {
  AnimatedNumber,
  ColourfulText,
  PlaceholdersAndVanishInput,
  ShootingStars,
  StarsBackground,
  TextGenerateEffect,
  Toaster,
} from "@/components/ui"
import { cn } from "@/lib/utils"

/** Data-alvo do lançamento. Fixa e no futuro para o countdown ser sempre positivo. */
const LAUNCH_DATE = new Date("2027-01-01T00:00:00")

/** Quantidade inicial de pessoas na waitlist (prova social). */
const INITIAL_WAITLIST_COUNT = 2847

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Calcula o tempo restante até `target`, com piso em zero. */
function getCountdown(target: Date): Countdown {
  const totalMs = Math.max(0, target.getTime() - Date.now())
  const totalSeconds = Math.floor(totalMs / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

const SOCIAL_LINKS = [
  { label: "GitHub", icon: Github },
  { label: "X / Twitter", icon: Twitter },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
] as const

const PROOF_AVATARS = [
  "https://picsum.photos/seed/waitlist-a/80/80",
  "https://picsum.photos/seed/waitlist-b/80/80",
  "https://picsum.photos/seed/waitlist-c/80/80",
  "https://picsum.photos/seed/waitlist-d/80/80",
]

/**
 * Um único dígito 0..9 animado. Quebra o valor de 2 casas em dezena/unidade,
 * cada qual com seu próprio `AnimatedNumber` (slot machine) para a animação de
 * rolagem funcionar dígito a dígito.
 */
function TimeUnit({ value, label }: { value: number; label: string }) {
  const padded = Math.min(99, Math.max(0, value))
  const tens = Math.floor(padded / 10)
  const ones = padded % 10

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
        <AnimatedNumber
          value={tens}
          className="text-3xl font-bold leading-none text-white sm:text-5xl"
        />
        <AnimatedNumber
          value={ones}
          className="text-3xl font-bold leading-none text-white sm:text-5xl"
        />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export function ComingSoon() {
  const [countdown, setCountdown] = React.useState<Countdown>(() =>
    getCountdown(LAUNCH_DATE)
  )
  const [waitlistCount, setWaitlistCount] = React.useState(INITIAL_WAITLIST_COUNT)
  const emailRef = React.useRef("")

  React.useEffect(() => {
    const id = setInterval(() => {
      setCountdown(getCountdown(LAUNCH_DATE))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    emailRef.current = e.target.value
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = emailRef.current.trim()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!isValid) {
      toast.error("E-mail inválido", {
        description: "Informe um e-mail válido para entrar na lista.",
      })
      return
    }

    setWaitlistCount((prev) => prev + 1)
    emailRef.current = ""
    toast.success("Você está na lista! 🎉", {
      description: `Avisaremos ${email} assim que o lançamento acontecer.`,
    })
  }

  return (
    <div className="relative isolate flex min-h-[780px] w-full flex-col items-center justify-center overflow-hidden bg-[#050507] px-4 py-16 text-white sm:px-6">
      {/* Fundo animado de espaço profundo */}
      <StarsBackground starDensity={0.0002} className="z-0" />
      <ShootingStars
        starColor="#9E00FF"
        trailColor="#2EB9DF"
        minDelay={800}
        maxDelay={2600}
        className="z-0"
      />

      {/* Glows radiais para profundidade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.25), transparent 70%), radial-gradient(40% 40% at 80% 100%, rgba(46,185,223,0.18), transparent 70%)",
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
          <Sparkles className="size-3.5 text-violet-300" />
          Lançamento 2027
        </span>

        <h1 className="mt-7 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          O futuro está{" "}
          <ColourfulText text="chegando" />
        </h1>

        <TextGenerateEffect
          words="Estamos construindo algo extraordinário. Entre na lista e seja o primeiro a saber quando abrirmos as portas."
          className="mt-2 max-w-xl [&_div]:text-lg [&_span]:text-white/75 sm:[&_div]:text-xl"
        />

        {/* Countdown */}
        <div className="mt-10 flex items-end justify-center gap-2 sm:gap-4">
          <TimeUnit value={countdown.days} label="Dias" />
          <span className="pb-7 text-2xl font-bold text-white/30 sm:text-4xl">
            :
          </span>
          <TimeUnit value={countdown.hours} label="Horas" />
          <span className="pb-7 text-2xl font-bold text-white/30 sm:text-4xl">
            :
          </span>
          <TimeUnit value={countdown.minutes} label="Min" />
          <span className="pb-7 text-2xl font-bold text-white/30 sm:text-4xl">
            :
          </span>
          <TimeUnit value={countdown.seconds} label="Seg" />
        </div>

        {/* Waitlist */}
        <div className="mt-10 w-full max-w-md">
          <PlaceholdersAndVanishInput
            placeholders={[
              "seu@email.com",
              "Entre para a lista de espera...",
              "Garanta seu acesso antecipado",
              "Avisaremos você primeiro",
            ]}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Prova social */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {PROOF_AVATARS.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className={cn(
                    "size-9 rounded-full border-2 border-[#050507] object-cover",
                  )}
                  style={{ zIndex: PROOF_AVATARS.length - i }}
                />
              ))}
            </div>
            <p className="text-sm text-white/70">
              <AnimatedNumber
                value={waitlistCount}
                className="font-semibold text-white"
              />{" "}
              pessoas já na lista
            </p>
          </div>
          <p className="text-xs text-white/40">
            Junte-se a fundadores, criadores e curiosos esperando o grande dia.
          </p>
        </div>

        {/* Ícones sociais */}
        <div className="mt-8 flex items-center gap-3">
          {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-4.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Toaster local (não há Toaster montado globalmente no shell). */}
      <Toaster position="bottom-center" />
    </div>
  )
}
