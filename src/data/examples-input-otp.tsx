import { OtpDefaultDemo, OtpFourDigitDemo } from "./examples-input-otp-demos"
import type { Example } from "@/data/examples"

const inputOtpDefaultExample: Example = {
  title: "Padrão (6 dígitos)",
  description:
    "Campo OTP com 6 slots e separador visual — formato comum em autenticação de dois fatores.",
  code: `<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`,
  render: <OtpDefaultDemo />,
}

const inputOtpFourDigitExample: Example = {
  title: "4 Dígitos",
  description:
    "Layout compacto com 4 slots sem separador — ideal para PINs curtos e códigos de verificação simples.",
  code: `<InputOTP maxLength={4}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
  </InputOTPGroup>
</InputOTP>`,
  render: <OtpFourDigitDemo />,
}

export const examplesInputOtp: Record<string, Example[]> = {
  "input-otp": [inputOtpDefaultExample, inputOtpFourDigitExample],
}
