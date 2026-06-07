import { EncryptedText } from "@/components/ui/encrypted-text"
import type { Example } from "@/data/examples"

const encryptedTextHero: Example = {
  title: "Headline criptografada",
  description:
    "Ao entrar no viewport, cada caractere começa como ruído aleatório e vai sendo revelado da esquerda para a direita. Use revealedClassName/encryptedClassName para estilizar os dois estados.",
  code: `<h1 className="text-3xl font-bold md:text-5xl">
  <EncryptedText
    text="Acesso concedido"
    revealedClassName="text-foreground"
    encryptedClassName="text-muted-foreground"
  />
</h1>`,
  render: (
    <h1 className="text-3xl font-bold md:text-5xl">
      <EncryptedText
        text="Acesso concedido"
        revealedClassName="text-foreground"
        encryptedClassName="text-muted-foreground"
      />
    </h1>
  ),
}

const encryptedTextTerminal: Example = {
  title: "Estilo terminal (mono)",
  description:
    "Charset reduzido (apenas hexadecimal) com flip mais lento e revelação mais rápida, dando um ar de descriptografia em terminal. Cores fixas verde/esmeralda para reforçar o visual hacker.",
  code: `<div className="rounded-lg border border-border bg-black p-6 font-mono text-sm">
  <EncryptedText
    text="decrypting payload..."
    charset="0123456789ABCDEF"
    revealDelayMs={40}
    flipDelayMs={70}
    revealedClassName="text-emerald-400"
    encryptedClassName="text-emerald-700"
  />
</div>`,
  render: (
    <div className="rounded-lg border border-border bg-black p-6 font-mono text-sm">
      <EncryptedText
        text="decrypting payload..."
        charset="0123456789ABCDEF"
        revealDelayMs={40}
        flipDelayMs={70}
        revealedClassName="text-emerald-400"
        encryptedClassName="text-emerald-700"
      />
    </div>
  ),
}

export const examplesEncryptedText: Record<string, Example[]> = {
  "encrypted-text": [encryptedTextHero, encryptedTextTerminal],
}
