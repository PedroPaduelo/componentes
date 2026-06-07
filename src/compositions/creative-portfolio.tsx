/**
 * Composição "Creative Portfolio".
 *
 * Portfólio criativo montado apenas com componentes do registry da vitrine:
 * - Hero: AsciiArt (imagem renderizada em ASCII) + CanvasText (título ondulado)
 *   + ColourfulText (subtítulo colorido animado).
 * - Projects: grid de CardSpotlight (cards com spotlight radial + canvas reveal).
 * - About: seção sobre com texto e skills em Badge.
 * - Contact: CTA para contato com botões.
 * - Footer: minimalista com tokens shadcn (light/dark).
 */

import { ArrowRight, Github, Linkedin, Mail, Sparkles } from "lucide-react"

import { AsciiArt } from "@/components/ui/ascii-art"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { CanvasText } from "@/components/ui/canvas-text"
import { ColourfulText } from "@/components/ui/colourful-text"
import { useTheme } from "@/components/theme/use-theme"

const projects = [
  {
    title: "Nebula Dashboard",
    description:
      "Painel de analytics com visualizações em tempo real, tema dark-first e animações fluidas.",
    image: "https://picsum.photos/seed/nebula-dash/600/400",
  },
  {
    title: "Prism Design System",
    description:
      "Sistema de design completo com 40+ componentes, tokens semáticos e documentação viva.",
    image: "https://picsum.photos/seed/prism-ds/600/400",
  },
  {
    title: "Orbit Mobile App",
    description:
      "App React Native com navegação gestual, micro-interações e acessibilidade nativa.",
    image: "https://picsum.photos/seed/orbit-app/600/400",
  },
  {
    title: "Flux API Platform",
    description:
      "Plataforma de APIs com documentação interativa, playground embutido e SDKs automáticos.",
    image: "https://picsum.photos/seed/flux-api/600/400",
  },
]

const skills = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Motion",
  "Three.js",
  "Node.js",
  "Figma",
  "Design Systems",
]

export function CreativePortfolio() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex flex-col">
      {/* ----------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden bg-background px-6">
        {/* AsciiArt como fundo decorativo */}
        <div className="absolute inset-0 z-0 opacity-20">
          <AsciiArt
            src="https://picsum.photos/seed/creative-hero/1200/800"
            resolution={60}
            charset="standard"
            color={isDark ? "#a3a3a3" : "#525252"}
            backgroundColor="transparent"
            animated={false}
            animationStyle="none"
            className="h-full w-full"
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Creative Developer
          </span>

          {/* CanvasText — título com efeito ondulado colorido */}
          <div className="mb-4">
            <CanvasText
              text="Creative Developer"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
              colors={["#6366f1", "#8b5cf6", "#ec4899", "#0ea5e9", "#22d3ee", "#a78bfa"]}
              animationDuration={4}
              curveIntensity={40}
            />
          </div>

          {/* ColourfulText — subtítulo colorido animado */}
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Eu construo{" "}
            <ColourfulText
              text="experiências digitais"
              className="font-semibold"
            />{" "}
            que encantam e resolvem problemas reais.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#projects">
                Ver projetos
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border bg-background/60 text-foreground backdrop-blur hover:bg-background/80 hover:text-foreground"
            >
              <a href="#contact">Entrar em contato</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Projects                                                          */}
      {/* ----------------------------------------------------------------- */}
      <section id="projects" className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Projetos em destaque
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Uma seleção dos meus trabalhos mais recentes — passe o mouse para
              ver o efeito de spotlight.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <CardSpotlight
                key={project.title}
                radius={300}
                color={isDark ? "#1e1b4b" : "#e0e7ff"}
                className="min-h-[280px] border-border bg-card"
              >
                <div className="flex h-full flex-col">
                  <div className="relative mb-4 aspect-[3/2] w-full overflow-hidden rounded-lg">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </CardSpotlight>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* About                                                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Sobre mim
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Sou um desenvolvedor criativo apaixonado por construir interfaces
              que combinam design elegante com código robusto. Com mais de 5
              anos de experiência, trabalho transformando ideias complexas em
              experiências digitais intuitivas e memoráveis.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Acredito que bom código é aquele que as pessoas nem percebem que
              está lá — ele simplesmente funciona, de forma bonita e
              acessível.
            </p>

            <div className="mt-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Skills & Tecnologias
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Contact                                                           */}
      {/* ----------------------------------------------------------------- */}
      <section id="contact" className="bg-background py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Vamos trabalhar juntos?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Estou sempre aberto a novos projetos e colaborações. Entre em
            contato pelo seu canal preferido.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <a href="mailto:hello@creative.dev">
                <Mail className="mr-2 h-4 w-4" />
                Enviar email
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Creative Portfolio</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Creative Developer. Construído com
            React, Vite e Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  )
}
