import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Example } from "@/data/examples"

const avatarBasicExample: Example = {
  title: "Básico",
  description: "Avatar com imagem e fallback automático.",
  code: `<div className="flex items-center gap-4">
  <Avatar>
    <AvatarImage src="https://picsum.photos/seed/avatar1/100/100" alt="Avatar 1" />
    <AvatarFallback>OM</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarImage src="https://picsum.photos/seed/avatar2/100/100" alt="Avatar 2" />
    <AvatarFallback>JL</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback>AB</AvatarFallback>
  </Avatar>
</div>`,
  render: (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          src="https://picsum.photos/seed/avatar1/100/100"
          alt="Avatar 1"
        />
        <AvatarFallback>OM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://picsum.photos/seed/avatar2/100/100"
          alt="Avatar 2"
        />
        <AvatarFallback>JL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const examplesAvatar: Record<string, Example[]> = {
  avatar: [avatarBasicExample],
}
