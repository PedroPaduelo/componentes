import type { Example } from "@/data/examples"
import { NavbarMenuDemo, NavbarMenuBasicDemo } from "./navbar-menu-demos"

export const examplesNavbarMenu: Record<string, Example[]> = {
  "navbar-menu": [
    {
      title: "Navbar com submenu dropdown",
      description:
        "Navbar pill com menu hover-dropdown fullscreen-blur. Hover nos itens abre card dropdown com ProductItem (imagem + título + descrição) e HoveredLink (links simples).",
      code: `<NavbarMenu setActive={setActive}>
  <MenuItem item="Products" active={active} setActive={setActive}>
    <div className="flex flex-col space-y-4 text-sm">
      <HoveredLink href="/web-dev">Web Development</HoveredLink>
      <HoveredLink href="/interface-design">Interface Design</HoveredLink>
    </div>
  </MenuItem>
  <MenuItem item="Blog" active={active} setActive={setActive}>
    <div className="text-sm grid grid-cols-2 gap-10 p-4">
      <ProductItem
        title="Algochurn"
        description="Prepare for tech interviews."
        href="https://algochurn.com"
        src="https://picsum.photos/seed/algochurn/140/70"
      />
    </div>
  </MenuItem>
</NavbarMenu>`,
      render: (
        <div className="w-full">
          <NavbarMenuDemo />
        </div>
      ),
    },
    {
      title: "Navbar básico com links",
      description:
        "Navbar pill simples com 3 itens e dropdowns de links úteis usando HoveredLink.",
      code: `<NavbarMenu setActive={setActive}>
  <MenuItem item="Features" active={active} setActive={setActive}>
    <div className="flex flex-col space-y-4 text-sm">
      <HoveredLink href="/analytics">Analytics</HoveredLink>
      <HoveredLink href="/automation">Automation</HoveredLink>
    </div>
  </MenuItem>
  <MenuItem item="Company" active={active} setActive={setActive}>
    <div className="flex flex-col space-y-4 text-sm">
      <HoveredLink href="/about">About</HoveredLink>
      <HoveredLink href="/careers">Careers</HoveredLink>
    </div>
  </MenuItem>
</NavbarMenu>`,
      render: (
        <div className="w-full">
          <NavbarMenuBasicDemo />
        </div>
      ),
    },
  ],
}
