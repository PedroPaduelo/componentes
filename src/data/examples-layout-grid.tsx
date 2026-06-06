import type { Example } from "@/data/examples"
import { LayoutGrid } from "@/components/ui/layout-grid"

const cardContent1 = (
  <div>
    <p className="text-sm font-medium text-white/80">Design</p>
    <p className="text-lg font-bold text-white">Creative Studio</p>
  </div>
)

const cardContent2 = (
  <div>
    <p className="text-sm font-medium text-white/80">Development</p>
    <p className="text-lg font-bold text-white">Engineering Team</p>
  </div>
)

const cardContent3 = (
  <div>
    <p className="text-sm font-medium text-white/80">Product</p>
    <p className="text-lg font-bold text-white">Product Strategy</p>
  </div>
)

const cardContent4 = (
  <div>
    <p className="text-sm font-medium text-white/80">Marketing</p>
    <p className="text-lg font-bold text-white">Growth &amp; Analytics</p>
  </div>
)

const cardContent5 = (
  <div>
    <p className="text-sm font-medium text-white/80">Operations</p>
    <p className="text-lg font-bold text-white">Infrastructure</p>
  </div>
)

const cardContent6 = (
  <div>
    <p className="text-sm font-medium text-white/80">Research</p>
    <p className="text-lg font-bold text-white">User Insights</p>
  </div>
)

const bento6Cards: Example = {
  title: "Bento 6 Cards",
  description: "Grid bento com 6 cards — clique para expandir com layoutId compartilhado.",
  code: `<div className="min-h-[600px]">
  <LayoutGrid
    cards={[
      { id: 1, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid1/500/500" },
      { id: 2, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid2/500/500" },
      { id: 3, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid3/500/500" },
      { id: 4, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid4/500/500" },
      { id: 5, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid5/500/500" },
      { id: 6, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid6/500/500" },
    ]}
  />
</div>`,
  render: (
    <div className="min-h-[600px]">
      <LayoutGrid
        cards={[
          { id: 1, content: cardContent1, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid1/500/500" },
          { id: 2, content: cardContent2, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid2/500/500" },
          { id: 3, content: cardContent3, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid3/500/500" },
          { id: 4, content: cardContent4, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid4/500/500" },
          { id: 5, content: cardContent5, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid5/500/500" },
          { id: 6, content: cardContent6, className: "col-span-1", thumbnail: "https://picsum.photos/seed/grid6/500/500" },
        ]}
      />
    </div>
  ),
}

const cardContentA = (
  <div>
    <p className="text-sm font-medium text-white/80">Frontend</p>
    <p className="text-lg font-bold text-white">React &amp; TypeScript</p>
  </div>
)

const cardContentB = (
  <div>
    <p className="text-sm font-medium text-white/80">Backend</p>
    <p className="text-lg font-bold text-white">Node &amp; Go</p>
  </div>
)

const cardContentC = (
  <div>
    <p className="text-sm font-medium text-white/80">Data</p>
    <p className="text-lg font-bold text-white">PostgreSQL &amp; Redis</p>
  </div>
)

const cardContentD = (
  <div>
    <p className="text-sm font-medium text-white/80">DevOps</p>
    <p className="text-lg font-bold text-white">Docker &amp; K8s</p>
  </div>
)

const bento4Cards: Example = {
  title: "Bento 4 Cards Expandido",
  description: "Grid bento com 4 cards — layout expandido ao clicar.",
  code: `<div className="min-h-[600px]">
  <LayoutGrid
    cards={[
      { id: 1, content: <div>...</div>, className: "col-span-1 md:col-span-2", thumbnail: "https://picsum.photos/seed/gridA/500/500" },
      { id: 2, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/gridB/500/500" },
      { id: 3, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/gridC/500/500" },
      { id: 4, content: <div>...</div>, className: "col-span-1", thumbnail: "https://picsum.photos/seed/gridD/500/500" },
    ]}
  />
</div>`,
  render: (
    <div className="min-h-[600px]">
      <LayoutGrid
        cards={[
          { id: 1, content: cardContentA, className: "col-span-1 md:col-span-2", thumbnail: "https://picsum.photos/seed/gridA/500/500" },
          { id: 2, content: cardContentB, className: "col-span-1", thumbnail: "https://picsum.photos/seed/gridB/500/500" },
          { id: 3, content: cardContentC, className: "col-span-1", thumbnail: "https://picsum.photos/seed/gridC/500/500" },
          { id: 4, content: cardContentD, className: "col-span-1", thumbnail: "https://picsum.photos/seed/gridD/500/500" },
        ]}
      />
    </div>
  ),
}

export const examplesLayoutGrid: Record<string, Example[]> = {
  "layout-grid": [bento6Cards, bento4Cards],
}
