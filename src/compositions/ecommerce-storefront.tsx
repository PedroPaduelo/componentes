/**
 * Composição "Loja / Storefront E-commerce".
 *
 * Loja online navegável montada apenas com componentes do registry da vitrine:
 * - Navbar fixa: logo + links + busca + ícone de carrinho com Badge contador.
 * - Hero curto de coleção (FocusCards de destaque).
 * - Barra de filtros: Select de categoria + Select de ordenação + Badges
 *   de filtros ativos (removíveis).
 * - Grid de produtos: cards próprios com imagem (picsum), nome, preço, badge de
 *   desconto e botão "Adicionar" que incrementa o carrinho (useState real).
 * - Carrinho em Sheet lateral: lista itens, ajustar quantidade, remover,
 *   subtotal e botão finalizar.
 * - Faixa de marcas com InfiniteMovingCards.
 * - Footer com tokens shadcn (light/dark).
 */

import * as React from "react"
import {
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Truck,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FocusCards } from "@/components/ui/focus-cards"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------------- */
/* Dados                                                                     */
/* ------------------------------------------------------------------------- */

type ProductCategory = "Calçados" | "Roupas" | "Acessórios" | "Eletrônicos"

type Product = {
  id: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  oldPrice?: number
  rating: number
  seed: string
}

type CartLine = {
  product: Product
  qty: number
}

const CATEGORIES: readonly ProductCategory[] = [
  "Calçados",
  "Roupas",
  "Acessórios",
  "Eletrônicos",
]

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating"

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Mais relevantes",
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
  rating: "Melhor avaliados",
}

const PRODUCTS: readonly Product[] = [
  {
    id: "p1",
    name: "Tênis Runner Pro",
    brand: "Aurora",
    category: "Calçados",
    price: 349.9,
    oldPrice: 459.9,
    rating: 4.8,
    seed: "store-runner",
  },
  {
    id: "p2",
    name: "Jaqueta Corta-Vento",
    brand: "Nimbus",
    category: "Roupas",
    price: 289.0,
    rating: 4.5,
    seed: "store-jacket",
  },
  {
    id: "p3",
    name: "Mochila Urbana 22L",
    brand: "Vertex",
    category: "Acessórios",
    price: 219.5,
    oldPrice: 279.5,
    rating: 4.7,
    seed: "store-backpack",
  },
  {
    id: "p4",
    name: "Fone Wireless Studio",
    brand: "Lumen",
    category: "Eletrônicos",
    price: 599.0,
    oldPrice: 749.0,
    rating: 4.9,
    seed: "store-headphones",
  },
  {
    id: "p5",
    name: "Camiseta Algodão Pima",
    brand: "Nimbus",
    category: "Roupas",
    price: 99.9,
    rating: 4.3,
    seed: "store-tshirt",
  },
  {
    id: "p6",
    name: "Relógio Smart Active",
    brand: "Lumen",
    category: "Eletrônicos",
    price: 829.0,
    oldPrice: 999.0,
    rating: 4.6,
    seed: "store-watch",
  },
  {
    id: "p7",
    name: "Óculos Solar Polarizado",
    brand: "Vertex",
    category: "Acessórios",
    price: 159.0,
    rating: 4.2,
    seed: "store-sunglasses",
  },
  {
    id: "p8",
    name: "Bota Trilha Adventure",
    brand: "Aurora",
    category: "Calçados",
    price: 429.9,
    oldPrice: 529.9,
    rating: 4.7,
    seed: "store-boots",
  },
  {
    id: "p9",
    name: "Moletom Oversized",
    brand: "Nimbus",
    category: "Roupas",
    price: 199.9,
    rating: 4.4,
    seed: "store-hoodie",
  },
]

const FEATURED_CARDS = [
  { title: "Coleção Inverno", src: "https://picsum.photos/seed/store-winter/600/700" },
  { title: "Drop Streetwear", src: "https://picsum.photos/seed/store-street/600/700" },
  { title: "Tech & Áudio", src: "https://picsum.photos/seed/store-tech/600/700" },
]

const BRAND_ITEMS = ["Aurora", "Nimbus", "Vertex", "Lumen", "Orbit", "Cascade", "Pulse"].map(
  (name) => ({
    quote: "Parceiro oficial da nossa curadoria de produtos premium.",
    name,
    title: "Marca parceira",
  })
)

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function discountPct(product: Product): number | null {
  if (!product.oldPrice || product.oldPrice <= product.price) return null
  return Math.round((1 - product.price / product.oldPrice) * 100)
}

/* ------------------------------------------------------------------------- */
/* Card de produto                                                           */
/* ------------------------------------------------------------------------- */

function ProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (product: Product) => void
}) {
  const off = discountPct(product)

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={`https://picsum.photos/seed/${product.seed}/600/750`}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {off !== null ? (
          <Badge variant="destructive" className="absolute left-3 top-3">
            -{off}%
          </Badge>
        ) : null}
        <button
          type="button"
          aria-label="Favoritar"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{product.brand}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <Badge variant="outline" className="w-fit text-[10px]">
          {product.category}
        </Badge>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.oldPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {currency.format(product.oldPrice)}
              </span>
            ) : null}
            <span className="text-base font-bold text-foreground">
              {currency.format(product.price)}
            </span>
          </div>
          <Button size="sm" onClick={() => onAdd(product)}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Composição                                                                */
/* ------------------------------------------------------------------------- */

export function EcommerceStorefront() {
  const [cart, setCart] = React.useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = React.useState(false)
  const [category, setCategory] = React.useState<ProductCategory | "all">("all")
  const [sort, setSort] = React.useState<SortKey>("relevance")
  const [query, setQuery] = React.useState("")

  const addToCart = React.useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id)
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, qty: line.qty + 1 } : line
        )
      }
      return [...prev, { product, qty: 1 }]
    })
    setCartOpen(true)
  }, [])

  const changeQty = React.useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.product.id === id
            ? { ...line, qty: Math.max(0, line.qty + delta) }
            : line
        )
        .filter((line) => line.qty > 0)
    )
  }, [])

  const removeLine = React.useCallback((id: string) => {
    setCart((prev) => prev.filter((line) => line.product.id !== id))
  }, [])

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0)
  const subtotal = cart.reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0
  )

  const visibleProducts = React.useMemo(() => {
    let list = PRODUCTS.filter((product) => {
      const matchCategory = category === "all" || product.category === category
      const matchQuery =
        query.trim() === "" ||
        product.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        product.brand.toLowerCase().includes(query.trim().toLowerCase())
      return matchCategory && matchQuery
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return list
  }, [category, sort, query])

  const hasActiveFilters =
    category !== "all" || sort !== "relevance" || query.trim() !== ""

  return (
    <div className="flex flex-col bg-background">
      {/* --------------------------------------------------------------- */}
      {/* Navbar                                                          */}
      {/* --------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <a href="/compositions" className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">Lojinha</span>
          </a>

          <nav className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {["Novidades", "Masculino", "Feminino", "Ofertas"].map((item) => (
              <a
                key={item}
                href="/compositions/ecommerce-storefront"
                className="transition-colors hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="relative ml-auto hidden w-56 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produtos..."
              className="pl-9"
            />
          </div>

          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative ml-auto lg:ml-0"
                aria-label="Abrir carrinho"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 ? (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]"
                  >
                    {cartCount}
                  </Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Seu carrinho
                  {cartCount > 0 ? (
                    <Badge variant="secondary">{cartCount}</Badge>
                  ) : null}
                </SheetTitle>
              </SheetHeader>

              {cart.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Seu carrinho está vazio. Adicione produtos para continuar.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-4">
                  <ul className="flex flex-col gap-4">
                    {cart.map((line) => (
                      <li key={line.product.id} className="flex gap-3">
                        <img
                          src={`https://picsum.photos/seed/${line.product.seed}/120/120`}
                          alt={line.product.name}
                          className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium leading-snug text-foreground">
                              {line.product.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeLine(line.product.id)}
                              aria-label={`Remover ${line.product.name}`}
                              className="text-muted-foreground transition-colors hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {line.product.brand}
                          </span>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-md border border-border">
                              <button
                                type="button"
                                onClick={() => changeQty(line.product.id, -1)}
                                aria-label="Diminuir quantidade"
                                className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-sm tabular-nums text-foreground">
                                {line.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => changeQty(line.product.id, 1)}
                                aria-label="Aumentar quantidade"
                                className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {currency.format(line.product.price * line.qty)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SheetFooter>
                <Separator className="mb-1" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold text-foreground">
                    {currency.format(subtotal)}
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  Frete grátis em compras acima de {currency.format(299)}.
                </p>
                <Button className="w-full" size="lg" disabled={cart.length === 0}>
                  Finalizar compra
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* --------------------------------------------------------------- */}
      {/* Hero de coleção                                                 */}
      {/* --------------------------------------------------------------- */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4" />
              Nova coleção 2025
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Estilo que acompanha seu ritmo
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Curadoria de calçados, roupas e tecnologia com frete rápido e
              troca facilitada. Passe o mouse para explorar os destaques.
            </p>
          </div>
          <div className="mt-10">
            <FocusCards cards={FEATURED_CARDS} />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Filtros + grid de produtos                                      */}
      {/* --------------------------------------------------------------- */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Produtos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {visibleProducts.length}{" "}
                {visibleProducts.length === 1
                  ? "item encontrado"
                  : "itens encontrados"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory(value as ProductCategory | "all")
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sort}
                onValueChange={(value) => setSort(value as SortKey)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {SORT_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros ativos */}
          {hasActiveFilters ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Filtros:
              </span>
              {category !== "all" ? (
                <Badge variant="secondary" className="gap-1">
                  {category}
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    aria-label="Remover filtro de categoria"
                    className="transition-colors hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null}
              {sort !== "relevance" ? (
                <Badge variant="secondary" className="gap-1">
                  {SORT_LABELS[sort]}
                  <button
                    type="button"
                    onClick={() => setSort("relevance")}
                    aria-label="Remover ordenação"
                    className="transition-colors hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null}
              {query.trim() !== "" ? (
                <Badge variant="secondary" className="gap-1">
                  “{query.trim()}”
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                    className="transition-colors hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setCategory("all")
                  setSort("relevance")
                  setQuery("")
                }}
              >
                Limpar tudo
              </Button>
            </div>
          ) : null}

          {/* Grid */}
          {visibleProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum produto encontrado com os filtros atuais.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategory("all")
                  setSort("relevance")
                  setQuery("")
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Faixa de marcas                                                 */}
      {/* --------------------------------------------------------------- */}
      <section className="border-y border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Marcas parceiras
          </p>
          <InfiniteMovingCards
            items={BRAND_ITEMS}
            direction="left"
            speed="slow"
            pauseOnHover
          />
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Footer                                                          */}
      {/* --------------------------------------------------------------- */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-foreground">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-lg font-semibold">Lojinha</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Sua loja de estilo e tecnologia com curadoria de marcas
              parceiras.
            </p>
          </div>
          {[
            { title: "Loja", links: ["Novidades", "Ofertas", "Mais vendidos"] },
            { title: "Ajuda", links: ["Entrega", "Trocas", "Contato"] },
            { title: "Empresa", links: ["Sobre", "Carreiras", "Imprensa"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {col.title}
              </h4>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="/compositions/ecommerce-storefront"
                      className={cn(
                        "text-muted-foreground transition-colors hover:text-foreground"
                      )}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Lojinha. Vitrine de composições —
              React, Vite e Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
