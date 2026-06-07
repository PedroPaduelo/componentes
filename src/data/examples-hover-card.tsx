import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Github, Twitter } from "lucide-react"

import type { Example } from "./examples"

const userProfileExample: Example = {
  title: "Perfil de usuário",
  description:
    "Hover card com avatar, nome, handle e bio — abre ao passar o mouse sobre o gatilho.",
  code: `<HoverCard>
  <HoverCardTrigger asChild>
    <a href="#" className="flex items-center gap-2 underline-offset-4 hover:underline">
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://picsum.photos/seed/hover-avatar/64" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">@usuário</span>
    </a>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src="https://picsum.photos/seed/hover-avatar/64" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">@usuário</h4>
        <p className="text-sm text-muted-foreground">
          Desenvolvedor apaixonado por interfaces e experiência do usuário.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Github className="h-3 w-3" /> 120 seguidores
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Twitter className="h-3 w-3" /> 45 seguindo
          </span>
        </div>
        <div className="flex items-center pt-2 text-xs text-muted-foreground">
          <CalendarDays className="mr-1 h-3 w-3" />
          Entrou em janeiro de 2024
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>`,
  render: (
    <div className="flex items-center justify-center rounded-lg border border-border bg-background p-8">
      <HoverCard>
        <HoverCardTrigger asChild>
          <a
            href="#"
            className="flex items-center gap-2 underline-offset-4 hover:underline"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/seed/hover-avatar/64" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">@usuário</span>
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/hover-avatar/64" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@usuário</h4>
              <p className="text-sm text-muted-foreground">
                Desenvolvedor apaixonado por interfaces e experiência do usuário.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Github className="h-3 w-3" /> 120 seguidores
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Twitter className="h-3 w-3" /> 45 seguindo
                </span>
              </div>
              <div className="flex items-center pt-2 text-xs text-muted-foreground">
                <CalendarDays className="mr-1 h-3 w-3" />
                Entrou em janeiro de 2024
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}

const previewCardExample: Example = {
  title: "Preview de link",
  description:
    "Hover card com preview visual abre ao passar o mouse sobre um link de referência.",
  code: `<HoverCard openDelay={300} closeDelay={150}>
  <HoverCardTrigger asChild>
    <a
      href="#"
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      @radix_ui
    </a>
  </HoverCardTrigger>
  <HoverCardContent className="w-80" align="start">
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Radix UI</h4>
      <p className="text-sm text-muted-foreground">
        Componentes primitivos de UI acessíveis e sem estilo para construir
        sistemas de design de alta qualidade.
      </p>
      <ImageCard src="https://picsum.photos/seed/radix-preview/400/200" />
      <p className="text-xs text-muted-foreground">
        radix-ui.com · 2.5k estrelas no GitHub
      </p>
    </div>
  </HoverCardContent>
</HoverCard>`,
  render: (
    <div className="flex items-center justify-center rounded-lg border border-border bg-background p-8">
      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <a
            href="#"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            @radix_ui
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" align="start">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Radix UI</h4>
            <p className="text-sm text-muted-foreground">
              Componentes primitivos de UI acessíveis e sem estilo para construir
              sistemas de design de alta qualidade.
            </p>
            <div className="relative h-32 w-full overflow-hidden rounded-md">
              <img
                src="https://picsum.photos/seed/radix-preview/400/200"
                alt="Radix UI preview"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              radix-ui.com · 2.5k estrelas no GitHub
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}

export const examplesHoverCard: Record<string, Example[]> = {
  "hover-card": [userProfileExample, previewCardExample],
}
