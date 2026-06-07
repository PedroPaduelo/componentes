import * as React from "react"

import { LoginFormDemo, ProfileFormDemo } from "./form-demos"

type Example = {
  title: string
  description?: string
  code: string
  render: React.ReactNode
}

export const examplesForm: Record<string, Example[]> = {
  form: [
    {
      title: "Login",
      description:
        "Formulário de login com validação de email e senha via zod.",
      code: `const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(8, { message: "Mínimo de 8 caracteres." }),
})

const form = useForm<z.infer<typeof loginSchema>>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField control={form.control} name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="seu@email.com" type="email" {...field} />
          </FormControl>
          <FormDescription>Usaremos este email para login.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField control={form.control} name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Senha</FormLabel>
          <FormControl>
            <Input placeholder="********" type="password" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" className="w-full">Entrar</Button>
  </form>
</Form>`,
      render: (
        <div className="w-full">
          <LoginFormDemo />
        </div>
      ),
    },
    {
      title: "Perfil",
      description:
        "Formulário de perfil com nome obrigatório e bio opcional.",
      code: `const profileSchema = z.object({
  name: z.string().min(2, { message: "Mínimo 2 caracteres." }),
  bio: z.string().max(160).optional(),
})

const form = useForm<z.infer<typeof profileSchema>>({
  resolver: zodResolver(profileSchema),
  defaultValues: { name: "", bio: "" },
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField control={form.control} name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome</FormLabel>
          <FormControl>
            <Input placeholder="Seu nome" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField control={form.control} name="bio"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea placeholder="Fale um pouco..." {...field} />
          </FormControl>
          <FormDescription>Máximo de 160 caracteres.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Salvar perfil</Button>
  </form>
</Form>`,
      render: (
        <div className="w-full">
          <ProfileFormDemo />
        </div>
      ),
    },
  ],
}
