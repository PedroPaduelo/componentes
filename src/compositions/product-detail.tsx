/**
 * Composição "Página de Produto / PDP".
 *
 * Página de detalhe de um produto de e-commerce montada apenas com
 * componentes do registry da vitrine. Layout em 2 colunas:
 * - Esquerda: galeria com Lens (zoom) na imagem principal + thumbnails
 *   clicáveis que trocam a imagem em destaque (useState).
 * - Direita: breadcrumb, título, avaliação, preço, seletor de cor
 *   (RadioGroup), tamanho (Select), quantidade (+/-), StatefulButton
 *   "Comprar agora" e "Adicionar à sacola".
 * Abaixo: Tabs (Descrição / Especificações / Avaliações) e um carrossel
 * "Você também pode gostar".
 */

import * as React from "react"
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Lens } from "@/components/ui/lens"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatefulButton } from "@/components/ui/stateful-button"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   Dados                                     */
/* -------------------------------------------------------------------------- */

type ProductColor = {
  id: string
  name: string
  /** Cor de amostra (swatch). */
  swatch: string
}

type GalleryImage = {
  id: string
  src: string
  alt: string
}

const PRODUCT = {
  name: "Tênis Aurora Runner Pro",
  brand: "Nimbus Athletics",
  price: 749.9,
  oldPrice: 999.9,
  rating: 4.7,
  reviewCount: 218,
  sku: "AUR-RUN-PRO",
}

const GALLERY: GalleryImage[] = [
  { id: "front", src: "https://picsum.photos/seed/aurora-front/900/900", alt: "Vista frontal" },
  { id: "side", src: "https://picsum.photos/seed/aurora-side/900/900", alt: "Vista lateral" },
  { id: "back", src: "https://picsum.photos/seed/aurora-back/900/900", alt: "Vista traseira" },
  { id: "sole", src: "https://picsum.photos/seed/aurora-sole/900/900", alt: "Solado" },
]

const COLORS: ProductColor[] = [
  { id: "midnight", name: "Azul Meia-noite", swatch: "#1e3a5f" },
  { id: "coral", name: "Coral Vivo", swatch: "#ef6f5b" },
  { id: "moss", name: "Verde Musgo", swatch: "#4f7a52" },
  { id: "graphite", name: "Grafite", swatch: "#3a3a3a" },
]

const SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"]

const SPECS: Array<{ label: string; value: string }> = [
  { label: "Material do cabedal", value: "Malha técnica respirável (knit)" },
  { label: "Entressola", value: "Espuma de retorno de energia EVA+" },
  { label: "Solado", value: "Borracha de alta tração com sulcos flex" },
  { label: "Drop", value: "8 mm" },
  { label: "Peso", value: "248 g (tam. 40)" },
  { label: "Uso recomendado", value: "Corrida em asfalto e treinos diários" },
  { label: "Garantia", value: "12 meses contra defeitos de fabricação" },
]

type Review = {
  id: string
  name: string
  avatar: string
  rating: number
  date: string
  comment: string
}

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Marina Tavares",
    avatar: "https://picsum.photos/seed/review-marina/80/80",
    rating: 5,
    date: "há 3 dias",
    comment:
      "Conforto absurdo desde a primeira corrida. O amortecimento é macio sem ser mole, e o caimento é perfeito no meu pé.",
  },
  {
    id: "r2",
    name: "Rafael Lima",
    avatar: "https://picsum.photos/seed/review-rafael/80/80",
    rating: 4,
    date: "há 1 semana",
    comment:
      "Excelente custo-benefício. Tirei uma estrela só porque a numeração veio um pouco menor — peguei meio número acima.",
  },
  {
    id: "r3",
    name: "Júlia Andrade",
    avatar: "https://picsum.photos/seed/review-julia/80/80",
    rating: 5,
    date: "há 2 semanas",
    comment:
      "Uso para treinos longos e os pés não cansam. O acabamento é lindo, o azul meia-noite é ainda mais bonito ao vivo.",
  },
]

const RELATED: Array<{
  id: string
  name: string
  price: number
  image: string
  rating: number
}> = [
  { id: "p1", name: "Aurora Trail X", price: 829.9, image: "https://picsum.photos/seed/related-trail/600/600", rating: 4.6 },
  { id: "p2", name: "Nimbus Flow Lite", price: 549.9, image: "https://picsum.photos/seed/related-flow/600/600", rating: 4.4 },
  { id: "p3", name: "Aurora Court Move", price: 689.9, image: "https://picsum.photos/seed/related-court/600/600", rating: 4.8 },
  { id: "p4", name: "Nimbus Daily Knit", price: 459.9, image: "https://picsum.photos/seed/related-daily/600/600", rating: 4.2 },
  { id: "p5", name: "Aurora Race Elite", price: 1149.9, image: "https://picsum.photos/seed/related-race/600/600", rating: 4.9 },
]

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                    */
/* -------------------------------------------------------------------------- */

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating)
        return (
          <Star
            key={i}
            className={cn(
              "size-4",
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40"
            )}
          />
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Composição                                   */
/* -------------------------------------------------------------------------- */

export function ProductDetail() {
  const [activeImage, setActiveImage] = React.useState<GalleryImage>(GALLERY[0])
  const [color, setColor] = React.useState<string>(COLORS[0].id)
  const [size, setSize] = React.useState<string>("40")
  const [quantity, setQuantity] = React.useState<number>(1)
  const [wishlisted, setWishlisted] = React.useState<boolean>(false)

  const selectedColor =
    COLORS.find((c) => c.id === color) ?? COLORS[0]
  const total = PRODUCT.price * quantity
  const discount = Math.round(
    ((PRODUCT.oldPrice - PRODUCT.price) / PRODUCT.oldPrice) * 100
  )

  const handleBuy = async () => {
    // Simula uma requisição de checkout — o StatefulButton mostra o spinner.
    await new Promise((resolve) => setTimeout(resolve, 1200))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Calçados</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Corrida</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{PRODUCT.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Bloco principal: galeria + informações */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* --------------------------- Galeria --------------------------- */}
          <div className="flex flex-col gap-4">
            <Lens
              lensSize={200}
              zoomFactor={1.8}
              className="aspect-square w-full rounded-2xl border border-border bg-muted"
            >
              <img
                src={activeImage.src}
                alt={`${PRODUCT.name} — ${activeImage.alt}`}
                className="size-full rounded-2xl object-cover"
              />
            </Lens>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {GALLERY.map((img) => {
                const isActive = img.id === activeImage.id
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    aria-label={`Ver ${img.alt}`}
                    aria-pressed={isActive}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* ------------------------- Informações ------------------------- */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="uppercase tracking-wide">
                {PRODUCT.brand}
              </Badge>
              <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400">
                Frete grátis
              </Badge>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {PRODUCT.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Stars rating={PRODUCT.rating} />
              <span className="text-sm font-medium">{PRODUCT.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({PRODUCT.reviewCount} avaliações)
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">
                SKU: {PRODUCT.sku}
              </span>
            </div>

            {/* Preço */}
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold tracking-tight">
                {formatPrice(PRODUCT.price)}
              </span>
              <span className="pb-1 text-base text-muted-foreground line-through">
                {formatPrice(PRODUCT.oldPrice)}
              </span>
              <Badge variant="destructive" className="mb-1">
                -{discount}%
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              ou 10x de {formatPrice(PRODUCT.price / 10)} sem juros
            </p>

            <Separator className="my-6" />

            {/* Seletor de cor */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Cor</span>
                <span className="text-sm text-muted-foreground">
                  {selectedColor.name}
                </span>
              </div>
              <RadioGroup
                value={color}
                onValueChange={setColor}
                className="flex flex-wrap gap-3"
              >
                {COLORS.map((c) => {
                  const isActive = c.id === color
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        "relative flex size-9 cursor-pointer items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition",
                        isActive ? "ring-primary" : "ring-transparent hover:ring-border"
                      )}
                      title={c.name}
                    >
                      <RadioGroupItem value={c.id} className="sr-only" />
                      <span
                        className="size-7 rounded-full border border-black/10 shadow-inner dark:border-white/10"
                        style={{ backgroundColor: c.swatch }}
                        aria-hidden
                      />
                      {isActive ? (
                        <Check className="pointer-events-none absolute size-4 text-white drop-shadow" />
                      ) : null}
                    </label>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Seletor de tamanho + quantidade */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <span className="mb-3 block text-sm font-medium">Tamanho</span>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        BR {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium">Quantidade</span>
                <div className="flex h-10 w-fit items-center rounded-md border border-input">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-r-none"
                    aria-label="Diminuir quantidade"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span
                    className="w-12 text-center text-sm font-medium tabular-nums"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-l-none"
                    aria-label="Aumentar quantidade"
                    disabled={quantity >= 10}
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Total dinâmico */}
            <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Total ({quantity} {quantity > 1 ? "itens" : "item"})
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {formatPrice(total)}
              </span>
            </div>

            {/* Ações */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StatefulButton
                onClick={handleBuy}
                className="w-full justify-center bg-primary text-primary-foreground hover:ring-primary sm:w-auto sm:flex-1"
              >
                Comprar agora
              </StatefulButton>

              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto sm:flex-1"
              >
                <ShoppingBag className="size-4" />
                Adicionar à sacola
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={
                  wishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"
                }
                aria-pressed={wishlisted}
                onClick={() => setWishlisted((w) => !w)}
                className="size-10 shrink-0"
              >
                <Heart
                  className={cn(
                    "size-4 transition",
                    wishlisted ? "fill-rose-500 text-rose-500" : ""
                  )}
                />
              </Button>
            </div>

            {/* Entrega */}
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-border p-4">
              <Truck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Entrega estimada em 3–5 dias úteis</p>
                <p className="text-muted-foreground">
                  Frete grátis para todo o país em compras acima de {formatPrice(199)}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------- Tabs ----------------------------- */}
        <div className="mt-14">
          <Tabs defaultValue="descricao" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="descricao">Descrição</TabsTrigger>
              <TabsTrigger value="especificacoes">Especificações</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            </TabsList>

            {/* Descrição */}
            <TabsContent value="descricao" className="mt-6">
              <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  O <strong className="text-foreground">{PRODUCT.name}</strong> foi
                  projetado para quem busca desempenho sem abrir mão do conforto. A
                  combinação de cabedal em malha técnica e entressola de retorno de
                  energia entrega leveza e respiro a cada passada.
                </p>
                <p>
                  O solado de borracha com sulcos flexíveis garante aderência em
                  qualquer terreno urbano, enquanto o sistema de amortecimento
                  reduz o impacto nas articulações — ideal tanto para treinos
                  longos quanto para o dia a dia.
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {[
                    "Cabedal respirável em knit",
                    "Retorno de energia EVA+",
                    "Palmilha removível antibacteriana",
                    "Cadarço com travamento rápido",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-foreground">
                      <Check className="size-4 text-emerald-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Especificações */}
            <TabsContent value="especificacoes" className="mt-6">
              <div className="max-w-3xl overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableBody>
                    {SPECS.map((spec, i) => (
                      <TableRow
                        key={spec.label}
                        className={cn(i % 2 === 1 && "bg-muted/40")}
                      >
                        <TableCell className="w-1/2 font-medium text-foreground">
                          {spec.label}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {spec.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Avaliações */}
            <TabsContent value="avaliacoes" className="mt-6">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {PRODUCT.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Stars rating={PRODUCT.rating} />
                  <span className="text-sm text-muted-foreground">
                    Baseado em {PRODUCT.reviewCount} avaliações
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {REVIEWS.map((review) => (
                  <Card key={review.id} className="h-full">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={review.avatar} alt={review.name} />
                          <AvatarFallback>
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {review.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {review.date}
                          </p>
                        </div>
                      </div>
                      <Stars rating={review.rating} />
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* -------------------- Você também pode gostar -------------------- */}
        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Você também pode gostar
            </h2>
          </div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {RELATED.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="basis-3/4 pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <Card className="group h-full overflow-hidden p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="flex flex-col gap-2 p-4">
                      <div className="flex items-center gap-1.5">
                        <Stars rating={item.rating} className="gap-0" />
                        <span className="text-xs text-muted-foreground">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                      <h3 className="line-clamp-1 text-sm font-medium">
                        {item.name}
                      </h3>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-base font-semibold">
                          {formatPrice(item.price)}
                        </span>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-8"
                          aria-label={`Adicionar ${item.name} à sacola`}
                        >
                          <ShoppingBag className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </div>
  )
}
