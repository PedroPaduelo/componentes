/**
 * Composição "Blog / Artigo Editorial".
 *
 * Página de leitura de artigo longo montada apenas com componentes do registry
 * da vitrine:
 * - Hero: imagem de capa (picsum) + kicker animado (TextGenerateEffect) + título
 *   grande + meta (autor com Avatar/HoverCard, data, tempo de leitura, Badges).
 * - Corpo: TracingBeam na lateral acompanha o scroll de uma área própria
 *   (`overflow-y-auto` + `scrollRef`, mesmo padrão do tracing-beam-demo) com
 *   headings, parágrafos, blockquote, CodeBlock, imagem e lista.
 * - Final: bio do autor (Card), tags e 3 cards "Leia também" com hover.
 *
 * Tema 100% via tokens shadcn (correto em light e dark).
 */

import * as React from "react"
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { TracingBeam } from "@/components/ui/tracing-beam"

const TAGS = ["Engenharia", "Frontend", "Design System", "React"]

const RELATED = [
  {
    title: "Tokens semânticos: por que parar de hardcodar cores",
    excerpt:
      "Um guia prático para migrar de valores fixos para tokens que respondem a tema e contexto.",
    category: "Design System",
    readTime: "6 min",
    image: "https://picsum.photos/seed/related-tokens/640/420",
  },
  {
    title: "Animações dirigidas por scroll sem travar a thread",
    excerpt:
      "Como usar motion com useScroll e springs para narrativas fluidas e performáticas.",
    category: "Motion",
    readTime: "8 min",
    image: "https://picsum.photos/seed/related-scroll/640/420",
  },
  {
    title: "Acessibilidade não é opcional: o checklist mínimo",
    excerpt:
      "Foco visível, contraste, navegação por teclado e leitura por screen readers — o básico que não pode faltar.",
    category: "A11y",
    readTime: "5 min",
    image: "https://picsum.photos/seed/related-a11y/640/420",
  },
]

const SAMPLE_CODE = `import { useScroll, useSpring, useTransform } from "motion/react"

// Transforma o progresso de scroll em uma coordenada do gradiente.
export function useBeamProgress(ref: React.RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Spring suaviza o movimento, dando inércia à leitura.
  return useSpring(useTransform(scrollYProgress, [0, 0.8], [50, 1200]), {
    stiffness: 500,
    damping: 90,
  })
}`

function AuthorBadge() {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-full text-left outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar className="size-10 border border-border">
            <AvatarImage
              src="https://picsum.photos/seed/author-mariana/120/120"
              alt="Mariana Reis"
            />
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Mariana Reis
            </span>
            <span className="text-xs text-muted-foreground">
              Staff Frontend Engineer
            </span>
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex gap-3">
          <Avatar className="size-12 border border-border">
            <AvatarImage
              src="https://picsum.photos/seed/author-mariana/120/120"
              alt="Mariana Reis"
            />
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">Mariana Reis</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Escreve sobre interfaces, design systems e a arte de fazer
              animações que não atrapalham a leitura.
            </p>
            <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              São Paulo, Brasil
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function BlogArticle() {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      className="h-[88vh] w-full overflow-y-auto bg-background"
    >
      {/* --------------------------------------------------------------- */}
      {/* Hero                                                            */}
      {/* --------------------------------------------------------------- */}
      <header className="relative w-full">
        <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden">
          <img
            src="https://picsum.photos/seed/blog-hero-cover/1600/900"
            alt="Capa do artigo"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        </div>

        <div className="mx-auto -mt-24 max-w-3xl px-6">
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {TAGS.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <TextGenerateEffect
              words="A arte de guiar a leitura"
              duration={0.6}
              className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground [&_div]:mt-0 [&>div>div]:text-sm"
            />

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Animação dirigida por scroll como ferramenta de storytelling
            </h1>

            <p className="text-balance text-lg leading-relaxed text-muted-foreground">
              Como um simples feixe luminoso na lateral pode transformar um
              artigo longo numa experiência de leitura conduzida — sem competir
              com o conteúdo.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5">
              <AuthorBadge />
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                8 de junho, 2026
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" />9 min de leitura
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------- */}
      {/* Corpo do artigo — TracingBeam dirigido pelo scroll deste card    */}
      {/* --------------------------------------------------------------- */}
      <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
        <TracingBeam scrollRef={scrollRef}>
          <article className="prose-none flex max-w-2xl flex-col gap-7">
            <p className="text-lg leading-relaxed text-foreground">
              Todo artigo longo enfrenta o mesmo desafio: manter o leitor
              orientado. Quanto mais o texto se estende, mais fácil é perder a
              noção de progresso — e com ela, o engajamento. É aqui que
              micro-interações sutis fazem diferença.
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              O feixe que acompanha você
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              A ideia é simples: um traço vertical à esquerda do conteúdo que se
              preenche conforme você rola. Ele funciona como uma barra de
              progresso disfarçada de elemento decorativo, dando uma sensação
              tátil de avanço sem roubar atenção do texto principal.
            </p>

            <blockquote className="border-l-2 border-foreground/40 pl-5 text-lg font-medium italic leading-relaxed text-foreground">
              “Boas interfaces não pedem atenção — elas a recompensam. O melhor
              feedback visual é aquele que você sente antes de perceber.”
            </blockquote>

            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Como funciona por baixo
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              O componente observa o progresso de rolagem com{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                useScroll
              </code>{" "}
              e converte esse valor em duas coordenadas do gradiente de um SVG.
              Um <em>spring</em> adiciona inércia, fazendo o feixe deslizar com
              suavidade em vez de saltar de uma posição a outra.
            </p>

            <CodeBlock
              language="tsx"
              filename="use-beam-progress.tsx"
              code={SAMPLE_CODE}
              highlightLines={[4, 5, 6, 7]}
            />

            <p className="leading-relaxed text-muted-foreground">
              Repare que a função recebe a referência do contêiner scrollável. Em
              uma página inteira, esse contêiner é a janela; dentro de um card de
              leitura, é o próprio elemento com{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                overflow-y-auto
              </code>
              . Essa flexibilidade é o que permite reaproveitar o efeito em
              qualquer contexto.
            </p>

            <figure className="flex flex-col gap-2">
              <img
                src="https://picsum.photos/seed/blog-body-diagram/1200/640"
                alt="Diagrama do fluxo de scroll para gradiente"
                className="w-full rounded-xl border border-border object-cover"
                draggable={false}
              />
              <figcaption className="text-center text-xs text-muted-foreground">
                Do progresso de rolagem às coordenadas do gradiente do feixe.
              </figcaption>
            </figure>

            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Quando vale a pena usar
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Nem todo conteúdo precisa de um guia visual. Mas alguns formatos se
              beneficiam muito:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed text-muted-foreground marker:text-foreground/40">
              <li>
                <span className="font-medium text-foreground">
                  Artigos longos e ensaios
                </span>{" "}
                — onde o senso de progresso sustenta a leitura.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Documentação técnica
                </span>{" "}
                — guiando o leitor por seções densas passo a passo.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Landing pages narrativas
                </span>{" "}
                — em que cada bloco conta parte de uma história.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Sutileza acima de tudo
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              O segredo é a moderação. Um efeito chamativo demais cansa; um
              discreto se torna parte da experiência. Mantenha o gradiente com
              baixa opacidade, anime com inércia e deixe o texto ser o
              protagonista. O feixe é só o corrimão — você ainda é quem caminha.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Quando bem calibrado, o leitor termina o artigo sem nunca ter
              pensado conscientemente no efeito. E essa é exatamente a marca de
              um bom design de interação: invisível, porém presente.
            </p>
          </article>
        </TracingBeam>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Bio do autor                                                    */}
      {/* --------------------------------------------------------------- */}
      <section className="mx-auto max-w-3xl px-6 pb-10 md:px-10">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-start">
            <Avatar className="size-16 border border-border">
              <AvatarImage
                src="https://picsum.photos/seed/author-mariana/120/120"
                alt="Mariana Reis"
              />
              <AvatarFallback>MR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Escrito por
              </p>
              <h3 className="text-lg font-semibold text-foreground">
                Mariana Reis
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Staff Frontend Engineer com mais de uma década construindo
                design systems e interfaces de produto. Apaixonada por
                tipografia, motion e por escrever código que as pessoas nem
                percebem que está lá.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Leia também                                                      */}
      {/* --------------------------------------------------------------- */}
      <section className="border-t border-border bg-muted/20 py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            Leia também
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {RELATED.map((post) => (
              <Card
                key={post.title}
                className="group overflow-hidden border-border bg-card pt-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <CardHeader className="gap-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug transition-colors group-hover:text-foreground">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    Ler artigo
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
