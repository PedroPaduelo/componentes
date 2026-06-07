import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Example } from "@/data/examples"

const paginationBasicExample: Example = {
  title: "Básico",
  description: "Paginação com links de página, anterior e próxima.",
  code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
  render: (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

const paginationWithEllipsisExample: Example = {
  title: "Com ellipsis",
  description:
    "Paginação com muitas páginas usando ellipsis para intervalos ocultos.",
  code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>9</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>10</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
  render: (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>9</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

const paginationDisabledExample: Example = {
  title: "Estados desabilitados",
  description: "Botão anterior desabilitado na primeira página.",
  code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious disabled />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
  render: (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const examplesPagination: Record<string, Example[]> = {
  pagination: [
    paginationBasicExample,
    paginationWithEllipsisExample,
    paginationDisabledExample,
  ],
}
